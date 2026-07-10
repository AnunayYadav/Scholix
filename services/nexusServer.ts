
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { LibraryFile, UserProfile, Folder, QuizQuestion, TimetableData, NexusNotification } from '../types.ts';

const getEnvVar = (name: string): string => {
  try {
    const g = (typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : ({} as any));
    const processEnv = g.process?.env?.[name];
    if (processEnv) return processEnv;
    const metaEnv = (import.meta as any).env;
    if (metaEnv) {
      if (metaEnv[`VITE_${name}`]) return metaEnv[`VITE_${name}`];
      if (metaEnv[name]) return metaEnv[name];
    }
  } catch (e) { }
  return '';
};

// Rate limiter for auth operations
const rateLimiter = {
  attempts: new Map<string, { count: number; resetAt: number }>(),
  check(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const entry = this.attempts.get(key);
    if (!entry || now > entry.resetAt) {
      this.attempts.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (entry.count >= maxAttempts) return false;
    entry.count++;
    return true;
  }
};

// Input sanitization utility
const sanitizeInput = (input: string, maxLength: number = 500): string => {
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Strip control chars
    .trim()
    .slice(0, maxLength);
};

let supabaseInstance: SupabaseClient | null = null;

const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;
  const url = getEnvVar('SUPABASE_URL');
  const key = getEnvVar('SUPABASE_ANON_KEY');
  if (!url || !key) {
    console.warn("Supabase Configuration Missing. Ensure SUPABASE_URL and SUPABASE_ANON_KEY are set.");
    return null;
  }
  try {
    supabaseInstance = createClient(url, key);
    return supabaseInstance;
  } catch (e) {
    console.error("Failed to initialize Supabase client:", e);
    return null;
  }
};

class NexusServer {
  static isConfigured(): boolean { return !!getSupabase(); }

  static getClient() {
    return getSupabase();
  }

  /**
   * Timetable: Community Presets
   */
  static async fetchCommunityTimetables(): Promise<any[]> {
    try {
      const response = await fetch('/api/gateway?action=timetables');
      if (!response.ok) throw new Error("Failed to sync community presets.");
      return await response.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  static async shareTimetable(data: TimetableData, metadata: any) {
    const client = getSupabase();
    if (!client) return;
    const { error } = await client.from('community_timetables').insert([{
      owner_id: data.ownerId,
      name: data.ownerName,
      schedule: data.schedule,
      section: metadata.section,
      branch: metadata.branch,
      year: metadata.year,
      semester: metadata.semester
    }]);
    if (error) throw error;
  }

  static async updateCommunityTimetable(id: string, metadata: any, schedule?: any) {
    const client = getSupabase();
    if (!client) return;
    const generatedName = `${metadata.section} - ${metadata.branch} ${metadata.year} Year Sem ${metadata.semester}`;
    const updateData: any = {
      section: metadata.section,
      branch: metadata.branch,
      year: metadata.year,
      semester: metadata.semester,
      name: generatedName
    };
    if (schedule) updateData.schedule = schedule;
    
    const { error } = await client.from('community_timetables').update(updateData).eq('id', id);
    if (error) throw error;
  }

  static async deleteCommunityTimetable(id: string) {
    const client = getSupabase();
    if (!client) return;
    const { error } = await client.from('community_timetables').delete().eq('id', id);
    if (error) throw error;
  }

  /**
   * Quiz Taker: Persistent Storage Methods
   */
  static async fetchQuestionsFromBank(subject: string, units: number[]): Promise<QuizQuestion[]> {
    const client = getSupabase();
    if (!client) return [];

    const subjectMatch = (subject || '').match(/[A-Za-z]+[0-9]+/);
    const subjectCode = subjectMatch ? subjectMatch[0].toUpperCase() : (subject || '').split(':')[0].trim().replace(/\s+/g, '').toUpperCase();

    // Resolve subject folder
    const { data: subFolders } = await client
      .from('library_items')
      .select('id, name')
      .eq('type', 'subject');

    const subFolder = (subFolders || []).find(f => {
      const match = f.name.match(/[A-Za-z]+[0-9]+/);
      const code = match ? match[0].toUpperCase() : f.name.toUpperCase().trim();
      return code === subjectCode;
    });

    let query = client.from('question_banks').select('*');
    if (subFolder) {
      query = query.eq('subject_id', subFolder.id);
    } else {
      query = query.eq('subject_name', subject); // fallback
    }

    const { data, error } = await query.in('unit_number', units);
    if (error || !data) return [];

    let combined: QuizQuestion[] = [];
    data.forEach(row => {
      if (Array.isArray(row.questions)) {
        combined = [...combined, ...row.questions];
      }
    });

    return combined;
  }


  /**
   * Save consolidated questions for a subject unit
   * @param subject The subject name (e.g., 'CSE121')
   * @param unit The unit number
   * @param questions List of QuizQuestion objects
   */
  static async saveQuestionsToBank(subject: string, unit: number, questions: QuizQuestion[]) {
    const client = getSupabase();
    if (!client) return;

    // Extract core subject code (e.g., CHE110) consistently
    const subjectMatch = (subject || '').match(/[A-Za-z]+[0-9]+/);
    const subjectCode = subjectMatch ? subjectMatch[0].toUpperCase() : (subject || '').split(':')[0].trim().replace(/\s+/g, '').toUpperCase();

    // Resolve subject folder
    const { data: subFolders } = await client
      .from('library_items')
      .select('id, name')
      .eq('type', 'subject');

    const subFolder = (subFolders || []).find(f => {
      const match = f.name.match(/[A-Za-z]+[0-9]+/);
      const code = match ? match[0].toUpperCase() : f.name.toUpperCase().trim();
      return code === subjectCode;
    });

    // Transform from app format to DB format (snake_case)
    const dbRows = questions.map(q => ({
      id: q.id,
      subject_id: subFolder?.id || null,
      subject: subjectCode,
      unit,
      topic: q.topic,
      difficulty: q.difficulty,
      question_type: q.questionType || 'MCQ',
      type: q.type || 'mcq',
      question: q.question,
      options: Array.isArray(q.options) ? q.options : [], // JSONB handles arrays automatically
      correct_answer: q.correctAnswer,
      explanation: q.explanation,
      starter_code: q.starterCode,
      test_cases: Array.isArray(q.testCases) ? q.testCases : []
    }));

    const { error } = await client
      .from('questions')
      .upsert(dbRows, { onConflict: 'id' });

    if (error) {
      console.error('Save Questions Bulk Error:', error);
      throw error;
    }
  }

  /**
   * Fetch questions from the optimized questions table
   * @param subject The subject name
   * @param unit Optional unit number (if not provided, fetches all units for the subject)
   */
  static async fetchQuestions(subject: string, unitOrUnits?: number | number[]): Promise<QuizQuestion[]> {
    const client = getSupabase();
    if (!client) return [];

    // Extract core subject code (e.g., CHE110) consistently
    const subjectMatch = (subject || '').match(/[A-Za-z]+[0-9]+/);
    const subjectCode = subjectMatch ? subjectMatch[0].toUpperCase() : (subject || '').split(':')[0].trim().replace(/\s+/g, '').toUpperCase();
    
    // Resolve subject folder
    const { data: subFolders } = await client
      .from('library_items')
      .select('id, name')
      .eq('type', 'subject');

    const subFolder = (subFolders || []).find(f => {
      const match = f.name.match(/[A-Za-z]+[0-9]+/);
      const code = match ? match[0].toUpperCase() : f.name.toUpperCase().trim();
      return code === subjectCode;
    });

    let query = client.from('questions').select('*');
    if (subFolder) {
      query = query.eq('subject_id', subFolder.id);
    } else {
      query = query.eq('subject', subjectCode); // fallback
    }

    if (unitOrUnits !== undefined) {
      if (Array.isArray(unitOrUnits)) {
        if (unitOrUnits.length > 0 && !unitOrUnits.includes(0)) {
          query = query.in('unit', unitOrUnits);
        }
      } else if (unitOrUnits !== 0) {
        query = query.eq('unit', unitOrUnits);
      }
    }

    // Increase limit significantly and ensure we fetch all subject questions
    // Using a larger range for custom generation to avoid missing high-unit questions
    query = query.range(0, 5000).order('unit', { ascending: true });

    const { data, error } = await query;

    if (error || !data) {
      console.error('Fetch Questions Error:', error);
      return [];
    }

    return data.map(q => {
      let options = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []);
      if (!Array.isArray(options)) {
        if (options && typeof options === 'object') {
          options = Object.values(options);
        } else {
          options = [];
        }
      }
      
      // Robust mapping for correctAnswer index
      let finalCorrectIdx: number | undefined = undefined;
      const rawAns = q.correct_answer;

      if (rawAns !== null && rawAns !== undefined) {
        if (typeof rawAns === 'number') {
          finalCorrectIdx = rawAns;
        } else {
          const strAns = String(rawAns).trim();
          if (strAns.length === 1 && /^[A-D]$/i.test(strAns)) {
            // Handle letters A, B, C, D
            finalCorrectIdx = strAns.toUpperCase().charCodeAt(0) - 65;
          } else if (!isNaN(Number(strAns))) {
            // Handle numeric strings "0", "1"
            finalCorrectIdx = Number(strAns);
          } else {
            // Check if matches any option text exactly
            const idx = options.findIndex((opt: any) => 
              String(opt).trim().toLowerCase() === strAns.toLowerCase()
            );
            if (idx !== -1) finalCorrectIdx = idx;
          }
        }
      }

      return {
        id: q.id,
        unit: Number(q.unit),
        topic: q.topic,
        difficulty: q.difficulty,
        questionType: q.question_type as any,
        type: q.type as any,
        question: q.question,
        options,
        correctAnswer: finalCorrectIdx,
        explanation: q.explanation,
        starterCode: q.starter_code,
        testCases: typeof q.test_cases === 'string' ? JSON.parse(q.test_cases) : (q.test_cases || [])
      };
    });
  }

  /**
   * Fetches unique units and topics for a subject
   */
  static async fetchSubjectMetadata(subject: string): Promise<{ units: number[], topics: string[] }> {
    const client = getSupabase();
    if (!client) return { units: [], topics: [] };

    const subjectCode = (subject || '').split(':')[0].trim().replace(/\s+/g, '').toUpperCase();
    const { data, error } = await client
      .from('questions')
      .select('unit, topic')
      .eq('subject', subjectCode)
      .limit(5000);

    if (error || !data) return { units: [], topics: [] };

    const units = Array.from(new Set(data.map(q => Number(q.unit)).filter(u => !isNaN(u)))).sort((a, b) => a - b);
    const topics = Array.from(new Set(data.map(q => q.topic).filter(Boolean))) as string[];

    return { units, topics };
  }

  static async fetchQuestionCount(subject: string): Promise<number> {
    const client = getSupabase();
    if (!client) return 0;
    
    const subjectCode = (subject || '').split(':')[0].trim().replace(/\s+/g, '').toUpperCase();
    const { count, error } = await client
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('subject', subjectCode);
    
    return count || 0;
  }

  /**
   * Fetch distinct subject names from the questions table
   */
  static async fetchSubjectNames(): Promise<string[]> {
    const client = getSupabase();
    if (!client) return [];

    // Distinct subjects from the questions table
    const { data, error } = await client
      .from('questions')
      .select('subject')
      .limit(10000);

    if (error || !data) {
      console.error('Fetch Subject Names Error:', error);
      return [];
    }

    // Return unique, trimmed, non-empty codes
    return Array.from(new Set(
      data.map(item => String(item.subject || '').trim()).filter(Boolean)
    ));
  }

  /**
   * Quiz Persistence: Save quiz attempts and update profile XP
   */
  static async saveQuizAttempt(params: {
    userId: string;
    quizId: string;
    subjectName?: string;
    scorePercentage: number;
    xpEarned: number;
    timeTakenSeconds: number;
    totalQuestions: number;
    correctAnswers: number;
    breakdown: any[];
  }) {
    const client = getSupabase();
    if (!client) return;

    const { error } = await client.from('quiz_attempts').insert([{
      user_id: params.userId,
      quiz_id: params.quizId,
      subject_name: params.subjectName,
      score_percentage: params.scorePercentage,
      xp_earned: params.xpEarned,
      time_taken_seconds: params.timeTakenSeconds,
      total_questions: params.totalQuestions,
      correct_answers: params.correctAnswers,
      xp_breakdown: params.breakdown
    }]);

    if (error) {
      console.error('Save Quiz Attempt Error:', error);
      throw error;
    }

    // Also log to unified history for activity tracking
    this.saveRecord(
      params.userId,
      'quiz_complete',
      `Completed ${params.subjectName || 'Quiz'}`,
      {
        quizId: params.quizId,
        score: params.scorePercentage,
        xp: params.xpEarned,
        time: params.timeTakenSeconds
      }
    ).catch(e => console.error("History sync error:", e));
  }

  static async fetchUserQuizAttempts(userId: string) {
    const client = getSupabase();
    if (!client) return [];

    const { data, error } = await client
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Fetch Quiz Attempts Error:', error);
      return [];
    }

    return (data || []).map(attempt => ({
      quiz_id: attempt.quiz_id,
      xp_earned: attempt.xp_earned,
      breakdown: attempt.xp_breakdown || [],
      earned_at: attempt.completed_at
    }));
  }

