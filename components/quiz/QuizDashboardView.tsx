import React, { useMemo, useState, useEffect } from 'react';
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

const DYNAMIC_PHRASES = [
  'previous year questions',
  'topic wise questions',
  'practice mcq questions',
  'most important questions',
  'unit-wise questions',
];

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

  // Dynamic rotating typewriter effect for hero subtitle
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState(DYNAMIC_PHRASES[0]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentTarget = DYNAMIC_PHRASES[phraseIndex % DYNAMIC_PHRASES.length];

    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayText.length < currentTarget.length) {
        // Typing forward
        timer = setTimeout(() => {
          setDisplayText(currentTarget.slice(0, displayText.length + 1));
        }, 75);
      } else {
        // Pause at full word before deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    } else {
      if (displayText.length > 0) {
        // Backspacing
        timer = setTimeout(() => {
          setDisplayText(currentTarget.slice(0, displayText.length - 1));
        }, 38);
      } else {
        // Finished backspacing, switch to next phrase after a brief breath
        timer = setTimeout(() => {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % DYNAMIC_PHRASES.length);
        }, 220);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, phraseIndex]);

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
      <section className="relative pt-3 pb-8 sm:pt-5 sm:pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
          {/* Top Brand Pill: A product by Scholix */}
          <div className="flex justify-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100/90 dark:bg-white/[0.04] border border-zinc-200/70 dark:border-white/[0.08] text-xs font-medium text-zinc-600 dark:text-zinc-400 shadow-2xs hover:bg-zinc-200/60 dark:hover:bg-white/[0.07] transition-all">
              <span>A product by</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-white">
                <span className="w-4 h-4 rounded-full bg-brand-primary text-white text-[9px] font-black flex items-center justify-center leading-none">
                  S
                </span>
                <span>Scholix</span>
              </span>
            </div>
          </div>

          {/* Proper heading like in other Scholix components */}
          <div className="flex flex-col items-center justify-center animate-fade-in space-y-1">
            <div className="flex items-center gap-2 mb-1 justify-center">
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse inline-block" />
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {userProfile ? `WELCOME, ${(userProfile.full_name?.split(' ')[0] || userProfile.name || userProfile.username || 'USER').toUpperCase()}` : 'EXAM PREP & PRACTICE'}
              </p>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Quiz <span className="text-brand-primary">Taker</span>
            </h1>
          </div>

          {/* Dynamic Animated Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-zinc-600 dark:text-zinc-400 font-normal max-w-xl mx-auto leading-relaxed">
            Solve{' '}
            <span className="font-semibold text-blue-600 dark:text-blue-400 inline-flex items-center tracking-normal">
              <span>{displayText}</span>
              <span className="inline-block w-[2px] h-[1.1em] bg-blue-600 dark:bg-blue-400 ml-0.5 rounded-full animate-pulse" />
            </span>{' '}
            with answers and explanations.
          </p>

          {/* Primary Actions: Clean Apple Pill Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={() => onLaunchOfficialPapers()}
              className="group px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-zinc-900 hover:bg-black text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-semibold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 flex items-center gap-2 cursor-pointer border-none"
            >
              <FileText className="w-4 h-4 text-white dark:text-zinc-950 transition-transform group-hover:scale-110" />
              <span>Official PYQs</span>
            </button>

            <button
              type="button"
              onClick={() => onLaunchCustomBuilder()}
              className="group px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-white hover:bg-zinc-50/80 text-zinc-900 border border-zinc-200/90 dark:bg-[#161619] dark:hover:bg-zinc-800 dark:text-zinc-100 dark:border-white/[0.08] font-semibold text-xs sm:text-sm transition-all duration-200 active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs hover:border-zinc-300 dark:hover:border-white/[0.15]"
            >
              <Sliders className="w-4 h-4 text-zinc-600 dark:text-zinc-400 transition-transform group-hover:scale-110" />
              <span>Custom Quiz</span>
            </button>

            <button
              type="button"
              onClick={onLaunchHistory}
              className="group px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-transparent hover:bg-zinc-100/80 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/[0.06] font-medium text-xs sm:text-sm transition-all duration-200 active:scale-95 flex items-center gap-1.5 cursor-pointer border-none"
            >
              <History className="w-4 h-4 text-zinc-500 dark:text-zinc-400 transition-transform group-hover:rotate-[-20deg]" />
              <span>History</span>
            </button>
          </div>

          {/* User Status Strip: Clean Apple Profile Widget */}
          <div className="pt-2 max-w-xl mx-auto w-full">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-[#111113]/80 border border-zinc-200/70 dark:border-white/[0.06] backdrop-blur-xl flex items-center justify-between gap-3 sm:gap-4 shadow-xs hover:border-zinc-300/80 dark:hover:border-white/[0.1] transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-white/[0.08] overflow-hidden flex items-center justify-center shrink-0">
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
                    className="text-[11px] text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium cursor-pointer flex items-center gap-0.5 transition-colors group mt-0.5"
                  >
                    <span>Level {safeLevel.level} • {safeLevel.title}</span>
                    <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-5 text-xs font-medium shrink-0">
                <div className="text-right">
                  <span className="block font-bold text-zinc-900 dark:text-white leading-none text-xs sm:text-sm">
                    {totalXP.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal mt-1 block">Total XP</span>
                </div>

                <div className="h-7 w-px bg-zinc-200/80 dark:bg-white/[0.08]" />

                <div className="text-right">
                  <span className="font-bold text-zinc-900 dark:text-white leading-none text-xs sm:text-sm flex items-center justify-end gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {currentStreak}d
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal mt-1 block">Streak</span>
                </div>

                <div className="h-7 w-px bg-zinc-200/80 dark:bg-white/[0.08]" />

                <div className="text-right">
                  <span className="block font-bold text-zinc-900 dark:text-white leading-none text-xs sm:text-sm">
                    {statsSummary.accuracy}%
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal mt-1 block">Accuracy</span>
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
