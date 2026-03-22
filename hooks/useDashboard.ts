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

  // Try to get questions of the target difficulty, fallback to all MCQs  
  let questions = questionsPool.filter(q =>
    q.type !== 'subjective' &&
    q.type !== 'coding' &&
    (q.difficulty || 'medium') === difficulty
  );

  if (questions.length < 5) {
    // Fallback: use all non-subjective, non-coding questions
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
  // Create a window seed: changes every 3 days
  const doy = dayOfYear(today);
  const windowIndex = Math.floor(doy / 3);
  const year = new Date(today + 'T00:00:00Z').getFullYear();
  const seed = hashStr(`challenges_${year}_${windowIndex}`);
  const rng = seededRandom(seed);

  const subjects = await NexusServer.fetchSubjectNames();
  if (subjects.length === 0) return [];

  // Calculate expiration: end of the current 3-day window
  const windowStart = new Date(new Date(year, 0, windowIndex * 3 + 1).getTime());
  const expiresAt = new Date(windowStart.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const startsAt = windowStart.toISOString();

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

    // Verify the subject has enough questions
    const pool: QuizQuestion[] = await NexusServer.fetchQuestions(subjectCode);
    const mcqs = pool.filter(q => q.type !== 'subjective' && q.type !== 'coding');
    
    if (mcqs.length < 5) continue;

    // Determine units (from all available MCQs for that subject)
    const units = Array.from(new Set(mcqs.map(q => String(q.unit || 'General')).filter(Boolean))).sort();

    challenges.push({
      id: `challenge_${windowIndex}_${i}_${year}`,
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
