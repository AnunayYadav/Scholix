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

  // Clean subject code (e.g. "CSE436" or "CSE471")
  const subjectCode = challenge.subject.includes(':') 
    ? challenge.subject.split(':')[0].trim().toUpperCase()
    : (challenge.subject.split('-')[0]?.trim().toUpperCase() || challenge.subject);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
        whileHover={!isLocked && !isCompleted ? { y: -1, transition: { duration: 0.15 } } : {}}
        className={`relative overflow-hidden p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
          isLocked
            ? 'bg-[#111113]/50 border-white/[0.04] opacity-65'
            : isCompleted
            ? 'bg-[#111113] border-emerald-500/20'
            : 'bg-[#111113] border-white/[0.05] hover:border-white/[0.1] shadow-xs hover:shadow-sm'
        }`}
      >
        {/* Left: Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-zinc-500">
            <span className="text-zinc-400 font-mono tracking-tight">{subjectCode}</span>
            <span>•</span>
            <span className="text-white/90 font-bold">+{challenge.xp_reward} XP</span>
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate mt-0.5">
            {challenge.name}
          </h4>

          <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-1 font-medium">
            <span>{challenge.question_count} Questions</span>
            <span>•</span>
            <span>{challenge.time_limit_per_question}s each</span>
            {countdown && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-zinc-400">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  {countdown}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Compact Action */}
        <div className="flex-shrink-0">
          {isCompleted ? (
            <div className="px-3 py-1.5 bg-emerald-500/10 rounded-full text-emerald-400 text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Done</span>
            </div>
          ) : isLocked ? (
            <div className="px-3 py-1.5 bg-white/[0.04] rounded-full text-zinc-500 text-[11px] font-medium flex items-center gap-1 cursor-not-allowed">
              <Lock className="w-3 h-3" />
              <span>Lvl {challenge.min_level}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <span>View</span>
              <ArrowRight className="w-3 h-3 text-zinc-950" />
            </button>
          )}
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
                      <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{subjectCode || challenge.subject}</p>
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
                    className="flex-1 py-2.5 bg-white/[0.05] hover:bg-white/10 text-zinc-400 hover:text-white rounded-full text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); onStart(); }}
                    className="flex-[2] py-2.5 bg-white hover:bg-zinc-200 text-zinc-950 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <span>Start challenge</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-950" />
                  </button>
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
