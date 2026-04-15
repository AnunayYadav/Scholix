import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ActiveChallenge } from '../../stores/quizStore';

interface ChallengeCardProps {
  challenge: ActiveChallenge;
  isCompleted: boolean;
  userLevel: number;
  onStart: () => void;
  index: number;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  isCompleted,
  userLevel,
  onStart,
  index,
}) => {
  const [countdown, setCountdown] = useState('');
  const [showModal, setShowModal] = useState(false);
  const isLocked = challenge.min_level ? userLevel < challenge.min_level : false;

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const expires = new Date(challenge.expires_at);
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown('Expired');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      setCountdown(`${days}d ${hrs}h`);
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [challenge.expires_at]);

  const totalTime = challenge.question_count * challenge.time_limit_per_question;
  const totalMinutes = Math.ceil(totalTime / 60);

  // Extract subject short name
  const shortName = challenge.subject.includes('-') ? challenge.subject.split('-').pop()?.trim() || challenge.subject : challenge.subject;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
        whileHover={!isLocked && !isCompleted ? { y: -4, transition: { duration: 0.2 } } : {}}
        className={`relative overflow-hidden p-5 md:p-6 rounded-[28px] border transition-all ${
          isLocked
            ? 'bg-zinc-50 dark:bg-dark-950/30 border-zinc-200 dark:border-white/5 opacity-60'
            : isCompleted
            ? 'bg-emerald-50/50 dark:bg-emerald-900/5 border-emerald-200 dark:border-emerald-500/20'
            : 'bg-white dark:bg-white/[0.02] border-zinc-200 dark:border-white/5 shadow-lg hover:shadow-xl hover:border-orange-500/20'
        }`}
      >
        {isLocked && (
          <div className="absolute inset-0 bg-white/50 dark:bg-dark-950/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/10">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-zinc-400">
                <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm3 8H9V7a3 3 0 0 1 6 0v3z" />
              </svg>
              <span className="text-[10px] font-semibold text-zinc-500 tracking-wider">Level {challenge.min_level} Required</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl flex-shrink-0">{challenge.emoji}</span>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight truncate">
                  {challenge.name}
                </h4>
                <p className="text-[11px] text-zinc-500 font-medium mt-0.5 line-clamp-1">
                  {challenge.description}
                </p>
              </div>
            </div>

            {/* XP badge */}
            <div className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-500 dark:text-orange-400">
              <span className="text-[10px] font-semibold tabular-nums">{challenge.xp_reward} XP</span>
            </div>
          </div>

          {/* Info row */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <svg key={i} viewBox="0 0 24 24" fill={i < challenge.difficulty ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className={`w-3.5 h-3.5 ${i < challenge.difficulty ? 'text-amber-500' : 'text-zinc-300 dark:text-white/10'}`}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>

            <span className="text-[10px] font-semibold text-zinc-400 tabular-nums">
              {challenge.question_count} Q • {challenge.time_limit_per_question}s each
            </span>

            <span className="text-[10px] font-semibold text-zinc-400 flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
              {countdown}
            </span>
          </div>

          {/* Action */}
          {isCompleted ? (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 rounded-xl">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-emerald-500">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider">Done</span>
            </div>
          ) : !isLocked ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowModal(true)}
              className="w-full py-2.5 bg-dark-950 dark:bg-white/[0.06] hover:bg-dark-800 dark:hover:bg-white/10 text-white rounded-xl text-[11px] font-semibold tracking-wider transition-all flex items-center justify-center gap-2 group"
            >
              <span>View Details</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 transition-transform group-hover:translate-x-0.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </motion.button>
          ) : null}
        </div>
      </motion.div>      {/* ═══════════ Pre-Start Modal ═══════════ */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-md bg-white dark:bg-dark-950 rounded-[32px] shadow-2xl overflow-hidden border border-zinc-200 dark:border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-8 pb-0 text-center space-y-3">
                  <span className="text-5xl">{challenge.emoji}</span>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-white tracking-tight">
                    {challenge.name}
                  </h3>
                  <p className="text-sm text-zinc-500 font-medium">
                    {challenge.description}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="p-8 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/5 text-center">
                      <p className="text-[9px] font-semibold text-zinc-400 tracking-wider mb-1">Subject</p>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">{shortName}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/5 text-center">
                      <p className="text-[9px] font-semibold text-zinc-400 tracking-wider mb-1">Questions</p>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">{challenge.question_count}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/5 text-center">
                      <p className="text-[9px] font-semibold text-zinc-400 tracking-wider mb-1">Time Limit</p>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">{totalMinutes} min</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/5 text-center">
                      <p className="text-[9px] font-semibold text-zinc-400 tracking-wider mb-1">Per Question</p>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">{challenge.time_limit_per_question}s</p>
                    </div>
                    {challenge.units && challenge.units.length > 0 && (
                      <div className="col-span-2 p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/5">
                        <p className="text-[9px] font-semibold text-zinc-400 tracking-wider mb-1.5 text-center">Based on Units</p>
                        <div className="flex flex-wrap justify-center gap-x-2 gap-y-1">
                          {challenge.units.map((unit, i) => (
                            <span key={unit} className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                              {unit}
                              {i < challenge.units.length - 1 && <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-white/10" />}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Difficulty + XP */}
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-zinc-400 tracking-wider">Difficulty</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <svg key={i} viewBox="0 0 24 24" fill={i < challenge.difficulty ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className={`w-4 h-4 ${i < challenge.difficulty ? 'text-amber-500' : 'text-zinc-300 dark:text-white/10'}`}>
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 text-orange-500 font-semibold text-sm">
                      ⚡ {challenge.xp_reward} XP
                    </span>
                  </div>

                  {/* Expires */}
                  <div className="text-center">
                    <span className="text-[10px] font-semibold text-zinc-400 flex items-center justify-center gap-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                      </svg>
                      Expires in {countdown}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-8 pb-8 flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 rounded-2xl text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setShowModal(false); onStart(); }}
                    className="flex-[2] py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-semibold text-sm shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2"
                  >
                    <span>Start challenge</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.getElementById('modal-root') || document.body
      )}
    </>
  );
};

export default ChallengeCard;
