import React, { useState, useEffect, useMemo, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { UserProfile, QuizQuestion, LibraryFile } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';
import { generateQuizFromSyllabus } from '../services/geminiService.ts';
import { extractTextFromPdf } from '../services/pdfUtils.ts';
import jsPDF from 'jspdf';
import { showToast } from './Toast.tsx';
import html2canvas from 'html2canvas';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

import { SYLLABUS_DATA } from '../data/syllabusData.ts';
import { QUIZTAKER_DATA } from '../data/quiztaker/quizData.ts';

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

  const [solvedQuestionIds, setSolvedQuestionIds] = useState<Set<string>>(new Set());
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const solved = localStorage.getItem('quiz_solved_questions');
    if (solved) {
      setSolvedQuestionIds(new Set(JSON.parse(solved)));
    }
  }, []);

  const saveSolvedQuestions = (ids: string[]) => {
    const newSolved = new Set([...Array.from(solvedQuestionIds), ...ids]);
    setSolvedQuestionIds(newSolved);
    localStorage.setItem('quiz_solved_questions', JSON.stringify(Array.from(newSolved)));
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

  const runCode = async (isSubmit: boolean = false, isResume: boolean = false) => {
    if (!pyodide) return;
    setIsExecuting(true);
    setIsAwaitingInput(false);
    
    if (isSubmit) {
      setTestResults([]); 
    } else if (!isResume) {
      setExecutionOutput("Running...");
      setUserInputs([]); // Reset inputs for fresh manual run
    }

    try {
      const setupEnv = () => pyodide.runPython(`
import sys
import io
import builtins

# Create custom stdout/stderr that notifies JS immediately if possible
# (Though for runPythonAsync, it usually flushes at once or on custom handlers)
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
        # Signal JS that we need input
        raise Exception("WAITING_FOR_INPUT")

builtins.input = _custom_input
      `);

      // MODE 1: Manual Run (In Console)
      if (!isSubmit) {
        setupEnv();
        try {
          await pyodide.runPythonAsync(currentCode);
          const output = pyodide.runPython("sys.stdout.getvalue()");
          const stderr = pyodide.runPython("sys.stderr.getvalue()");
          setExecutionOutput(output + (stderr ? "\nError:\n" + stderr : ""));
        } catch (err: any) {
          if (err.message.includes("WAITING_FOR_INPUT")) {
            // Partial output before input()
            const partialOutput = pyodide.runPython("sys.stdout.getvalue()");
            setExecutionOutput(partialOutput);
            setIsAwaitingInput(true);
          } else {
            throw err;
          }
        }
      }

      // MODE 2: Submission (Test Cases)
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
    } catch (err: any) {
      if (!isSubmit) {
        let msg = err.message;
        setExecutionOutput(prev => prev + "\nError: " + msg);
        setIsAwaitingInput(false); // Reset input state on crash
      }
    } finally {
      if (!isAwaitingInput) setIsExecuting(false);
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
    }
  }, [quizCompleted]);

  const availableUnitsForSubject = useMemo(() => {
    if (!selectedSubject) return [];
    const data = QUIZTAKER_DATA[selectedSubject.name];
    if (!data) return [];
    const units = new Set<number>();
    (data.mcqs || []).forEach(q => units.add(q.unit));
    (data.subjective || []).forEach(q => units.add(q.unit));
    return Array.from(units).sort((a, b) => a - b);
  }, [selectedSubject]);

  const availableTopicsByUnit = useMemo(() => {
    if (!selectedSubject) return {};
    const data = QUIZTAKER_DATA[selectedSubject.name];
    if (!data) return {};
    const topicsMap: Record<number, Set<string>> = {};
    const filterByUnits = (qs: QuizQuestion[]) => selectedUnits.length > 0 ? qs.filter(q => selectedUnits.includes(q.unit)) : qs;
    
    filterByUnits(data.mcqs || []).forEach(q => {
      if (q.topic) {
        if (!topicsMap[q.unit]) topicsMap[q.unit] = new Set();
        topicsMap[q.unit].add(q.topic);
      }
    });
    filterByUnits(data.subjective || []).forEach(q => {
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
  }, [selectedSubject, selectedUnits]);

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
    if (!selectedSubject) return false;
    return (QUIZTAKER_DATA[selectedSubject.name]?.mcqs?.length || 0) > 0;
  }, [selectedSubject]);

  const hasSubjective = useMemo(() => {
    if (!selectedSubject) return false;
    return (QUIZTAKER_DATA[selectedSubject.name]?.subjective?.length || 0) > 0;
  }, [selectedSubject]);

  const hasCoding = useMemo(() => {
    if (!selectedSubject) return false;
    const mcqs = QUIZTAKER_DATA[selectedSubject.name]?.mcqs || [];
    return mcqs.some(q => q.type === 'coding');
  }, [selectedSubject]);

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
    }
  }, [selectedSubject, hasSubjective, hasCoding]);

  useEffect(() => {
    let timer: any;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setQuizCompleted(true);
      setTimerActive(false);
      showToast("Time is up!", "info");
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
      let availableMcqs = filterByUnits(subjectData.mcqs || []);
      let availableSubj = filterByUnits(subjectData.subjective || []);

      // Filter out solved questions
      const unsolvedMcqs = availableMcqs.filter(q => !solvedQuestionIds.has(q.id));
      const unsolvedSubj = availableSubj.filter(q => !solvedQuestionIds.has(q.id));

      // Use unsolved if available, otherwise reset or fallback
      let poolMcq = unsolvedMcqs.length > 0 ? unsolvedMcqs : availableMcqs;
      let poolSubj = unsolvedSubj.length > 0 ? unsolvedSubj : availableSubj;

      if (selectedDifficulties.length > 0) {
        poolMcq = poolMcq.filter(q => selectedDifficulties.includes(q.difficulty || 'medium'));
        poolSubj = poolSubj.filter(q => selectedDifficulties.includes(q.difficulty || 'medium'));
      }
      if (selectedTopics.length > 0) {
        poolMcq = poolMcq.filter(q => q.topic && selectedTopics.includes(q.topic));
        poolSubj = poolSubj.filter(q => q.topic && selectedTopics.includes(q.topic));
      }

      // Separate coding from MCQ
      const codingQuestions = poolMcq.filter(q => q.type === 'coding');
      const pureMcqs = poolMcq.filter(q => q.type !== 'coding');

      // Independent selection based on individual counts
      const pickedMcq = [...pureMcqs].sort(() => 0.5 - Math.random()).slice(0, numMCQ);
      const pickedSubj = [...poolSubj].sort(() => 0.5 - Math.random()).slice(0, numSubjective);
      
      // If coding questions exist (like for INT108), pick from them
      const pickedCoding = codingQuestions.length > 0 
        ? [...codingQuestions].sort(() => 0.5 - Math.random()).slice(0, numCoding) 
        : [];

      finalSelection = [...pickedMcq, ...pickedCoding, ...pickedSubj].sort(() => 0.5 - Math.random());

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
    // Ensure all questions have IDs (especially AI-generated ones)
    const enriched = questions.map((q, idx) => {
      if (q.id) return q;
      // Deterministic ID based on question content to track repeats
      const contentHash = q.question.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
      return { ...q, id: `ai-${Math.abs(contentHash)}` };
    });

    setQuizQuestions(enriched);
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
    const isCodingSection = q.type === 'coding';

    return (
      <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in pb-20 px-4 md:px-10 dark:text-white">
        {/* Professional Top Bar - Simplified Header */}
        <header className="flex flex-wrap items-center justify-between gap-6 py-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isSubjectiveSection ? 'Subjective Section' : isCodingSection ? 'Coding Section' : 'MCQ Section'}
            </h2>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Question <span className="text-slate-900 dark:text-white">{sectionInfo.mapping[currentQuestionIdx]}</span> / {isSubjectiveSection ? sectionInfo.totalSubjs : isCodingSection ? sectionInfo.totalCoding : sectionInfo.totalMCQs}
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
                <div className="flex items-center flex-wrap gap-3">
                  <span className="bg-orange-600/10 dark:bg-orange-600/20 text-orange-600 dark:text-orange-500 px-4 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest">Question {sectionInfo.mapping[currentQuestionIdx]}</span>
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest">Unit {q.unit}</span>
                  {q.difficulty && (
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest ${
                      q.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      q.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
                      'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}>
                      {q.difficulty}
                    </span>
                  )}
                  {q.topic && (
                    <span className="bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-xl text-[10px] font-semibold tracking-widest">
                      {q.topic}
                    </span>
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
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Python 3</span>
                        </div>
                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">|</span>
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 tabular-nums">main.py</span>
                      </div>
                      
                      <button 
                        onClick={resetCode}
                        className="flex items-center gap-1.5 px-3 py-1 hover:bg-slate-200 dark:hover:bg-white/5 rounded-lg transition-colors group"
                        title="Reset code to starter"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 uppercase tracking-widest">Reset</span>
                      </button>
                    </div>

                    <div className="rounded-b-[20px] overflow-hidden border-x border-b border-slate-200 dark:border-white/10 shadow-xl bg-[#1e1e1e]">
                      <Editor
                        height="400px"
                        language="python"
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
                           disabled={isExecuting || !pyodide}
                           className="px-6 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-sm"
                         >
                           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M5 3l14 9-14 9V3z" /></svg>
                           Run Code
                         </button>
                         <button
                           onClick={() => runCode(true)}
                           disabled={isExecuting || !pyodide}
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
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-orange-500' : 'border-slate-300 dark:border-slate-700'}`}>
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

          <aside className="lg:col-span-4 sticky top-8 max-h-[calc(100vh-120px)] flex flex-col glass-panel p-8 rounded-[40px] shadow-2xl bg-white/90 dark:bg-black/40 border-slate-200 dark:border-white/5 overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
              <h4 className="text-xs font-semibold text-slate-500 text-center sticky top-0 bg-inherit py-2 z-10">Question Palette</h4>

              {/* Section 1: Objective */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className={`w-1 h-4 rounded-full ${!isSubjectiveSection ? 'bg-orange-600 shadow-[0_0_8px_#ea580c]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                  <span className={`text-[13px] font-semibold uppercase tracking-widest ${!isSubjectiveSection ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600'}`}>Section 1: Objective</span>
                </div>
                <div className="grid grid-cols-5 gap-2.5">
                  {quizQuestions.map((q, idx) => {
                    if (q.type === 'subjective' || q.type === 'coding') return null;
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
                        className={`h-11 w-full rounded-xl flex items-center justify-center text-xs font-semibold transition-all border-2 ${isCurrent ? 'border-orange-400' : 'border-transparent'} ${bgColor}`}
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
                    <span className={`text-[13px] font-semibold uppercase tracking-widest ${isSubjectiveSection ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600'}`}>Section 2: Subjective</span>
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
                      const isPassed = ans && typeof ans === 'object' && ans.passed === true;
                      const isVisited = visitedQuestions.has(idx);
                      const isCurrent = currentQuestionIdx === idx;

                      let bgColor = "bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500";
                      if (isCurrent) bgColor = "bg-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.3)]";
                      else if (isPassed) bgColor = "bg-emerald-500 text-white";
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
          </aside>
        </div>
      </div>
    );
  }

  if (quizCompleted || reviewMode) {
    const autoGradableQuestions = quizQuestions.filter(q => q.type !== 'subjective');
    const autoGradableCount = autoGradableQuestions.length;
    const rawPercentage = autoGradableCount > 0 ? (score / autoGradableCount) * 100 : 0;
    const percentage = Math.max(0, Math.round(rawPercentage));
    return (
      <div className="max-w-5xl mx-auto py-12 space-y-12 animate-fade-in pb-32 px-4 md:px-0" ref={resultRef} id="quiz-result">
        {/* Professional Result Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Score Card */}
          <div className="lg:col-span-5 relative overflow-hidden glass-panel rounded-[40px] p-10 flex flex-col items-center justify-center text-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
            <div className="relative z-10 space-y-6 w-full">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Performance Report</span>
              </div>
              
              <div className="flex items-baseline justify-center">
                <span className="text-7xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">{score}</span>
                <span className="text-3xl font-bold text-slate-500 ml-2">/ {quizQuestions.filter(q => q.type !== 'subjective').length}</span>
              </div>
              
              <div className="inline-block px-8 py-3 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner">
                <p className="text-sm font-bold tracking-wide">
                  {percentage >= 80 ? '🎯 Mastered Performance' : percentage >= 60 ? '⚡ Proficient Understanding' : '📚 Learning Phase'}
                </p>
              </div>
              
              <p className="text-xs font-medium text-slate-400 max-w-[240px] mx-auto leading-relaxed pt-4 border-t border-white/10">
                You've completed the assessment for <span className="text-white font-bold">{selectedSubject?.name || 'this test'}</span>.
              </p>
            </div>
            
            {/* Immersive Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 blur-[100px] rounded-full mix-blend-screen" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full mix-blend-screen" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
          </div>

          {/* Detailed Breakdown */}
          <div className="lg:col-span-7 glass-panel p-8 md:p-10 rounded-[40px] shadow-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 flex flex-col justify-between space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Unit Analysis</h3>
                <p className="text-xs font-medium text-slate-500 mt-1">Breakdown of your performance by topic</p>
              </div>
              <button onClick={handleDownloadPDF} className="group flex items-center gap-2 px-5 py-2.5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 rounded-xl text-sm font-semibold hover:bg-orange-600 hover:text-white transition-all shadow-sm border border-orange-200 dark:border-orange-500/20 hover:border-orange-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 transition-transform group-hover:-translate-y-0.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                Export PDF
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 flex-1">
              {unitAnalysis.map((u, i) => (
                <div key={i} className="group bg-slate-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-100 dark:border-white/5 transition-all hover:border-slate-300 dark:hover:border-white/10">
                  <div className="flex justify-between items-end mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${u.accuracy >= 70 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : u.accuracy >= 40 ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'}`}>
                        0{u.unit}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">Unit</span>
                        <span className="text-sm md:text-base font-semibold text-slate-900 dark:text-white leading-tight block">Conceptual Application</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-slate-900 dark:text-white">{u.accuracy}%</span>
                      <span className="text-xs font-medium text-slate-500 block">{u.correct}/{u.total} Correct</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 origin-left ${u.accuracy >= 70 ? 'bg-emerald-500' : u.accuracy >= 40 ? 'bg-orange-500' : 'bg-red-500'}`}
                      style={{ width: `${u.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex flex-wrap gap-4">
              <button
                onClick={handleGenerate}
                className="flex-1 min-w-[140px] px-6 py-4 bg-orange-600 text-white rounded-2xl text-sm font-semibold shadow-[0_8px_20px_-8px_#ea580c] hover:shadow-[0_8px_25px_-5px_#ea580c] hover:-translate-y-0.5 active:translate-y-0 transition-all border-none flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                Re-take Quiz
              </button>
              <button
                onClick={() => { setQuizQuestions([]); setQuizCompleted(false); setSelectedSubject(null); }}
                className="flex-1 min-w-[140px] px-6 py-4 glass-panel bg-white/50 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded-2xl text-sm font-semibold border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                Return Home
              </button>
            </div>
          </div>
        </div>

        {/* Question Review Section */}
        <div className="space-y-8 pt-8 border-t border-slate-200 dark:border-white/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Question Review</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Detailed evaluation of your answers</p>
            </div>
            <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 inline-flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{quizQuestions.length} Items Total</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {quizQuestions.map((q, i) => {
              const isSubjective = q.type === 'subjective';
              const isCoding = q.type === 'coding';
              const ansObj = userAnswers[i] as any;
              const isCorrect = isCoding 
                ? (ansObj && typeof ansObj === 'object' && ansObj.passed)
                : (!isSubjective && userAnswers[i] === q.correctAnswer);
              
              const statusColorOptions = isSubjective 
                ? 'bg-orange-50 border-orange-200 dark:bg-orange-500/5 dark:border-orange-500/20 text-orange-600 dark:text-orange-400' 
                : isCorrect 
                  ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/5 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-red-50 border-red-200 dark:bg-red-500/5 dark:border-red-500/20 text-red-600 dark:text-red-400';
              
              const badgeColors = isSubjective 
                ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200 dark:border-orange-500/30' 
                : isCorrect 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' 
                  : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30';
              
              const label = isCoding ? (isCorrect ? 'Tests Passed' : 'Tests Failed') : (isSubjective ? 'Subjective' : (isCorrect ? 'Correct' : 'Incorrect'));

              return (
                <div key={i} className={`p-6 md:p-8 rounded-[32px] border shadow-sm transition-all ${statusColorOptions}`}>
                  <div className="flex flex-col space-y-5">
                    
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${badgeColors}`}>
                        {label}
                      </span>
                      <span className="px-3 py-1 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500 border border-slate-200 dark:border-slate-700 uppercase tracking-wider shadow-sm">
                        Unit 0{q.unit}
                      </span>
                      {q.difficulty && (
                        <span className="px-3 py-1 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500 border border-slate-200 dark:border-slate-700 uppercase tracking-wider shadow-sm">
                          {q.difficulty}
                        </span>
                      )}
                    </div>
                    
                    {/* Question Text */}
                    <h4 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                      {parseText(q.question)}
                    </h4>

                    {/* Options/Answers Row */}
                    {isCoding ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-white/60 dark:bg-black/20 rounded-2xl border border-white/50 dark:border-white/5">
                          <span className="text-slate-500 dark:text-slate-400 font-bold block mb-1.5 uppercase text-[10px] tracking-widest">Submitted Code</span>
                          <pre className="font-mono text-xs bg-slate-900/50 p-4 rounded-xl overflow-auto dark:text-slate-300">
                            {ansObj?.code || '# No code submitted'}
                          </pre>
                        </div>
                        
                        {ansObj?.results && ansObj.results.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-slate-500 dark:text-slate-400 font-bold block mb-1 uppercase text-[10px] tracking-widest">Test Results</span>
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

                        <div className={`p-4 rounded-2xl border text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
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
                          <span className="text-slate-500 dark:text-slate-400 font-bold block mb-1.5 uppercase text-[10px] tracking-widest flex items-center gap-1">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M20 6L9 17l-5-5" /></svg>
                            Your Answer
                          </span>
                          <span className={`font-semibold text-sm ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {userAnswers[i] !== undefined ? parseText(q.options?.[userAnswers[i]]) : 'Skipped'}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 text-slate-800 dark:text-slate-200">
                            <span className="text-emerald-600/70 dark:text-emerald-400/70 font-bold block mb-1.5 uppercase text-[10px] tracking-widest flex items-center gap-1">
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
                        <span className="text-orange-500/70 dark:text-orange-400/70 font-bold block mb-1.5 uppercase text-[10px] tracking-widest flex items-center gap-1">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                          Feedback
                        </span>
                        <span className="font-semibold text-sm text-orange-700 dark:text-orange-400">
                          Self-evaluated model answer check.
                        </span>
                      </div>
                    )}

                    {/* Explanation Box */}
                    <div className="mt-4 p-5 md:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                      <div className="flex items-center gap-2 mb-3">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-400"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Explanation</span>
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
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${selectedUnits.length > 0 && selectedDifficulties.length > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-600/10 text-orange-600'}`}>
                {selectedUnits.length > 0 && selectedDifficulties.length > 0 ? '✓' : '2'}
              </div>
              <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Select Units & Difficulty</label>
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
                    {selectedSubject && !isAvailable && (
                      <span className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400 text-[10px] font-medium border border-slate-300/50 dark:border-white/10">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5"><path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm3 8H9V7a3 3 0 0 1 6 0v3z" /></svg>
                        Coming soon
                      </span>
                    )}
                    
                    <span className={`text-2xl font-bold tracking-tight mb-0.5 transition-colors ${isSelected ? 'text-orange-600' : 'text-slate-300 dark:text-slate-700'}`}>
                      0{u}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-orange-500' : 'text-slate-400 dark:text-slate-500'}`}>
                      Unit {u}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { id: 'easy', num: 'L1', label: 'Easy', color: { bg: 'bg-emerald-500/10', border: 'border-emerald-500', text: 'text-emerald-600', subText: 'text-emerald-500', hover: 'hover:border-emerald-500/30' } },
                  { id: 'medium', num: 'L2', label: 'Medium', color: { bg: 'bg-amber-500/10', border: 'border-amber-500', text: 'text-amber-600', subText: 'text-amber-500', hover: 'hover:border-amber-500/30' } },
                  { id: 'hard', num: 'L3', label: 'Hard', color: { bg: 'bg-red-500/10', border: 'border-red-500', text: 'text-red-600', subText: 'text-red-500', hover: 'hover:border-red-500/30' } }
                ].map(lvl => {
                  const isSelected = selectedDifficulties.includes(lvl.id);
                  const toggleDifficulty = (id: string) => {
                    setSelectedDifficulties(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
                  };
                  return (
                    <button
                      key={lvl.id}
                      onClick={() => toggleDifficulty(lvl.id)}
                      className={`relative p-5 rounded-[28px] border transition-all flex flex-col items-center justify-center group ${
                        isSelected ? `${lvl.color.bg} ${lvl.color.border} shadow-xl scale-105` :
                        `bg-slate-50 dark:bg-dark-950 border-slate-200 dark:border-white/5 ${lvl.color.hover}`
                      }`}
                    >
                      <span className={`text-xl font-bold tracking-tight ${isSelected ? lvl.color.text : 'text-slate-400 dark:text-slate-600'}`}>{lvl.num}</span>
                      <span className={`text-[10px] font-medium mt-1 ${isSelected ? lvl.color.subText : 'text-slate-500 opacity-60'}`}>{lvl.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Customization - Progressive Disclosure */}
        {selectedUnits.length > 0 && selectedDifficulties.length > 0 && (
          <div className="pt-10 border-t border-slate-100 dark:border-white/5 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-600/10 flex items-center justify-center text-orange-600 font-bold text-xs">3</div>
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Customization</label>
              </div>

              <div className="flex flex-col md:flex-row gap-4 w-full">
                {hasMCQs && (
                  <div className="flex-1 space-y-2 animate-in fade-in slide-in-from-right-2 duration-500">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">MCQ Count</p>
                    <input
                      type="number" min="0" max="500" value={numMCQ}
                      onChange={(e) => setNumMCQ(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-white/5 rounded-xl text-sm font-bold text-orange-600 focus:outline-none focus:border-orange-500 transition-all shadow-inner"
                    />
                  </div>
                )}

                {hasSubjective && (
                  <div className="flex-1 space-y-2 animate-in fade-in slide-in-from-left-2 duration-500">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Subjective Count</p>
                    <input
                      type="number" min="0" max="500" value={numSubjective}
                      onChange={(e) => setNumSubjective(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-white/5 rounded-xl text-sm font-bold text-orange-600 focus:outline-none focus:border-orange-500 transition-all shadow-inner"
                    />
                  </div>
                )}

                {hasCoding && (
                  <div className="flex-1 space-y-2 animate-in fade-in slide-in-from-left-2 duration-500">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Coding Count</p>
                    <input
                      type="number" min="0" max="50" value={numCoding}
                      onChange={(e) => setNumCoding(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-white/5 rounded-xl text-sm font-bold text-orange-600 focus:outline-none focus:border-orange-500 transition-all shadow-inner"
                    />
                  </div>
                )}
                
                <div className="flex-1 space-y-2 animate-in fade-in slide-in-from-left-2 duration-500">
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
              </div>

              <div className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-500">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Topics</p>
                </div>
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 no-scrollbar">
                  {Object.entries(availableTopicsByUnit).sort((a,b) => Number(a[0]) - Number(b[0])).map(([unit, topics]) => {
                    const isUnitAllSelected = !(topics as string[]).some(t => selectedTopics.includes(t));
                    return (
                      <div key={unit} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Unit {unit}</h4>
                          <div className="h-px bg-slate-200 dark:bg-white/5 flex-grow"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <button
                            onClick={() => setSelectedTopics(prev => prev.filter(t => !(topics as string[]).includes(t)))}
                            className={`col-span-1 md:col-span-2 flex items-center text-left gap-3 p-3 rounded-xl border transition-all ${
                              isUnitAllSelected ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-500/50 shadow-sm' :
                              'bg-slate-50 dark:bg-dark-950 border-slate-200 dark:border-white/5 hover:border-orange-500/30'
                            }`}
                          >
                            <div className={`min-w-4 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              isUnitAllSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-dark-900'
                            }`}>
                              {isUnitAllSelected && <svg viewBox="0 0 14 14" fill="none" className="w-2.5 h-2.5"><path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </div>
                            <span className={`text-sm font-semibold leading-relaxed ${isUnitAllSelected ? 'text-orange-700 dark:text-orange-400' : 'text-slate-600 dark:text-slate-400'}`}>
                              All Unit {unit} Topics
                            </span>
                          </button>
                          {(topics as string[]).map(topic => {
                            const isSelected = selectedTopics.includes(topic);
                            return (
                              <button
                                key={topic}
                                onClick={() => setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic])}
                                className={`flex items-start text-left gap-3 p-3 rounded-xl border transition-all ${
                                  isSelected ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-500/50 shadow-sm' :
                                  'bg-slate-50 dark:bg-dark-950 border-slate-200 dark:border-white/5 hover:border-orange-500/30'
                                }`}
                              >
                                <div className={`mt-0.5 min-w-4 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                  isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-dark-900'
                                }`}>
                                  {isSelected && <svg viewBox="0 0 14 14" fill="none" className="w-2.5 h-2.5"><path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                </div>
                                <span className={`text-xs font-medium leading-relaxed ${isSelected ? 'text-orange-700 dark:text-orange-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                  {topic}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
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
                          <p className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">Negative Marking</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-widest opacity-60">Deducts 1/4 mark / error</p>
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
                          <p className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">Practice Mode</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-widest opacity-60">Instant Answer Validation</p>
                        </div>
                      </div>
                      <div className={`w-11 h-6 rounded-full relative transition-colors ${isPracticeMode ? 'bg-orange-600' : 'bg-slate-200 dark:bg-slate-800'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${isPracticeMode ? 'right-1 bg-white shadow-sm' : 'left-1 bg-slate-400 dark:bg-slate-600'}`} />
                      </div>
                    </button>
                  </div>
                )}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-semibold text-sm tracking-tight shadow-xl shadow-orange-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 border-none"
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
