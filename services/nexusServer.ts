
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { LibraryFile, UserProfile, Folder, QuizQuestion, TimetableData } from '../types.ts';

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
      console.error('Fetch Community Timetables Error:', error);
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

  static async saveQuestionsToBank(subject: string, unit: number, questions: QuizQuestion[]) {
    const client = getSupabase();
    if (!client) return;

    await client.from('question_banks').upsert({
      subject_name: subject,
      unit_number: unit,
      questions: questions
    }, { onConflict: 'subject_name,unit_number' });
  }

  static async recordVisit(): Promise<void> {
    const client = getSupabase();
    if (!client) return;

    // 1. Raw View Tracking (Every reload/view)
    try {
      await client.from('site_views').insert([{}]);
    } catch (e) { }

    // 2. Session-based Visitor Tracking
    const SESSION_KEY = 'nexus_session_logged';
    if (!sessionStorage.getItem(SESSION_KEY)) {
      try {
        await client.from('site_visits').insert([{}]);
        sessionStorage.setItem(SESSION_KEY, 'true');
      } catch (e) { }
    }
  }

  static async getSiteStats(): Promise<{ registered: number; visitors: number; totalViews: number }> {
    const client = getSupabase();
    if (!client) return { registered: 0, visitors: 0, totalViews: 0 };
    try {
      const { count: reg } = await client.from('profiles').select('*', { count: 'exact', head: true });
      const { count: vis } = await client.from('site_visits').select('*', { count: 'exact', head: true });
      const { count: views } = await client.from('site_views').select('*', { count: 'exact', head: true });
      return { registered: reg || 0, visitors: vis || 0, totalViews: views || 0 };
    } catch (e) { return { registered: 0, visitors: 0, totalViews: 0 }; }
  }

  static async signIn(identifier: string, pass: string) {
    const client = getSupabase();
    if (!client) throw new Error("Registry is offline.");
    let email = identifier.trim();
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
    const cleanUsername = username.toLowerCase().trim();
    const result = await client.auth.signUp({
      email: email.trim(),
      password: pass,
      options: {
        data: { username: cleanUsername, registration_number: regNo },
        emailRedirectTo: window.location.origin
      }
    });

    // If signup is successful and we have a session (immediate login enabled)
    // Manually ensure the profile table is updated to prevent null values if the trigger is missing
    if (!result.error && result.data?.user && result.data.session) {
      try {
        await client.from('profiles').update({
          username: cleanUsername,
          registration_number: regNo
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

  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const client = getSupabase();
    if (!client || !userId) return;
    const { error } = await client.from('profiles').update(updates).eq('id', userId);
    if (error) throw error;
  }

  static async uploadAvatar(userId: string, file: File): Promise<string> {
    const client = getSupabase();
    if (!client) throw new Error("Registry offline.");
    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${userId}/${Math.random()}.${fileExt}`;
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
    let query = client.from('documents').select('*, uploader:profiles(username)').eq('status', 'approved');
    if (program && program !== 'All') query = query.eq('program', program);
    if (q) query = query.ilike('name', `%${q}%`);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) { console.error("Fetch Error:", error); return []; }
    return (data || []).map(item => ({
      id: item.id, name: item.name, subject: item.subject, semester: item.semester, type: item.type,
      uploadDate: new Date(item.created_at).getTime(), size: item.size, status: item.status, storage_path: item.storage_path,
      program: item.program,
      uploader_username: (item.uploader as any)?.username || "Anonymous Verto",
      description: item.description,
      admin_notes: item.admin_notes
    }));
  }

  static async uploadFile(file: File, name: string, desc: string, sub: string, sem: string, type: string, uid: string, admin: boolean, program: string) {
    const client = getSupabase();
    if (!client) return;
    const path = `community/${Math.random().toString(36).substring(7)}_${file.name}`;
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

  static async fetchRecords(uid: string | null, type: string) {
    const client = getSupabase();
    if (client && uid) {
      const { data, error } = await client.from('user_history').select('*').eq('user_id', uid).eq('type', type).order('created_at', { ascending: false });
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
    if (client && uid) await client.from('user_history').insert([{ user_id: uid, type, label, content }]);
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
    if (client) await client.from('feedback').insert([{ text, user_id: uid, user_email: email }]);
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
    let query = client.from('documents').select('*, uploader:profiles(username)').eq('status', 'pending');
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
    const { data, error } = await client.from('documents').select('*, uploader:profiles(username)').eq('uploader_id', uid).order('created_at', { ascending: false });
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


}

export default NexusServer;
