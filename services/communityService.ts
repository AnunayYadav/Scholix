import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  CommunityPost, 
  MaterialRequest, 
  StudyPack, 
  WikiSection, 
  SubjectChatMsg, 
  SubjectStats, 
  FacultyProfile,
  PostComment,
  ReactionContainer
} from '../types/communityTypes';
import { LibraryFile } from '../types';
import NexusServer from './nexusServer';

// Helpers to get client environment
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

// Supabase client initialization
const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;
  const url = getEnvVar('SUPABASE_URL');
  const key = getEnvVar('SUPABASE_ANON_KEY');
  if (!url || !key) return null;
  try {
    supabaseInstance = createClient(url, key);
    return supabaseInstance;
  } catch (e) {
    return null;
  }
};

// Upload a community image to Supabase storage and return the public URL
export async function uploadCommunityImage(file: File): Promise<string> {
  const client = getSupabase();
  if (!client) throw new Error('Supabase not initialized');
  const ext = file.name.split('.').pop() || 'png';
  const safeName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext.replace(/[^a-zA-Z0-9]/g, '')}`;
  const filePath = `community-images/${safeName}`;
  const { error } = await client.storage.from('nexus-documents').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data: { publicUrl } } = client.storage.from('nexus-documents').getPublicUrl(filePath);
  return publicUrl;
}

// Delete a community image from Supabase storage by its public URL
export async function deleteCommunityImageByUrl(url: string): Promise<void> {
  const client = getSupabase();
  if (!client) return;

  try {
    const storageMarker = '/nexus-documents/';
    const index = url.indexOf(storageMarker);
    if (index !== -1) {
      const filePath = decodeURIComponent(url.substring(index + storageMarker.length));
      console.log(`[Storage Cleanup] Deleting community image: ${filePath}`);
      const { error } = await client.storage.from('nexus-documents').remove([filePath]);
      if (error) {
        console.error(`[Storage Cleanup Error]:`, error);
      }
    }
  } catch (e) {
    console.error(`[Storage Cleanup Catch]:`, e);
  }
}


// ═══════════════════════════════════════
// SEED MOCK DATA FOR LOCALSTORAGE FALLBACK
// ═══════════════════════════════════════

const DEFAULT_SEEDS = {
  posts: [
    {
      id: 'post-1',
      subject_id: 'CSE101',
      user_id: 'user-dummy-1',
      user_username: 'Anunay',
      user_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
      type: 'post',
      category: 'announcement',
      title: '📢 Syllabus change for Midterm Exam',
      content: `Please note that Unit 3 (Functions and Arrays) is now fully included in the Midterm exam. Unit 4 (Pointers) has been pushed to Endterm. 

Study hard! Here is a tip:
* Focus on recursion questions
* Check previous year papers (PYQs)`,
      tags: ['#syllabus', '#midterm', '#important'],
      reactions: { helpful: ['user-dummy-2', 'user-dummy-3'], quality: ['user-dummy-4'], important: ['user-dummy-1', 'user-dummy-2'] },
      comments: [
        {
          id: 'c-1',
          user_id: 'user-dummy-2',
          username: 'Rahul Sharma',
          avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&h=150&q=80',
          content: 'Wait, is recursion in Unit 3? I thought it was in Unit 2.',
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
          reactions: { helpful: ['user-dummy-1'], quality: [], important: [] },
          replies: [
            {
              id: 'r-1',
              user_id: 'user-dummy-1',
              username: 'Anunay',
              avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
              content: 'Yes, recursion is part of the functions chapter in Unit 3.',
              created_at: new Date(Date.now() - 3600000 * 1.8).toISOString()
            }
          ]
        }
      ],
      verified_status: 'admin',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: 'post-2',
      subject_id: 'CSE101',
      user_id: 'user-dummy-3',
      user_username: 'Priya Patel',
      user_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
      type: 'post',
      category: 'doubt',
      title: '❓ Why is this pointer allocation failing?',
      content: `I am trying to allocate memory for a 2D array dynamically in C using malloc.
