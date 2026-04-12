import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizDashboardStore } from '../../stores/quizStore';

const XPBreakdown: React.FC = () => {
  const { showXPBreakdown, setShowXPBreakdown, lastXPResult } = useQuizDashboardStore();
  const [countUpValue, setCountUpValue] = useState(0);

  useEffect(() => {
    if (!showXPBreakdown || !lastXPResult) return;

    setCountUpValue(0);

    const target = lastXPResult.totalEarned;
    const duration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCountUpValue(Math.round(target * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    const timeout = setTimeout(() => {
        requestAnimationFrame(animate);
    }, 600);

    return () => clearTimeout(timeout);
  }, [showXPBreakdown, lastXPResult]);

  if (!lastXPResult) return null;

  return createPortal(
    <AnimatePresence>
      {showXPBreakdown && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="modal-overlay"
          style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
          onClick={() => setShowXPBreakdown(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-sm bg-white dark:bg-dark-950 rounded-[40px] shadow-2xl overflow-hidden border border-zinc-200 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 space-y-8 relative z-10">
              {/* Header Icon */}
              <div className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-[32px] border border-orange-500/20 flex items-center justify-center mb-6 shadow-inner"
                >
                  <span className="text-4xl filter drop-shadow-md">⚡</span>
                </motion.div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight leading-none">XP Earned</h3>
                  <p className="text-zinc-500 font-semibold text-[10px] uppercase tracking-[0.2em] opacity-60">Mission Protocol Complete</p>
                </div>
              </div>

              {/* Breakdown List */}
              <div className="space-y-3">
                {lastXPResult.breakdown.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="flex items-center justify-between p-4 bg-zinc-50/50 dark:bg-white/[0.02] rounded-2xl border border-zinc-100/50 dark:border-white/5"
                  >
                    <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 capitalize">{item.label.toLowerCase()}</span>
                    <span className="text-sm font-bold text-emerald-500 tabular-nums">+{item.value}</span>
                  </motion.div>
                ))}

                {/* Total Section */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-6 pt-6 border-t border-zinc-100 dark:border-white/5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-bold text-zinc-900 dark:text-white">Total Gained</span>
                    <span className="text-3xl font-bold text-orange-500 tabular-nums">+{countUpValue}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                       Account Balance: {lastXPResult.newTotalXP} XP
                    </span>
                  </div>
                </motion.div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowXPBreakdown(false)}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-orange-500/25 transition-all active:scale-95"
              >
                Continue Adventure
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.getElementById('modal-root') || document.body
  );
};

export default XPBreakdown;
