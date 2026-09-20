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
  BookOpen,
  Folder,
  ArrowRight
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
    <div className="w-full space-y-5 animate-fade-in pb-12">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              type="button"
              onClick={onBackToDashboard}
              className="w-8 h-8 rounded-full border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center justify-center cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white tracking-tight">
              Official Question Papers
            </h1>
            <p className="text-xs text-zinc-400 font-normal">
              Year-wise past exam papers and unit practice sets
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSwitchToCustomBuilder}
          className="h-8 px-3.5 rounded-full border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <BookOpen className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
          <span>Custom Builder</span>
        </button>
      </div>

      {/* Styled Filters Bar */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-white/[0.08] shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Select Course */}
          <CustomDropdown
            label="Course"
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

          {/* Select Exam Type */}
          <CustomDropdown
            label="Exam Type"
            value={selectedCategory}
            options={categoryOptions}
            onChange={(val) => setSelectedCategory(val as ExamCategory)}
            searchable={false}
          />

          {/* Select Year */}
          <CustomDropdown
            label="Year"
            value={selectedYear}
            options={yearOptions}
            onChange={(val) => setSelectedYear(val)}
            searchable={false}
          />

          {/* Search Input */}
          <div className="space-y-1.5">
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
                className="w-full pl-8.5 pr-3.5 py-2.5 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/[0.08] rounded-xl text-xs font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-white/20 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Unified Archive List */}
      {isLoading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-7 h-7 border-2 border-zinc-400 dark:border-white/40 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-medium text-zinc-400">Loading authentic question papers...</p>
        </div>
      ) : filteredPapers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredPapers.map((paper, idx) => {
            const details = getPaperDisplayDetails(paper);
            const isPractice = paper.exam_type === 'practice';

            return (
              <motion.div
                key={paper.id || idx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                whileHover={{ y: -2 }}
                onClick={() => setActivePaperModal(paper)}
                className="p-4 rounded-2xl bg-white dark:bg-[#131316] border border-zinc-200/80 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-white/20 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group text-left"
              >
                <div>
                  {/* Top: Icon Badge + Metadata on left, Monochromatic Circular Badge on right */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200/60 dark:border-white/[0.06] flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors flex-shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                          {details.paperTag}
                        </span>
                        {details.dateSub && (
                          <>
                            <span className="text-zinc-300 dark:text-zinc-600">•</span>
                            <span className="text-xs text-zinc-400 font-normal truncate">
                              {details.dateSub}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="text-[9.5px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-white/[0.06] flex-shrink-0">
                      {details.typeLabel}
                    </span>
                  </div>

                  {/* Main Title */}
                  <h4 className="text-[13px] sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors leading-snug line-clamp-2 mt-1">
                    {details.mainTitle}
                  </h4>
                </div>

                {/* Bottom Section: Inline Specs & Small Begin Exam Button */}
                <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-white/[0.05] flex items-center justify-between gap-2">
                  {/* Compact Specs */}
                  <div className="flex items-center gap-1.5 text-[10.5px] text-zinc-400 font-medium whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                      {details.duration}m
                    </span>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                      {details.questionsCount} Qs
                    </span>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                      {details.marks}M
                    </span>
                  </div>

                  {/* Small Begin Exam Button */}
                  <button
                    type="button"
                    className="px-3 py-1 rounded-full text-[11px] font-medium bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 group-hover:opacity-90 transition-all flex items-center gap-1 shadow-2xs flex-shrink-0 whitespace-nowrap cursor-pointer"
                  >
                    <span>Begin Exam</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                  </button>
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
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
              onClick={() => setActivePaperModal(null)}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 10 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-white/[0.08] rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-white/[0.06]">
                        {activePaperModal.exam_type.toUpperCase()} • {activePaperModal.year && activePaperModal.year > 0 ? activePaperModal.year : (activePaperModal.term || 'Practice')}
                      </span>
                      {activePaperModal.difficulty && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-zinc-100 dark:bg-white/[0.06] text-zinc-500 border border-zinc-200/60 dark:border-white/[0.06]">
                          {activePaperModal.difficulty}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white tracking-tight leading-snug">
                      {activePaperModal.title}
                    </h3>
                    <p className="text-xs text-zinc-400 font-normal">
                      {selectedSubject?.name || activePaperModal.subject_code}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActivePaperModal(null)}
                    className="w-8 h-8 rounded-full border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Practice Paper Question Type Selector */}
                {activePaperModal.exam_type === 'practice' && (
                  <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/70 dark:border-white/[0.06]">
                    <div className="flex items-center justify-between px-0.5">
                      <span className="text-[11px] font-medium text-zinc-500">
                        Included Question Types
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {includeMCQ && includeSubjective ? 'All types' : includeMCQ ? 'Only MCQs' : 'Only Subjective'}
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
                        className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                          includeMCQ
                            ? 'bg-zinc-100 dark:bg-white/[0.08] border-zinc-300 dark:border-white/20 text-zinc-900 dark:text-white font-medium'
                            : 'bg-white dark:bg-white/[0.02] border-zinc-200/60 dark:border-white/[0.06] text-zinc-400 opacity-60 hover:opacity-100'
                        } ${activePaperStats && activePaperStats.mcqCount === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs block font-medium">MCQ Practice</span>
                          <span className="text-[10px] text-zinc-400 block">
                            {activePaperStats ? `${activePaperStats.mcqCount} Questions` : 'MCQs'}
                          </span>
                        </div>
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors flex-shrink-0 ml-1 ${
                          includeMCQ ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'border border-zinc-300 dark:border-zinc-700'
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
                        className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                          includeSubjective
                            ? 'bg-zinc-100 dark:bg-white/[0.08] border-zinc-300 dark:border-white/20 text-zinc-900 dark:text-white font-medium'
                            : 'bg-white dark:bg-white/[0.02] border-zinc-200/60 dark:border-white/[0.06] text-zinc-400 opacity-60 hover:opacity-100'
                        } ${activePaperStats && activePaperStats.subjCount === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs block font-medium">Subjective</span>
                          <span className="text-[10px] text-zinc-400 block">
                            {activePaperStats ? `${activePaperStats.subjCount} Questions` : 'Theory'}
                          </span>
                        </div>
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors flex-shrink-0 ml-1 ${
                          includeSubjective ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'border border-zinc-300 dark:border-zinc-700'
                        }`}>
                          {includeSubjective && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Specs Strip */}
                <div className="py-3 px-4 rounded-2xl border border-zinc-200/80 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.02] flex items-center justify-around text-center">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Duration</span>
                    <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white">
                      {modalDuration} mins
                    </p>
                  </div>
                  <div className="h-6 w-px bg-zinc-200 dark:bg-white/10" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Questions</span>
                    <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white">
                      {modalQuestionsCount}
                    </p>
                  </div>
                  <div className="h-6 w-px bg-zinc-200 dark:bg-white/10" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Total Marks</span>
                    <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {modalTotalMarks}.00
                    </p>
                  </div>
                </div>

                {/* Exam Info Bullet Points */}
                <div className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-normal px-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                    <span>Interactive continuous scroll test environment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                    <span>Toggle between Exam Mode and Learning Mode anytime</span>
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
                  className="w-full py-3 px-4 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 disabled:opacity-40 font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Assessment</span>
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
