
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Unauthorized: Session signature missing." });
  }

  const token = authHeader.split(' ')[1];
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase configuration missing');
    return res.status(500).json({ error: 'Server authentication configuration missing.' });
  }

  try {
    // 1. Initialize Supabase with Service Role Key for administrative actions
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 2. Verify the requester's identity using their token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth verification failed:", authError);
      return res.status(401).json({ error: "Invalid session: Account deletion denied." });
    }

    const userId = user.id;

    // 3. Delete user's profile and related data first (referential integrity)
    // We do this via the service role to ensure bypass of RLS if necessary, 
    // although the user should have permission to delete their own profile usually.
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.warn("Profile deletion error (non-fatal):", profileError);
    }

    // 4. Delete the user from Supabase Auth (Administrative Action)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("Auth deletion error:", deleteError);
      return res.status(500).json({ error: `Failed to delete authentication record: ${deleteError.message}` });
    }

    return res.status(200).json({ success: true, message: "Account successfully purged from system." });

  } catch (error: any) {
    console.error('Account Purge Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error during account purge.' });
  }
}
