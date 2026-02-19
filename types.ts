
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
  QUIZ = 'QUIZ'
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
  admin_notes?: string;
  isUserUploaded?: boolean;
  program: string;
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

declare global {
  interface Window {
    pdfjsLib: any;
    mermaid: any;
  }
}
