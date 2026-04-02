import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { UserProfile, QuizQuestion, LibraryFile } from '../types.ts';
import NexusServer from '../services/nexusServer';
import { generateQuizFromSyllabus } from '../services/geminiService.ts';
import { extractTextFromPdf } from '../services/pdfUtils.ts';
import jsPDF from 'jspdf';
import { showToast } from './Toast.tsx';
import html2canvas from 'html2canvas';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';

import { SYLLABUS_DATA } from '../data/syllabusData.ts';
// Removed QUIZTAKER_DATA import to resolve lag - fetching on demand from Supabase instead.

// Dashboard components
import FeaturedQuizCard from './quiz/FeaturedQuizCard.tsx';
import ChallengeCard from './quiz/ChallengeCard.tsx';
import QuickStartBar from './quiz/QuickStartBar.tsx';
import XPBreakdown from './quiz/XPBreakdown.tsx';
import LevelUpOverlay from './quiz/LevelUpOverlay.tsx';
import StreakToast from './quiz/StreakToast.tsx';
import HistorySection from './quiz/HistorySection.tsx';


// Dashboard hooks & store
import { useXP } from '../hooks/useXP.ts';
import { useStreak } from '../hooks/useStreak.ts';
import { useDashboard } from '../hooks/useDashboard.ts';
import { useQuizDashboardStore, getLevelInfo, LEVEL_THRESHOLDS } from '../stores/quizStore.ts';
import { FRAME_CONFIGS, getFrameConfig } from '../data/frameConfigs.ts';

const parseText = (text: string | undefined) => {
  if (!text) return null;
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$.*?\$|\*\*.*?\*\*)/g);
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
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
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
    <div className="flex flex-col items-center gap-2 group/reward relative">
      <div className={`relative w-12 h-12 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-xl border border-white/10 shadow-lg shadow-black/20 ${
        isRewardUnlocked && !isCollected ? 'ring-2 ring-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.4)]' : ''
      }`}>
        {/* Shine Animation for available collection */}
        {isRewardUnlocked && !isCollected && (
          <motion.div 
            animate={{ 
              x: ['-100%', '200%'],
              opacity: [0, 0.5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 1
            }}
            className="absolute inset-0 z-30 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none"
          />
        )}

        {/* Pulsing Glow for available collection */}
        {isRewardUnlocked && !isCollected && (
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 z-20 bg-orange-500/20 blur-xl pointer-events-none"
          />
        )}

        {/* Rarity Background */}
        {tier.rarity && (
          <img 
            src={`/Rarity/${tier.rarity}.png`} 
            alt={tier.rarity}
            className="absolute inset-0 w-full h-full object-cover opacity-100 group-hover/reward:scale-110 transition-transform duration-500"
          />
        )}
        
        {/* Frame Asset */}
        <div className="relative w-[60%] h-[60%] flex items-center justify-center z-10">
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
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center z-20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5 text-white/50"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          </div>
        )}
      </div>
      
      <div className="w-full flex justify-center">
        {isRewardUnlocked ? (
          isCollected ? (
            <div className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[5.5px] font-black uppercase tracking-[0.2em] rounded-full flex items-center gap-1 border border-emerald-500/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-1.5 h-1.5"><polyline points="20 6 9 17 4 12" /></svg>
              OWNED
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
              className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-orange-400 text-white hover:brightness-110 active:scale-95 text-[6px] font-black uppercase tracking-widest rounded-md shadow-md transition-all z-20 shadow-orange-500/20"
            >
              Collect
            </button>
          )
        ) : (
          <div className="text-[5.5px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded-full border border-slate-200 dark:border-white/5">
            LOCKED
          </div>
        )}
      </div>
    </div>
  );
};

