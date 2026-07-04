import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Timetables API: Configuration missing');
    return res.status(500).json({ error: 'Database configuration missing on server.' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch shared timetables and join owner profile username/avatar
    const { data, error } = await supabase
      .from('community_timetables')
      .select('*, owner:profiles(username, avatar_url)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Sanitize results: Ensure no sensitive profiles data leaks
    const sanitized = (data || []).map((row: any) => {
      const owner = Array.isArray(row.owner) ? row.owner[0] : row.owner;
      return {
        id: row.id,
        owner_id: row.owner_id,
        timetable_name: row.timetable_name,
        timetable_data: row.timetable_data,
        is_public: row.is_public,
        created_at: row.created_at,
        owner: owner ? {
          username: owner.username || 'Nexus Scholar',
          avatar_url: owner.avatar_url
        } : null
      };
    });

    return res.status(200).json(sanitized);

  } catch (error: any) {
    console.error('Timetables API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch community timetables.' });
  }
}