\`\`\`c
int **arr = (int **)malloc(r * sizeof(int *));
for (int i = 0; i < r; i++) {
    arr[i] = (int *)malloc(c * sizeof(int));
}
\`\`\`
But it is giving a segmentation fault for large values of \`r\` and \`c\`. Any pointers?`,
      tags: ['#pointers', '#malloc', '#doubt'],
      reactions: { helpful: ['user-dummy-1'], quality: [], important: [] },
      comments: [
        {
          id: 'c-2',
          user_id: 'user-dummy-4',
          username: 'Prof. Amit',
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
          content: 'Check if malloc is returning NULL. For large inputs, heap memory might get exhausted. Always validate `if (arr[i] == NULL)`.',
          created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
          reactions: { helpful: ['user-dummy-3', 'user-dummy-2'], quality: ['user-dummy-1'], important: [] },
          replies: []
        }
      ],
      verified_status: 'faculty',
      difficulty: 'hard',
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ],
  requests: [
    {
      id: 'req-1',
      subject_id: 'CSE101',
      user_id: 'user-dummy-2',
      user_username: 'Rahul Sharma',
      user_avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&h=150&q=80',
      type: 'request',
      title: 'Need CSE101 Midterm expected questions / cheatsheet',
      content: 'If anyone has Dr. Amit\'s handwritten cheatsheet for pointers and arrays, please upload it. Offering 50 XP bounty!',
      bounty_xp: 50,
      status: 'open',
      reactions: { helpful: ['user-dummy-1'], quality: [], important: [] },
      comments: [],
      created_at: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ],
  studyPacks: [
    {
      id: 'pack-1',
      subject_id: 'CSE101',
      user_id: 'user-dummy-1',
      user_username: 'Anunay',
      user_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
      type: 'collection',
      title: '🎓 Semester 2 Finals Preparation Pack',
      content: 'Contains official syllabus, handpicked notes from Dr. Amit, and solved mid-term and end-term PYQs.',
      file_ids: [],
      follower_ids: ['user-dummy-2', 'user-dummy-3'],
      created_at: new Date(Date.now() - 3600000 * 48).toISOString()
    }
  ],
  wikis: [
    {
      id: 'wiki-1',
      subject_id: 'CSE101',
      type: 'wiki',
      category: 'roadmap',
      content: `## CSE101 Study Roadmap
1. **Basics & Syntax:** Learn flowcharts, datatypes, and loops first.
2. **Modular Coding:** Master functions and variable scope.
3. **Data Structures:** Practice arrays, strings, and structures.
4. **Advance Concepts:** Pointers, dynamic allocation, and file handling.`,
      user_id: 'user-dummy-1',
      user_username: 'Anunay',
      updated_at: new Date().toISOString()
    },
    {
      id: 'wiki-2',
      subject_id: 'CSE101',
      type: 'wiki',
      category: 'reference_books',
      content: `## Recommended Reference Books
* *Programming in ANSI C* by E. Balagurusamy
* *Let Us C* by Yashavant Kanetkar
* *The C Programming Language* by Brian Kernighan and Dennis Ritchie`,
      user_id: 'user-dummy-1',
      user_username: 'Anunay',
      updated_at: new Date().toISOString()
    }
  ],
  chats: [
    {
      id: 'chat-1',
      subject_id: 'CSE101',
      user_id: 'user-dummy-2',
      user_username: 'Rahul Sharma',
      user_avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&h=150&q=80',
      type: 'chat',
      chat_channel: '#general',
      content: 'Hey guys, when is the lab manual submission deadline?',
      created_at: new Date(Date.now() - 600000).toISOString()
    },
    {
      id: 'chat-2',
      subject_id: 'CSE101',
      user_id: 'user-dummy-3',
      user_username: 'Priya Patel',
      user_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
      type: 'chat',
      chat_channel: '#general',
      content: 'It is this Friday before 5 PM. Make sure to attach the flowcharts!',
      created_at: new Date(Date.now() - 500000).toISOString()
    }
  ],
  faculties: [
    {
      id: 'fac-1',
      name: 'Dr. Amit Sharma',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
      designation: 'Associate Professor',
      department: 'Computer Science & Engineering',
      courses: ['CSE101', 'CSE320'],
      rating: 4.8,
      reviews: [
        { username: 'Anunay', rating: 5, text: 'Great teacher! Explains pointers dynamically. Highly recommended.', created_at: new Date(Date.now() - 3600000 * 240).toISOString() },
        { username: 'Rahul Sharma', rating: 4, text: 'Exams are a bit tough, but lectures are very comprehensive.', created_at: new Date(Date.now() - 3600000 * 120).toISOString() }
      ],
      announcements: [
        { id: 'fa-1', title: 'CSE101 Lab Submission Extended', content: 'The dynamic memory allocation manual submission is extended to Friday.', created_at: new Date(Date.now() - 3600000 * 10).toISOString() }
      ]
    }
  ]
};

// Local storage management keys
const STORAGE_KEYS = {
  HUB: 'scholix_community_hub',
  VOTES: 'scholix_community_votes',
  FACULTIES: 'scholix_faculties'
};

// Initialize LocalStorage if empty
const initLocalStorageDB = () => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(STORAGE_KEYS.HUB)) {
    const combinedHub = [
      ...DEFAULT_SEEDS.posts,
      ...DEFAULT_SEEDS.requests,
      ...DEFAULT_SEEDS.studyPacks,
      ...DEFAULT_SEEDS.wikis,
      ...DEFAULT_SEEDS.chats
    ];
    localStorage.setItem(STORAGE_KEYS.HUB, JSON.stringify(combinedHub));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FACULTIES)) {
    localStorage.setItem(STORAGE_KEYS.FACULTIES, JSON.stringify(DEFAULT_SEEDS.faculties));
  }
};

initLocalStorageDB();

// Helper to get local data
const getLocalData = (key: string): any[] => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : [];
  } catch (e) {
    return [];
  }
};