const QuizTaker: React.FC<{ userProfile: UserProfile | null, onAuthRequired?: () => void }> = ({ userProfile, onAuthRequired }) => {
  const { subjectName, quizId } = useParams();
  const navigate = useNavigate();

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
  const [testResults, setTestResults] = useState<{in: string, out: string, actual: string, passed: boolean}[]>([]);
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
    const initPyodide = async () => {
      if (window.loadPyodide && !pyodide) {
        try {
          const loadedPyodide = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/"
          });
          setPyodide(loadedPyodide);
        } catch (err) {
          console.error("Pyodide failed to load", err);
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

  // Fetch questions for selected subject to populate filters
  useEffect(() => {
    const fetchSubjectData = async () => {
      if (!selectedSubject) {
        setSubjectQuestions([]);
        return;
      }
      
      setIsFetchingQuestions(true);
      try {
        // Smart normalization: extract code like CHE110 using regex
        const subjectName = selectedSubject.name || '';
        const subjectMatch = subjectName.match(/[A-Za-z]+[0-9]+/);
        const subjectCode = subjectMatch ? subjectMatch[0].toUpperCase() : subjectName.split(':')[0].trim().replace(/\s+/g, '').toUpperCase();
        
        // 1. Fetch metadata (units/topics) to build filters efficiently 
        const metadata = await NexusServer.fetchSubjectMetadata(subjectCode);
        
        // 2. Fetch full question pool for initial view
        const questions = await NexusServer.fetchQuestions(subjectCode);
        setSubjectQuestions(questions);
      } catch (err) {
        console.error("Error fetching subject questions:", err);
      } finally {
        setIsFetchingQuestions(false);
      }
    };
    
    fetchSubjectData();
  }, [selectedSubject]);

  const availableUnitsForSubject = useMemo(() => {
    if (subjectQuestions.length === 0) return [1, 2, 3, 4, 5, 6]; // Default fallback
    const units = new Set<number>();
    subjectQuestions.forEach(q => units.add(Number(q.unit)));
    return Array.from(units).sort((a, b) => a - b);
  }, [subjectQuestions]);

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
  }, []);

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
      
      // Fetch available subject names from Supabase
      const subjectNames = await NexusServer.fetchSubjectNames();

      subjectNames.forEach((subjectName, index) => {
        // Normalize code by removing spaces: "CHE 110" -> "CHE110"
        const subjectMatch = subjectName.match(/[A-Za-z]+[0-9]+/);
        const normalizedCode = subjectMatch ? subjectMatch[0].toUpperCase() : subjectName.split(':')[0].trim().replace(/\s+/g, '').toUpperCase();
        subjectsMap.set(normalizedCode, {
          id: `QUIZ_SUB_${index}`,
          name: subjectName,
          syllabusFile: null as any
        });
      });

      // Also ensure subjects from SYLLABUS_DATA (Fallback) are included
      // We deduplicate by normalized code
      Object.keys(SYLLABUS_DATA).forEach((fullName, index) => {
        const fullCode = fullName.split(':')[0].trim();
        const normalizedCode = fullCode.replace(/\s+/g, '').toUpperCase();
        
        const existing = subjectsMap.get(normalizedCode);
        
        if (!existing) {
          // New subject
          subjectsMap.set(normalizedCode, {
            id: `AI_SUB_${index}`,
            name: fullName,
            syllabusFile: null as any
          });
        } else {
            // If already exists, prefer the name that has a description (colon)
            // or is generally longer/more descriptive
            if (fullName.includes(':') && !existing.name.includes(':')) {
                subjectsMap.set(normalizedCode, {
                    ...existing,
                    name: fullName
                });
            }
        }
      });

      // Final unique subjects list
      const finalSubjects = Array.from(subjectsMap.values())
        .sort((a, b) => a.name.localeCompare(b.name));
        
      setSubjectsWithSyllabi(finalSubjects);
    } catch (err) {
      console.error("Library load error:", err);
      // Fallback: at least show what's in SYLLABUS_DATA
      const fallback = Object.keys(SYLLABUS_DATA).map((name, i) => ({
          id: `F_SUB_${i}`,
          name,
          syllabusFile: null as any
      }));
      setSubjectsWithSyllabi(fallback);
    } finally {
      setInitializing(false);
    }
  };

  // Sync selectedSubject with URL param
  useEffect(() => {
    if (subjectsWithSyllabi.length > 0 && subjectName) {
      const decoded = decodeURIComponent(subjectName);
      const sub = subjectsWithSyllabi.find(s => s.name === decoded);
      if (sub && (!selectedSubject || selectedSubject.name !== decoded)) {
        setSelectedSubject(sub);
      }
    }
  }, [subjectName, subjectsWithSyllabi]);

  // Update URL when selectedSubject changes
  const handleSubjectChange = (sub: SubjectWithSyllabus | null) => {
    if (sub) {
      // If we are already in a quiz for this subject, maybe we don't want to reset? 
      // But if we're picking a new subject from the setup screen, we reset.
      navigate(`/quiz/${encodeURIComponent(sub.name)}`);
      setQuizQuestions([]);
      setQuizIdInState(null);
    } else {
      navigate('/quiz');
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
    navigate('/quiz');
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
    navigate(`/quiz/featured/${newQuizId}`);
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
    navigate(`/quiz/challenge/${newQuizId}`);
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
    navigate(`/quiz/${encodeURIComponent(selectedSubject!.name)}/${newQuizId}`);

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
                  <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </div>
                
                <div className="space-y-6">
                  <p className="text-sm text-slate-400 leading-relaxed">What's wrong with this question? Your report will be reviewed by Nexus Moderators to ensure content quality.</p>
                  
                  <div className="space-y-3">
                    {['Incorrect Answer', 'Typo/Grammar Error', 'Out of Syllabus', 'Technical Glitch'].map((option) => (
                      <button
                        key={option}
                        onClick={() => setReportReason(option)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all ${
                          reportReason === option 
                            ? 'bg-orange-500/10 border-orange-500 text-orange-400' 
                            : 'bg-white/5 border-white/5 text-slate-400 hover:border-orange-500/30'
                        }`}
                      >
                        <span className="text-sm font-semibold">{option}</span>
                      </button>
                    ))}
                    
                    <textarea
                      placeholder="Additional details or specific concerns..."
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all min-h-[100px] text-slate-200"
                    />
                  </div>

                  <button
                    disabled={!reportReason.trim() || isReporting}
                    onClick={submitReport}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-xl hover:shadow-orange-500/20 text-white rounded-2xl text-sm font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 border-none"
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
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" 
                onClick={() => setShowEditModal(false)} 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Question</h3>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Admin Console</p>
                  </div>
                  <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-500">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question Text</label>
                    <textarea
                      value={editForm.question}
                      onChange={(e) => setEditForm(prev => ({ ...prev, question: e.target.value }))}
                      className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[80px] text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  {editForm.options && editForm.options.length > 0 && (
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Options</label>
                      {editForm.options.map((opt, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${editForm.correctAnswer === idx ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <input
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...(editForm.options || [])];
                              newOpts[idx] = e.target.value;
                              setEditForm(prev => ({ ...prev, options: newOpts }));
                            }}
                            className="flex-1 p-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 text-slate-800 dark:text-slate-200"
                          />
                          <button 
                            onClick={() => setEditForm(prev => ({ ...prev, correctAnswer: idx }))}
                            className={`px-3 rounded-xl border text-[8px] font-bold uppercase transition-all ${editForm.correctAnswer === idx ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 dark:border-white/10 text-slate-400 hover:border-emerald-500/30'}`}
                          >
                            Correct
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Explanation</label>
                    <textarea
                      value={editForm.explanation}
                      onChange={(e) => setEditForm(prev => ({ ...prev, explanation: e.target.value }))}
                      className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[80px] text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Topic</label>
                      <input
                        value={editForm.topic}
                        onChange={(e) => setEditForm(prev => ({ ...prev, topic: e.target.value }))}
                        className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-sm focus:outline-none text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Difficulty Level</label>
                      <select
                        value={editForm.difficulty}
                        onChange={(e) => setEditForm(prev => ({ ...prev, difficulty: e.target.value }))}
                        className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-sm focus:outline-none text-slate-800 dark:text-slate-200 appearance-none cursor-pointer"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
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
      <div className="w-12 h-12 border-4 border-orange-500/10 border-t-orange-600 rounded-full animate-spin" />
      <p className="text-sm font-medium text-slate-500">Setting up your subjects...</p>
      {renderModals()}
    </div>
  );

  if (loading) return (
    <div className="h-[70vh] flex flex-col items-center justify-center space-y-10 animate-fade-in">
      <div className="relative">
        <div className="w-24 h-24 border-8 border-orange-500/10 rounded-full" />
        <div className="absolute inset-0 w-24 h-24 border-8 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-semibold text-slate-800 dark:text-white">Starting Quiz</h3>
        <p className="text-sm font-medium text-slate-500 animate-pulse">{status}</p>
      </div>
      {renderModals()}
    </div>
  );

  if (quizQuestions.length > 0 && !quizCompleted && !reviewMode) {
    const q = quizQuestions[currentQuestionIdx];
    const currentAnswer = userAnswers[currentQuestionIdx];
    const isSubjectiveSection = q.type === 'subjective';
    const isCodingSection = q.type === 'coding';

    return (
      <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in pb-20 px-4 md:px-10 dark:text-white">
        {/* Modern Unified Header: Section Info & Progress Tracking */}
        <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4 pt-10">
          {/* Aligned with Question Box (lg:col-span-8) */}
          <div className="lg:col-span-8 px-4 md:px-0">
            {/* Extremely Compact Progress Indicator - Matching Reference with LPU Nexus Theme */}
            <div className="glass-panel p-5 px-8 rounded-3xl bg-white dark:bg-dark-900/40 border border-slate-200 dark:border-white/5 shadow-sm space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {isSubjectiveSection ? 'Subjective' : isCodingSection ? 'Coding' : 'MCQ'} Section
                </span>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Question {currentQuestionIdx + 1} of {quizQuestions.length}
                  </h3>
                  <span className="text-base font-bold text-orange-500">{progressPercent}%</span>
                </div>
              </div>

              <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-orange-500 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Actions Column (Timer & Submit) */}
          <div className="lg:col-span-4 flex items-center justify-end gap-3 px-4 md:px-0">
            {timerActive && (
              <div className="flex items-center gap-3 px-5 h-11 rounded-2xl bg-white/60 dark:bg-dark-900/40 border border-slate-200 dark:border-white/5 backdrop-blur-md shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`w-4 h-4 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-orange-500'}`}>
                  <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                </svg>
                <p className={`text-[15px] font-bold tabular-nums ${timeLeft < 60 ? 'text-red-500' : 'text-slate-900 dark:text-slate-100'}`}>
                  {formatTime(timeLeft)}
                </p>
              </div>
            )}
            
            <button
              onClick={() => setQuizCompleted(true)}
              className="px-6 h-11 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-2xl text-[14px] font-semibold transition-all shadow-lg shadow-emerald-500/10 active:scale-95 flex items-center gap-2 whitespace-nowrap group"
            >
              <span>Submit Test</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 opacity-80 transition-transform group-hover:translate-x-1">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Question Area */}
          <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="glass-panel p-10 md:p-12 rounded-[48px] shadow-2xl bg-white/80 dark:bg-dark-900/50 border-slate-200 dark:border-white/5 relative">
              <div className="space-y-10">
                <div className="flex items-center flex-wrap gap-3">
                  <span className="bg-orange-600/10 dark:bg-orange-600/20 text-orange-600 dark:text-orange-500 px-4 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest">Question {sectionInfo.mapping[currentQuestionIdx]}</span>
                  <span className="bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 px-4 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest">Unit {q.unit}</span>
                  {q.difficulty && (
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest ${
                      q.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      q.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
                      'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}>
                      {q.difficulty}
                    </span>
                  )}
                  {q.questionType && (
                    <span className="bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest">
                      {q.questionType}
                    </span>
                  )}
                  {q.topic && (
                    <span className="bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-xl text-[10px] font-semibold tracking-widest">
                      {q.topic}
                    </span>
                  )}
                  
                  <button
                    onClick={() => toggleBookmark(q.id || '')}
                    className={`ml-auto p-1.5 transition-all active:scale-90 ${
                      bookmarkedIds.has(q.id || '')
                        ? 'text-blue-500'
                        : 'text-slate-300 dark:text-slate-600 hover:text-blue-400'
                    }`}
                    title={bookmarkedIds.has(q.id || '') ? 'Remove Bookmark' : 'Bookmark Question'}
                  >
                    <svg viewBox="0 0 24 24" fill={bookmarkedIds.has(q.id || '') ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => handleReportOpen(q.id || '')}
                    className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-red-400 transition-all active:scale-90"
                    title="Report Error in Question"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
                    </svg>
                  </button>

                  {userProfile?.is_admin && (
                    <button
                      onClick={() => handleEditOpen(q)}
                      className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-emerald-500 transition-all active:scale-90"
                      title="Edit Question (Admin)"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  )}
                </div>

                <p className="text-lg md:text-xl font-light leading-relaxed text-slate-800 dark:text-slate-100">
                  {isCodingSection ? 'Implement the following:' : 'Q)'} {parseText(q.question)}
                </p>

                {isCodingSection ? (
                  <div className="space-y-4">
                    {/* Editor Header Bar */}
                    <div className="flex items-center justify-between px-6 py-3 bg-slate-100 dark:bg-[#252526] rounded-t-[20px] border-x border-t border-slate-200 dark:border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                        </div>
                        <div className="h-4 w-px bg-slate-300 dark:bg-white/10 mx-1" />
                        <div className="flex items-center gap-2">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-blue-500"><path d="M12 2C6.48 2 2 6.48 2 12s4.1 10 9.1 10c4.1 0 7.7-2.7 8.7-6.5h-2.1c-.9 2.7-3.4 4.5-6.6 4.5-3.6 0-6.6-2.9-6.6-6.5S7.4 7 11 7c3.1 0 5.8 2.1 6.7 5h2.1C18.8 8 15.3 5.5 11 5.5s-8 2.5-8 6.5" /></svg>
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{currentLanguage === 'cpp' ? 'C++' : currentLanguage === 'c' ? 'C' : 'Python 3'}</span>
                        </div>
                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">|</span>
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 tabular-nums">main.{currentLanguage === 'cpp' ? 'cpp' : currentLanguage === 'c' ? 'c' : 'py'}</span>
                      </div>
                      
                      <button 
                        onClick={resetCode}
                        className="flex items-center gap-1.5 px-3 py-1 hover:bg-slate-200 dark:hover:bg-white/5 rounded-lg transition-colors group"
                        title="Reset code to starter"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                        <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">Reset</span>
                      </button>
                    </div>

                    <div className="rounded-b-[20px] overflow-hidden border-x border-b border-slate-200 dark:border-white/10 shadow-xl bg-[#1e1e1e]">
                      <Editor
                        height="400px"
                        language={currentLanguage === 'cpp' ? 'cpp' : currentLanguage === 'c' ? 'c' : 'python'}
                        theme="vs-dark"
                        value={currentCode}
                        onChange={(value) => {
                          setCurrentCode(value || '');
                          handleAnswer({ code: value || '', passed: false });
                        }}
                        options={{
                          fontSize: 14,
                          minimap: { enabled: false },
                          padding: { top: 16, bottom: 16 },
                          fontFamily: 'JetBrains Mono, Menlo, monospace',
                          smoothScrolling: true,
                          cursorBlinking: 'smooth',
                          scrollBeyondLastLine: false,
                          lineNumbers: 'on',
                          glyphMargin: false,
                          folding: true,
                          lineDecorationsWidth: 10,
                          lineNumbersMinChars: 3,
                          scrollbar: {
                            vertical: 'auto',
                            horizontal: 'auto',
                            useShadows: false,
                            verticalScrollbarSize: 10,
                            horizontalScrollbarSize: 10
                          }
                        }}
                      />
                    </div>
                    
                     {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 py-2">
                        <div className="flex items-center gap-2">
                           {/* Empty or can put other status here if needed */}
                        </div>

                       <div className="flex items-center gap-3">
                         <button
                           onClick={() => runCode(false)}
                           disabled={isExecuting || (currentLanguage === 'python' && !pyodide)}
                           className="px-6 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-sm"
                         >
                           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M5 3l14 9-14 9V3z" /></svg>
                           Run Code
                         </button>
                         <button
                           onClick={() => runCode(true)}
                           disabled={isExecuting || (currentLanguage === 'python' && !pyodide)}
                           className="px-8 py-2.5 bg-orange-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-orange-500 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-orange-600/20"
                         >
                           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>
                           Submit Code
                         </button>
                       </div>
                    </div>

                    {/* Console & Results Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {/* Output Console */}
                      <div className="bg-[#0f0f0f] rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[200px] shadow-2xl">
                        <div className="px-4 py-2 border-b border-white/5 bg-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-slate-500" />
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Console</span>
                          </div>
                           <div className="flex items-center gap-3">
                             {isExecuting ? (
                               <div className="flex items-center gap-2">
                                 <div className="w-3 h-3 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                                 <button 
                                   onClick={terminateExecution}
                                   className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-md transition-all group"
                                   title="Terminate Execution"
                                 >
                                   <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 group-active:scale-90 transition-transform"><rect x="6" y="6" width="12" height="12" rx="1" /></svg>
                                 </button>
                               </div>
                             ) : (
                               <button 
                                 onClick={() => setShowStdin(!showStdin)}
                                 className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${showStdin ? 'text-orange-500' : 'text-slate-600 hover:text-slate-400'}`}
                               >
                                 {showStdin ? 'Hide Input' : 'Add Input'}
                               </button>
                             )}
                             <button 
                               onClick={() => setExecutionOutput('')}
                               className="text-[9px] font-bold text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors"
                             >
                               Clear
                             </button>
                           </div>                            
                          </div>
                        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                          {showStdin && (
                            <div className="h-1/2 border-b border-white/5 flex flex-col">
                              <div className="px-4 py-1.5 bg-white/[0.02] border-b border-white/5">
                                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Standard Input (stdin)</span>
                              </div>
                              <textarea
                                value={stdinValue}
                                onChange={(e) => setStdinValue(e.target.value)}
                                placeholder="Type input here..."
                                className="flex-1 w-full bg-transparent p-3 font-mono text-xs text-orange-200/80 outline-none resize-none placeholder:text-slate-700"
                              />
                            </div>
                          )}
                            <div 
                              ref={consoleRef}
                              className={`flex-1 p-4 font-mono text-xs overflow-auto custom-scrollbar flex flex-col ${showStdin ? 'h-1/2' : 'h-full'}`}
                            >
                               <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed inline">
                                 {executionOutput || <span className="text-slate-600 italic"># Output will appear here...</span>}
                              </pre>
                              {isAwaitingInput && (
                                <div className="flex items-center gap-1 mt-1 pb-4">
                                  <span className="w-1.5 h-3.5 bg-orange-500 animate-pulse inline-block" />
                                  <input
                                    autoFocus
                                    value={liveInput}
                                    onChange={(e) => setLiveInput(e.target.value)}
                                    onKeyDown={handleLiveInput}
                                    className="flex-1 bg-transparent border-none outline-none text-orange-200 caret-orange-500 p-0 m-0"
                                    placeholder=""
                                  />
                                </div>
                              )}
                            </div>
                        </div>
                      </div>

                      {/* Test Results */}
                      <div className="bg-[#0f0f0f] rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[200px] shadow-2xl">
                        <div className="px-4 py-2 border-b border-white/5 bg-white/5 flex items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-orange-500" />
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Test Results</span>
                          </div>
                        </div>
                        <div className="flex-1 overflow-auto custom-scrollbar p-1">
                          {(testResults.length > 0 ? testResults : (q.testCases || []).filter(tc => !tc.isHidden)).length > 0 ? (
                            <div className="divide-y divide-white/5">
                              {(testResults.length > 0 ? testResults : (q.testCases || []).filter(tc => !tc.isHidden)).map((tr: any, idx) => (
                                <div key={idx} className="p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className={`text-[9px] font-bold uppercase tracking-wider ${
                                      tr.passed === undefined ? 'text-slate-500' :
                                      tr.passed ? 'text-emerald-500' : 'text-red-500'
                                    }`}>
                                      Test Case {idx + 1} {tr.passed === undefined && '(Pending)'}
                                    </span>
                                    {tr.passed !== undefined && (
                                      tr.passed ? 
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3 text-emerald-500"><path d="M20 6L9 17l-5-5" /></svg> :
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3 text-red-500"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                    )}
                                  </div>
                                  <div className="space-y-1 font-mono text-[10px]">
                                    {tr.isHidden ? (
                                      <div className="text-slate-500 italic">[Hidden Test Case]</div>
                                    ) : (
                                      <>
                                        <div className="flex gap-2 text-slate-500 font-medium"><span>Input:</span> <span className="text-slate-400 whitespace-pre-wrap break-words">{tr.input || tr.in || 'None'}</span></div>
                                        <div className="flex gap-2 text-slate-500 font-medium"><span>Exp:</span> <span className="text-slate-400 whitespace-pre-wrap break-words">{(tr.output || tr.out || "").trim()}</span></div>
                                        {tr.passed !== undefined && (
                                          <div className={`flex gap-2 ${tr.passed ? 'text-emerald-500/70' : 'text-red-500'}`}><span>Got:</span> <span className="whitespace-pre-wrap break-words">{tr.actual || 'No output'}</span></div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-20 filter grayscale">
                               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-white mb-2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                               <span className="text-[10px] font-bold text-white uppercase tracking-widest">No Tests Available</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : q.type === 'subjective' ? (
                  <div className="space-y-6">
                    {!isShowingExplanation ? (
                      isPracticeMode ? (
                        <button
                          onClick={handleShowExplanation}
                          className="w-full py-10 rounded-[32px] border-2 border-dashed border-white/10 bg-white/[0.02] text-slate-500 font-bold hover:border-orange-500/30 hover:text-orange-600 transition-all flex flex-col items-center gap-4 group"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 opacity-20 group-hover:opacity-100 transition-opacity"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                          <span className="text-xs font-semibold">View Model Answer</span>
                        </button>
                      ) : (
                        <div className="p-10 rounded-[32px] border border-orange-500/10 bg-orange-600/[0.02] flex flex-col items-center gap-4 text-center">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-orange-500/30"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Test Mode Active</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Model solutions will be available in the final report.</p>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 dark:border-emerald-500/10 rounded-[32px] animate-in fade-in slide-in-from-top-4 duration-500 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <h4 className="text-xs font-semibold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Model Solution</h4>
                        </div>
                        <div className="text-base font-medium text-slate-700 dark:text-slate-300 leading-relaxed border-l-4 border-emerald-500/30 dark:border-emerald-500/30 pl-6">{parseText(q.explanation)}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {q.options?.map((opt, i) => {
                      const isSelected = i === currentAnswer;
                      const isCorrect = isShowingExplanation && i === q.correctAnswer;
                      const isWrong = isShowingExplanation && isSelected && i !== q.correctAnswer;

                      let style = "bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:border-slate-300 dark:hover:border-white/10";
                      if (isCorrect) style = "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]";
                      else if (isWrong) style = "bg-red-500/10 border-red-500 text-red-600 dark:text-red-500";
                      else if (isSelected) style = "bg-orange-600/10 border-orange-500 text-orange-600 dark:text-orange-500";

                      return (
                        <button
                          key={i}
                          onClick={() => handleAnswer(i)}
                          className={`p-4 rounded-2xl border text-left transition-all duration-300 flex items-center gap-4 group relative ${style}`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-orange-500' : 'border-slate-300 dark:border-dark-800'}`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_#ea580c]" />}
                          </div>
                          <span className="font-medium text-[13px] md:text-sm tracking-tight flex items-center gap-2">
                            <span className="text-slate-400 dark:text-slate-500 font-medium">{String.fromCharCode(65 + i)}.</span>
                            <span className="flex-1">{parseText(opt)}</span>
                          </span>
                        </button>
                      );
                    })}

                    {isShowingExplanation && (
                      <div className="p-8 mt-6 bg-orange-600/[0.03] dark:bg-orange-600/5 border border-orange-500/20 dark:border-orange-600/10 rounded-[32px] animate-in fade-in slide-in-from-top-4 duration-500">
                        <p className="text-[10px] font-semibold text-orange-600 uppercase tracking-widest mb-3">Expert Insights</p>
                        <div className="text-base font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-2 border-orange-500/30 dark:border-orange-600/30 pl-6">{parseText(q.explanation)}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Internal Navigation Buttons */}
                <div className="pt-10 border-t border-white/5 flex items-center justify-between gap-4 flex-wrap">
                  <button
                    disabled={currentQuestionIdx === 0}
                    onClick={() => {
                      const prevIdx = currentQuestionIdx - 1;
                      setCurrentQuestionIdx(prevIdx);
                      setIsShowingExplanation(false);
                      setVisitedQuestions(prev => new Set(prev).add(prevIdx));
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-20 active:scale-95 border border-slate-200 dark:border-transparent"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M15 18l-6-6 6-6" /></svg>
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleMarkForReview}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 border ${
                        markedForReview.has(currentQuestionIdx)
                          ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-600/20'
                          : 'bg-white dark:bg-white/5 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-white/10 hover:bg-purple-50 dark:hover:bg-purple-500/10'
                      }`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                      {markedForReview.has(currentQuestionIdx) ? 'Marked' : 'Mark for Review'}
                    </button>
                    
                    <button
                      onClick={nextQuestion}
                      className="flex items-center gap-2 px-8 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-orange-600/20 active:scale-95 transition-all hover:bg-orange-500"
                    >
                      {currentQuestionIdx === quizQuestions.length - 1 ? 'Finish Test' : 'Next'}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 sticky top-8 max-h-[calc(100vh-120px)] flex flex-col glass-panel p-8 rounded-[40px] shadow-2xl bg-white/90 dark:bg-black/40 border-slate-200 dark:border-white/5 overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
              <h4 className="text-xs font-semibold text-slate-500 text-center sticky top-0 bg-inherit py-2 z-10">Question Palette</h4>

              {/* Section 1: Objective */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className={`w-1 h-4 rounded-full ${(!isSubjectiveSection && !isCodingSection) ? 'bg-orange-600 shadow-[0_0_8px_#ea580c]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                  <span className={`text-[13px] font-semibold uppercase tracking-widest ${(!isSubjectiveSection && !isCodingSection) ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600'}`}>Section 1: Objective</span>
                </div>
                <div className="grid grid-cols-5 gap-2.5">
                  {quizQuestions.map((q, idx) => {
                    if (q.type === 'subjective' || q.type === 'coding') return null;
                    const isAnswered = userAnswers[idx] !== undefined;
                    const isVisited = visitedQuestions.has(idx);
                    const isMarked = markedForReview.has(idx);
                    const isCurrent = currentQuestionIdx === idx;

                    let bgColor = "bg-slate-100 dark:bg-dark-800/40 text-slate-400 dark:text-slate-500";
                    if (isMarked) bgColor = "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]";
                    else if (isAnswered) bgColor = "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                    else if (isVisited) bgColor = "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]";

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentQuestionIdx(idx);
                          setIsShowingExplanation(false);
                          setVisitedQuestions(prev => new Set(prev).add(idx));
                        }}
                        className={`h-11 w-full rounded-xl flex items-center justify-center text-xs font-bold transition-all border-2 relative ${isCurrent ? 'border-orange-400 scale-105 z-10' : 'border-transparent'} ${bgColor}`}
                      >
                        {sectionInfo.mapping[idx]}
                        {isMarked && isAnswered && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Subjective */}
              {hasSubjective && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-1 h-4 rounded-full ${isSubjectiveSection ? 'bg-orange-600 shadow-[0_0_8px_#ea580c]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                    <span className={`text-[13px] font-semibold uppercase tracking-widest ${isSubjectiveSection ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600'}`}>Section 2: Subjective</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2.5">
                    {quizQuestions.map((q, idx) => {
                      if (q.type !== 'subjective') return null;
                      const isAnswered = userAnswers[idx] !== undefined;
                      const isVisited = visitedQuestions.has(idx);
                      const isMarked = markedForReview.has(idx);
                      const isCurrent = currentQuestionIdx === idx;

                      let bgColor = "bg-zinc-100 dark:bg-white/5 text-slate-400 dark:text-zinc-500";
                      if (isMarked) bgColor = "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]";
                      else if (isAnswered) bgColor = "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                      else if (isVisited) bgColor = "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]";

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setCurrentQuestionIdx(idx);
                            setIsShowingExplanation(false);
                            setVisitedQuestions(prev => new Set(prev).add(idx));
                          }}
                          className={`h-11 w-full rounded-xl flex items-center justify-center text-xs font-bold transition-all border-2 relative ${isCurrent ? 'border-orange-400 scale-105 z-10' : 'border-transparent'} ${bgColor}`}
                        >
                          {sectionInfo.mapping[idx]}
                          {isMarked && isAnswered && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 3: Coding */}
              {hasCoding && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-1 h-4 rounded-full ${isCodingSection ? 'bg-orange-600 shadow-[0_0_8px_#ea580c]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                    <span className={`text-[13px] font-semibold uppercase tracking-widest ${isCodingSection ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600'}`}>Section 3: Coding</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2.5">
                    {quizQuestions.map((q, idx) => {
                      if (q.type !== 'coding') return null;
                      const ans = userAnswers[idx];
                      const isAnswered = ans && (typeof ans === 'object' ? ans.passed === true : !!ans);
                      const isVisited = visitedQuestions.has(idx);
                      const isMarked = markedForReview.has(idx);
                      const isCurrent = currentQuestionIdx === idx;

                      let bgColor = "bg-slate-100 dark:bg-dark-800/40 text-slate-400 dark:text-slate-500";
                      if (isMarked) bgColor = "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]";
                      else if (isAnswered) bgColor = "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                      else if (isVisited) bgColor = "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]";

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setCurrentQuestionIdx(idx);
                            setIsShowingExplanation(false);
                            setVisitedQuestions(prev => new Set(prev).add(idx));
                          }}
                          className={`h-11 w-full rounded-xl flex items-center justify-center text-xs font-bold transition-all border-2 relative ${isCurrent ? 'border-orange-400 scale-105 z-10' : 'border-transparent'} ${bgColor}`}
                        >
                          {sectionInfo.mapping[idx]}
                          {isMarked && isAnswered && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-white/5">
              {/* Legend with matching specifications */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-lg bg-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-lg bg-red-500" />
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">Visited</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-lg bg-zinc-100 dark:bg-white/5" />
                  <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest leading-none">Not Visited</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-lg bg-purple-600" />
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">Review</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <div className="relative w-3.5 h-3.5 rounded-lg bg-purple-600">
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-white dark:border-slate-900" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">Answered & Marked</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
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

    const allMilestones = [
      // COMMON 🟤
      { label: 'Beginner', rarity: 'common', icon: 'seedling', condition: percentage >= 5 },
      { label: 'First Step', rarity: 'common', icon: 'footsteps', condition: percentage >= 20 },
      { label: 'Participant', rarity: 'common', icon: 'badge', condition: percentage >= 35 },
      { label: 'Getting Started', rarity: 'common', icon: 'flag', condition: percentage >= 45 },
      { label: 'Rookie', rarity: 'common', icon: 'star', condition: percentage >= 55 },

      // UNCOMMON 🔵
      { label: 'Learner', rarity: 'uncommon', icon: 'book', condition: percentage >= 65 },
      { label: 'Improving', rarity: 'uncommon', icon: 'chart', condition: percentage >= 72 },
      { label: 'Halfway Hero', rarity: 'uncommon', icon: 'hero', condition: percentage >= 75 && quizQuestions.length > 10 },
      { label: 'Quick Thinker', rarity: 'uncommon', icon: 'bolt', condition: totalTimeTaken < timeAllocated * 0.55 && percentage >= 60 },
      { label: 'Rising Star', rarity: 'uncommon', icon: 'upward', condition: percentage >= 78 },

      // RARE 🟢
      { label: 'Sharp Mind', rarity: 'rare', icon: 'brain', condition: percentage >= 82 },
      { label: 'Brainiac', rarity: 'rare', icon: 'flask', condition: percentage >= 86 },
      { label: 'Speed Runner', rarity: 'rare', icon: 'run', condition: totalTimeTaken < timeAllocated * 0.35 && percentage >= 75 },
      { label: 'Accuracy Pro', rarity: 'rare', icon: 'target', condition: percentage >= 90 },
      { label: 'Consistent', rarity: 'rare', icon: 'check', condition: percentage >= 80 && percentage <= 94 },

      // EPIC 🟣
      { label: 'Quiz Master', rarity: 'epic', icon: 'trophy', condition: percentage >= 94 },
      { label: 'Knowledge Ninja', rarity: 'epic', icon: 'ninja', condition: percentage >= 97 },
      { label: 'Precision Pro', rarity: 'epic', icon: 'bullseye', condition: percentage === 100 && totalAuto >= 10 },
      { label: 'Lightning Fast', rarity: 'epic', icon: 'zap', condition: totalTimeTaken < timeAllocated * 0.22 && percentage >= 85 },
      { label: 'Dominator', rarity: 'epic', icon: 'sword', condition: percentage >= 98 && totalAuto >= 20 },

      // LEGENDARY 🟠
      { label: 'Perfect Score', rarity: 'legendary', icon: 'perfect', condition: percentage === 100 && totalAuto >= 20 },
      { label: 'Speed Demon', rarity: 'legendary', icon: 'fire', condition: totalTimeTaken < timeAllocated * 0.12 && percentage >= 90 },
      { label: 'Quiz God', rarity: 'legendary', icon: 'crown', condition: percentage === 100 && totalTimeTaken < timeAllocated * 0.25 },
      { label: 'Unstoppable', rarity: 'legendary', icon: 'shield', condition: percentage >= 98 && totalAuto >= 30 },
      { label: 'Mind King', rarity: 'legendary', icon: 'throne', condition: percentage === 100 && totalAuto >= 40 }
    ];

    const rarityStyles: Record<string, string> = {
      common: 'bg-zinc-50 border-zinc-200 dark:bg-zinc-800/40 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 shadow-sm shadow-zinc-200/5',
      uncommon: 'bg-blue-50 border-blue-200 dark:bg-blue-500/5 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/5',
      rare: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/5 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/5',
      epic: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-500/5 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-xl shadow-indigo-500/10',
      legendary: 'bg-orange-50 border-orange-200 dark:bg-orange-500/5 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 shadow-2xl shadow-orange-500/15'
    };

    const activeMilestones = allMilestones
      .filter(m => m.condition)
      .sort((a, b) => {
        const order = { legendary: 4, epic: 3, rare: 2, uncommon: 1, common: 0 };
        return order[b.rarity as keyof typeof order] - order[a.rarity as keyof typeof order];
      })
      .slice(0, 4);

    const getMilestoneIcon = (icon: string) => {
      const getIconColor = (type: string) => {
        switch(type) {
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
          case 'sword': return 'text-slate-500';
          case 'perfect': return 'text-emerald-500';
          case 'fire': return 'text-orange-600';
          case 'crown': return 'text-amber-500';
          case 'shield': return 'text-blue-600';
          case 'throne': return 'text-amber-600';
          default: return 'text-current';
        }
      };

      const props = {
        viewBox: "0 0 24 24",
        width: "24",
        height: "24",
        fill: "none", 
        stroke: "currentColor",
        strokeWidth: "2.5",
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
        className: `w-7 h-7 transition-all duration-300 group-hover:scale-110 ${getIconColor(icon)}`
      };

      switch(icon) {
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
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
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
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
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
            <path d="m5 16 3 3" />
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
      <div className="font-sans text-slate-900 dark:text-white selection:bg-orange-500/30 transition-all duration-300" ref={resultRef} id="quiz-result">
        <div className="max-w-4xl mx-auto py-12 px-6 space-y-12 animate-fade-in">
          
          {/* Centered Results Header */}
          <div className="text-center space-y-6">
            <div className="relative inline-block">
               <div className="absolute inset-0 bg-orange-600/10 blur-[40px] rounded-full animate-pulse" />
               <div className="relative w-14 h-14 mx-auto bg-transparent flex items-center justify-center shadow-lg">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-10 h-10 text-orange-600">
                   <path d="M6 9l6 6 6-6" className="transform rotate-180 origin-center" /><path d="M12 15V3" className="transform rotate-180 origin-center" /><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" className="transform rotate-180 origin-center" />
                 </svg>
                 <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
                   <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 text-white"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                 </div>
               </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                <span className="text-orange-600">{percentage}%</span> <span className="text-zinc-300">/</span> <span className="text-slate-900 dark:text-white">
                  {percentage >= 90 ? 'Outstanding!' : percentage >= 80 ? 'Great job!' : percentage >= 60 ? 'Good Effort!' : 'Keep Pushing!'}
                </span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm max-w-xl mx-auto leading-relaxed">
                {percentage >= 80 
                  ? `You've outperformed ${Math.min(99, 70 + Math.floor(percentage / 4))}% of users in ${selectedSubject?.name}. Mastery achieved.`
                  : `Steady progress in ${selectedSubject?.name}. Review the detailed breakdown below to polish your skills.`}
              </p>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center group hover:scale-[1.05] transition-all duration-300">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider mb-1">Correct</span>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{score}/{totalAuto}</p>
            </div>

            <div className="flex flex-col items-center text-center group hover:scale-[1.05] transition-all duration-300">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-600 mb-3 group-hover:bg-red-500 group-hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider mb-1">Incorrect</span>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalAuto - score}</p>
            </div>

            <div className="flex flex-col items-center text-center group hover:scale-[1.05] transition-all duration-300">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 mb-3 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider mb-1">Avg Speed</span>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{Math.round(avgTimePerQuestion)}s <span className="text-[10px] text-zinc-400">/ Q</span></p>
            </div>

            <div className="flex flex-col items-center text-center group hover:scale-[1.05] transition-all duration-300">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600 mb-3 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider mb-1">Time Taken</span>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatTime(totalTimeTaken)}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col items-center gap-6">
            <button 
              onClick={() => document.getElementById('question-review-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full max-w-lg py-5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-base shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <span>Review Results</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>

            <div className="flex gap-4 w-full max-w-lg">
              <button 
                onClick={handleGenerate}
                className="flex-1 py-4 bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl font-bold text-xs text-slate-600 dark:text-zinc-400 transition-all flex items-center justify-center gap-2 group border-none"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-orange-600 transition-colors"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                Retake Quiz
              </button>
              <button 
                onClick={handleBackToDashboard}
                className="flex-1 py-4 bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl font-bold text-xs text-slate-600 dark:text-zinc-400 transition-all flex items-center justify-center gap-2 group border-none"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-orange-600 transition-colors"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /></svg>
                Dashboard
              </button>
            </div>
          </div>

          {/* Achievements / Milestones */}
          {activeMilestones.length > 0 && (
            <div className="pt-8">
              <div className="flex items-center mb-6">
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider transition-all duration-500 opacity-60">Achievements Unlocked</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                {activeMilestones.map((m, idx) => (
                  <div 
                    key={idx}
                    className="flex flex-col items-center text-center gap-3 transition-all duration-300 hover:scale-105 group relative"
                  >
                    {/* Background Glow for High Rarity */}
                    {(m.rarity === 'epic' || m.rarity === 'legendary') && (
                      <div className={`absolute -inset-2 opacity-0 group-hover:opacity-10 blur-xl rounded-full transition-opacity duration-500 ${
                        m.rarity === 'legendary' ? 'bg-orange-500' : 'bg-indigo-500'
                      }`} />
                    )}
                    
                    <div className="relative p-1 transition-transform duration-500 group-hover:-translate-y-1">
                      {getMilestoneIcon(m.icon || '')}
                    </div>
                    
                    <div className="relative space-y-0.5">
                      <p className="text-[12px] font-bold tracking-tight leading-none text-slate-800 dark:text-zinc-300">{m.label}</p>
                      <p className={`text-[8px] font-bold tracking-wider ${
                        m.rarity === 'legendary' ? 'text-orange-500' :
                        m.rarity === 'epic' ? 'text-indigo-500' :
                        m.rarity === 'rare' ? 'text-emerald-500' :
                        m.rarity === 'uncommon' ? 'text-blue-500' :
                        'text-zinc-500'
                      }`}>{m.rarity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>


        {/* Question Review Section (ID for scrolling) */}
        <div id="question-review-section" className="max-w-4xl mx-auto py-16 px-6 space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Question Review</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Evaluation of your performance per question</p>
            </div>
            <div className="px-3 py-1.5 bg-slate-100 dark:bg-dark-800/50 rounded-lg border border-slate-200 dark:border-dark-800/50 inline-flex items-center gap-2">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider">{quizQuestions.length} Items Total</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
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
              
              const statusColorOptions = isSubjective 
                ? 'bg-orange-50/50 border-orange-200 dark:bg-orange-500/5 dark:border-orange-500/20 text-orange-600 dark:text-orange-400' 
                : isCorrect 
                  ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-500/5 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-red-50/50 border-red-200 dark:bg-red-500/5 dark:border-red-500/20 text-red-600 dark:text-red-400';
              
              const badgeColors = isSubjective 
                ? 'bg-orange-100/50 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200 dark:border-orange-500/30' 
                : isCorrect 
                  ? 'bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' 
                  : 'bg-red-100/50 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30';
              
              const label = isCoding ? (isCorrect ? 'Tests Passed' : 'Tests Failed') : (isSubjective ? 'Subjective' : (isCorrect ? 'Correct' : 'Incorrect'));

              return (
                <div key={i} className={`p-5 md:p-6 rounded-[24px] border shadow-sm transition-all ${statusColorOptions}`}>
                  <div className="flex flex-col space-y-4">
                    
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-semibold tracking-wider border ${badgeColors}`}>
                        {label}
                      </span>
                      {isStruggle && (
                        <span className="px-2 py-0.5 bg-rose-500 text-white rounded-md text-[9px] font-bold tracking-wider animate-pulse shadow-sm border-none shadow-rose-500/20">
                          Struggle Area
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-white/50 dark:bg-white/5 rounded-md text-[9px] font-semibold text-slate-500 border border-slate-200/50 dark:border-white/10 tracking-wider flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5 opacity-60"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        {timeSpent}s
                      </span>
                      <span className="px-2 py-0.5 bg-white/50 dark:bg-white/5 rounded-md text-[9px] font-semibold text-slate-500 border border-slate-200/50 dark:border-white/10 tracking-wider">
                        Unit 0{q.unit}
                      </span>
                      {q.difficulty && (
                        <span className="px-2 py-0.5 bg-white/50 dark:bg-white/5 rounded-md text-[9px] font-semibold text-slate-500 border border-slate-200/50 dark:border-white/10 tracking-wider">
                          {q.difficulty}
                        </span>
                      )}
                      {q.questionType && (
                        <span className="px-2 py-0.5 bg-zinc-100/50 dark:bg-white/10 rounded-md text-[9px] font-semibold text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-white/10 tracking-wider">
                          {q.questionType}
                        </span>
                      )}
                      
                      <button
                        onClick={() => toggleBookmark(q.id || '')}
                        className={`ml-auto p-1 transition-all active:scale-90 ${
                          bookmarkedIds.has(q.id || '')
                            ? 'text-blue-500'
                            : 'text-slate-300 dark:text-slate-600 hover:text-blue-400'
                        }`}
                        title={bookmarkedIds.has(q.id || '') ? 'Remove Bookmark' : 'Bookmark Question'}
                      >
                        <svg viewBox="0 0 24 24" fill={bookmarkedIds.has(q.id || '') ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Question Text */}
                    <h4 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                      {parseText(q.question)}
                    </h4>

                    {/* Options/Answers Row */}
                    {isCoding ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-white/60 dark:bg-black/20 rounded-2xl border border-white/50 dark:border-white/5">
                          <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-1.5 tracking-wider text-[10px]">Submitted Code</span>
                          <pre className="font-mono text-xs bg-slate-900/50 p-4 rounded-xl overflow-auto dark:text-slate-300">
                            {ansObj?.code || '# No code submitted'}
                          </pre>
                        </div>
                        
                        {ansObj?.results && ansObj.results.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-1 tracking-wider text-[10px]">Test Results</span>
                            <div className="grid grid-cols-1 gap-2">
                              {ansObj.results.map((res: any, idx: number) => (
                                <div key={idx} className={`p-3 rounded-xl border text-[11px] flex items-center justify-between ${res.passed ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/5 border-red-500/10 text-red-600 dark:text-red-400'}`}>
                                  <div className="flex items-center gap-3">
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${res.passed ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                      {res.passed ? '✓' : '✗'}
                                    </span>
                                    <span className="font-mono">Case {idx + 1}</span>
                                  </div>
                                  <div className="text-[10px] opacity-70 italic truncate flex gap-4 ml-4">
                                    {res.isHidden ? (
                                      <span className="text-slate-500">[Hidden Test Case]</span>
                                    ) : (
                                      <>
                                        <span className="text-slate-500">Exp: {(res.output || res.out || "").trim()}</span>
                                        <span className={res.passed ? "text-emerald-500" : "text-red-500"}>Got: {res.actual || 'None'}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className={`p-4 rounded-2xl border text-xs font-semibold tracking-wider flex items-center gap-2 ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                          {isCorrect ? (
                            <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M20 6L9 17l-5-5"/></svg> All validation tests passed</>
                          ) : (
                            <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12"/></svg> Some tests failed</>
                          )}
                        </div>
                      </div>
                    ) : !isSubjective ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="p-4 bg-white/60 dark:bg-black/20 rounded-2xl border border-white/50 dark:border-white/5 text-slate-800 dark:text-slate-200">
                          <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-1.5 tracking-wider text-[10px] flex items-center gap-1">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M20 6L9 17l-5-5" /></svg>
                            Your Answer
                          </span>
                          <span className={`font-semibold text-sm ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {userAnswers[i] !== undefined ? parseText(q.options?.[userAnswers[i]]) : 'Skipped'}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 text-slate-800 dark:text-slate-200">
                            <span className="text-emerald-600/70 dark:text-emerald-400/70 font-semibold block mb-1.5 tracking-wider text-[10px] flex items-center gap-1">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                              Correct Solution
                            </span>
                            <span className="font-semibold text-sm text-emerald-700 dark:text-emerald-400">
                              {parseText(q.options?.[q.correctAnswer ?? 0])}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-white/60 dark:bg-black/20 rounded-2xl border border-white/50 dark:border-white/5 mt-2">
                        <span className="text-orange-500/70 dark:text-orange-400/70 font-semibold block mb-1.5 tracking-wider text-[10px] flex items-center gap-1">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                          Feedback
                        </span>
                        <span className="font-semibold text-sm text-orange-700 dark:text-orange-400">
                          Self-evaluated model answer check.
                        </span>
                      </div>
                    )}

                    {/* Explanation Box */}
                    <div className="mt-4 p-5 md:p-6 bg-white dark:bg-white/[0.02] rounded-2xl border border-zinc-100 dark:border-white/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                      <div className="flex items-center gap-2 mb-3">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-400"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                        <span className="text-[11px] font-semibold text-slate-500 tracking-wider">Explanation</span>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                        {parseText(q.explanation)}
                      </div>
                    </div>

                  </div>
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
      

    </>
  );

  // ═══════════ Dashboard View ═══════════
  if (!showCustomQuizBuilder && quizQuestions.length === 0 && !quizCompleted && !reviewMode && dashboardView === 'dashboard') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20 px-4 md:px-0">
        {globalOverlays}

        {/* Header */}
        <header className="text-center space-y-3 pt-2">
          <h2 className="text-2xl md:text-4xl font-semibold text-slate-900 dark:text-white tracking-tighter leading-none">Quiz <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Taker</span></h2>
          <p className="text-slate-500 font-medium text-xs">Your personal assessment dashboard</p>
        </header>

        {error && (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[32px] text-center space-y-3 animate-fade-in">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            </div>
            <h4 className="text-xs font-medium text-red-500 tracking-widest">Protocol Interrupted</h4>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{error}</p>
            <button onClick={() => setError(null)} className="text-[9px] font-medium text-slate-400 hover:text-orange-500 transition-colors">Dismiss</button>
          </div>
        )}


        {/* Quick Start Bar */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-semibold text-slate-400 tracking-wider px-1">Quick Start</h3>
          <QuickStartBar
            onCustomQuiz={() => setShowCustomQuizBuilder(true)}
            onMyHistory={() => setDashboardView('history')}
          />
        </div>

        {/* XP & Streak Stats Refined Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_0.6fr] gap-4 mb-4">
          {/* XP & Level Card - Clickable Progress Modal Trigger */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02, cursor: 'pointer' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowProgressModal(true)}
            className="bg-white dark:bg-white/[0.03] p-6 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all flex flex-col gap-4"
          >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-40 transition-opacity">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            </div>

            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-orange-600/90 uppercase tracking-widest leading-none">Level {level.level}</p>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{level.title}</h3>
              </div>
              <div className="w-14 h-14 rounded-[18px] bg-orange-500/5 dark:bg-orange-500/10 flex items-center justify-center text-2xl">
                {level.icon || '🌱'}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total XP</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-orange-600 tabular-nums leading-none">
                    {totalXP}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">XP</span>
                </div>
              </div>

              {/* High Contrast Progress Line */}
              <div className="space-y-2">
                <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${level.progress}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    viewport={{ once: true }}
                    className="h-full bg-orange-600 rounded-full"
                  />
                </div>
                {level.nextLevel && (
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    Need <span className="font-bold text-slate-700 dark:text-slate-200">{level.nextLevel!.minXP - totalXP} more</span> to reach {level.nextLevel!.title}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Streak Card - Narrower & Shorter */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-white/[0.03] p-5 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden flex flex-col items-center justify-between transition-all"
          >
            <div className="flex flex-col items-center w-full">
              <div className="flex items-center justify-center gap-3 mb-1">
                <motion.span 
                  animate={{ scale: [1, 1.1, 1] }} 
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="text-3xl"
                >
                  🔥
                </motion.span>
                <h4 className="text-6xl font-black text-slate-900 dark:text-white tabular-nums leading-none">
                  {currentStreak}
                </h4>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Day Streak</p>
              
              <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 mb-4">
                <p className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest leading-none">Best: {longestStreak}</p>
              </div>
            </div>

            <div className="w-full">
              <div className="flex justify-between items-center px-0.5">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, i) => {
                  const day = streakCalendar.slice(-7)[i];
                  const isCompleted = day?.completed;
                  return (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1">
                      <span className={`text-[8px] font-bold ${isCompleted ? 'text-orange-600' : 'text-slate-400'}`}>{label}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted ? 'bg-orange-600 border-orange-600 shadow-lg shadow-orange-600/20' : 'border-slate-100 dark:border-white/5'}`}>
                        {isCompleted && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" className="w-3 h-3">
                            <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ═══════════ Progress Timeline Modal ═══════════ */}
        {typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            {showProgressModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="modal-overlay"
                style={{ backdropFilter: 'blur(24px) saturate(180%)', zIndex: 60 }}
                onClick={() => setShowProgressModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 30 }}
                  className="w-[95vw] max-w-6xl bg-white/90 dark:bg-dark-950/90 rounded-[48px] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close button */}
                  <button 
                    onClick={() => setShowProgressModal(false)}
                    className="absolute top-4 right-4 p-2.5 rounded-2xl bg-white/50 dark:bg-black/50 hover:bg-slate-100 dark:hover:bg-white/10 backdrop-blur-sm transition-all z-50 group border border-slate-200 dark:border-white/10"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-slate-400 group-hover:text-orange-500 group-hover:rotate-90 transition-all duration-300">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="p-6 md:p-10 overflow-y-auto max-h-[90vh] custom-scrollbar">
                    {/* Header & Rank Row */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-slate-100 dark:border-white/5 pb-8 relative pr-16">
                      <div className="text-left space-y-1">
                        <h2 className="text-3xl md:text-4xl font-black flex items-center gap-3">
                          <span className="text-slate-800 dark:text-white uppercase tracking-tighter">Nexus</span>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400 uppercase tracking-tighter">Journey</span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-lg leading-relaxed">
                          Track your academic progress, level up, and unlock exclusive rewards.
                        </p>
                      </div>

                      <div className="p-3 md:p-4 rounded-[24px] bg-gradient-to-br from-orange-500/[0.08] to-orange-600/[0.08] border border-orange-500/15 backdrop-blur-md relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-20 transform translate-x-1 translate-y--1 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12 text-orange-500"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
                        </div>
                        <div className="flex items-center gap-5 relative z-10">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 to-orange-500 flex items-center justify-center text-xl shadow-lg shadow-orange-600/20">
                            🏆
                          </div>
                          <div className="text-left">
                            <p className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-0.5 whitespace-nowrap">Account Rank</p>
                            <div className="flex items-baseline gap-1.5 leading-none">
                              <span className="text-xl font-black text-slate-800 dark:text-white">{userQuizProfile.total_xp}</span>
                              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">Total XP</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Items Container */}
                    <div className="md:overflow-x-auto md:snap-x md:snap-mandatory pb-6 pt-2 scrollbar-hide">
                      <div className="flex flex-col md:flex-row gap-4 pb-4 pt-4 px-4 md:px-0">
                        {LEVEL_THRESHOLDS.map((tier, index) => {
                          const nextTier = LEVEL_THRESHOLDS[index + 1];
                          const isRewardUnlocked = userQuizProfile.total_xp >= tier.minXP;
                          const isCurrent = level.level === tier.level;
                          const isCollected = (userQuizProfile.unlocked_frames || []).includes(tier.rewardFrame!);
                          const frameConfig = tier.rewardFrame ? getFrameConfig(tier.rewardFrame) : null;
                          
                          // Calculate exact progress to next level for the connector
                          const connectorProgress = nextTier 
                            ? Math.max(0, Math.min(1, (userQuizProfile.total_xp - tier.minXP) / (nextTier.minXP - tier.minXP)))
                            : (userQuizProfile.total_xp >= tier.minXP ? 1 : 0);

                          return (
                            <motion.div
                              key={tier.level}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex-shrink-0 w-full md:w-[260px] relative pb-6 snap-center group/card"
                            >
                              {/* Connector - Improved with exact progress */}
                              {index < LEVEL_THRESHOLDS.length - 1 && (
                                <div className="absolute left-1/2 md:left-auto md:top-[38px] md:right-[-32px] w-2 md:w-[64px] h-[40px] md:h-[4px] z-0 bottom-[-20px] md:bottom-auto translate-x-[-50%] md:translate-x-0 overflow-hidden bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200/50 dark:border-white/5 shadow-inner">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${connectorProgress * 100}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-orange-600 to-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                                  />
                                </div>
                              )}

                              <div className={`relative z-10 p-5 rounded-[32px] border transition-all duration-500 overflow-hidden ${
                                isCurrent 
                                  ? 'bg-gradient-to-br from-white to-orange-50/30 dark:from-dark-900 dark:to-orange-500/5 border-orange-500/30 shadow-2xl shadow-orange-500/10 scale-105' 
                                  : isRewardUnlocked
                                    ? 'bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-orange-500/20'
                                    : 'bg-slate-50/50 dark:bg-white/[0.02] border-slate-200/50 dark:border-white/5 opacity-80'
                              }`}>
                                {/* Active Glow for Current Level */}
                                {isCurrent && (
                                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-orange-500/10 blur-3xl animate-pulse" />
                                )}

                                <div className="space-y-5">
                                  {/* Level Badge Header */}
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black transition-all duration-500 ${
                                        isRewardUnlocked 
                                          ? 'bg-gradient-to-br from-orange-600 to-orange-500 text-white shadow-xl shadow-orange-600/30 ring-4 ring-orange-500/10 rotate-3 group-hover/card:rotate-0' 
                                          : 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-slate-600 border border-slate-300 dark:border-white/10'
                                      }`}>
                                        {tier.level}
                                      </div>
                                      <div>
                                        <h4 className={`text-base font-black uppercase tracking-tight leading-none mb-1 flex items-center gap-2 ${
                                          isRewardUnlocked ? 'text-slate-800 dark:text-white' : 'text-slate-400'
                                        }`}>
                                          {tier.title} <span className="text-lg">{tier.icon}</span>
                                        </h4>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                          {tier.minXP}{tier.maxXP === Infinity ? '+' : ` - ${tier.maxXP}`} XP
                                        </p>
                                      </div>
                                    </div>
                                    {isCurrent && (
                                      <div className="px-2 py-0.5 bg-orange-500 text-white text-[8px] font-black uppercase tracking-[0.1em] rounded-md shadow-lg shadow-orange-500/30 animate-bounce">
                                        Active
                                      </div>
                                    )}
                                  </div>

                                  {/* Collectible Section - Integrated */}
                                  <div className={`p-4 rounded-2xl border transition-all duration-500 ${
                                    isRewardUnlocked 
                                      ? 'bg-slate-50 dark:bg-black/20 border-slate-100 dark:border-white/5' 
                                      : 'bg-transparent border-dashed border-slate-200 dark:border-white/10'
                                  }`}>
                                    <div className="flex items-center gap-4">
                                      {tier.rewardFrame ? (
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
                                      ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center py-4 text-center">
                                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">No Reward</div>
                                          <div className="text-[8px] text-slate-500">Keep climbing!</div>
                                        </div>
                                      )}
                                      
                                      {tier.rewardFrame && (
                                        <div className="flex-1 space-y-1">
                                          <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Collectible</p>
                                          <p className={`text-[10px] font-bold ${isRewardUnlocked ? 'text-slate-700 dark:text-white' : 'text-slate-400'}`}>
                                            {tier.rarity} Frame
                                          </p>
                                          <div className={`text-[8px] leading-tight ${isRewardUnlocked ? 'text-slate-500' : 'text-slate-400/60'}`}>
                                            {isRewardUnlocked 
                                              ? 'Unlocked and ready for your profile.' 
                                              : `Reach ${tier.title} to unlock this frame.`}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.getElementById('modal-root') || document.body
        )}







        {/* Featured Quiz of the Day */}
        {featuredQuiz && (
          <div className="space-y-3">
            <h3 className="text-[10px] font-semibold text-slate-400 tracking-wider px-1">Today's Featured</h3>
            <FeaturedQuizCard
              quiz={featuredQuiz}
              isCompleted={featuredCompleted}
              completedScore={featuredScore}
              onStart={handleStartFeaturedQuiz}
            />
          </div>
        )}

        {/* Active Challenges */}
        {activeChallenges.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-[10px] font-semibold text-slate-400 tracking-wider px-1">Active Challenges</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeChallenges.map((challenge, i) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  isCompleted={completedChallengeIds.has(challenge.id)}
                  userLevel={level.level}
                  onStart={() => handleStartChallenge(challenge)}
                  index={i}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══════════ History View ═══════════
  if (dashboardView === 'history' && quizQuestions.length === 0 && !quizCompleted && !reviewMode) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20 px-4 md:px-0">
        {globalOverlays}
        
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 pt-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setDashboardView('dashboard')}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-orange-500/10 text-slate-400 hover:text-orange-500 transition-colors border border-slate-200 dark:border-white/10"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </motion.button>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Quiz <span className="text-orange-500">history</span></h2>
            <p className="text-slate-500 font-medium text-[11px] uppercase tracking-widest">Review your past performance</p>
          </div>
        </div>

        <div className="glass-panel p-6 md:p-10 rounded-[40px] shadow-xl">
          <HistorySection />
        </div>
      </div>
    );
  }

  // ═══════════ Original Quiz Builder / Selection View ═══════════
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20 px-4 md:px-0">
      {globalOverlays}

      <header className="text-center space-y-2 py-4">
        <div className="flex items-center justify-center gap-4">
          {showCustomQuizBuilder && quizQuestions.length === 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCustomQuizBuilder(false)}
              className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-orange-500/10 text-slate-400 hover:text-orange-500 transition-colors border border-slate-200 dark:border-white/10"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            </motion.button>
          )}
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Quiz <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">taker</span></h2>
            <p className="text-slate-500 font-semibold text-[11px] tracking-wider mt-1 opacity-60">Comprehensive Assessment</p>
          </div>
        </div>
      </header>

      {error && (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[32px] text-center space-y-3 animate-fade-in shadow-xl shadow-red-500/5">
          <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          </div>
          <h4 className="text-xs font-semibold text-red-500 tracking-wide">Attempt failed</h4>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{error}</p>
          <button onClick={() => setError(null)} className="text-[10px] font-semibold text-slate-400 hover:text-orange-500 transition-colors tracking-wide">Dismiss</button>
        </div>
      )}

      <div className="glass-panel p-8 md:p-12 rounded-[48px] shadow-2xl border border-white/5 space-y-12 relative overflow-hidden">
        {/* Background Decorative Blurs */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10 ${!selectedSubject ? 'pt-4' : ''}`}>

          {/* Step 1: Subject Selection */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-lg transition-all duration-500 ${selectedSubject ? 'bg-emerald-500 text-white rotate-[360deg]' : 'bg-gradient-to-br from-orange-500 to-red-600 text-white'}`}>
                {selectedSubject ? '✓' : '1'}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-900 dark:text-white">Select subject</label>
                <p className="text-[10px] text-slate-500 font-medium opacity-60">Step 1: Choose Subject</p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto no-scrollbar pr-2 py-2">
              {subjectsWithSyllabi.map((s, i) => (
                <motion.button
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { handleSubjectChange(s); setSelectedUnits([]); }}
                  className={`relative p-5 rounded-[24px] border text-left transition-all group overflow-hidden ${
                    selectedSubject?.id === s.id 
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 border-transparent text-white shadow-xl shadow-orange-500/20' 
                      : 'bg-white/50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-orange-500/30 hover:bg-white dark:hover:bg-white/[0.04]'
                    }`}
                >
                  <div className="flex items-center justify-between pointer-events-none">
                    <p className={`text-sm font-normal ${selectedSubject?.id === s.id ? 'text-white' : 'text-slate-900 dark:text-white group-hover:text-orange-500'}`}>{s.name}</p>
                    {selectedSubject?.id === s.id && (
                      <motion.div layoutId="selection-active" className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]" />
                    )}
                  </div>
                  {/* Subtle inner glow for selected */}
                  {selectedSubject?.id === s.id && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                  )}
                </motion.button>
              ))}
              
              {subjectsWithSyllabi.length === 0 && !initializing && (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3A2.5 2.5 0 0 1 6.5 0.5H20" /></svg>
                  </div>
                  <p className="text-[10px] font-semibold text-slate-500 tracking-widest opacity-40">Library is empty</p>
                  <p className="text-xs text-slate-400 max-w-[200px] mx-auto leading-relaxed">Connect a subject syllabus to the repository to initialize testing modules.</p>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Unit Selection */}
          <div className={`space-y-8 transition-all duration-700 ${!selectedSubject ? 'opacity-20 grayscale pointer-events-none scale-95 blur-[2px]' : 'opacity-100'}`}>
            <motion.div 
              animate={selectedSubject ? { opacity: 1, x: 0 } : { opacity: 0.5, x: -10 }}
              className="flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-semibold text-sm shadow-lg transition-all duration-500 ${selectedUnits.length > 0 && selectedDifficulties.length > 0 ? 'bg-emerald-500 text-white rotate-[360deg]' : 'bg-gradient-to-br from-orange-500 to-red-600 text-white'}`}>
                {selectedUnits.length > 0 && selectedDifficulties.length > 0 ? '✓' : '2'}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">Configure scope</label>
                <p className="text-[10px] text-slate-500 font-semibold tracking-wide opacity-60">Step 2: Subject Scope</p>
              </div>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((u, i) => {
                const isAvailable = availableUnitsForSubject.includes(u);
                const isSelected = selectedUnits.includes(u);
                return (
                  <motion.button
                    key={u}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    disabled={!isAvailable}
                    onClick={() => toggleUnit(u)}
                    whileHover={isAvailable ? { scale: 1.05, y: -2 } : {}}
                    whileTap={isAvailable ? { scale: 0.95 } : {}}
                    className={`relative p-8 rounded-[28px] border transition-all flex flex-col items-center justify-center group ${!isAvailable ? 'bg-slate-100/50 dark:bg-dark-950/20 border-slate-200 dark:border-white/5 opacity-40 grayscale cursor-not-allowed' :
                      isSelected ? 'bg-orange-500/10 border-orange-500 shadow-xl shadow-orange-500/5' :
                        'bg-white/50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-orange-500/30'
                      }`}
                  >
                    {selectedSubject && !isAvailable && (
                      <span className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-full group-hover:translate-y-4 opacity-0 group-hover:opacity-100 transition-all px-2 py-1 rounded-full bg-slate-800 text-white text-[8px] font-bold uppercase tracking-tighter whitespace-nowrap z-20">
                        Locked unit
                      </span>
                    )}
                    
                    <span className={`text-3xl font-semibold tracking-tighter mb-1 transition-all duration-300 ${isSelected ? 'text-orange-500 scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]' : 'text-slate-200 dark:text-slate-800 group-hover:text-slate-300 dark:group-hover:text-slate-700'}`}>
                      0{u}
                    </span>
                    <span className={`text-[10px] font-semibold tracking-wider transition-colors ${isSelected ? 'text-orange-600' : 'text-slate-400 dark:text-slate-500'}`}>
                      Unit {u}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <div className="pt-2">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'easy', num: 'L1', label: 'Easy', color: 'emerald' },
                  { id: 'medium', num: 'L2', label: 'Medium', color: 'amber' },
                  { id: 'hard', num: 'L3', label: 'Hard', color: 'red' }
                ].map((lvl, i) => {
                  const isSelected = selectedDifficulties.includes(lvl.id);
                  const colorMap = {
                    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/50', text: 'text-emerald-500', hover: 'hover:border-emerald-500/30' },
                    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/50', text: 'text-amber-500', hover: 'hover:border-amber-500/30' },
                    red: { bg: 'bg-red-500/10', border: 'border-red-500/50', text: 'text-red-500', hover: 'hover:border-red-500/30' }
                  }[lvl.color];

                  return (
                    <motion.button
                      key={lvl.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedDifficulties(prev => prev.includes(lvl.id) ? prev.filter(d => d !== lvl.id) : [...prev, lvl.id])}
                      className={`relative p-5 rounded-[24px] border transition-all flex flex-col items-center justify-center group overflow-hidden ${
                        isSelected ? `${colorMap.bg} ${colorMap.border} shadow-lg shadow-black/5` :
                        `bg-white/50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 ${colorMap.hover}`
                      }`}
                    >
                      <span className={`text-xl font-semibold tracking-tight transition-all duration-300 ${isSelected ? colorMap.text : 'text-slate-400 dark:text-slate-700'}`}>{lvl.num}</span>
                      <span className={`text-[10px] font-semibold tracking-wide mt-1 transition-colors ${isSelected ? colorMap.text : 'text-slate-500/60'}`}>{lvl.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 3: Customization - Progressive Disclosure */}
          <div className="md:col-span-2">
            {selectedUnits.length > 0 && selectedDifficulties.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-10 border-t border-slate-100 dark:border-white/5 space-y-12"
              >
                <div className="space-y-10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg">3</div>
                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">Final configuration</label>
                      <p className="text-[10px] text-slate-500 font-semibold tracking-wide opacity-60">Step 3: Final Configuration</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {hasMCQs && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between ml-1">
                          <p className="text-[10px] font-semibold text-slate-500 tracking-wider">MCQ assessment</p>
                          <button 
                            onClick={() => {
                              const count = subjectQuestions.filter(q => q.type === 'mcq' && selectedUnits.includes(q.unit)).length;
                              setNumMCQ(count || 100);
                            }}
                            className="text-[9px] font-bold text-orange-500 hover:text-orange-600 uppercase tracking-tighter"
                          >
                            Set Max
                          </button>
                        </div>
                        <div className="relative group">
                          <input
                            type="number" min="0" max="500" value={numMCQ}
                            onChange={(e) => setNumMCQ(parseInt(e.target.value) || 0)}
                            className="w-full px-5 py-4 bg-white/50 dark:bg-dark-900/50 border border-slate-200 dark:border-white/5 rounded-[24px] text-sm font-semibold text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
                          />
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 tracking-wider pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">qty</div>
                        </div>
                      </div>
                    )}

                    {hasSubjective && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-semibold text-slate-500 tracking-wider ml-1">Subjective questions</p>
                        <div className="relative group">
                          <input
                            type="number" min="0" max="500" value={numSubjective}
                            onChange={(e) => setNumSubjective(parseInt(e.target.value) || 0)}
                            className="w-full px-5 py-4 bg-white/50 dark:bg-dark-900/50 border border-slate-200 dark:border-white/5 rounded-[24px] text-sm font-semibold text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
                          />
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 tracking-wider pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">qty</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <p className="text-[10px] font-semibold text-slate-500 tracking-wider ml-1">Time limit</p>
                      <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-orange-500 transition-colors">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                        </div>
                        <input
                          type="number" min="1" max="180" value={timerMinutes}
                          onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 0)}
                          className="w-full pl-12 pr-5 py-4 bg-white/50 dark:bg-dark-900/50 border border-slate-200 dark:border-white/5 rounded-[24px] text-sm font-semibold text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 tracking-wider pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">min</div>
                      </div>
                    </div>

                    {hasCoding && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-semibold text-slate-500 tracking-wider ml-1">Coding logic</p>
                        <div className="relative group">
                          <input
                            type="number" min="0" max="50" value={numCoding}
                            onChange={(e) => setNumCoding(parseInt(e.target.value) || 0)}
                            disabled={selectedSubject?.name.includes('CSE101')}
                            className={`w-full px-5 py-4 bg-white/50 dark:bg-dark-900/50 border border-slate-200 dark:border-white/5 rounded-[24px] text-sm font-semibold text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm ${selectedSubject?.name.includes('CSE101') ? 'opacity-30 cursor-not-allowed' : ''}`}
                          />
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 tracking-wider pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">qty</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Move Topics to Step 3 below inputs */}
                  {selectedUnits.length > 0 && Object.keys(availableTopicsByUnit).length > 0 && (
                    <div className="space-y-4 pt-2">
                      <button 
                        onClick={() => setShowTopics(!showTopics)}
                        className="flex items-center justify-between w-full px-5 py-4 rounded-[24px] bg-slate-50 dark:bg-white/5 hover:bg-orange-500/5 transition-all group border border-slate-100 dark:border-white/5"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-2xl transition-colors ${showTopics ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-orange-500/10 text-orange-500'}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M4 6h16M4 12h16m-7 6h7" /></svg>
                          </div>
                          <div className="text-left">
                            <span className="block text-sm font-semibold tracking-tight text-slate-900 dark:text-white">Refine by topics</span>
                            <span className="block text-[11px] text-slate-500 font-semibold tracking-wide opacity-60">Fine-tune assessment focus</span>
                          </div>
                        </div>
                        <motion.div animate={{ rotate: showTopics ? 180 : 0 }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5 text-slate-400"><path d="M19 9l-7 7-7-7" /></svg>
                        </motion.div>
                      </button>

                      {showTopics && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="grid grid-cols-2 md:grid-cols-4 gap-2 px-1"
                        >
                          <button
                            onClick={() => setSelectedTopics([])}
                            className={`px-4 py-3 rounded-2xl text-[10px] font-semibold tracking-wider text-center transition-all border ${
                              selectedTopics.length === 0 
                                ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' 
                                : 'bg-white/50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-500 hover:border-orange-500/30'
                            }`}
                          >
                            All topics
                          </button>

                          {selectedUnits.flatMap(u => availableTopicsByUnit[u] || []).map((topic, idx) => {
                            const isSelected = selectedTopics.includes(topic);
                            return (
                              <button
                                key={`${topic}-${idx}`}
                                onClick={() => setSelectedTopics(prev => isSelected ? prev.filter(t => t !== topic) : [...prev, topic])}
                                className={`px-4 py-3 rounded-2xl text-[10px] font-semibold text-center transition-all border ${
                                  isSelected 
                                    ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' 
                                    : 'bg-white/50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-500 hover:border-orange-500/30'
                                }`}
                              >
                                {topic}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setNegativeMarking(!negativeMarking)}
                      className={`relative p-5 rounded-[28px] border transition-all flex items-center justify-between group overflow-hidden ${negativeMarking ? 'bg-red-500/5 border-red-500/30' : 'bg-white/50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-red-500/20'}`}
                    >
                      <div className="flex items-center gap-4 z-10">
                        <div className={`p-3 rounded-2xl transition-colors ${negativeMarking ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-slate-100 dark:bg-dark-800 text-slate-500'}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="w-4 h-4"><path d="M18 6 6 18M6 6l12 12" /></svg>
                        </div>
                        <div className="text-left">
                          <p className={`text-sm font-semibold tracking-tight ${negativeMarking ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>Negative Marking</p>
                          <p className="text-[10px] text-slate-500 font-semibold tracking-wider opacity-60">Strict mode enabled</p>
                        </div>
                      </div>
                      <div className={`w-12 h-6 rounded-full relative transition-colors z-10 ${negativeMarking ? 'bg-red-500' : 'bg-slate-200 dark:bg-dark-800'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${negativeMarking ? 'right-1 bg-white' : 'left-1 bg-slate-400 dark:bg-slate-600'}`} />
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIncludeSolved(!includeSolved)}
                      className={`relative p-5 rounded-[28px] border transition-all flex items-center justify-between group overflow-hidden ${includeSolved ? 'bg-orange-500/5 border-orange-500/30' : 'bg-white/50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-orange-500/20'}`}
                    >
                      <div className="flex items-center gap-4 z-10">
                        <div className={`p-3 rounded-2xl transition-colors ${includeSolved ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-slate-100 dark:bg-dark-800 text-slate-500'}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
                        </div>
                        <div className="text-left">
                          <p className={`text-sm font-semibold tracking-tight ${includeSolved ? 'text-orange-500' : 'text-slate-900 dark:text-white'}`}>Include Solved</p>
                          <p className="text-[10px] text-slate-500 font-semibold tracking-wider opacity-60">{solvedQuestionIds.size} questions already mastered</p>
                        </div>
                      </div>
                      <div className={`w-12 h-6 rounded-full relative transition-colors z-10 ${includeSolved ? 'bg-orange-500' : 'bg-slate-200 dark:bg-dark-800'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${includeSolved ? 'right-1 bg-white' : 'left-1 bg-slate-400 dark:bg-slate-600'}`} />
                      </div>
                    </motion.button>
                  </div>

                  <div className="pt-8 flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGenerate}
                      className="group relative px-6 py-2.5 rounded-[20px] overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 bg-[length:200%_auto] animate-gradient-x" />
                      <div className="relative flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </div>
                        <span className="text-sm font-semibold text-white drop-shadow-lg">{loading ? 'Processing...' : 'Start Quiz'}</span>
                      </div>
                      {/* Outer Glow */}
                      <div className="absolute inset-0 bg-orange-600/30 blur-3xl group-hover:bg-orange-600/50 transition-all -z-10" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizTaker;
