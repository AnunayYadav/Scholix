import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, FileText, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { FeaturedQuiz } from '../../stores/quizStore.ts';

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

  const estimatedTime = Math.ceil((quiz.questions.length * 45) / 60);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-white/[0.05] shadow-xs hover:border-zinc-300 dark:hover:border-white/[0.1] transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Metadata & Title */}
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-zinc-900 dark:text-white/90 uppercase tracking-wider text-[10px]">
              Daily Featured
            </span>
            <span className="text-zinc-300 dark:text-zinc-600">•</span>
            <span className="capitalize text-zinc-600 dark:text-zinc-400 font-medium">
              {quiz.difficulty}
            </span>
            {countdown && (
              <>
                <span className="text-zinc-300 dark:text-zinc-600">•</span>
                <span className="text-zinc-500 text-[10px] tabular-nums">
                  Resets in {countdown}
                </span>
              </>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white tracking-tight leading-snug">
            {quiz.name}
          </h3>

          <div className="flex items-center gap-3.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium flex-wrap pt-0.5">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              <span>{quiz.questions.length} Questions</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              <span>~{estimatedTime} min</span>
            </span>
            <span className="flex items-center gap-1 text-zinc-800 dark:text-white/90 font-semibold">
              <Zap className="w-3.5 h-3.5 text-orange-500 fill-current" />
              <span>+{quiz.xp_reward} XP</span>
            </span>
            {quiz.units && quiz.units.length > 0 && (
              <span className="text-zinc-400 dark:text-zinc-500 text-[11px]">
                Units: {quiz.units.join(', ')}
              </span>
            )}
          </div>
        </div>

        {/* Right: Action */}
        <div className="flex items-center md:items-end gap-3 flex-shrink-0">
          {isCompleted ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <div className="text-xs font-semibold">
                <span>Completed</span>
                {completedScore !== null && <span className="ml-1.5 text-zinc-500 dark:text-zinc-400">({completedScore}%)</span>}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={onStart}
              className="w-full sm:w-auto px-5 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <span>Start Quiz</span>
              <ArrowRight className="w-3.5 h-3.5 text-white dark:text-zinc-950" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeaturedQuizCard;
