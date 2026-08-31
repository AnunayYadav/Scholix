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
    const formattedEmail = email.toLowerCase().trim();
    const searchEmail = (type === 'email_update' && oldEmail) ? oldEmail.toLowerCase().trim() : formattedEmail;

    // 1. Fetch OTP for the email
    const queryResponse = await fetch(`${supabaseUrl}/rest/v1/registration_otps?email=eq.${encodeURIComponent(formattedEmail)}&select=*`, {
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
      await fetch(`${supabaseUrl}/rest/v1/registration_otps?email=eq.${encodeURIComponent(formattedEmail)}`, {
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

    // 3. Resolve userId via user_private_info (which contains email & id)
    let userId: string | null = passedUserId || null;
    
    if (!userId) {
      try {
        console.log(`Attempting to resolve userId for email: ${searchEmail}`);
        const privateInfoQuery = await fetch(`${supabaseUrl}/rest/v1/user_private_info?email=eq.${encodeURIComponent(searchEmail)}&select=id`, {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          }
        });
        const privateInfoData = await privateInfoQuery.json();
        if (Array.isArray(privateInfoData) && privateInfoData.length > 0 && privateInfoData[0].id) {
          userId = privateInfoData[0].id;
          console.log(`Resolved userId from user_private_info: ${userId}`);
        } else {
          // Fallback to auth admin API
          const adminCheckResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users?filter=${encodeURIComponent(searchEmail)}`, {
            headers: {
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
            }
          });
          if (adminCheckResponse.ok) {
            const adminData = await adminCheckResponse.json();
            const user = (adminData.users || []).find((u: any) => u.email?.toLowerCase() === searchEmail);
            if (user && user.id) {
              userId = user.id;
              console.log(`Resolved userId from auth admin: ${userId}`);
            }
          }
        }
      } catch (e) {
        console.error('Failed to resolve userId:', e);
      }
    }

    // 4. Update profile if user exists
    if (userId) {
      const updateData: any = { is_verified: 'yes' };
      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updateData)
      });

      if (!updateResponse.ok) {
        const updateResult = await updateResponse.json().catch(() => ({}));
        console.error('Profile update failed:', updateResult);
        if (type !== 'signup') {
          return res.status(500).json({ error: 'Failed to update verification status in database.' });
        }
      }
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
          body: JSON.stringify({ email: formattedEmail, email_confirm: true })
        });
        // Also update email in user_private_info
        await fetch(`${supabaseUrl}/rest/v1/user_private_info?id=eq.${userId}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: formattedEmail })
        });
      } catch (e) {
        console.error('Auth email update failed:', e);
      }
    }

    // 6. Clear the OTP record
    if (type !== 'password_reset') {
      await fetch(`${supabaseUrl}/rest/v1/registration_otps?email=eq.${encodeURIComponent(formattedEmail)}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
      });
    }

    // 7. Session generation for login/signup
    if ((type === 'login' || type === 'signup') && userId) {
      const { username, registration_number } = req.body || {};
      
      const authResponse = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'magiclink',
          email: formattedEmail,
          data: type === 'signup' ? {
            username,
            registration_number,
            is_verified: 'yes'
          } : {}
        })
      });

      const authData = await authResponse.json().catch(() => ({}));
      if (!authResponse.ok) {
        console.error('Magic Link Error:', authData);
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
