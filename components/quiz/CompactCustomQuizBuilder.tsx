import React from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import CustomDropdown, { DropdownOption } from './CustomDropdown.tsx';
import { getSubjectCurriculum } from '../../data/subjectCatalog.ts';

interface SubjectWithSyllabus {
  id: string;
  name: string;
  syllabus: any;
}

interface CompactCustomQuizBuilderProps {
  subjects: SubjectWithSyllabus[];
  selectedSubject: SubjectWithSyllabus | null;
  onSelectSubject: (subject: SubjectWithSyllabus) => void;
  availableUnits: number[];
  selectedUnits: number[];
  onToggleUnit: (unit: number) => void;
  onSelectAllUnits: () => void;
  selectedDifficulties: string[];
  onToggleDifficulty: (difficulty: string) => void;
  numMCQ: number;
  setNumMCQ: (n: number) => void;
  hasMCQs: boolean;
  numSubjective: number;
  setNumSubjective: (n: number) => void;
  hasSubjective: boolean;
  numCoding: number;
  setNumCoding: (n: number) => void;
  hasCoding: boolean;
  timerMinutes: number;
  setTimerMinutes: (m: number) => void;
  isPracticeMode: boolean;
  setIsPracticeMode: (p: boolean) => void;
  negativeMarking: boolean;
  setNegativeMarking: (n: boolean) => void;
  includeSolved: boolean;
  setIncludeSolved: (s: boolean) => void;
  solvedCount: number;
  availableTopicsByUnit?: Record<number, string[]>;
  selectedTopics?: string[];
  onToggleTopic?: (topic: string) => void;
  onClearTopics?: () => void;
  showTopics?: boolean;
  setShowTopics?: (show: boolean) => void;
  onStartQuiz: () => void;
  onSwitchToOfficialPapers?: () => void;
  onBackToDashboard?: () => void;
  isLoading: boolean;
  maxSubjectMCQs?: number;
}

