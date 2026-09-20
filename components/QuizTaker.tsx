import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { slugify } from '../utils/slugify';
import Editor from '@monaco-editor/react';
import { UserProfile, QuizQuestion, LibraryFile, ExamPaper, ExamCategory } from '../types.ts';
import NexusServer from '../services/nexusServer';
import { useUniversity } from '../hooks/useUniversity.tsx';
import { generateQuizFromSyllabus } from '../services/geminiService.ts';
import { extractTextFromPdf } from '../services/pdfUtils.ts';
import jsPDF from 'jspdf';
import { showToast } from './Toast.tsx';
import html2canvas from 'html2canvas';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import { Trophy, Flame, ArrowLeft, CheckCircle2, Clock, Sparkles, X, ChevronRight, Award, Lock, Sprout, BookOpen, Star, Crown, Medal, Check } from 'lucide-react';

import { SYLLABUS_DATA } from '../data/syllabusData.ts';
import { findSubjectMetadata } from '../data/curriculumData.ts';
import { getSubjectCurriculum } from '../data/subjectCatalog.ts';
// Removed QUIZTAKER_DATA import to resolve lag - fetching on demand from Supabase instead.

// Dashboard components
import FeaturedQuizCard from './quiz/FeaturedQuizCard.tsx';
import ChallengeCard from './quiz/ChallengeCard.tsx';
import QuickStartBar from './quiz/QuickStartBar.tsx';
import XPBreakdown from './quiz/XPBreakdown.tsx';
import LevelUpOverlay from './quiz/LevelUpOverlay.tsx';
import StreakToast from './quiz/StreakToast.tsx';
import HistorySection from './quiz/HistorySection.tsx';
import OfficialExamPapersExplorer from './quiz/OfficialExamPapersExplorer.tsx';
import CompactCustomQuizBuilder from './quiz/CompactCustomQuizBuilder.tsx';
import ContinuousExamViewer from './quiz/ContinuousExamViewer.tsx';
import QuizDashboardView from './quiz/QuizDashboardView.tsx';


// Dashboard hooks & store
import { useXP } from '../hooks/useXP.ts';
import { useStreak } from '../hooks/useStreak.ts';
import { useDashboard } from '../hooks/useDashboard.ts';
import { useQuizDashboardStore, getLevelInfo, LEVEL_THRESHOLDS } from '../stores/quizStore.ts';


const parseInline = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$.*?\$|\*\*.*?\*\*|\*.*?\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('$$') && part.endsWith('$$')) {
      const math = part.slice(2, -2);
      return <div key={i} className="my-2 overflow-x-auto flex justify-center"><BlockMath math={math} /></div>;
    }
    if (part.startsWith('$') && part.endsWith('$')) {
      const math = part.slice(1, -1);
      return <InlineMath key={i} math={math} />;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-zinc-900 dark:text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i} className="italic text-zinc-700 dark:text-zinc-300">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-white/10 font-mono text-xs text-orange-500 font-semibold">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
};

