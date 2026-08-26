import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ExamPaper, ExamCategory } from '../../types.ts';
import CustomDropdown, { DropdownOption } from './CustomDropdown.tsx';
import EmptyExamState from './EmptyExamState.tsx';

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
  isLoading: boolean;
  onStartExamPaper: (paper: ExamPaper, isPractice: boolean) => void;
  onSwitchToCustomBuilder: () => void;
  onBackToDashboard?: () => void;
}

export const OfficialExamPapersExplorer: React.FC<OfficialExamPapersExplorerProps> = ({
  subjects,
  selectedSubject,
  onSelectSubject,
  examPapers,
  isLoading,
  onStartExamPaper,
  onSwitchToCustomBuilder,
  onBackToDashboard
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePaperModal, setActivePaperModal] = useState<ExamPaper | null>(null);

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

  // Filtered papers
  const filteredPapers = useMemo(() => {
    return examPapers.filter(paper => {
      const matchCat = selectedCategory === 'all' || paper.exam_type === selectedCategory;
      const paperYearStr = paper.year && paper.year > 0 ? String(paper.year) : 'NA';
      const matchYear = selectedYear === 'all' || paperYearStr === selectedYear;
      const matchSearch = !searchQuery || 
        paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.subject_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (paper.term && paper.term.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchYear && matchSearch;
    });
  }, [examPapers, selectedCategory, selectedYear, searchQuery]);

  // Helper to format date / term display
  const getPaperDisplayDetails = (paper: ExamPaper, index: number) => {
    const mainTitle = paper.title || `${paper.subject_code} ${paper.exam_type.toUpperCase()}`;
    const yearStr = paper.year && paper.year > 0 ? String(paper.year) : 'NA';

    return {
      paperTag: paper.subject_code || 'Official Paper',
      mainTitle,
      dateSub: `${paper.term ? `${paper.term} • ` : ''}${yearStr}`,
      typeLabel: paper.exam_type.toUpperCase(),
      duration: paper.duration_minutes || (paper.exam_type === 'endterm' ? 120 : paper.exam_type === 'midterm' ? 60 : 45),
      marks: paper.total_marks || (paper.exam_type === 'endterm' ? 50 : 30),
      questionsCount: paper.total_questions || 20,
    };
  };

  const subjectOptions: DropdownOption[] = subjects.map(s => ({
    value: s.id,
    label: s.name,
  }));

  const categoryOptions: DropdownOption[] = [
    { value: 'all', label: 'All Exam Types' },
    { value: 'endterm', label: 'End-Term Exams' },
    { value: 'midterm', label: 'Mid-Term Exams' },
    { value: 'ca1', label: 'Quiz 1 / CA-1' },
    { value: 'ca2', label: 'Quiz 2 / CA-2' },
    { value: 'ca3', label: 'Quiz 3 / CA-3' },
    { value: 'mock', label: 'AI Mock Papers' },
  ];

  const yearOptions: DropdownOption[] = [
    { value: 'all', label: 'All Years' },
    ...availableYears.map(yr => ({ value: String(yr), label: String(yr) })),
  ];

  return (
    <div className="w-full space-y-6 animate-fade-in pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200/50 dark:border-white/5">
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              type="button"
              onClick={onBackToDashboard}
              className="p-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-orange-500/10 text-zinc-500 hover:text-orange-500 transition-colors cursor-pointer"
              title="Back to Dashboard"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Official <span className="text-orange-500">Question Papers</span>
            </h1>
            <p className="text-xs text-zinc-500 font-medium">
              Browse authentic year-wise past papers and test bundles
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSwitchToCustomBuilder}
          className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-orange-500/10 text-zinc-700 dark:text-zinc-300 hover:text-orange-500 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-orange-500">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          <span>Custom Quiz Builder</span>
        </button>
      </div>

      {/* Styled Dropdowns Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Select Course */}
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

        {/* Search */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block">
            Search
          </label>
          <input
            type="text"
            placeholder="Filter term or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-zinc-100 dark:bg-white/[0.04] rounded-xl text-xs font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
      </div>

      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 italic -mt-2">
        Tip: Select a course code to instantly view all authentic past exam bundles.
      </p>

      {/* Grid of QP Bundle Cards */}
      {isLoading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-zinc-400">Loading authentic question papers...</p>
        </div>
      ) : filteredPapers.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredPapers.map((paper, idx) => {
            const details = getPaperDisplayDetails(paper, idx);
            return (
              <motion.div
                key={paper.id || idx}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.02 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivePaperModal(paper)}
                className="p-3.5 rounded-2xl bg-zinc-100/70 dark:bg-white/[0.03] hover:bg-zinc-200/60 dark:hover:bg-white/[0.07] transition-all cursor-pointer flex flex-col justify-between min-h-[110px] group text-left"
              >
                {/* Top Tag & Type Badge */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 text-zinc-400 group-hover:text-orange-500 transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 group-hover:text-orange-500">
                      {details.paperTag}
                    </span>
                  </div>
                  <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-white/10 text-zinc-600 dark:text-zinc-300">
                    {details.typeLabel}
                  </span>
                </div>

                {/* Main Date / Title */}
                <div className="my-1.5">
                  <h4 className="text-sm font-black text-zinc-900 dark:text-white tracking-tight group-hover:text-orange-500 transition-colors leading-tight">
                    {details.mainTitle}
                  </h4>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                    {details.dateSub}
                  </p>
                </div>

                {/* Footer specs with clean SVG icons */}
                <div className="flex items-center justify-between pt-1.5 border-t border-zinc-200/50 dark:border-white/5 text-[9px] font-bold text-zinc-400">
                  <span className="flex items-center gap-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-2.5 h-2.5">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {details.duration}m
                  </span>
                  <span className="flex items-center gap-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-2.5 h-2.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    {details.questionsCount} Qs
                  </span>
                  <span className="flex items-center gap-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-2.5 h-2.5">
                      <circle cx="12" cy="8" r="7" />
                      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                    </svg>
                    {details.marks}M
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Empty State with Animated Vector Art */
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

      {/* Paper Quick Info Modal rendered into document.body to cover full viewport */}
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
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white dark:bg-[#131316] rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-500">
                        {activePaperModal.exam_type.toUpperCase()} • {activePaperModal.year && activePaperModal.year > 0 ? activePaperModal.year : 'NA'}
                      </span>
                      {activePaperModal.difficulty && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-white/5 text-zinc-500">
                          {activePaperModal.difficulty}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight leading-snug">
                      {activePaperModal.title}
                    </h3>
                    <p className="text-xs text-zinc-400 font-medium">
                      {selectedSubject?.name || activePaperModal.subject_code}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActivePaperModal(null)}
                    className="p-1.5 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-zinc-50 dark:bg-[#1a1a1e] text-center">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Duration</span>
                    <p className="text-sm font-black text-zinc-900 dark:text-white">
                      {activePaperModal.duration_minutes || (activePaperModal.exam_type === 'endterm' ? 120 : 60)} mins
                    </p>
                  </div>
                  <div className="space-y-0.5 border-x border-zinc-200/50 dark:border-white/5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Questions</span>
                    <p className="text-sm font-black text-zinc-900 dark:text-white">
                      {activePaperModal.total_questions || 40}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Marks</span>
                    <p className="text-sm font-black text-emerald-500">
                      {activePaperModal.total_marks || (activePaperModal.exam_type === 'endterm' ? 50 : 30)}.00
                    </p>
                  </div>
                </div>

                {/* Exam Info Bullet Points */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#1a1a1e] space-y-2 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Interactive continuous scroll test environment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Switch between <strong>Exam Mode</strong> and <strong>Learning Mode</strong> anytime</span>
                  </div>
                </div>

                {/* Single Start Action Button */}
                <button
                  type="button"
                  onClick={() => {
                    const paper = activePaperModal;
                    setActivePaperModal(null);
                    onStartExamPaper(paper, false);
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Start Test</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
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
