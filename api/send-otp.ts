
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, username, type = 'signup' } = req.body || {};

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

  try {
    // 0. Identity Verification Checks
    if (type === 'login' || type === 'password_reset') {
      const checkResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(email.toLowerCase().trim())}&select=id`, {
        method: 'GET',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        }
      });
      const userData = await checkResponse.json();
      
      if (!checkResponse.ok) {
        console.error('Database Check Error:', userData);
        return res.status(500).json({ error: 'Identity verification system offline.' });
      }

      if (!userData || userData.length === 0) {
        const errorMsg = type === 'login' 
          ? 'No account found with this email. Please join Nexus first.' 
          : 'Recovery protocol failed: This email is not registered in the Nexus database.';
        return res.status(404).json({ error: errorMsg });
      }
    } else if (type === 'signup') {
      // For signup, only block if the email is already registered AND VERIFIED.
      // If it exists but isn't verified, it might be the user trying to re-register or verify.
      const checkResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(email.toLowerCase().trim())}&select=id,is_verified`, {
        method: 'GET',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        }
      });
      const userData = await checkResponse.json();
      
      if (userData && userData.length > 0 && userData[0].is_verified === 'yes') {
        return res.status(409).json({ error: 'This email is already registered and verified. Please login instead.' });
      }
    }

    // 0.5 Rate Limit Check: Prevent spamming multiple OTP calls
    const rateLimitResponse = await fetch(`${supabaseUrl}/rest/v1/registration_otps?email=eq.${encodeURIComponent(email.toLowerCase().trim())}&select=created_at&order=created_at.desc&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      }
    });

    if (rateLimitResponse.ok) {
      const existingOtps = await rateLimitResponse.json();
      if (existingOtps && existingOtps.length > 0) {
        const lastCreatedAt = new Date(existingOtps[0].created_at).getTime();
        const now = Date.now();
        const secondsElapsed = (now - lastCreatedAt) / 1000;
        
        if (secondsElapsed < 60) {
          const waitSeconds = Math.ceil(60 - secondsElapsed);
          return res.status(429).json({ 
            error: `Transmission cooling down. Please wait ${waitSeconds}s before requesting a new code.` 
          });
        }
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

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
    let emailTemplate = '';
    let emailSubject = `${otp} is your Nexus Verification Code`;

    if (type === 'login') {
      emailTemplate = `
        <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Access Protocol</h1>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 32px; line-height: 1.6;">
          Welcome back, cadet. Your secure access code for Nexus is listed below. Use it to finalize your session synchronization.
        </p>
      `;
      emailSubject = `${otp} is your Nexus Login Code`;
    } else if (type === 'email_update') {
      emailTemplate = `
        <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Security Update</h1>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 32px; line-height: 1.6;">
          Cadet, you are updating your primary communication channel. Use the code below to verify your new email address.
        </p>
      `;
      emailSubject = `${otp} is your Nexus Security Code`;
    } else if (type === 'password_reset') {
      emailTemplate = `
        <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Password Reset Protocol</h1>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 32px; line-height: 1.6;">
          Cadet, a password reset has been requested for your Nexus account. Use the secure code below to authorize this change. If you didn't request this, ignore this transmission.
        </p>
      `;
      emailSubject = `${otp} is your Nexus Reset Code`;
    } else {
      emailTemplate = `
        <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Verification Protocol</h1>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 32px; line-height: 1.6;">
          Greetings, cadet. To complete your student join protocol, please use the following access code.
        </p>
      `;
    }

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
        subject: emailSubject,
        htmlContent: `
          <html>
            <body style="font-family: 'Inter', Helvetica, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px;">
              <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; padding: 40px; border: 1px solid #e2e8f0; border-bottom: 4px solid #ea580c;">
                <div style="margin-bottom: 30px;">
                  <img src="https://lpunexus.vercel.app/apple-touch-icon.png" width="44" height="44" style="width: 44px; height: 44px; border-radius: 10px; vertical-align: middle; display: inline-block;" alt="Nexus Logo">
                  <span style="font-size: 22px; font-weight: 800; color: #0f172a; margin-left: 12px; vertical-align: middle; letter-spacing: -0.5px;">LPU Nexus</span>
                </div>
                
                ${emailTemplate}
                
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
      console.error('Brevo Error:', emailData);
      return res.status(500).json({ error: 'Failed to dispatch verification email.' });
    }

    return res.status(200).json({ success: true, messageId: emailData.messageId });
  } catch (error: any) {
    console.error('OTP Execution Error:', error);
    return res.status(500).json({ error: error.message || 'Internal transmission error.' });
  }
}
