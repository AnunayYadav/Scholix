import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserProfile, QuizQuestion, LibraryFile } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';
import { generateQuizFromSyllabus } from '../services/geminiService.ts';
import { extractTextFromPdf } from '../services/pdfUtils.ts';
import jsPDF from 'jspdf';
import { showToast } from './Toast.tsx';
import html2canvas from 'html2canvas';

import { SYLLABUS_DATA } from '../data/syllabusData.ts';
import { QUIZTAKER_DATA } from '../data/quiztaker/quizData.ts';


// Static Bank - keeping this for fallback/demo
const PEL130_STATIC_BANK = [
  { unit: 1, question: "Fill in the blank with correct adjective order. I have bought a _________ bag.", options: ["Tiny red Prada", "Red tiny Prada", "Prada red tiny", "Prada tiny red"], answer: "Tiny red Prada" },
  { unit: 1, question: "Fill the blank with correct verb. The usual work of peon _________ to pass fillies in between departments.", options: ["Is", "Are", "Have", "Has"], answer: "Is" },
  // ... (keeping a subset for brevity in this rewrite, or can expand if needed. For now, assuming standard array structure)
];

// Expanded static bank to avoid empty quizzes if API fails
const FALLBACK_QUESTIONS: QuizQuestion[] = [
  { unit: 1, question: "Communication is a non-stop process.", options: ["True", "False", "Maybe", "Depends on context"], correctAnswer: 0, explanation: "Communication is continuous." },
  { unit: 1, question: "Which is not a barrier to communication?", options: ["Noise", "Choice of medium", "Feedback", "Language"], correctAnswer: 2, explanation: "Feedback is a part of the process, not a barrier." },
  // ... add more if needed
];

interface SubjectWithSyllabus {
  id: string;
  name: string;
  syllabusFile: LibraryFile;
}

