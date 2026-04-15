import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FeaturedQuiz } from '../../stores/quizStore';

interface FeaturedQuizCardProps {
  quiz: FeaturedQuiz;
  isCompleted: boolean;
  completedScore: number | null;
  onStart: () => void;
}

const FeaturedQuizCard: React.FC<FeaturedQuizCardProps> = ({
  quiz,
  isCompleted,
  completedScore,
  onStart,
}) => {
  const [countdown, setCountdown] = useState('');

  // Live countdown to midnight IST (UTC+5:30)
  useEffect(() => {
    const update = () => {
      const now = new Date();
      // Midnight IST = 18:30 UTC of current day
      const istOffset = 5.5 * 60 * 60 * 1000;
      const nowIST = new Date(now.getTime() + istOffset);
      const midnightIST = new Date(nowIST);
      midnightIST.setUTCDate(midnightIST.getUTCDate() + 1);
      midnightIST.setUTCHours(0, 0, 0, 0);
      const diff = midnightIST.getTime() - nowIST.getTime();

      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const difficultyConfig = {
    easy: { color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', label: 'Easy', stars: 1 },
    medium: { color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', label: 'Medium', stars: 2 },
    hard: { color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20', label: 'Hard', stars: 3 },
  }[quiz.difficulty];

  const estimatedTime = Math.ceil((quiz.questions.length * 45) / 60);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[32px] border border-zinc-200 dark:border-white/5 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-orange-950/10 dark:via-dark-950/60 dark:to-amber-950/10 shadow-xl"
    >
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Left: Quiz info */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Top label */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-500/10 text-orange-500 text-[10px] font-semibold tracking-wider">
                <span className="text-sm">⭐</span> Daily Featured
              </span>
              <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-semibold tracking-wider ${difficultyConfig.color}`}>
                {'★'.repeat(difficultyConfig.stars)}{'☆'.repeat(3 - difficultyConfig.stars)} {difficultyConfig.label}
              </span>
            </div>

            {/* Quiz name */}
            <h3 className="text-xl md:text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight leading-tight">
              {quiz.name}
            </h3>

            {/* Units */}
            {quiz.units && quiz.units.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {quiz.units.slice(0, 3).map(unit => (
                  <span key={unit} className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-white/5 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-white/5">
                    {unit}
                  </span>
                ))}
                {quiz.units.length > 3 && (
                  <span className="text-[10px] font-bold text-zinc-400 flex items-center">
                    + {quiz.units.length - 3} More
                  </span>
                )}
              </div>
            )}

            {/* Info line */}
            <div className="flex items-center gap-4 flex-wrap text-[11px] font-semibold text-zinc-500">
              <span className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                </svg>
                {quiz.questions.length} Questions
              </span>
              <span className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                  <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                </svg>
                ~{estimatedTime} min
              </span>
              <span className="flex items-center gap-1.5 text-orange-500 font-semibold">
                <span>⚡</span>
                Up to {quiz.xp_reward} XP
              </span>
            </div>
          </div>

          {/* Right: Action */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            {isCompleted ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-7 h-7 text-emerald-500">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <span className="text-[10px] font-semibold text-emerald-500 tracking-wider">Completed</span>
                {completedScore !== null && (
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{completedScore}%</span>
                )}
              </div>
            ) : (
                <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onStart}
                className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-semibold text-sm shadow-xl shadow-orange-500/20 flex items-center gap-2 group"
              >
                <span>Start challenge</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 transition-transform group-hover:translate-x-0.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.button>
            )}

            {/* Countdown */}
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
              <span className="tabular-nums font-medium tracking-wide">Resets in {countdown}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FeaturedQuizCard;
