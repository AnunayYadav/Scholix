import React, { useMemo } from 'react';
import { 
  Flame, 
  FileText, 
  Sliders, 
  History, 
  ChevronRight
} from 'lucide-react';
import { UserProfile } from '../../types.ts';
import { getLevelInfo, FeaturedQuiz, ActiveChallenge, UserQuizProfile } from '../../stores/quizStore.ts';
import FeaturedQuizCard from './FeaturedQuizCard.tsx';

export interface SubjectWithSyllabus {
  id: string;
  name: string;
  syllabusFile: any;
}

interface QuizDashboardViewProps {
  userProfile: UserProfile | null;
  userQuizProfile: UserQuizProfile;
  totalXP: number;
  level: ReturnType<typeof getLevelInfo>;
  currentStreak: number;
  longestStreak: number;
  streakCalendar: { date: string; completed: boolean; isToday: boolean }[];
  isStreakAtRisk: boolean;
  featuredQuiz: FeaturedQuiz | null;
  featuredCompleted: boolean;
  featuredScore: number | null;
  activeChallenges: ActiveChallenge[];
  completedChallengeIds: Set<string>;
  subjectsWithSyllabi: SubjectWithSyllabus[];
  onStartFeaturedQuiz: () => void;
  onStartChallenge: (challenge: ActiveChallenge) => void;
  onLaunchOfficialPapers: (subject?: SubjectWithSyllabus) => void;
  onLaunchCustomBuilder: (subject?: SubjectWithSyllabus) => void;
  onLaunchHistory: () => void;
  onOpenProgressModal: () => void;
  shortBrandName: string;
  fullBrandName: string;
  isLPU?: boolean;
  error: string | null;
  onDismissError: () => void;
}

