import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, Clock, FileText, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
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
    hard: { color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', label: 'Hard', stars: 3 },
  }[quiz.difficulty];

  const estimatedTime = Math.ceil((quiz.questions.length * 45) / 60);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="p-6 md:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#17171a] border border-zinc-200/80 dark:border-zinc-800/80"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Quiz info */}
        <div className="flex-1 min-w-0 space-y-3.5">
          {/* Top labels */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-primary/10 text-brand-primary text-[10px] font-semibold tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Daily Featured</span>
            </span>
            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-semibold tracking-wider ${difficultyConfig.color}`}>
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-2.5 h-2.5 ${i < difficultyConfig.stars ? 'fill-current' : 'opacity-25'}`} 
                  />
                ))}
              </span>
              <span>{difficultyConfig.label}</span>
            </span>
          </div>

          {/* Quiz title */}
          <h3 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight leading-snug">
            {quiz.name}
          </h3>

          {/* Units */}
          {quiz.units && quiz.units.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {quiz.units.slice(0, 3).map(unit => (
                <span 
                  key={unit} 
                  className="px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-700/60 text-[10px] font-medium text-zinc-600 dark:text-zinc-400"
                >
                  {unit}
                </span>
              ))}
              {quiz.units.length > 3 && (
                <span className="text-[10px] font-medium text-zinc-400 flex items-center px-1">
                  +{quiz.units.length - 3} More
                </span>
              )}
            </div>
          )}

          {/* Info metadata line */}
          <div className="flex items-center gap-4 flex-wrap text-xs font-medium text-zinc-500 dark:text-zinc-400 pt-1">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              {quiz.questions.length} Questions
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              ~{estimatedTime} min
            </span>
            <span className="flex items-center gap-1 text-brand-primary font-semibold">
              <Zap className="w-3.5 h-3.5 fill-brand-primary" />
              Up to {quiz.xp_reward} XP
            </span>
          </div>
        </div>

        {/* Right: Action Button & Countdown */}
        <div className="flex flex-col items-start md:items-end gap-3 flex-shrink-0">
          {isCompleted ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <div className="text-left">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block">Completed</span>
                {completedScore !== null && (
                  <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">Score: {completedScore}%</span>
                )}
              </div>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStart}
              className="px-6 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl font-medium text-xs flex items-center gap-2 transition-all cursor-pointer shadow-none"
            >
              <span>Start challenge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          )}

          {/* Countdown timer */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
            <Clock className="w-3 h-3 text-zinc-400" />
            <span className="tabular-nums">Resets in {countdown}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FeaturedQuizCard;
