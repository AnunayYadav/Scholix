
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, username } = req.body || {};

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required.' });
  }

  const brevoApiKey = process.env.BREVO_API_KEY;
  const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL || 'otp@lpunexus.com';
  const brevoSenderName = process.env.BREVO_SENDER_NAME || 'Nexus Team';
  
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!brevoApiKey) {
    console.error('Brevo API key missing');
    return res.status(500).json({ error: 'Email service configuration missing on server.' });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase configuration missing');
    return res.status(500).json({ error: 'Database configuration missing on server.' });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  try {
    // 1. Store/Update OTP in Supabase
    const dbResponse = await fetch(`${supabaseUrl}/rest/v1/registration_otps`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        otp: otp,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      }),
    });

    if (!dbResponse.ok) {
      const dbError = await dbResponse.json();
      console.error('Database Error (OTP Save):', dbError);
      return res.status(500).json({ error: 'Failed to generate verification token.' });
    }

    // 2. Send Email via Brevo
    const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: brevoSenderName,
          email: brevoSenderEmail,
        },
        to: [
          {
            email: email,
            name: username || 'User',
          },
        ],
        subject: `${otp} is your Nexus Verification Code`,
        htmlContent: `
          <html>
            <body style="font-family: 'Inter', Helvetica, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px;">
              <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; padding: 40px; border: 1px solid #e2e8f0; border-bottom: 4px solid #ea580c;">
                <div style="margin-bottom: 30px;">
                  <div style="width: 40px; height: 40px; background-color: #ea580c; border-radius: 12px; overflow: hidden; display: inline-flex; align-items: center; justify-content: center; vertical-align: middle;">
                    <img src="https://lpunexus.vercel.app/apple-touch-icon.png" style="width: 100%; height: 100%; object-fit: cover;" alt="Logo" />
                  </div>
                  <span style="font-size: 20px; font-weight: 800; color: #0f172a; margin-left: 12px; vertical-align: middle;">LPU Nexus</span>
                </div>
                
                <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Verification Protocol</h1>
                <p style="color: #64748b; font-size: 14px; margin-bottom: 32px; line-height: 1.6;">
                  Greetings, cadet. To complete your student synchronization, please use the following access code.
                </p>
                
                <div style="background-color: #fff7ed; padding: 24px; border-radius: 16px; text-align: center; border: 1px dashed #fdba74;">
                  <span style="font-size: 42px; font-weight: 900; color: #ea580c; letter-spacing: 8px; font-family: monospace;">${otp}</span>
                </div>
                
                <p style="color: #94a3b8; font-size: 12px; margin-top: 32px; text-align: center;">
                  Valid for 10 minutes. If you didn't request this, ignore this transmission.
                </p>
                
                <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #f1f5f9; text-align: center;">
                  <p style="color: #94a3b8; font-size: 11px; margin: 0;">&copy; 2026 Nexus Protocol. All Rights Reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    const emailData = await emailResponse.json();
    if (!emailResponse.ok) {
      console.error('--- BREVO DISPATCH FAILURE ---');
      console.error('Status:', emailResponse.status);
      console.error('Response Body:', JSON.stringify(emailData, null, 2));
      console.error('------------------------------');
      return res.status(500).json({ 
        error: 'Failed to dispatch verification email.',
        details: emailData.message || 'Check server logs for platform debugging.'
      });
    }

    return res.status(200).json({ success: true, messageId: emailData.messageId });
  } catch (error: any) {
    console.error('OTP Execution Error:', error);
    return res.status(500).json({ error: error.message || 'Internal transmission error.' });
  }
}
