import React from 'react';
import { ArrowLeft, Play, FileText, Check } from 'lucide-react';
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
  }, [subjects]);  return (
    <div className="w-full max-w-xl mx-auto space-y-3.5 animate-fade-in pb-8">
      
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2.5">
          {onBackToDashboard && (
            <button
              type="button"
              onClick={onBackToDashboard}
              className="w-7 h-7 rounded-full border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center justify-center cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
          <div>
            <h1 className="text-base font-semibold text-zinc-900 dark:text-white tracking-tight">
              Custom Assessment
            </h1>
            <p className="text-[11px] text-zinc-400 font-normal">Configure parameters for a personalized test</p>
          </div>
        </div>

        {onSwitchToOfficialPapers && (
          <button
            type="button"
            onClick={onSwitchToOfficialPapers}
            className="h-7 px-3 rounded-full border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileText className="w-3 h-3 text-zinc-400" />
            <span>Official Papers</span>
          </button>
        )}
      </div>

      {/* Unified Settings Container */}
      <div className="rounded-2xl bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-white/[0.08] divide-y divide-zinc-100 dark:divide-white/[0.04] overflow-hidden shadow-xs">
        
        {/* 1. Course Selection */}
        <div className="px-4 py-3 sm:px-4.5 sm:py-3">
          <CustomDropdown
            label="Target Course"
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
        </div>

        {/* 2. Target Units */}
        <div className="px-4 py-3 sm:px-4.5 sm:py-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 block px-0.5">
              Target Units
            </label>
            <button
              type="button"
              onClick={onSelectAllUnits}
              className="text-[11px] text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-medium transition-colors cursor-pointer"
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
                  className={`py-1.5 rounded-lg text-xs font-medium transition-all text-center cursor-pointer ${
                    !isAvailable
                      ? 'opacity-25 bg-zinc-50 dark:bg-white/[0.02] border border-transparent text-zinc-400 cursor-not-allowed'
                      : isSelected
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold shadow-xs'
                        : 'bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200/60 dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-white/10'
                  }`}
                >
                  Unit {u}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Difficulty Level */}
        <div className="px-4 py-3 sm:px-4.5 sm:py-3 space-y-1.5">
          <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 block px-0.5">
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-2">
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
                  className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs font-semibold'
                      : 'bg-zinc-100 dark:bg-white/[0.05] border-zinc-200/60 dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-white/10'
                  }`}
                >
                  {isSelected ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <span className={`w-1.5 h-1.5 rounded-full ${lvl.dot}`} />
                  )}
                  <span>{lvl.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Questions & Duration Row */}
        <div className="px-4 py-3 sm:px-4.5 sm:py-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
            {/* MCQ Count */}
            {hasMCQs && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">MCQ Questions</span>
                  <div className="flex items-center gap-1">
                    {[10, 20, 30].map(cnt => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setNumMCQ(cnt)}
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md cursor-pointer transition-colors ${
                          numMCQ === cnt 
                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' 
                            : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10'
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
                  className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/[0.08] rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400 dark:focus:border-white/20 transition-colors"
                />
              </div>
            )}

            {/* Time Limit */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">Duration (Minutes)</span>
                <div className="flex items-center gap-1">
                  {[15, 30, 60].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setTimerMinutes(mins)}
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md cursor-pointer transition-colors ${
                        timerMinutes === mins 
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' 
                          : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10'
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
                className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/[0.08] rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400 dark:focus:border-white/20 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* 5. Apple Settings List (Toggles) */}
        <div className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
          {/* Practice Mode */}
          <div 
            onClick={() => setIsPracticeMode(!isPracticeMode)}
            className="px-4 py-2.5 sm:px-4.5 sm:py-2.5 flex items-center justify-between cursor-pointer hover:bg-zinc-50/80 dark:hover:bg-white/[0.02] transition-colors"
          >
            <div className="pr-3">
              <span className="text-xs font-medium block text-zinc-900 dark:text-white">Practice Mode</span>
              <span className="text-[11px] text-zinc-400 font-normal">Instant answers & explanations after each question</span>
            </div>
            <div className={`w-8 h-4.5 rounded-full relative transition-colors flex-shrink-0 ${isPracticeMode ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
              <div className={`w-3.5 h-3.5 rounded-full transition-all absolute top-0.5 ${isPracticeMode ? 'right-0.5 bg-white dark:bg-zinc-900' : 'left-0.5 bg-white'}`} />
            </div>
          </div>

          {/* Negative Marking */}
          <div 
            onClick={() => setNegativeMarking(!negativeMarking)}
            className="px-4 py-2.5 sm:px-4.5 sm:py-2.5 flex items-center justify-between cursor-pointer hover:bg-zinc-50/80 dark:hover:bg-white/[0.02] transition-colors"
          >
            <div className="pr-3">
              <span className="text-xs font-medium block text-zinc-900 dark:text-white">Negative Marking</span>
              <span className="text-[11px] text-zinc-400 font-normal">Apply -0.25 mark penalty for incorrect answers</span>
            </div>
            <div className={`w-8 h-4.5 rounded-full relative transition-colors flex-shrink-0 ${negativeMarking ? 'bg-rose-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
              <div className={`w-3.5 h-3.5 rounded-full bg-white transition-all absolute top-0.5 ${negativeMarking ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </div>

          {/* Include Solved */}
          <div 
            onClick={() => setIncludeSolved(!includeSolved)}
            className="px-4 py-2.5 sm:px-4.5 sm:py-2.5 flex items-center justify-between cursor-pointer hover:bg-zinc-50/80 dark:hover:bg-white/[0.02] transition-colors"
          >
            <div className="pr-3">
              <span className="text-xs font-medium block text-zinc-900 dark:text-white">Include Mastered Questions</span>
              <span className="text-[11px] text-zinc-400 font-normal">Include {solvedCount} previously completed questions</span>
            </div>
            <div className={`w-8 h-4.5 rounded-full relative transition-colors flex-shrink-0 ${includeSolved ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
              <div className={`w-3.5 h-3.5 rounded-full transition-all absolute top-0.5 ${includeSolved ? 'right-0.5 bg-white dark:bg-zinc-900' : 'left-0.5 bg-white'}`} />
            </div>
          </div>
        </div>

        {/* 6. Start Button Action Area */}
        <div className="p-3 sm:p-3.5 bg-zinc-50/50 dark:bg-white/[0.01]">
          <button
            type="button"
            onClick={onStartQuiz}
            disabled={isLoading || totalSelectedQuestions === 0 || selectedUnits.length === 0}
            className="w-full py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 disabled:opacity-30 transition-all font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>
              {isLoading ? 'Preparing assessment...' : `Start Custom Assessment (${totalSelectedQuestions} Qs • ${timerMinutes}m)`}
            </span>
          </button>
        </div>

      </div>

    </div>
  );
};

export default CompactCustomQuizBuilder;