  static async updateProfileXP(userId: string, updates: { 
    total_xp: number; 
    level: number; 
    level_title: string;
    current_streak?: number;
    longest_streak?: number;
    last_active_date?: string;
  }) {
    const client = getSupabase();
    if (!client) return;

    const { error } = await client.from('profiles').update(updates).eq('id', userId);
    if (error) {
      console.error('Update Profile XP Error:', error);
      throw error;
    }
  }

  static async recordVisit(): Promise<void> {
    // Deprecated: visit tracking is now handled atomically inside trackPageView
  }

  static async getSiteStats(): Promise<{ registered: number; visitors: number; totalViews: number; rawHits: number }> {
    try {
      const response = await fetch('/api/gateway?action=site-stats');
      if (!response.ok) {
        throw new Error('Failed to fetch site statistics from gateway');
      }
      return await response.json();
    } catch (e) {
      console.error("Error fetching site stats:", e);
      return { registered: 0, visitors: 0, totalViews: 0, rawHits: 0 };
    }
  }

  static async trackPageView(path: string): Promise<void> {
    const client = getSupabase();
    if (!client) return;

    const pathSessionKey = `viewed_${path}`;
    const isNewPathVisitor = !sessionStorage.getItem(pathSessionKey);

    const globalSessionKey = 'nexus_session_logged';
    const isNewGlobalVisitor = !sessionStorage.getItem(globalSessionKey);

    try {
      const todayStr = new Date().toISOString().split('T')[0];

      await Promise.all([
        // 1. Increment page stats
        client.rpc('increment_metric', { 
          p_type: 'page', 
          p_key: path, 
          p_views_inc: 1, 
          p_visitors_inc: isNewPathVisitor ? 1 : 0 
        }),
        // 2. Increment daily time-series
        client.rpc('increment_metric', { 
          p_type: 'daily', 
          p_key: todayStr, 
          p_views_inc: 1, 
          p_visitors_inc: isNewPathVisitor ? 1 : 0 
        }),
        // 3. Increment total site views
        client.rpc('increment_metric', { 
          p_type: 'site', 
          p_key: 'views', 
          p_views_inc: 1, 
          p_visitors_inc: 0 
        }),
        // 4. Increment total site visits if new global visitor
        isNewGlobalVisitor ? client.rpc('increment_metric', { 
          p_type: 'site', 
          p_key: 'visits', 
          p_views_inc: 0, 
          p_visitors_inc: 1 
        }) : Promise.resolve()
      ]);

      if (isNewPathVisitor) sessionStorage.setItem(pathSessionKey, 'true');
      if (isNewGlobalVisitor) sessionStorage.setItem(globalSessionKey, 'true');
    } catch (e) {
      console.warn("Telemetry page tracking failed:", e);
    }
  }

  static async trackEvent(eventName: string): Promise<void> {
    const client = getSupabase();
    if (!client) return;
    try {
      await client.rpc('increment_metric', { 
        p_type: 'event', 
        p_key: eventName, 
        p_views_inc: 1, 
        p_visitors_inc: 0 
      });
    } catch (e) {
      console.warn("Telemetry event tracking failed:", e);
    }
  }

  static async getEventCount(eventName: string): Promise<number> {
    const client = getSupabase();
    if (!client) return 0;
    try {
      const { data, error } = await client
        .from('system_metrics')
        .select('count')
        .eq('metric_type', 'event')
        .eq('metric_key', eventName)
        .maybeSingle();
      if (error) return 0;
      return data ? Number(data.count) : 0;
    } catch (e) {
      return 0;
    }
  }

  static async getTimeSeriesStats(type: 'views' | 'visitors' | 'feedback' | 'reports', days: number = 12): Promise<any[]> {
    const client = getSupabase();
    if (!client) return [];

    // 1. If views or visitors, query pre-aggregated data from system_metrics
    if (type === 'views' || type === 'visitors') {
      try {
        let query = client
          .from('system_metrics')
          .select('metric_key, count, unique_visitors')
          .eq('metric_type', 'daily')
          .order('metric_key', { ascending: false });

        if (days > 0) {
          const dateLimit = new Date();
          dateLimit.setDate(dateLimit.getDate() - days);
          const limitStr = dateLimit.toISOString().split('T')[0];
          query = query.gte('metric_key', limitStr);
        }

        const { data, error } = await query;
        if (error || !data) return [];

        return data.map((item: any) => {
          // Format date string back to local date format for charting compat
          const localDate = new Date(item.metric_key).toLocaleDateString();
          return {
            date: localDate,
            count: type === 'views' ? Number(item.count) : Number(item.unique_visitors)
          };
        }).reverse();
      } catch (e) {
        console.error(`Error loading time series stats for ${type}:`, e);
        return [];
      }
    }

    // 2. Otherwise (feedback or reports), query raw records and aggregate
    let table = '';
    switch (type) {
      case 'feedback': table = 'feedback'; break;
      case 'reports': table = 'question_reports'; break;
    }

    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - (days || 1000)); // 0 means all

    let query = client
      .from(table)
      .select('created_at')
      .order('created_at', { ascending: false });

    if (days > 0) {
      query = query.gte('created_at', dateLimit.toISOString());
    }

    const { data, error } = await query.limit(1000);

    if (error || !data) return [];

    const groups: { [key: string]: number } = {};
    data.forEach(item => {
      const date = new Date(item.created_at).toLocaleDateString();
      groups[date] = (groups[date] || 0) + 1;
    });

