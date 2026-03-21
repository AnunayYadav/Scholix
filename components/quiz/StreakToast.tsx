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
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[90] px-8 py-4 bg-white dark:bg-dark-950 border border-amber-500/30 rounded-[24px] shadow-2xl shadow-amber-500/10 flex items-center gap-4 max-w-md"
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
            <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              {streakToastMessage}
            </h4>
            <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
              {userQuizProfile.current_streak} day streak — Keep it going!
            </p>
          </div>

          {/* Close */}
          <button
            onClick={() => setStreakToastMessage(null)}
            className="ml-2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
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