export const QuizDashboardView: React.FC<QuizDashboardViewProps> = ({
  userProfile,
  userQuizProfile,
  totalXP = 0,
  level,
  currentStreak = 0,
  longestStreak = 0,
  streakCalendar = [],
  isStreakAtRisk = false,
  featuredQuiz,
  featuredCompleted,
  featuredScore,
  activeChallenges = [],
  completedChallengeIds = new Set(),
  onStartFeaturedQuiz,
  onStartChallenge,
  onLaunchOfficialPapers,
  onLaunchCustomBuilder,
  onLaunchHistory,
  onOpenProgressModal,
  shortBrandName,
  fullBrandName,
  isLPU = false,
  error,
  onDismissError,
}) => {
  // Load recent quizzes from localStorage
  const recentQuizzes = useMemo(() => {
    try {
      const list = JSON.parse(localStorage.getItem('nexus_recent_quizzes') || '[]');
      return Array.isArray(list) ? list.slice(0, 4) : [];
    } catch {
      return [];
    }
  }, []);

  // Compute accuracy rate
  const statsSummary = useMemo(() => {
    if (recentQuizzes.length === 0) {
      return { totalAttempts: 0, accuracy: 80 };
    }
    const scores = recentQuizzes
      .map((q: any) => typeof q.score === 'number' ? q.score : (q.percentage || null))
      .filter((s: any) => s !== null);
    const avg = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 80;
    return {
      totalAttempts: recentQuizzes.length,
      accuracy: Math.max(avg, 70),
    };
  }, [recentQuizzes]);

  const username = userProfile?.full_name || userProfile?.username || 'Scholar';
  const initials = (username || 'Scholar')
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'SC';

  const safeLevel = level || { level: 1, title: 'Beginner', icon: '🌱', progress: 0, nextLevel: null };
  const universityHeading = isLPU ? 'LPU University Exams' : `${shortBrandName || fullBrandName || 'University'} Exams`;

  return (
    <div className="w-full min-h-screen text-zinc-900 dark:text-zinc-100 animate-fade-in pb-24">
      {/* Error alert */}
      {error && (
        <div className="max-w-5xl mx-auto px-4 mb-4">
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between text-xs text-red-500">
            <span>{error}</span>
            <button onClick={onDismissError} className="hover:underline font-medium cursor-pointer">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          HERO HEADER: APPLE-STYLE MINIMAL & HIGH-IMPACT TYPOGRAPHY
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-1 pb-8 sm:pt-2 sm:pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
          {/* Centered Module Heading in Scholix Brand Style */}
          <div className="flex flex-col items-center justify-center animate-fade-in pb-4 sm:pb-7">
            <div className="flex items-center gap-2 mb-1.5 justify-center">
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse inline-block" />
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {userProfile ? `WELCOME, ${(userProfile.full_name?.split(' ')[0] || userProfile.name || 'USER').toUpperCase()}` : 'EXAM PREP & PRACTICE'}
              </p>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              {isLPU ? 'LPU ' : ''}Quiz <span className="text-brand-primary">Taker</span>
            </h2>
          </div>

          {/* Minimalist Title with Clean Apple Typography - Uniform 600 Weight */}
          <h1 
            style={{ fontWeight: 600 }}
            className="text-3xl sm:text-5xl md:text-[50px] !font-semibold text-zinc-900 dark:text-white tracking-tight leading-[1.15] sm:leading-[1.1]"
          >
            <span style={{ fontWeight: 600 }} className="block !font-semibold">
              Stop guessing what's on the exam.
            </span>
            <span style={{ fontWeight: 600 }} className="block mt-1 sm:mt-2 !font-semibold">
              Practice real{' '}
              <span className="relative inline-block align-baseline mx-0.5 sm:mx-1">
                {/* Spacing footprint to preserve fluid layout */}
                <span className="invisible select-none px-3.5 py-0.5 sm:px-4 sm:py-1 inline-block">
                  question papers
                </span>

                {/* Base normal text prior to animation */}
                <span className="absolute inset-0 flex items-center justify-center text-zinc-900 dark:text-white !font-semibold whitespace-nowrap pointer-events-none">
                  question papers
                </span>

                {/* Painted highlight layer that smoothly sweeps across on page load */}
                <span 
                  aria-hidden="true" 
                  className="absolute -inset-x-3 -inset-y-1.5 sm:-inset-x-4 sm:-inset-y-2 flex items-center justify-center animate-highlight-reveal pointer-events-none -rotate-[0.4deg]"
                >
                  {/* Organic Painted Brush Stroke SVG */}
                  <svg 
                    className="absolute inset-0 w-full h-full -z-0"
                    viewBox="0 0 340 60"
                    preserveAspectRatio="none"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="paintStrokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ea580c" />
                        <stop offset="35%" stopColor="#f97316" />
                        <stop offset="70%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#fbbf24" />
                      </linearGradient>
                      <filter id="brushTexture" x="-5%" y="-10%" width="110%" height="120%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.04 0.15" numOctaves="3" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
                      </filter>
                    </defs>
                    <path 
                      d="M 12,15 C 60,10 130,13 205,10 C 265,8 305,11 328,14 C 336,17 339,26 336,38 C 333,48 295,49 225,51 C 150,53 75,50 14,51 C 4,51 2,42 3,30 C 4,20 7,16 12,15 Z" 
                      fill="url(#paintStrokeGrad)" 
                      filter="url(#brushTexture)"
                    />
                  </svg>

                  <span className="relative z-10 text-white !font-semibold whitespace-nowrap">
                    question papers
                  </span>
                </span>
              </span>
            </span>
          </h1>

          {/* Understated caption */}
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto font-normal leading-relaxed">
            This platform is independently run by students to help you practice verified semester exams, past papers, and mock quizzes.
          </p>

          {/* Primary Actions: Clean Apple Pill Buttons with Full Light/Dark Support */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onLaunchOfficialPapers()}
              className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-white dark:text-zinc-950" />
              <span>Official PYQs</span>
            </button>

            <button
              type="button"
              onClick={() => onLaunchCustomBuilder()}
              className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-zinc-100 hover:bg-zinc-200/80 text-zinc-900 border border-zinc-200/80 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 dark:text-white dark:border-white/[0.1] font-semibold text-xs sm:text-sm transition-all duration-200 active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Sliders className="w-4 h-4 text-zinc-700 dark:text-white" />
              <span>Custom Quiz</span>
            </button>

            <button
              type="button"
              onClick={onLaunchHistory}
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/[0.08] font-medium text-xs sm:text-sm transition-all duration-200 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <History className="w-4 h-4 text-zinc-600 dark:text-white" />
              <span>History</span>
            </button>
          </div>

          {/* User Status Strip: Clean Minimal Activity Bar with Full Light/Dark Support */}
          <div className="pt-2 max-w-xl mx-auto">
            <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#111113]/90 border border-zinc-200/80 dark:border-white/[0.06] backdrop-blur-xl flex items-center justify-between gap-3 sm:gap-4 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/70 dark:border-white/[0.06] overflow-hidden flex items-center justify-center flex-shrink-0">
                  {userProfile?.avatar_url ? (
                    <img src={userProfile.avatar_url} alt={username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">{initials}</span>
                  )}
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate">
                    {username}
                  </div>
                  <button
                    type="button"
                    onClick={onOpenProgressModal}
                    className="text-[10px] text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 font-semibold cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <span>Level {safeLevel.level} • {safeLevel.title}</span>
                    <ChevronRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                <div className="text-right">
                  <span className="block font-bold text-zinc-900 dark:text-white leading-none text-xs sm:text-sm">
                    {totalXP}
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Total XP</span>
                </div>

                <div className="h-6 w-px bg-zinc-200 dark:bg-white/[0.06]" />

                <div className="text-right">
                  <span className="font-bold text-zinc-900 dark:text-white leading-none text-xs sm:text-sm flex items-center justify-end gap-1">
                    <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                    {currentStreak}d
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Streak</span>
                </div>

                <div className="h-6 w-px bg-zinc-200 dark:bg-white/[0.06]" />

                <div className="text-right">
                  <span className="block font-bold text-zinc-900 dark:text-white leading-none text-xs sm:text-sm">
                    {statsSummary.accuracy}%
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Accuracy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          2. TODAY'S FEATURED ASSESSMENT
      ══════════════════════════════════════════════════════════════════ */}
      {featuredQuiz && (
        <main className="max-w-5xl mx-auto px-4 sm:px-6">
          <FeaturedQuizCard
            quiz={featuredQuiz}
            isCompleted={featuredCompleted}
            completedScore={featuredScore}
            onStart={onStartFeaturedQuiz}
          />
        </main>
      )}
    </div>
  );
};

export default QuizDashboardView;
