import React from 'react';
import { motion } from 'framer-motion';
import CustomDropdown, { DropdownOption } from './CustomDropdown.tsx';

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
  onSwitchToOfficialPapers: () => void;
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

  const subjectOptions: DropdownOption[] = subjects.map(s => ({
    value: s.id,
    label: s.name,
  }));

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-zinc-200/50 dark:border-white/5">
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
              Custom Quiz <span className="text-orange-500">Builder</span>
            </h1>
            <p className="text-xs text-zinc-500 font-medium">
              Configure topics, difficulty, and timer to start a custom test
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSwitchToOfficialPapers}
          className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-orange-500/10 text-zinc-700 dark:text-zinc-300 hover:text-orange-500 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-orange-500">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          <span>Official Papers</span>
        </button>
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        
        {/* 1. Styled Course Dropdown */}
        <CustomDropdown
          label="Select Course"
          value={selectedSubject?.id || ''}
          options={subjectOptions}
          onChange={(val) => {
            const sub = subjects.find(s => s.id === val);
            if (sub) onSelectSubject(sub);
          }}
          placeholder="Choose a course..."
        />

        {/* 2. Units Scope */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Select Units
            </label>
            <button
              type="button"
              onClick={onSelectAllUnits}
              className="text-[11px] font-bold text-orange-500 hover:underline cursor-pointer"
            >
              {allUnitsSelected ? 'Deselect All' : 'Select All (Units 1-6)'}
            </button>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map(u => {
              const isAvailable = availableUnits.includes(u);
              const isSelected = selectedUnits.includes(u);

              return (
                <button
                  key={u}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => onToggleUnit(u)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                    !isAvailable
                      ? 'opacity-30 bg-zinc-100/40 dark:bg-white/[0.01] text-zinc-400 cursor-not-allowed'
                      : isSelected
                        ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                        : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-white/10'
                  }`}
                >
                  Unit {u}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Difficulty */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'easy', label: 'Easy (L1)', dot: 'bg-emerald-400' },
              { id: 'medium', label: 'Medium (L2)', dot: 'bg-amber-400' },
              { id: 'hard', label: 'Hard (L3)', dot: 'bg-red-400' },
            ].map(lvl => {
              const isSelected = selectedDifficulties.includes(lvl.id);
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => onToggleDifficulty(lvl.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                      : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-white/10'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${lvl.dot}`} />
                  <span>{lvl.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Questions & Time Limit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* MCQ Count */}
          {hasMCQs && (
            <div className="p-3.5 rounded-xl bg-zinc-100/70 dark:bg-white/[0.03] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">MCQ Questions</span>
                <div className="flex items-center gap-1">
                  {[10, 20, 30].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setNumMCQ(cnt)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg cursor-pointer ${
                        numMCQ === cnt ? 'bg-orange-500 text-white' : 'bg-zinc-200 dark:bg-white/10 text-zinc-500'
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
                className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900/80 rounded-lg text-xs font-bold text-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          )}

          {/* Time Limit */}
          <div className="p-3.5 rounded-xl bg-zinc-100/70 dark:bg-white/[0.03] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Timer (Minutes)</span>
              <div className="flex items-center gap-1">
                {[15, 30, 60].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setTimerMinutes(mins)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg cursor-pointer ${
                      timerMinutes === mins ? 'bg-orange-500 text-white' : 'bg-zinc-200 dark:bg-white/10 text-zinc-500'
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
              className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900/80 rounded-lg text-xs font-bold text-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* 5. Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setIsPracticeMode(!isPracticeMode)}
            className={`p-3 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer ${
              isPracticeMode ? 'bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/30' : 'bg-zinc-100/70 dark:bg-white/[0.03]'
            }`}
          >
            <div>
              <span className="text-xs font-bold block text-zinc-900 dark:text-white">Practice Mode</span>
              <span className="text-[10px] text-zinc-400">Instant answers</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${isPracticeMode ? 'bg-orange-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
              <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all ${isPracticeMode ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </button>

          <button
            type="button"
            onClick={() => setNegativeMarking(!negativeMarking)}
            className={`p-3 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer ${
              negativeMarking ? 'bg-red-500/10 text-red-500 ring-1 ring-red-500/30' : 'bg-zinc-100/70 dark:bg-white/[0.03]'
            }`}
          >
            <div>
              <span className="text-xs font-bold block text-zinc-900 dark:text-white">Negative Marking</span>
              <span className="text-[10px] text-zinc-400">-0.25 penalty</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${negativeMarking ? 'bg-red-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
              <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all ${negativeMarking ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIncludeSolved(!includeSolved)}
            className={`p-3 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer ${
              includeSolved ? 'bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/30' : 'bg-zinc-100/70 dark:bg-white/[0.03]'
            }`}
          >
            <div>
              <span className="text-xs font-bold block text-zinc-900 dark:text-white">Include Solved</span>
              <span className="text-[10px] text-zinc-400">{solvedCount} mastered</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${includeSolved ? 'bg-orange-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
              <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all ${includeSolved ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </button>
        </div>

        {/* 6. Start Button */}
        <div className="pt-3 flex justify-center">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartQuiz}
            disabled={isLoading || totalSelectedQuestions === 0 || selectedUnits.length === 0}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-30 text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span>
              {isLoading ? 'Starting...' : `Start Custom Quiz (${totalSelectedQuestions} Qs • ${timerMinutes}m)`}
            </span>
          </motion.button>
        </div>

      </div>

    </div>
  );
};

export default CompactCustomQuizBuilder;
