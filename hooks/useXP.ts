import { useEffect, useCallback } from 'react';
import { useQuizDashboardStore, getLevelInfo, LEVEL_THRESHOLDS, XPBreakdownItem, XPResult } from '../stores/quizStore';

/**
 * useXP — Manages XP state, calculates breakdowns client-side for display,
 * and persists via localStorage (server-side would use Supabase Edge Functions).
 */
export function useXP(userId: string | null) {
  const {
    userQuizProfile,
    updateUserQuizProfile,
    setShowXPBreakdown,
    setLastXPResult,
    setShowLevelUp,
  } = useQuizDashboardStore();

  // Load XP data from localStorage then Supabase
  useEffect(() => {
    if (!userId) return;
    
    // 1. Instant load from localStorage
    const stored = localStorage.getItem(`nexus_quiz_xp_${userId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        updateUserQuizProfile({
          total_xp: parsed.total_xp ?? 0,
          level: parsed.level ?? 1,
          level_title: parsed.level_title ?? 'Beginner',
          xp_history: parsed.xp_history ?? [],
        });
      } catch (e) {
        console.error('Failed to parse XP data', e);
      }
    }

    // 2. Verified sync with Supabase if logged in
    if (userId !== 'anonymous') {
      import('../services/nexusServer').then(async ({ default: NexusServer }) => {
        try {
          const [profile, history] = await Promise.all([
            NexusServer.getProfile(userId),
            NexusServer.fetchUserQuizAttempts(userId)
          ]);

          if (profile) {
            const currentLevel = profile.level ?? 1;
            const unlockedFrames = profile.unlocked_frames || [];
            let newUnlocked = false;

            // Check if user should have frames for current or lower levels
            LEVEL_THRESHOLDS.forEach(tier => {
              if (tier.level <= currentLevel && tier.rewardFrame && !unlockedFrames.includes(tier.rewardFrame)) {
                unlockedFrames.push(tier.rewardFrame);
                newUnlocked = true;
              }
            });

            const profileUpdates = {
              total_xp: profile.total_xp ?? 0,
              level: currentLevel,
              level_title: profile.level_title ?? 'Beginner',
              current_streak: profile.current_streak ?? 0,
              longest_streak: profile.longest_streak ?? 0,
              xp_history: history || [],
              unlocked_frames: unlockedFrames,
              avatar_frame: profile.avatar_frame || '',
            };

            updateUserQuizProfile(profileUpdates);

            // Sync back to Supabase if catch-up happened
            if (newUnlocked) {
              NexusServer.updateProfile(userId, { unlocked_frames: unlockedFrames }).catch(console.error);
            }
          }
        } catch (e) {
          console.error("Supabase sync failed:", e);
        }
      });
    }
  }, [userId, updateUserQuizProfile]);
  // Save XP data to localStorage whenever it changes
  const persistXP = useCallback((profile: typeof userQuizProfile) => {
    if (!userId) return;
    localStorage.setItem(`nexus_quiz_xp_${userId}`, JSON.stringify({
      total_xp: profile.total_xp,
      level: profile.level,
      level_title: profile.level_title,
      xp_history: profile.xp_history.slice(-50), // Keep last 50 entries
    }));
  }, [userId]);

  /**
   * Calculate and award XP for a quiz completion.
   * 
   * KEY RULES:
   * - Score 0%  → 0 XP, no bonuses
   * - Score <20% → Only base XP (no bonuses)
   * - Speed bonus only if score ≥ 50%
   * - Perfect bonus only if 100%
   * - Featured/challenge bonuses only if score ≥ 20%
   * - answeredCount: how many questions the user actually answered
   *   If 0, no XP at all.
   */
  const awardXP = useCallback((params: {
    scorePercentage: number;
    timeTakenSeconds: number;
    totalTimeAllowed: number;
    hintsUsed: number;
    isFeaturedQuiz: boolean;
    quizId: string;
    answeredCount?: number;
    totalQuestions?: number;
  }): XPResult => {
    const {
      scorePercentage, timeTakenSeconds, totalTimeAllowed,
      hintsUsed, isFeaturedQuiz, quizId,
      answeredCount = 1, totalQuestions = 1,
    } = params;

    const breakdown: XPBreakdownItem[] = [];

    // ═══════════ Guard: No XP for unattempted quizzes ═══════════
    if (answeredCount === 0 || scorePercentage === 0) {
      const result: XPResult = {
        breakdown: [{ label: 'No questions answered correctly', value: 0 }],
        totalEarned: 0,
        newTotalXP: userQuizProfile.total_xp,
        leveledUp: false,
      };
      setLastXPResult(result);
      setShowXPBreakdown(true);
      return result;
    }

    // Base XP = score percentage (0-100)
    const baseXP = Math.round(scorePercentage);
    breakdown.push({ label: 'Base XP', value: baseXP });

    // ═══════════ Speed Bonus (score ≥ 50% required) ═══════════
    let speedBonus = 0;
    if (scorePercentage >= 50 && totalTimeAllowed > 0 && timeTakenSeconds < totalTimeAllowed / 2) {
      speedBonus = 10;
      breakdown.push({ label: 'Speed Bonus', value: 10 });
    }

    // ═══════════ Hint Penalty ═══════════
    let hintPenalty = 0;
    if (hintsUsed > 0) {
      hintPenalty = hintsUsed * 5;
      breakdown.push({ label: 'Hint Penalty', value: -hintPenalty });
    }

    // ═══════════ Featured Quiz Bonus (score ≥ 20% required) ═══════════
    let featuredBonus = 0;
    if (isFeaturedQuiz && scorePercentage >= 20) {
      featuredBonus = 25;
      breakdown.push({ label: 'Featured Quiz Bonus', value: 25 });
    }

    // ═══════════ Perfect Score Bonus ═══════════
    let perfectBonus = 0;
    if (scorePercentage === 100) {
      perfectBonus = 15;
      breakdown.push({ label: 'Perfect Score', value: 15 });
    }

    // ═══════════ Attempt Bonus (answered all questions) ═══════════
    let attemptBonus = 0;
    if (totalQuestions > 0 && answeredCount >= totalQuestions && scorePercentage >= 20) {
      attemptBonus = 5;
      breakdown.push({ label: 'Full Attempt', value: 5 });
    }

    // Total — minimum is 0 (no free XP)
    const rawTotal = baseXP + speedBonus - hintPenalty + featuredBonus + perfectBonus + attemptBonus;
    const totalEarned = Math.max(0, rawTotal);

    if (totalEarned === 0) {
      const result: XPResult = {
        breakdown: [{ label: 'Score too low', value: 0 }],
        totalEarned: 0,
        newTotalXP: userQuizProfile.total_xp,
        leveledUp: false,
      };
      setLastXPResult(result);
      setShowXPBreakdown(true);
      return result;
    }

    const oldXP = userQuizProfile.total_xp;
    const newTotalXP = oldXP + totalEarned;
    const oldLevel = getLevelInfo(oldXP);
    const newLevel = getLevelInfo(newTotalXP);
    const leveledUp = newLevel.level > oldLevel.level;

    const result: XPResult = {
      breakdown,
      totalEarned,
      newTotalXP,
      leveledUp,
      newLevel: leveledUp ? LEVEL_THRESHOLDS.find(l => l.level === newLevel.level) : undefined,
      updatedHistory: [
        ...userQuizProfile.xp_history,
        { quiz_id: quizId, xp_earned: totalEarned, breakdown, earned_at: new Date().toISOString() }
      ],
    };

    if (leveledUp) {
      // Unlock frame if new level has one
      const unlockedFrames = [...(userQuizProfile.unlocked_frames || [])];
      let updatedFrameState = {};
      
      if (newLevel.rewardFrame && !unlockedFrames.includes(newLevel.rewardFrame)) {
        unlockedFrames.push(newLevel.rewardFrame);
        updatedFrameState = { unlocked_frames: unlockedFrames };
      }

      // Update profile with new XP, level AND rewards
      const updatedProfile = {
        ...userQuizProfile,
        total_xp: newTotalXP,
        level: newLevel.level,
        level_title: newLevel.title,
        xp_history: result.updatedHistory!,
        ...updatedFrameState
      };

      updateUserQuizProfile(updatedProfile);
      persistXP(updatedProfile);
      
      // Update Supabase if logged in
      if (userId && userId !== 'anonymous') {
        import('../services/nexusServer').then(({ default: NexusServer }) => {
          NexusServer.updateProfile(userId, {
            total_xp: newTotalXP,
            level: newLevel.level,
            level_title: newLevel.title,
            xp_history: result.updatedHistory!,
            ...updatedFrameState
          }).catch(console.error);
        });
      }

      // Delay level-up overlay slightly for dramatic effect
      setTimeout(() => setShowLevelUp(true), 2000);
    } else {
      // Just update current state if no level up
      const updatedProfile = {
        ...userQuizProfile,
        total_xp: newTotalXP,
        level: newLevel.level,
        level_title: newLevel.title,
        xp_history: result.updatedHistory!,
      };
      updateUserQuizProfile(updatedProfile);
      persistXP(updatedProfile);
      
      // Update Supabase
      if (userId && userId !== 'anonymous') {
        import('../services/nexusServer').then(({ default: NexusServer }) => {
          NexusServer.updateProfile(userId, {
            total_xp: newTotalXP,
            xp_history: result.updatedHistory!
          }).catch(console.error);
        });
      }
    }

    return result;
  }, [userId, userQuizProfile, updateUserQuizProfile, persistXP, setShowXPBreakdown, setLastXPResult, setShowLevelUp]);

  const levelInfo = getLevelInfo(userQuizProfile.total_xp);

  return {
    totalXP: userQuizProfile.total_xp,
    level: levelInfo,
    xpHistory: userQuizProfile.xp_history,
    awardXP,
  };
}
