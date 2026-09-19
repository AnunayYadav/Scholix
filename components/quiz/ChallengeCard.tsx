import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Star, 
  ArrowRight, 
  X, 
  Target,
  Trophy,
  HelpCircle
} from 'lucide-react';
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
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
        whileHover={!isLocked && !isCompleted ? { y: -2, transition: { duration: 0.2 } } : {}}
        className={`relative overflow-hidden p-5 rounded-2xl border transition-all flex flex-col justify-between ${
          isLocked
            ? 'bg-zinc-50/60 dark:bg-[#17171a]/60 border-zinc-200/50 dark:border-zinc-800/50 opacity-70'
            : isCompleted
            ? 'bg-emerald-500/[0.03] border-emerald-500/20'
            : 'bg-white dark:bg-[#17171a] border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
        }`}
      >
        {isLocked && (
          <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-[2px] z-10 flex items-center justify-center p-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#151518] rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
              <Lock className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-300 tracking-wider">Level {challenge.min_level} Required</span>
            </div>
          </div>
        )}

        <div className="space-y-3.5">
          {/* Top Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight truncate">
                  {challenge.name}
                </h4>
                <p className="text-[11px] text-zinc-400 font-normal mt-0.5 line-clamp-1">
                  {challenge.description}
                </p>
              </div>
            </div>

            {/* XP badge */}
            <div className="flex-shrink-0 px-2.5 py-0.5 rounded-lg bg-brand-primary/10 text-brand-primary border border-brand-primary/20 flex items-center gap-1">
              <Zap className="w-3 h-3 fill-brand-primary" />
              <span className="text-[10px] font-semibold tabular-nums">{challenge.xp_reward} XP</span>
            </div>
          </div>

          {/* Info metadata row */}
          <div className="flex items-center gap-3 flex-wrap text-xs text-zinc-500 dark:text-zinc-400 pt-0.5">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < challenge.difficulty 
                      ? 'text-amber-500 fill-amber-500' 
                      : 'text-zinc-300 dark:text-zinc-700'
                  }`}
                />
              ))}
            </div>

            <span className="text-[11px] font-medium text-zinc-400 tabular-nums">
              {challenge.question_count} Q • {challenge.time_limit_per_question}s each
            </span>

            <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-400" />
              {countdown}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-white/[0.05]">
          {isCompleted ? (
            <div className="flex items-center justify-center gap-1.5 py-2 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Challenge Completed</span>
            </div>
          ) : !isLocked ? (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowModal(true)}
              className="w-full py-2 bg-zinc-100 dark:bg-white/[0.04] hover:bg-zinc-200/70 dark:hover:bg-white/[0.08] text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          ) : null}
        </div>
      </motion.div>

      {/* Pre-Start Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
              style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 10 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white dark:bg-[#17171a] border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden"
              >
                {/* Header */}
                <div className="text-center space-y-2 pt-2">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto">
                    <Target className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                    {challenge.name}
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium">
                    {challenge.description}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/70 dark:border-white/[0.05] text-center">
                      <p className="text-[10px] font-medium text-zinc-400 mb-0.5">Subject</p>
                      <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{shortName}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/70 dark:border-white/[0.05] text-center">
                      <p className="text-[10px] font-medium text-zinc-400 mb-0.5">Questions</p>
                      <p className="text-xs font-semibold text-zinc-900 dark:text-white">{challenge.question_count}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/70 dark:border-white/[0.05] text-center">
                      <p className="text-[10px] font-medium text-zinc-400 mb-0.5">Time Limit</p>
                      <p className="text-xs font-semibold text-zinc-900 dark:text-white">{totalMinutes} min</p>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/70 dark:border-white/[0.05] text-center">
                      <p className="text-[10px] font-medium text-zinc-400 mb-0.5">Per Question</p>
                      <p className="text-xs font-semibold text-zinc-900 dark:text-white">{challenge.time_limit_per_question}s</p>
                    </div>
                    {challenge.units && challenge.units.length > 0 && (
                      <div className="col-span-2 p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/70 dark:border-white/[0.05]">
                        <p className="text-[10px] font-medium text-zinc-400 mb-1 text-center">Based on Units</p>
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {challenge.units.map((unit) => (
                            <span key={unit} className="px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-white/[0.04] text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
                              {unit}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Difficulty + XP */}
                  <div className="flex items-center justify-between px-2 pt-1 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-zinc-400">Difficulty</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < challenge.difficulty 
                                ? 'text-amber-500 fill-amber-500' 
                                : 'text-zinc-300 dark:text-zinc-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-brand-primary font-semibold text-xs">
                      <Zap className="w-3.5 h-3.5 fill-brand-primary" />
                      {challenge.xp_reward} XP
                    </span>
                  </div>

                  {/* Countdown */}
                  <div className="text-center pt-1">
                    <span className="text-[11px] font-medium text-zinc-400 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expires in {countdown}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 bg-zinc-100 dark:bg-white/[0.05] hover:bg-zinc-200/70 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setShowModal(false); onStart(); }}
                    className="flex-[2] py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Start challenge</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default ChallengeCard;
