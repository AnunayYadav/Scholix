
import crypto from 'crypto';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, otp, newPassword } = req.body || {};

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: 'Email, OTP, and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase Service Role configuration missing');
    return res.status(500).json({ error: 'Server configuration error. Please contact admin.' });
  }

  try {
    // 1. Fetch and Verify OTP
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
      console.error('OTP Query Error:', data);
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
      return res.status(401).json({ error: 'Invalid verification code.' });
    }

    if (now > expiresAt) {
      return res.status(410).json({ error: 'Verification code expired.' });
    }

    // 2. Find User ID
    let userId: string | null = null;

    // Try finding in profiles table (fastest and handles all standard cases)
    const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(email.toLowerCase().trim())}&select=id`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      }
    });
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      if (profileData && profileData.length > 0) {
        userId = profileData[0].id;
      }
    }

    if (!userId) {
      return res.status(404).json({ error: 'No user found with this email protocol.' });
    }

    // 3. Update Password
    const updateResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password: newPassword, email_confirm: true })
    });

    const updateData = await updateResponse.json();
    if (!updateResponse.ok) {
      console.error('Update Password Error:', updateData);
      return res.status(500).json({ error: updateData.error?.message || 'Failed to update access credentials.' });
    }

    // 4. Clear the OTP record
    await fetch(`${supabaseUrl}/rest/v1/registration_otps?email=eq.${encodeURIComponent(email.toLowerCase().trim())}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
    });

    return res.status(200).json({ success: true, message: 'Password updated successfully. You can now synchronize with your new credentials.' });

  } catch (error: any) {
    console.error('Reset Password Execution Error:', error);
    return res.status(500).json({ error: error.message || 'Internal reset protocol error.' });
  }
}
