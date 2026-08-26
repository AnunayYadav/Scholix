import React, { useState, useEffect, useRef, useMemo } from 'react';
import { QuizQuestion, ExamPaper, UserProfile } from '../../types.ts';
import Editor from '@monaco-editor/react';
import jsPDF from 'jspdf';
import { showToast } from '../Toast.tsx';

export interface SubjectWithSyllabus {
  id?: string;
  name?: string;
  syllabusFile?: any;
}

interface ContinuousExamViewerProps {
  quizQuestions: QuizQuestion[];
  activeExamPaper: ExamPaper | null;
  selectedSubject: SubjectWithSyllabus | null;
  userAnswers: Record<number, any>;
  setUserAnswers: React.Dispatch<React.SetStateAction<Record<number, any>>>;
  currentQuestionIdx: number;
  setCurrentQuestionIdx: (idx: number) => void;
  visitedQuestions: Set<number>;
  setVisitedQuestions: React.Dispatch<React.SetStateAction<Set<number>>>;
  markedForReview: Set<number>;
  toggleMarkForReview: (idx: number) => void;
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  timerActive: boolean;
  setTimerActive: React.Dispatch<React.SetStateAction<boolean>>;
  formatTime: (seconds: number) => string;
  onCompleteExam: () => void;
  onExitExam?: () => void;
  onReportQuestion: (questionId: string) => void;
  bookmarkedIds: Set<string>;
  toggleBookmark: (questionId: string) => void;
  userProfile: UserProfile | null;
  parseText: (text: string) => React.ReactNode;
  runCode?: (isSubmit?: boolean) => void;
  currentCode?: string;
  setCurrentCode?: (code: string) => void;
  isExecuting?: boolean;
  executionOutput?: string;
  testResults?: any[];
  showStdin?: boolean;
  setShowStdin?: (show: boolean) => void;
  stdinValue?: string;
  setStdinValue?: (val: string) => void;
  resetCode?: () => void;
}

