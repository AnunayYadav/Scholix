import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  HelpCircle, 
  Award, 
  Search, 
  Check, 
  X, 
  Play,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { ExamPaper, ExamCategory, QuizQuestion } from '../../types.ts';
import CustomDropdown, { DropdownOption } from './CustomDropdown.tsx';
import EmptyExamState from './EmptyExamState.tsx';
import { getSubjectCurriculum } from '../../data/subjectCatalog.ts';

interface SubjectWithSyllabus {
  id: string;
  name: string;
  syllabus: any;
}

interface OfficialExamPapersExplorerProps {
  subjects: SubjectWithSyllabus[];
  selectedSubject: SubjectWithSyllabus | null;
  onSelectSubject: (subject: SubjectWithSyllabus) => void;
  examPapers: ExamPaper[];
  subjectQuestions?: QuizQuestion[];
  isLoading: boolean;
  onStartExamPaper: (
    paper: ExamPaper,
    isPractice?: boolean,
    options?: { includeMCQ?: boolean; includeSubjective?: boolean }
  ) => void;
  onSwitchToCustomBuilder: () => void;
  onBackToDashboard?: () => void;
}

export const OfficialExamPapersExplorer: React.FC<OfficialExamPapersExplorerProps> = ({
  subjects,
  selectedSubject,
  onSelectSubject,
  examPapers,
  subjectQuestions = [],
  isLoading,
  onStartExamPaper,
  onSwitchToCustomBuilder,
  onBackToDashboard
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePaperModal, setActivePaperModal] = useState<ExamPaper | null>(null);

  // Question type selection for Practice Papers modal
  const [includeMCQ, setIncludeMCQ] = useState(true);
  const [includeSubjective, setIncludeSubjective] = useState(true);

  // Available years from papers or defaults
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    examPapers.forEach(p => {
      if (p.year && p.year > 0) {
        yearsSet.add(String(p.year));
      } else {
        yearsSet.add('NA');
      }
    });
    const list = Array.from(yearsSet).sort((a, b) => {
      if (a === 'NA') return 1;
      if (b === 'NA') return -1;
      return Number(b) - Number(a);
    });
    return list.length > 0 ? list : ['2026', '2025', '2024', '2023', '2022', 'NA'];
  }, [examPapers]);

  // Filtered papers with natural collation sorting
  const filteredPapers = useMemo(() => {
    const list = examPapers.filter(paper => {
      const matchCat = selectedCategory === 'all' || 
        (selectedCategory === 'practice' && paper.exam_type === 'practice') ||
        paper.exam_type === selectedCategory;
      const paperYearStr = paper.year && paper.year > 0 ? String(paper.year) : 'NA';
      const matchYear = selectedYear === 'all' || paperYearStr === selectedYear;
      const matchSearch = !searchQuery || 
        paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.subject_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (paper.term && paper.term.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchYear && matchSearch;
    });

    return list.sort((a, b) => {
      return (a.title || '').localeCompare(b.title || '', undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [examPapers, selectedCategory, selectedYear, searchQuery]);

  // Helper to format date / term display
  const getPaperDisplayDetails = (paper: ExamPaper) => {
    const mainTitle = paper.title || `${paper.subject_code} ${paper.exam_type.toUpperCase()}`;
    const yearStr = paper.year && paper.year > 0 ? String(paper.year) : '';
    const dateSub = paper.term && yearStr ? `${paper.term} • ${yearStr}` : (paper.term || yearStr || 'Practice Paper');
    const typeLabel = paper.exam_type.toUpperCase();

    return {
      paperTag: paper.subject_code || 'Official Paper',
      mainTitle,
      dateSub,
      typeLabel,
      duration: paper.duration_minutes || (paper.exam_type === 'endterm' ? 120 : paper.exam_type === 'midterm' ? 60 : 45),
      marks: paper.total_marks || (paper.exam_type === 'endterm' ? 50 : 30),
      questionsCount: paper.total_questions || 20,
    };
  };

  // Determine MCQ / Subjective availability for active practice paper
  const activePaperStats = useMemo(() => {
    if (!activePaperModal || activePaperModal.exam_type !== 'practice') return null;

    const unitMatch = activePaperModal.term?.match(/(\d+)/) || activePaperModal.title.match(/Unit\s*(\d+)/i);
    const unitNum = unitMatch ? parseInt(unitMatch[1]) : undefined;

    const matchingQuestions = subjectQuestions?.filter(q => {
      if (unitNum) return Number(q.unit) === unitNum;
      return (q as any).paper_id === activePaperModal.id;
    }) || [];

    const mcqs = matchingQuestions.filter(q => q.type === 'mcq' || q.questionType === 'MCQ');
    const subjs = matchingQuestions.filter(q => q.type === 'subjective' || q.questionType === 'Subjective');

    const mcqCount = mcqs.length;
    const subjCount = subjs.length;

    return {
      mcqCount,
      subjCount,
      totalCount: mcqCount + subjCount,
      mcqMarks: mcqs.reduce((s, q) => s + (q.marks || 1), 0) || mcqCount * 1,
      subjMarks: subjs.reduce((s, q) => s + (q.marks || 10), 0) || subjCount * 10,
    };
  }, [activePaperModal, subjectQuestions]);

  // Sync selection when modal opens
  useEffect(() => {
    if (activePaperModal && activePaperModal.exam_type === 'practice') {
      if (activePaperStats) {
        if (activePaperStats.mcqCount > 0 && activePaperStats.subjCount === 0) {
          setIncludeMCQ(true);
          setIncludeSubjective(false);
        } else if (activePaperStats.mcqCount === 0 && activePaperStats.subjCount > 0) {
          setIncludeMCQ(false);
          setIncludeSubjective(true);
        } else {
          setIncludeMCQ(true);
          setIncludeSubjective(true);
        }
      } else {
        setIncludeMCQ(true);
        setIncludeSubjective(true);
      }
    }
  }, [activePaperModal, activePaperStats]);

  const modalDuration = useMemo(() => {
    if (!activePaperModal) return 45;
    if (activePaperModal.exam_type !== 'practice') {
      return activePaperModal.duration_minutes || (activePaperModal.exam_type === 'endterm' ? 120 : 60);
    }
    if (includeMCQ && includeSubjective) return 60;
    return 45;
  }, [activePaperModal, includeMCQ, includeSubjective]);

  const modalQuestionsCount = useMemo(() => {
    if (!activePaperModal) return 0;
    if (activePaperModal.exam_type !== 'practice' || !activePaperStats) {
      return activePaperModal.total_questions || 20;
    }
    let c = 0;
    if (includeMCQ) c += activePaperStats.mcqCount;
    if (includeSubjective) c += activePaperStats.subjCount;
    return c || activePaperModal.total_questions || 0;
  }, [activePaperModal, activePaperStats, includeMCQ, includeSubjective]);

  const modalTotalMarks = useMemo(() => {
    if (!activePaperModal) return 0;
    if (activePaperModal.exam_type !== 'practice' || !activePaperStats) {
      return activePaperModal.total_marks || 30;
    }
    let m = 0;
    if (includeMCQ) m += activePaperStats.mcqMarks;
    if (includeSubjective) m += activePaperStats.subjMarks;
    return m || activePaperModal.total_marks || 0;
  }, [activePaperModal, activePaperStats, includeMCQ, includeSubjective]);

  const subjectOptions: DropdownOption[] = useMemo(() => {
    return subjects.map(s => {
      let label = s.name;
      if (!label.includes(':') && !label.includes('—')) {
        const cat = getSubjectCurriculum(label);
        if (cat?.name) {
          const match = label.match(/^[A-Za-z]+[\s-]*\d+/);
          const code = match ? match[0].replace(/[\s-]+/g, '').toUpperCase() : label.trim().toUpperCase();
          label = `${code}: ${cat.name}`;
        }
      }
      return {
        value: s.id,
        label,
      };
    });
  }, [subjects]);

  const categoryOptions: DropdownOption[] = [
    { value: 'all', label: 'All Exam Types' },
    { value: 'endterm', label: 'End-Term Exams' },
    { value: 'midterm', label: 'Mid-Term Exams' },
    { value: 'ca1', label: 'Quiz 1 / CA-1' },
    { value: 'ca2', label: 'Quiz 2 / CA-2' },
    { value: 'ca3', label: 'Quiz 3 / CA-3' },
    { value: 'practice', label: 'Practice Questions' },
  ];

  const yearOptions: DropdownOption[] = [
    { value: 'all', label: 'All Years' },
    ...availableYears.map(yr => ({ value: String(yr), label: String(yr) })),
  ];

  return (
    <div className="w-full space-y-6 animate-fade-in pb-12">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              type="button"
              onClick={onBackToDashboard}
              className="w-9 h-9 rounded-xl bg-white dark:bg-[#17171a] border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-300 transition-all flex items-center justify-center cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white tracking-tight">
              Official Question Papers
            </h1>
            <p className="text-xs text-zinc-400 font-medium">
              Year-wise past exam papers and practice bundles
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSwitchToCustomBuilder}
          className="h-9 px-3.5 rounded-xl bg-white dark:bg-[#17171a] border border-zinc-200/80 dark:border-zinc-800/80 hover:border-brand-primary/40 text-zinc-700 dark:text-zinc-300 hover:text-brand-primary text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-brand-primary" />
          <span>Custom Builder</span>
        </button>
      </div>

      {/* Styled Filters Bar: 4-column layout */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#17171a] border border-zinc-200/80 dark:border-zinc-800/80">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Select Course */}
          <div className="col-span-2 lg:col-span-1">
            <CustomDropdown
              label="Select Course"
              value={selectedSubject?.id || ''}
              options={subjectOptions}
              onChange={(val) => {
                const sub = subjects.find(s => s.id === val);
                if (sub) onSelectSubject(sub);
              }}
              placeholder="Choose course..."
              searchPlaceholder="Search course code or title..."
              searchable={true}
            />
          </div>

          {/* Select Exam Type */}
          <div className="col-span-1">
            <CustomDropdown
              label="Exam Type"
              value={selectedCategory}
              options={categoryOptions}
              onChange={(val) => setSelectedCategory(val as ExamCategory)}
              searchable={false}
            />
          </div>

          {/* Select Year */}
          <div className="col-span-1">
            <CustomDropdown
              label="Year"
              value={selectedYear}
              options={yearOptions}
              onChange={(val) => setSelectedYear(val)}
              searchable={false}
            />
          </div>

          {/* Search Input */}
          <div className="col-span-2 lg:col-span-1 space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 block px-0.5">
              Search
            </label>
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-3 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter term or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8.5 pr-3.5 py-2.5 bg-zinc-50 dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl text-xs font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-brand-primary/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid of QP Bundle Cards */}
      {isLoading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-medium text-zinc-400">Loading authentic question papers...</p>
        </div>
      ) : filteredPapers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredPapers.map((paper, idx) => {
            const details = getPaperDisplayDetails(paper);
            const isPractice = paper.exam_type === 'practice';

            return (
              <motion.div
                key={paper.id || idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setActivePaperModal(paper)}
                className="p-3.5 rounded-xl bg-white dark:bg-[#17171a] border border-zinc-200/80 dark:border-zinc-800/80 hover:border-brand-primary/40 dark:hover:border-zinc-700 transition-all cursor-pointer flex flex-col justify-between group text-left"
              >
                {/* Top Tag & Type Badge */}
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 group-hover:text-brand-primary transition-colors">
                      <FileText className="w-3 h-3 text-zinc-400 group-hover:text-brand-primary transition-colors" />
                      <span className="text-[10px] font-semibold tracking-wide">
                        {details.paperTag}
                      </span>
                    </div>
                    <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                      isPractice
                        ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                        : 'bg-zinc-100 dark:bg-[#202025] text-zinc-600 dark:text-zinc-300 border-zinc-200/60 dark:border-zinc-700/60'
                    }`}>
                      {details.typeLabel}
                    </span>
                  </div>

                  {/* Main Title & Subtitle */}
                  <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-brand-primary transition-colors leading-snug line-clamp-2">
                    {details.mainTitle}
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-normal mt-0.5">
                    {details.dateSub}
                  </p>
                </div>

                {/* Footer specs with clean Lucide icons */}
                <div className="flex items-center justify-between pt-2 mt-2.5 border-t border-zinc-100 dark:border-zinc-800/60 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    {details.duration}m
                  </span>
                  <span className="flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-zinc-400" />
                    {details.questionsCount} Qs
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3 text-zinc-400" />
                    {details.marks}M
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <EmptyExamState
          courseName={selectedSubject?.name}
          category={selectedCategory}
          year={selectedYear}
          onResetFilters={() => {
            setSelectedCategory('all');
            setSelectedYear('all');
            setSearchQuery('');
          }}
          onCreateCustomTest={onSwitchToCustomBuilder}
        />
      )}

      {/* Paper Quick Info Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {activePaperModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
              style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
              onClick={() => setActivePaperModal(null)}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 10 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white dark:bg-[#17171a] border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                        {activePaperModal.exam_type.toUpperCase()} • {activePaperModal.year && activePaperModal.year > 0 ? activePaperModal.year : (activePaperModal.term || 'Practice')}
                      </span>
                      {activePaperModal.difficulty && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium uppercase tracking-wider bg-zinc-100 dark:bg-[#202025] text-zinc-500">
                          {activePaperModal.difficulty}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight leading-snug">
                      {activePaperModal.title}
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium">
                      {selectedSubject?.name || activePaperModal.subject_code}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActivePaperModal(null)}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-[#202025] hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Practice Paper Question Type Selector */}
                {activePaperModal.exam_type === 'practice' && (
                  <div className="space-y-2 p-3 rounded-2xl bg-zinc-50 dark:bg-[#121215] border border-zinc-200/70 dark:border-zinc-800/80">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                        Question Types
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        {includeMCQ && includeSubjective ? 'All types selected' : includeMCQ ? 'Only MCQs' : 'Only Subjective'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* MCQ Option */}
                      <button
                        type="button"
                        disabled={activePaperStats ? activePaperStats.mcqCount === 0 : false}
                        onClick={() => {
                          if (includeMCQ && !includeSubjective) return;
                          setIncludeMCQ(!includeMCQ);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                          includeMCQ
                            ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary'
                            : 'bg-white dark:bg-[#17171a] border-zinc-200/60 dark:border-zinc-800/80 text-zinc-400 opacity-60 hover:opacity-100'
                        } ${activePaperStats && activePaperStats.mcqCount === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                      >
                        <div className="space-y-0.5">
                          <span className="font-semibold text-xs block">MCQ Practice</span>
                          <span className="text-[10px] opacity-80 block">
                            {activePaperStats ? `${activePaperStats.mcqCount} Questions` : 'MCQs'}
                          </span>
                        </div>
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors flex-shrink-0 ml-1 ${
                          includeMCQ ? 'bg-brand-primary text-white' : 'border border-zinc-300 dark:border-zinc-700'
                        }`}>
                          {includeMCQ && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </button>

                      {/* Subjective Option */}
                      <button
                        type="button"
                        disabled={activePaperStats ? activePaperStats.subjCount === 0 : false}
                        onClick={() => {
                          if (includeSubjective && !includeMCQ) return;
                          setIncludeSubjective(!includeSubjective);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                          includeSubjective
                            ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary'
                            : 'bg-white dark:bg-[#17171a] border-zinc-200/60 dark:border-zinc-800/80 text-zinc-400 opacity-60 hover:opacity-100'
                        } ${activePaperStats && activePaperStats.subjCount === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                      >
                        <div className="space-y-0.5">
                          <span className="font-semibold text-xs block">Subjective</span>
                          <span className="text-[10px] opacity-80 block">
                            {activePaperStats ? `${activePaperStats.subjCount} Questions` : 'Theory'}
                          </span>
                        </div>
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors flex-shrink-0 ml-1 ${
                          includeSubjective ? 'bg-brand-primary text-white' : 'border border-zinc-300 dark:border-zinc-700'
                        }`}>
                          {includeSubjective && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Specs Grid */}
                <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-zinc-50 dark:bg-[#121215] border border-zinc-200/70 dark:border-zinc-800/80 text-center">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Duration</span>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                      {modalDuration} mins
                    </p>
                  </div>
                  <div className="space-y-0.5 border-x border-zinc-200/60 dark:border-zinc-800/60">
                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Questions</span>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                      {modalQuestionsCount}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Total Marks</span>
                    <p className="text-sm font-bold text-emerald-500">
                      {modalTotalMarks}.00
                    </p>
                  </div>
                </div>

                {/* Exam Info Bullet Points */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#121215] border border-zinc-200/70 dark:border-zinc-800/80 space-y-2 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Interactive continuous scroll test environment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Switch between Exam Mode and Learning Mode anytime</span>
                  </div>
                </div>

                {/* Single Start Action Button */}
                <button
                  type="button"
                  disabled={activePaperModal.exam_type === 'practice' && !includeMCQ && !includeSubjective}
                  onClick={() => {
                    const paper = activePaperModal;
                    setActivePaperModal(null);
                    onStartExamPaper(paper, false, {
                      includeMCQ,
                      includeSubjective
                    });
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-40 text-white font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Test</span>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
};

export default OfficialExamPapersExplorer;
