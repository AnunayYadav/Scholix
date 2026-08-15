import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';


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
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Study Tracker API: Configuration missing');
    return res.status(500).json({ error: 'Database service configuration missing.' });
  }

  try {
    // 1. Initialize Supabase service client (service role bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Verify user identity using user token via service client
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const userId = user.id;

    const { action, pdfStudyTime, quizStudyTime, questionsAttempted, resumesAnalyzed, correctQuestions, wrongQuestions, targetUserId } = req.body || {};

    if (action === 'increment') {
      const pdfInc = Number(pdfStudyTime) || 0;
      const quizInc = Number(quizStudyTime) || 0;
      const questionsInc = Number(questionsAttempted) || 0;
      const resumesInc = Number(resumesAnalyzed) || 0;
      const correctInc = Number(correctQuestions) || 0;
      const wrongInc = Number(wrongQuestions) || 0;

      if (pdfInc === 0 && quizInc === 0 && questionsInc === 0 && resumesInc === 0 && correctInc === 0 && wrongInc === 0) {
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
            resumes_analyzed: Math.max(0, resumesInc),
            correct_questions: Math.max(0, correctInc),
            wrong_questions: Math.max(0, wrongInc),
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
            resumes_analyzed: Math.max(0, (existing.resumes_analyzed || 0) + resumesInc),
            correct_questions: Math.max(0, (existing.correct_questions || 0) + correctInc),
            wrong_questions: Math.max(0, (existing.wrong_questions || 0) + wrongInc),
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
        questions_attempted: 0,
        resumes_analyzed: 0,
        correct_questions: 0,
        wrong_questions: 0
      });
    } else if (action === 'save_record') {
      const { type, label, content } = req.body || {};
      if (!type || !label) {
        return res.status(400).json({ error: 'Missing type or label' });
      }

      // Fetch current stats
      const { data: existing, error: fetchErr } = await supabase
        .from('study_analytics')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      let currentActivities = [];
      if (existing && existing.recent_activities) {
        currentActivities = Array.isArray(existing.recent_activities) ? existing.recent_activities : [];
      }

      // Filter out older timetable_main or cgpa_snapshot if they are identical in label/type to keep it clean
      if (type === 'timetable_main') {
        currentActivities = currentActivities.filter((a: any) => a.type !== 'timetable_main');
      }

      const newRecord = {
        id: crypto.randomUUID(),
        type,
        label,
        content: content || null,
        created_at: new Date().toISOString()
      };

      // Add to beginning of array
      currentActivities.unshift(newRecord);
      // Keep only the last 50 activities
      if (currentActivities.length > 50) {
        currentActivities = currentActivities.slice(0, 50);
      }

      // Determine increment counters
      const fileAccessInc = type === 'file_access' ? 1 : 0;
      const cgpaInc = type === 'cgpa_calc' ? 1 : 0;
      const attendanceInc = type === 'attendance_update' ? 1 : 0;
      const roommateInc = type === 'roommate_request' ? 1 : 0;
      const marketplaceInc = type === 'marketplace_post' ? 1 : 0;

      let result;
      if (!existing) {
        // Fetch profile details
        const [profileRes, privateRes] = await Promise.all([
          supabase.from('profiles').select('username').eq('id', userId).maybeSingle(),
          supabase.from('user_private_info').select('email').eq('id', userId).maybeSingle()
        ]);
        const username = profileRes.data?.username || 'Nexus Scholar';
        const email = privateRes.data?.email || null;

        const { data, error: insertErr } = await supabase
          .from('study_analytics')
          .insert({
            user_id: userId,
            recent_activities: currentActivities,
            files_accessed: fileAccessInc,
            cgpa_calculations: cgpaInc,
            attendance_updates: attendanceInc,
            roommate_requests_count: roommateInc,
            marketplace_posts_count: marketplaceInc,
            pdf_study_time: 0,
            quiz_study_time: 0,
            questions_attempted: 0,
            resumes_analyzed: 0,
            correct_questions: 0,
            wrong_questions: 0,
            username,
            email
          })
          .select()
          .maybeSingle();

        if (insertErr) throw insertErr;
        result = data;
      } else {
        const { data, error: updateErr } = await supabase
          .from('study_analytics')
          .update({
            recent_activities: currentActivities,
            files_accessed: (existing.files_accessed || 0) + fileAccessInc,
            cgpa_calculations: (existing.cgpa_calculations || 0) + cgpaInc,
            attendance_updates: (existing.attendance_updates || 0) + attendanceInc,
            roommate_requests_count: (existing.roommate_requests_count || 0) + roommateInc,
            marketplace_posts_count: (existing.marketplace_posts_count || 0) + marketplaceInc,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select()
          .maybeSingle();

        if (updateErr) throw updateErr;
        result = data;
      }

      return res.status(200).json({ success: true, data: newRecord });

    } else if (action === 'update_record') {
      const { id: recordId, content } = req.body || {};
      if (!recordId) {
        return res.status(400).json({ error: 'Missing record id' });
      }

      const { data: existing, error: fetchErr } = await supabase
        .from('study_analytics')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchErr) throw fetchErr;
      if (!existing) {
        return res.status(404).json({ error: 'Analytics record not found' });
      }

      let currentActivities = Array.isArray(existing.recent_activities) ? existing.recent_activities : [];
      let updated = false;
      let targetRecord = null;

      currentActivities = currentActivities.map((a: any) => {
        if (a.id === recordId) {
          updated = true;
          targetRecord = { ...a, content: content, updated_at: new Date().toISOString() };
          return targetRecord;
        }
        return a;
      });

      if (!updated) {
        return res.status(404).json({ error: 'Activity log not found in recent logs' });
      }

      const { error: updateErr } = await supabase
        .from('study_analytics')
        .update({
          recent_activities: currentActivities,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateErr) throw updateErr;

      return res.status(200).json({ success: true, data: targetRecord });

    } else if (action === 'delete_record') {
      const { id: recordId } = req.body || {};
      if (!recordId) {
        return res.status(400).json({ error: 'Missing record id' });
      }

      const { data: existing, error: fetchErr } = await supabase
        .from('study_analytics')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchErr) throw fetchErr;
      if (!existing) {
        return res.status(404).json({ error: 'Analytics record not found' });
      }

      let currentActivities = Array.isArray(existing.recent_activities) ? existing.recent_activities : [];
      const originalLength = currentActivities.length;
      currentActivities = currentActivities.filter((a: any) => a.id !== recordId);

      if (currentActivities.length === originalLength) {
        return res.status(404).json({ error: 'Activity log not found in recent logs' });
      }

      const { error: updateErr } = await supabase
        .from('study_analytics')
        .update({
          recent_activities: currentActivities,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateErr) throw updateErr;

      return res.status(200).json({ success: true });

    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error: any) {
    console.error('Study Tracker API Error:', error);
    return res.status(500).json({ error: 'Internal server error processing study metrics.' });
  }
}
