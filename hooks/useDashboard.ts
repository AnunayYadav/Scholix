import { useEffect, useCallback } from 'react';
import { useQuizDashboardStore, FeaturedQuiz, ActiveChallenge } from '../stores/quizStore';
import NexusServer from '../services/nexusServer';
import { QuizQuestion } from '../types';
import { SYLLABUS_DATA } from '../data/syllabusData';

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
// ═══════════════════════════════════════

const PREFIXES = [
  'Elite', 'Master', 'Legendary', 'Diamond', 'Grandmaster', 'Apex', 'Zenith', 
  'Prime', 'Ultra', 'Super', 'Pro', 'Gold', 'Silver', 'Ultimate', 'Hyper',
  'Titan', 'Mystic', 'Cosmic', 'Inferno', 'Nebula', 'Omega', 'Alpha', 'Velocity',
  'Radiant', 'Stellar', 'Eternal', 'Shadow', 'Azure', 'Crimson', 'Sonic'
];

const SUFFIXES = [
  'Challenge', 'Mastery', 'Champion', 'Gauntlet', 'Showdown', 'Sprint', 
  'Pro', 'Exam', 'Test', 'Assessment', 'Blitz', 'Trial', 'Rush', 'Quest',
  'Marathon', 'Conqueror', 'Vanguard', 'Clash', 'Duel', 'Hero', 'Warrior', 'Sage',
  'Specialist', 'Expert', 'Wizard', 'Architect', 'Commander', 'Reign'
];

const SPECIAL_ROUNDS = [
  'Speed Round:', 'Rapid Fire:', 'Deep Dive:', 'Expert Mode:', 'Sprint:',
  'The Great', 'Nexus Prime:', 'Lightning:', 'Insane Mode:', 'Turbo:',
  'Masterclass:', 'Final Frontier:'
];

function generateDynamicName(subject: string, rng: () => number): string {
  const shortName = subject.includes(':') ? subject.split(':')[1].trim() : (subject.includes('-') ? subject.split('-').pop()?.trim() || subject : subject);
  const pattern = Math.floor(rng() * 5);
  
  switch (pattern) {
    case 0: // Elite [Subject] Challenge
      return `${seededPick(PREFIXES, rng)} ${shortName} ${seededPick(SUFFIXES, rng)}`;
    case 1: // Speed Round: [Subject] Mastery
      return `${seededPick(SPECIAL_ROUNDS, rng)} ${shortName} ${seededPick(['Mastery', 'Champion', 'Sprint', 'Pro', 'Rush'], rng)}`;
    case 2: // [Subject] Mastery champion
      return `${shortName} ${seededPick(SUFFIXES, rng)} ${seededPick(['Master', 'Pro', 'Champion', 'Legend'], rng)}`;
    case 3: // [Subject] Mastery
      return `${shortName} ${seededPick(SUFFIXES, rng)}`;
    case 4: // [Prefix] [Subject] Mastery
    default:
      return `${seededPick(PREFIXES, rng)} ${shortName} ${seededPick(['Mastery', 'Expert', 'Pro'], rng)}`;
  }
}

const CHALLENGE_EMOJIS_MAP: Record<string, string> = {
  CHE110: '🧪', CSE101: '💻', CSE121: '🖥️', CSE320: '⚙️', CSE326: '📊',
  ECE249: '📡', PEL125: '🔬', PEL130: '🌍', INT108: '🐍', INT306: '🌐',
  MTH166: '📐', PHY110: '🔭',
};

const CHALLENGE_TEMPLATES = [
  { desc: 'Prove your mastery — all difficulty levels mixed', count: 15, timePerQ: 45, xp: 200, minLevel: undefined },
  { desc: 'Think fast and answer accurately!', count: 10, timePerQ: 20, xp: 150, minLevel: undefined },
  { desc: 'The ultimate syllabus challenge', count: 20, timePerQ: 45, xp: 250, minLevel: 2 },
];

async function generateFeaturedQuiz(): Promise<FeaturedQuiz | null> {
  const today = getTodayIST();
  const seed = hashStr(`featured_v3_${today}`);
  const rng = seededRandom(seed);

  const dbSubjects = await NexusServer.fetchSubjectNames();
  const syllabusSubjects = Object.keys(SYLLABUS_DATA);
  const subjects = Array.from(new Set([...syllabusSubjects, ...dbSubjects])).sort();

  if (!subjects || subjects.length === 0) return null;

  // Using a larger multiplier (e.g. 7) ensures we jump around more and don't just stay with 
  // alphabetical orders if only a few subjects have questions.
  const startIdx = (dayOfYear(today) * 7) % subjects.length;
  const candidateSubjects = [...subjects.slice(startIdx), ...subjects.slice(0, startIdx)];
  
  for (let sIdx = 0; sIdx < candidateSubjects.length; sIdx++) {
    const subject = candidateSubjects[sIdx];
    const subjectCode = (subject || '').split(':')[0].trim();
    const questionsPool: QuizQuestion[] = await NexusServer.fetchQuestions(subjectCode);
    
    if (!questionsPool || questionsPool.length === 0) continue;

    const difficulty = seededPick(['easy', 'medium', 'hard'] as const, rng);
    const allowedUnits = getAllowedUnits(today);

    // Filter relevant questions
    let questions = questionsPool.filter(q =>
      q.type !== 'subjective' &&
      q.type !== 'coding' &&
      (q.difficulty || 'medium') === difficulty &&
      allowedUnits.includes(q.unit || 1)
    );

    if (questions.length < 5) {
      questions = questionsPool.filter(q => 
        q.type !== 'subjective' && 
        q.type !== 'coding' &&
        allowedUnits.includes(q.unit || 1)
      );
    }

    if (questions.length < 5) continue; 

    // Once we find a valid subject, use entropy for questions and name
    const shuffled = seededShuffle(questions, rng).slice(0, 10);
    const unitsFound = Array.from(new Set(shuffled.map(q => String(q.unit || 'General')).filter(Boolean))).sort();
    const name = generateDynamicName(subject, rng);

    return {
      id: `featured_${today}`,
      date: today,
      name,
      subject,
      difficulty,
      questions: shuffled,
      units: unitsFound,
      xp_reward: shuffled.length * 10 + 25,
      generated_at: new Date().toISOString(),
    };
  }

  return null;
}