const QuizTaker: React.FC<{ userProfile: UserProfile | null }> = ({ userProfile }) => {
  const [subjectsWithSyllabi, setSubjectsWithSyllabi] = useState<SubjectWithSyllabus[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectWithSyllabus | null>(null);
  const [selectedUnits, setSelectedUnits] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isShowingExplanation, setIsShowingExplanation] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set());

  // New Quiz Config States
  const [numMCQ, setNumMCQ] = useState(10);
  const [numSubjective, setNumSubjective] = useState(0);
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(60);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);

  const availableUnitsForSubject = useMemo(() => {
    if (!selectedSubject) return [];
    const data = QUIZTAKER_DATA[selectedSubject.name];
    if (!data) return [];
    const units = new Set<number>();
    (data.mcqs || []).forEach(q => units.add(q.unit));
    (data.subjective || []).forEach(q => units.add(q.unit));
    return Array.from(units).sort((a, b) => a - b);
  }, [selectedSubject]);

  const sectionInfo = useMemo(() => {
    let mcqCount = 0;
    let subjCount = 0;
    const mapping = quizQuestions.map(q => {
      if (q.type === 'subjective') {
        subjCount++;
        return subjCount;
      } else {
        mcqCount++;
        return mcqCount;
      }
    });

    return {
      mapping,
      totalMCQs: mcqCount,
      totalSubjs: subjCount
    };
  }, [quizQuestions]);

  const hasMCQs = useMemo(() => {
    if (!selectedSubject) return false;
    return (QUIZTAKER_DATA[selectedSubject.name]?.mcqs?.length || 0) > 0;
  }, [selectedSubject]);

  const hasSubjective = useMemo(() => {
    if (!selectedSubject) return false;
    return (QUIZTAKER_DATA[selectedSubject.name]?.subjective?.length || 0) > 0;
  }, [selectedSubject]);

  useEffect(() => {
    loadValidSubjects();
  }, []);

  useEffect(() => {
    let timer: any;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setQuizCompleted(true);
      setTimerActive(false);
      showToast("Time is up!", "warning");
    }
    return () => clearInterval(timer);
  }, [timerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const loadValidSubjects = async () => {
    setInitializing(true);
    try {
      const subjectsMap = new Map<string, SubjectWithSyllabus>();

      // Load only subjects present in QUIZTAKER_DATA
      Object.keys(QUIZTAKER_DATA).forEach((subjectName, index) => {
        subjectsMap.set(subjectName, {
          id: `QUIZ_SUB_${index}`,
          name: subjectName,
          syllabusFile: null as any
        });
      });

      setSubjectsWithSyllabi(Array.from(subjectsMap.values()).sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error("Library load error:", err);
      setSubjectsWithSyllabi([]);
    } finally {
      setInitializing(false);
    }
  };

  const toggleUnit = (unit: number) => {
    setSelectedUnits(prev => prev.includes(unit) ? prev.filter(u => u !== unit) : [...prev, unit].sort((a, b) => a - b));
  };

  const handleGenerate = async () => {
    if (!selectedSubject || selectedUnits.length === 0) return;
    setLoading(true);
    setError(null);
    setIsCached(false);
    setStatus('Looking into archives...');

    try {
      const subjectData = QUIZTAKER_DATA[selectedSubject.name];
      if (!subjectData) throw new Error("No data found for this subject.");

      let finalSelection: QuizQuestion[] = [];

      const filterByUnits = (qs: QuizQuestion[]) => (qs || []).filter(q => selectedUnits.includes(q.unit));
      const availableMcqs = filterByUnits(subjectData.mcqs || []);
      const availableSubj = filterByUnits(subjectData.subjective || []);

      // Independent selection based on individual counts
      const pickedMcq = [...availableMcqs].sort(() => 0.5 - Math.random()).slice(0, numMCQ);
      const pickedSubj = [...availableSubj].sort(() => 0.5 - Math.random()).slice(0, numSubjective);

      finalSelection = [...pickedMcq, ...pickedSubj].sort(() => 0.5 - Math.random());

      if (finalSelection.length > 0) {
        startQuiz(finalSelection, true);
        return;
      } else {
        // Fallback to AI...
        setStatus('Generating fresh questions via AI...');
        const syllabusText = SYLLABUS_DATA[selectedSubject.name];
        if (!syllabusText) throw new Error("No syllabus available for AI generation.");

        const aiQuestions = await generateQuizFromSyllabus(selectedSubject.name, syllabusText, selectedUnits);
        if (!aiQuestions || aiQuestions.length === 0) throw new Error("Failed to generate questions.");
        startQuiz(aiQuestions, false);
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
    setQuizQuestions(questions);
    setIsCached(cached);
    setLoading(false);
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setQuizCompleted(false);
    setIsShowingExplanation(false);
    setReviewMode(false);

    // Start Timer
    setTimeLeft(timerMinutes * 60);
    setTimerActive(true);
    setVisitedQuestions(new Set([0]));
  };

  const handleAnswer = (optionIdx: number) => {
    if (isShowingExplanation || reviewMode) return;
    setUserAnswers(prev => ({ ...prev, [currentQuestionIdx]: optionIdx }));
    if (isPracticeMode) {
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
      if (question.type === 'subjective') return acc; // Don't auto-score subjective

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
      } else {
        stats[q.unit].total++;
        if (userAnswers[idx] === q.correctAnswer) stats[q.unit].correct++;
      }
    });
    return Object.entries(stats).map(([unit, s]) => ({
      unit: parseInt(unit),
      accuracy: s.total > 0 ? (s.correct / s.total) * 100 : 100,
      correct: s.correct,
      total: s.total,
      subjective: s.subjective
    }));
  }, [quizCompleted, quizQuestions, userAnswers]);

  if (initializing) return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-6 animate-fade-in">
      <div className="w-12 h-12 border-4 border-orange-500/10 border-t-orange-600 rounded-full animate-spin" />
      <p className="text-sm font-medium text-slate-500">Setting up your subjects...</p>
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
    </div>
  );

  if (quizQuestions.length > 0 && !quizCompleted && !reviewMode) {
    const q = quizQuestions[currentQuestionIdx];
    const currentAnswer = userAnswers[currentQuestionIdx];
    const isSubjectiveSection = q.type === 'subjective';

    return (
      <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in pb-20 px-4 md:px-10 dark:text-white">
        {/* Professional Top Bar - Simplified Header */}
        <header className="flex flex-wrap items-center justify-between gap-6 py-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isSubjectiveSection ? 'Subjective Section' : 'MCQ Section'}
            </h2>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Question <span className="text-slate-900 dark:text-white">{sectionInfo.mapping[currentQuestionIdx]}</span> / {isSubjectiveSection ? sectionInfo.totalSubjs : sectionInfo.totalMCQs}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {timerActive && (
              <div className="flex items-center gap-3 px-6 h-11 rounded-2xl bg-slate-100 dark:bg-black border border-slate-200 dark:border-white/5 shadow-inner transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`w-4 h-4 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-orange-500'}`}>
                  <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                </svg>
                <p className={`text-base font-bold tabular-nums transition-colors ${timeLeft < 60 ? 'text-red-500' : 'text-slate-900 dark:text-slate-100'}`}>
                  {formatTime(timeLeft)}
                </p>
              </div>
            )}
            <button
              onClick={() => setQuizCompleted(true)}
              className="px-8 h-11 bg-emerald-500 text-white rounded-2xl text-[13px] font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center"
            >
              Submit Test
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Question Area */}
          <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="glass-panel p-10 md:p-12 rounded-[48px] shadow-2xl bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 relative">
              <div className="space-y-10">
                <div className="flex items-center gap-3">
                  <span className="bg-orange-600/10 dark:bg-orange-600/20 text-orange-600 dark:text-orange-500 px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest">Question {sectionInfo.mapping[currentQuestionIdx]}</span>
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest">Unit {q.unit}</span>
                </div>

                <h3 className="text-lg md:text-xl font-semibold leading-relaxed text-slate-900 dark:text-white">
                  {q.question}
                </h3>

                {q.type === 'subjective' ? (
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
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Test Mode Active</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Model solutions will be available in the final report.</p>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 dark:border-emerald-500/10 rounded-[32px] animate-in fade-in slide-in-from-top-4 duration-500 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Model Solution</h4>
                        </div>
                        <p className="text-base font-medium text-slate-700 dark:text-slate-300 leading-relaxed border-l-4 border-emerald-500/30 dark:border-emerald-500/30 pl-6">{q.explanation}</p>
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
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-orange-500' : 'border-slate-300 dark:border-slate-700'}`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_#ea580c]" />}
                          </div>
                          <span className="font-medium text-[13px] md:text-sm tracking-tight flex items-center gap-2">
                            <span className="text-slate-400 dark:text-slate-500 font-bold">{String.fromCharCode(65 + i)}.</span>
                            {opt}
                          </span>
                        </button>
                      );
                    })}

                    {isShowingExplanation && (
                      <div className="p-8 mt-6 bg-orange-600/[0.03] dark:bg-orange-600/5 border border-orange-500/20 dark:border-orange-600/10 rounded-[32px] animate-in fade-in slide-in-from-top-4 duration-500">
                        <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-3">Expert Insights</p>
                        <p className="text-base font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-2 border-orange-500/30 dark:border-orange-600/30 pl-6">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Internal Navigation Buttons */}
                <div className="pt-10 border-t border-white/5 flex items-center justify-between">
                  <button
                    disabled={currentQuestionIdx === 0}
                    onClick={() => {
                      const prevIdx = currentQuestionIdx - 1;
                      setCurrentQuestionIdx(prevIdx);
                      setIsShowingExplanation(false);
                      setVisitedQuestions(prev => new Set(prev).add(prevIdx));
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-20 active:scale-95 border border-slate-200 dark:border-transparent"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M15 18l-6-6 6-6" /></svg>
                    Previous
                  </button>
                  <button
                    onClick={nextQuestion}
                    className="flex items-center gap-2 px-8 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-orange-600/20 active:scale-95 transition-all"
                  >
                    {currentQuestionIdx === quizQuestions.length - 1 ? 'Finish Test' : 'Next'}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M9 18l6-6-6-6" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 glass-panel p-8 rounded-[40px] shadow-2xl bg-white/90 dark:bg-black/40 border-slate-200 dark:border-white/5 space-y-10">
            <div className="space-y-8">
              <h4 className="text-xs font-semibold text-slate-500 text-center">Question Palette</h4>

              {/* Section 1: Objective */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className={`w-1 h-4 rounded-full ${!isSubjectiveSection ? 'bg-orange-600 shadow-[0_0_8px_#ea580c]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                  <span className={`text-[13px] font-bold uppercase tracking-widest ${!isSubjectiveSection ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600'}`}>Section 1: Objective</span>
                </div>
                <div className="grid grid-cols-5 gap-2.5">
                  {quizQuestions.map((q, idx) => {
                    if (q.type === 'subjective') return null;
                    const isAnswered = userAnswers[idx] !== undefined;
                    const isVisited = visitedQuestions.has(idx);
                    const isCurrent = currentQuestionIdx === idx;

                    let bgColor = "bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500";
                    if (isCurrent) bgColor = "bg-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.3)]";
                    else if (isAnswered) bgColor = "bg-emerald-500 text-white";
                    else if (isVisited) bgColor = "bg-red-500 text-white";

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentQuestionIdx(idx);
                          setIsShowingExplanation(false);
                          setVisitedQuestions(prev => new Set(prev).add(idx));
                        }}
                        className={`h-11 w-full rounded-xl flex items-center justify-center text-xs font-bold transition-all border-2 ${isCurrent ? 'border-orange-400' : 'border-transparent'} ${bgColor}`}
                      >
                        {sectionInfo.mapping[idx]}
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
                    <span className={`text-[13px] font-bold uppercase tracking-widest ${isSubjectiveSection ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600'}`}>Section 2: Subjective</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2.5">
                    {quizQuestions.map((q, idx) => {
                      if (q.type !== 'subjective') return null;
                      const isAnswered = userAnswers[idx] !== undefined;
                      const isVisited = visitedQuestions.has(idx);
                      const isCurrent = currentQuestionIdx === idx;

                      let bgColor = "bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500";
                      if (isCurrent) bgColor = "bg-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.3)]";
                      else if (isAnswered) bgColor = "bg-emerald-500 text-white";
                      else if (isVisited) bgColor = "bg-red-500 text-white";

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setCurrentQuestionIdx(idx);
                            setIsShowingExplanation(false);
                            setVisitedQuestions(prev => new Set(prev).add(idx));
                          }}
                          className={`h-11 w-full rounded-xl flex items-center justify-center text-xs font-bold transition-all border-2 ${isCurrent ? 'border-orange-400' : 'border-transparent'} ${bgColor}`}
                        >
                          {sectionInfo.mapping[idx]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-white/5">
              {/* Legend Only */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-lg bg-emerald-500" />
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Answered</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-lg bg-red-500" />
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Not Answered</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-lg bg-orange-500 shadow-[0_0_8px_#ea580c]" />
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Active Question</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted || reviewMode) {
    const percentage = quizQuestions.length > 0 ? (score / quizQuestions.length) * 100 : 0;
    return (
      <div className="max-w-5xl mx-auto py-12 space-y-10 animate-fade-in pb-32 px-4 md:px-0" ref={resultRef} id="quiz-result">
        {/* Professional Result Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Score Card */}
          <div className="lg:col-span-5 glass-panel p-10 rounded-[48px] bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center">
            <div className="relative z-10 space-y-4">
              <p className="text-xs font-semibold text-orange-500">Performance Report</p>
              <div className="flex items-baseline justify-center">
                <span className="text-6xl md:text-7xl font-semibold tracking-tighter">{score}</span>
                <span className="text-2xl font-medium opacity-40 ml-2">/ {quizQuestions.length}</span>
              </div>
              <div className="inline-block px-6 py-2 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md">
                <p className="text-xs font-semibold leading-none">
                  {percentage >= 80 ? '🎯 Mastered' : percentage >= 60 ? '⚡ Proficient' : '📚 Learning'}
                </p>
              </div>
              <p className="text-[9px] font-medium text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                You've completed the assessment for <span className="text-white font-bold">{selectedSubject?.name}</span>.
              </p>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/20 blur-[80px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/10 blur-[80px] rounded-full" />
          </div>

          {/* Detailed Breakdown */}
          <div className="lg:col-span-7 glass-panel p-8 md:p-10 rounded-[48px] shadow-xl border-slate-100 dark:border-white/5 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-400">Unit Analysis</h3>
              <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-orange-600/10 text-orange-600 rounded-xl text-xs font-semibold hover:bg-orange-600 hover:text-white transition-all">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                Export PDF
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {unitAnalysis.map((u, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <span className="text-[11px] font-medium text-slate-500 block mb-0.5">Unit 0{u.unit}</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">Conceptual Application</span>
                    </div>
                    <span className="text-xs font-medium text-slate-400">{u.correct}/{u.total} Correct</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-dark-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${u.accuracy >= 70 ? 'bg-emerald-500' : u.accuracy >= 40 ? 'bg-orange-500' : 'bg-red-500'}`}
                      style={{ width: `${u.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex flex-wrap gap-3">
              <button
                onClick={handleGenerate}
                className="flex-1 min-w-[140px] px-6 py-3.5 bg-orange-600 text-white rounded-2xl text-xs font-semibold shadow-xl shadow-orange-600/20 active:scale-95 transition-all border-none"
              >
                Re-take Quiz
              </button>
              <button
                onClick={() => { setQuizQuestions([]); setQuizCompleted(false); setSelectedSubject(null); }}
                className="flex-1 min-w-[140px] px-6 py-3.5 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-2xl text-xs font-semibold border border-slate-200 dark:border-white/10 hover:border-orange-500/50 hover:text-orange-600 transition-all"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
            <h3 className="text-[10px] font-medium text-slate-500">Question Review</h3>
            <span className="text-[9px] font-bold text-slate-400">{quizQuestions.length} Items</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {quizQuestions.map((q, i) => {
              const isSubjective = q.type === 'subjective';
              const isCorrect = !isSubjective && userAnswers[i] === q.correctAnswer;
              return (
                <div key={i} className={`p-5 rounded-[24px] border transition-all ${isSubjective ? 'bg-orange-500/[0.02] border-orange-500/10' : isCorrect ? 'bg-emerald-500/[0.02] border-emerald-500/10' : 'bg-red-500/[0.02] border-red-500/10'}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest ${isSubjective ? 'bg-orange-500/20 text-orange-600' : isCorrect ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                          {isSubjective ? 'Subjective' : isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Unit 0{q.unit}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-snug">{q.question}</h4>

                      {!isSubjective ? (
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px]">
                          <div>
                            <span className="text-slate-400 font-bold block mb-0.5 uppercase text-[7px] tracking-widest">Your Answer</span>
                            <span className={`font-bold ${isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>{q.options?.[userAnswers[i]] || 'Skipped'}</span>
                          </div>
                          {!isCorrect && (
                            <div>
                              <span className="text-slate-400 font-bold block mb-0.5 uppercase text-[7px] tracking-widest">Correct Solution</span>
                              <span className="font-bold text-emerald-500">{q.options?.[q.correctAnswer ?? 0]}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-[10px]">
                          <span className="text-slate-400 font-bold block mb-0.5 uppercase text-[7px] tracking-widest">Feedback</span>
                          <span className="font-bold text-orange-600">Self-evaluated model answer check.</span>
                        </div>
                      )}

                      <div className="mt-2 p-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium italic">"{q.explanation}"</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-20 px-4 md:px-0">
      <header className="text-center space-y-3">
        <h2 className="text-2xl md:text-4xl font-semibold text-slate-900 dark:text-white tracking-tighter leading-none">Quiz <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Taker</span></h2>
        <p className="text-slate-500 font-medium text-xs">Comprehensive Assessment Engine</p>
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

      <div className="glass-panel p-8 md:p-12 rounded-[56px] shadow-2xl space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Step 1: Subject Selection */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${selectedSubject ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-600/10 text-orange-600'}`}>
                {selectedSubject ? '✓' : '1'}
              </div>
              <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Select Subject</label>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
              {subjectsWithSyllabi.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedSubject(s); setSelectedUnits([]); }}
                  className={`p-4 rounded-2xl border text-left transition-all ${selectedSubject?.id === s.id ? 'bg-orange-600 border-orange-500 text-white shadow-lg' : 'bg-slate-50 dark:bg-dark-950 border-slate-200 dark:border-white/5 text-slate-500 hover:border-orange-500/30'}`}
                >
                  <p className="text-xs font-medium">{s.name}</p>
                </button>
              ))}
              {subjectsWithSyllabi.length === 0 && !initializing && (
                <div className="py-10 text-center space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-40">No subjects found in the library.</p>
                  <p className="text-xs text-slate-500">Upload a syllabus in the Library to get started.</p>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Unit Selection */}
          <div className={`space-y-6 transition-all duration-700 ${!selectedSubject ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${selectedUnits.length > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-600/10 text-orange-600'}`}>
                {selectedUnits.length > 0 ? '✓' : '2'}
              </div>
              <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Select Units</label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map(u => {
                const isAvailable = availableUnitsForSubject.includes(u);
                const isSelected = selectedUnits.includes(u);
                return (
                  <button
                    key={u}
                    disabled={!isAvailable}
                    onClick={() => toggleUnit(u)}
                    className={`relative p-6 rounded-[32px] border transition-all flex flex-col items-center justify-center group ${!isAvailable ? 'bg-slate-100/80 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 opacity-80 grayscale cursor-not-allowed' :
                      isSelected ? 'bg-orange-600/10 border-orange-600 shadow-xl scale-105' :
                        'bg-slate-50 dark:bg-dark-950 border-slate-200 dark:border-white/5 hover:border-orange-500/30'
                      }`}
                  >
                    {!isAvailable && (
                      <span className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400 text-[10px] font-medium border border-slate-300/50 dark:border-white/10">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5"><path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm3 8H9V7a3 3 0 0 1 6 0v3z" /></svg>
                        Locked
                      </span>
                    )}
                    <span className={`text-2xl font-bold tracking-tight ${isSelected ? 'text-orange-600' : isAvailable ? 'text-slate-400 dark:text-slate-600' : 'text-slate-400 dark:text-slate-600'}`}>0{u}</span>
                    <span className={`text-[10px] font-medium mt-1 ${isSelected ? 'text-orange-500' : 'text-slate-500 opacity-60'}`}>Unit {u}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 3: Customization - Progressive Disclosure */}
        {selectedUnits.length > 0 && (
          <div className="pt-10 border-t border-slate-100 dark:border-white/5 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-600/10 flex items-center justify-center text-orange-600 font-bold text-xs">3</div>
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Customization</label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hasMCQs && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-right-2 duration-500">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">MCQ Count</p>
                    <input
                      type="number" min="0" max="500" value={numMCQ}
                      onChange={(e) => setNumMCQ(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-white/5 rounded-xl text-sm font-bold text-orange-600 focus:outline-none focus:border-orange-500 transition-all shadow-inner"
                    />
                  </div>
                )}

                {hasSubjective && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-500">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Subjective Count</p>
                    <input
                      type="number" min="0" max="500" value={numSubjective}
                      onChange={(e) => setNumSubjective(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-white/5 rounded-xl text-sm font-bold text-orange-600 focus:outline-none focus:border-orange-500 transition-all shadow-inner"
                    />
                  </div>
                )}

                <div className={`space-y-2 ${!hasSubjective ? 'animate-in fade-in slide-in-from-left-2 duration-500' : 'md:col-span-2'}`}>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Duration (Minutes)</p>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                    </div>
                    <input
                      type="number" min="1" max="180" value={timerMinutes}
                      onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 0)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-white/5 rounded-xl text-sm font-bold text-orange-600 focus:outline-none focus:border-orange-500 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {hasMCQs && (
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setNegativeMarking(!negativeMarking)}
                      className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${negativeMarking ? 'bg-orange-600/5 border-orange-500/30' : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-orange-500/20'}`}
                    >
                      <div className="text-left flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${negativeMarking ? 'bg-orange-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M12 2v20M2 12h20" className="rotate-45" /></svg>
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-slate-900 dark:text-slate-100">Negative Marking</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest opacity-60">Deducts 1/4 mark / error</p>
                        </div>
                      </div>
                      <div className={`w-11 h-6 rounded-full relative transition-colors ${negativeMarking ? 'bg-orange-600' : 'bg-slate-200 dark:bg-slate-800'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${negativeMarking ? 'right-1 bg-white shadow-sm' : 'left-1 bg-slate-400 dark:bg-slate-600'}`} />
                      </div>
                    </button>

                    <button
                      onClick={() => setIsPracticeMode(!isPracticeMode)}
                      className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${isPracticeMode ? 'bg-orange-600/5 border-orange-500/30' : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-orange-500/20'}`}
                    >
                      <div className="text-left flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${isPracticeMode ? 'bg-orange-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-slate-900 dark:text-slate-100">Practice Mode</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest opacity-60">Instant Answer Validation</p>
                        </div>
                      </div>
                      <div className={`w-11 h-6 rounded-full relative transition-colors ${isPracticeMode ? 'bg-orange-600' : 'bg-slate-200 dark:bg-slate-800'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${isPracticeMode ? 'right-1 bg-white shadow-sm' : 'left-1 bg-slate-400 dark:bg-slate-600'}`} />
                      </div>
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-bold text-sm tracking-tight shadow-xl shadow-orange-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 border-none"
              >
                {loading ? 'Processing...' : 'Generate My Quiz'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizTaker;
