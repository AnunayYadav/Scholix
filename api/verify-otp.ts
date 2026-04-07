
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, otp, type = 'signup', oldEmail } = req.body || {};

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required.' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

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

    // 2. Validate OTP
    if (record.otp !== otp.trim()) {
      return res.status(401).json({ error: 'Invalid verification code. Please check and try again.' });
    }

    if (now > expiresAt) {
      return res.status(410).json({ error: 'Verification code expired. Please request a new one.' });
    }

    // 3. Handle data updates
    let userId: string | null = null;
    
    // Attempt to find user to get their ID (needed for email_update)
    try {
      const searchEmail = (type === 'email_update' && oldEmail) ? oldEmail : email;
      const userQuery = await fetch(`${supabaseUrl}/auth/v1/admin/users?email=eq.${encodeURIComponent(searchEmail.toLowerCase().trim())}`, {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        }
      });
      const userData = await userQuery.json();
      if (userData && userData.users && userData.users.length > 0) {
        userId = userData.users[0].id;
      }
    } catch (e) {
      console.error('Failed to resolve userId:', e);
    }

    // 4. Update profile to mark as verified
    try {
      const updateData: any = { is_verified: 'yes' };
      if (type === 'email_update') {
        updateData.email = email.toLowerCase().trim();
      }

      const profileUpdateUrl = userId 
        ? `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`
        : `${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(email.toLowerCase().trim())}`;

      await fetch(profileUpdateUrl, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(updateData)
      });
    } catch (e) {
      console.error('Failed to update profile:', e);
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

    // 6. Clear the OTP record
    await fetch(`${supabaseUrl}/rest/v1/registration_otps?email=eq.${encodeURIComponent(email.toLowerCase().trim())}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
    });

    // 7. Session generation for login/signup
    if (type === 'login' || type === 'signup') {
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
        })
      });

      const authData = await authResponse.json();
      if (!authResponse.ok) {
        console.error('Magic Link Error:', authData);
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
