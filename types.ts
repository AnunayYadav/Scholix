
export enum ModuleType {
  DASHBOARD = 'DASHBOARD',
  PLACEMENT = 'PLACEMENT',
  LIBRARY = 'LIBRARY',
  CAMPUS = 'CAMPUS',
  FRESHERS = 'FRESHERS',
  HELP = 'HELP',
  CGPA = 'CGPA',
  ATTENDANCE = 'ATTENDANCE',
  SHARE_CGPA = 'SHARE_CGPA',
  ABOUT = 'ABOUT',
  PROFILE = 'PROFILE',
  TIMETABLE = 'TIMETABLE',
  QUIZ = 'QUIZ',
  MARKETPLACE = 'MARKETPLACE',
  ROOMMATE = 'ROOMMATE',
  EMERGENCY = 'EMERGENCY',
  AI_TOOLS = 'AI_TOOLS',
  ADMIN_STATS = 'ADMIN_STATS'
}

export interface MarketplaceItem {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  status: 'Available' | 'Sold';
  created_at: string;
  seller_username?: string;
  seller_avatar?: string;
  seller_is_admin?: boolean;
  seller_phone?: string;
  location?: string;
}

export interface RoommateRequest {
  id: string;
  user_id: string;
  location: string;
  budget: string;
  preferences: string;
  gender_preference: string;
  status: 'Active' | 'Found';
  created_at: string;
  user_username?: string;
  user_avatar?: string;
  user_is_admin?: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  designation: string;
  phone: string;
  email: string;
  category: 'Administration' | 'Hostel' | 'Security' | 'Healthcare' | 'Helpdesk';
}

export interface AITool {
  id: string;
  name: string;
  description: string;
  url: string;
  category: 'Writing' | 'Coding' | 'Research' | 'Design' | 'General' | 'Productivity' | 'Presentations' | 'Video' | 'Audio' | 'Business';
  pricing: 'Free' | 'Freemium' | 'Paid';
  tags: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  is_admin: boolean;
  username?: string;
  registration_number?: string;
  program?: string;
  batch?: string;
  bio?: string;
  avatar_url?: string;
  is_public?: boolean;
  last_seen?: string;
  blocked_users?: string[];
}

export interface TimetableSlot {
  id: string;
  subject: string;
  room: string;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  type: 'class' | 'break' | 'lab';
}

export interface DaySchedule {
  day: string;
  slots: TimetableSlot[];
}

export interface TimetableData {
  ownerName: string;
  ownerId: string;
  schedule: DaySchedule[];
  section?: string;
  year?: string;
  branch?: string;
  semester?: string;
}

export interface ResumeCategoryDetail {
  score: number;
  description: string;
  found: string[];
  missing: string[];
  missingKeywordsExtended?: { name: string; example: string; importance: string }[];
}

export interface AnnotatedFragment {
  text: string;
  type: 'good' | 'bad' | 'neutral';
  reason?: string;
  suggestion?: string;
}

export interface ResumeAnalysisResult {
  totalScore: number;
  meaningScore: number;
  keywordQuality: {
    contextual: number;
    weak: number;
    stuffed: number;
  };
  annotatedContent: AnnotatedFragment[];
  categories: {
    keywordAnalysis: ResumeCategoryDetail;
    jobFit: ResumeCategoryDetail;
    achievements: ResumeCategoryDetail;
    formatting: ResumeCategoryDetail;
    language: ResumeCategoryDetail;
    branding: ResumeCategoryDetail;
  };
  flags: {
    type: 'warning' | 'critical' | 'success';
    message: string;
  }[];
  summary: string;
  analysisDate: number;
}

export interface QuizQuestion {
  unit: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}



export interface LibraryFile {
  id: string;
  name: string;
  description?: string;
  subject: string;
  semester: string;
  type: string;
  uploadDate: number;
  size: string;
  status: 'pending' | 'approved' | 'rejected';
  storage_path: string;
  uploader_id?: string;
  uploader_username?: string;
  uploader_is_admin?: boolean;
  admin_notes?: string;
  isUserUploaded?: boolean;
  program: string;
  display_order?: number;
  pending_update?: {
    name: string;
    description: string;
    subject: string;
    semester: string;
    type: string;
    admin_notes?: string;
  } | null;
}

export interface Folder {
  id: string;
  name: string;
  type: 'semester' | 'subject' | 'category';
  parent_id: string | null;
  program: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  maps?: {
    uri?: string;
    title?: string;
  };
}

export interface NexusNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
  read: boolean;
  created_at: string;
}

declare global {
  interface Window {
    pdfjsLib: any;
    mermaid: any;
  }
}