export const ContinuousExamViewer: React.FC<ContinuousExamViewerProps> = ({
  quizQuestions,
  activeExamPaper,
  selectedSubject,
  userAnswers,
  setUserAnswers,
  currentQuestionIdx,
  setCurrentQuestionIdx,
  visitedQuestions,
  setVisitedQuestions,
  markedForReview,
  toggleMarkForReview,
  timeLeft,
  setTimeLeft,
  timerActive,
  setTimerActive,
  formatTime,
  onCompleteExam,
  onExitExam = () => {},
  onReportQuestion,
  bookmarkedIds,
  toggleBookmark,
  userProfile,
  parseText,
  runCode = (_isSubmit?: boolean) => {},
  currentCode = '',
  setCurrentCode = (_code?: string) => {},
  isExecuting = false,
  executionOutput = '',
  testResults = [],
  showStdin = false,
  setShowStdin = (_show?: boolean) => {},
  stdinValue = '',
  setStdinValue = (_val?: string) => {},
  resetCode = () => {}
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<'cpp' | 'c' | 'python'>('cpp');
  // Mode: Exam Mode (Simulated strict test) vs Learning Mode (Instant solution review)
  const [examMode, setExamMode] = useState<'exam' | 'learning'>('exam');
  const [revealedSolutions, setRevealedSolutions] = useState<Set<number>>(new Set());
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [subjectiveInputs, setSubjectiveInputs] = useState<Record<number, string>>({});

  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Total Marks Calculation
  const totalExamMarks = useMemo(() => {
    if (activeExamPaper?.total_marks) return activeExamPaper.total_marks;
    return quizQuestions.reduce((acc, q) => acc + (q.marks || (q.type === 'subjective' ? 10 : 1)), 0);
  }, [activeExamPaper, quizQuestions]);

  // Subject and Paper Metadata
  const examName = activeExamPaper?.exam_type ? activeExamPaper.exam_type.toUpperCase() : 'Quiz 1';
  const subjectCode = selectedSubject?.name?.split(':')[0]?.trim() || activeExamPaper?.subject_code || 'General';
  const qpTitle = activeExamPaper?.term || activeExamPaper?.title || `${subjectCode} Exam Paper`;

  // Toggle Solution Visibility for a question
  const toggleSolution = (idx: number) => {
    setRevealedSolutions(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // Scroll to question
  const scrollToQuestion = (idx: number) => {
    setCurrentQuestionIdx(idx);
    setVisitedQuestions(prev => new Set(prev).add(idx));
    const targetEl = document.getElementById(`exam-question-${idx}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Answer handler
  const handleSelectOption = (qIdx: number, optionIdx: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [qIdx]: optionIdx
    }));
    setVisitedQuestions(prev => new Set(prev).add(qIdx));
  };

  // Subjective text handler
  const handleSubjectiveChange = (qIdx: number, text: string) => {
    setSubjectiveInputs(prev => ({
      ...prev,
      [qIdx]: text
    }));
    setUserAnswers(prev => ({
      ...prev,
      [qIdx]: text
    }));
    setVisitedQuestions(prev => new Set(prev).add(qIdx));
  };

  // Download question paper as PDF
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(`${subjectCode}: ${qpTitle}`, 20, 20);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Questions: ${quizQuestions.length} | Total Marks: ${totalExamMarks} | Duration: ${formatTime(timeLeft)}`, 20, 28);
      doc.line(20, 32, 190, 32);

      let yPos = 40;
      quizQuestions.forEach((q, idx) => {
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        const marksStr = `[${q.marks || (q.type === 'subjective' ? 10 : 1)} Marks]`;
        doc.text(`Q${idx + 1}. (${(q.type || 'MCQ').toUpperCase()}) ${marksStr}`, 20, yPos);
        yPos += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const splitText = doc.splitTextToSize(q.question.replace(/[*_`#]/g, ''), 170);
        doc.text(splitText, 20, yPos);
        yPos += splitText.length * 6 + 4;

        if (q.options && q.options.length > 0) {
          q.options.forEach((opt, optIdx) => {
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
            const optLetter = String.fromCharCode(65 + optIdx);
            doc.text(`${optLetter}) ${opt.replace(/[*_`#]/g, '')}`, 26, yPos);
            yPos += 6;
          });
          yPos += 4;
        }
      });

      doc.save(`${subjectCode}_${examName}_Paper.pdf`);
      showToast('Question paper PDF downloaded successfully!', 'success');
    } catch (e) {
      console.error('PDF generation error:', e);
      showToast('Failed to generate PDF', 'error');
    }
  };

  // Timer Pause / Resume
  const handleToggleTimer = () => {
    if (timerActive) {
      setTimerActive(false);
      setTimerPaused(true);
      showToast('Timer Paused', 'info');
    } else {
      setTimerActive(true);
      setTimerPaused(false);
      showToast('Timer Resumed', 'info');
    }
  };

  // Timer Reset
  const handleResetTimer = () => {
    if (activeExamPaper?.duration_minutes) {
      setTimeLeft(activeExamPaper.duration_minutes * 60);
    } else {
      setTimeLeft(60 * 60);
    }
    setTimerPaused(false);
    setTimerActive(true);
    showToast('Timer Reset', 'info');
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6 py-4 animate-fade-in text-zinc-900 dark:text-white">
      
      {/* 2-Column Responsive Layout: Left Sidebar Controls + Right Scrollable Question Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ══════════════════════════════════════════════════════════════════════════
            LEFT SIDEBAR (STICKY CONTROL PANEL)
            ══════════════════════════════════════════════════════════════════════════ */}
        <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-4 space-y-3.5 max-h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar">
          
          {/* 1. Exam Info Card */}
          <div className="p-4 rounded-2xl bg-zinc-100/70 dark:bg-[#131316] shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs pb-1">
              <span className="text-zinc-500 font-medium">Exam :</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">{examName}</span>
            </div>
            <div className="flex items-center justify-between text-xs pb-1">
              <span className="text-zinc-500 font-medium">Subject :</span>
              <span className="font-bold text-orange-500">{subjectCode}</span>
            </div>
            <div className="flex items-center justify-between text-xs pb-1">
              <span className="text-zinc-500 font-medium">Total Marks :</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">{totalExamMarks}.00</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-medium">QP :</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 text-right truncate max-w-[160px]" title={qpTitle}>
                {qpTitle}
              </span>
            </div>
          </div>

          {/* 2. Mode Selector (Exam Mode vs Learning Mode) */}
          <div className="p-1 rounded-xl bg-zinc-100/80 dark:bg-[#131316] grid grid-cols-2 gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setExamMode('exam')}
              className={`py-2 px-3 rounded-lg transition-all text-center cursor-pointer ${
                examMode === 'exam'
                  ? 'bg-white dark:bg-[#202024] text-orange-500 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              Exam Mode
            </button>
            <button
              type="button"
              onClick={() => setExamMode('learning')}
              className={`py-2 px-3 rounded-lg transition-all text-center cursor-pointer ${
                examMode === 'learning'
                  ? 'bg-white dark:bg-[#202024] text-orange-500 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              Learning Mode
            </button>
          </div>

          {/* 3. Question Menu / Navigation Palette */}
          <div className="p-4 rounded-2xl bg-zinc-100/70 dark:bg-[#131316] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Question Menu
              </span>
              <span className="text-[10px] font-bold text-emerald-500">
                {Object.keys(userAnswers).length} / {quizQuestions.length} Answered
              </span>
            </div>

            {/* Questions Grid */}
            <div className="grid grid-cols-6 gap-2">
              {quizQuestions.map((q, idx) => {
                const isAnswered = userAnswers[idx] !== undefined && userAnswers[idx] !== '';
                const isCurrent = currentQuestionIdx === idx;
                const isMarked = markedForReview.has(idx);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => scrollToQuestion(idx)}
                    className={`h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all cursor-pointer relative ${
                      isCurrent
                        ? 'ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-[#131316] scale-105 z-10'
                        : ''
                    } ${
                      isAnswered
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                        : isMarked
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-white dark:bg-[#202024] text-zinc-700 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-[#28282e]'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Timer Card */}
          <div className="p-4 rounded-2xl bg-zinc-100/70 dark:bg-[#131316] shadow-sm space-y-2 text-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
              Timer
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className={`text-2xl font-black tabular-nums tracking-wider ${
                timeLeft < 180 ? 'text-red-500 animate-pulse' : 'text-zinc-900 dark:text-white'
              }`}>
                {formatTime(timeLeft)}
              </span>

              {/* Pause / Play */}
              <button
                type="button"
                onClick={handleToggleTimer}
                className="p-2 rounded-xl bg-white dark:bg-[#202024] hover:bg-orange-500/10 text-zinc-600 dark:text-zinc-400 hover:text-orange-500 transition-colors cursor-pointer"
                title={!timerActive ? 'Resume Timer' : 'Pause Timer'}
              >
                {!timerActive ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-emerald-500">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                )}
              </button>

              {/* Reset */}
              <button
                type="button"
                onClick={handleResetTimer}
                className="p-2 rounded-xl bg-white dark:bg-[#202024] hover:bg-orange-500/10 text-zinc-600 dark:text-zinc-400 hover:text-orange-500 transition-colors cursor-pointer"
                title="Reset Timer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
              </button>
            </div>
          </div>

          {/* 5. Controls / Submit Exam & Exit Exam */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={onCompleteExam}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Submit Exam</span>
            </button>

            <button
              type="button"
              onClick={onExitExam}
              className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-[#18181c] hover:bg-red-500/10 dark:hover:bg-red-500/10 text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Exit Exam</span>
            </button>
          </div>
        </aside>

        {/* ══════════════════════════════════════════════════════════════════════════
            RIGHT MAIN CONTENT (CONTINUOUS SCROLLABLE QUESTIONS FEED)
            ══════════════════════════════════════════════════════════════════════════ */}
        <main className="lg:col-span-8 xl:col-span-9 space-y-6 pb-24">
          
          {quizQuestions.map((q, idx) => {
            const isSubjective = q.type === 'subjective';
            const isCoding = q.type === 'coding';
            const isAnswered = userAnswers[idx] !== undefined && userAnswers[idx] !== '';
            
            // In Learning Mode: Show solution ONLY IF question is answered OR user clicked "View Solutions"
            // In Exam Mode: Show solution ONLY IF user clicked "View Solutions"
            const isSolutionVisible = revealedSolutions.has(idx) || (examMode === 'learning' && isAnswered);
            
            const questionMarks = q.marks || (isSubjective ? 10 : 1);
            const questionTypeLabel = isCoding ? 'Coding' : isSubjective ? 'Subjective' : (q.questionType || 'MCQ');

            return (
              <div
                key={idx}
                id={`exam-question-${idx}`}
                ref={el => (questionRefs.current[idx] = el)}
                className="p-6 md:p-8 rounded-3xl bg-zinc-100/70 dark:bg-[#131316] shadow-sm space-y-6 scroll-mt-6 transition-all"
              >
                
                {/* Question Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <h3 className="text-base font-black text-zinc-900 dark:text-white tracking-tight">
                      Question {idx + 1}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* View Solutions Button */}
                    <button
                      type="button"
                      onClick={() => toggleSolution(idx)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSolutionVisible
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-white dark:bg-[#202024] hover:bg-zinc-200 dark:hover:bg-[#28282e] text-zinc-600 dark:text-zinc-300'
                      }`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                        <circle cx="12" cy="12" r="10" />
                        <polygon points="12 8 8 12 12 16 12 8" />
                      </svg>
                      <span>View Solutions ({isSolutionVisible ? '1' : '0'})</span>
                    </button>

                    {/* Marks & Type Badge */}
                    <span className="text-[11px] font-medium text-zinc-400 bg-white dark:bg-[#1a1a1e] px-2.5 py-1 rounded-lg">
                      Total Mark : <strong className="text-zinc-700 dark:text-zinc-200">{questionMarks}.00</strong> | Type : <strong className="text-orange-500 uppercase">{questionTypeLabel}</strong>
                    </span>
                  </div>
                </div>

                {/* Question Description Body */}
                <div className="text-sm md:text-base font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed space-y-3">
                  {parseText(q.question)}
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    ANSWER INPUT SECTION
                    ═══════════════════════════════════════════════════════════════ */}
                
                {/* 1. MCQ Radio Options */}
                {!isSubjective && !isCoding && q.options && q.options.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Options :
                    </span>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = userAnswers[idx] === optIdx;
                        const isCorrectAnswer = optIdx === q.correctAnswer;
                        const showFeedback = isSolutionVisible;

                        let cardStyle = "bg-white dark:bg-[#1c1c20] hover:bg-zinc-200/70 dark:hover:bg-[#25252a] text-zinc-800 dark:text-zinc-200";
                        if (isSelected && !showFeedback) {
                          cardStyle = "bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/40";
                        } else if (showFeedback) {
                          if (isCorrectAnswer) cardStyle = "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/40";
                          else if (isSelected && !isCorrectAnswer) cardStyle = "bg-red-500/10 text-red-400 ring-1 ring-red-500/40";
                          else cardStyle = "bg-white/60 dark:bg-[#18181c]/60 text-zinc-500";
                        }

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectOption(idx, optIdx)}
                            className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center gap-3.5 group ${cardStyle}`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              showFeedback && isCorrectAnswer
                                ? 'border-emerald-500'
                                : showFeedback && isSelected && !isCorrectAnswer
                                ? 'border-red-500'
                                : isSelected
                                ? 'border-orange-500'
                                : 'border-zinc-400 dark:border-zinc-600 group-hover:border-orange-400'
                            }`}>
                              {showFeedback && isCorrectAnswer ? (
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              ) : showFeedback && isSelected && !isCorrectAnswer ? (
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                              ) : isSelected ? (
                                <div className="w-2 h-2 rounded-full bg-orange-500" />
                              ) : null}
                            </div>

                            <span className="text-xs md:text-sm font-medium leading-normal flex-1">
                              {parseText(opt)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Subjective Answer Writing Box */}
                {isSubjective && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                        Write Your Answer / Explanation :
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {subjectiveInputs[idx]?.length || 0} characters
                      </span>
                    </div>

                    <textarea
                      rows={5}
                      value={subjectiveInputs[idx] || ''}
                      onChange={e => handleSubjectiveChange(idx, e.target.value)}
                      placeholder="Type your structured solution, steps, formulas or explanation here..."
                      className="w-full p-4 rounded-2xl bg-white dark:bg-[#1c1c20] text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-zinc-500 text-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                )}

                {/* 3. Coding Editor Box */}
                {isCoding && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between px-4 py-2 bg-zinc-200 dark:bg-[#202024] rounded-t-2xl text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span className="text-zinc-600 dark:text-zinc-300">Code Editor ({currentLanguage.toUpperCase()})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => runCode(false)}
                          disabled={isExecuting}
                          className="px-3 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[11px] transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isExecuting ? 'Running...' : 'Run Code'}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-b-2xl overflow-hidden bg-[#1e1e1e]">
                      <Editor
                        height="280px"
                        language={currentLanguage === 'cpp' ? 'cpp' : currentLanguage === 'c' ? 'c' : 'python'}
                        theme="vs-dark"
                        value={currentCode}
                        onChange={val => setCurrentCode(val || '')}
                        options={{
                          fontSize: 13,
                          minimap: { enabled: false },
                          padding: { top: 12, bottom: 12 },
                          fontFamily: 'JetBrains Mono, Menlo, monospace',
                          scrollBeyondLastLine: false,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Model Solution & Evaluation Parameters Box */}
                {isSolutionVisible && q.explanation && (
                  <div className="p-5 rounded-2xl bg-emerald-500/10 space-y-2 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
                        Model Solution & Insights
                      </h4>
                    </div>
                    <div className="text-xs md:text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed pl-4 border-l-2 border-emerald-500/50">
                      {parseText(q.explanation)}
                    </div>
                  </div>
                )}

                {/* Question Footer Action Bar */}
                <div className="flex items-center justify-between pt-3 text-xs text-zinc-400 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg hover:bg-white dark:hover:bg-[#202024] transition-colors flex items-center gap-1.5 cursor-pointer text-zinc-500"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span>Discussions (0)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onReportQuestion(q.id || '')}
                      className="px-2.5 py-1 rounded-lg hover:bg-blue-500/10 hover:text-blue-500 transition-colors flex items-center gap-1.5 cursor-pointer text-blue-500/80"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      <span>Suggest Correction</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onReportQuestion(q.id || '')}
                      className="px-2.5 py-1 rounded-lg hover:bg-orange-500/10 hover:text-orange-500 transition-colors flex items-center gap-1.5 cursor-pointer text-orange-500/80"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <span>Broken Format?</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleBookmark(q.id || '')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        bookmarkedIds.has(q.id || '')
                          ? 'text-orange-500 bg-orange-500/10'
                          : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                      }`}
                      title={bookmarkedIds.has(q.id || '') ? 'Remove Bookmark' : 'Bookmark Question'}
                    >
                      <svg viewBox="0 0 24 24" fill={bookmarkedIds.has(q.id || '') ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </main>
      </div>
    </div>
  );
};

export default ContinuousExamViewer;
