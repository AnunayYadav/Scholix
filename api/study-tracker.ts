import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }
  const token = authHeader.split(' ')[1];

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Study Tracker API: Configuration missing');
    return res.status(500).json({ error: 'Database service configuration missing.' });
  }

  try {
    // 1. Verify user identity using user token
    const clientUser = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '');
    const { data: { user }, error: authError } = await clientUser.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const userId = user.id;

    // 2. Use service role to interact with study_analytics (bypass RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, pdfStudyTime, quizStudyTime, questionsAttempted, targetUserId } = req.body || {};

    if (action === 'increment') {
      const pdfInc = Number(pdfStudyTime) || 0;
      const quizInc = Number(quizStudyTime) || 0;
      const questionsInc = Number(questionsAttempted) || 0;

      if (pdfInc === 0 && quizInc === 0 && questionsInc === 0) {
        return res.status(200).json({ success: true, message: 'No increments provided.' });
      }

      // Fetch current stats
      const { data: existing, error: fetchErr } = await supabase
        .from('study_analytics')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      let result;
      if (!existing) {
        // Fetch username and email to store alongside
        const [profileRes, privateRes] = await Promise.all([
          supabase.from('profiles').select('username').eq('id', userId).maybeSingle(),
          supabase.from('user_private_info').select('email').eq('id', userId).maybeSingle()
        ]);

        const username = profileRes.data?.username || 'Nexus Scholar';
        const email = privateRes.data?.email || null;

        // Create new record
        const { data, error: insertErr } = await supabase
          .from('study_analytics')
          .insert({
            user_id: userId,
            pdf_study_time: Math.max(0, pdfInc),
            quiz_study_time: Math.max(0, quizInc),
            questions_attempted: Math.max(0, questionsInc),
            username: username,
            email: email
          })
          .select()
          .maybeSingle();
        
        if (insertErr) throw insertErr;
        result = data;
      } else {
        // Update existing record with increments
        const { data, error: updateErr } = await supabase
          .from('study_analytics')
          .update({
            pdf_study_time: Math.max(0, (existing.pdf_study_time || 0) + pdfInc),
            quiz_study_time: Math.max(0, (existing.quiz_study_time || 0) + quizInc),
            questions_attempted: Math.max(0, (existing.questions_attempted || 0) + questionsInc),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select()
          .maybeSingle();

        if (updateErr) throw updateErr;
        result = data;
      }

      return res.status(200).json({ success: true, data: result });

    } else if (action === 'get_stats') {
      const targetId = targetUserId || userId;

      if (targetId !== userId) {
        // Check if requester is admin
        const { data: requesterProfile, error: reqErr } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', userId)
          .maybeSingle();
        
        if (reqErr || !requesterProfile?.is_admin) {
          return res.status(403).json({ error: 'Forbidden: Admin privileges required' });
        }
      }

      const { data, error } = await supabase
        .from('study_analytics')
        .select('*')
        .eq('user_id', targetId)
        .maybeSingle();

      if (error) throw error;

      return res.status(200).json(data || {
        user_id: targetId,
        pdf_study_time: 0,
        quiz_study_time: 0,
        questions_attempted: 0
      });
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error: any) {
    console.error('Study Tracker API Error:', error);
    return res.status(500).json({ error: 'Internal server error processing study metrics.' });
  }
}
