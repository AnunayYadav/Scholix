import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizDashboardStore } from '../../stores/quizStore';

const StreakToast: React.FC = () => {
  const { streakToastMessage, setStreakToastMessage, userQuizProfile } = useQuizDashboardStore();

  return (
    <AnimatePresence>
      {streakToastMessage && (
        <motion.div
          initial={{ y: -100, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -100, opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[90] px-6 py-3.5 bg-white/95 dark:bg-[#0f141c]/95 border border-amber-500/25 backdrop-blur-md rounded-2xl shadow-xl shadow-amber-500/5 dark:shadow-amber-500/10 flex items-center gap-3.5 max-w-md cursor-pointer select-none"
          onClick={() => setStreakToastMessage(null)}
        >
          {/* Fire animation */}
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="text-3xl"
          >
            🔥
          </motion.span>

          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">
              {streakToastMessage}
            </h4>
            <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
              {userQuizProfile.current_streak} day streak — Keep it going!
            </p>
          </div>

          {/* Close */}
          <button
            onClick={() => setStreakToastMessage(null)}
            className="ml-2 p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StreakToast;
