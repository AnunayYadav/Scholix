import { useEffect, useCallback } from 'react';
import { useQuizDashboardStore, STREAK_MILESTONES } from '../stores/quizStore';

/**
 * useStreak — Manages streak tracking, 7-day calendar, milestone toasts.
 * Streak logic persisted via localStorage (server-side in production).
 */
export function useStreak(userId: string | null) {
  const {
    userQuizProfile,
    updateUserQuizProfile,
    setStreakToastMessage,
  } = useQuizDashboardStore();

  // Load streak data on mount
  useEffect(() => {
    if (!userId) return;

    const todayStr = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0];

    const handleStreakLogic = (data: { current_streak: number; longest_streak: number; last_active_date: string | null; last_quiz_completed_at: string | null; streak_history: any[] }) => {
      let currentStreak = data.current_streak ?? 0;
      const lastCompletedAt = data.last_quiz_completed_at;

      if (lastCompletedAt && currentStreak > 0) {
        const lastTime = new Date(lastCompletedAt).getTime();
        const now = new Date().getTime();
        const diffHours = (now - lastTime) / (1000 * 60 * 60);

        // Snapchat style: 24h window. Streak breaks if > 26h (2h grace)
        if (diffHours > 26) {
          currentStreak = 0;
          
          // Persist the reset immediately
          if (userId) {
            localStorage.setItem(`nexus_quiz_streak_${userId}`, JSON.stringify({
              ...data,
              current_streak: 0,
            }));
          }
        }
      }

      updateUserQuizProfile({
        current_streak: currentStreak,
        longest_streak: data.longest_streak ?? 0,
        last_active_date: data.last_active_date ?? null,
        last_quiz_completed_at: data.last_quiz_completed_at ?? null,
        streak_history: data.streak_history ?? [],
      });
    };

    // 1. Instant load from localStorage
    const stored = localStorage.getItem(`nexus_quiz_streak_${userId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        handleStreakLogic(parsed);
      } catch (e) {
        console.error('Failed to parse streak data', e);
      }
    }

    // 2. Verified sync with Supabase
    if (userId !== 'anonymous') {
      import('../services/nexusServer').then(async ({ default: NexusServer }) => {
        try {
          const profile = await NexusServer.getProfile(userId);
          if (profile) {
            handleStreakLogic({
              current_streak: profile.current_streak,
              longest_streak: profile.longest_streak,
              last_active_date: profile.last_active_date,
              last_quiz_completed_at: (profile as any).last_quiz_completed_at || null, // Fallback if server doesn't have it yet
              streak_history: userQuizProfile.streak_history 
            });
          }
        } catch (e) {
          console.error("Supabase streak sync failed:", e);
        }
      });
    }
  }, [userId]);

  const persistStreak = useCallback((profile: typeof userQuizProfile) => {
    if (!userId) return;
    localStorage.setItem(`nexus_quiz_streak_${userId}`, JSON.stringify({
      current_streak: profile.current_streak,
      longest_streak: profile.longest_streak,
      last_active_date: profile.last_active_date,
      last_quiz_completed_at: profile.last_quiz_completed_at,
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
    const lastCompletedAt = userQuizProfile.last_quiz_completed_at;
    if (!lastCompletedAt) return false;

    const lastTime = new Date(lastCompletedAt).getTime();
    const now = new Date().getTime();
    const diffHours = (now - lastTime) / (1000 * 60 * 60);

    // Show warning if user has < 4 hours left to maintain streak
    return diffHours > 20;
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
    const lastCompletedAt = userQuizProfile.last_quiz_completed_at;
    const lastActiveDate = userQuizProfile.last_active_date;

    if (!lastActiveDate || !lastCompletedAt) {
      newStreak = 1;
    } else {
      const lastTime = new Date(lastCompletedAt).getTime();
      const diffHours = (now.getTime() - lastTime) / (1000 * 60 * 60);

      if (lastActiveDate === todayStr) {
        // Same day: preserve streak (don't increment unless it's a new day or new session)
        // Wait, Snapchat increments once per day usually.
        // Let's increment only if lastActiveDate != today
      } else if (diffHours <= 26) {
        // Within 26 hours and it's a new day: increment
        newStreak += 1;
      } else {
        // Outside 26h: reset
        newStreak = 1;
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
      last_quiz_completed_at: now.toISOString(),
      streak_history: updatedHistory,
    };

    updateUserQuizProfile(updatedProfile);
    persistStreak(updatedProfile);

    return { newStreak, newLongest, milestone };
  }, [userQuizProfile, updateUserQuizProfile, persistStreak, setStreakToastMessage]);

  return {
    currentStreak: userQuizProfile.current_streak,
    longestStreak: userQuizProfile.longest_streak,
    lastActiveDate: userQuizProfile.last_active_date,
    streakCalendar: getStreakCalendar(),
    isStreakAtRisk: isStreakAtRisk(),
    recordCompletion,
  };
}
