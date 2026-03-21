import React from 'react';
import { motion } from 'framer-motion';
import { useQuizDashboardStore, getLevelInfo } from '../../stores/quizStore';

interface UserCardProps {
  username: string;
  avatarUrl?: string;
  currentStreak: number;
  isStreakAtRisk: boolean;
  streakCalendar: { date: string; completed: boolean; isToday: boolean }[];
}

const UserCard: React.FC<UserCardProps> = ({
  username,
  avatarUrl,
  currentStreak,
  isStreakAtRisk,
  streakCalendar,
}) => {
  const { userQuizProfile } = useQuizDashboardStore();
  const levelInfo = getLevelInfo(userQuizProfile.total_xp);

  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : '??';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel p-6 md:p-8 rounded-[32px]"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        {/* Avatar + Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={username}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-500/20"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg shadow-orange-500/20">
                {initials}
              </div>
            )}
            {/* Level badge on avatar */}
            <div className="absolute -bottom-1.5 -right-1.5 bg-white dark:bg-dark-950 rounded-full p-0.5 shadow-sm">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[10px] font-semibold text-white">
                {levelInfo.level}
              </div>
            </div>
          </div>

          {/* Name + Level */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight truncate">
                {username || 'Verto'}
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-semibold tracking-wider whitespace-nowrap">
                {levelInfo.icon} {levelInfo.title}
              </span>
            </div>

            {/* XP Progress Bar */}
            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-semibold">
                <span className="text-slate-400 tracking-wider">
                  Level {levelInfo.level}
                </span>
                <span className="text-orange-500 tabular-nums">
                  {userQuizProfile.total_xp} / {levelInfo.nextLevel ? levelInfo.nextLevel.minXP : '∞'} XP
                  {levelInfo.nextLevel && (
                    <span className="text-slate-400 ml-1">→ {levelInfo.nextLevel.title}</span>
                  )}
                </span>
              </div>
              <div className="h-2 w-full max-w-xs bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelInfo.progress}%` }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Streak + Calendar */}
        <div className="flex items-center gap-5 flex-shrink-0">
          {/* Streak count */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl">🔥</span>
              <span className="text-2xl font-semibold text-slate-900 dark:text-white tabular-nums">
                {currentStreak}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider">
              Day Streak
            </span>
          </div>

          {/* Divider */}
          <div className="h-10 w-px bg-slate-200 dark:bg-white/10 hidden md:block" />

          {/* 7-day calendar */}
          <div className="hidden md:flex flex-col gap-1.5">
            <span className="text-[9px] font-semibold text-slate-400 tracking-wider text-center">
              Last 7 Days
            </span>
            <div className="flex items-center gap-1.5">
              {streakCalendar.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <div
                    className={`relative w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      day.isToday
                        ? day.completed
                          ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                          : 'bg-slate-200 dark:bg-dark-950 ring-2 ring-orange-500 ring-offset-1 ring-offset-white dark:ring-offset-dark-950 animate-pulse'
                        : day.completed
                        ? 'bg-emerald-500'
                        : 'bg-slate-200 dark:bg-white/10'
                    }`}
                  >
                    {day.completed && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" className="w-2.5 h-2.5">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[7px] font-semibold text-slate-400 tabular-nums">
                    {new Date(day.date).toLocaleDateString('en', { weekday: 'narrow' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Streak warning banner */}
      {isStreakAtRisk && currentStreak > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="mt-4 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2"
        >
          <span className="text-amber-500 text-sm">⚠️</span>
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            Don't break your streak! Complete a quiz today 🔥
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default UserCard;
