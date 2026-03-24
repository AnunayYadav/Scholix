
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

  /**
   * Timetable: Community Presets
   */
  static async fetchCommunityTimetables(): Promise<any[]> {
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client
      .from('community_timetables')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      throw new Error("Failed to sync community presets.");
    }
    return data || [];
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

  static async updateCommunityTimetable(id: string, metadata: any) {
    const client = getSupabase();
    if (!client) return;
    const generatedName = `${metadata.section} - ${metadata.branch} ${metadata.year} Year Sem ${metadata.semester}`;
    const { error } = await client.from('community_timetables').update({
      section: metadata.section,
      branch: metadata.branch,
      year: metadata.year,
      semester: metadata.semester,
      name: generatedName
    }).eq('id', id);
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

    const { data, error } = await client
      .from('question_banks')
      .select('*')
      .eq('subject_name', subject)
      .in('unit_number', units);

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

    const subjectCode = (subject || '').split(':')[0].trim();
    // Transform from app format to DB format (snake_case)
    const dbRows = questions.map(q => ({
      id: q.id,
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
  static async fetchQuestions(subject: string, unit?: number): Promise<QuizQuestion[]> {
    const client = getSupabase();
    if (!client) return [];

    const subjectCode = (subject || '').split(':')[0].trim();
    let query = client
      .from('questions')
      .select('*')
      .eq('subject', subjectCode);

    if (unit !== undefined && unit !== 0) {
      query = query.eq('unit', unit);
    }

    // Increase limit to ensure we fetch all subject questions (default might be 100)
    query = query.range(0, 2000);

    const { data, error } = await query;

    if (error || !data) {
      console.error('Fetch Questions Error:', error);
      return [];
    }

    return data.map(q => {
      const options = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []);
      
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
    const client = getSupabase();
    if (!client) return;

    // 1. Raw View Tracking (Every reload/view)
    try {
      const { error } = await client.from('site_views').insert([{}]);
      if (error) console.warn("site_views tracking failed:", error.message);
    } catch (e) {
      console.warn("site_views tracking exception:", e);
    }

    // 2. Session-based Visitor Tracking
    const SESSION_KEY = 'nexus_session_logged';
    if (!sessionStorage.getItem(SESSION_KEY)) {
      try {
        const { error } = await client.from('site_visits').insert([{}]);
        if (error) {
          console.warn("site_visits tracking failed:", error.message);
        } else {
          sessionStorage.setItem(SESSION_KEY, 'true');
        }
      } catch (e) {
        console.warn("site_visits tracking exception:", e);
      }
    }
  }

  static async getSiteStats(): Promise<{ registered: number; visitors: number; totalViews: number }> {
    const client = getSupabase();
    if (!client) return { registered: 0, visitors: 0, totalViews: 0 };

    // Fetch counts individually to prevent one RLS failure from wiping all results
    const fetchCount = async (table: string) => {
      try {
        const { count, error } = await client.from(table).select('*', { count: 'exact', head: true });
        if (error) {
          console.warn(`Stat fetch error for ${table}:`, error.message);
          return 0;
        }
        return count || 0;
      } catch (e) {
        return 0;
      }
    };

    const [reg, vis, views] = await Promise.all([
      fetchCount('profiles'),
      fetchCount('site_visits'),
      fetchCount('site_views')
    ]);

    return { registered: reg, visitors: vis, totalViews: views };
  }

  static async trackPageView(path: string): Promise<void> {
    const client = getSupabase();
    if (!client) return;

    const SESSION_KEY = `viewed_${path}`;
    const isNewVisitor = !sessionStorage.getItem(SESSION_KEY);

    try {
      const { error } = await client.rpc('increment_page_stat', { p_path: path, p_is_new_visitor: isNewVisitor });
      if (error) {
        console.warn("Page tracking legacy fallback (RPC error):", error.message);
        await this.recordVisit();
      } else if (isNewVisitor) {
        sessionStorage.setItem(SESSION_KEY, 'true');
      }
    } catch (e) {
      console.warn("Page tracking legacy fallback exception:", e);
      // Fallback if RPC is not available (simple insert into site_views)
      await this.recordVisit();
    }
  }

  static async trackEvent(eventName: string): Promise<void> {
    const client = getSupabase();
    if (!client) return;
    try {
      await client.rpc('increment_event_stat', { p_event_name: eventName });
    } catch (e) {
      console.warn("Event tracking failed:", e);
    }
  }

  static async getTimeSeriesStats(type: 'views' | 'visitors' | 'feedback' | 'reports', days: number = 12): Promise<any[]> {
    const client = getSupabase();
    if (!client) return [];

    let table = '';
    switch (type) {
      case 'views': table = 'site_views'; break;
      case 'visitors': table = 'site_visits'; break;
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
      pendingReports: number,
      totalFeedback: number
    }
  }> {
    const client = getSupabase();
    if (!client) return { 
      pageStats: [], 
      eventStats: [], 
      summary: { registered: 0, visitors: 0, totalViews: 0, pendingReports: 0, totalFeedback: 0 } 
    };

    const [pages, events, reg, vis, reports, feedback] = await Promise.all([
      client.from('page_stats').select('*').order('views', { ascending: false }),
      client.from('event_stats').select('*').order('count', { ascending: false }),
      client.from('profiles').select('*', { count: 'exact', head: true }),
      client.from('site_visits').select('*', { count: 'exact', head: true }),
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
        pendingReports: reports.count || 0,
        totalFeedback: feedback.count || 0
      }
    };
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
      const { data } = await client.from('profiles').select('email').eq('username', identifier.toLowerCase().trim()).maybeSingle();
      if (data?.email) email = data.email;
      else throw new Error("No Verto found with that username.");
    }
    const authResponse = await client.auth.signInWithPassword({ email, password: pass });
    if (authResponse.error) throw authResponse.error;
    return authResponse;
  }

  static async signUp(email: string, pass: string, username: string, regNo: string) {
    const client = getSupabase();
    if (!client) throw new Error("Registry is offline.");
    // Rate limiting: 3 signup attempts per 2 minutes per email
    if (!rateLimiter.check(`auth_signup_${email.toLowerCase().trim()}`, 3, 120000)) {
      throw new Error("Too many signup attempts. Please wait a moment and try again.");
    }
    const cleanUsername = sanitizeInput(username.toLowerCase().trim(), 15);
    const cleanEmail = sanitizeInput(email.trim(), 100);
    const cleanRegNo = sanitizeInput(regNo.replace(/[^0-9]/g, ''), 8);
    const result = await client.auth.signUp({
      email: cleanEmail,
      password: pass,
      options: {
        data: { username: cleanUsername, registration_number: cleanRegNo },
        emailRedirectTo: window.location.origin
      }
    });

    // If signup is successful and we have a session (immediate login enabled)
    if (!result.error && result.data?.user && result.data.session) {
      try {
        await client.from('profiles').update({
          username: cleanUsername,
          registration_number: cleanRegNo
        }).eq('id', result.data.user.id);
      } catch (e) {
        console.warn("Manual profile sync failed:", e);
      }
    }

    return result;
  }

  static async signOut() {
    const client = getSupabase();
    if (!client) return;
    await client.auth.signOut();
  }

  static onAuthStateChange(callback: (user: User | null) => void) {
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
    const { data, error } = await client.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) {
      console.error('Get Profile Error:', error);
      throw error;
    }
    return data;
  }

  static async ensureProfile(user: User): Promise<UserProfile> {
    const client = getSupabase();
    if (!client) throw new Error("Registry offline.");

    const { data: existing } = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();

    if (existing) return existing;

    const metadata = user.user_metadata || {};
    const newProfile = {
      id: user.id,
      email: user.email!,
      username: metadata.username || user.email?.split('@')[0] || `verto_${user.id.slice(0, 5)}`,
      registration_number: metadata.registration_number || null,
      is_admin: false,
      total_xp: 0,
      level: 1,
      level_title: 'Beginner',
      current_streak: 0,
      longest_streak: 0,
      last_active_date: null,
      xp_history: []
    };

    const { data, error } = await client.from('profiles').insert([newProfile]).select().single();
    if (error) throw error;
    return data;
  }

  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const client = getSupabase();
    if (!client || !userId) return;
    const { error } = await client.from('profiles').upsert({ id: userId, ...updates });
    if (error) throw error;
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
    let query = client.from('folders').select('*');
    if (program && program !== 'All') query = query.eq('program', program);
    const { data } = await query.order('name', { ascending: true });
    return data || [];
  }

  static async createFolder(name: string, type: 'semester' | 'subject' | 'category', parentId: string | null, program: string) {
    const client = getSupabase();
    if (client) await client.from('folders').insert([{ name, type, parent_id: parentId, program }]);
  }

  static async renameFolder(id: string, name: string) {
    const client = getSupabase();
    if (client) await client.from('folders').update({ name }).eq('id', id);
  }

  static async deleteFolder(id: string) {
    const client = getSupabase();
    if (client) await client.from('folders').delete().eq('id', id);
  }

  static async fetchFiles(program: string, q?: string): Promise<LibraryFile[]> {
    const client = getSupabase();
    if (!client) return [];
    let query = client.from('documents').select('*, uploader:profiles(username, is_admin)').eq('status', 'approved');
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
      display_order: item.display_order
    }));
  }

  static async uploadFile(file: File, name: string, desc: string, sub: string, sem: string, type: string, uid: string, admin: boolean, program: string) {
    const client = getSupabase();
    if (!client) return;
    const cleanName = this.sanitizeStoragePath(file.name);
    const path = `community/${Math.random().toString(36).substring(7)}_${cleanName}`;
    const { error: storageErr } = await client.storage.from('nexus-documents').upload(path, file);
    if (storageErr) throw storageErr;
    const { error: dbErr } = await client.from('documents').insert([{
      name, description: desc, subject: sub, semester: sem, type,
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
      anonId = crypto.randomUUID();
      localStorage.setItem('nexus_anon_session_id', anonId);
    }
    return anonId;
  }

  static async fetchRecords(uid: string | null, type: string) {
    const client = getSupabase();
    const targetUid = uid || this.getAnonSessionId();
    if (client && targetUid) {
      const { data, error } = await client.from('user_history')
        .select('*')
        .or(`user_id.eq.${targetUid},session_id.eq.${targetUid}`)
        .eq('type', type)
        .order('created_at', { ascending: false });
      if (error) {
        console.error(`Fetch Records Error (${type}):`, error);
        throw error;
      }
      return data || [];
    }
    return [];
  }

  static async saveRecord(uid: string | null, type: string, label: string, content: any) {
    const client = getSupabase();
    if (!client) return;

    const session_id = this.getAnonSessionId();

    // If uid is provided, use it. Otherwise user_id is null and we rely on session_id.
    const record: any = {
      user_id: uid || null,
      session_id: session_id,
      type,
      label,
      content
    };

    try {
      const { error } = await client.from('user_history').insert([record]);
      if (error) {
        console.error('Save Record Error:', error);
      }
    } catch (e) {
      console.error('Save Record Exception:', e);
    }
  }

  static async deleteRecord(id: string, type: string, uid: string | null) {
    const client = getSupabase();
    if (client && uid) await client.from('user_history').delete().eq('id', id);
  }

  static async checkUsernameAvailability(username: string): Promise<boolean> {
    const client = getSupabase();
    if (!client) return true;
    const { data } = await client.from('profiles').select('username').eq('username', username.toLowerCase().trim()).maybeSingle();
    return !data;
  }

  static async submitFeedback(text: string, uid?: string, email?: string) {
    const client = getSupabase();
    const sanitizedText = sanitizeInput(text, 2000);
    if (!sanitizedText) return;
    if (client) await client.from('feedback').insert([{ text: sanitizedText, user_id: uid, user_email: email }]);
  }

  static async getFileUrl(path: string) {
    const client = getSupabase();
    if (!client) return '';
    return client.storage.from('nexus-documents').getPublicUrl(path).data.publicUrl;
  }

  static async deleteFile(id: string, path: string) {
    const client = getSupabase();
    if (client) {
      await client.from('documents').delete().eq('id', id);
      await client.storage.from('nexus-documents').remove([path]);
    }
  }

  static async approveFile(id: string) {
    const client = getSupabase();
    if (client) await client.from('documents').update({ status: 'approved' }).eq('id', id);
  }

  static async rejectFile(id: string) {
    const client = getSupabase();
    if (client) await client.from('documents').delete().eq('id', id);
  }

  static async demoteFile(id: string) {
    const client = getSupabase();
    if (client) await client.from('documents').update({ status: 'pending' }).eq('id', id);
  }

  static async requestUpdate(id: string, metadata: any, admin: boolean) {
    const client = getSupabase();
    if (client) await client.from('documents').update(admin ? metadata : { pending_update: metadata }).eq('id', id);
  }

  static async fetchPendingFiles(program: string, q?: string): Promise<LibraryFile[]> {
    const client = getSupabase();
    if (!client) return [];
    let query = client.from('documents').select('*, uploader:profiles(username, is_admin)').eq('status', 'pending');
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
      program: item.program
    }));
  }

  static async fetchUserFiles(uid: string): Promise<LibraryFile[]> {
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client.from('documents').select('*, uploader:profiles(username, is_admin)').eq('uploader_id', uid).order('created_at', { ascending: false });
    if (error) { console.error("Fetch User Files Error:", error); return []; }
    return (data || []).map(item => ({
      id: item.id, name: item.name, subject: item.subject, semester: item.semester, type: item.type,
      uploadDate: new Date(item.created_at).getTime(), size: item.size, status: item.status, storage_path: item.storage_path,
      uploader_username: (item.uploader as any)?.username || "Anonymous Verto",
      description: item.description,
      admin_notes: item.admin_notes,
      program: item.program
    }));
  }

  static async reorderFiles(fileOrders: { id: string, order: number }[]) {
    try {
      const client = getSupabase();
      if (!client) return;

      const updates = fileOrders.map(item =>
        client.from('documents').update({ display_order: item.order }).eq('id', item.id)
      );

      const results = await Promise.all(updates);
      const firstError = results.find(r => r.error);
      if (firstError) {
        console.warn("Reorder failed (likely missing column):", firstError.error);
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

  static async updateQuestion(q: QuizQuestion) {
    const client = getSupabase();
    if (!client) return;
    
    // Transform from app format to DB format (snake_case)
    const dbRow = {
      id: q.id,
      topic: q.topic,
      difficulty: q.difficulty,
      question_type: q.questionType || 'MCQ',
      type: q.type || 'mcq',
      question: q.question,
      options: Array.isArray(q.options) ? q.options : [],
      correct_answer: q.correctAnswer,
      explanation: q.explanation,
      starter_code: q.starterCode,
      test_cases: Array.isArray(q.testCases) ? q.testCases : [],
      subject: (q as any).subject,
      unit: (q as any).unit
    };

    const { error } = await client
      .from('questions')
      .update(dbRow)
      .eq('id', q.id);

    if (error) {
      console.error('Update Question Error:', error);
      throw error;
    }
  }

  static async createQuestion(q: Partial<QuizQuestion>) {
    const client = getSupabase();
    if (!client) return;
    
    // Transform to DB format
    const dbRow = {
      topic: q.topic,
      difficulty: q.difficulty,
      question_type: q.questionType || 'MCQ',
      type: q.type || 'mcq',
      question: q.question,
      options: Array.isArray(q.options) ? q.options : [],
      correct_answer: q.correctAnswer,
      explanation: q.explanation,
      starter_code: q.starterCode,
      test_cases: Array.isArray(q.testCases) ? q.testCases : [],
      subject: (q as any).subject,
      unit: (q as any).unit,
      source: 'admin'
    };

    const { data, error } = await client
      .from('questions')
      .insert([dbRow])
      .select()
      .single();

    if (error) {
      console.error('Create Question Error:', error);
      throw error;
    }
    return data;
  }

  static async fetchQuestionReports() {
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client
      .from('question_reports')
      .select('*, question:questions(*), reporter:profiles!user_id(username)')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Fetch Question Reports Error:', error);
      return [];
    }
    return data || [];
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
    // Use a more standard joining syntax to avoid relationship naming issues
    const { data, error } = await client
      .from('feedback')
      .select('*, profiles(username)')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Fetch Feedback Error:', error);
      // Fallback to fetch without join if the above failed
      const { data: simpleData } = await client.from('feedback').select('*').order('created_at', { ascending: false });
      return simpleData || [];
    }
    
    // Process to keep the UI's 'user' property expectation if needed
    return (data || []).map(f => ({
      ...f,
      user: (f as any).profiles || null,
      replies: (f as any).replies || [] // Default to empty array if nested field doesn't exist yet
    }));
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
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client.from('marketplace_items').select('*, seller:profiles(username, avatar_url, is_admin)').order('created_at', { ascending: false });
    if (error) { console.error("Marketplace fetch error:", error); return []; }
    return (data || []).map(item => ({
      ...item,
      seller_username: (item.seller as any)?.username,
      seller_avatar: (item.seller as any)?.avatar_url,
      seller_is_admin: (item.seller as any)?.is_admin
    }));

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
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client.from('roommate_requests').select('*, user:profiles(username, avatar_url, is_admin)').order('created_at', { ascending: false });
    if (error) { console.error("Roommate fetch error:", error); return []; }
    return (data || []).map(item => ({
      ...item,
      user_username: (item.user as any)?.username,
      user_avatar: (item.user as any)?.avatar_url,
      user_is_admin: (item.user as any)?.is_admin
    }));

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
      .from('global_announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) {
      return [];
    }
    return data || [];
  }

  static subscribeToGlobalAnnouncements(onAnnouncement: (payload: any) => void) {
    const client = getSupabase();
    if (!client) return () => { };

    const channel = client
      .channel('public_announcements')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'global_announcements' },
        (payload) => onAnnouncement(payload.new)
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
      .from('global_announcements')
      .insert([{ title: sanitizedTitle, message: sanitizedMessage, type, link: sanitizedLink }]);
    if (error) throw error;
  }

  static async fetchAllProfiles(): Promise<Partial<UserProfile>[]> {
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client.from('profiles').select('id, username, email, registration_number, avatar_url').order('username', { ascending: true });
    if (error) {
      console.error('Fetch All Profiles Error:', error);
      return [];
    }
    return data || [];
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
      .select('id, username, registration_number, avatar_url, total_xp, level')
      .or(`username.ilike.%${query}%,registration_number.ilike.%${query}%`)
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
    
    const [profile, attempts, reports, feedback] = await Promise.all([
      client.from('profiles').select('*').eq('id', userId).maybeSingle(),
      client.from('quiz_attempts').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      client.from('question_reports').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      client.from('feedback').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10)
    ]);

    return {
      profile: profile.data,
      attempts: attempts.data || [],
      reports: reports.data || [],
      feedback: feedback.data || []
    };
  }
}

export default NexusServer;
