
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, otp } = req.body || {};

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

    // 3. Optional: Clear the record on success to prevent reuse
    await fetch(`${supabaseUrl}/rest/v1/registration_otps?email=eq.${encodeURIComponent(email.toLowerCase().trim())}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
    });

    return res.status(200).json({ success: true, message: 'Identity verified successfully.' });
  } catch (error: any) {
    console.error('Verification Execution Error:', error);
    return res.status(500).json({ error: error.message || 'Internal verification error.' });
  }
}
