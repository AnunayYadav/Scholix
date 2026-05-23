
import crypto from 'crypto';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, otp, type = 'signup', oldEmail, userId: passedUserId } = req.body || {};

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required.' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase configuration missing');
    return res.status(500).json({ error: 'Database configuration missing on server.' });
  }

  try {
    // 1. Fetch OTP for the email
    const queryResponse = await fetch(`${supabaseUrl}/rest/v1/registration_otps?email=eq.${encodeURIComponent(email.toLowerCase().trim())}&select=*`, {
      method: 'GET',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await queryResponse.json();

    if (!queryResponse.ok) {
      console.error('Supabase Query Error:', data);
      return res.status(500).json({ error: 'Verification system synchronization failed.' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No verification record found for this email.' });
    }

    const record = data[0];
    const now = new Date();
    const expiresAt = new Date(record.expires_at);

    // Check attempts first
    if (record.attempts && record.attempts >= 10) {
      return res.status(429).json({ error: 'Too many failed attempts. Please request a new verification code.' });
    }

    // 2. Validate OTP
    const hashedInput = crypto.createHash('sha256').update(otp.trim()).digest('hex');
    if (record.otp !== hashedInput) {
      // Increment attempts counter
      const currentAttempts = record.attempts || 0;
      await fetch(`${supabaseUrl}/rest/v1/registration_otps?email=eq.${encodeURIComponent(email.toLowerCase().trim())}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ attempts: currentAttempts + 1 })
      });
      return res.status(401).json({ error: 'Invalid verification code. Please check and try again.' });
    }

    if (now > expiresAt) {
      return res.status(410).json({ error: 'Verification code expired. Please request a new one.' });
    }

    // 3. Handle data updates
    let userId: string | null = passedUserId || null;
    const searchEmail = (type === 'email_update' && oldEmail) ? oldEmail : email;
    
    // If no userId passed (e.g. signup flow), attempt to resolve it
    if (!userId) {
      try {
        console.log(`Attempting to resolve userId for email: ${searchEmail}`);
        // Use the standard profiles table to find the ID if possible
        const profileQuery = await fetch(`${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(searchEmail.toLowerCase().trim())}&select=id`, {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          }
        });
        const profileData = await profileQuery.json();
        if (profileData && profileData.length > 0) {
          userId = profileData[0].id;
          console.log(`Resolved userId from profiles: ${userId}`);
        }
      } catch (e) {
        console.error('Failed to resolve userId:', e);
      }
    } else {
      console.log(`Using passed userId: ${userId}`);
    }

    // 4. Update profile to mark as verified
    const updateData: any = { is_verified: 'yes' };
    if (type === 'email_update') {
      updateData.email = email.toLowerCase().trim();
    }

    // Use ID if we have it, otherwise fallback to the email used to find the profile
    const profileUpdateUrl = userId 
      ? `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`
      : `${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(searchEmail.toLowerCase().trim())}`;

    const updateResponse = await fetch(profileUpdateUrl, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation' // Return updated data to confirm
      },
      body: JSON.stringify(updateData)
    });

    const updateResult = await updateResponse.json();
    if (!updateResponse.ok) {
      console.error('Profile update failed:', updateResult);
      return res.status(500).json({ error: 'Failed to update verification status in database.' });
    }

    if (updateResult.length === 0 && type !== 'signup') {
       console.error('Profile not found for update:', profileUpdateUrl);
       return res.status(404).json({ error: 'Profile record not found to update.' });
    }

    // 5. Handle auth email update
    if (type === 'email_update' && userId) {
      try {
        await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
          method: 'PUT',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: email.toLowerCase().trim(), email_confirm: true })
        });
      } catch (e) {
        console.error('Auth email update failed:', e);
      }
    }

    // 6. Clear the OTP record (except for password_reset where reset-password needs it)
    if (type !== 'password_reset') {
      await fetch(`${supabaseUrl}/rest/v1/registration_otps?email=eq.${encodeURIComponent(email.toLowerCase().trim())}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
      });
    }

    // 7. Session generation for login/signup
    if ((type === 'login' || type === 'signup') && userId) {
      const { username, registration_number, university } = req.body || {};
      
      const authResponse = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'magiclink',
          email: email.toLowerCase().trim(),
          data: type === 'signup' ? {
            username,
            registration_number,
            is_verified: 'yes'
          } : {}
        })
      });

      const authData = await authResponse.json();
      if (!authResponse.ok) {
        console.error('Magic Link Error:', authData);
        // Fallback for signup: if session generation fails but identity is verified, 
        // we can still return success and let the frontend handle the next step.
        if (type === 'signup') {
           return res.status(200).json({ 
             success: true, 
             message: 'Identity verified. Please complete signup.' 
           });
        }
        return res.status(500).json({ error: 'Identity verified, but session generation failed. Try standard login.' });
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Identity verified. Syncing session...',
        session: authData
      });
    }

    return res.status(200).json({ success: true, message: 'Identity verified successfully.' });
  } catch (error: any) {
    console.error('Verification Execution Error:', error);
    return res.status(500).json({ error: error.message || 'Internal verification error.' });
  }
}
