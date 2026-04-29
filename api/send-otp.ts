
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, username, type = 'signup', university = 'lpu' } = req.body || {};

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required.' });
  }

  // Dynamic Branding Configuration
  const brandName = 'Scholix';
  const shortBrandName = 'Scholix';
  const brandLogo = 'https://scholix.app/apple-touch-icon.png';
  const brandColor = '#ea580c'; // signature brand color

  const brevoApiKey = process.env.BREVO_API_KEY;
  const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL || 'security@scholix.app';
  const brevoSenderName = process.env.BREVO_SENDER_NAME || `${shortBrandName} Team`;
  
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
    let userExists = false;
    let isVerified = false;

    // First check profiles table (PostgREST)
    const profileCheckResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(email.toLowerCase().trim())}&select=id,is_verified`, {
      method: 'GET',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      }
    });

    if (profileCheckResponse.ok) {
      const userData = await profileCheckResponse.json();
      if (userData && userData.length > 0) {
        userExists = true;
        isVerified = userData[0].is_verified === 'yes';
      }
    }

    // If not found in profiles, or if it's a signup (to prevent ghost user conflicts), check Auth Admin
    if (!userExists || type === 'signup') {
      try {
        const authCheckResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users?per_page=1000`, {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          }
        });
        
        if (authCheckResponse.ok) {
          const authUsersData = await authCheckResponse.json();
          const authUser = (authUsersData.users || []).find((u: any) => u.email?.toLowerCase() === email.toLowerCase().trim());
          if (authUser) {
            userExists = true;
            // If they are in auth but not profiles, we'll treat them as existing for password reset
          }
        }
      } catch (e) {
        console.error('Auth Admin Identity check failed:', e);
      }
    }

    // Final decision based on user presence and requested action
    if (type === 'login' || type === 'password_reset') {
      if (!userExists) {
        const errorMsg = type === 'login' 
          ? `No account found with this email. Please join ${shortBrandName} first.` 
          : `Recovery failed: This email is not registered in the ${shortBrandName} database.`;
        return res.status(404).json({ error: errorMsg });
      }
    } else if (type === 'signup') {
      if (userExists && isVerified) {
        return res.status(409).json({ error: 'This email is already registered and verified. Please login instead.' });
      }
    }

    // 0.5 Rate Limit Check
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
            error: `Please wait ${waitSeconds}s before requesting a new code.` 
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
    let emailSubject = `${otp} is your ${shortBrandName} Verification Code`;

    if (type === 'login') {
      emailTemplate = `
        <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Login Code</h1>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 32px; line-height: 1.6;">
          Welcome back! Your secure login code for ${shortBrandName} is listed below. Use it to access your account.
        </p>
      `;
      emailSubject = `${otp} is your ${shortBrandName} Login Code`;
    } else if (type === 'email_update') {
      emailTemplate = `
        <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Verify New Email</h1>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 32px; line-height: 1.6;">
          You are updating your email address. Use the code below to verify your new email address.
        </p>
      `;
      emailSubject = `${otp} is your ${shortBrandName} Security Code`;
    } else if (type === 'password_reset') {
      emailTemplate = `
        <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Reset Password</h1>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 32px; line-height: 1.6;">
          A password reset has been requested for your ${shortBrandName} account. Use the secure code below to authorize this change. If you didn't request this, you can safely ignore this email.
        </p>
      `;
      emailSubject = `${otp} is your ${shortBrandName} Reset Code`;
    } else {
      emailTemplate = `
        <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Verification Code</h1>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 32px; line-height: 1.6;">
          Welcome to ${shortBrandName}! To complete your registration, please use the following verification code.
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
              <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; padding: 40px; border: 1px solid #e2e8f0; border-bottom: 4px solid ${brandColor};">
                <div style="margin-bottom: 30px;">
                  <img src="${brandLogo}" width="44" height="44" style="width: 44px; height: 44px; border-radius: 10px; vertical-align: middle; display: inline-block;" alt="${shortBrandName} Logo">
                  <span style="font-size: 22px; font-weight: 800; color: #0f172a; margin-left: 12px; vertical-align: middle; letter-spacing: -0.5px;">${brandName}</span>
                </div>
                
                ${emailTemplate}
                
                <div style="background-color: #fff7ed; padding: 24px; border-radius: 16px; text-align: center; border: 1px dashed #fdba74;">
                  <span style="font-size: 42px; font-weight: 900; color: ${brandColor}; letter-spacing: 8px; font-family: monospace;">${otp}</span>
                </div>
                
                <p style="color: #94a3b8; font-size: 12px; margin-top: 32px; text-align: center;">
                  Valid for 10 minutes. If you didn't request this, please ignore this email.
                </p>
                
                <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #f1f5f9; text-align: center;">
                  <p style="color: #94a3b8; font-size: 11px; margin: 0;">&copy; 2026 ${shortBrandName}. All Rights Reserved.</p>
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
    return res.status(500).json({ error: error.message || 'Internal server error.' });
  }
}
