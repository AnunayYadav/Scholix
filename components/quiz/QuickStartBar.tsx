import React from 'react';
import { motion } from 'framer-motion';

interface QuickStartBarProps {
  onCustomQuiz: () => void;
  onMyHistory: () => void;
}

const QuickStartBar: React.FC<QuickStartBarProps> = ({ onCustomQuiz, onMyHistory }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-3"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Custom Quiz Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCustomQuiz}
          className="group flex items-center gap-4 p-5 rounded-[24px] bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-xl shadow-orange-500/15 transition-all hover:shadow-orange-500/30"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <div className="text-left">
            <span className="block text-sm font-semibold tracking-tight">Custom Quiz</span>
            <span className="block text-[11px] font-medium opacity-80">Choose subject, units & difficulty</span>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 ml-auto opacity-60 group-hover:opacity-100 transition-opacity">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </motion.button>

        {/* My History Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onMyHistory}
          className="group flex items-center gap-4 p-5 rounded-[24px] bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 shadow-lg hover:shadow-xl hover:border-orange-500/20 transition-all text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/10 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <div>
            <span className="block text-sm font-semibold text-slate-900 dark:text-white tracking-tight">My History</span>
            <span className="block text-[11px] font-medium text-slate-500">Review past results & progress</span>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 ml-auto text-slate-300 dark:text-white/10 group-hover:text-orange-500 transition-colors">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default QuickStartBar;