// ═══════════════════════════════════════
// Active Challenges Generation
// Mon, Wed, Fri releases with 3-5 day durations
// ═══════════════════════════════════════

async function generateActiveChallenges(): Promise<ActiveChallenge[]> {
  const today = getTodayIST();
  const currentFullDate = new Date(today + 'T00:00:00Z');
  
  // We check for the last 7 days to find active challenges released on Mon, Wed, Fri
  const releaseDays = [1, 3, 5]; // Mon, Wed, Fri
  const challenges: ActiveChallenge[] = [];
  
  const dbSubjects = await NexusServer.fetchSubjectNames();
  const syllabusSubjects = Object.keys(SYLLABUS_DATA);
  const subjects = Array.from(new Set([...syllabusSubjects, ...dbSubjects])).sort();
  
  if (subjects.length === 0) return [];

  // Iterate back up to 7 days
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(currentFullDate);
    checkDate.setUTCDate(currentFullDate.getUTCDate() - i);
    const dayOfWeek = checkDate.getUTCDay();
    const checkDateStr = checkDate.toISOString().split('T')[0];

    if (releaseDays.includes(dayOfWeek)) {
      // This was a release day!
      const releaseSeed = hashStr(`challenge_release_v3_${checkDateStr}`);
      const rng = seededRandom(releaseSeed);
      
      // Fixed 3 challenges per release day for better subject coverage
      const numOnThisDay = 3;
      
      // Rotate subjects based on checkDate + release index to ensure wide coverage
      // We use a different offset for each release day to avoid picking the same 3 subjects every week
      const dayOffset = dayOfYear(checkDateStr);
      const usedSubjectsOnDay = new Set<string>();
      
      for (let cIdx = 0; cIdx < numOnThisDay; cIdx++) {
        const cSeed = hashStr(`c_v3_${checkDateStr}_${cIdx}`);
        const cRng = seededRandom(cSeed);
        
        let validSubject: string | null = null;
        let pool: QuizQuestion[] = [];
        let subjectCode = '';
        
        const startSubjectIdx = (dayOffset * 3 + cIdx) % subjects.length;
        
        for (let offset = 0; offset < subjects.length; offset++) {
            const tryIdx = (startSubjectIdx + offset) % subjects.length;
            const chosenSubject = subjects[tryIdx];
            if (usedSubjectsOnDay.has(chosenSubject)) continue;
            
            subjectCode = (chosenSubject || '').split(':')[0].trim();
            pool = await NexusServer.fetchQuestions(subjectCode);
            if (pool.length >= 5) {
                validSubject = chosenSubject;
                break;
            }
        }
        
        if (!validSubject) continue;
        usedSubjectsOnDay.add(validSubject);

        // Expiry: Exactly 3 to 5 days as requested
        const durationDays = Math.floor(cRng() * 3) + 3; // 3, 4, or 5
        const randomHours = Math.floor(cRng() * 24);
        const randomMins = Math.floor(cRng() * 60);

        const expiryDate = new Date(checkDate);
        expiryDate.setUTCDate(checkDate.getUTCDate() + durationDays);
        expiryDate.setUTCHours(randomHours, randomMins, 0, 0);

        // If today is before expiry, it's active
        if (currentFullDate.getTime() < expiryDate.getTime()) {
           const template = CHALLENGE_TEMPLATES[cIdx % CHALLENGE_TEMPLATES.length];
           const emoji = CHALLENGE_EMOJIS_MAP[subjectCode] || seededPick(Object.values(CHALLENGE_EMOJIS_MAP), cRng);

           challenges.push({
             id: `challenge_${checkDateStr}_${cIdx}`,
             name: generateDynamicName(validSubject, cRng),
             description: template.desc,
             emoji,
             subject: validSubject,
             difficulty: Math.floor(cRng() * 3) + 1,
             question_count: Math.min(template.count, pool.length),
             time_limit_per_question: template.timePerQ,
             xp_reward: template.xp,
             starts_at: checkDate.toISOString(),
             expires_at: expiryDate.toISOString(),
             units: Array.from(new Set(pool.filter(q => q.unit).map(q => String(q.unit)))).slice(0, 3),
             min_level: template.minLevel,
           });
        }
      }
    }
  }

  // Deduplicate by ID and Sort by expiry (soonest first)
  const uniqueChallenges = Array.from(new Map(challenges.map(c => [c.id, c])).values());
  return uniqueChallenges.sort((a, b) => new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime());
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