// Helper to set local data
const setLocalData = (key: string, data: any[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
};

class CommunityService {
  /**
   * Safe Supabase Caller: Runs a supabase query and falls back to local storage if it fails
   */
  private static async safeCall<T>(
    supabaseQuery: () => Promise<{ data: any; error: any }>,
    localStorageFallback: () => T
  ): Promise<T> {
    const client = getSupabase();
    if (!client) {
      return localStorageFallback();
    }
    try {
      const { data, error } = await supabaseQuery();
      if (error) {
        // Table not found or missing fields/RLS issues - fallback
        console.warn("Supabase database error, falling back to LocalStorage:", error);
        return localStorageFallback();
      }
      return data as unknown as T;
    } catch (e) {
      console.warn("Supabase query threw error, falling back to LocalStorage:", e);
      return localStorageFallback();
    }
  }

  // ═══════════════════════════════════════
  // WIDGET & OVERVIEW STATS
  // ═══════════════════════════════════════

  static async fetchSubjectStats(subjectId: string): Promise<SubjectStats> {
    return this.safeCall(
      async () => {
        const client = getSupabase();
        // Count documents, discussions, requests
        const [docsRes, postsRes, reqsRes, profilesRes] = await Promise.all([
          client!.from('documents').select('id', { count: 'exact', head: true }).eq('subject', subjectId).eq('status', 'approved'),
          client!.from('community_hub').select('id', { count: 'exact', head: true }).eq('subject_id', subjectId).eq('type', 'post'),
          client!.from('community_hub').select('id', { count: 'exact', head: true }).eq('subject_id', subjectId).eq('type', 'request').eq('status', 'open'),
          client!.from('profiles').select('id', { count: 'exact', head: true }) // total registered users as member pool
        ]);
        
        return {
          data: {
            rating: 4.8,
            membersCount: (profilesRes.count || 0) + 1200, // Seed offset
            filesCount: docsRes.count || 0,
            discussionsCount: postsRes.count || 0,
            requestsCount: reqsRes.count || 0,
            examCountdownDays: 18,
            onlineCount: Math.floor(Math.random() * 30 + 15)
          },
          error: null
        };
      },
      () => {
        const hub = getLocalData(STORAGE_KEYS.HUB);
        const filesCount = 20; // Hardcoded default for files
        const discussionsCount = hub.filter(i => i.subject_id === subjectId && i.type === 'post').length;
        const requestsCount = hub.filter(i => i.subject_id === subjectId && i.type === 'request' && i.status === 'open').length;

        return {
          rating: 4.8,
          membersCount: 2400,
          filesCount,
          discussionsCount,
          requestsCount,
          examCountdownDays: 18,
          onlineCount: Math.floor(Math.random() * 30 + 15)
        };
      }
    );
  }

  // ═══════════════════════════════════════
  // FEEDS & POSTS
  // ═══════════════════════════════════════

  static async fetchOverviewFeed(subjectId: string): Promise<any[]> {
    return this.safeCall(
      async () => {
        const client = getSupabase();
        // Fetch posts, requests, collections for the subject
        const { data, error } = await client!
          .from('community_hub')
          .select('*')
          .eq('subject_id', subjectId)
          .order('created_at', { ascending: false });
        return { data, error };
      },
      () => {
        const hub = getLocalData(STORAGE_KEYS.HUB);
        return hub.filter(item => item.subject_id === subjectId && ['post', 'request', 'collection'].includes(item.type));
      }
    );
  }

  static async fetchSubjectDiscussions(subjectId: string): Promise<CommunityPost[]> {
    return this.safeCall(
      async () => {
        const client = getSupabase();
        const { data, error } = await client!
          .from('community_hub')
          .select('*')
          .eq('subject_id', subjectId)
          .eq('type', 'post')
          .order('created_at', { ascending: false });
        
        // Sort by is_pinned descending in JavaScript to be 100% robust against missing column
        const sortedData = data ? [...data].sort((a, b) => {
          const pinA = a.is_pinned ? 1 : 0;
          const pinB = b.is_pinned ? 1 : 0;
          return pinB - pinA;
        }) : data;

        return { data: sortedData, error };
      },
      () => {
        const hub = getLocalData(STORAGE_KEYS.HUB);
        const filtered = hub.filter(item => item.subject_id === subjectId && item.type === 'post') as CommunityPost[];
        return [...filtered].sort((a, b) => {
          const pinA = a.is_pinned ? 1 : 0;
          const pinB = b.is_pinned ? 1 : 0;
          if (pinA !== pinB) return pinB - pinA;
          return Date.parse(b.created_at) - Date.parse(a.created_at);
        });
      }
    );
  }

  static async createPost(post: Omit<CommunityPost, 'id' | 'created_at' | 'updated_at' | 'reactions' | 'comments'>): Promise<CommunityPost> {
    const newPost: CommunityPost = {
      ...post,
      id: 'post-' + Math.random().toString(36).substr(2, 9),
      reactions: { helpful: [], quality: [], important: [] },
      comments: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const client = getSupabase();
    if (client) {
      try {
        const { id, ...insertPayload } = newPost;
        const { data, error } = await client.from('community_hub').insert([insertPayload]).select().maybeSingle();
        if (error) {
          console.error("[Supabase Error in createPost]:", error);
        }
        if (!error && data) return data as CommunityPost;
      } catch (e) {
        console.error("[System Error in createPost]:", e);
      }
    }

    // LocalStorage write
    const hub = getLocalData(STORAGE_KEYS.HUB);
    hub.push(newPost);
    setLocalData(STORAGE_KEYS.HUB, hub);
    return newPost;
  }

  static async updatePostPinStatus(postId: string, isPinned: boolean): Promise<boolean> {
    const client = getSupabase();
    if (client) {
      try {
        const { error } = await client.from('community_hub').update({ is_pinned: isPinned }).eq('id', postId);
        if (!error) return true;
      } catch (e) {}
    }

    // LocalStorage fallback
    const hub = getLocalData(STORAGE_KEYS.HUB);
    const idx = hub.findIndex(item => item.id === postId);
    if (idx !== -1) {
      hub[idx].is_pinned = isPinned;
      setLocalData(STORAGE_KEYS.HUB, hub);
      return true;
    }
    return false;
  }

  static async editPost(postId: string, title: string, content: string): Promise<boolean> {
    const client = getSupabase();
    if (client) {
      try {
        const { error } = await client
          .from('community_hub')
          .update({ title, content, updated_at: new Date().toISOString() })
          .eq('id', postId);
        if (!error) return true;
      } catch (e) {}
    }

    // LocalStorage fallback
    const hub = getLocalData(STORAGE_KEYS.HUB);
    const idx = hub.findIndex(item => item.id === postId);
    if (idx !== -1) {
      hub[idx].title = title;
      hub[idx].content = content;
      hub[idx].updated_at = new Date().toISOString();
      setLocalData(STORAGE_KEYS.HUB, hub);
      return true;
    }
    return false;
  }

  static async deletePost(postId: string): Promise<boolean> {
    const client = getSupabase();
    if (client) {
      try {
        // Fetch the post first to get its content (for image URLs)
        const { data: postData } = await client.from('community_hub').select('content').eq('id', postId).maybeSingle();
        if (postData?.content) {
          // Extract image URLs from content HTML
          const imgRegex = /<img[^>]+src="([^">]+)"/g;
          let match;
          while ((match = imgRegex.exec(postData.content)) !== null) {
            const url = match[1];
            await deleteCommunityImageByUrl(url);
          }
        }

        const { error } = await client.from('community_hub').delete().eq('id', postId);
        if (!error) return true;
      } catch (e) {
        console.error("[System Error in deletePost]:", e);
      }
    }

    // LocalStorage fallback
    const hub = getLocalData(STORAGE_KEYS.HUB);
    const filtered = hub.filter(item => item.id !== postId);
    setLocalData(STORAGE_KEYS.HUB, filtered);
    return true;
  }

  // ═══════════════════════════════════════
  // COMMENTS ENGINE (JSONB in-row)
  // ═══════════════════════════════════════

  static async addCommentToItem(
    itemId: string, 
    itemType: 'post' | 'request' | 'file', 
    comment: Omit<PostComment, 'id' | 'created_at' | 'replies' | 'reactions'>
  ): Promise<PostComment> {
    const newComment: PostComment = {
      ...comment,
      id: 'c-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      reactions: { helpful: [], quality: [], important: [] },
      replies: []
    };

    const client = getSupabase();
    if (client) {
      try {
        if (itemType === 'file') {
          // Fetch existing comments on documents table
          const { data: fileDoc } = await client.from('documents').select('comments').eq('id', itemId).maybeSingle();
          const existingComments = Array.isArray(fileDoc?.comments) ? fileDoc.comments : [];
          const updated = [...existingComments, newComment];
          await client.from('documents').update({ comments: updated }).eq('id', itemId);
          return newComment;
        } else {
          // Fetch existing comments on community_hub table
          const { data: hubDoc } = await client.from('community_hub').select('comments').eq('id', itemId).maybeSingle();
          const existingComments = Array.isArray(hubDoc?.comments) ? hubDoc.comments : [];
          const updated = [...existingComments, newComment];
          await client.from('community_hub').update({ comments: updated }).eq('id', itemId);
          return newComment;
        }
      } catch (e) {
        console.warn("Supabase comment write failed, using LocalStorage:", e);
      }
    }

    // LocalStorage fallback
    if (itemType === 'file') {
      // Mock documents logic in localStorage or memory
      const mockDocs = getLocalData('scholix_mock_documents_comments');
      const existing = mockDocs.find((d: any) => d.id === itemId) || { id: itemId, comments: [] };
      existing.comments.push(newComment);
      const filtered = mockDocs.filter((d: any) => d.id !== itemId);
      filtered.push(existing);
      setLocalData('scholix_mock_documents_comments', filtered);
    } else {
      const hub = getLocalData(STORAGE_KEYS.HUB);
      const idx = hub.findIndex(i => i.id === itemId);
      if (idx !== -1) {
        const commentsList = Array.isArray(hub[idx].comments) ? hub[idx].comments : [];
        hub[idx].comments = [...commentsList, newComment];
        setLocalData(STORAGE_KEYS.HUB, hub);
      }
    }
    return newComment;
  }

  static async addReplyToComment(
    itemId: string,
    itemType: 'post' | 'request' | 'file',
    commentId: string,
    reply: Omit<PostComment, 'id' | 'created_at' | 'replies' | 'reactions'>
  ): Promise<PostComment> {
    const newReply: PostComment = {
      ...reply,
      id: 'r-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };

    const client = getSupabase();
    if (client) {
      try {
        const table = itemType === 'file' ? 'documents' : 'community_hub';
        const { data: row } = await client.from(table).select('comments').eq('id', itemId).maybeSingle();
        const comments = Array.isArray(row?.comments) ? [...row.comments] : [];
        
        // Find comment and add reply
        const comment = comments.find(c => c.id === commentId);
        if (comment) {
          comment.replies = Array.isArray(comment.replies) ? [...comment.replies, newReply] : [newReply];
          await client.from(table).update({ comments }).eq('id', itemId);
          return newReply;
        }
      } catch (e) {
        console.warn("Supabase reply write failed, using LocalStorage:", e);
      }
    }

    // LocalStorage fallback
    if (itemType === 'file') {
      const mockDocs = getLocalData('scholix_mock_documents_comments');
      const doc = mockDocs.find((d: any) => d.id === itemId);
      if (doc) {
        const comment = doc.comments.find((c: any) => c.id === commentId);
        if (comment) {
          comment.replies = comment.replies || [];
          comment.replies.push(newReply);
          setLocalData('scholix_mock_documents_comments', mockDocs);
        }
      }
    } else {
      const hub = getLocalData(STORAGE_KEYS.HUB);
      const idx = hub.findIndex(i => i.id === itemId);
      if (idx !== -1) {
        const comments = Array.isArray(hub[idx].comments) ? [...hub[idx].comments] : [];
        const comment = comments.find(c => c.id === commentId);
        if (comment) {
          comment.replies = comment.replies || [];
          comment.replies.push(newReply);
          hub[idx].comments = comments;
          setLocalData(STORAGE_KEYS.HUB, hub);
        }
      }
    }
    return newReply;
  }

  // ═══════════════════════════════════════
  // REACTION BAR ENGINE (👍 Helpful, ⭐ Quality, 🔥 Important)
  // ═══════════════════════════════════════

  static async toggleReaction(
    itemId: string,
    itemType: 'post' | 'request' | 'file',
    reactionType: 'helpful' | 'quality' | 'important',
    userId: string
  ): Promise<ReactionContainer> {
    const client = getSupabase();
    if (client) {
      try {
        const table = itemType === 'file' ? 'documents' : 'community_hub';
        const { data: row } = await client.from(table).select('reactions').eq('id', itemId).maybeSingle();
        
        let reactions: ReactionContainer = row?.reactions || { helpful: [], quality: [], important: [] };
        if (!reactions[reactionType]) reactions[reactionType] = [];
        
        const userList = reactions[reactionType];
        const hasReacted = userList.includes(userId);
        
        if (hasReacted) {
          reactions[reactionType] = userList.filter(id => id !== userId);
        } else {
          reactions[reactionType] = [...userList, userId];
          // Mutual exclusivity for community items
          if (itemType !== 'file') {
            if (reactionType === 'helpful') {
              reactions.quality = (reactions.quality || []).filter(id => id !== userId);
            } else if (reactionType === 'quality') {
              reactions.helpful = (reactions.helpful || []).filter(id => id !== userId);
            }
          }
        }
        
        await client.from(table).update({ reactions }).eq('id', itemId);
        return reactions;
      } catch (e) {
        console.warn("Supabase reaction failed, using LocalStorage:", e);
      }
    }

    // LocalStorage fallback
    if (itemType === 'file') {
      const mockDocs = getLocalData('scholix_mock_documents_reactions');
      const doc = mockDocs.find((d: any) => d.id === itemId) || { id: itemId, reactions: { helpful: [], quality: [], important: [] } };
      let userList = doc.reactions[reactionType] || [];
      if (userList.includes(userId)) {
        doc.reactions[reactionType] = userList.filter((id: string) => id !== userId);
      } else {
        doc.reactions[reactionType] = [...userList, userId];
      }
      const filtered = mockDocs.filter((d: any) => d.id !== itemId);
      filtered.push(doc);
      setLocalData('scholix_mock_documents_reactions', filtered);
      return doc.reactions;
    } else {
      const hub = getLocalData(STORAGE_KEYS.HUB);
      const idx = hub.findIndex(i => i.id === itemId);
      if (idx !== -1) {
        let reactions: ReactionContainer = hub[idx].reactions || { helpful: [], quality: [], important: [] };
        if (!reactions[reactionType]) reactions[reactionType] = [];
        let userList = reactions[reactionType];
        if (userList.includes(userId)) {
          reactions[reactionType] = userList.filter(id => id !== userId);
        } else {
          reactions[reactionType] = [...userList, userId];
          if (reactionType === 'helpful') {
            reactions.quality = (reactions.quality || []).filter(id => id !== userId);
          } else if (reactionType === 'quality') {
            reactions.helpful = (reactions.helpful || []).filter(id => id !== userId);
          }
        }
        hub[idx].reactions = reactions;
        setLocalData(STORAGE_KEYS.HUB, hub);
        return reactions;
      }
    }
    return { helpful: [], quality: [], important: [] };
  }

  // ═══════════════════════════════════════
  // REQUESTS & BOUNTIES
  // ═══════════════════════════════════════

  static async fetchSubjectRequests(subjectId: string): Promise<MaterialRequest[]> {
    return this.safeCall(
      async () => {
        const client = getSupabase();
        const { data, error } = await client!
          .from('community_hub')
          .select('*')
          .eq('subject_id', subjectId)
          .eq('type', 'request')
          .order('created_at', { ascending: false });
        return { data, error };
      },
      () => {
        const hub = getLocalData(STORAGE_KEYS.HUB);
        return hub.filter(item => item.subject_id === subjectId && item.type === 'request') as MaterialRequest[];
      }
    );
  }

  static async createMaterialRequest(req: Omit<MaterialRequest, 'id' | 'created_at' | 'reactions' | 'comments' | 'status'>): Promise<MaterialRequest> {
    const newReq: MaterialRequest = {
      ...req,
      id: 'req-' + Math.random().toString(36).substr(2, 9),
      status: 'open',
      reactions: { helpful: [], quality: [], important: [] },
      comments: [],
      created_at: new Date().toISOString()
    };

    const client = getSupabase();
    if (client) {
      try {
        const { id, ...insertPayload } = newReq;
        const { data, error } = await client.from('community_hub').insert([insertPayload]).select().maybeSingle();
        if (error) {
          console.error("[Supabase Error in createRequest]:", error);
        }
        if (!error && data) return data as MaterialRequest;
      } catch (e) {
        console.error("[System Error in createRequest]:", e);
      }
    }

    const hub = getLocalData(STORAGE_KEYS.HUB);
    hub.push(newReq);
    setLocalData(STORAGE_KEYS.HUB, hub);
    return newReq;
  }

  static async solveMaterialRequest(requestId: string, fileId: string, solverUserProfile: any, bountyXP: number): Promise<void> {
    const client = getSupabase();
    if (client) {
      try {
        // 1. Update status and link file ID
        await client.from('community_hub').update({
          status: 'solved',
          linked_file_id: fileId
        }).eq('id', requestId);

        // 2. Award XP to Solver
        if (solverUserProfile?.id) {
          const currentXP = solverUserProfile.total_xp || 0;
          const nextXP = currentXP + bountyXP;
          // Standard LPU Level Threshold matching
          const nextLevel = Math.floor(nextXP / 500) + 1; // Basic formula fallback
          await NexusServer.updateProfileXP(solverUserProfile.id, {
            total_xp: nextXP,
            level: nextLevel,
            level_title: nextLevel >= 6 ? 'Legend' : nextLevel >= 4 ? 'Expert' : 'Learner'
          });
        }
        return;
      } catch (e) {
        console.warn("Supabase solve material request failed, using LocalStorage:", e);
      }
    }

    // LocalStorage fallback
    const hub = getLocalData(STORAGE_KEYS.HUB);
    const idx = hub.findIndex(i => i.id === requestId);
    if (idx !== -1) {
      hub[idx].status = 'solved';
      hub[idx].linked_file_id = fileId;
      setLocalData(STORAGE_KEYS.HUB, hub);
    }
  }

  // ═══════════════════════════════════════
  // WIKIS & STUDY PACKS (COLLECTIONS)
  // ═══════════════════════════════════════

  static async fetchSubjectWiki(subjectId: string): Promise<WikiSection[]> {
    return this.safeCall(
      async () => {
        const client = getSupabase();
        const { data, error } = await client!
          .from('community_hub')
          .select('*')
          .eq('subject_id', subjectId)
          .eq('type', 'wiki');
        return { data, error };
      },
      () => {
        const hub = getLocalData(STORAGE_KEYS.HUB);
        return hub.filter(item => item.subject_id === subjectId && item.type === 'wiki') as WikiSection[];
      }
    );
  }

  static async updateWikiSection(
    subjectId: string, 
    category: string, 
    content: string, 
    user: any
  ): Promise<WikiSection> {
    const updatedSection: WikiSection = {
      id: `wiki-${subjectId}-${category}`,
      subject_id: subjectId,
      type: 'wiki',
      category: category as any,
      content,
      user_id: user?.id || 'anonymous',
      user_username: user?.username || 'Verto Scholar',
      user_avatar: user?.avatar_url || '',
      updated_at: new Date().toISOString()
    };

    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client.from('community_hub')
          .upsert([{
            subject_id: subjectId,
            type: 'wiki',
            category,
            content,
            user_id: user?.id,
            user_username: user?.username,
            user_avatar: user?.avatar_url,
            updated_at: new Date().toISOString()
          }], { onConflict: 'subject_id,type,category' as any })
          .select()
          .maybeSingle();
        if (!error && data) return data as WikiSection;
      } catch (e) {}
    }

    // LocalStorage fallback
    const hub = getLocalData(STORAGE_KEYS.HUB);
    const existingIdx = hub.findIndex(i => i.subject_id === subjectId && i.type === 'wiki' && i.category === category);
    if (existingIdx !== -1) {
      hub[existingIdx] = updatedSection;
    } else {
      hub.push(updatedSection);
    }
    setLocalData(STORAGE_KEYS.HUB, hub);
    return updatedSection;
  }

  static async fetchSubjectStudyPacks(subjectId: string): Promise<StudyPack[]> {
    return this.safeCall(
      async () => {
        const client = getSupabase();
        const { data, error } = await client!
          .from('community_hub')
          .select('*')
          .eq('subject_id', subjectId)
          .eq('type', 'collection');
        return { data, error };
      },
      () => {
        const hub = getLocalData(STORAGE_KEYS.HUB);
        return hub.filter(item => item.subject_id === subjectId && item.type === 'collection') as StudyPack[];
      }
    );
  }

  static async createStudyPack(pack: Omit<StudyPack, 'id' | 'created_at' | 'follower_ids'>): Promise<StudyPack> {
    const newPack: StudyPack = {
      ...pack,
      id: 'pack-' + Math.random().toString(36).substr(2, 9),
      follower_ids: [],
      created_at: new Date().toISOString()
    };

    const client = getSupabase();
    if (client) {
      try {
        const { id, ...insertPayload } = newPack;
        const { data, error } = await client.from('community_hub').insert([insertPayload]).select().maybeSingle();
        if (error) {
          console.error("[Supabase Error in createStudyPack]:", error);
        }
        if (!error && data) return data as StudyPack;
      } catch (e) {
        console.error("[System Error in createStudyPack]:", e);
      }
    }

    const hub = getLocalData(STORAGE_KEYS.HUB);
    hub.push(newPack);
    setLocalData(STORAGE_KEYS.HUB, hub);
    return newPack;
  }

  static async toggleFollowStudyPack(packId: string, userId: string): Promise<void> {
    const client = getSupabase();
    if (client) {
      try {
        const { data: row } = await client.from('community_hub').select('follower_ids').eq('id', packId).maybeSingle();
        let followers = Array.isArray(row?.follower_ids) ? [...row.follower_ids] : [];
        if (followers.includes(userId)) {
          followers = followers.filter(id => id !== userId);
        } else {
          followers.push(userId);
        }
        await client.from('community_hub').update({ follower_ids: followers }).eq('id', packId);
        return;
      } catch (e) {}
    }

    // Local fallback
    const hub = getLocalData(STORAGE_KEYS.HUB);
    const idx = hub.findIndex(i => i.id === packId);
    if (idx !== -1) {
      let followers = Array.isArray(hub[idx].follower_ids) ? [...hub[idx].follower_ids] : [];
      if (followers.includes(userId)) {
        followers = followers.filter((id: string) => id !== userId);
      } else {
        followers.push(userId);
      }
      hub[idx].follower_ids = followers;
      setLocalData(STORAGE_KEYS.HUB, hub);
    }
  }

  // ═══════════════════════════════════════
  // SUBJECT CHATS
  // ═══════════════════════════════════════

  static async fetchChatMessages(subjectId: string, channel: string): Promise<SubjectChatMsg[]> {
    return this.safeCall(
      async () => {
        const client = getSupabase();
        const { data, error } = await client!
          .from('community_hub')
          .select('*')
          .eq('subject_id', subjectId)
          .eq('type', 'chat')
          .eq('chat_channel', channel)
          .order('created_at', { ascending: true })
          .limit(100);
        return { data, error };
      },
      () => {
        const hub = getLocalData(STORAGE_KEYS.HUB);
        return hub.filter(item => item.subject_id === subjectId && item.type === 'chat' && item.chat_channel === channel) as SubjectChatMsg[];
      }
    );
  }

  static async sendChatMessage(
    subjectId: string, 
    channel: string, 
    content: string, 
    user: any
  ): Promise<SubjectChatMsg> {
    const newMsg: SubjectChatMsg = {
      id: 'chat-' + Math.random().toString(36).substr(2, 9),
      subject_id: subjectId,
      type: 'chat',
      chat_channel: channel,
      content,
      user_id: user?.id || 'anonymous',
      user_username: user?.username || 'Anonymous Verto',
      user_avatar: user?.avatar_url || '',
      created_at: new Date().toISOString()
    };

    const client = getSupabase();
    if (client) {
      try {
        const { id, ...insertPayload } = newMsg;
        const { data, error } = await client.from('community_hub').insert([insertPayload]).select().maybeSingle();
        if (error) {
          console.error("[Supabase Error in sendChatMessage]:", error);
        }
        if (!error && data) return data as SubjectChatMsg;
      } catch (e) {
        console.error("[System Error in sendChatMessage]:", e);
      }
    }

    const hub = getLocalData(STORAGE_KEYS.HUB);
    hub.push(newMsg);
    setLocalData(STORAGE_KEYS.HUB, hub);
    return newMsg;
  }

  // ═══════════════════════════════════════
  // MEMBERSHIP JOIN/LEAVE
  // ═══════════════════════════════════════

  static async joinSubject(subjectId: string, userId: string): Promise<void> {
    const client = getSupabase();
    if (client) {
      try {
        const { data: profile } = await client.from('profiles').select('joined_subjects').eq('id', userId).maybeSingle();
        const joined = Array.isArray(profile?.joined_subjects) ? [...profile.joined_subjects] : [];
        if (!joined.includes(subjectId)) {
          joined.push(subjectId);
          await client.from('profiles').update({ joined_subjects: joined }).eq('id', userId);
        }
        return;
      } catch (e) {}
    }

    // Local storage membership
    const joined = getLocalData('scholix_joined_subjects_' + userId);
    if (!joined.includes(subjectId)) {
      joined.push(subjectId);
      setLocalData('scholix_joined_subjects_' + userId, joined);
    }
  }

  static async leaveSubject(subjectId: string, userId: string): Promise<void> {
    const client = getSupabase();
    if (client) {
      try {
        const { data: profile } = await client.from('profiles').select('joined_subjects').eq('id', userId).maybeSingle();
        const joined = Array.isArray(profile?.joined_subjects) ? [...profile.joined_subjects] : [];
        const filtered = joined.filter(id => id !== subjectId);
        await client.from('profiles').update({ joined_subjects: filtered }).eq('id', userId);
        return;
      } catch (e) {}
    }

    const joined = getLocalData('scholix_joined_subjects_' + userId);
    const filtered = joined.filter((id: string) => id !== subjectId);
    setLocalData('scholix_joined_subjects_' + userId, filtered);
  }

  static async isJoined(subjectId: string, userId: string): Promise<boolean> {
    const client = getSupabase();
    if (client) {
      try {
        const { data: profile } = await client.from('profiles').select('joined_subjects').eq('id', userId).maybeSingle();
        const joined = Array.isArray(profile?.joined_subjects) ? profile.joined_subjects : [];
        return joined.includes(subjectId);
      } catch (e) {}
    }

    const joined = getLocalData('scholix_joined_subjects_' + userId);
    return joined.includes(subjectId);
  }

  // ═══════════════════════════════════════
  // FACULTY PAGES
  // ═══════════════════════════════════════

  static async fetchFacultyProfile(facultyName: string): Promise<FacultyProfile | null> {
    // Exact name match or fuzzy
    const faculties = getLocalData(STORAGE_KEYS.FACULTIES) as FacultyProfile[];
    const match = faculties.find(f => f.name.toLowerCase().trim() === facultyName.toLowerCase().trim());
    if (match) return match;

    // Create a mock profile if not found
    const newFac: FacultyProfile = {
      id: 'fac-' + Math.random().toString(36).substr(2, 9),
      name: facultyName,
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80',
      designation: 'Faculty Member',
      department: 'Computer Science',
      courses: ['CSE101', 'INT306'],
      rating: 4.5,
      reviews: [
        { username: 'Scholar', rating: 5, text: 'Very helpful and supportive during course delivery.', created_at: new Date().toISOString() }
      ],
      announcements: [
        { id: 'fa-temp', title: 'Consultation Hours', content: 'Consultation hours are Wednesday 3 PM - 5 PM in Room 302.', created_at: new Date().toISOString() }
      ]
    };
    faculties.push(newFac);
    setLocalData(STORAGE_KEYS.FACULTIES, faculties);
    return newFac;
  }

  static async submitFacultyReview(facultyId: string, reviewerName: string, rating: number, text: string): Promise<void> {
    const faculties = getLocalData(STORAGE_KEYS.FACULTIES) as FacultyProfile[];
    const fac = faculties.find(f => f.id === facultyId);
    if (fac) {
      fac.reviews.push({
        username: reviewerName,
        rating,
        text,
        created_at: new Date().toISOString()
      });
      // Recalculate average rating
      const total = fac.reviews.reduce((acc, curr) => acc + curr.rating, 0);
      fac.rating = Number((total / fac.reviews.length).toFixed(1));
      setLocalData(STORAGE_KEYS.FACULTIES, faculties);
    }
  }

  // ═══════════════════════════════════════
  // DOCUMENTS REACTION & RATINGS (documents table)
  // ═══════════════════════════════════════

  static async submitFileRating(fileId: string, userId: string, score: number): Promise<void> {
    const client = getSupabase();
    if (client) {
      try {
        const { data: file } = await client.from('documents').select('rating_votes').eq('id', fileId).maybeSingle();
        const ratingVotes = file?.rating_votes || {};
        ratingVotes[userId] = score;
        await client.from('documents').update({ rating_votes: ratingVotes }).eq('id', fileId);
        return;
      } catch (e) {}
    }

    // Local Storage mock rating
    const ratings = getLocalData('scholix_mock_documents_ratings');
    const existing = ratings.find((r: any) => r.id === fileId) || { id: fileId, rating_votes: {} };
    existing.rating_votes[userId] = score;
    const filtered = ratings.filter((r: any) => r.id !== fileId);
    filtered.push(existing);
    setLocalData('scholix_mock_documents_ratings', filtered);
  }

  static async fetchFileCommunityData(fileId: string): Promise<{
    comments: PostComment[];
    reactions: ReactionContainer;
    averageRating: number;
    ratingVotesCount: number;
    downloads: number;
  }> {
    const client = getSupabase();
    if (client) {
      try {
        const { data: file } = await client.from('documents').select('comments, reactions, rating_votes, downloads').eq('id', fileId).maybeSingle();
        if (file) {
          const ratingVotes = file.rating_votes || {};
          const votesArray = Object.values(ratingVotes) as number[];
          const avg = votesArray.length > 0 ? Number((votesArray.reduce((acc, v) => acc + v, 0) / votesArray.length).toFixed(1)) : 0;
          return {
            comments: Array.isArray(file.comments) ? file.comments : [],
            reactions: file.reactions || { helpful: [], quality: [], important: [] },
            averageRating: avg,
            ratingVotesCount: votesArray.length,
            downloads: file.downloads || 0
          };
        }
      } catch (e) {}
    }

    // Fallback
    const commentsList = getLocalData('scholix_mock_documents_comments');
    const reactionsList = getLocalData('scholix_mock_documents_reactions');
    const ratingsList = getLocalData('scholix_mock_documents_ratings');

    const fileComments = commentsList.find((c: any) => c.id === fileId)?.comments || [];
    const fileReactions = reactionsList.find((r: any) => r.id === fileId)?.reactions || { helpful: [], quality: [], important: [] };
    const fileRatings = ratingsList.find((r: any) => r.id === fileId)?.rating_votes || {};

    const votesArray = Object.values(fileRatings) as number[];
    const avg = votesArray.length > 0 ? Number((votesArray.reduce((acc, v) => acc + v, 0) / votesArray.length).toFixed(1)) : 0;

    return {
      comments: fileComments,
      reactions: fileReactions,
      averageRating: avg,
      ratingVotesCount: votesArray.length,
      downloads: 0
    };
  }

  static async recordFileDownload(fileId: string): Promise<void> {
    const client = getSupabase();
    if (client) {
      try {
        const { data } = await client.from('documents').select('downloads').eq('id', fileId).maybeSingle();
        const current = data?.downloads || 0;
        await client.from('documents').update({ downloads: current + 1 }).eq('id', fileId);
      } catch (e) {}
    }
  }
}

export default CommunityService;
