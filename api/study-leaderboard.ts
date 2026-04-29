
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
    // This allows us to show a public leaderboard even if the tables are private
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch study session records
    const { data: records, error: historyError } = await supabase
      .from('user_history')
      .select('user_id, content')
      .eq('type', 'study_session')
      .limit(10000);

    if (historyError) throw historyError;

    // 2. Aggregate durations by user
    const userDurations: Record<string, number> = {};
    records?.forEach((record: any) => {
      const uid = record.user_id;
      if (!uid) return;
      const duration = record.content?.duration || 0;
      userDurations[uid] = (userDurations[uid] || 0) + duration;
    });

    // 3. Sort and get top IDs
    const sortedUserIds = Object.keys(userDurations)
      .sort((a, b) => userDurations[b] - userDurations[a])
      .slice(0, 50);

    if (sortedUserIds.length === 0) {
      return res.status(200).json([]);
    }

    // 4. Fetch profiles for these users
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, total_xp, level')
      .in('id', sortedUserIds);

    if (profileError) throw profileError;

    // 5. Combine and finalize
    const result = sortedUserIds
      .map((uid) => {
        const profile = profiles?.find((p) => p.id === uid);
        return {
          id: uid,
          username: profile?.username || 'Nexus Scholar',
          avatar_url: profile?.avatar_url,
          total_xp: profile?.total_xp || 0,
          level: profile?.level || 1,
          totalStudyTime: userDurations[uid]
        };
      })
      .filter(item => !!item.username)
      .sort((a, b) => b.totalStudyTime - a.totalStudyTime);

    return res.status(200).json(result);

  } catch (error: any) {
    console.error('Leaderboard API Execution Error:', error);
    return res.status(500).json({ error: 'Failed to generate global scholar rankings.' });
  }
}
