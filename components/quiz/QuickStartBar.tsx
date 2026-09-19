import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Sliders, History, ChevronRight } from 'lucide-react';

interface QuickStartBarProps {
  onOfficialPapers?: () => void;
  onCustomQuiz: () => void;
  onMyHistory: () => void;
}

const QuickStartBar: React.FC<QuickStartBarProps> = ({ onOfficialPapers, onCustomQuiz, onMyHistory }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-3"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Official Question Papers Button */}
        <button
          type="button"
          onClick={onOfficialPapers || onCustomQuiz}
          className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#17171a] border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-left cursor-pointer active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <FileText size={18} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <span className="block text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-brand-primary transition-colors tracking-tight truncate">
                Official Papers
              </span>
              <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 font-normal truncate mt-0.5">
                Year-wise Endterm & Midterm
              </span>
            </div>
          </div>
          <ChevronRight size={16} className="text-zinc-400 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
        </button>

        {/* Custom Quiz Button */}
        <button
          type="button"
          onClick={onCustomQuiz}
          className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#17171a] border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-left cursor-pointer active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Sliders size={18} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <span className="block text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-indigo-500 transition-colors tracking-tight truncate">
                Custom Builder
              </span>
              <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 font-normal truncate mt-0.5">
                Pick units, timer & questions
              </span>
            </div>
          </div>
          <ChevronRight size={16} className="text-zinc-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
        </button>

        {/* My History Button */}
        <button
          type="button"
          onClick={onMyHistory}
          className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#17171a] border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-left cursor-pointer active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <History size={18} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <span className="block text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-emerald-500 transition-colors tracking-tight truncate">
                My History
              </span>
              <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 font-normal truncate mt-0.5">
                Review past results & stats
              </span>
            </div>
          </div>
          <ChevronRight size={16} className="text-zinc-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
        </button>
      </div>
    </motion.div>
  );
};

export default QuickStartBar;
