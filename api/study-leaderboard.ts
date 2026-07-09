import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Leaderboard API: Configuration missing');
    return res.status(500).json({ error: 'Global ranking system synchronization failed.' });
  }

  try {
    // Create a server-side client with the SERVICE ROLE KEY to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch study_analytics records with profile details using postgrest relation
    const { data: records, error: dbError } = await supabase
      .from('study_analytics')
      .select('user_id, pdf_study_time, quiz_study_time, profile:profiles(username, avatar_url, total_xp, level)')
      .limit(1000);

    if (dbError) throw dbError;

    // 2. Map, sum, filter, and sort by total study time
    const result = (records || [])
      .map((row: any) => {
        // PostgREST relation might return single object or array depending on schema constraints
        const profile = Array.isArray(row.profile) ? row.profile[0] : row.profile;
        const totalStudyTime = (row.pdf_study_time || 0) + (row.quiz_study_time || 0);
        return {
          id: row.user_id,
          username: profile?.username || 'Nexus Scholar',
          avatar_url: profile?.avatar_url,
          total_xp: profile?.total_xp || 0,
          level: profile?.level || 1,
          totalStudyTime: totalStudyTime
        };
      })
      .filter(item => item.totalStudyTime > 0 && !!item.username)
      .sort((a, b) => b.totalStudyTime - a.totalStudyTime)
      .slice(0, 50);

    return res.status(200).json(result);

  } catch (error: any) {
    console.error('Leaderboard API Execution Error:', error);
    return res.status(500).json({ error: 'Failed to generate global scholar rankings.' });
  }
}
