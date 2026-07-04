import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Roommates API: Configuration missing');
    return res.status(500).json({ error: 'Database configuration missing on server.' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch roommate requests and join profile username/avatar
    const { data, error } = await supabase
      .from('roommate_requests')
      .select('*, user:profiles(username, avatar_url)')
      .eq('status', 'Active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Sanitize results: Ensure no sensitive profiles data leaks
    const sanitized = (data || []).map((row: any) => {
      const user = Array.isArray(row.user) ? row.user[0] : row.user;
      return {
        id: row.id,
        user_id: row.user_id,
        location: row.location,
        budget: row.budget,
        preferences: row.preferences,
        gender_preference: row.gender_preference,
        status: row.status,
        created_at: row.created_at,
        description: row.description,
        contact_info: row.contact_info,
        user: user ? {
          username: user.username || 'Nexus Scholar',
          avatar_url: user.avatar_url
        } : null
      };
    });

    return res.status(200).json(sanitized);

  } catch (error: any) {
    console.error('Roommates API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch roommate requests.' });
  }
}