    return Object.entries(groups).map(([date, count]) => ({ date, count })).reverse();
  }

  static async getDetailedStats(): Promise<{ 
    pageStats: any[], 
    eventStats: any[],
    summary: {
      registered: number,
      visitors: number,
      totalViews: number,
      rawHits: number,
      pendingReports: number,
      totalFeedback: number
    }
  }> {
    const client = getSupabase();
    if (!client) return { 
      pageStats: [], 
      eventStats: [], 
      summary: { registered: 0, visitors: 0, totalViews: 0, rawHits: 0, pendingReports: 0, totalFeedback: 0 } 
    };

    const fetchCount = async (table: string) => {
      try {
        const { count, error } = await client.from(table).select('*', { count: 'exact', head: true });
        return count || 0;
      } catch (e) {
        return 0;
      }
    };

    const [pages, events, reg, vis, raw, reports, feedback] = await Promise.all([
      client.from('page_stats').select('*').order('views', { ascending: false }),
      client.from('event_stats').select('*').order('count', { ascending: false }),
      client.from('profiles').select('*', { count: 'exact', head: true }),
      client.from('site_visits').select('*', { count: 'exact', head: true }),
      fetchCount('site_views'),
      client.from('question_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      client.from('feedback').select('*', { count: 'exact', head: true })
    ]);

    return {
      pageStats: pages.data || [],
      eventStats: events.data || [],
      summary: {
        registered: reg.count || 0,
        visitors: vis.count || 0,
        totalViews: (pages.data || []).reduce((acc: number, curr: any) => acc + Number(curr.views), 0),
        rawHits: raw,
        pendingReports: reports.count || 0,
        totalFeedback: feedback.count || 0
      }
    };
  }

  static async resolveEmailByUsername(username: string): Promise<string | null> {
    const client = getSupabase();
    if (!client) return null;
    const { data } = await client
      .from('profiles')
      .select('private:user_private_info(email)')
      .eq('username', username.toLowerCase().trim())
      .maybeSingle();
    const privateInfo = data?.private as any;
    return privateInfo?.email || privateInfo?.[0]?.email || null;
  }

  static async signIn(identifier: string, pass: string) {
    const client = getSupabase();
    if (!client) throw new Error("Registry is offline.");
    // Rate limiting: 5 attempts per minute per identifier
    if (!rateLimiter.check(`auth_signin_${identifier.toLowerCase().trim()}`)) {
      throw new Error("Too many login attempts. Please wait a moment and try again.");
    }
    let email = sanitizeInput(identifier.trim(), 100);
    if (!identifier.includes('@')) {
      email = await this.resolveEmailByUsername(identifier) || email;
      if (!email.includes('@')) throw new Error("No Verto found with that username.");
    }
    const authResponse = await client.auth.signInWithPassword({ email, password: pass });
    if (authResponse.error) throw authResponse.error;
    return authResponse;
  }

  static async signUp(email: string, pass: string, username: string, regNo: string, university: string) {
    const client = getSupabase();
    if (!client) throw new Error("Registry is offline.");
    
    // Rate limiting: 3 signup attempts per 2 minutes per email
    if (!rateLimiter.check(`auth_signup_${email.toLowerCase().trim()}`, 3, 120000)) {
      throw new Error("Too many signup attempts. Please wait a moment and try again.");
    }

    const cleanUsername = sanitizeInput(username.toLowerCase().trim(), 15);
    const cleanEmail = sanitizeInput(email.trim(), 100);
    // Restoration of strict LPU requirement: 8 digits, numeric only.
    const cleanRegNo = sanitizeInput(regNo.replace(/[^0-9]/g, ''), 8);



    const result = await client.auth.signUp({
      email: cleanEmail,
      password: pass,
      options: {
        data: { 
          username: cleanUsername, 
          registration_number: cleanRegNo, 
          is_verified: 'yes'
        },
        emailRedirectTo: window.location.origin
      }
    });

    if (result.error) {

      
      // If user already exists, we might still want to try and update their profile
      if (result.error.message.toLowerCase().includes('already registered')) {

         // Try to sign in to get the session/user ID
         const loginRes = await client.auth.signInWithPassword({ email: cleanEmail, password: pass });
         if (!loginRes.error && loginRes.data.user) {

            await this.ensureProfile(loginRes.data.user, { 
              username: cleanUsername, 
              registration_number: cleanRegNo
            });
            return loginRes;
         }
      }
      return result;
    }

    if (result.data?.user) {

      try {
        // Create full profile immediately to avoid race conditions
        // We use a safe upsert: if some columns don't exist (400 error), we fall back to a minimal profile
        const publicProfile = {
          id: result.data.user.id,
          username: cleanUsername,
          is_verified: 'yes',
          is_admin: false,
          total_xp: 0,
          level: 1,
          level_title: 'Beginner',
          current_streak: 0,
          longest_streak: 0,
          last_active_date: new Date().toISOString().split('T')[0]
        };

        const { error: profileError } = await client.from('profiles').upsert(publicProfile, { onConflict: 'id' });
        if (profileError) {
          console.error("[NexusServer] Public profile upsert failed:", profileError);
        }

        const privateProfile: any = {
          id: result.data.user.id,
          email: cleanEmail,
        };
        if (cleanRegNo) {
          privateProfile.registration_number = cleanRegNo;
        }

        const { error: privateError } = await client.from('user_private_info').upsert(privateProfile, { onConflict: 'id' });
        if (privateError) {
          if (privateError.code === '23505' || privateError.message?.includes('unique_registration_number')) {
            console.warn("[NexusServer] Registration number conflict, retrying without it...");
            const { registration_number, ...privateWithoutReg } = privateProfile;
            await client.from('user_private_info').upsert(privateWithoutReg, { onConflict: 'id' });
          } else {
            console.error("[NexusServer] Private profile upsert failed:", privateError);
          }
        }
      } catch (e) {
        console.warn("[NexusServer] Signup sync catch-all error:", e);
      }
    }

    return result;
  }

  static async signOut() {
    const client = getSupabase();
    if (!client) return;
    await client.auth.signOut();
  }

  static async updatePassword(newPassword: string, oldPassword?: string) {
    const client = getSupabase();
    if (!client) throw new Error("Supabase not configured.");
    
    // If oldPassword is provided, verify it first by trying a silent re-auth
    if (oldPassword) {
      const { data: { user } } = await client.auth.getUser();
      if (user?.email) {
        const { error: signInError } = await client.auth.signInWithPassword({
          email: user.email,
          password: oldPassword,
        });
        if (signInError) throw new Error("Verification failed: Current password is incorrect.");
      }
    }

    const { error } = await client.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }

  static async deleteAccount(userId: string) {
    const client = getSupabase();
    if (!client) throw new Error("Supabase not configured.");
    
    // Get current session for authentication
    const { data: { session } } = await client.auth.getSession();
    if (!session) throw new Error("No active session found. Please re-login.");

    const response = await fetch('/api/delete-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ userId })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to permanently delete account.");
    }

    // Logout locally
    await client.auth.signOut();
  }


  static async getSession() {
    const client = getSupabase();
    if (!client) return { data: { session: null }, error: new Error("Offline") };
    return await client.auth.getSession();
  }

  static async setSession(access_token: string, refresh_token: string) {
    const client = getSupabase();
    if (!client) throw new Error("Registry is offline.");
    return await client.auth.setSession({ access_token, refresh_token });
  }

  static onAuthStateChange(callback: (user: any) => void) {
    const client = getSupabase();
    if (!client) return () => { };
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      // Logic for handling profile sync on specific events can go here if needed
      callback(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }

  static async getProfile(userId: string): Promise<UserProfile | null> {
    const client = getSupabase();
    if (!client || !userId) return null;
    const { data: profile, error } = await client.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) {
      console.error('Get Profile Error:', error);
      throw error;
    }
    if (!profile) return null;
    const { data: privateInfo } = await client.from('user_private_info').select('email, registration_number').eq('id', userId).maybeSingle();
    return { ...profile, ...privateInfo };
  }

  static async ensureProfile(user: User, overrides?: { username?: string, registration_number?: string }): Promise<UserProfile> {
    const client = getSupabase();
    if (!client) throw new Error("Registry offline.");

    const [profileRes, privateRes] = await Promise.all([
      client.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      client.from('user_private_info').select('email, registration_number').eq('id', user.id).maybeSingle()
    ]);

    if (profileRes.error) {
      console.error("[NexusServer] Error checking existing profile:", profileRes.error);
      throw profileRes.error;
    }

    const existing = profileRes.data ? { ...profileRes.data, ...(privateRes.data || {}) } : null;
    
    const metadata = {
      ...(user as any).raw_user_meta_data,
      ...user.user_metadata,
      ...overrides
    };

    const isVerifiedInMeta = 
      !!user.email_confirmed_at || 
      metadata.is_verified === 'yes' || 
      metadata.is_verified === true || 
      metadata.isVerified === 'yes' || 
      metadata.isVerified === true ||
      metadata.verification_status === 'verified' ||
      user.app_metadata?.is_verified === true;

    if (existing) {
      let needsProfileUpdate = false;
      let needsPrivateUpdate = false;
      const profileUpdates: any = {};
      const privateUpdates: any = {};

      if ((!existing.is_verified || existing.is_verified === 'no') && isVerifiedInMeta) {
        profileUpdates.is_verified = 'yes';
        needsProfileUpdate = true;
      }

      if ((!existing.username || existing.username.startsWith('verto_')) && metadata.username) {
        profileUpdates.username = metadata.username;
        needsProfileUpdate = true;
      }
      
      if (!existing.registration_number && metadata.registration_number) {
        privateUpdates.registration_number = metadata.registration_number;
        needsPrivateUpdate = true;
      }

      if (needsProfileUpdate) {
        await client.from('profiles').update(profileUpdates).eq('id', user.id);
      }
      if (needsPrivateUpdate) {
        await client.from('user_private_info').update(privateUpdates).eq('id', user.id);
      }

      return {
        ...existing,
        ...profileUpdates,
        ...privateUpdates
      };
    }

    const publicNew = {
      id: user.id,
      username: metadata.username || user.email?.split('@')[0] || `verto_${user.id.slice(0, 5)}`,
      avatar_url: metadata.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${metadata.username || user.id || Math.random().toString()}`,
      is_admin: false,
      total_xp: 0,
      level: 1,
      level_title: 'Beginner',
      current_streak: 0,
      longest_streak: 0,
      last_active_date: new Date().toISOString().split('T')[0], 
      is_verified: isVerifiedInMeta ? 'yes' : 'no'
    };

    const privateNew = {
      id: user.id,
      email: user.email!,
      registration_number: metadata.registration_number || null
    };

    const { data: finalProfile, error: pError } = await client.from('profiles').insert(publicNew).select().maybeSingle();
    if (pError) {
      console.error("[NexusServer] Profile creation error:", pError);
      throw pError;
    }

    const { error: privError } = await client.from('user_private_info').insert(privateNew);
    if (privError) {
      console.error("[NexusServer] Private info creation error:", privError);
    }

    console.log(`[NexusServer] Profile created successfully for ${user.id}`);
    return {
      ...(finalProfile || publicNew),
      ...privateNew
    };
  }

  static async collectReward(userId: string, frameId: string) {
    const client = getSupabase();
    if (!client) return [];

    // Get current profile
    const { data: profile } = await client
      .from('profiles')
      .select('unlocked_frames')
      .eq('id', userId)
      .maybeSingle();

    const currentUnlocked = profile?.unlocked_frames || [];
    if (!currentUnlocked.includes(frameId)) {
      const updatedUnlocked = [...currentUnlocked, frameId];
      const { error } = await client
        .from('profiles')
        .update({ unlocked_frames: updatedUnlocked })
        .eq('id', userId);

      if (error) throw error;
      return updatedUnlocked;
    }
    return currentUnlocked;
  }

  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const client = getSupabase();
    if (!client || !userId) return;

    const { registration_number, email, ...profileUpdates } = updates as any;

    if (Object.keys(profileUpdates).length > 0) {
      const { error } = await client.from('profiles').update(profileUpdates).eq('id', userId);
      if (error) throw error;
    }

    const privateUpdates: any = {};
    if (registration_number !== undefined) privateUpdates.registration_number = registration_number;
    if (email !== undefined) privateUpdates.email = email;

    if (Object.keys(privateUpdates).length > 0) {
      const { error } = await client.from('user_private_info').update(privateUpdates).eq('id', userId);
      if (error) throw error;
    }
  }

  static async fetchLeaderboard(subjectId?: string): Promise<any[]> {
    const client = getSupabase();
    if (!client) return [];
    
    if (subjectId) {
      const { data, error } = await client
        .from('profiles')
        .select('username, avatar_url, level, level_title, subject_contributions')
        .not('subject_contributions', 'is', null);
        
      if (error) {
        console.error('Fetch Subject Leaderboard Error:', error);
        return [];
      }
      
      return (data || [])
        .map(row => {
          const contribs = row.subject_contributions || {};
          const subjectData = contribs[subjectId] || {};
          return {
            username: row.username,
            avatar_url: row.avatar_url,
            level: row.level,
            level_title: row.level_title,
            total_xp: Number(subjectData.xp || 0),
            posts_count: Number(subjectData.posts_count || 0),
            requests_count: Number(subjectData.requests_count || 0),
            files_count: Number(subjectData.files_count || 0)
          };
        })
        .filter(item => item.total_xp > 0)
        .sort((a, b) => b.total_xp - a.total_xp)
        .slice(0, 10);
    }

    const { data, error } = await client
      .from('profiles')
      .select('username, total_xp, level, level_title')
      .gt('total_xp', 0)
      .order('total_xp', { ascending: false })
      .limit(10);
    if (error) {
      console.error('Fetch Leaderboard Error:', error);
      return [];
    }
    return data || [];
  }

  static async fetchModerators(): Promise<any[]> {
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client
      .from('profiles')
      .select('username, is_admin')
      .eq('is_admin', true)
      .limit(10);
    if (error) {
      console.error('Fetch Moderators Error:', error);
      return [];
    }
    return data || [];
  }

  static async fetchMembersCount(program: string): Promise<number> {
    const client = getSupabase();
    if (!client) return 0;
    const { count, error } = await client
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    if (error) {
      console.error('Fetch Members Count Error:', error);
      return 2430;
    }
    return count || 0;
  }

  static sanitizeStoragePath(name: string): string {
    return name.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  static async uploadAvatar(userId: string, file: File): Promise<string> {
    const client = getSupabase();
    if (!client) throw new Error("Registry offline.");
    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${userId}/${Math.random()}.${this.sanitizeStoragePath(fileExt || 'png')}`;
    const { error: uploadError } = await client.storage.from('nexus-documents').upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = client.storage.from('nexus-documents').getPublicUrl(filePath);
    await this.updateProfile(userId, { avatar_url: publicUrl });
    return publicUrl;
  }

  static async fetchFolders(program: string): Promise<Folder[]> {
    const client = getSupabase();
    if (!client) return [];
    let query = client.from('library_items').select('*').neq('type', 'file');
    if (program && program !== 'All') query = query.eq('program', program);
    
    // Primary sort: display_order, Secondary sort: name
    const { data } = await query
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true });
      
    return data || [];
  }

  static async reorderFolders(folderOrders: { id: string, order: number }[]) {
    try {
      const client = getSupabase();
      if (!client) return;

      const updates = folderOrders.map(item =>
        client.from('library_items').update({ display_order: item.order }).eq('id', item.id.split('-dup-')[0])
      );

      const results = await Promise.all(updates);
      const firstError = results.find(r => r.error);
      if (firstError) {
        console.warn("Folder reorder failed:", firstError.error);
      }
    } catch (e) {
      console.warn("Folder reorder exception:", e);
    }
  }

  static async createFolder(name: string, type: 'semester' | 'subject' | 'category', parentId: string | null, program: string, iconName?: string, color?: string) {
    const client = getSupabase();
    if (!client) return;
    
    const { error } = await client.from('library_items').insert([{
      name,
      type,
      parent_id: parentId,
      program,
      icon_name: iconName || 'Folder',
      color: color || '#ff7a00'
    }]);
    
    if (error) {
      console.error("Create Folder Error:", error);
      throw new Error(error.message);
    }
  }

  static async renameFolder(folder: Folder, newName: string, iconName?: string, color?: string, allFolders: Folder[] = []) {
    const client = getSupabase();
    if (!client) return;
    
    const dbId = folder.id.split('-dup-')[0];
    const updateData: any = { name: newName };
    if (iconName !== undefined) updateData.icon_name = iconName;
    if (color !== undefined) updateData.color = color;
    
    const { error } = await client.from('library_items').update(updateData).eq('id', dbId);
    if (error) {
      console.error("Rename Folder Error:", error);
      throw new Error(error.message);
    }
  }

  static async deleteFolder(id: string) {
    const client = getSupabase();
    if (!client) return;
    const dbId = id.split('-dup-')[0];
    const { error } = await client.from('library_items').delete().eq('id', dbId);
    if (error) {
      console.error("Delete Folder Error:", error);
      throw new Error(error.message);
    }
  }

  static async fetchFiles(program: string, q?: string): Promise<LibraryFile[]> {
    const client = getSupabase();
    if (!client) return [];
    let query = client.from('documents').select('*, uploader:profiles!uploader_id(username, is_admin)').eq('status', 'approved');
    if (program && program !== 'All') query = query.eq('program', program);
    if (q) query = query.ilike('name', `%${q}%`);
    const { data, error } = await query
      .order('created_at', { ascending: false });
    if (error) { console.error("Fetch Error:", error); return []; }
    return (data || []).map(item => ({
      id: item.id, name: item.name, subject: item.subject, semester: item.semester, type: item.type,
      uploadDate: new Date(item.created_at).getTime(), size: item.size, status: item.status, storage_path: item.storage_path,
      program: item.program,
      uploader_username: (item.uploader as any)?.username || "Anonymous Verto",
      uploader_is_admin: (item.uploader as any)?.is_admin || false,
      description: item.description,
      admin_notes: item.admin_notes,
      display_order: item.display_order,
      folder_id: item.folder_id,
      faculty_name: item.faculty_name,
      faculty_id: item.faculty_id,
      verified_status: item.verified_status,
      difficulty: item.difficulty,
      exam_type: item.exam_type,
      tags: item.tags,
      upvoted_by: item.upvoted_by,
      downvoted_by: item.downvoted_by,
      downloads: item.downloads
    }));
  }

  static async fetchFileById(id: string): Promise<LibraryFile | null> {
    const client = getSupabase();
    if (!client || !id) return null;
    const { data, error } = await client
      .from('documents')
      .select('*, uploader:profiles!uploader_id(username, is_admin)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error(`Fetch File By Id Error (${id}):`, error);
      return null;
    }
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      subject: data.subject,
      semester: data.semester,
      type: data.type,
      uploadDate: new Date(data.created_at).getTime(),
      size: data.size,
      status: data.status,
      storage_path: data.storage_path,
      uploader_username: (data.uploader as any)?.username || "Anonymous Verto",
      uploader_is_admin: (data.uploader as any)?.is_admin || false,
      description: data.description,
      admin_notes: data.admin_notes,
      display_order: data.display_order,
      program: data.program,
      folder_id: data.folder_id,
      faculty_name: data.faculty_name,
      faculty_id: data.faculty_id,
      verified_status: data.verified_status,
      difficulty: data.difficulty,
      exam_type: data.exam_type,
      tags: data.tags,
      upvoted_by: data.upvoted_by,
      downvoted_by: data.downvoted_by,
      downloads: data.downloads
    };
  }

  static async uploadFile(file: File, name: string, desc: string, sub: string, sem: string, type: string, uid: string, admin: boolean, program: string) {
    const client = getSupabase();
    if (!client) return;

    // Resolve category folder dynamically
    const allFolders = await this.fetchFolders(program);
    let semFolder = allFolders.find(f => f.type === 'semester' && f.name.trim() === sem.trim() && f.program === program);
    if (!semFolder) {
      await this.createFolder(sem.trim(), 'semester', null, program);
      const fresh = await this.fetchFolders(program);
      semFolder = fresh.find(f => f.type === 'semester' && f.name.trim() === sem.trim() && f.program === program);
    }
    let subjFolder = allFolders.find(f => f.type === 'subject' && f.name.trim() === sub.trim() && f.parent_id === semFolder?.id);
    if (!subjFolder && semFolder) {
      await this.createFolder(sub.trim(), 'subject', semFolder.id, program);
      const fresh = await this.fetchFolders(program);
      subjFolder = fresh.find(f => f.type === 'subject' && f.name.trim() === sub.trim() && f.parent_id === semFolder.id);
    }
    let catFolder = allFolders.find(f => f.type === 'category' && f.name.trim() === type.trim() && f.parent_id === subjFolder?.id);
    if (!catFolder && subjFolder) {
      await this.createFolder(type.trim(), 'category', subjFolder.id, program);
      const fresh = await this.fetchFolders(program);
      catFolder = fresh.find(f => f.type === 'category' && f.name.trim() === type.trim() && f.parent_id === subjFolder.id);
    }

    const cleanName = this.sanitizeStoragePath(file.name);
    const path = `community/${Math.random().toString(36).substring(7)}_${cleanName}`;
    const { error: storageErr } = await client.storage.from('nexus-documents').upload(path, file);
    if (storageErr) throw storageErr;

    const { error: dbErr } = await client.from('library_items').insert([{
      name, description: desc, parent_id: catFolder?.id || null, type: 'file',
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`, storage_path: path,
      uploader_id: uid, status: admin ? 'approved' : 'pending',
      program: program.trim()
    }]);
    if (dbErr) throw dbErr;
  }

  static getAnonSessionId(): string {
    if (typeof window === 'undefined') return 'anon-server';
    let anonId = localStorage.getItem('nexus_anon_session_id');
    if (!anonId) {
      // Use a proper UUID format for database compatibility
      anonId = crypto.randomUUID();
      localStorage.setItem('nexus_anon_session_id', anonId);
    }
    return anonId;
  }

  static async fetchRecords(uid: string | null, type: string) {
    if (!uid) {
      // Guest User: read from localStorage
      try {
        const localData = localStorage.getItem('nexus_local_records');
        const list = localData ? JSON.parse(localData) : [];
        return list.filter((r: any) => r.type === type);
      } catch (e) {
        console.error('Error parsing local guest records:', e);
        return [];
      }
    }

    try {
      const stats = await this.fetchStudyStats(uid);
      if (stats && stats.recent_activities && Array.isArray(stats.recent_activities)) {
        return stats.recent_activities.filter((r: any) => r.type === type);
      }
    } catch (e) {
      console.error('Error fetching records via study tracker:', e);
    }
    return [];
  }

  static async fetchRecordById(id: string): Promise<any | null> {
    // 1. Try to check local guest storage first
    try {
      const localData = localStorage.getItem('nexus_local_records');
      const list = localData ? JSON.parse(localData) : [];
      const localMatch = list.find((r: any) => r.id === id);
      if (localMatch) return localMatch;
    } catch (e) {
      console.error('Error checking local guest records:', e);
    }

    // 2. Fetch authenticated user stats and search array
    try {
      const sessionRes = await this.getSession();
      const userId = sessionRes?.data?.session?.user?.id;
      if (userId) {
        const stats = await this.fetchStudyStats(userId);
        if (stats && stats.recent_activities && Array.isArray(stats.recent_activities)) {
          return stats.recent_activities.find((r: any) => r.id === id) || null;
        }
      }
    } catch (e) {
      console.error('Error fetching record by ID via study tracker:', e);
    }
    return null;
  }

  static async saveRecord(uid: string | null, type: string, label: string, content: any): Promise<any | null> {
    const session_id = this.getAnonSessionId();
    const recordId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2) + Date.now().toString(36);
    const record = {
      id: recordId,
      user_id: uid || null,
      session_id: session_id,
      type,
      label,
      content,
      created_at: new Date().toISOString()
    };

    if (!uid) {
      // Guest: Save locally
      try {
        const localData = localStorage.getItem('nexus_local_records');
        const list = localData ? JSON.parse(localData) : [];
        if (type === 'timetable_main') {
          // Keep only one timetable for guests
          const filtered = list.filter((r: any) => r.type !== 'timetable_main');
          filtered.unshift(record);
          localStorage.setItem('nexus_local_records', JSON.stringify(filtered.slice(0, 50)));
        } else {
          list.unshift(record);
          localStorage.setItem('nexus_local_records', JSON.stringify(list.slice(0, 50)));
        }
        return record;
      } catch (e) {
        console.error('Error saving local guest record:', e);
        return record;
      }
    }

    try {
      const sessionRes = await this.getSession();
      const token = sessionRes?.data?.session?.access_token;
      if (!token) return record;

      const response = await fetch('/api/study-tracker', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'save_record',
          type,
          label,
          content
        })
      });

      if (response.ok) {
        const resData = await response.json();
        return resData?.data || record;
      }
    } catch (e) {
      console.error('Failed to save record via study tracker:', e);
    }
    return record;
  }

  static async updateRecord(id: string, content: any): Promise<any | null> {
    // 1. Try local guest storage first
    try {
      const localData = localStorage.getItem('nexus_local_records');
      if (localData) {
        const list = JSON.parse(localData);
        let found = false;
        const updatedList = list.map((r: any) => {
          if (r.id === id) {
            found = true;
            return { ...r, content, updated_at: new Date().toISOString() };
          }
          return r;
        });
        if (found) {
          localStorage.setItem('nexus_local_records', JSON.stringify(updatedList));
          return updatedList.find((r: any) => r.id === id);
        }
      }
    } catch (e) {
      console.error('Error updating local guest record:', e);
    }

    try {
      const sessionRes = await this.getSession();
      const token = sessionRes?.data?.session?.access_token;
      if (!token) return null;

      const response = await fetch('/api/study-tracker', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'update_record',
          id,
          content
        })
      });

      if (response.ok) {
        const resData = await response.json();
        return resData?.data || null;
      }
    } catch (e) {
      console.error('Failed to update record via study tracker:', e);
    }
    return null;
  }

  static async deleteRecord(id: string, type: string, uid: string | null) {
    if (!uid) {
      // Guest: Delete locally
      try {
        const localData = localStorage.getItem('nexus_local_records');
        if (localData) {
          const list = JSON.parse(localData);
          const filtered = list.filter((r: any) => r.id !== id);
          localStorage.setItem('nexus_local_records', JSON.stringify(filtered));
        }
      } catch (e) {
        console.error('Error deleting local guest record:', e);
      }
      return;
    }

    try {
      const sessionRes = await this.getSession();
      const token = sessionRes?.data?.session?.access_token;
      if (!token) return;

      await fetch('/api/study-tracker', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'delete_record',
          id
        })
      });
    } catch (e) {
      console.error('Failed to delete record via study tracker:', e);
    }
  }

  static async checkUsernameAvailability(username: string): Promise<boolean> {
    const client = getSupabase();
    if (!client) return true;
    const { data } = await client.from('profiles').select('username').eq('username', username.toLowerCase().trim()).maybeSingle();
    return !data;
  }

  static async checkRegistrationAvailability(regNo: string): Promise<boolean> {
    const client = getSupabase();
    if (!client) return true;
    const cleanRegNo = regNo.replace(/[^0-9]/g, '');
    if (cleanRegNo.length === 0) return true;
    const { data } = await client.from('user_private_info').select('registration_number').eq('registration_number', cleanRegNo).maybeSingle();
    return !data;
  }

  static async submitFeedback(text: string, uid?: string, email?: string) {
    const client = getSupabase();
    const sanitizedText = sanitizeInput(text, 2000);
    if (!sanitizedText) return;
    if (client) await client.from('feedback').insert([{ text: sanitizedText, user_id: uid, user_email: email }]);
  }

  static async downloadFile(path: string): Promise<Blob> {
    const client = getSupabase();
    if (!client) throw new Error("Registry is offline.");
    const { data, error } = await client.storage.from('nexus-documents').download(path);
    if (error) throw error;
    return data;
  }

  static getFileUrl(path: string, token?: string) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    let url = `${baseUrl}/api/vault?path=${encodeURIComponent(path)}`;
    if (token) {
      url += `&token=${encodeURIComponent(token)}`;
    }
    return url;
  }

  static async deleteFile(id: string, path: string) {
    const client = getSupabase();
    if (client) {
      await client.from('library_items').delete().eq('id', id);
      await client.storage.from('nexus-documents').remove([path]);
    }
  }

  static async approveFile(id: string) {
    const client = getSupabase();
    if (client) await client.from('library_items').update({ status: 'approved' }).eq('id', id);
  }

  static async rejectFile(id: string) {
    const client = getSupabase();
    if (client) await client.from('library_items').delete().eq('id', id);
  }

  static async demoteFile(id: string) {
    const client = getSupabase();
    if (client) await client.from('library_items').update({ status: 'pending' }).eq('id', id);
  }

  static async requestUpdate(id: string, metadata: any, admin: boolean) {
    const client = getSupabase();
    if (client) await client.from('library_items').update(admin ? metadata : { pending_update: metadata }).eq('id', id);
  }

  static async fetchPendingFiles(program: string, q?: string): Promise<LibraryFile[]> {
    const client = getSupabase();
    if (!client) return [];
    let query = client.from('documents').select('*, uploader:profiles!uploader_id(username, is_admin)').eq('status', 'pending');
    if (program && program !== 'All') query = query.eq('program', program);
    if (q) query = query.ilike('name', `%${q}%`);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) { console.error("Fetch Pending Error:", error); return []; }
    return (data || []).map(item => ({
      id: item.id, name: item.name, subject: item.subject, semester: item.semester, type: item.type,
      uploadDate: new Date(item.created_at).getTime(), size: item.size, status: item.status, storage_path: item.storage_path,
      uploader_username: (item.uploader as any)?.username || "Anonymous Verto",
      description: item.description,
      admin_notes: item.admin_notes,
      program: item.program,
      folder_id: item.folder_id,
      faculty_name: item.faculty_name,
      faculty_id: item.faculty_id,
      verified_status: item.verified_status,
      difficulty: item.difficulty,
      exam_type: item.exam_type,
      tags: item.tags,
      upvoted_by: item.upvoted_by,
      downvoted_by: item.downvoted_by,
      downloads: item.downloads
    }));
  }

  static async fetchUserFiles(uid: string): Promise<LibraryFile[]> {
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client.from('documents').select('*, uploader:profiles!uploader_id(username, is_admin)').eq('uploader_id', uid).order('created_at', { ascending: false });
    if (error) { console.error("Fetch User Files Error:", error); return []; }
    return (data || []).map(item => ({
      id: item.id, name: item.name, subject: item.subject, semester: item.semester, type: item.type,
      uploadDate: new Date(item.created_at).getTime(), size: item.size, status: item.status, storage_path: item.storage_path,
      uploader_username: (item.uploader as any)?.username || "Anonymous Verto",
      description: item.description,
      admin_notes: item.admin_notes,
      program: item.program,
      folder_id: item.folder_id,
      faculty_name: item.faculty_name,
      faculty_id: item.faculty_id,
      verified_status: item.verified_status,
      difficulty: item.difficulty,
      exam_type: item.exam_type,
      tags: item.tags,
      upvoted_by: item.upvoted_by,
      downvoted_by: item.downvoted_by,
      downloads: item.downloads
    }));
  }

  static async reorderFiles(fileOrders: { id: string, order: number }[]) {
    try {
      const client = getSupabase();
      if (!client) return;

      const updates = fileOrders.map(item =>
        client.from('library_items').update({ display_order: item.order }).eq('id', item.id)
      );

      const results = await Promise.all(updates);
      const firstError = results.find(r => r.error);
      if (firstError) {
        console.warn("Reorder failed:", firstError.error);
      }
    } catch (e) {
      console.warn("Reorder exception:", e);
    }
  }

  /**
   * Question Management: Reporting and Editing
   */
  static async reportQuestion(params: { questionId: string, userId: string, reason: string, subject?: string }) {
    const client = getSupabase();
    if (!client) return;
    const sanitizedReason = sanitizeInput(params.reason, 1000);
    const { error } = await client.from('question_reports').insert([{
      question_id: params.questionId,
      user_id: params.userId,
      reason: sanitizedReason,
      subject: params.subject,
      status: 'pending'
    }]);
    if (error) {
      console.error('Report Question Error:', error);
      throw error;
    }
  }

  /**
   * Saves a question to the database using upsert logic.
   * If an ID is present, it will update the existing record or create it if not found.
   * If no ID is present, a new record is created with a generated ID.
   */
  static async saveQuestion(q: Partial<QuizQuestion>) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase client not initialized');
    
    // Transform from app format to DB format (snake_case)
    const dbRow: any = {
      topic: q.topic || '',
      difficulty: q.difficulty || 'medium',
      question_type: q.questionType || 'MCQ',
      type: q.type || 'mcq',
      question: q.question || '',
      options: Array.isArray(q.options) ? q.options : [],
      correct_answer: q.correctAnswer ?? 0,
      explanation: q.explanation || '',
      starter_code: q.starterCode || '',
      test_cases: Array.isArray(q.testCases) ? q.testCases : [],
      subject: (q as any).subject || '',
      unit: (typeof (q as any).unit === 'string' && (q as any).unit.trim() !== '') ? parseInt((q as any).unit) : (typeof (q as any).unit === 'number' ? (q as any).unit : null)
    };

    if (q.id) {
        dbRow.id = q.id;
    }

    console.log('NexusServer: Saving question (upsert)', dbRow);

    const { data, error } = await client
      .from('questions')
      .upsert(dbRow, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('Save Question Error:', error);
      throw error;
    }
    
    console.log('NexusServer: Save successful:', data);
    return data?.[0];
  }

  // Legacy/Shortcut wrappers
  static async updateQuestion(q: QuizQuestion) {
      return this.saveQuestion(q);
  }

  static async createQuestion(q: Partial<QuizQuestion>) {
      return this.saveQuestion(q);
  }

  static async fetchQuestionReports() {
    const client = getSupabase();
    if (!client) return [];
    try {
      // Direct fetch without joins which often fail due to Postgres FK constraints in Edge Functions
      const { data: reportsData, error: reportsError } = await client
        .from('question_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;
      
      const reports = reportsData || [];
      if (reports.length === 0) return [];

      // 1. Fetch related questions
      const questionIds = [...new Set(reports.map((r: any) => r.question_id).filter((id: any) => !!id))];
      const questionsMap = new Map();
      if (questionIds.length > 0) {
        const { data: qData } = await client.from('questions').select('*').in('id', questionIds);
        if (qData) {
          qData.forEach((q: any) => questionsMap.set(q.id, q));
        }
      }

      // 2. Fetch related profiles (reporters)
      const userIds = [...new Set(reports.map((r: any) => r.user_id).filter((id: any) => !!id))];
      const profilesMap = new Map();
      if (userIds.length > 0) {
        const { data: pData } = await client.from('profiles').select('id, username').in('id', userIds);
        if (pData) {
          pData.forEach((p: any) => profilesMap.set(p.id, p));
        }
      }

      // 3. Assemble
      return reports.map((r: any) => ({
        ...r,
        question: questionsMap.get(r.question_id) || null,
        reporter: profilesMap.get(r.user_id) || { username: 'Guest user' }
      }));
    } catch (e) {
      console.error('Fetch question reports failed:', e);
      return [];
    }
  }

  static async updateReportStatus(reportId: string, status: string) {
    const client = getSupabase();
    if (!client) return;
    const { error } = await client
      .from('question_reports')
      .update({ status })
      .eq('id', reportId);
    if (error) {
      console.error('Update Report Status Error:', error);
      throw error;
    }
  }

  static async fetchFeedback() {
    const client = getSupabase();
    if (!client) return [];
    
    // First, try to fetch feedback directly
    const { data: feedbackData, error } = await client
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Fetch Feedback Error:', error);
      return [];
    }

    const feedbacks = feedbackData || [];

    // Collect all unique user IDs
    const userIds = [...new Set(feedbacks.map(f => f.user_id).filter(id => !!id))];
    
    // Fetch their profiles
    let profilesMap: Record<string, any> = {};
    if (userIds.length > 0) {
        const { data: profiles } = await client
            .from('profiles')
            .select('id, username')
            .in('id', userIds);
            
        if (profiles) {
            profilesMap = profiles.reduce((acc, profile) => {
                acc[profile.id] = profile;
                return acc;
            }, {} as Record<string, any>);
        }
    }

    // Process strings -> JSON for replies if needed, and map user
    return feedbacks.map(f => {
        let parsedReplies = [];
        if (typeof f.replies === 'string') {
            try {
                parsedReplies = JSON.parse(f.replies);
            } catch (e) {
                parsedReplies = [];
            }
        } else if (Array.isArray(f.replies)) {
            parsedReplies = f.replies;
        }

        return {
            ...f,
            user: f.user_id ? (profilesMap[f.user_id] || null) : null,
            replies: parsedReplies
        };
    });
  }

  static async updateFeedback(id: string, updates: any) {
    const client = getSupabase();
    if (!client) return;
    const { error } = await client.from('feedback').update(updates).eq('id', id);
    if (error) throw error;
  }

  /**
   * Marketplace Methods
   */
  static async fetchMarketplaceItems(): Promise<any[]> {
    try {
      const response = await fetch('/api/gateway?action=marketplace');
      if (!response.ok) throw new Error("Failed to fetch marketplace.");
      const data = await response.json();
      return (data || []).map((item: any) => ({
        ...item,
        seller_username: item.seller?.username || 'Nexus Scholar',
        seller_avatar: item.seller?.avatar_url,
        seller_is_admin: false
      }));
    } catch (e) {
      console.error("Marketplace fetch error:", e);
      return [];
    }
  }

  static async createMarketplaceItem(item: any) {
    const client = getSupabase();
    if (!client) return;
    // Sanitize user-provided text fields
    const sanitized = {
      ...item,
      title: item.title ? sanitizeInput(item.title, 100) : item.title,
      description: item.description ? sanitizeInput(item.description, 1000) : item.description,
      contact_info: item.contact_info ? sanitizeInput(item.contact_info, 200) : item.contact_info,
    };
    const { error } = await client.from('marketplace_items').insert([sanitized]);
    if (error) throw error;
  }

  static async updateMarketplaceItem(id: string, updates: any) {
    const client = getSupabase();
    if (!client) return;
    const { error } = await client.from('marketplace_items').update(updates).eq('id', id);
    if (error) throw error;
  }

  static async deleteMarketplaceItem(id: string) {
    const client = getSupabase();
    if (!client) return;
    const { error } = await client.from('marketplace_items').delete().eq('id', id);
    if (error) throw error;
  }

  static async uploadMarketplaceImage(file: File, path: string): Promise<string> {
    const client = getSupabase();
    if (!client) throw new Error("Registry offline.");
    const { error: uploadError } = await client.storage.from('nexus-documents').upload(path, file);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = client.storage.from('nexus-documents').getPublicUrl(path);
    return publicUrl;
  }

  /**
   * Roommate Finder Methods
   */
  static async fetchRoommateRequests(): Promise<any[]> {
    try {
      const response = await fetch('/api/gateway?action=roommates');
      if (!response.ok) throw new Error("Failed to fetch roommate requests.");
      const data = await response.json();
      return (data || []).map((item: any) => ({
        ...item,
        user_username: item.user?.username || 'Nexus Scholar',
        user_avatar: item.user?.avatar_url,
        user_is_admin: false
      }));
    } catch (e) {
      console.error("Roommate fetch error:", e);
      return [];
    }
  }

  static async createRoommateRequest(request: any) {
    const client = getSupabase();
    if (!client) return;
    // Sanitize user-provided text fields
    const sanitized = {
      ...request,
      description: request.description ? sanitizeInput(request.description, 1000) : request.description,
      preferences: request.preferences ? sanitizeInput(request.preferences, 500) : request.preferences,
      contact_info: request.contact_info ? sanitizeInput(request.contact_info, 200) : request.contact_info,
    };
    const { error } = await client.from('roommate_requests').insert([sanitized]);
    if (error) throw error;
  }

  static async updateRoommateRequest(id: string, updates: any) {
    const client = getSupabase();
    if (!client) return;
    const { error } = await client.from('roommate_requests').update(updates).eq('id', id);
    if (error) throw error;
  }

  static async deleteRoommateRequest(id: string) {
    const client = getSupabase();
    if (!client) return;
    const { error } = await client.from('roommate_requests').delete().eq('id', id);
    if (error) throw error;
  }

  /**
   * Notification Methods
   */
  static async fetchNotifications(userId: string): Promise<NexusNotification[]> {
    const client = getSupabase();
    if (!client || !userId) return [];
    const { data, error } = await client
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      console.error('Fetch Notifications Error:', error);
      return [];
    }
    return data || [];
  }

  static async markNotificationAsRead(notificationId: string) {
    const client = getSupabase();
    if (!client) return;
    const { error } = await client
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    if (error) throw error;
  }

  static async markAllNotificationsAsRead(userId: string) {
    const client = getSupabase();
    if (!client || !userId) return;
    const { error } = await client
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    if (error) throw error;
  }

  static subscribeToNotifications(userId: string, onNotification: (payload: any) => void) {
    const client = getSupabase();
    if (!client || !userId) return () => { };

    const channel = client
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          onNotification(payload.new);
        }
      )
      .subscribe();

    return () => {
      if (channel && channel.state !== 'closed') {
        client.removeChannel(channel).catch(() => { /* ignore cleanup race conditions */ });
      }
    };
  }

  static async fetchGlobalAnnouncements(): Promise<any[]> {
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client
      .from('announcements')
      .select('*')
      .eq('scope', 'global')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) {
      return [];
    }
    return (data || []).map(item => ({
      ...item,
      message: item.content
    }));
  }

  static subscribeToGlobalAnnouncements(onAnnouncement: (payload: any) => void) {
    const client = getSupabase();
    if (!client) return () => { };

    const channel = client
      .channel('public_announcements')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'announcements', filter: 'scope=eq.global' },
        (payload) => onAnnouncement({ ...payload.new, message: payload.new.content })
      )
      .subscribe();

    return () => {
      if (channel && channel.state !== 'closed') {
        client.removeChannel(channel).catch(() => { /* ignore cleanup race conditions */ });
      }
    };
  }

  static async sendGlobalAnnouncement(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', link?: string) {
    const client = getSupabase();
    if (!client) return;
    const sanitizedTitle = sanitizeInput(title, 200);
    const sanitizedMessage = sanitizeInput(message, 2000);
    const sanitizedLink = link ? sanitizeInput(link, 500) : undefined;
    const { error } = await client
      .from('announcements')
      .insert([{ scope: 'global', title: sanitizedTitle, content: sanitizedMessage, type, link: sanitizedLink }]);
    if (error) throw error;
  }

  static async fetchAllProfiles(): Promise<Partial<UserProfile>[]> {
    const client = getSupabase();
    if (!client) return [];

    try {
      const { data: { session } } = await client.auth.getSession();
      if (!session) throw new Error("No active session found.");

      const response = await fetch('/api/gateway?action=admin-profiles', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to fetch administrative profiles.");
      }

      return await response.json();
    } catch (error: any) {
      console.error('Fetch All Profiles Error:', error);
      return [];
    }
  }

  // Keep this for individual/targeted blasts if needed
  static async sendGlobalNotification(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', link?: string, targetUserIds?: string[]) {
    // Blast to target notification feeds
    const client = getSupabase();
    if (!client) return;
    
    let userIds = targetUserIds;
    if (!userIds) {
      const { data: users } = await client.from('profiles').select('id');
      if (!users) return;
      userIds = users.map(user => user.id);
    }
    
    if (userIds.length === 0) return;

    // Supabase can handle batch inserts. For very large numbers, we might need to chunk.
    const notifications = userIds.map(uid => ({ 
      user_id: uid, 
      title, 
      message, 
      type, 
      link, 
      read: false 
    }));

    // Chunking to avoid hitting payload limits (if > 1000 users)
    const chunkSize = 1000;
    for (let i = 0; i < notifications.length; i += chunkSize) {
      const chunk = notifications.slice(i, i + chunkSize);
      const { error } = await client.from('notifications').insert(chunk);
      if (error) throw error;
    }
  }

  /**
   * Nexus Originals Methods
   */
  static async fetchNexusOriginal(subject: string, semester: string, program: string): Promise<any | null> {
    const client = getSupabase();
    if (!client) return null;
    const { data, error } = await client
      .from('nexus_originals')
      .select('*')
      .eq('subject', subject)
      .eq('semester', semester)
      .eq('program', program)
      .maybeSingle();
    if (error && error.code !== 'PGRST116') {
      console.error("Fetch Originals Error:", error);
    }
    return data;
  }

  static async fetchAllNexusOriginals(program?: string, semester?: string): Promise<any[]> {
    const client = getSupabase();
    if (!client) return [];
    let query = client.from('nexus_originals').select('*');
    if (program) query = query.eq('program', program);
    if (semester) query = query.eq('semester', semester);
    
    const { data, error } = await query;
    if (error) {
      console.error("Fetch All Originals Error:", error);
      return [];
    }
    return data || [];
  }

  static async upsertNexusOriginal(subject: string, semester: string, program: string, content: any) {
    const client = getSupabase();
    if (!client) return;
    const { error } = await client.from('nexus_originals').upsert({
      subject,
      semester,
      program,
      content,
      last_updated: new Date().toISOString()
    }, { onConflict: 'subject,semester,program' });
    if (error) throw error;
  }

  static async searchUsers(query: string) {
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client
      .from('profiles')
      .select('id, username, avatar_url, total_xp, level')
      .ilike('username', `%${query}%`)
      .limit(5);
    if (error) {
      console.error("Search Users Error:", error);
      return [];
    }
    return data || [];
  }

  static async getUserDetailedActivity(userId: string) {
    const client = getSupabase();
    if (!client) return null;
    
    // Fetch profile, attempts, reports, feedback, and study stats
    const [profileRes, privateRes, attempts, reports, feedback, studyStats] = await Promise.all([
      client.from('profiles').select('*').eq('id', userId).maybeSingle(),
      client.from('user_private_info').select('email, registration_number').eq('id', userId).maybeSingle(),
      client.from('quiz_attempts').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
      client.from('question_reports').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
      client.from('feedback').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
      this.fetchStudyStats(userId)
    ]);
    const profile = profileRes.data ? { ...profileRes.data, ...(privateRes.data || {}) } : null;

    // Aggregate stats from studyStats directly
    const stats = {
      studyTime: studyStats ? ((studyStats.pdf_study_time || 0) + (studyStats.quiz_study_time || 0)) : 0,
      filesAccessed: studyStats ? (studyStats.files_accessed || 0) : 0,
      cgpaCalculations: studyStats ? (studyStats.cgpa_calculations || 0) : 0,
      quizzesCompleted: attempts.data ? attempts.data.length : 0,
      attendanceUpdates: studyStats ? (studyStats.attendance_updates || 0) : 0,
      marketplacePosts: studyStats ? (studyStats.marketplace_posts_count || 0) : 0,
      roommateRequests: studyStats ? (studyStats.roommate_requests_count || 0) : 0,
      placementAnalyses: studyStats ? (studyStats.resumes_analyzed || 0) : 0,
      history: studyStats?.recent_activities || []
    };

    return {
      profile: profile,
      attempts: attempts.data || [],
      reports: reports.data || [],
      feedback: feedback.data || [],
      historyStats: stats
    };
  }

  static async fetchStudyStats(targetUserId?: string) {
    try {
      const sessionRes = await this.getSession();
      const token = sessionRes?.data?.session?.access_token;
      if (!token) return null;

      const response = await fetch('/api/study-tracker', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'get_stats',
          targetUserId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch study statistics');
      }

      return await response.json();
    } catch (e) {
      console.error('[NexusServer] fetchStudyStats failed:', e);
      return null;
    }
  }

  static async incrementStudyStats(params: {
    pdfStudyTime?: number;
    quizStudyTime?: number;
    questionsAttempted?: number;
    resumesAnalyzed?: number;
    correctQuestions?: number;
    wrongQuestions?: number;
  }) {
    try {
      const sessionRes = await this.getSession();
      const token = sessionRes?.data?.session?.access_token;
      if (!token) return null;

      const response = await fetch('/api/study-tracker', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'increment',
          pdfStudyTime: params.pdfStudyTime || 0,
          quizStudyTime: params.quizStudyTime || 0,
          questionsAttempted: params.questionsAttempted || 0,
          resumesAnalyzed: params.resumesAnalyzed || 0,
          correctQuestions: params.correctQuestions || 0,
          wrongQuestions: params.wrongQuestions || 0
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update study statistics');
      }

      return await response.json();
    } catch (e) {
      console.error('[NexusServer] incrementStudyStats failed:', e);
      return null;
    }
  }

  static async updateDocumentProgress(documentId: string, progress: number, lastReadPage: number = 1): Promise<void> {
    try {
      const client = getSupabase();
      if (!client) return;
      const sessionRes = await this.getSession();
      const userId = sessionRes?.data?.session?.user?.id;
      if (!userId) return;

      // Fetch existing user_progress mapping
      const { data: item } = await client
        .from('library_items')
        .select('user_progress')
        .eq('id', documentId)
        .maybeSingle();

      const progressMap = item?.user_progress || {};
      progressMap[userId] = {
        progress_percentage: Math.min(100, Math.max(0, progress)),
        last_read_page: Math.max(1, lastReadPage),
        updated_at: new Date().toISOString()
      };

      const { error } = await client
        .from('library_items')
        .update({ user_progress: progressMap })
        .eq('id', documentId);

      if (error) {
        console.error('[NexusServer] updateDocumentProgress failed:', error);
      }
    } catch (e) {
      console.error('[NexusServer] updateDocumentProgress exception:', e);
    }
  }

  static async fetchUserDocumentProgress(): Promise<{ document_id: string; progress_percentage: number; last_read_page: number }[]> {
    try {
      const client = getSupabase();
      if (!client) return [];
      const sessionRes = await this.getSession();
      const userId = sessionRes?.data?.session?.user?.id;
      if (!userId) return [];

      const { data, error } = await client
        .from('library_items')
        .select('id, user_progress')
        .eq('type', 'file')
        .not('user_progress', 'is', null);

      if (error) {
        console.error('[NexusServer] fetchUserDocumentProgress failed:', error);
        return [];
      }

      const results: { document_id: string; progress_percentage: number; last_read_page: number }[] = [];
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item.user_progress && item.user_progress[userId]) {
            results.push({
              document_id: item.id,
              progress_percentage: item.user_progress[userId].progress_percentage || 0,
              last_read_page: item.user_progress[userId].last_read_page || 1
            });
          }
        });
      }
      return results;
    } catch (e) {
      console.error('[NexusServer] fetchUserDocumentProgress exception:', e);
      return [];
    }
  }

  static async fetchDocumentProgress(documentId: string): Promise<{ progress_percentage: number; last_read_page: number } | null> {
    try {
      const client = getSupabase();
      if (!client) return null;
      const sessionRes = await this.getSession();
      const userId = sessionRes?.data?.session?.user?.id;
      if (!userId) return null;

      const { data, error } = await client
        .from('library_items')
        .select('user_progress')
        .eq('id', documentId)
        .maybeSingle();

      if (error) {
        console.error('[NexusServer] fetchDocumentProgress failed:', error);
        return null;
      }

      if (data && data.user_progress && data.user_progress[userId]) {
        return {
          progress_percentage: data.user_progress[userId].progress_percentage || 0,
          last_read_page: data.user_progress[userId].last_read_page || 1
        };
      }
      return null;
    } catch (e) {
      console.error('[NexusServer] fetchDocumentProgress exception:', e);
      return null;
    }
  }

  static async getStudyLeaderboard() {
    try {
      // Use the server-side API route to bypass RLS and allow public users to view the leaderboard
      const response = await fetch('/api/study-leaderboard');
      if (!response.ok) {
        throw new Error('Leaderboard synchronization failed.');
      }
      const data = await response.json();
      return data || [];
    } catch (e) {
      console.error('Fetch study leaderboard failed:', e);
      return [];
    }
  }

  /**
   * Save a payment transaction to the database
   */
  static async saveTransaction(params: {
    paymentId: string;
    orderId: string;
    signature: string;
    amount: number;
    receiptReference: string;
    userId?: string | null;
    userEmail?: string | null;
    userUsername?: string | null;
  }): Promise<void> {
    const client = getSupabase();
    if (!client) {
      console.warn('Supabase not configured — transaction not saved.');
      return;
    }

    try {
      const { error } = await client.from('transactions').insert([{
        payment_id: params.paymentId,
        order_id: params.orderId,
        signature: params.signature,
        amount: Number(params.amount),
        receipt_reference: params.receiptReference,
        user_id: params.userId || null,
        user_email: params.userEmail || null,
        user_username: params.userUsername || null,
        currency: 'INR',
        status: 'success',
      }]);

      if (error) {
        console.error('Save Transaction Error:', error);
        throw error;
      }

      console.log('Transaction saved successfully:', params.paymentId);
    } catch (e) {
      console.error('Transaction save exception:', e);
      // Don't throw — we don't want a DB failure to break the user flow
    }
  }

  /**
   * Fetch all transactions (admin use)
   */
  static async fetchTransactions(limit: number = 50): Promise<any[]> {
    const client = getSupabase();
    if (!client) return [];

    const { data, error } = await client
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Fetch Transactions Error:', error);
      return [];
    }
    return data || [];
  }

  /**
   * App Announcements Methods
   */
  static async fetchActiveAppAnnouncements(): Promise<any[]> {
    const client = getSupabase();
    if (!client) return [];
    // Use a 5-minute buffer to account for clock drift between client and server
    const now = new Date();
    const bufferNow = new Date(now.getTime() + 5 * 60 * 1000).toISOString(); // 5 min in future for lte
    const bufferPast = new Date(now.getTime() - 5 * 60 * 1000).toISOString(); // 5 min in past for gte

    const { data, error } = await client
      .from('announcements')
      .select('*')
      .eq('scope', 'app_banner')
      .eq('is_active', true)
      .lte('start_at', bufferNow)
      .gte('end_at', bufferPast)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Fetch Active Announcements Error:', error);
      return [];
    }
    return (data || []).map(item => ({
      ...item,
      description: item.content,
      link_url: item.link
    }));
  }

  static async fetchAllAppAnnouncements(): Promise<any[]> {
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client
      .from('announcements')
      .select('*')
      .eq('scope', 'app_banner')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Fetch All Announcements Error:', error);
      return [];
    }
    return (data || []).map(item => ({
      ...item,
      description: item.content,
      link_url: item.link
    }));
  }

  static async createAppAnnouncement(announcement: any, file?: File) {
    const client = getSupabase();
    if (!client) return;

    let imageUrl = announcement.image_url;
    if (file) {
      const path = `announcements/${Date.now()}_${file.name}`;
      const { error: uploadError } = await client.storage.from('nexus-documents').upload(path, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = client.storage.from('nexus-documents').getPublicUrl(path);
      imageUrl = publicUrl;
    }

    const { error } = await client.from('announcements').insert([{
      scope: 'app_banner',
      title: announcement.title,
      content: announcement.description,
      link: announcement.link_url,
      image_url: imageUrl,
      is_active: announcement.is_active,
      start_at: announcement.start_at,
      end_at: announcement.end_at
    }]);
    if (error) throw error;
  }

  static async updateAppAnnouncement(id: string, updates: any) {
    const client = getSupabase();
    if (!client) return;
    const mapped: any = {};
    if (updates.title !== undefined) mapped.title = updates.title;
    if (updates.description !== undefined) mapped.content = updates.description;
    if (updates.link_url !== undefined) mapped.link = updates.link_url;
    if (updates.image_url !== undefined) mapped.image_url = updates.image_url;
    if (updates.is_active !== undefined) mapped.is_active = updates.is_active;
    if (updates.start_at !== undefined) mapped.start_at = updates.start_at;
    if (updates.end_at !== undefined) mapped.end_at = updates.end_at;

    const { error } = await client.from('announcements').update(mapped).eq('id', id);
    if (error) throw error;
  }

  static async deleteAppAnnouncement(id: string) {
    const client = getSupabase();
    if (!client) return;
    const { error } = await client.from('announcements').delete().eq('id', id);
    if (error) throw error;
  }
}

export default NexusServer;