const renderTextContent = (text: string) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let tableLines: string[] = [];
  let isInsideTable = false;

  const flushTable = (key: number) => {
    if (tableLines.length === 0) return null;
    const validRows = tableLines.filter(line => !line.match(/^\|?\s*[-:]+[-| :]*\|?$/));
    if (validRows.length === 0) return null;

    const headerRow = validRows[0].split('|').map(c => c.trim()).filter(Boolean);
    const dataRows = validRows.slice(1).map(row => row.split('|').map(c => c.trim()).filter(Boolean));

    return (
      <div key={`table-${key}`} className="my-3 overflow-x-auto flex justify-center">
        <table className="border-collapse rounded-xl overflow-hidden bg-zinc-100/90 dark:bg-white/[0.04] text-center text-xs border border-zinc-200 dark:border-white/10 shadow-sm min-w-[200px]">
          <thead>
            <tr className="bg-zinc-200/80 dark:bg-white/10 font-bold border-b border-zinc-300 dark:border-white/10">
              {headerRow.map((h, idx) => (
                <th key={idx} className="px-4 py-2 text-zinc-900 dark:text-white font-mono text-center font-bold">
                  {parseInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/60 dark:divide-white/5 font-mono">
            {dataRows.map((r, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-orange-500/5 transition-colors">
                {r.map((cell, colIdx) => (
                  <td key={colIdx} className="px-4 py-1.5 text-zinc-700 dark:text-zinc-300 font-semibold text-center">
                    {parseInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    const isTableLine = trimmed.startsWith('|') || (line.includes('|') && trimmed.endsWith('|'));

    if (isTableLine) {
      tableLines.push(line);
      isInsideTable = true;
    } else {
      if (isInsideTable) {
        const tbl = flushTable(idx);
        if (tbl) elements.push(tbl);
        tableLines = [];
        isInsideTable = false;
      }

      if (trimmed.startsWith('### ')) {
        elements.push(
          <h4 key={`h3-${idx}`} className="text-sm font-bold text-zinc-900 dark:text-white mt-3 mb-1">
            {parseInline(trimmed.slice(4))}
          </h4>
        );
      } else if (trimmed.startsWith('## ')) {
        elements.push(
          <h3 key={`h2-${idx}`} className="text-base font-black text-zinc-900 dark:text-white mt-3 mb-1">
            {parseInline(trimmed.slice(3))}
          </h3>
        );
      } else if (trimmed.startsWith('# ')) {
        elements.push(
          <h2 key={`h1-${idx}`} className="text-lg font-black text-zinc-900 dark:text-white mt-3 mb-1">
            {parseInline(trimmed.slice(2))}
          </h2>
        );
      } else if (trimmed) {
        elements.push(
          <p key={`p-${idx}`} className="leading-relaxed my-1">
            {parseInline(line)}
          </p>
        );
      }
    }
  });

  if (tableLines.length > 0) {
    const tbl = flushTable(lines.length);
    if (tbl) elements.push(tbl);
  }

  return elements.length > 0 ? <>{elements}</> : parseInline(text);
};

const parseText = (text: string | undefined) => {
  if (!text) return null;

  // Split on fenced code blocks (```lang\n...code...\n```)
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\s*([\s\S]*?)```/g;
  const segments: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const prevText = text.slice(lastIndex, match.index);
    if (prevText.trim()) {
      segments.push(
        <div key={`text-${lastIndex}`} className="space-y-1">
          {renderTextContent(prevText)}
        </div>
      );
    }

    const lang = match[1] || 'code';
    const code = match[2].trim();
    segments.push(
      <div key={`code-${match.index}`} className="my-3 rounded-2xl overflow-hidden bg-[#121214] border border-white/10 shadow-lg">
        <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5 text-[11px] font-mono text-zinc-400">
          <span className="uppercase font-bold text-orange-400">{lang}</span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(code);
              showToast('Code copied to clipboard!', 'success');
            }}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span>Copy</span>
          </button>
        </div>
        <pre className="p-4 font-mono text-xs text-zinc-100 overflow-x-auto custom-scrollbar leading-relaxed whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    );

    lastIndex = match.index + match[0].length;
  }

  const remainingText = text.slice(lastIndex);
  if (remainingText.trim()) {
    segments.push(
      <div key={`text-${lastIndex}`} className="space-y-1">
        {renderTextContent(remainingText)}
      </div>
    );
  }

  return segments.length > 0 ? <div className="space-y-2">{segments}</div> : renderTextContent(text);
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const shuffleQuestion = (q: QuizQuestion): QuizQuestion => {
  if (q.type !== 'mcq' && q.type !== undefined) return q;
  if (!q.options || q.options.length < 2) return q;

  const optionsWithStatus = q.options.map((option, index) => ({
    option,
    isCorrect: index === q.correctAnswer,
  }));

  const shuffledOptionsWithStatus = shuffleArray(optionsWithStatus);
  const newOptions = shuffledOptionsWithStatus.map(o => o.option);
  const newCorrectAnswer = shuffledOptionsWithStatus.findIndex(o => o.isCorrect);

  return {
    ...q,
    options: newOptions,
    correctAnswer: newCorrectAnswer,
  };
};

// Static Bank - keeping this for fallback/demo
const PEL130_STATIC_BANK = [
  { unit: 1, question: "Fill in the blank with correct adjective order. I have bought a _________ bag.", options: ["Tiny red Prada", "Red tiny Prada", "Prada red tiny", "Prada tiny red"], answer: "Tiny red Prada" },
  { unit: 1, question: "Fill the blank with correct verb. The usual work of peon _________ to pass fillies in between departments.", options: ["Is", "Are", "Have", "Has"], answer: "Is" },
  // ... (keeping a subset for brevity in this rewrite, or can expand if needed. For now, assuming standard array structure)
];

// Expanded static bank to avoid empty quizzes if API fails
const FALLBACK_QUESTIONS: QuizQuestion[] = [
  { id: "fallback-1", unit: 1, question: "Communication is a non-stop process.", options: ["True", "False", "Maybe", "Depends on context"], correctAnswer: 0, explanation: "Communication is continuous." },
  { id: "fallback-2", unit: 1, question: "Which is not a barrier to communication?", options: ["Noise", "Choice of medium", "Feedback", "Language"], correctAnswer: 2, explanation: "Feedback is a part of the process, not a barrier." },
];

interface SubjectWithSyllabus {
  id: string;
  name: string;
  syllabusFile: LibraryFile;
}

const getTierLucideIcon = (lvl: number, isUnlocked = true, className = "w-4.5 h-4.5") => {
  const colorClass = isUnlocked
    ? lvl === 1 ? "text-emerald-500"
      : lvl === 2 ? "text-blue-500"
      : lvl === 3 ? "text-amber-400"
      : lvl === 4 ? "text-orange-500"
      : lvl === 5 ? "text-amber-500"
      : lvl === 6 ? "text-amber-500"
      : lvl === 7 ? "text-rose-500"
      : "text-purple-400"
    : "text-zinc-400 dark:text-zinc-600";

  const fullClass = `${className} ${colorClass}`;

  switch (lvl) {
    case 1:
      // Solid Sprout / Leaf
      return (
        <svg viewBox="0 0 24 24" className={fullClass} fill="currentColor">
          <path d="M13 21v-7c0-2.2 1.8-4 4-4h3c0-3.9-3.1-7-7-7-2.3 0-4.3 1.1-5.6 2.8C6.9 5.3 6.5 5 6 5c-2.2 0-4 1.8-4 4 0 3.3 2.7 6 6 6h1v6h4z" />
        </svg>
      );
    case 2:
      // Solid Open Book with spine cutout
      return (
        <svg viewBox="0 0 24 24" className={fullClass} fill="currentColor">
          <path d="M12 6.5c-2.2-1.6-4.9-2.5-8-2.5v13c3.1 0 5.8.9 8 2.5 2.2-1.6 4.9-2.5 8-2.5V4c-3.1 0-5.8.9-8 2.5zm0 11.5c-1.8-1.2-4-2-6.5-2H4V6h1.5c2.5 0 4.7.8 6.5 2v10zm8-2h-1.5c-2.5 0-4.7.8-6.5 2V8c1.8-1.2 4-2 6.5-2H20v10z" />
        </svg>
      );
    case 3:
      // Solid Star
      return (
        <svg viewBox="0 0 24 24" className={fullClass} fill="currentColor">
          <path d="M12 2.5l2.9 6.2 6.8.9-5 4.7 1.2 6.7-5.9-3.2-5.9 3.2 1.2-6.7-5-4.7 6.8-.9L12 2.5z" />
        </svg>
      );
    case 4:
      // Solid Flame with inner flame cutout
      return (
        <svg viewBox="0 0 24 24" className={fullClass} fill="currentColor">
          <path d="M12 2c-3.5 4-6 7.5-6 11.5 0 3.59 2.69 6.5 6 6.5s6-2.91 6-6.5C18 9.5 15.5 6 12 2zm0 15c-1.66 0-3-1.34-3-3 0-1.8 1.5-3.5 3-5 1.5 1.5 3 3.2 3 5 0 1.66-1.34 3-3 3z" />
        </svg>
      );
    case 5:
      // Solid Crown
      return (
        <svg viewBox="0 0 24 24" className={fullClass} fill="currentColor">
          <path d="M5 16h14l1.5-9-4.5 4-4-6-4 6-4.5-4L5 16zm-2 2h18v2H3v-2z" />
        </svg>
      );
    case 6:
      // Solid Trophy with handles and pedestal
      return (
        <svg viewBox="0 0 24 24" className={fullClass} fill="currentColor">
          <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V18H8v2h8v-2h-3v-2.1c1.92-.4 3.44-1.92 3.61-3.96C19.08 11.63 21 9.55 21 7V6c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
        </svg>
      );
    case 7:
      // Solid Medal with ribbon and white star
      return (
        <svg viewBox="0 0 24 24" className={fullClass} fill="currentColor">
          <path d="M8.5 2l3.5 6 3.5-6h3.5L14 11.5a6 6 0 0 1-4 0L5 2h3.5z" opacity="0.85" />
          <circle cx="12" cy="16" r="5.5" />
          <path d="M12 12.8l.8 1.6 1.8.3-1.3 1.3.3 1.8-1.6-.8-1.6.8.3-1.8-1.3-1.3 1.8-.3z" fill={isUnlocked ? "#ffffff" : "#18181b"} />
        </svg>
      );
    case 8:
      // Solid Sparkles
      return (
        <svg viewBox="0 0 24 24" className={fullClass} fill="currentColor">
          <path d="M12 2c.5 4.5 4.5 8.5 9 9-4.5.5-8.5 4.5-9 9-.5-4.5-4.5-8.5-9-9 4.5-.5 8.5-4.5 9-9z" />
          <path d="M19 15c.3 1.5 1.5 2.7 3 3-1.5.3-2.7 1.5-3 3-.3-1.5-1.5-2.7-3-3 1.5-.3 2.7-1.5 3-3z" />
        </svg>
      );
    default:
      return <Award className={fullClass} />;
  }
};

const RewardItemCard: React.FC<{
  tier: any;
  isRewardUnlocked: boolean;
  isCollected: boolean;
  userQuizProfile: any;
  userProfile: UserProfile | null;
  updateUserQuizProfile: (profile: any) => void;
  userId: string;
  frameConfig: any;
}> = ({ tier, isRewardUnlocked, isCollected, userQuizProfile, userProfile, updateUserQuizProfile, userId, frameConfig }) => {
  return (
    <div className="flex flex-col items-center gap-1.5 group/reward relative flex-shrink-0">
      <div className={`relative w-9 h-9 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-xl border border-zinc-200/80 dark:border-white/10 bg-zinc-100 dark:bg-zinc-800/60 ${
        isRewardUnlocked && !isCollected ? 'ring-1 ring-zinc-900/20 dark:ring-white/30 shadow-sm' : ''
      }`}>
        {/* Shine Animation for available collection */}
        {isRewardUnlocked && !isCollected && (
          <motion.div
            animate={{
              x: ['-100%', '200%'],
              opacity: [0, 0.4, 0]
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 1.5
            }}
            className="absolute inset-0 z-30 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"
          />
        )}

        {/* Rarity Background */}
        {tier.rarity && (
          <img
            src={`/Rarity/${tier.rarity}.png`}
            alt={tier.rarity}
            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover/reward:scale-105 transition-transform duration-300"
          />
        )}

        {/* Frame Asset */}
        <div className="relative w-[65%] h-[65%] flex items-center justify-center z-10">
          <img
            src={`/Nexus-Journey/${tier.rewardFrame}`}
            alt="Reward Frame"
            className="w-full h-full object-contain"
            style={{
              transform: `scale(${frameConfig?.scale || 1.1}) translateY(${frameConfig?.translateY || '0%'})`,
              filter: 'none',
              opacity: 1
            }}
          />
        </div>

        {/* Status Overlay */}
        {!isRewardUnlocked && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-20">
            <Lock className="w-3 h-3 text-white/70" />
          </div>
        )}
      </div>

      <div className="w-full flex justify-center">
        {isRewardUnlocked ? (
          isCollected ? (
            <div className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-semibold rounded-full flex items-center gap-0.5 border border-emerald-500/20">
              <CheckCircle2 className="w-2 h-2" />
              Claimed
            </div>
          ) : (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                const NexusServer = (await import('../services/nexusServer')).default;
                if (!userId || userId === 'anonymous') {
                  showToast("Please sign in to collect rewards", "info");
                  return;
                }
                try {
                  const updatedFrames = await NexusServer.collectReward(userId, tier.rewardFrame!);
                  updateUserQuizProfile({ unlocked_frames: updatedFrames });
                  showToast(`${tier.title} Frame Collected!`, "success");
                } catch (e) {
                  console.error('Failed to collect frame', e);
                  showToast("Something went wrong.", "error");
                }
              }}
              className="px-2 py-0.5 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 active:scale-95 text-[8px] font-medium rounded-full shadow-sm transition-all z-20"
            >
              Claim
            </button>
          )
        ) : (
          <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-medium">
            Locked
          </span>
        )}
      </div>
    </div>
  );
};

const QuizTaker: React.FC<{ userProfile: UserProfile | null, onAuthRequired?: () => void }> = ({ userProfile, onAuthRequired }) => {
  const { fullBrandName, shortBrandName, selectedUniversity, uniSlug } = useUniversity();
  const isLPU = selectedUniversity === 'lpu';
  const { subjectName, quizId } = useParams();
  const navigate = useNavigate();
  const routePrefix = uniSlug ? `/${uniSlug}` : '';


  // ═══════════ Dashboard State ═══════════
  const [showCustomQuizBuilder, setShowCustomQuizBuilder] = useState(false);
  const userId = userProfile?.id || 'anonymous';
  const { totalXP, level, awardXP } = useXP(userId);
  const { currentStreak, longestStreak, streakCalendar, isStreakAtRisk, recordCompletion } = useStreak(userId);
  const { saveCompletion, featuredQuiz, activeChallenges } = useDashboard(userId);
  const {
    userQuizProfile, updateUserQuizProfile,
    featuredCompleted, featuredScore,
    completedChallengeIds,
    isDashboardLoading,
    dashboardView, setDashboardView,
    setFeaturedCompleted, setFeaturedScore,
    markChallengeCompleted,
  } = useQuizDashboardStore();
  // Track what type of quiz is currently active
  const [activeQuizType, setActiveQuizType] = useState<'custom' | 'featured' | 'challenge'>('custom');
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);

  const [subjectsWithSyllabi, setSubjectsWithSyllabi] = useState<SubjectWithSyllabus[]>([]);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectWithSyllabus | null>(null);

  // ═══════════ Official Exam Papers State ═══════════
  const [quizModeTab, setQuizModeTab] = useState<'official' | 'custom'>('official');
  const [examPapers, setExamPapers] = useState<ExamPaper[]>([]);
  const [isFetchingExamPapers, setIsFetchingExamPapers] = useState(false);
  const [selectedExamCategory, setSelectedExamCategory] = useState<ExamCategory>('all');
  const [selectedExamYear, setSelectedExamYear] = useState<number | 'all'>('all');
  const [activeExamPaper, setActiveExamPaper] = useState<ExamPaper | null>(null);

  const [selectedUnits, setSelectedUnits] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [subjectQuestions, setSubjectQuestions] = useState<QuizQuestion[]>([]);
  const [isFetchingQuestions, setIsFetchingQuestions] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({});
  const [currentCode, setCurrentCode] = useState('');
  const [executionOutput, setExecutionOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);
  const [testResults, setTestResults] = useState<{ in: string, out: string, actual: string, passed: boolean }[]>([]);
  const [stdinValue, setStdinValue] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [isAwaitingInput, setIsAwaitingInput] = useState(false);
  const [liveInput, setLiveInput] = useState('');
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isShowingExplanation, setIsShowingExplanation] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set());

  // New Quiz Config States
  const [numMCQ, setNumMCQ] = useState(10);
  const [numSubjective, setNumSubjective] = useState(0);
  const [numCoding, setNumCoding] = useState(0);
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(60);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>(['MCQ', 'PYQ', 'Case Based']);
  const [completedOnLoad, setCompletedOnLoad] = useState(false);
  const [solvedQuestionIds, setSolvedQuestionIds] = useState<Set<string>>(new Set());
  const [includeSolved, setIncludeSolved] = useState(true);
  const [showTopics, setShowTopics] = useState(false);
  const [isRecentSessionsExpanded, setIsRecentSessionsExpanded] = useState(false);
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [timeSpentByQuestion, setTimeSpentByQuestion] = useState<Record<number, number>>({});


  // Question Feedback States
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportQuestionId, setReportQuestionId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState<Partial<QuizQuestion>>({});

  const resultRef = useRef<HTMLDivElement>(null);

  const progressPercent = useMemo(() => {
    if (quizQuestions.length === 0) return 0;
    return Math.round(((currentQuestionIdx + 1) / quizQuestions.length) * 100);
  }, [currentQuestionIdx, quizQuestions.length]);

  useEffect(() => {
    const solved = localStorage.getItem('quiz_solved_questions');
    if (solved) {
      setSolvedQuestionIds(new Set(JSON.parse(solved)));
    }
    const savedBookmarks = localStorage.getItem('nexus_quiz_bookmarks');
    if (savedBookmarks) {
      try {
        setBookmarkedIds(new Set(JSON.parse(savedBookmarks)));
      } catch (e) {
        console.error("Failed to parse bookmarks", e);
      }
    }
  }, []);

  const saveSolvedQuestions = (ids: string[]) => {
    const newSolved = new Set([...Array.from(solvedQuestionIds), ...ids]);
    setSolvedQuestionIds(newSolved);
    localStorage.setItem('quiz_solved_questions', JSON.stringify(Array.from(newSolved)));
  };

  const toggleBookmark = (id: string) => {
    if (!id) return;
    setBookmarkedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      localStorage.setItem('nexus_quiz_bookmarks', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  useEffect(() => {
    const loadPyodideScript = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        if ((window as any).loadPyodide) return resolve((window as any).loadPyodide);
        const existingScript = document.querySelector('script[src="https://cdn.jsdelivr.net/npm/pyodide@0.23.4/pyodide.js"]');
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve((window as any).loadPyodide));
          existingScript.addEventListener('error', reject);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/pyodide@0.23.4/pyodide.js';
        script.async = true;
        script.onload = () => resolve((window as any).loadPyodide);
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initPyodide = async () => {
      if (!pyodide) {
        try {
          const loadPyodideFn = await loadPyodideScript();
          if (loadPyodideFn) {
            const loadedPyodide = await loadPyodideFn({
              indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/"
            });
            setPyodide(loadedPyodide);
          }
        } catch (err) {
          console.error("Pyodide failed to load dynamically", err);
        }
      }
    };
    initPyodide();
  }, [pyodide]);

  useEffect(() => {
    if (quizQuestions.length > 0 && quizQuestions[currentQuestionIdx].type === 'coding') {
      const ans = userAnswers[currentQuestionIdx];
      const code = (ans && typeof ans === 'object') ? ans.code : (ans || quizQuestions[currentQuestionIdx].starterCode || '');
      setCurrentCode(code);
      setExecutionOutput('');
      setTestResults([]);
    }
  }, [currentQuestionIdx, quizQuestions]);

  const currentLanguage = useMemo(() => {
    if (!selectedSubject) return 'python';
    const name = selectedSubject.name.toUpperCase();
    if (name.includes('CSE101')) return 'c';
    if (name.includes('CSE121')) return 'cpp';
    return 'python';
  }, [selectedSubject]);


  const runCode = async (isSubmit: boolean = false, isResume: boolean = false) => {
    const isPython = currentLanguage === 'python';

    if (isPython && !pyodide) {
      showToast("Python engine is still loading...", "info");
      return;
    }

    setIsExecuting(true);
    setIsAwaitingInput(false);

    if (isSubmit) {
      setTestResults([]);
    } else if (!isResume) {
      setExecutionOutput("Running...");
      setUserInputs([]);
    }

    try {
      if (isPython) {
        // ... (Existing Python/Pyodide logic)
        const setupEnv = () => pyodide.runPython(`
import sys
import io
import builtins
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
_inputs = ${JSON.stringify(isResume ? userInputs : (stdinValue ? stdinValue.split('\n') : []))}
_input_idx = 0
def _custom_input(prompt=""):
    global _input_idx
    if prompt:
        sys.stdout.write(str(prompt))
    if _input_idx < len(_inputs):
        val = _inputs[_input_idx]
        _input_idx += 1
        return val
    else:
        raise Exception("WAITING_FOR_INPUT")
builtins.input = _custom_input
        `);

        if (!isSubmit) {
          setupEnv();
          try {
            await pyodide.runPythonAsync(currentCode);
            const output = pyodide.runPython("sys.stdout.getvalue()");
            const stderr = pyodide.runPython("sys.stderr.getvalue()");
            setExecutionOutput(output + (stderr ? "\nError:\n" + stderr : ""));
          } catch (err: any) {
            if (err.message.includes("WAITING_FOR_INPUT")) {
              const partialOutput = pyodide.runPython("sys.stdout.getvalue()");
              setExecutionOutput(partialOutput);
              setIsAwaitingInput(true);
            } else {
              throw err;
            }
          }
        }

        if (isSubmit) {
          const q = quizQuestions[currentQuestionIdx];
          if (q.testCases && q.testCases.length > 0) {
            const results = [];
            for (const tc of q.testCases) {
              pyodide.runPython(`
import sys
import io
import builtins
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
_inputs = ${JSON.stringify((tc.input || "").split('\n').filter((l: string) => l !== ""))}
_input_idx = 0
builtins.input = lambda p="": _inputs.pop(0) if _inputs else ""
              `);

              try {
                await pyodide.runPythonAsync(currentCode);
                const actual = pyodide.runPython("sys.stdout.getvalue()")?.trim() || "";
                const expected = (tc.output || tc.out || "").trim();
                results.push({
                  input: tc.input || tc.in || "",
                  output: expected,
                  actual: actual,
                  passed: actual === expected,
                  isHidden: tc.isHidden
                });
              } catch (e: any) {
                results.push({
                  input: tc.input || tc.in || "",
                  output: tc.output || tc.out || "",
                  actual: "Error: " + e.message,
                  passed: false,
                  isHidden: tc.isHidden
                });
              }
            }
            const allPassed = results.every(r => r.passed);
            setTestResults(results);
            handleAnswer({ code: currentCode, passed: allPassed, results });
            showToast(allPassed ? "All test cases passed!" : "Some test cases failed.", allPassed ? "success" : "error");
          } else {
            handleAnswer({ code: currentCode, passed: true });
            showToast("Code submitted successfully", "success");
          }
        }
      } else {
        // PISTON LOGIC REMOVED
        showToast("Code execution is currently unavailable for this language.", "error");
        setExecutionOutput("Error: External compiler services are currently down. Only Python is supported at this time.");
      }
    } catch (err: any) {
      if (!isSubmit) {
        setExecutionOutput(prev => prev + "\nError: " + err.message);
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const terminateExecution = () => {
    setIsExecuting(false);
    setIsAwaitingInput(false);
    setLiveInput('');
    setExecutionOutput(prev => prev + "\n\n[Execution Terminated by User]");
    showToast("Execution terminated", "info");
  };

  const handleLiveInput = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const val = liveInput;
      const updatedInputs = [...userInputs, val];
      setUserInputs(updatedInputs);
      setLiveInput('');
      setExecutionOutput(prev => prev + val + '\n');
      // Re-run with the new input included
      runCode(false, true);
    }
  };

  // Add a ref for console to auto-scroll
  const consoleRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [executionOutput, isAwaitingInput]);

  const resetCode = () => {
    if (window.confirm("Are you sure you want to reset your code? This will erase your current work for this question.")) {
      const q = quizQuestions[currentQuestionIdx];
      const starter = q.starterCode || '';
      setCurrentCode(starter);
      setExecutionOutput('');
      setTestResults([]);
      handleAnswer({ code: starter, passed: false });
    }
  };

  useEffect(() => {
    if (quizCompleted && quizQuestions.length > 0) {
      const solvedIds: string[] = [];
      quizQuestions.forEach((q, idx) => {
        if (q.type === 'subjective') {
          // If in practice mode and explanation was shown, or if they finished the quiz
          // We'll mark subjective as solved if they at least saw the question at the end
          solvedIds.push(q.id);
        } else if (q.type === 'coding') {
          // Mark coding as solved if all tests passed
          if ((userAnswers[idx] as any)?.passed) {
            solvedIds.push(q.id);
          }
        } else {
          // Only mark MCQs as solved if they answered correctly
          if (userAnswers[idx] === q.correctAnswer) {
            solvedIds.push(q.id);
          }
        }
      });
      if (solvedIds.length > 0) {
        saveSolvedQuestions(solvedIds);
      }

      // Log quiz completion for analytics
      NexusServer.saveRecord(userProfile?.id || null, 'quiz_complete', `Completed ${selectedSubject?.name} Quiz`, {
        subject: selectedSubject?.name,
        score: score,
        totalQuestions: quizQuestions.length,
        accuracy: Math.round((score / quizQuestions.length) * 100),
        duration: timerMinutes * 60 - timeLeft
      });
    }
  }, [quizCompleted]);

  // Fetch questions and official exam papers for selected subject
  useEffect(() => {
    const fetchSubjectData = async () => {
      if (!selectedSubject) {
        setSubjectQuestions([]);
        setExamPapers([]);
        return;
      }

      setIsFetchingQuestions(true);
      setIsFetchingExamPapers(true);
      try {
        const subjectName = selectedSubject.name || '';
        const subjectMatch = subjectName.match(/[A-Za-z]+[0-9]+/);
        const subjectCode = subjectMatch ? subjectMatch[0].toUpperCase() : subjectName.split(':')[0].trim().replace(/\s+/g, '').toUpperCase();

        // 1. Fetch official exam papers catalog
        const papers = await NexusServer.fetchExamPapers(subjectCode);
        setExamPapers(papers);
        if (papers.length > 0) {
          setQuizModeTab('official');
        }

        // 2. Fetch full question pool for custom builder & metadata
        const questions = await NexusServer.fetchQuestions(subjectCode);
        setSubjectQuestions(questions);
      } catch (err) {
        console.error("Error fetching subject data:", err);
      } finally {
        setIsFetchingQuestions(false);
        setIsFetchingExamPapers(false);
      }
    };

    fetchSubjectData();
  }, [selectedSubject]);

  const handleStartExamPaper = async (
    paper: ExamPaper,
    isPractice: boolean = false,
    options?: { includeMCQ?: boolean; includeSubjective?: boolean }
  ) => {
    setLoading(true);
    setStatus(`Preparing ${paper.title}...`);
    try {
      let questions = await NexusServer.fetchExamQuestions({
        paperId: paper.id,
        subjectCode: paper.subject_code,
        year: paper.year,
        examType: paper.exam_type,
      });

      // Filter by question type if customized in practice paper modal
      if (options && paper.exam_type === 'practice') {
        if (options.includeMCQ === false) {
          questions = questions.filter(q => q.type === 'subjective' || q.questionType === 'Subjective');
        } else if (options.includeSubjective === false) {
          questions = questions.filter(q => q.type === 'mcq' || q.questionType === 'MCQ');
        }
      }

      if (!questions || questions.length === 0) {
        showToast(`No questions found in database for ${paper.title}.`, 'info');
        setLoading(false);
        return;
      }

      setActiveExamPaper(paper);
      setQuizQuestions(questions);
      setCurrentQuestionIdx(0);
      setUserAnswers({});
      setVisitedQuestions(new Set([0]));
      setMarkedForReview(new Set());
      setTimeSpentByQuestion({});
      setQuizCompleted(false);
      setReviewMode(false);
      setIsShowingExplanation(false);

      const durationMins = paper.duration_minutes || (paper.exam_type === 'endterm' ? 120 : paper.exam_type === 'midterm' ? 60 : 45);
      setTimerMinutes(durationMins);
      setTimeLeft(durationMins * 60);
      setTimerActive(!isPractice);
      setIsPracticeMode(isPractice);
      setNegativeMarking(paper.exam_type === 'endterm' || paper.exam_type === 'midterm');
      setActiveQuizType('custom');
      setShowCustomQuizBuilder(false);
    } catch (err: any) {
      console.error('Error starting exam paper:', err);
      showToast('Failed to load exam questions: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredExamPapers = useMemo(() => {
    return examPapers.filter(paper => {
      const matchesCat = selectedExamCategory === 'all' || paper.exam_type === selectedExamCategory;
      const matchesYear = selectedExamYear === 'all' || paper.year === selectedExamYear;
      return matchesCat && matchesYear;
    });
  }, [examPapers, selectedExamCategory, selectedExamYear]);

  const availableExamYears = useMemo(() => {
    const years = new Set<number>();
    examPapers.forEach(p => { if (p.year) years.add(p.year); });
    return Array.from(years).sort((a, b) => b - a);
  }, [examPapers]);

  const availableUnitsForSubject = useMemo(() => {
    if (subjectQuestions.length === 0) return [1, 2, 3, 4, 5, 6]; // Default fallback
    const units = new Set<number>();
    subjectQuestions.forEach(q => units.add(Number(q.unit)));
    return Array.from(units).sort((a, b) => a - b);
  }, [subjectQuestions]);

  const selectAllUnits = () => {
    const all = availableUnitsForSubject;
    const isAll = all.length > 0 && all.every(u => selectedUnits.includes(u));
    if (isAll) {
      setSelectedUnits([]);
    } else {
      setSelectedUnits(all);
    }
  };

  const availableTopicsByUnit = useMemo(() => {
    const topicsMap: Record<number, Set<string>> = {};
    const filteredQuestions = selectedUnits.length > 0
      ? subjectQuestions.filter(q => selectedUnits.includes(q.unit))
      : subjectQuestions;

    filteredQuestions.forEach(q => {
      if (q.topic) {
        if (!topicsMap[q.unit]) topicsMap[q.unit] = new Set();
        topicsMap[q.unit].add(q.topic);
      }
    });

    const result: Record<number, string[]> = {};
    Object.keys(topicsMap).forEach(k => {
      result[parseInt(k)] = Array.from(topicsMap[parseInt(k)]).sort();
    });
    return result;
  }, [subjectQuestions, selectedUnits]);

  const sectionInfo = useMemo(() => {
    let mcqCount = 0;
    let subjCount = 0;
    let codingCount = 0;
    const mapping = quizQuestions.map(q => {
      if (q.type === 'subjective') {
        subjCount++;
        return subjCount;
      } else if (q.type === 'coding') {
        codingCount++;
        return codingCount;
      } else {
        mcqCount++;
        return mcqCount;
      }
    });

    return {
      mapping,
      totalMCQs: mcqCount,
      totalSubjs: subjCount,
      totalCoding: codingCount
    };
  }, [quizQuestions]);

  const hasMCQs = useMemo(() => {
    return subjectQuestions.some(q => q.type === 'mcq');
  }, [subjectQuestions]);

  const hasSubjective = useMemo(() => {
    return subjectQuestions.some(q => q.type === 'subjective');
  }, [subjectQuestions]);

  const hasCoding = useMemo(() => {
    if (!selectedSubject) return false;
    // Lock coding questions for CSE101 as requested
    if (selectedSubject.name.includes('CSE101')) return false;
    return subjectQuestions.some(q => q.type === 'coding');
  }, [selectedSubject, subjectQuestions]);

  const availableQuestionTypes = useMemo(() => {
    const types = new Set<string>();
    const filtered = selectedUnits.length > 0
      ? subjectQuestions.filter(q => selectedUnits.includes(q.unit))
      : subjectQuestions;

    filtered.forEach(q => {
      if (q.type === 'mcq') {
        types.add(q.questionType || 'MCQ');
      }
    });
    return types;
  }, [subjectQuestions, selectedUnits]);

  useEffect(() => {
    loadValidSubjects();
  }, [uniSlug, dashboardView]);

  // Update default counts when subject changes
  useEffect(() => {
    if (selectedSubject) {
      setNumMCQ(10);
      setNumSubjective(hasSubjective ? 2 : 0);
      setNumCoding(hasCoding ? 2 : 0);
      setSelectedUnits([]);
      setSelectedTopics([]);
      setSelectedDifficulties([]);
      setSelectedQuestionTypes(['MCQ', 'PYQ', 'Case Based']);
    }
  }, [selectedSubject, hasSubjective, hasCoding]);

  useEffect(() => {
    let timer: any;
    if (timerActive && timeLeft > 0 && !quizCompleted) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        setTimeSpentByQuestion(prev => ({
          ...prev,
          [currentQuestionIdx]: (prev[currentQuestionIdx] || 0) + 1
        }));
      }, 1000);
    } else if (timeLeft === 0 && timerActive && !quizCompleted) {
      setQuizCompleted(true);
      setTimerActive(false);
      showToast("Time is up!", "info");
    }
    return () => clearInterval(timer);
  }, [timerActive, timeLeft, quizCompleted, currentQuestionIdx]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const loadValidSubjects = async () => {
    setInitializing(true);
    try {
      const subjectsMap = new Map<string, SubjectWithSyllabus>();

      // Fetch distinct subject codes that actually exist in Supabase (questions + exam_papers)
      const subjectNames = await NexusServer.fetchSubjectNames();

      const filteredSubjectNames = subjectNames.filter(name => {
        const code = name.split(':')[0].trim().toUpperCase();
        if (uniSlug === 'iitm') {
          return code.startsWith('BS');
        } else {
          return !code.startsWith('BS');
        }
      });

      filteredSubjectNames.forEach((rawSubject, index) => {
        // Normalize code by removing spaces: "MTH 401" -> "MTH401"
        const subjectMatch = rawSubject.match(/^[A-Za-z]+[\s-]*[0-9]+/);
        const normalizedCode = subjectMatch ? subjectMatch[0].replace(/[\s-]+/g, '').toUpperCase() : rawSubject.split(':')[0].trim().replace(/\s+/g, '').toUpperCase();

        // 1. Try finding in comprehensive subject catalog (scraped from curriculum)
        const catalogItem = getSubjectCurriculum(normalizedCode);

        // 2. Try finding in SYLLABUS_DATA
        const syllabusKey = Object.keys(SYLLABUS_DATA).find(key => {
          const keyMatch = key.match(/^[A-Za-z]+[\s-]*[0-9]+/);
          const keyCode = keyMatch ? keyMatch[0].replace(/[\s-]+/g, '').toUpperCase() : key.split(':')[0].trim().replace(/\s+/g, '').toUpperCase();
          return keyCode === normalizedCode;
        });

        // 3. Try finding in curriculum data registry
        const meta = findSubjectMetadata('btech-cse', normalizedCode) || findSubjectMetadata('bs-data-science', normalizedCode);

        let subjectTitle = '';
        if (catalogItem?.name) {
          subjectTitle = catalogItem.name;
        } else if (meta?.title) {
          subjectTitle = meta.title;
        } else if (syllabusKey && syllabusKey.includes(':')) {
          subjectTitle = syllabusKey.split(':').slice(1).join(':').trim();
        } else if (rawSubject.includes(':')) {
          subjectTitle = rawSubject.split(':').slice(1).join(':').trim();
        }

        if (normalizedCode === 'MTH401' && (!subjectTitle || subjectTitle === 'MTH401')) {
          subjectTitle = 'Discrete Mathematics';
        }

        const displayName = subjectTitle ? `${normalizedCode}: ${subjectTitle}` : (rawSubject.includes(':') ? rawSubject : normalizedCode);

        subjectsMap.set(normalizedCode, {
          id: `QUIZ_SUB_${index}`,
          name: displayName,
          syllabusFile: null as any
        });
      });

      // Final unique subjects list (ONLY subjects in DB)
      const finalSubjects = Array.from(subjectsMap.values())
        .sort((a, b) => a.name.localeCompare(b.name));

      setSubjectsWithSyllabi(finalSubjects);

      // Auto-select if selectedSubject is not set or not in list
      if (finalSubjects.length > 0) {
        setSelectedSubject(prev => {
          if (!prev) return finalSubjects[0];
          const exists = finalSubjects.find(s => s.name === prev.name || s.id === prev.id);
          return exists || finalSubjects[0];
        });
      } else {
        setSelectedSubject(null);
      }
    } catch (err) {
      console.error("Library load error:", err);
      setSubjectsWithSyllabi([]);
    } finally {
      setInitializing(false);
    }
  };

  // Sync selectedSubject with URL param
  useEffect(() => {
    if (subjectsWithSyllabi.length > 0 && subjectName) {
      const sub = subjectsWithSyllabi.find(s => {
        const sSlug = slugify(s.name);
        if (sSlug === subjectName) return true;
        const match = s.name.match(/^[A-Za-z]+[\s-]*[0-9]+/);
        if (match && slugify(match[0]) === subjectName.toLowerCase()) return true;
        return false;
      });
      if (sub && (!selectedSubject || selectedSubject.name !== sub.name)) {
        setSelectedSubject(sub);
      }
    }
  }, [subjectName, subjectsWithSyllabi]);

  // Update URL when selectedSubject changes
  const handleSubjectChange = (sub: SubjectWithSyllabus | null) => {
    if (sub) {
      // If we are already in a quiz for this subject, maybe we don't want to reset? 
      // But if we're picking a new subject from the setup screen, we reset.
      navigate(`${routePrefix}/quiz/${slugify(sub.name)}`);
      setQuizQuestions([]);
      setQuizIdInState(null);
    } else {
      navigate(`${routePrefix}/quiz`);
      setQuizQuestions([]);
      setQuizIdInState(null);
    }
    setSelectedSubject(sub);
  };

  const [quizIdInState, setQuizIdInState] = useState<string | null>(null);

  useEffect(() => {
    if (quizId && quizId !== quizIdInState) {
      const saved = localStorage.getItem(`nexus_quiz_${quizId}`);
      if (saved) {
        const data = JSON.parse(saved);
        setQuizQuestions(data.questions);
        setUserAnswers(data.answers || {});
        setCurrentQuestionIdx(data.currentIndex || 0);
        setTimeLeft(data.timeLeft || 0);
        setTimerActive(data.timerActive || false);
        setIsCached(data.isCached || false);
        setQuizCompleted(data.quizCompleted || false);
        setCompletedOnLoad(data.quizCompleted || false);
        setQuizIdInState(quizId);

        // Ensure selected subject matches
        if (data.subject && (!selectedSubject || selectedSubject.name !== data.subject)) {
          const sub = subjectsWithSyllabi.find(s => s.name === data.subject);
          if (sub) setSelectedSubject(sub);
        }
      }
    }
  }, [quizId, subjectsWithSyllabi]);

  // Save progress periodically
  useEffect(() => {
    if (quizId && quizQuestions.length > 0) {
      // Determine the display name and search key
      let currentSubjectName = selectedSubject?.name;
      let displayName = selectedSubject?.name;

      if (activeQuizType === 'featured') {
        currentSubjectName = 'featured';
        displayName = featuredQuiz?.name || 'Today\'s Featured';
      } else if (activeQuizType === 'challenge') {
        currentSubjectName = 'challenge';
        const ch = activeChallenges?.find((c: any) => c.id === activeChallengeId);
        displayName = ch?.name || 'Active Challenge';
      }

      const data = {
        subject: currentSubjectName,
        displayName: displayName, // Store pretty name
        questions: quizQuestions,
        answers: userAnswers,
        currentIndex: currentQuestionIdx,
        timeLeft,
        timerActive,
        isCached,
        quizCompleted,
        lastUpdated: Date.now()
      };
      localStorage.setItem(`nexus_quiz_${quizId}`, JSON.stringify(data));

      // Also update a "recent quizzes" list
      const recent = JSON.parse(localStorage.getItem('nexus_recent_quizzes') || '[]');
      const filtered = recent.filter((q: any) => q.id !== quizId);
      const updated = [{
        id: quizId,
        subject: currentSubjectName,
        name: displayName, // Store pretty name for display
        date: Date.now(),
        score: quizCompleted ? calculateScore() : null
      }, ...filtered].slice(0, 5);
      localStorage.setItem('nexus_recent_quizzes', JSON.stringify(updated));
    }
  }, [quizQuestions, userAnswers, currentQuestionIdx, timeLeft, timerActive, quizCompleted, activeQuizType, featuredQuiz, activeChallenges, activeChallengeId, selectedSubject]);

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (q.type === 'mcq' || !q.type) {
        if (userAnswers[idx] === q.correctAnswer) score++;
      } else if (q.type === 'coding') {
        if ((userAnswers[idx] as any)?.passed) score++;
      }
    });
    return score;
  };

  const toggleUnit = (unit: number) => {
    setSelectedUnits(prev => prev.includes(unit) ? prev.filter(u => u !== unit) : [...prev, unit].sort((a, b) => a - b));
  };

  const handleBackToDashboard = () => {
    setQuizQuestions([]);
    setQuizCompleted(false);
    setCompletedOnLoad(false);
    setReviewMode(false);
    setSelectedSubject(null);
    setUserAnswers({});
    setTimerActive(false);
    setQuizIdInState(null);
    setCurrentQuestionIdx(0);
    setTimeSpentByQuestion({});
    setShowCustomQuizBuilder(false);
    setActiveQuizType('custom');
    setActiveChallengeId(null);
    navigate(`${routePrefix}/quiz`);
  };

  // ═══════════ Featured Quiz Start ═══════════
  const handleStartFeaturedQuiz = useCallback(() => {
    if (!userProfile || userId === 'anonymous') {
      showToast("Please login to attempt the featured quiz.", "error");
      onAuthRequired?.();
      return;
    }
    if (!featuredQuiz || featuredCompleted) return;

    // First shuffle the order of questions
    const shuffledQuestionList = shuffleArray(featuredQuiz.questions);

    const questions = shuffledQuestionList.map((q: any, idx: number) => {
      const enriched = {
        ...q,
        id: q.id || `featured-${idx}`,
        unit: q.unit || 1,
        type: q.type || 'mcq',
        questionType: q.questionType || 'MCQ',
      };
      return shuffleQuestion(enriched as QuizQuestion);
    });
    setActiveQuizType('featured');
    setQuizQuestions(questions);
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setQuizCompleted(false);
    setCompletedOnLoad(false);
    setTimerActive(true);
    setTimeLeft(questions.length * 45); // 45 seconds per question
    setVisitedQuestions(new Set([0]));
    setMarkedForReview(new Set());
    setTimeSpentByQuestion({});
    const newQuizId = featuredQuiz.id; // Using static day-based ID
    setQuizIdInState(newQuizId);
    navigate(`${routePrefix}/quiz/featured/${newQuizId}`);
  }, [featuredQuiz, featuredCompleted]);

  // ═══════════ Challenge Start ═══════════
  const handleStartChallenge = useCallback(async (challenge: typeof activeChallenges[0]) => {
    if (!userProfile || userId === 'anonymous') {
      showToast("Please login to attempt challenges.", "error");
      onAuthRequired?.();
      return;
    }
    if (completedChallengeIds.has(challenge.id)) return;

    setLoading(true);
    setStatus('Gathering challenge questions...');

    try {
      const subjectCode = (challenge.subject || '').split(':')[0].trim();
      const pool = await NexusServer.fetchQuestions(subjectCode);
      const mcqs = pool.filter(q => q.type === 'mcq');

      if (mcqs.length === 0) {
        showToast('No questions available for this challenge subject.', 'error');
        return;
      }

      const shuffled = [...mcqs].sort(() => 0.5 - Math.random()).slice(0, challenge.question_count);
      const questions = shuffled.map((q: any, idx: number) => {
        const enriched = {
          ...q,
          id: q.id || `challenge-${idx}`,
          unit: q.unit || 1,
          type: q.type || 'mcq',
          questionType: q.questionType || 'MCQ',
        };
        return shuffleQuestion(enriched as QuizQuestion);
      });
      setActiveQuizType('challenge');
      setActiveChallengeId(challenge.id);
      setQuizQuestions(questions);
      setCurrentQuestionIdx(0);
      setUserAnswers({});
      setQuizCompleted(false);
      setCompletedOnLoad(false);
      setTimerActive(true);
      setTimeLeft(challenge.question_count * challenge.time_limit_per_question);
      setVisitedQuestions(new Set([0]));
      setMarkedForReview(new Set());
      setTimeSpentByQuestion({});
      const newQuizId = challenge.id; // Using static window-based ID
      setQuizIdInState(newQuizId);
      navigate(`${routePrefix}/quiz/challenge/${newQuizId}`);
    } catch (err) {
      console.error(err);
      showToast('Error starting challenge!', 'error');
    } finally {
      setLoading(false);
      setStatus('');
    }
  }, [activeChallenges, completedChallengeIds]);

  // ═══════════ XP & Streak on Completion ═══════════
  useEffect(() => {
    if (!quizCompleted || quizQuestions.length === 0 || completedOnLoad) return;

    const scorableQuestions = quizQuestions.filter(q => q.type !== 'subjective');
    if (scorableQuestions.length === 0) return;

    const answeredCount = Object.keys(userAnswers).length;
    if (answeredCount === 0) return;

    const correctCount = Object.entries(userAnswers).reduce((acc, [idx, ans]) => {
      const question = quizQuestions[parseInt(idx)];
      if (question.type === 'subjective') return acc;
      if (question.type === 'coding') {
        return (ans && typeof ans === 'object' && (ans as any).passed) ? acc + 1 : acc;
      }
      return ans === question.correctAnswer ? acc + 1 : acc;
    }, 0);

    const scorePercentage = Math.round((correctCount / scorableQuestions.length) * 100);
    const totalTimeTaken = Object.values(timeSpentByQuestion).reduce((a: number, b: number) => a + b, 0);
    const totalTimeAllowed = timerMinutes * 60;

    // Mark as completed immediately to prevent double execution during async calls
    setCompletedOnLoad(true);

    // Award XP (using latest hook-functions with latest closures)
    const xpResult = awardXP({
      scorePercentage,
      timeTakenSeconds: totalTimeTaken as number,
      totalTimeAllowed,
      hintsUsed: 0,
      isFeaturedQuiz: activeQuizType === 'featured',
      quizId: quizIdInState || 'unknown',
      answeredCount,
      totalQuestions: quizQuestions.length,
    });

    // Record streak
    const streakResult = recordCompletion();

    // Save completion (locally)
    saveCompletion({
      quiz_id: quizIdInState || 'unknown',
      type: activeQuizType,
      score_percentage: scorePercentage,
      xp_earned: xpResult?.totalEarned || 0,
    });

    // Persist to Supabase if logged in
    if (userId && userId !== 'anonymous' && xpResult) {
      let subjectToSave = selectedSubject?.name;
      if (activeQuizType === 'featured') subjectToSave = `Featured: ${featuredQuiz?.name || 'Daily'}`;
      else if (activeQuizType === 'challenge') {
        const ch = activeChallenges?.find((c: any) => c.id === activeChallengeId);
        subjectToSave = `Challenge: ${ch?.name || 'Active'}`;
      }

      NexusServer.saveQuizAttempt({
        userId: userId,
        quizId: quizIdInState || 'unknown',
        subjectName: subjectToSave || 'Experimental Quiz',
        scorePercentage,
        xpEarned: xpResult.totalEarned,
        timeTakenSeconds: totalTimeTaken as number,
        totalQuestions: quizQuestions.length,
        correctAnswers: correctCount,
        breakdown: xpResult.breakdown || []
      }).catch(err => console.error("Failed to save quiz attempt:", err));

      NexusServer.incrementStudyStats({
        quizStudyTime: totalTimeTaken as number,
        questionsAttempted: quizQuestions.length,
        correctQuestions: correctCount,
        wrongQuestions: Math.max(0, quizQuestions.length - correctCount)
      }).catch(err => console.error("Failed to update quiz study stats:", err));
    }

    // Mark featured/challenge as completed
    if (activeQuizType === 'featured') {
      setFeaturedCompleted(true);
      setFeaturedScore(scorePercentage);
    } else if (activeQuizType === 'challenge' && activeChallengeId) {
      markChallengeCompleted(activeChallengeId);
    }

    // Save solved question IDs
    if (activeQuizType === 'custom' && !isPracticeMode) {
      const solvedIds = quizQuestions.map(q => q.id).filter(Boolean) as string[];
      saveSolvedQuestions(solvedIds);
    }
  }, [
    quizCompleted,
    completedOnLoad,
    quizQuestions,
    userAnswers,
    userId,
    awardXP,
    recordCompletion,
    saveCompletion,
    timeSpentByQuestion,
    timerMinutes,
    activeQuizType,
    quizIdInState,
    selectedSubject,
    activeChallengeId,
    level,
    currentStreak,
    setFeaturedCompleted,
    setFeaturedScore,
    markChallengeCompleted,
    isPracticeMode,
    saveSolvedQuestions
  ]);

  const handleGenerate = async () => {
    if (!userProfile || userId === 'anonymous') {
      showToast("Please login to start a custom quiz.", "error");
      onAuthRequired?.();
      return;
    }
    if (!selectedSubject || selectedUnits.length === 0) return;

    setLoading(true);
    setError(null);
    setIsCached(false);
    setStatus('Searching for questions...');

    try {
      let finalSelection: QuizQuestion[] = [];

      // We already have subjectQuestions fetched in the hook
      let pool = subjectQuestions.filter(q => selectedUnits.includes(Number(q.unit)));

      if (pool.length === 0) {
        // Double check with a direct fetch if pool is empty (maybe it wasn't fully loaded)
        setStatus('Checking databases...');
        const subjectName = selectedSubject.name || '';
        const subjectMatch = subjectName.match(/[A-Za-z]+[0-9]+/);
        const subjectCode = subjectMatch ? subjectMatch[0].toUpperCase() : subjectName.split(':')[0].trim().replace(/\s+/g, '').toUpperCase();

        console.log(`[DEBUG] Attempting targeted fetch for ${subjectCode} units:`, selectedUnits);
        pool = await NexusServer.fetchQuestions(subjectCode, selectedUnits);
        console.log(`[DEBUG] Fetched ${pool.length} questions from DB`);
        // Secondary safety filter
        pool = pool.filter(q => selectedUnits.includes(Number(q.unit)));
        console.log(`[DEBUG] After unit filter: ${pool.length} questions`);
      }

      console.log(`[DEBUG] Pool for generation: ${pool.length}`);

      // Apply Filters
      if (selectedDifficulties.length > 0) {
        const lowerSelected = selectedDifficulties.map(d => d.toLowerCase());
        console.log(`[DEBUG] Applying difficulty filter (lower):`, lowerSelected);
        pool = pool.filter(q => {
          const diff = String(q.difficulty || 'medium').toLowerCase();
          return lowerSelected.includes(diff);
        });
        console.log(`[DEBUG] After difficulty filter: ${pool.length} questions`);
      }

      if (selectedTopics.length > 0) {
        const lowerSelectedTopics = selectedTopics.map(t => t.toLowerCase());
        console.log(`[DEBUG] Applying topic filter (lower):`, lowerSelectedTopics);
        pool = pool.filter(q => q.topic && lowerSelectedTopics.includes(q.topic.toLowerCase()));
        console.log(`[DEBUG] After topic filter: ${pool.length} questions`);
      }

      // Filter by Question Type (MCQ, PYQ, Case Study)
      let availableMcqs = pool.filter(q => {
        const typeMatch = (q.type || '').toLowerCase() === 'mcq';
        const questionTypeStr = String(q.questionType || 'MCQ').toUpperCase();

        // If nothing selected, default to true for all mcq types
        const questionTypeMatch = selectedQuestionTypes.length === 0 || selectedQuestionTypes.some(selected => {
          const s = selected.toUpperCase();
          return questionTypeStr.includes(s) || s.includes(questionTypeStr);
        });

        return typeMatch && questionTypeMatch;
      });
      console.log(`[DEBUG] Available MCQs: ${availableMcqs.length}`);

      let availableSubj = pool.filter(q => (q.type || '').toLowerCase() === 'subjective');
      let availableCoding = pool.filter(q => (q.type || '').toLowerCase() === 'coding');

      console.log(`[DEBUG] Available categories: MCQ(${availableMcqs.length}) Subj(${availableSubj.length}) Coding(${availableCoding.length})`);

      // Prioritize unsolved but fill with solved if needed
      const unsolvedMcqs = availableMcqs.filter(q => !solvedQuestionIds.has(q.id));
      const solvedMcqs = availableMcqs.filter(q => solvedQuestionIds.has(q.id));
      const poolMcq = [...shuffleArray(unsolvedMcqs), ...shuffleArray(solvedMcqs)];

      const unsolvedSubj = availableSubj.filter(q => !solvedQuestionIds.has(q.id));
      const solvedSubj = availableSubj.filter(q => solvedQuestionIds.has(q.id));
      const poolSubj = [...shuffleArray(unsolvedSubj), ...shuffleArray(solvedSubj)];

      // If includeSolved is false, we strictly use only unsolved
      const finalMcqPool = includeSolved ? poolMcq : unsolvedMcqs;
      const finalSubjPool = includeSolved ? poolSubj : unsolvedSubj;

      // Selection logic
      const pickedMcq = finalMcqPool.slice(0, numMCQ);
      const pickedSubj = finalSubjPool.slice(0, numSubjective);
      const pickedCoding = [...availableCoding].sort(() => 0.5 - Math.random()).slice(0, numCoding);

      finalSelection = [...pickedMcq, ...pickedSubj, ...pickedCoding].sort(() => 0.5 - Math.random());

      console.log(`[DEBUG] Final selection size: ${finalSelection.length} (Wanted: ${numMCQ + numSubjective + numCoding})`);
      console.log(`[DEBUG] Unsolved available: ${unsolvedMcqs.length}, Solved available: ${solvedMcqs.length}`);

      if (finalSelection.length > 0) {
        startQuiz(finalSelection, true);
        return;
      } else {
        throw new Error("EMPTY_POOL");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to start quiz.");
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const startQuiz = (questions: QuizQuestion[], cached: boolean) => {
    // Ensure all questions have IDs and shuffle options
    const enriched = questions.map((q, idx) => {
      let questionWithId = q;
      if (!q.id) {
        // Deterministic ID based on question content to track repeats
        const contentHash = q.question.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
        questionWithId = { ...q, id: `ai-${Math.abs(contentHash)}` };
      }
      // Always shuffle options for every new quiz start
      return shuffleQuestion(questionWithId);
    });

    setQuizQuestions(enriched);
    setIsCached(cached);

    // Generate random ID for this instance
    const newQuizId = `q${Math.random().toString(36).substring(2, 11)}`;
    setQuizIdInState(newQuizId);
    NexusServer.saveRecord(userProfile?.id || null, 'quiz_start', `Started ${selectedSubject?.name} Quiz`, {
      quizId: newQuizId,
      subject: selectedSubject?.name,
      questionCount: enriched.length,
      difficulty: selectedDifficulties
    });
    navigate(`${routePrefix}/quiz/${slugify(selectedSubject!.name)}/${newQuizId}`);

    setLoading(false);
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setQuizCompleted(false);
    setCompletedOnLoad(false);
    setIsShowingExplanation(false);
    setReviewMode(false);

    // Start Timer
    setTimeLeft(timerMinutes * 60);
    setTimerActive(true);
    setVisitedQuestions(new Set([0]));
    setMarkedForReview(new Set());
    setTimeSpentByQuestion({});
  };

  const toggleMarkForReview = () => {
    setMarkedForReview(prev => {
      const next = new Set(prev);
      if (next.has(currentQuestionIdx)) next.delete(currentQuestionIdx);
      else next.add(currentQuestionIdx);
      return next;
    });
  };

  const handleAnswer = (answer: any) => {
    if (isShowingExplanation || reviewMode) return;
    setUserAnswers(prev => ({ ...prev, [currentQuestionIdx]: answer }));
    if (isPracticeMode && typeof answer === 'number') {
      setIsShowingExplanation(true);
    }
  };

  const handleShowExplanation = () => {
    if (isShowingExplanation || reviewMode) return;
    setIsShowingExplanation(true);
  };

  const nextQuestion = () => {
    setIsShowingExplanation(false);
    if (currentQuestionIdx < quizQuestions.length - 1) {
      const nextIdx = currentQuestionIdx + 1;
      setCurrentQuestionIdx(nextIdx);
      setVisitedQuestions(prev => new Set(prev).add(nextIdx));
    } else {
      setQuizCompleted(true);
      setTimerActive(false);
    }
  };

  // ═══════════ Question Management ═══════════
  const handleReportOpen = (qId: string) => {
    setReportQuestionId(qId);
    setReportReason('');
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!reportQuestionId || !reportReason.trim()) return;
    setIsReporting(true);
    try {
      await NexusServer.reportQuestion({
        questionId: reportQuestionId,
        userId: userId,
        reason: reportReason,
        subject: selectedSubject?.name
      });
      showToast("Question reported successfully.", "success");
      setShowReportModal(false);
    } catch (err) {
      showToast("Failed to report question.", "error");
    } finally {
      setIsReporting(false);
    }
  };

  const handleEditOpen = (q: QuizQuestion) => {
    setEditingQuestion(q);
    setEditForm({ ...q });
    setShowEditModal(true);
  };

  const submitEdit = async () => {
    if (!editingQuestion || !editForm.question) return;
    setIsUpdating(true);
    try {
      const updatedQ = { ...editingQuestion, ...editForm } as QuizQuestion;
      await NexusServer.updateQuestion(updatedQ);
      showToast("Question updated successfully.", "success");

      // Update local state
      setQuizQuestions(prev => prev.map(q => q.id === updatedQ.id ? updatedQ : q));
      setShowEditModal(false);
    } catch (err) {
      showToast("Failed to update question.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // ═══════════ Render Modals ═══════════
  const renderModals = () => {
    const modalContent = (
      <>
        <AnimatePresence>
          {/* Report Modal */}
          {showReportModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                onClick={() => setShowReportModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-black rounded-[32px] border border-white/10 shadow-2xl overflow-hidden p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white leading-tight">Report Question</h3>
                  <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <p className="text-sm text-zinc-400 leading-relaxed">What's wrong with this question? Your report will be reviewed by {fullBrandName} Moderators to ensure content quality.</p>

                  <div className="space-y-3">
                    {['Incorrect Answer', 'Typo/Grammar Error', 'Out of Syllabus', 'Technical Glitch'].map((option) => (
                      <button
                        key={option}
                        onClick={() => setReportReason(option)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all ${reportReason === option
                            ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                            : 'bg-white/5 border-white/5 text-zinc-400 hover:border-orange-500/30'
                          }`}
                      >
                        <span className="text-sm font-semibold">{option}</span>
                      </button>
                    ))}

                    <textarea
                      placeholder="Additional details or specific concerns..."
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all min-h-[100px] text-zinc-200"
                    />
                  </div>

                  <button
                    disabled={!reportReason.trim() || isReporting}
                    onClick={submitReport}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-xl hover:shadow-orange-500/20 text-white rounded-2xl text-sm font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 border-none"
                  >
                    {isReporting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : 'Submit Report'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Edit Modal (Admin Only) */}
          {showEditModal && editingQuestion && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xl"
                onClick={() => setShowEditModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                <div className="flex items-center justify-between p-8 border-b border-zinc-100 dark:border-white/5">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Edit Question</h3>
                    <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest font-bold">Admin Console</p>
                  </div>
                  <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full transition-colors text-zinc-500">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Question Text</label>
                    <textarea
                      value={editForm.question}
                      onChange={(e) => setEditForm(prev => ({ ...prev, question: e.target.value }))}
                      className="w-full p-4 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[80px] text-zinc-800 dark:text-zinc-200"
                    />
                  </div>

                  {editForm.options && editForm.options.length > 0 && (
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Options</label>
                      {editForm.options.map((opt, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${editForm.correctAnswer === idx ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-100 dark:bg-white/5 text-zinc-400'}`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <input
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...(editForm.options || [])];
                              newOpts[idx] = e.target.value;
                              setEditForm(prev => ({ ...prev, options: newOpts }));
                            }}
                            className="flex-1 p-3 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 text-zinc-800 dark:text-zinc-200"
                          />
                          <button
                            onClick={() => setEditForm(prev => ({ ...prev, correctAnswer: idx }))}
                            className={`px-3 rounded-xl border text-[8px] font-bold uppercase transition-all ${editForm.correctAnswer === idx ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-200 dark:border-white/10 text-zinc-400 hover:border-emerald-500/30'}`}
                          >
                            Correct
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Explanation</label>
                    <textarea
                      value={editForm.explanation}
                      onChange={(e) => setEditForm(prev => ({ ...prev, explanation: e.target.value }))}
                      className="w-full p-4 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[80px] text-zinc-800 dark:text-zinc-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Topic</label>
                      <input
                        value={editForm.topic}
                        onChange={(e) => setEditForm(prev => ({ ...prev, topic: e.target.value }))}
                        className="w-full p-4 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-2xl text-sm focus:outline-none text-zinc-800 dark:text-zinc-200"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Difficulty Level</label>
                      <select
                        value={editForm.difficulty}
                        onChange={(e) => setEditForm(prev => ({ ...prev, difficulty: e.target.value }))}
                        className="w-full p-4 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-2xl text-sm focus:outline-none text-zinc-800 dark:text-zinc-200 appearance-none cursor-pointer"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-8 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02]">
                  <button
                    disabled={isUpdating}
                    onClick={submitEdit}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isUpdating ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : 'Save Changes'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
    );

    return createPortal(modalContent, document.body);
  };

  const handleDownloadPDF = async () => {
    if (!resultRef.current) return;
    try {
      const canvas = await html2canvas(resultRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${selectedSubject?.name || 'Quiz'}_Results.pdf`);
    } catch (e) {
      showToast("Could not generate PDF. Please try printing via browser.", "error");
    }
  };

  const score = useMemo(() => {
    return Object.entries(userAnswers).reduce((acc, [idx, ans]) => {
      const question = quizQuestions[parseInt(idx)];
      if (question.type === 'subjective') return acc;

      if (question.type === 'coding') {
        const ansObj = ans as any;
        return (ansObj && typeof ansObj === 'object' && ansObj.passed) ? acc + 1 : acc;
      }

      if (ans === undefined) return acc;

      const isCorrect = ans === question.correctAnswer;
      if (isCorrect) return acc + 1;
      return negativeMarking ? acc - 0.25 : acc;
    }, 0);
  }, [userAnswers, quizQuestions, negativeMarking]);

  const unitAnalysis = useMemo(() => {
    if (!quizCompleted) return [];
    const stats: Record<number, { correct: number, total: number, subjective: number }> = {};
    quizQuestions.forEach((q, idx) => {
      if (!stats[q.unit]) stats[q.unit] = { correct: 0, total: 0, subjective: 0 };
      if (q.type === 'subjective') {
        stats[q.unit].subjective++;
      } else if (q.type === 'coding') {
        stats[q.unit].total++;
        const ans = userAnswers[idx] as any;
        if (ans && typeof ans === 'object' && ans.passed) stats[q.unit].correct++;
      } else {
        stats[q.unit].total++;
        if (userAnswers[idx] === q.correctAnswer) stats[q.unit].correct++;
      }
    });
    return Object.entries(stats).map(([unit, s]) => ({
      unit: parseInt(unit),
      accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 100,
      correct: s.correct,
      total: s.total,
      subjective: s.subjective
    }));
  }, [quizCompleted, quizQuestions, userAnswers]);

  if (initializing) return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-6 animate-fade-in">
      <div className="w-12 h-12 border-4 border-orange-500/10 border-t-orange-500 rounded-full animate-spin" />
      <p className="text-sm font-medium text-zinc-500">Setting up your subjects...</p>
      {renderModals()}
    </div>
  );

  if (loading) return (
    <div className="h-[70vh] flex flex-col items-center justify-center space-y-10 animate-fade-in">
      <div className="relative">
        <div className="w-24 h-24 border-8 border-orange-500/10 rounded-full" />
        <div className="absolute inset-0 w-24 h-24 border-8 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-semibold text-zinc-800 dark:text-white">Starting Quiz</h3>
        <p className="text-sm font-medium text-zinc-500 animate-pulse">{status}</p>
      </div>
      {renderModals()}
    </div>
  );

  if (quizQuestions.length > 0 && !quizCompleted && !reviewMode) {
    return (
      <div className="w-full space-y-6">
        <ContinuousExamViewer
          quizQuestions={quizQuestions}
          activeExamPaper={activeExamPaper}
          selectedSubject={selectedSubject}
          userAnswers={userAnswers}
          setUserAnswers={setUserAnswers}
          currentQuestionIdx={currentQuestionIdx}
          setCurrentQuestionIdx={setCurrentQuestionIdx}
          visitedQuestions={visitedQuestions}
          setVisitedQuestions={setVisitedQuestions}
          markedForReview={markedForReview}
          toggleMarkForReview={toggleMarkForReview}
          timeLeft={timeLeft}
          setTimeLeft={setTimeLeft}
          timerActive={timerActive}
          setTimerActive={setTimerActive}
          formatTime={formatTime}
          onCompleteExam={() => setQuizCompleted(true)}
          onExitExam={() => {
            setQuizQuestions([]);
            setQuizCompleted(false);
            setReviewMode(false);
            setActiveExamPaper(null);
            setTimerActive(false);
          }}
          onReportQuestion={(qId) => handleReportOpen(qId)}
          bookmarkedIds={bookmarkedIds}
          toggleBookmark={toggleBookmark}
          userProfile={userProfile}
          parseText={parseText}
          runCode={runCode}
          currentCode={currentCode}
          setCurrentCode={setCurrentCode}
          isExecuting={isExecuting}
          executionOutput={executionOutput}
          testResults={testResults}
          showStdin={showStdin}
          setShowStdin={setShowStdin}
          stdinValue={stdinValue}
          setStdinValue={setStdinValue}
          resetCode={resetCode}
        />
        {renderModals()}
      </div>
    );
  }

  if (quizCompleted || reviewMode) {
    const autoGradableQuestions = quizQuestions.filter(q => q.type !== 'subjective');
    const totalAuto = autoGradableQuestions.length;
    const percentage = totalAuto > 0 ? Math.round((score / totalAuto) * 100) : 0;
    const timeAllocated = timerMinutes * 60;
    const totalTimeTaken = timeAllocated - timeLeft;
    const avgTimePerQuestion = quizQuestions.length > 0 ? totalTimeTaken / quizQuestions.length : 0;

    const formatAvgTime = (secs: number) => {
      const s = Math.max(0, Math.round(secs));
      if (s < 60) return `${s}s`;
      const m = Math.floor(s / 60);
      const rem = s % 60;
      return rem > 0 ? `${m}m ${rem}s` : `${m}m`;
    };

    const allMilestones = [
      // COMMON 🟤
      { label: 'Beginner', desc: 'Started your quiz journey', rarity: 'common', icon: 'seedling', condition: percentage >= 5 },
      { label: 'First Step', desc: 'Answered your first questions', rarity: 'common', icon: 'footsteps', condition: percentage >= 20 },
      { label: 'Participant', desc: 'Engaged through the quiz', rarity: 'common', icon: 'badge', condition: percentage >= 35 },
      { label: 'Getting Started', desc: 'Building solid foundation', rarity: 'common', icon: 'flag', condition: percentage >= 45 },
      { label: 'Rookie', desc: 'Surpassed 50% threshold', rarity: 'common', icon: 'star', condition: percentage >= 55 },

      // UNCOMMON 🔵
      { label: 'Learner', desc: 'Scored 65%+ on this test', rarity: 'uncommon', icon: 'book', condition: percentage >= 65 },
      { label: 'Improving', desc: 'Strong grasp of fundamentals', rarity: 'uncommon', icon: 'chart', condition: percentage >= 72 },
      { label: 'Halfway Hero', desc: 'Conquered 10+ questions', rarity: 'uncommon', icon: 'hero', condition: percentage >= 75 && quizQuestions.length > 10 },
      { label: 'Quick Thinker', desc: 'Finished under 55% time', rarity: 'uncommon', icon: 'bolt', condition: totalTimeTaken < timeAllocated * 0.55 && percentage >= 60 },
      { label: 'Rising Star', desc: 'Near mastery at 78%+', rarity: 'uncommon', icon: 'upward', condition: percentage >= 78 },

      // RARE 🟢
      { label: 'Sharp Mind', desc: 'High accuracy over 80%', rarity: 'rare', icon: 'brain', condition: percentage >= 82 },
      { label: 'Brainiac', desc: 'Mastered tough topics (86%+)', rarity: 'rare', icon: 'flask', condition: percentage >= 86 },
      { label: 'Speed Runner', desc: 'Swift & accurate (under 35% time)', rarity: 'rare', icon: 'run', condition: totalTimeTaken < timeAllocated * 0.35 && percentage >= 75 },
      { label: 'Accuracy Pro', desc: '90%+ precision achieved', rarity: 'rare', icon: 'target', condition: percentage >= 90 },
      { label: 'Consistent', desc: 'Dependable strong result', rarity: 'rare', icon: 'check', condition: percentage >= 80 && percentage <= 94 },

      // EPIC 🟣
      { label: 'Quiz Master', desc: 'Outstanding 94%+ performance', rarity: 'epic', icon: 'trophy', condition: percentage >= 94 },
      { label: 'Knowledge Ninja', desc: 'Elite score of 97%+', rarity: 'epic', icon: 'ninja', condition: percentage >= 97 },
      { label: 'Precision Pro', desc: '100% flawless on 10+ items', rarity: 'epic', icon: 'bullseye', condition: percentage === 100 && totalAuto >= 10 },
      { label: 'Lightning Fast', desc: 'Sub-22% time with 85%+ score', rarity: 'epic', icon: 'zap', condition: totalTimeTaken < timeAllocated * 0.22 && percentage >= 85 },
      { label: 'Dominator', desc: '98%+ on 20+ comprehensive items', rarity: 'epic', icon: 'sword', condition: percentage >= 98 && totalAuto >= 20 },

      // LEGENDARY 🟠
      { label: 'Perfect Score', desc: '100% flawless on 20+ items', rarity: 'legendary', icon: 'perfect', condition: percentage === 100 && totalAuto >= 20 },
      { label: 'Speed Demon', desc: 'Sub-12% time with 90%+ score', rarity: 'legendary', icon: 'fire', condition: totalTimeTaken < timeAllocated * 0.12 && percentage >= 90 },
      { label: 'Quiz God', desc: '100% score in record time', rarity: 'legendary', icon: 'crown', condition: percentage === 100 && totalTimeTaken < timeAllocated * 0.25 },
      { label: 'Unstoppable', desc: 'Mastery on 30+ items', rarity: 'legendary', icon: 'shield', condition: percentage >= 98 && totalAuto >= 30 },
    ];

    const earnedMilestones = allMilestones.filter(m => m.condition);
    const sortedMilestones = [...allMilestones].sort((a, b) => {
      // Milestones earned in this test first
      if (a.condition && !b.condition) return -1;
      if (!a.condition && b.condition) return 1;
      const order = { legendary: 4, epic: 3, rare: 2, uncommon: 1, common: 0 };
      return order[b.rarity as keyof typeof order] - order[a.rarity as keyof typeof order];
    });

    const getMilestoneIcon = (icon: string) => {
      const getIconColor = (type: string) => {
        switch (type) {
          case 'seedling': return 'text-emerald-500';
          case 'footsteps': return 'text-amber-600';
          case 'badge': return 'text-zinc-500';
          case 'flag': return 'text-rose-500';
          case 'star': return 'text-yellow-500';
          case 'book': return 'text-blue-500';
          case 'chart': return 'text-indigo-500';
          case 'hero': return 'text-emerald-500';
          case 'bolt': return 'text-yellow-500';
          case 'upward': return 'text-blue-500';
          case 'brain': return 'text-purple-500';
          case 'flask': return 'text-emerald-400';
          case 'run': return 'text-rose-500';
          case 'target': return 'text-blue-500';
          case 'check': return 'text-emerald-500';
          case 'trophy': return 'text-amber-500';
          case 'ninja': return 'text-indigo-400';
          case 'bullseye': return 'text-rose-600';
          case 'zap': return 'text-yellow-400';
          case 'sword': return 'text-zinc-500';
          case 'perfect': return 'text-emerald-500';
          case 'fire': return 'text-orange-500';
          case 'crown': return 'text-amber-500';
          case 'shield': return 'text-blue-600';
          case 'throne': return 'text-amber-600';
          default: return 'text-current';
        }
      };

      const props = {
        viewBox: "0 0 24 24",
        width: "20",
        height: "20",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
        className: `w-4 h-4 ${getIconColor(icon)}`
      };

      switch (icon) {
        case 'seedling': return (
          <svg {...props}>
            <path d="M7 20h10" />
            <path d="M10 20c5.5-2.5.8-6.4 3-10" />
            <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3 1.2-.6 2.3-1.4 2.5-3.4z" />
            <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.2 3.4-.5 4.7-1.9-1.2-.1-2.4-.6-3.6-2.1z" />
          </svg>
        );
        case 'footsteps': return (
          <svg {...props}>
            <path d="M4 16c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2z" />
            <path d="M8 14c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2z" />
            <path d="M16 5c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2z" />
            <path d="M12 7c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2z" />
          </svg>
        );
        case 'brain': return (
          <svg {...props}>
            <path d="M9.5 2a2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 1 0-5Z" />
            <path d="M14.5 2a2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 1 0-5Z" />
            <path d="M21 15a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2Z" />
            <path d="M7 13v-3a5 5 0 0 1 10 0v3" />
          </svg>
        );
        case 'trophy': return (
          <svg {...props}>
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M12 15V3" />
          </svg>
        );
        case 'fire': return (
          <svg {...props}>
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3 1.05.76 3 2.5 3 5.5s-2 5.5-4.5 5.5a4 4 0 1 1 3.5-3.5" />
          </svg>
        );
        case 'crown': return (
          <svg {...props}>
            <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z" />
          </svg>
        );
        case 'run': return (
          <svg {...props}>
            <path d="M13 4l-1 2-2 1-3 1-1 2v4" />
            <path d="M12 10a1 1 0 1 0 2 0 1 1 0 1 0-2 0z" />
            <path d="M17 10h-2l-2-2-4 1-2 4h-2" />
            <path d="M13 14l-2 5h-2" />
            <path d="M12 14h2l3 3h2" />
          </svg>
        );
        case 'bullseye': return (
          <svg {...props}>
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
          </svg>
        );
        case 'perfect': return (
          <svg {...props}>
            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        );
        case 'throne': return (
          <svg {...props}>
            <path d="M19 21v-4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4" />
            <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
            <path d="M17 11V7l-5-4-5 4v4h10Z" />
            <path d="M4 21h16" />
          </svg>
        );
        case 'target': return (
          <svg {...props}>
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        );
        case 'zap': return (
          <svg {...props}>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        );
        case 'star': return (
          <svg {...props}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
          </svg>
        );
        case 'book': return (
          <svg {...props}>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        );
        case 'bolt': return (
          <svg {...props}>
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
        case 'flag': return (
          <svg {...props}>
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1v19" />
          </svg>
        );
        case 'chart': return (
          <svg {...props}>
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
        );
        case 'badge': return (
          <svg {...props}>
            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
          </svg>
        );
        case 'hero': return (
          <svg {...props}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
            <path d="M12 11v4" />
          </svg>
        );
        case 'ninja': return (
          <svg {...props}>
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
            <path d="M12 8v4l3 3" />
            <path d="M12 7v1" />
          </svg>
        );
        case 'sword': return (
          <svg {...props}>
            <path d="m14.5 4 5.5 5.5L7 22.5l-5.5-5.5L14.5 4Z" />
            <path d="M5 16 3 3" />
          </svg>
        );
        case 'shield': return (
          <svg {...props}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          </svg>
        );
        case 'upward': return (
          <svg {...props}>
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        );
        case 'check': return (
          <svg {...props}>
            <path d="M20 6L9 17l-5-5" />
          </svg>
        );
        case 'flask': return (
          <svg {...props}>
            <path d="M9 3h6v4l-4 8v5H9v-5l-4-8V3h4z" />
            <path d="M8 3h8" />
          </svg>
        );
        default: return (
          <svg {...props}>
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        );
      }
    };

    return (
      <div className="font-sans text-zinc-900 dark:text-white selection:bg-orange-500/30 transition-all duration-300" ref={resultRef} id="quiz-result">
        <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 space-y-7 animate-fade-in">

          {/* Centered Results Header */}
          <div className="text-center space-y-2 max-w-xl mx-auto">

            <div className="space-y-1.5">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
                <span className="text-orange-500">{percentage}%</span> <span className="text-zinc-300 dark:text-zinc-700">·</span> {percentage >= 90 ? 'Outstanding!' : percentage >= 80 ? 'Great job!' : percentage >= 60 ? 'Good Effort!' : 'Keep Pushing!'}
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                {percentage >= 80
                  ? `You outperformed ${Math.min(99, 70 + Math.floor(percentage / 4))}% of peers in ${selectedSubject?.name || 'this subject'}. Mastery achieved.`
                  : `Steady progress in ${selectedSubject?.name || 'this subject'}. Review your question breakdown below to master weak spots.`}
              </p>
            </div>
          </div>

          {/* Clean horizontal stats with thin dividers - NO separate boxes */}
          <div className="flex items-center justify-between max-w-2xl mx-auto py-4 px-2 border-y border-zinc-200/80 dark:border-white/[0.08]">
            <div className="flex-1 text-center">
              <span className="text-[11px] font-medium text-zinc-400 block mb-0.5">Correct</span>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {score}<span className="text-zinc-500 text-sm font-normal">/{totalAuto}</span>
              </p>
            </div>
            <div className="h-8 w-px bg-zinc-200 dark:bg-white/10 shrink-0" />
            <div className="flex-1 text-center">
              <span className="text-[11px] font-medium text-zinc-400 block mb-0.5">Incorrect</span>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {totalAuto - score}
              </p>
            </div>
            <div className="h-8 w-px bg-zinc-200 dark:bg-white/10 shrink-0" />
            <div className="flex-1 text-center">
              <span className="text-[11px] font-medium text-zinc-400 block mb-0.5">Avg Speed</span>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {formatAvgTime(avgTimePerQuestion)}
              </p>
            </div>
            <div className="h-8 w-px bg-zinc-200 dark:bg-white/10 shrink-0" />
            <div className="flex-1 text-center">
              <span className="text-[11px] font-medium text-zinc-400 block mb-0.5">Time Taken</span>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {formatTime(totalTimeTaken)}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => document.getElementById('question-review-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 rounded-full font-semibold text-sm shadow-sm transition-all flex items-center gap-2 active:scale-95"
            >
              <span>Review Questions</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M19 9l-7 7-7-7" /></svg>
            </button>
            <button
              onClick={handleGenerate}
              className="px-5 py-2.5 rounded-full font-medium text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-zinc-400"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
              <span>Retake Quiz</span>
            </button>
            <button
              onClick={handleBackToDashboard}
              className="px-5 py-2.5 rounded-full font-medium text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-zinc-400"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /></svg>
              <span>Dashboard</span>
            </button>
          </div>

          {/* Achievements - Scrollable container with earned badges highlighted */}
          <div className="max-w-2xl mx-auto rounded-2xl border border-zinc-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111113] overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-100 dark:border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-900 dark:text-white tracking-tight">Achievements</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  {earnedMilestones.length} Earned
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 font-medium">
                {allMilestones.length} Total Badges
              </span>
            </div>

            {/* Scrollable list instead of full length */}
            <div className="max-h-64 sm:max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-white/[0.04] overscroll-contain">
              {sortedMilestones.map((m, idx) => {
                const isEarned = m.condition;
                return (
                  <div
                    key={idx}
                    className={`px-5 py-3 flex items-center justify-between gap-4 transition-colors ${
                      isEarned
                        ? 'bg-orange-500/[0.03] dark:bg-orange-500/[0.06]'
                        : 'opacity-40 hover:opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                          isEarned
                            ? 'bg-orange-500/10 border-orange-500/20 text-orange-500'
                            : 'bg-zinc-100 dark:bg-white/[0.04] border-zinc-200/50 dark:border-white/[0.06] text-zinc-400'
                        }`}
                      >
                        {getMilestoneIcon(m.icon || '')}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-xs font-semibold truncate ${isEarned ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>
                            {m.label}
                          </p>
                          {isEarned && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider rounded bg-orange-500/15 text-orange-600 dark:text-orange-400">
                              Unlocked
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate">{(m as any).desc || 'Achievement'}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] uppercase font-semibold shrink-0 ${isEarned ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-400/60'}`}>
                      {m.rarity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Question Review Section - Single container separator list */}
        <div id="question-review-section" className="max-w-2xl mx-auto pt-6 pb-12 px-4 sm:px-6 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-white/[0.06]">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">Question Review</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Evaluation of your performance per question</p>
            </div>
            <span className="text-xs font-medium text-zinc-400">{quizQuestions.length} Questions</span>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111113] divide-y divide-zinc-100 dark:divide-white/[0.04] overflow-hidden">
            {quizQuestions.map((q, i) => {
              const isSubjective = q.type === 'subjective';
              const isCoding = q.type === 'coding';
              const ansObj = userAnswers[i] as any;
              const isCorrect = isCoding
                ? (ansObj && typeof ansObj === 'object' ? ansObj.passed : false)
                : (!isSubjective && userAnswers[i] === q.correctAnswer);

              const timeSpent = timeSpentByQuestion[i] || 0;
              const struggleMultiplier = q.difficulty === 'Easy' ? 1.25 : q.difficulty === 'Hard' ? 2.0 : 1.5;
              const isStruggle = timeSpent > avgTimePerQuestion * struggleMultiplier;

              const label = isCoding ? (isCorrect ? 'Tests Passed' : 'Tests Failed') : (isSubjective ? 'Subjective' : (isCorrect ? 'Correct' : 'Incorrect'));

              return (
                <div key={i} className="p-4 sm:p-5 space-y-2.5">
                  {/* Metadata Row */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-zinc-900 dark:text-white">Q{i + 1}</span>
                      <span className={`text-[11px] font-semibold ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : isSubjective ? 'text-orange-500' : 'text-red-500'}`}>
                        {label}
                      </span>
                      {isStruggle && (
                        <span className="text-[10px] text-rose-500 font-medium">· Struggle Area</span>
                      )}
                      <span className="text-zinc-400">· {formatAvgTime(timeSpent)}</span>
                      <span className="text-zinc-400">· Unit 0{q.unit}</span>
                      {q.difficulty && <span className="text-zinc-400">· {q.difficulty}</span>}
                      {q.questionType && <span className="text-zinc-400">· {q.questionType}</span>}
                    </div>

                    <button
                      onClick={() => toggleBookmark(q.id || '')}
                      className={`p-1 transition-all active:scale-90 ${bookmarkedIds.has(q.id || '')
                          ? 'text-amber-500'
                          : 'text-zinc-400 hover:text-amber-500'
                        }`}
                      title={bookmarkedIds.has(q.id || '') ? 'Remove Bookmark' : 'Bookmark Question'}
                    >
                      <svg viewBox="0 0 24 24" fill={bookmarkedIds.has(q.id || '') ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  </div>

                  {/* Question Text */}
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                    {parseText(q.question)}
                  </p>

                  {/* Answers Comparison */}
                  {isCoding ? (
                    <div className="space-y-2 pt-1 text-xs">
                      <pre className="font-mono text-xs bg-zinc-900/60 p-3 rounded-xl overflow-auto text-zinc-300 max-h-36">
                        {ansObj?.code || '# No code submitted'}
                      </pre>
                      {ansObj?.results && ansObj.results.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {ansObj.results.map((res: any, idx: number) => (
                            <span key={idx} className={`px-2 py-0.5 rounded text-[10px] font-mono ${res.passed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                              Case {idx + 1}: {res.passed ? '✓' : '✗'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : !isSubjective ? (
                    <div className="text-xs space-y-1 pt-0.5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-zinc-400 font-medium shrink-0">Your Answer:</span>
                        <span className={isCorrect ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-red-500 font-medium"}>
                          {userAnswers[i] !== undefined ? parseText(q.options?.[userAnswers[i]]) : 'Skipped'}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-zinc-400 font-medium shrink-0">Correct:</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            {parseText(q.options?.[q.correctAnswer ?? 0])}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 pt-0.5">Self-evaluated model answer check completed.</p>
                  )}

                  {/* Explanation */}
                  {q.explanation && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed pt-1.5 border-t border-zinc-100 dark:border-white/[0.04]">
                      <span className="text-zinc-400 font-medium">Explanation: </span>
                      {parseText(q.explanation)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {renderModals()}
      </div>
    );
  }

  // ═══════════ Global Overlays ═══════════
  const globalOverlays = (
    <>
      <XPBreakdown />
      <LevelUpOverlay />
      <StreakToast />
      {renderModals()}

      {/* ═══════════ Progress Timeline Modal ═══════════ */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showProgressModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              style={{ backdropFilter: 'blur(20px) saturate(180%)', zIndex: 60 }}
              onClick={() => setShowProgressModal(false)}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 16 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-[92vw] max-w-4xl bg-white/95 dark:bg-[#121214]/95 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-zinc-200/80 dark:border-white/[0.08] relative backdrop-blur-xl flex flex-col max-h-[88vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-zinc-100 dark:border-white/[0.06] flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
                        {shortBrandName} Journey
                      </h2>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-white/[0.06]">
                        Tier {level.level} of {LEVEL_THRESHOLDS.length}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Track your academic progress, level up, and unlock exclusive rewards.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Account Rank / Total XP Pill */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200/80 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.03]">
                      <Trophy className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                      <div className="flex items-baseline gap-1 text-xs">
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          {userQuizProfile.total_xp?.toLocaleString?.() ?? userQuizProfile.total_xp}
                        </span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">XP</span>
                      </div>
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={() => setShowProgressModal(false)}
                      className="w-8 h-8 rounded-full border border-zinc-200/80 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all"
                      aria-label="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
                  {/* Current Level Progress Banner */}
                  {level.nextLevel && (
                    <div className="p-3.5 rounded-xl bg-zinc-50/80 dark:bg-white/[0.02] border border-zinc-200/60 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                          {getTierLucideIcon(level.level, true, "w-4 h-4")}
                          <span>{level.title}</span>
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                          {getTierLucideIcon(level.nextLevel.level, true, "w-4 h-4")}
                          <span>{level.nextLevel.title}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-1 sm:max-w-xs">
                        <div className="flex-1 h-1.5 bg-zinc-200/80 dark:bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${level.progress}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="h-full bg-zinc-900 dark:bg-white rounded-full"
                          />
                        </div>
                        <span className="text-[11px] font-mono font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                          {level.progress}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Horizontal Timeline Map (Circles in a line, no boxes) */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-4 px-1">
                      <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        Journey Timeline
                      </span>
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                        {level.level} of {LEVEL_THRESHOLDS.length} Tiers Unlocked
                      </span>
                    </div>

                    <div className="overflow-x-auto pb-6 pt-4 px-2 custom-scrollbar">
                      <div className="relative min-w-[760px] flex items-start justify-between">
                        {/* Continuous timeline connecting line behind the circles */}
                        <div className="absolute top-5 left-7 right-7 h-0.5 bg-zinc-200 dark:bg-white/10 z-0">
                          {/* Filled progress bar */}
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min(100, Math.max(0, ((level.level - 1) / (LEVEL_THRESHOLDS.length - 1)) * 100))}%`
                            }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="h-full bg-zinc-900 dark:bg-white"
                          />
                        </div>

                        {LEVEL_THRESHOLDS.map((tier) => {
                          const isRewardUnlocked = userQuizProfile.total_xp >= tier.minXP;
                          const isCurrent = level.level === tier.level;
                          const isCollected = Array.isArray(userQuizProfile?.unlocked_frames)
                            ? userQuizProfile.unlocked_frames.includes(tier.rewardFrame)
                            : false;
                          const frameConfig = null;

                          return (
                            <div
                              key={tier.level}
                              className="flex flex-col items-center text-center relative z-10 w-24 flex-shrink-0 group"
                            >
                              {/* Circle Node on the line */}
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative ${
                                  isCurrent
                                    ? 'bg-white shadow-md ring-4 ring-zinc-300 dark:ring-white/20 scale-110'
                                    : isRewardUnlocked
                                      ? 'bg-white shadow-sm'
                                      : 'bg-zinc-100 text-zinc-400 dark:bg-[#18181b] dark:text-zinc-500 border border-zinc-200/80 dark:border-white/10'
                                }`}
                              >
                                {getTierLucideIcon(
                                  tier.level,
                                  isRewardUnlocked,
                                  isCurrent ? "w-5 h-5" : "w-4.5 h-4.5"
                                )}

                                {/* Checkmark badge for completed past tiers */}
                                {isRewardUnlocked && !isCurrent && (
                                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-[#121214]">
                                    <Check className="w-2 h-2 stroke-[3]" />
                                  </div>
                                )}
                              </div>

                              {/* Details below node - Clean typography, no box */}
                              <div className="mt-3 flex flex-col items-center">
                                <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                  Tier {tier.level}
                                </span>
                                <span className={`text-xs mt-0.5 whitespace-nowrap ${
                                  isCurrent
                                    ? 'font-bold text-zinc-900 dark:text-white'
                                    : isRewardUnlocked
                                      ? 'font-semibold text-zinc-800 dark:text-zinc-200'
                                      : 'font-medium text-zinc-400 dark:text-zinc-500'
                                }`}>
                                  {tier.title}
                                </span>
                                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 whitespace-nowrap">
                                  {tier.minXP.toLocaleString()} XP
                                </span>

                                {/* Status indicator */}
                                {isCurrent ? (
                                  <span className="mt-2 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                                    Current
                                  </span>
                                ) : isRewardUnlocked ? (
                                  <span className="mt-2 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                                    Unlocked
                                  </span>
                                ) : (
                                  <span className="mt-2 text-[10px] text-zinc-400 dark:text-zinc-600 flex items-center gap-0.5">
                                    <Lock className="w-2.5 h-2.5" /> Locked
                                  </span>
                                )}

                                {/* Collectible Frame if available */}
                                {tier.rewardFrame && (
                                  <div className="mt-3 flex flex-col items-center">
                                    <RewardItemCard
                                      tier={tier}
                                      isRewardUnlocked={isRewardUnlocked}
                                      isCollected={isCollected}
                                      userQuizProfile={userQuizProfile}
                                      userProfile={userProfile}
                                      updateUserQuizProfile={updateUserQuizProfile}
                                      userId={userId}
                                      frameConfig={frameConfig}
                                    />
                                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium mt-1">
                                      {tier.rarity || 'Exclusive'} Frame
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.getElementById('modal-root') || document.body
      )}
    </>
  );

  // ═══════════ Reimagined Dashboard View ═══════════
  if (quizQuestions.length === 0 && !quizCompleted && !reviewMode && dashboardView === 'dashboard') {
    return (
      <div className="w-full">
        {globalOverlays}
        <QuizDashboardView
          userProfile={userProfile}
          userQuizProfile={userQuizProfile}
          totalXP={totalXP}
          level={level}
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          streakCalendar={streakCalendar}
          isStreakAtRisk={isStreakAtRisk}
          featuredQuiz={featuredQuiz}
          featuredCompleted={featuredCompleted}
          featuredScore={featuredScore}
          activeChallenges={activeChallenges}
          completedChallengeIds={completedChallengeIds}
          subjectsWithSyllabi={subjectsWithSyllabi}
          onStartFeaturedQuiz={handleStartFeaturedQuiz}
          onStartChallenge={handleStartChallenge}
          onLaunchOfficialPapers={(sub) => {
            if (sub) {
              handleSubjectChange(sub);
              setSelectedUnits([]);
            }
            setShowCustomQuizBuilder(false);
            setDashboardView('official');
          }}
          onLaunchCustomBuilder={(sub) => {
            if (sub) {
              handleSubjectChange(sub);
              setSelectedUnits([]);
            }
            setShowCustomQuizBuilder(true);
            setDashboardView('custom');
          }}
          onLaunchHistory={() => setDashboardView('history')}
          onOpenProgressModal={() => setShowProgressModal(true)}
          shortBrandName={shortBrandName}
          fullBrandName={fullBrandName}
          isLPU={isLPU}
          error={error}
          onDismissError={() => setError(null)}
        />
      </div>
    );
  }


  // ═══════════ History View ═══════════
  if (dashboardView === 'history' && quizQuestions.length === 0 && !quizCompleted && !reviewMode) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20 px-4 md:px-0">
        {globalOverlays}

        {/* Header with Apple-Style Back Button */}
        <div className="flex items-center gap-3.5 pt-2 pb-1">
          <button
            type="button"
            onClick={() => setDashboardView('dashboard')}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-white/[0.15] text-zinc-700 dark:text-white transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 flex-shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Quiz History
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Review your past performance, scores, and answers</p>
          </div>
        </div>

        <HistorySection />
      </div>
    );
  }

  // ═══════════ Custom Quiz Builder View ═══════════
  if (dashboardView === 'custom' && quizQuestions.length === 0 && !quizCompleted && !reviewMode) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20 px-4 md:px-0">
        {globalOverlays}

        <CompactCustomQuizBuilder
          subjects={subjectsWithSyllabi}
          selectedSubject={selectedSubject}
          onSelectSubject={(s) => {
            handleSubjectChange(s);
            setSelectedUnits([]);
          }}
          availableUnits={availableUnitsForSubject}
          selectedUnits={selectedUnits}
          onToggleUnit={toggleUnit}
          onSelectAllUnits={selectAllUnits}
          selectedDifficulties={selectedDifficulties}
          onToggleDifficulty={(lvl) => {
            setSelectedDifficulties(prev => prev.includes(lvl) ? prev.filter(d => d !== lvl) : [...prev, lvl]);
          }}
          numMCQ={numMCQ}
          setNumMCQ={setNumMCQ}
          hasMCQs={hasMCQs}
          numSubjective={numSubjective}
          setNumSubjective={setNumSubjective}
          hasSubjective={hasSubjective}
          numCoding={numCoding}
          setNumCoding={setNumCoding}
          hasCoding={hasCoding}
          timerMinutes={timerMinutes}
          setTimerMinutes={setTimerMinutes}
          isPracticeMode={isPracticeMode}
          setIsPracticeMode={setIsPracticeMode}
          negativeMarking={negativeMarking}
          setNegativeMarking={setNegativeMarking}
          includeSolved={includeSolved}
          setIncludeSolved={setIncludeSolved}
          solvedCount={solvedQuestionIds.size}
          availableTopicsByUnit={availableTopicsByUnit}
          selectedTopics={selectedTopics}
          onToggleTopic={(t) => {
            setSelectedTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
          }}
          onClearTopics={() => setSelectedTopics([])}
          showTopics={showTopics}
          setShowTopics={setShowTopics}
          onStartQuiz={handleGenerate}
          onSwitchToOfficialPapers={() => {
            setShowCustomQuizBuilder(false);
            setDashboardView('official');
          }}
          onBackToDashboard={() => {
            setShowCustomQuizBuilder(false);
            setDashboardView('dashboard');
          }}
          isLoading={loading || isFetchingQuestions}
          maxSubjectMCQs={subjectQuestions.filter(q => q.type === 'mcq').length}
        />
      </div>
    );
  }

  // ═══════════ Official Exam Papers Explorer View ═══════════
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20 px-4 md:px-0">
      {globalOverlays}

      <OfficialExamPapersExplorer
        subjects={subjectsWithSyllabi}
        selectedSubject={selectedSubject}
        onSelectSubject={(s) => {
          handleSubjectChange(s);
          setSelectedUnits([]);
        }}
        examPapers={examPapers}
        subjectQuestions={subjectQuestions}
        isLoading={isFetchingExamPapers || loading}
        onStartExamPaper={handleStartExamPaper}
        onSwitchToCustomBuilder={() => {
          setShowCustomQuizBuilder(true);
          setDashboardView('custom');
        }}
        onBackToDashboard={() => {
          setShowCustomQuizBuilder(false);
          setDashboardView('dashboard');
        }}
      />
    </div>
  );
}

export default QuizTaker;