export const CompactCustomQuizBuilder: React.FC<CompactCustomQuizBuilderProps> = ({
  subjects,
  selectedSubject,
  onSelectSubject,
  availableUnits,
  selectedUnits,
  onToggleUnit,
  onSelectAllUnits,
  selectedDifficulties,
  onToggleDifficulty,
  numMCQ,
  setNumMCQ,
  hasMCQs,
  numSubjective,
  setNumSubjective,
  hasSubjective,
  numCoding,
  setNumCoding,
  hasCoding,
  timerMinutes,
  setTimerMinutes,
  isPracticeMode,
  setIsPracticeMode,
  negativeMarking,
  setNegativeMarking,
  includeSolved,
  setIncludeSolved,
  solvedCount,
  onStartQuiz,
  onSwitchToOfficialPapers,
  onBackToDashboard,
  isLoading,
}) => {
  const allUnitsSelected = availableUnits.length > 0 && availableUnits.every(u => selectedUnits.includes(u));
  const totalSelectedQuestions = (hasMCQs ? numMCQ : 0) + (hasSubjective ? numSubjective : 0) + (hasCoding ? numCoding : 0);

  const subjectOptions: DropdownOption[] = React.useMemo(() => {
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

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 animate-fade-in pb-12">
      
      {/* Top Header */}
      <div className="flex items-center gap-3 pt-1">
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
            Custom Assessment
          </h1>
          <p className="text-xs text-zinc-400">Configure parameters for a personalized test</p>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#17171a] border border-zinc-200/80 dark:border-zinc-800/80 space-y-4.5">
        
        {/* 1. Course Dropdown */}
        <CustomDropdown
          label="Course"
          value={selectedSubject?.id || ''}
          options={subjectOptions}
          onChange={(val) => {
            const sub = subjects.find(s => s.id === val);
            if (sub) onSelectSubject(sub);
          }}
          placeholder="Select course..."
          searchPlaceholder="Search course code or title..."
          searchable={true}
        />

        {/* 2. Units Selector - Compact Segmented Chips */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 block px-0.5">
              Target Units
            </label>
            <button
              type="button"
              onClick={onSelectAllUnits}
              className="text-[11px] font-medium text-brand-primary hover:underline cursor-pointer"
            >
              {allUnitsSelected ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {[1, 2, 3, 4, 5, 6].map(u => {
              const isAvailable = availableUnits.includes(u);
              const isSelected = selectedUnits.includes(u);

              return (
                <button
                  key={u}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => onToggleUnit(u)}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-all text-center cursor-pointer border ${
                    !isAvailable
                      ? 'opacity-30 bg-zinc-50 dark:bg-zinc-800/20 border-zinc-200/40 dark:border-zinc-800/40 text-zinc-400 cursor-not-allowed'
                      : isSelected
                        ? 'bg-brand-primary text-white border-brand-primary shadow-xs'
                        : 'bg-zinc-50 dark:bg-[#202025] border-zinc-200/80 dark:border-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  Unit {u}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Difficulty Level - Apple Segmented Bar */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 block px-0.5">
            Difficulty
          </label>
          <div className="bg-zinc-100 dark:bg-[#0c0c0e] p-1 rounded-xl flex gap-1 border border-zinc-200/60 dark:border-zinc-800/80">
            {[
              { id: 'easy', label: 'Easy (L1)', dot: 'bg-emerald-500' },
              { id: 'medium', label: 'Medium (L2)', dot: 'bg-amber-500' },
              { id: 'hard', label: 'Hard (L3)', dot: 'bg-rose-500' },
            ].map(lvl => {
              const isSelected = selectedDifficulties.includes(lvl.id);
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => onToggleDifficulty(lvl.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-[#202025] text-zinc-900 dark:text-white shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${lvl.dot}`} />
                  <span>{lvl.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Questions & Timer Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Question Count */}
          {hasMCQs && (
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#121215] border border-zinc-200/70 dark:border-zinc-800/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">MCQ Questions</span>
                <div className="flex items-center gap-1">
                  {[10, 20, 30].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setNumMCQ(cnt)}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                        numMCQ === cnt 
                          ? 'bg-brand-primary text-white' 
                          : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300/70 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                min="1"
                max="100"
                value={numMCQ}
                onChange={(e) => setNumMCQ(parseInt(e.target.value) || 0)}
                className="w-full px-2.5 py-1 bg-white dark:bg-[#17171a] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg text-xs font-semibold text-brand-primary focus:outline-none focus:border-brand-primary/50"
              />
            </div>
          )}

          {/* Time Limit */}
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#121215] border border-zinc-200/70 dark:border-zinc-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Timer (Minutes)</span>
              <div className="flex items-center gap-1">
                {[15, 30, 60].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setTimerMinutes(mins)}
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                      timerMinutes === mins 
                        ? 'bg-brand-primary text-white' 
                        : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300/70 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              min="1"
              max="180"
              value={timerMinutes}
              onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 0)}
              className="w-full px-2.5 py-1 bg-white dark:bg-[#17171a] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg text-xs font-semibold text-brand-primary focus:outline-none focus:border-brand-primary/50"
            />
          </div>
        </div>

        {/* 5. Apple Settings List (Toggles) */}
        <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#121215] divide-y divide-zinc-100 dark:divide-zinc-800/60 overflow-hidden">
          {/* Practice Mode */}
          <div 
            onClick={() => setIsPracticeMode(!isPracticeMode)}
            className="px-3.5 py-2.5 flex items-center justify-between cursor-pointer hover:bg-zinc-100/50 dark:hover:bg-[#1a1a1f] transition-colors"
          >
            <div>
              <span className="text-xs font-medium block text-zinc-900 dark:text-white">Practice Mode</span>
              <span className="text-[11px] text-zinc-400">Show instant answers and explanations after each question</span>
            </div>
            <div className={`w-8 h-4.5 rounded-full relative transition-colors flex-shrink-0 ml-3 ${isPracticeMode ? 'bg-brand-primary' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
              <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${isPracticeMode ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </div>

          {/* Negative Marking */}
          <div 
            onClick={() => setNegativeMarking(!negativeMarking)}
            className="px-3.5 py-2.5 flex items-center justify-between cursor-pointer hover:bg-zinc-100/50 dark:hover:bg-[#1a1a1f] transition-colors"
          >
            <div>
              <span className="text-xs font-medium block text-zinc-900 dark:text-white">Negative Marking</span>
              <span className="text-[11px] text-zinc-400">Apply -0.25 mark penalty for wrong answers</span>
            </div>
            <div className={`w-8 h-4.5 rounded-full relative transition-colors flex-shrink-0 ml-3 ${negativeMarking ? 'bg-rose-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
              <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${negativeMarking ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </div>

          {/* Include Solved */}
          <div 
            onClick={() => setIncludeSolved(!includeSolved)}
            className="px-3.5 py-2.5 flex items-center justify-between cursor-pointer hover:bg-zinc-100/50 dark:hover:bg-[#1a1a1f] transition-colors"
          >
            <div>
              <span className="text-xs font-medium block text-zinc-900 dark:text-white">Include Solved</span>
              <span className="text-[11px] text-zinc-400">Include previously mastered questions ({solvedCount} mastered)</span>
            </div>
            <div className={`w-8 h-4.5 rounded-full relative transition-colors flex-shrink-0 ml-3 ${includeSolved ? 'bg-brand-primary' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
              <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${includeSolved ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </div>
        </div>

        {/* 6. Start Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onStartQuiz}
            disabled={isLoading || totalSelectedQuestions === 0 || selectedUnits.length === 0}
            className="w-full py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-40 text-white font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>
              {isLoading ? 'Preparing assessment...' : `Start Custom Quiz (${totalSelectedQuestions} Qs • ${timerMinutes}m)`}
            </span>
          </button>
        </div>

      </div>

    </div>
  );
};

export default CompactCustomQuizBuilder;
