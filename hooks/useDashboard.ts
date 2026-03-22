import { useEffect, useCallback } from 'react';
import { useQuizDashboardStore, FeaturedQuiz, ActiveChallenge } from '../stores/quizStore';
import NexusServer from '../services/nexusServer';
import { QuizQuestion } from '../types';

// ═══════════════════════════════════════
// Deterministic Seeded Random — same result for all users on same date
// ═══════════════════════════════════════

/** Simple hash from a string to a number (djb2). */
function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) + s.charCodeAt(i);
    h = h & h; // Convert to 32-bit integer
  }
  return Math.abs(h);
}

/** Seeded pseudo-random generator (mulberry32). Returns [0,1). */
function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick an element deterministically from array using a seeded random fn. */
function seededPick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** Shuffle array deterministically. */
function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Get today's date string in IST (UTC+5:30). */
function getTodayIST(): string {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);
  return ist.toISOString().split('T')[0];
}

/** Get day-of-year from a date string. */
function dayOfYear(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00Z');
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/** 
 * Logic to follow college semester progression:
 * Aug -> Unit 1
 * Sep -> U1, U2
 * Oct -> U1, U2, U3
 * Nov -> U1-U4
 * Dec -> U1-U5
 * (Same for Jan-May semester)
 */
export function getAllowedUnits(dateStr: string): number[] {
  const d = new Date(dateStr + 'T00:00:00Z');
  const month = d.getUTCMonth(); // 0=Jan, 7=Aug
  
  let progress = 5; // Default to all
  
  if (month >= 7 && month <= 11) { // Aug - Dec (Sem 1)
    progress = (month - 7) + 1;
  } else if (month >= 0 && month <= 4) { // Jan - May (Sem 2)
    progress = month + 1;
  } else if (month === 5 || month === 6) { // June, July (Summer/Extra)
    progress = 5;
  }
  
  // Special case: By late November, everything should be unlocked
  const day = d.getUTCDate();
  if (month === 10 && day > 15) progress = 5; // Late Nov
  if (month === 4 && day > 15) progress = 5; // Late May
  
  const maxUnit = Math.min(5, Math.max(1, progress));
  return Array.from({ length: maxUnit }, (_, i) => i + 1);
}

/**
 * Determine the challenge window based on Mon, Wed, Fri refreshes.
 */
function getChallengeWindow(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00Z');
  const day = d.getUTCDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  const year = d.getUTCFullYear();
  
  // Mon(1), Tue(2) -> Window A
  // Wed(3), Thu(4) -> Window B
  // Fri(5), Sat(6), Sun(0) -> Window C
  
  let startsAt: Date;
  let expiresAt: Date;
  let label: string;
  
  if (day === 1 || day === 2) {
    label = 'mon';
    startsAt = new Date(d);
    if (day === 2) startsAt.setUTCDate(d.getUTCDate() - 1);
    expiresAt = new Date(startsAt);
    expiresAt.setUTCDate(startsAt.getUTCDate() + 2);
  } else if (day === 3 || day === 4) {
    label = 'wed';
    startsAt = new Date(d);
    if (day === 4) startsAt.setUTCDate(d.getUTCDate() - 1);
    expiresAt = new Date(startsAt);
    expiresAt.setUTCDate(startsAt.getUTCDate() + 2);
  } else {
    label = 'fri';
    startsAt = new Date(d);
    if (day === 6) startsAt.setUTCDate(d.getUTCDate() - 1);
    if (day === 0) startsAt.setUTCDate(d.getUTCDate() - 2);
    expiresAt = new Date(startsAt);
    expiresAt.setUTCDate(startsAt.getUTCDate() + 3);
  }
  
  const weekNum = Math.ceil(dayOfYear(startsAt.toISOString().split('T')[0]) / 7);
  return {
    windowId: `${year}_W${weekNum}_${label}`,
    startsAt: startsAt.toISOString(),
    expiresAt: expiresAt.toISOString()
  };
}

// ═══════════════════════════════════════
// Featured Quiz Generation
// Same quiz for ALL users on the same date.
// Difficulty cycles: easy → medium → hard → easy ...
// ═══════════════════════════════════════

const ADJECTIVES = ['Ultimate', 'Daily', 'Lightning', 'Power', 'Classic', 'Master', 'Speed', 'Elite', 'Pro', 'Rapid'];
const CHALLENGE_TYPES = ['Challenge', 'Sprint', 'Blitz', 'Showdown', 'Gauntlet', 'Trial', 'Test', 'Quest', 'Exam', 'Rush'];

async function generateFeaturedQuiz(): Promise<FeaturedQuiz | null> {
  const today = getTodayIST();
  const seed = hashStr(`featured_${today}`);
  const rng = seededRandom(seed);

  const subjects = await NexusServer.fetchSubjectNames();
  if (!subjects || subjects.length === 0) return null;

  // Pick subject based on seeded random
  const subject = seededPick(subjects.sort(), rng);
  const subjectCode = (subject || '').split(':')[0].trim();
  const questionsPool: QuizQuestion[] = await NexusServer.fetchQuestions(subjectCode);
  
  if (!questionsPool || questionsPool.length === 0) return null;

  // Difficulty cycles based on day of year: 0=easy, 1=medium, 2=hard
  const doy = dayOfYear(today);
  const difficultyMap: Record<number, 'easy' | 'medium' | 'hard'> = { 0: 'easy', 1: 'medium', 2: 'hard' };
  const difficulty = difficultyMap[doy % 3];

  const allowedUnits = getAllowedUnits(today);

  // Try to get questions of the target difficulty AND allowed units
  let questions = questionsPool.filter(q =>
    q.type !== 'subjective' &&
    q.type !== 'coding' &&
    (q.difficulty || 'medium') === difficulty &&
    allowedUnits.includes(q.unit || 1)
  );

  if (questions.length < 5) {
    // Fallback: use all non-subjective, non-coding questions within allowed units
    questions = questionsPool.filter(q => 
      q.type !== 'subjective' && 
      q.type !== 'coding' &&
      allowedUnits.includes(q.unit || 1)
    );
  }

  // Final fallback: if NO questions in these units, ignore unit constraint
  if (questions.length === 0) {
    questions = questionsPool.filter(q => q.type !== 'subjective' && q.type !== 'coding');
  }

  if (questions.length === 0) return null;

  // Deterministic shuffle and pick 10
  const shuffled = seededShuffle(questions, rng).slice(0, 10);
  const unitsFound = Array.from(new Set(shuffled.map(q => String(q.unit || 'General')).filter(Boolean))).sort();

  // Generate name deterministically
  const adj = seededPick(ADJECTIVES, rng);
  const type = seededPick(CHALLENGE_TYPES, rng);
  const shortName = subject.includes('-') ? subject.split('-').pop()?.trim() || subject : subject;
  const name = `${adj} ${shortName} ${type}`;

  const xpBase = shuffled.length * 10;
  const featuredBonus = 25;

  return {
    id: `featured_${today}`,
    date: today,
    name,
    subject,
    difficulty,
    questions: shuffled,
    units: unitsFound,
    xp_reward: xpBase + featuredBonus,
    generated_at: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════
// Active Challenges Generation
// Generated per 3-day window — same for all users.
// Up to 3 challenges, each from a different subject.
// ═══════════════════════════════════════

const CHALLENGE_EMOJIS_MAP: Record<string, string> = {
  CHE110: '🧪', CSE101: '💻', CSE121: '🖥️', CSE320: '⚙️', CSE326: '📊',
  ECE249: '📡', PEL125: '🔬', PEL130: '🌍', INT108: '🐍', INT306: '🌐',
  MTH166: '📐', PHY110: '🔭',
};

const CHALLENGE_TEMPLATES = [
  { nameTemplate: '{subject} Mastery', desc: 'Prove your mastery — all difficulty levels mixed', count: 15, diff: 2, timePerQ: 45, xp: 200, minLevel: undefined },
  { nameTemplate: 'Speed Round: {subject}', desc: '20 seconds per question — think fast!', count: 10, diff: 2, timePerQ: 20, xp: 150, minLevel: undefined },
  { nameTemplate: '{subject} Gauntlet', desc: 'Full syllabus, hard mode — the ultimate test', count: 20, diff: 3, timePerQ: 45, xp: 250, minLevel: 2 },
];

async function generateActiveChallenges(): Promise<ActiveChallenge[]> {
  const today = getTodayIST();
  const { windowId, startsAt, expiresAt } = getChallengeWindow(today);

  const seed = hashStr(`challenges_${windowId}`);
  const rng = seededRandom(seed);
  const allowedUnits = getAllowedUnits(today);

  const subjects = await NexusServer.fetchSubjectNames();
  if (subjects.length === 0) return [];

  // Pick 3 unique subjects deterministically
  const shuffledSubjects = seededShuffle(subjects.sort(), rng);
  const numChallenges = Math.min(3, subjects.length);

  const challenges: ActiveChallenge[] = [];
  for (let i = 0; i < numChallenges; i++) {
    const subject = shuffledSubjects[i];
    const template = CHALLENGE_TEMPLATES[i % CHALLENGE_TEMPLATES.length];
    const subjectCode = (subject || '').split(':')[0].trim();
    const shortName = subject.includes('-') ? subject.split('-').pop()?.trim() || subject : subject;
    const emoji = CHALLENGE_EMOJIS_MAP[subjectCode] || CHALLENGE_EMOJIS_MAP[subject] || seededPick(Object.values(CHALLENGE_EMOJIS_MAP), rng);

    // Verify the subject has enough questions within allowed units
    const pool: QuizQuestion[] = await NexusServer.fetchQuestions(subjectCode);
    let mcqs = pool.filter(q => 
      q.type !== 'subjective' && 
      q.type !== 'coding' &&
      allowedUnits.includes(q.unit || 1)
    );
    
    if (mcqs.length < 5) {
      // Fallback to all units if restricted ones are empty
      mcqs = pool.filter(q => q.type !== 'subjective' && q.type !== 'coding');
    }
    
    if (mcqs.length < 5) continue;

    // Determine units (from filtered pool)
    const units = Array.from(new Set(mcqs.map(q => String(q.unit || 'General')).filter(Boolean))).sort();

    challenges.push({
      id: `challenge_${windowId}_${i}`,
      name: template.nameTemplate.replace('{subject}', shortName),
      description: template.desc,
      emoji,
      subject,
      difficulty: template.diff,
      question_count: Math.min(template.count, mcqs.length),
      time_limit_per_question: template.timePerQ,
      xp_reward: template.xp,
      starts_at: startsAt,
      expires_at: expiresAt,
      units,
      min_level: template.minLevel,
    });
  }

  return challenges;
}

// ═══════════════════════════════════════
// useDashboard Hook
// ═══════════════════════════════════════
export function useDashboard(userId: string | null) {
  const {
    setFeaturedQuiz,
    setActiveChallenges,
    setIsDashboardLoading,
    setTodayCompletions,
    setFeaturedCompleted,
    setFeaturedScore,
    featuredQuiz,
    activeChallenges,
    markChallengeCompleted,
  } = useQuizDashboardStore();

  const loadDashboard = useCallback(async () => {
    setIsDashboardLoading(true);
    try {
      await Promise.all([
        loadFeaturedQuiz(),
        loadActiveChallenges(),
        loadTodayCompletions(),
      ]);
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setIsDashboardLoading(false);
    }
  }, [userId]);


  const loadFeaturedQuiz = async () => {
    const today = getTodayIST();
    const cacheKey = `nexus_featured_quiz_${today}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Validate it's for today
        if (parsed.date === today) {
          setFeaturedQuiz(parsed);
        } else {
          throw new Error('stale');
        }
      } catch {
        const fresh = await generateFeaturedQuiz();
        if (fresh) {
          localStorage.setItem(cacheKey, JSON.stringify(fresh));
          setFeaturedQuiz(fresh);
        }
      }
    } else {
      // Clean old featured quiz caches
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith('nexus_featured_quiz_') && key !== cacheKey) {
          localStorage.removeItem(key);
        }
      }

      const fresh = await generateFeaturedQuiz();
      if (fresh) {
        localStorage.setItem(cacheKey, JSON.stringify(fresh));
        setFeaturedQuiz(fresh);
      }
    }

    // Check completion specifically for today's featured quiz
    // Already have 'today' defined above
    const storageKeys = [ `nexus_completions_${userId}` ];
    if (userId && userId !== 'anonymous') storageKeys.push('nexus_completions_anonymous');
    
    let todayFeatured: any = null;
    
    for (const key of storageKeys) {
      const completions = JSON.parse(localStorage.getItem(key) || '[]');
      todayFeatured = completions.find((c: any) => 
        c.type === 'featured' && 
        (c.quiz_id === `featured_${today}` || c.quiz_id?.startsWith(`featured_${today}`))
      );
      if (todayFeatured) break;
    }

    if (todayFeatured) {
        setFeaturedCompleted(true);
        setFeaturedScore(todayFeatured.score_percentage);
    }
  };

  const loadActiveChallenges = async () => {
    // Challenges are deterministic per 3-day window, always regenerate for correctness
    const fresh = await generateActiveChallenges();
    setActiveChallenges(fresh);
  };

  const loadTodayCompletions = async () => {
    // Check both current user and anonymous fallback
    const storageKeys = [ `nexus_completions_${userId}` ];
    if (userId && userId !== 'anonymous') storageKeys.push('nexus_completions_anonymous');

    const today = getTodayIST();
    let allCompletions: any[] = [];
    
    for (const key of storageKeys) {
        const completions = JSON.parse(localStorage.getItem(key) || '[]');
        allCompletions = [...allCompletions, ...completions];
    }

    const todayEntries = allCompletions.filter((c: any) => c.completed_at?.startsWith(today));
    
    // Also update challenge completions from all time (or at least recent enough)
    const challengeIds = allCompletions
      .filter((c: any) => c.type === 'challenge')
      .map((c: any) => c.quiz_id);
    
    challengeIds.forEach((id: string) => {
      // Extract original challenge ID from quiz ID if it was formatted with timestamp
      const baseId = id.startsWith('challenge_') ? id.replace(/^challenge_/, '').split('_')[0] : id;
      // We also save formatted as challenge_WINDOW_I_YEAR directly in some cases
      // So let's just mark the ID as is
      markChallengeCompleted(id);
      // And also if it's the base challenge ID
      if (id.includes('_')) {
          const parts = id.split('_');
          if (parts.length >= 4 && parts[0] === 'challenge') {
              // Format was challenge_WIN_I_YEAR_TS
              const originalId = `${parts[0]}_${parts[1]}_${parts[2]}_${parts[3]}`;
              markChallengeCompleted(originalId);
          }
      }
    });

    setTodayCompletions(todayEntries);
  };

  const saveCompletion = useCallback((completion: {
    quiz_id: string;
    type: 'featured' | 'challenge' | 'custom';
    score_percentage: number;
    xp_earned: number;
  }) => {
    if (!userId) return;
    const key = `nexus_completions_${userId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push({
      ...completion,
      completed_at: new Date().toISOString(),
    });
    // Keep last 100 completions
    localStorage.setItem(key, JSON.stringify(existing.slice(-100)));
  }, [userId]);

  useEffect(() => {
    loadDashboard();
  }, [userId]);

  return {
    loadDashboard,
    saveCompletion,
    featuredQuiz,
    activeChallenges,
  };
}
