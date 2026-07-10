import { LibraryFile } from '../types';

export type CommunityHubType = 'post' | 'request' | 'wiki' | 'collection' | 'chat';

export interface ReactionContainer {
  helpful: string[]; // User UUIDs
  quality: string[]; // User UUIDs
  important: string[]; // User UUIDs
}

export interface PostComment {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  content: string;
  created_at: string;
  reactions?: ReactionContainer;
  replies?: PostComment[];
}

export interface PollOption {
  id: number;
  text: string;
}

export interface CommunityPost {
  id: string;
  subject_id: string;
  user_id: string;
  user_username: string;
  user_avatar?: string;
  type: 'post';
  category: 'discussion' | 'doubt' | 'poll' | 'question' | 'resource' | 'announcement';
  title: string;
  content: string;
  tags: string[];
  reactions: ReactionContainer;
  comments: PostComment[];
  poll_options?: PollOption[];
  poll_votes?: Record<string, number>; // user_uuid -> option_id
  linked_file_id?: string;
  linked_file?: LibraryFile; // Loaded at runtime
  verified_status: 'none' | 'faculty' | 'admin' | 'community';
  difficulty?: 'easy' | 'medium' | 'hard';
  exam_type?: 'midterm' | 'endterm' | 'quiz' | 'assignment' | 'lab' | 'general';
  created_at: string;
  updated_at: string;
  is_pinned?: boolean;
}

export interface MaterialRequest {
  id: string;
  subject_id: string;
  user_id: string;
  user_username: string;
  user_avatar?: string;
  type: 'request';
  title: string;
  content: string;
  bounty_xp: number;
  status: 'open' | 'solved';
  linked_file_id?: string;
  linked_file?: LibraryFile;
  reactions: ReactionContainer;
  comments: PostComment[];
  created_at: string;
}

export interface StudyPack {
  id: string;
  subject_id: string;
  user_id: string;
  user_username: string;
  user_avatar?: string;
  type: 'collection';
  title: string;
  content: string;
  file_ids: string[];
  follower_ids: string[];
  created_at: string;
}

export interface WikiSection {
  id: string;
  subject_id: string;
  type: 'wiki';
  category: 'roadmap' | 'reference_books' | 'exam_pattern' | 'teacher_info' | 'best_videos' | 'resources';
  content: string;
  user_id: string;
  user_username: string;
  user_avatar?: string;
  updated_at: string;
}

export interface SubjectChatMsg {
  id: string;
  subject_id: string;
  user_id: string;
  user_username: string;
  user_avatar?: string;
  type: 'chat';
  chat_channel: string; // '#general', '#midterm', '#placements'
  content: string;
  created_at: string;
}

export interface SubjectStats {
  rating: number;
  membersCount: number;
  filesCount: number;
  discussionsCount: number;
  requestsCount: number;
  examCountdownDays: number;
  onlineCount: number;
}

export interface FacultyProfile {
  id: string;
  name: string;
  avatar_url?: string;
  designation?: string;
  department?: string;
  courses: string[]; // Course names/codes
  rating: number;
  reviews: { username: string; avatar?: string; rating: number; text: string; created_at: string }[];
  announcements: { id: string; title: string; content: string; created_at: string }[];
}
