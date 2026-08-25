import React from 'react';
import { motion } from 'framer-motion';

interface QuickStartBarProps {
  onOfficialPapers?: () => void;
  onCustomQuiz: () => void;
  onMyHistory: () => void;
}

const QuickStartBar: React.FC<QuickStartBarProps> = ({ onOfficialPapers, onCustomQuiz, onMyHistory }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-3"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Official Question Papers Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOfficialPapers || onCustomQuiz}
          className="group flex items-center gap-3.5 p-4 md:p-5 rounded-[24px] bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-xl shadow-orange-500/15 transition-all hover:shadow-orange-500/30 text-left cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div>
            <span className="block text-sm font-black tracking-tight leading-tight">Official Papers</span>
            <span className="block text-[11px] font-medium opacity-85">Year-wise Endterm & Midterm</span>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 ml-auto opacity-70 group-hover:opacity-100 transition-opacity">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </motion.button>

        {/* Custom Quiz Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCustomQuiz}
          className="group flex items-center gap-3.5 p-4 md:p-5 rounded-[24px] bg-zinc-100 dark:bg-[#111113] hover:bg-zinc-200/60 dark:hover:bg-[#161618] border border-zinc-200/60 dark:border-white/5 transition-all text-left cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-zinc-200/60 dark:bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/10 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-zinc-500 group-hover:text-orange-500 transition-colors">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <div>
            <span className="block text-sm font-bold text-zinc-900 dark:text-white tracking-tight leading-tight">Custom Builder</span>
            <span className="block text-[11px] font-medium text-zinc-500">Pick units, timer & questions</span>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 ml-auto text-zinc-300 dark:text-white/10 group-hover:text-orange-500 transition-colors">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </motion.button>

        {/* My History Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onMyHistory}
          className="group flex items-center gap-3.5 p-4 md:p-5 rounded-[24px] bg-zinc-100 dark:bg-[#111113] hover:bg-zinc-200/60 dark:hover:bg-[#161618] border border-zinc-200/60 dark:border-white/5 transition-all text-left cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-zinc-200/60 dark:bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/10 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-zinc-400 group-hover:text-orange-500 transition-colors">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <div>
            <span className="block text-sm font-bold text-zinc-900 dark:text-white tracking-tight leading-tight">My History</span>
            <span className="block text-[11px] font-medium text-zinc-500">Review past results & stats</span>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 ml-auto text-zinc-300 dark:text-white/10 group-hover:text-orange-500 transition-colors">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default QuickStartBar;
