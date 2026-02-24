
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
      await client.rpc('increment_page_stat', { p_path: path, p_is_new_visitor: isNewVisitor });
      if (isNewVisitor) sessionStorage.setItem(SESSION_KEY, 'true');
    } catch (e) {
      console.warn("Page tracking legacy fallback:", e);
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

  static async getDetailedStats(): Promise<{ pageStats: any[], eventStats: any[] }> {
    const client = getSupabase();
    if (!client) return { pageStats: [], eventStats: [] };

    const [pages, events] = await Promise.all([
      client.from('page_stats').select('*').order('views', { ascending: false }),
      client.from('event_stats').select('*').order('count', { ascending: false })
    ]);

    return {
      pageStats: pages.data || [],
      eventStats: events.data || []
    };
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
      is_admin: false
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
    const { error } = await client.from('marketplace_items').insert([item]);
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
    const { error } = await client.from('roommate_requests').insert([request]);
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
      client.removeChannel(channel);
    };
  }
}

export default NexusServer;
