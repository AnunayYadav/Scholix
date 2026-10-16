import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Robust environment variable loader
function getEnv(key: string): string {
  if (process.env[key]) return process.env[key] as string;
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
      if (match) return match[1].trim().replace(/^["']|["']$/g, '');
    }
  } catch (e) {
    // ignore
  }
  return '';
}

export default async function handler(req: any, res: any) {
  const { action } = req.query;

  const supabaseUrl = getEnv('SUPABASE_URL') || getEnv('VITE_SUPABASE_URL');
  const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Server configuration missing.' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    if (action === 'roommates') {
      if (req.method !== 'GET') return res.status(405).end();
      const { data, error } = await supabase
        .from('roommate_requests')
        .select('*, user:profiles(username, avatar_url)')
        .eq('status', 'Active')
        .order('created_at', { ascending: false });
      if (error) throw error;
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
          user: user ? { username: user.username || 'Nexus Scholar', avatar_url: user.avatar_url } : null
        };
      });
      return res.status(200).json(sanitized);
    } 
    
    if (action === 'marketplace') {
      if (req.method !== 'GET') return res.status(405).end();
      const { data, error } = await supabase
        .from('marketplace_items')
        .select('*, seller:profiles(username, avatar_url)')
        .eq('status', 'Available')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const sanitized = (data || []).map((row: any) => {
        const seller = Array.isArray(row.seller) ? row.seller[0] : row.seller;
        return {
          id: row.id,
          seller_id: row.seller_id,
          title: row.title,
          description: row.description,
          price: row.price,
          category: row.category,
          condition: row.condition,
          images: row.images,
          status: row.status,
          created_at: row.created_at,
          seller_phone: row.seller_phone,
          location: row.location,
          seller: seller ? { username: seller.username || 'Nexus Scholar', avatar_url: seller.avatar_url } : null
        };
      });
      return res.status(200).json(sanitized);
    } 
    
    if (action === 'timetables') {
      if (req.method !== 'GET') return res.status(405).end();
      const { data, error } = await supabase
        .from('community_timetables')
        .select('*, owner:profiles(username, avatar_url)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const sanitized = (data || []).map((row: any) => {
        const owner = Array.isArray(row.owner) ? row.owner[0] : row.owner;
        return {
          id: row.id,
          owner_id: row.owner_id,
          timetable_name: row.timetable_name,
          timetable_data: row.timetable_data,
          is_public: row.is_public,
          created_at: row.created_at,
          owner: owner ? { username: owner.username || 'Nexus Scholar', avatar_url: owner.avatar_url } : null
        };
      });
      return res.status(200).json(sanitized);
    } 
    
    if (action === 'site-stats') {
      if (req.method !== 'GET') return res.status(405).end();
      
      const [regRes, metricsRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('system_metrics').select('metric_key, count').eq('metric_type', 'site')
      ]);

      const registered = regRes.count || 0;
      const metrics = metricsRes.data || [];
      
      const viewsMetric = metrics.find(m => m.metric_key === 'views');
      const visitsMetric = metrics.find(m => m.metric_key === 'visits');

      const rawHits = viewsMetric ? Number(viewsMetric.count) : 0;
      const visitors = visitsMetric ? Number(visitsMetric.count) : 0;

      const pageMetricsRes = await supabase.from('system_metrics').select('count').eq('metric_type', 'page');
      const totalViews = (pageMetricsRes.data || []).reduce((acc, curr) => acc + (Number(curr.count) || 0), 0);

      return res.status(200).json({ registered, visitors, rawHits, totalViews });
    }

    // ─── ADMIN SECURITY GATEWAY INTERCEPTOR ───
    if (action.startsWith('admin-')) {
      const authHeader = req.headers['authorization'];
      const adminPinHash = req.headers['x-admin-passcode-hash'];
      const expectedHash = getEnv('ADMIN_PASSCODE_HASH') || getEnv('VITE_ADMIN_PASSCODE_HASH');

      let isAuthorized = false;

      // 1. Secret Passcode Hash Verification (Only against configured environment variable)
      if (expectedHash && adminPinHash && adminPinHash.trim().toLowerCase() === expectedHash.trim().toLowerCase()) {
        isAuthorized = true;
      }

      // 2. Cryptographic Supabase Auth Session Verification
      if (!isAuthorized && authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (!authError && user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .maybeSingle();

          if (profile?.is_admin) {
            isAuthorized = true;
          }
        }
      }

      if (!isAuthorized) {
        return res.status(403).json({ error: "Access denied. Valid administrator credentials required." });
      }
    }

    if (action === 'admin-profiles') {
      if (req.method !== 'GET') return res.status(405).end();

      // Fetch both public profiles and auth admin users for true creation dates
      let profilesData: any[] = [];
      let authUserMap = new Map<string, any>();
      let studyMap = new Map<string, any>();

      try {
        const [profilesRes, authRes, studyRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, username, avatar_url, is_admin, total_xp, level, current_streak, longest_streak, last_active_date, updated_at, private:user_private_info(email, registration_number)')
            .order('username', { ascending: true }),
          supabase.auth.admin.listUsers({ perPage: 1000 }).catch(() => ({ data: { users: [] }, error: null })),
          supabase.from('study_analytics').select('*')
        ]);

        if (profilesRes.error) throw profilesRes.error;
        profilesData = profilesRes.data || [];

        if (authRes.data?.users) {
          authRes.data.users.forEach((u: any) => {
            authUserMap.set(u.id, u);
          });
        }

        if (studyRes.data) {
          studyRes.data.forEach((s: any) => {
            studyMap.set(s.user_id, s);
          });
        }
      } catch (err: any) {
        console.error('Error fetching admin profiles data:', err);
        // Fallback simple query
        const fallback = await supabase
          .from('profiles')
          .select('id, username, avatar_url, is_admin, total_xp, level, current_streak, longest_streak, last_active_date, updated_at')
          .order('username', { ascending: true });
        profilesData = fallback.data || [];
      }

      const result = profilesData.map((p: any) => {
        const privateInfo = Array.isArray(p.private) ? p.private[0] : p.private;
        const authUser = authUserMap.get(p.id);
        const createdAt = authUser?.created_at || p.updated_at || null;
        const email = privateInfo?.email || authUser?.email || null;
        const regNo = privateInfo?.registration_number || authUser?.user_metadata?.registration_number || null;

        const study = studyMap.get(p.id) || {};
        const pdfStudyTime = Number(study.pdf_study_time) || 0;
        const quizStudyTime = Number(study.quiz_study_time) || 0;
        const totalStudyTime = pdfStudyTime + quizStudyTime;
        const filesAccessed = Number(study.files_accessed) || 0;
        const questionsAttempted = Number(study.questions_attempted) || 0;
        const correctQuestions = Number(study.correct_questions) || 0;
        const cgpaCalculations = Number(study.cgpa_calculations) || 0;
        const attendanceUpdates = Number(study.attendance_updates) || 0;
        const resumesAnalyzed = Number(study.resumes_analyzed) || 0;

        return {
          id: p.id,
          username: p.username || authUser?.user_metadata?.username || 'Anonymous',
          avatar_url: p.avatar_url,
          is_admin: p.is_admin,
          total_xp: p.total_xp || 0,
          level: p.level || 1,
          current_streak: p.current_streak || 0,
          longest_streak: p.longest_streak || 0,
          last_active_date: p.last_active_date || null,
          created_at: createdAt,
          updated_at: p.updated_at,
          email: email,
          registration_number: regNo,
          study_time: totalStudyTime,
          pdf_study_time: pdfStudyTime,
          quiz_study_time: quizStudyTime,
          files_accessed: filesAccessed,
          questions_attempted: questionsAttempted,
          correct_questions: correctQuestions,
          cgpa_calculations: cgpaCalculations,
          attendance_updates: attendanceUpdates,
          resumes_analyzed: resumesAnalyzed
        };
      });

      return res.status(200).json(result);
    }

    // ─── ADMIN DETAILED STATS (Real Supabase system_metrics, profiles, questions, papers) ───
    if (action === 'admin-detailed-stats') {
      if (req.method !== 'GET') return res.status(405).end();
      
      const [
        regCountRes,
        siteMetricsRes,
        reportsCountRes,
        feedbackCountRes,
        questionsCountRes,
        papersCountRes,
        topPagesRes,
        eventsRes,
        dailyMetricsRes,
        studyAnalyticsRes,
        allPagesRes
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('system_metrics').select('metric_key, count, unique_visitors').eq('metric_type', 'site'),
        supabase.from('question_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('feedback').select('*', { count: 'exact', head: true }),
        supabase.from('questions').select('*', { count: 'exact', head: true }),
        supabase.from('exam_papers').select('*', { count: 'exact', head: true }),
        supabase.from('system_metrics').select('metric_key, count, unique_visitors, last_triggered').eq('metric_type', 'page').order('count', { ascending: false }).limit(25),
        supabase.from('system_metrics').select('metric_key, count, last_triggered').eq('metric_type', 'event').order('count', { ascending: false }).limit(20),
        supabase.from('system_metrics').select('metric_key, count, unique_visitors').eq('metric_type', 'daily').order('metric_key', { ascending: false }).limit(30),
        supabase.from('study_analytics').select('pdf_study_time, quiz_study_time, questions_attempted, files_accessed, cgpa_calculations, attendance_updates, resumes_analyzed, recent_activities'),
        supabase.from('system_metrics').select('count').eq('metric_type', 'page')
      ]);

      const siteMetrics = siteMetricsRes.data || [];
      const viewsMetric = siteMetrics.find(m => m.metric_key === 'views');
      const visitsMetric = siteMetrics.find(m => m.metric_key === 'visits');

      const rawHits = viewsMetric ? Number(viewsMetric.count) : 0;
      const visitors = visitsMetric ? Number(visitsMetric.count) : 0;
      const registered = regCountRes.count || 0;
      const pendingReports = reportsCountRes.count || 0;
      const totalFeedback = feedbackCountRes.count || 0;
      const totalQuestions = questionsCountRes.count || 0;
      const totalPapers = papersCountRes.count || 0;

      const pageStats = (topPagesRes.data || []).map((p: any) => ({
        path: p.metric_key,
        views: p.count,
        unique_visitors: p.unique_visitors,
        last_triggered: p.last_triggered
      }));

      const allPagesTotalViews = (allPagesRes.data || []).reduce((acc: number, curr: any) => acc + (Number(curr.count) || 0), 0);
      const topPagesViews = pageStats.reduce((sum: number, p: any) => sum + (Number(p.views) || 0), 0);
      const totalViews = Math.max(rawHits, allPagesTotalViews, topPagesViews);

      const eventStats = (eventsRes.data || []).map((e: any) => ({
        event_name: e.metric_key,
        count: e.count,
        last_triggered: e.last_triggered
      }));

      const dailyTrend = (dailyMetricsRes.data || []).reverse().map((d: any) => ({
        date: d.metric_key,
        views: Number(d.count) || 0,
        visitors: Number(d.unique_visitors) || 0
      }));

      const studyRows = studyAnalyticsRes.data || [];
      const cumulativeStudyStats = studyRows.reduce((acc: any, row: any) => {
        acc.totalPdfTime += Number(row.pdf_study_time) || 0;
        acc.totalQuizTime += Number(row.quiz_study_time) || 0;
        acc.totalQuestionsAttempted += Number(row.questions_attempted) || 0;
        acc.totalFilesAccessed += Number(row.files_accessed) || 0;
        acc.totalCgpaCalculations += Number(row.cgpa_calculations) || 0;
        acc.totalAttendanceUpdates += Number(row.attendance_updates) || 0;
        acc.totalResumesAnalyzed += Number(row.resumes_analyzed) || 0;
        acc.totalActivities += Array.isArray(row.recent_activities) ? row.recent_activities.length : 0;
        return acc;
      }, {
        totalPdfTime: 0,
        totalQuizTime: 0,
        totalQuestionsAttempted: 0,
        totalFilesAccessed: 0,
        totalCgpaCalculations: 0,
        totalAttendanceUpdates: 0,
        totalResumesAnalyzed: 0,
        totalActivities: 0,
        activeStudentsTracked: studyRows.length
      });

      return res.status(200).json({
        summary: {
          registered,
          visitors,
          rawHits,
          totalViews,
          pendingReports,
          totalFeedback,
          totalQuestions,
          totalPapers
        },
        pageStats,
        eventStats,
        dailyTrend,
        cumulativeStudyStats
      });
    }

    // ─── ADMIN QUESTION REPORTS ───
    if (action === 'admin-reports') {
      if (req.method !== 'GET') return res.status(405).end();
      const { data: reports, error } = await supabase
        .from('question_reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const userIds = [...new Set((reports || []).map(r => r.user_id).filter(Boolean))];
      const questionIds = [...new Set((reports || []).map(r => r.question_id).filter(Boolean))];

      let usersMap = new Map();
      let questionsMap = new Map();

      if (userIds.length > 0) {
        const { data: users } = await supabase.from('profiles').select('id, username, avatar_url').in('id', userIds);
        (users || []).forEach(u => usersMap.set(u.id, u));
      }

      if (questionIds.length > 0) {
        const { data: questions } = await supabase.from('questions').select('*').in('id', questionIds);
        (questions || []).forEach(q => questionsMap.set(q.id, q));
      }

      const formatted = (reports || []).map(r => ({
        ...r,
        reporter: usersMap.get(r.user_id) || { username: 'Guest user' },
        question: questionsMap.get(r.question_id) || null
      }));

      return res.status(200).json(formatted);
    }

    // ─── ADMIN RESOLVE REPORT ───
    if (action === 'admin-resolve-report') {
      if (req.method !== 'POST') return res.status(405).end();
      const { reportId, status } = req.body || {};
      if (!reportId) return res.status(400).json({ error: 'Missing reportId' });

      const { error } = await supabase
        .from('question_reports')
        .update({ status: status || 'resolved' })
        .eq('id', reportId);
      if (error) throw error;

      return res.status(200).json({ success: true });
    }

    // ─── ADMIN FEEDBACK LIST ───
    if (action === 'admin-feedback') {
      if (req.method !== 'GET') return res.status(405).end();
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    // ─── ADMIN SAVE QUESTION (Create / Update) ───
    if (action === 'admin-save-question') {
      if (req.method !== 'POST') return res.status(405).end();
      const q = req.body || {};
      if (!q.question || !q.subject) {
        return res.status(400).json({ error: 'Question text and Subject code are required.' });
      }

      const row: any = {
        question: q.question,
        subject: (q.subject || '').toUpperCase().trim(),
        unit: q.unit ? String(q.unit).trim() : '1',
        topic: q.topic || '',
        options: Array.isArray(q.options) ? q.options : [],
        correct_answer: q.correctAnswer !== undefined && q.correctAnswer !== null ? Number(q.correctAnswer) : (q.correct_answer !== undefined ? Number(q.correct_answer) : 0),
        explanation: q.explanation || '',
        difficulty: q.difficulty || 'medium',
        type: q.type || 'mcq',
        question_type: q.questionType || q.question_type || 'MCQ',
        starter_code: q.starterCode || q.starter_code || null,
        test_cases: Array.isArray(q.testCases) ? q.testCases : (Array.isArray(q.test_cases) ? q.test_cases : []),
        is_official: q.is_official ?? false
      };

      if (q.id && String(q.id).trim() !== '') {
        row.id = String(q.id).trim();
      }

      const { data, error } = await supabase
        .from('questions')
        .upsert(row)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, question: data });
    }

    // ─── ADMIN SEARCH QUESTIONS ───
    if (action === 'admin-search-questions') {
      if (req.method !== 'GET') return res.status(405).end();
      const query = (req.query.q || '').trim();
      const subject = (req.query.subject || '').trim().toUpperCase();
      let dbQuery = supabase.from('questions').select('*').limit(30);

      if (subject) {
        dbQuery = dbQuery.eq('subject', subject);
      }
      if (query) {
        dbQuery = dbQuery.or(`question.ilike.%${query}%,topic.ilike.%${query}%`);
      }

      const { data, error } = await dbQuery.order('id', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error: any) {
    console.error(`Gateway API [${action}] Error:`, error);
    return res.status(500).json({ error: 'Internal gateway error.' });
  }
}
