import { create } from 'zustand';

// ═══════════════════════════════════════
// Level System Constants
// ═══════════════════════════════════════
export const LEVEL_THRESHOLDS = [
  { level: 1, minXP: 0, maxXP: 199, title: 'Beginner', icon: '🌱' },
  { level: 2, minXP: 200, maxXP: 499, title: 'Learner', icon: '📘', rewardFrame: 'Learner.png' },
  { level: 3, minXP: 500, maxXP: 999, title: 'Scholar', icon: '⭐' },
  { level: 4, minXP: 1000, maxXP: 1999, title: 'Expert', icon: '🔥' },
  { level: 5, minXP: 2000, maxXP: 3499, title: 'Master', icon: '👑', rewardFrame: 'Master.png' },
  { level: 6, minXP: 3500, maxXP: 6499, title: 'Legend', icon: '🏆', rewardFrame: 'Legend.png' },
  { level: 7, minXP: 6500, maxXP: 9999, title: 'Grandmaster', icon: '🎖️', rewardFrame: 'Grandmaster.png' },
  { level: 8, minXP: 10000, maxXP: Infinity, title: 'Immortal', icon: '♾️', rewardFrame: 'Immortal.png' },
];

export const STREAK_MILESTONES = [
  { days: 3, bonus: 20, label: 'Heating Up 🔥' },
  { days: 7, bonus: 50, label: 'On Fire 🔥' },
  { days: 14, bonus: 100, label: 'Unstoppable ⚡' },
  { days: 30, bonus: 200, label: 'Legend 👑' },
];

export function getLevelInfo(totalXP: number) {
  const level = LEVEL_THRESHOLDS.find(l => totalXP >= l.minXP && totalXP <= l.maxXP) || LEVEL_THRESHOLDS[0];
  const nextLevel = LEVEL_THRESHOLDS.find(l => l.level === level.level + 1);
  const xpInLevel = totalXP - level.minXP;
  const xpForLevel = nextLevel ? (nextLevel.minXP - level.minXP) : 1;
  const progress = nextLevel ? Math.min(100, Math.round((xpInLevel / xpForLevel) * 100)) : 100;
  return { ...level, xpInLevel, xpForLevel, progress, nextLevel };
}

// ═══════════════════════════════════════
// XP Breakdown Type
// ═══════════════════════════════════════
export interface XPBreakdownItem {
  label: string;
  value: number;
}

export interface XPResult {
  breakdown: XPBreakdownItem[];
  totalEarned: number;
  newTotalXP: number;
  leveledUp: boolean;
  newLevel?: typeof LEVEL_THRESHOLDS[0];
  streakBonus?: typeof STREAK_MILESTONES[0];
  updatedHistory?: { quiz_id: string; xp_earned: number; breakdown: XPBreakdownItem[]; earned_at: string }[];
}

// ═══════════════════════════════════════
// Featured Quiz & Challenge Types
// ═══════════════════════════════════════
export interface FeaturedQuiz {
  id: string;
  date: string;
  name: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: any[];
  units: string[];
  xp_reward: number;
  generated_at: string;
}

export interface ActiveChallenge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  subject: string;
  difficulty: number; // 1-3 stars
  question_count: number;
  time_limit_per_question: number;
  xp_reward: number;
  starts_at: string;
  expires_at: string;
  units: string[];
  min_level?: number;
}

export interface UserQuizProfile {
  total_xp: number;
  level: number;
  level_title: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  streak_history: { date: string; count: number }[];
  xp_history: { quiz_id: string; xp_earned: number; breakdown: XPBreakdownItem[]; earned_at: string }[];
  unlocked_frames?: string[];
  avatar_frame?: string;
}

export interface UserCompletion {
  quiz_id: string;
  type: 'featured' | 'challenge' | 'custom';
  score_percentage: number;
  xp_earned: number;
  completed_at: string;
}

// ═══════════════════════════════════════
// Zustand Store
// ═══════════════════════════════════════
interface QuizDashboardState {
  // User quiz profile
  userQuizProfile: UserQuizProfile;
  setUserQuizProfile: (profile: UserQuizProfile) => void;
  updateUserQuizProfile: (update: Partial<UserQuizProfile>) => void;

  // Featured quiz
  featuredQuiz: FeaturedQuiz | null;
  setFeaturedQuiz: (quiz: FeaturedQuiz | null) => void;
  featuredCompleted: boolean;
  setFeaturedCompleted: (completed: boolean) => void;
  featuredScore: number | null;
  setFeaturedScore: (score: number | null) => void;

  // Active challenges
  activeChallenges: ActiveChallenge[];
  setActiveChallenges: (challenges: ActiveChallenge[]) => void;
  completedChallengeIds: Set<string>;
  markChallengeCompleted: (id: string) => void;

  // XP animation
  showXPBreakdown: boolean;
  setShowXPBreakdown: (show: boolean) => void;
  lastXPResult: XPResult | null;
  setLastXPResult: (result: XPResult | null) => void;

  // Level up
  showLevelUp: boolean;
  setShowLevelUp: (show: boolean) => void;

  // Streak toast
  streakToastMessage: string | null;
  setStreakToastMessage: (msg: string | null) => void;

  // Dashboard view
  dashboardView: 'dashboard' | 'history' | 'quiz' | 'results';
  setDashboardView: (view: 'dashboard' | 'history' | 'quiz' | 'results') => void;


  // User completions for today
  todayCompletions: UserCompletion[];
  setTodayCompletions: (completions: UserCompletion[]) => void;

  // Loading
  isDashboardLoading: boolean;
  setIsDashboardLoading: (loading: boolean) => void;
}

const DEFAULT_PROFILE: UserQuizProfile = {
  total_xp: 0,
  level: 1,
  level_title: 'Beginner',
  current_streak: 0,
  longest_streak: 0,
  last_active_date: null,
  streak_history: [],
  xp_history: [],
};

export const useQuizDashboardStore = create<QuizDashboardState>((set) => ({
  userQuizProfile: DEFAULT_PROFILE,
  setUserQuizProfile: (profile) => set({ userQuizProfile: profile }),
  updateUserQuizProfile: (update) => set((state) => ({
    userQuizProfile: { ...state.userQuizProfile, ...update }
  })),

  featuredQuiz: null,
  setFeaturedQuiz: (quiz) => set({ featuredQuiz: quiz }),
  featuredCompleted: false,
  setFeaturedCompleted: (completed) => set({ featuredCompleted: completed }),
  featuredScore: null,
  setFeaturedScore: (score) => set({ featuredScore: score }),

  activeChallenges: [],
  setActiveChallenges: (challenges) => set({ activeChallenges: challenges }),
  completedChallengeIds: new Set(),
  markChallengeCompleted: (id) =>
    set((state) => ({
      completedChallengeIds: new Set([...state.completedChallengeIds, id]),
    })),

  showXPBreakdown: false,
  setShowXPBreakdown: (show) => set({ showXPBreakdown: show }),
  lastXPResult: null,
  setLastXPResult: (result) => set({ lastXPResult: result }),

  showLevelUp: false,
  setShowLevelUp: (show) => set({ showLevelUp: show }),

  streakToastMessage: null,
  setStreakToastMessage: (msg) => set({ streakToastMessage: msg }),

  dashboardView: 'dashboard',
  setDashboardView: (view) => set({ dashboardView: view }),

  todayCompletions: [],
  setTodayCompletions: (completions) => set({ todayCompletions: completions }),

  isDashboardLoading: true,
  setIsDashboardLoading: (loading) => set({ isDashboardLoading: loading }),
}));
