import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
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
    console.error('Admin Profiles API: Configuration missing');
    return res.status(500).json({ error: 'Server authentication configuration missing.' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 1. Verify the requester's identity using their token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: "Invalid session." });
    }

    // 2. Verify that the requester is an administrator
    const { data: adminCheck, error: adminError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (adminError || !adminCheck || !adminCheck.is_admin) {
      return res.status(403).json({ error: "Forbidden: Administrator privileges required." });
    }

    // 3. Fetch all profiles and join user_private_info
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, is_admin, total_xp, level, private:user_private_info(email, registration_number)')
      .order('username', { ascending: true });

    if (error) throw error;

    // 4. Flatten the joined results
    const result = (data || []).map((p: any) => {
      const privateInfo = Array.isArray(p.private) ? p.private[0] : p.private;
      return {
        id: p.id,
        username: p.username,
        avatar_url: p.avatar_url,
        is_admin: p.is_admin,
        total_xp: p.total_xp,
        level: p.level,
        email: privateInfo?.email || null,
        registration_number: privateInfo?.registration_number || null
      };
    });

    return res.status(200).json(result);

  } catch (error: any) {
    console.error('Admin Profiles API Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve system profiles.' });
  }
}
