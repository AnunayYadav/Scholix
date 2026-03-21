import { useEffect, useCallback } from 'react';
import { useQuizDashboardStore, STREAK_MILESTONES } from '../stores/quizStore';

/**
 * useStreak — Manages streak tracking, 7-day calendar, milestone toasts.
 * Streak logic persisted via localStorage (server-side in production).
 */
export function useStreak(userId: string | null) {
  const {
    userQuizProfile,
    setUserQuizProfile,
    setStreakToastMessage,
  } = useQuizDashboardStore();

  // Load streak data on mount
  useEffect(() => {
    if (!userId) return;
    const stored = localStorage.getItem(`nexus_quiz_streak_${userId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserQuizProfile({
          ...userQuizProfile,
          current_streak: parsed.current_streak ?? 0,
          longest_streak: parsed.longest_streak ?? 0,
          last_active_date: parsed.last_active_date ?? null,
          streak_history: parsed.streak_history ?? [],
        });
      } catch (e) {
        console.error('Failed to parse streak data', e);
      }
    }
  }, [userId]);

  const persistStreak = useCallback((profile: typeof userQuizProfile) => {
    if (!userId) return;
    localStorage.setItem(`nexus_quiz_streak_${userId}`, JSON.stringify({
      current_streak: profile.current_streak,
      longest_streak: profile.longest_streak,
      last_active_date: profile.last_active_date,
      streak_history: profile.streak_history.slice(-30), // Keep last 30 days
    }));
  }, [userId]);

  /**
   * Get the last 7 days streak calendar data
   */
  const getStreakCalendar = useCallback(() => {
    const today = new Date();
    const calendar: { date: string; completed: boolean; isToday: boolean }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = userQuizProfile.streak_history.find(
        (sh) => sh.date === dateStr
      );
      calendar.push({
        date: dateStr,
        completed: entry ? entry.count > 0 : false,
        isToday: i === 0,
      });
    }

    return calendar;
  }, [userQuizProfile.streak_history]);

  /**
   * Check if streak is at risk (no quiz completed today)
   */
  const isStreakAtRisk = useCallback(() => {
    if (userQuizProfile.current_streak === 0) return false;
    const today = new Date().toISOString().split('T')[0];
    const entry = userQuizProfile.streak_history.find(sh => sh.date === today);
    return !entry || entry.count === 0;
  }, [userQuizProfile]);

  /**
   * Record a quiz completion for streak tracking.
   * Grace period: first 2 hours of a new day count as previous day.
   */
  const recordCompletion = useCallback(() => {
    const now = new Date();
    // Grace period: if it's within first 2 hours (UTC), also count previous day
    const utcHour = now.getUTCHours();
    const todayStr = now.toISOString().split('T')[0];

    // Update streak history for today
    const updatedHistory = [...userQuizProfile.streak_history];
    const todayIdx = updatedHistory.findIndex(h => h.date === todayStr);
    if (todayIdx >= 0) {
      updatedHistory[todayIdx].count += 1;
    } else {
      updatedHistory.push({ date: todayStr, count: 1 });
    }

    // Calculate streak
    let newStreak = userQuizProfile.current_streak;
    const lastActive = userQuizProfile.last_active_date;

    if (!lastActive) {
      // First ever quiz
      newStreak = 1;
    } else {
      const lastDate = new Date(lastActive);
      const diffMs = now.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (lastActive === todayStr) {
        // Already counted today, no streak change
      } else if (diffDays === 1 || (diffDays === 0 && utcHour < 2)) {
        // Consecutive day or grace period
        newStreak += 1;
      } else if (diffDays > 1) {
        // Check grace period for yesterday
        if (diffDays === 2 && utcHour < 2) {
          newStreak += 1; // grace period
        } else {
          newStreak = 1; // streak broken, restart
        }
      }
    }

    const newLongest = Math.max(userQuizProfile.longest_streak, newStreak);

    // Check for milestone bonuses
    const milestone = STREAK_MILESTONES.find(m => m.days === newStreak);
    if (milestone) {
      setStreakToastMessage(milestone.label);
      // Auto-dismiss after 4 seconds
      setTimeout(() => setStreakToastMessage(null), 4000);
    }

    const updatedProfile = {
      ...userQuizProfile,
      current_streak: newStreak,
      longest_streak: newLongest,
      last_active_date: todayStr,
      streak_history: updatedHistory,
    };

    setUserQuizProfile(updatedProfile);
    persistStreak(updatedProfile);

    return { newStreak, milestone };
  }, [userQuizProfile, setUserQuizProfile, persistStreak, setStreakToastMessage]);

  return {
    currentStreak: userQuizProfile.current_streak,
    longestStreak: userQuizProfile.longest_streak,
    lastActiveDate: userQuizProfile.last_active_date,
    streakCalendar: getStreakCalendar(),
    isStreakAtRisk: isStreakAtRisk(),
    recordCompletion,
  };
}
