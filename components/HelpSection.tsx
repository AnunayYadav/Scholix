import React, { useState, useMemo } from 'react';
import { useUniversity } from '../hooks/useUniversity';
import { Search, ChevronDown, X } from 'lucide-react';

interface FaqItem {
  id: string;
  q: string;
  a: string;
  tags: string[];
}

interface FaqCategory {
  id: string;
  name: string;
  questions: FaqItem[];
}

// Smart loose search slug & token generator
const toSlug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/[\s_-]+/g, ' ')
    .trim();

// Campus-specific domain synonyms for smart loose search
const SYNONYM_MAP: Record<string, string[]> = {
  attendance: ['bunk', 'skip', 'safe', 'proxy', 'percentage', '75', 'leave', 'duty', 'dl', 'medical', 'lecture', 'class', 'attend'],
  bunk: ['attendance', 'skip', 'safe', 'safe to skip', 'percentage', '75', 'leave', 'proxy', 'miss'],
  skip: ['bunk', 'attendance', 'safe to skip', 'lecture', 'miss'],
  cgpa: ['gpa', 'sgpa', 'grade', 'grading', 'relative', 'pointer', 'marks', 'calculator', 'target', 'backlog', 'reappear', 'score'],
  gpa: ['cgpa', 'sgpa', 'grade', 'pointer', 'marks', 'calculator'],
  quiz: ['exam', 'test', 'pyq', 'question', 'midterm', 'endterm', 'mock', 'practice', 'solution', 'xp', 'streak', 'levels', 'challenge'],
  pyq: ['quiz', 'exam', 'paper', 'previous', 'question', 'questions', 'endterm', 'midterm'],
  exam: ['quiz', 'test', 'pyq', 'midterm', 'endterm', 'papers', 'backlog'],
  study: ['pdf', 'notes', 'material', 'timer', 'focus', 'library', 'contribute', 'download', 'syllabus', 'books', 'reader'],
  pdf: ['study', 'notes', 'reader', 'viewer', 'material', 'timer', 'focus', 'download'],
  notes: ['pdf', 'study', 'contribute', 'handwritten', 'solved', 'library', 'pyq'],
  hostel: ['campus', 'room', 'roommate', 'flat', 'warden', 'gate', 'turnstile', 'emergency', 'rescue', 'hospital', 'security', 'canteen'],
  roommate: ['flat', 'hostel', 'room', 'pg', 'stay', 'flatmate', 'finder'],
  emergency: ['rescue', 'warden', 'ambulance', 'hospital', 'security', 'police', 'dispensary', 'help', 'contact'],
  market: ['buy', 'sell', 'drafter', 'cycle', 'apron', 'used', 'products', 'roommate', 'exchange', 'store', 'cart'],
  account: ['password', 'login', 'reset', 'email', 'privacy', 'security', 'cheating', 'integrity', 'ban', 'rules', 'profile']
};

const HelpSection: React.FC = () => {
  const { universityInfo: university, fullBrandName, shortBrandName } = useUniversity();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const uName = university?.shortName || shortBrandName || 'LPU';

  const faqData: FaqCategory[] = useMemo(() => [
    {
      id: 'attendance',
      name: 'Attendance & Timetable',
      questions: [
        {
          id: 'att-1',
          q: "How does the 'Safe to Skip / Bunk' calculation work?",
          a: `It compares your current attended classes against the institutional 75% threshold at ${uName} to determine the exact number of upcoming lectures you can miss without falling below the requirement. If your attendance is already under 75%, it calculates how many consecutive classes you must attend to recover.`,
          tags: ['attendance', 'bunk', 'safe to skip', '75 percent', 'calculator', 'formula', 'miss class']
        },
        {
          id: 'att-2',
          q: "Does Scholix factor in Duty Leave (DL) and Medical Certificates?",
          a: "Yes. In the Attendance Tracker you can log approved Duty Leaves (event duties, hackathons, sports) and Medical Leaves. Scholix adjusts your effective attendance margin so your safe-to-skip calculations accurately reflect institutional record adjustments.",
          tags: ['duty leave', 'dl', 'medical', 'leave', 'attendance adjustment', 'events', 'sports']
        },
        {
          id: 'att-3',
          q: "How do I sync or customize my weekly lecture schedule?",
          a: "Go to Timetable Hub. You can select your branch/section preset to populate your schedule instantly or manually adjust lecture blocks, lab timings, and classroom numbers. Your dashboard then displays live countdowns to your next class.",
          tags: ['timetable', 'schedule', 'classes', 'section', 'lecture timing', 'classroom', 'room number']
        },
        {
          id: 'att-4',
          q: "What should I do if my attendance drops below 75%?",
          a: "When attendance dips below 75%, Scholix flags the course and provides an exact recovery target showing the number of consecutive sessions needed to cross 75%. Be sure to submit all pending duty leaves or medical certificates before the end-term cutoff.",
          tags: ['low attendance', '75 percent rule', 'detained', 'recovery', 'consecutive classes', 'coordinator']
        }
      ]
    },
    {
      id: 'academics',
      name: 'CGPA & Relative Grading',
      questions: [
        {
          id: 'cgpa-1',
          q: `Does the CGPA calculator support ${uName}'s relative grading?`,
          a: `Yes. Relative grading shifts cutoff marks dynamically according to your batch's bell curve. Scholix computes the 'Guaranteed Minimum Target': if you reach the projected score band, you are guaranteed that grade (e.g. O, A+, A) regardless of standard curve shifts.`,
          tags: ['cgpa', 'sgpa', 'relative grading', 'bell curve', 'cutoffs', 'grade scale', '10 point scale']
        },
        {
          id: 'cgpa-2',
          q: "How does the Target CGPA Planner help me plan future semesters?",
          a: "Enter your target graduation CGPA (e.g., 8.5 or 9.0) and remaining semesters. Scholix calculates the required SGPA across remaining course credits, giving you a clear semester-by-semester target to reach your goal.",
          tags: ['target cgpa', 'cgpa planner', 'target sgpa', 'grade goals', 'graduation honours', 'roadmap']
        },
        {
          id: 'cgpa-3',
          q: "How are backlogs, reappears, and grade improvements calculated?",
          a: "When you retake or clear a subject, your new grade replaces the previous grade point in the credit denominator. Scholix recalculates your cumulative CGPA seamlessly without penalizing your completed credit totals.",
          tags: ['backlog', 'reappear', 're-eval', 'grade replacement', 'credits', 'sgpa recalculation']
        },
        {
          id: 'cgpa-4',
          q: "Can I generate and share a verified CGPA breakdown?",
          a: "Yes. In Tools > Share CGPA, you can generate an encrypted student performance summary with credit distribution, semester progression, and a verified link suitable for placement drives and resumes.",
          tags: ['share cgpa', 'cgpa report', 'transcript summary', 'placement summary', 'resume attachment']
        }
      ]
    },
    {
      id: 'quiz',
      name: 'Question Bank & PYQs',
      questions: [
        {
          id: 'quiz-1',
          q: "Where do the practice questions and mock exam papers come from?",
          a: "Our question bank comprises 56,000+ verified previous year semester examination questions (PYQs), end-term blueprints, and professor-curated conceptual problems categorized by subject code, unit, and difficulty.",
          tags: ['pyq', 'question bank', 'previous year papers', 'end term', 'mid term', 'unit questions', 'syllabus']
        },
        {
          id: 'quiz-2',
          q: "What is the difference between Official Exams and Custom Quiz?",
          a: "Official Exams replicate real university midterm and endterm blueprints with timed blocks, randomized unit weights, and negative marking. Custom Quiz lets you select specific units, choose question count, and practice with step-by-step solutions at your own pace.",
          tags: ['official exam', 'custom quiz', 'mock test', 'simulation', 'time limit', 'unit practice']
        },
        {
          id: 'quiz-3',
          q: "How do XP points, student levels, and streaks work?",
          a: "You earn XP by solving questions, reading course documents, and completing mock exams. XP increases your level on Scholix, while practicing daily builds your streak and unlocks avatar frames on leaderboards.",
          tags: ['xp', 'level', 'streak', 'rewards', 'leaderboard', 'avatar frames', 'daily study']
        },
        {
          id: 'quiz-4',
          q: "What should I do if I notice a typo or incorrect answer in a question?",
          a: "Click 'Report Question' on any card. Our mission control admin team reviews flagged questions within 24 hours. Validated corrections update platform-wide and award bonus contributor XP.",
          tags: ['report question', 'wrong answer', 'typo', 'feedback', 'moderation', 'question correction']
        }
      ]
    },
    {
      id: 'library',
      name: 'Study Library & Document Focus',
      questions: [
        {
          id: 'lib-1',
          q: "How does the study focus timer work in the PDF viewer?",
          a: "Scholix measures active in-viewport document reading time in seconds. If you switch tabs, minimize your browser, or become idle, the timer pauses automatically so your telemetry reflects genuine focus time.",
          tags: ['pdf reader', 'study timer', 'focus hours', 'telemetry', 'active reading', 'courseware']
        },
        {
          id: 'lib-2',
          q: "How can I contribute my handwritten notes or solved assignments?",
          a: "Go to Content Library > Contribute. Select your subject code, upload your PDF or slides, and add a brief description. Submissions are reviewed within 24 hours and published with credit to your username.",
          tags: ['contribute notes', 'upload pdf', 'notes sharing', 'handwritten notes', 'assignments', 'credit']
        },
        {
          id: 'lib-3',
          q: "Can I download notes for offline study?",
          a: "Yes. All public course notes, syllabus outlines, and solved guides include a direct download option so you can study offline without restrictions or paywalls.",
          tags: ['download notes', 'offline pdf', 'save courseware', 'free study material']
        }
      ]
    },
    {
      id: 'campus',
      name: 'Campus Life & Hostels',
      questions: [
        {
          id: 'cam-1',
          q: "How does the Roommate Finder match students?",
          a: "Roommate Finder connects verified students based on hostel block, floor, branch, sleep schedule (night owl vs early bird), dietary habits, and cleanliness preferences. You can view profiles and connect securely via chat or WhatsApp.",
          tags: ['roommate finder', 'hostel room', 'flatmate', 'hostel block', 'room match', 'lifestyle preferences']
        },
        {
          id: 'cam-2',
          q: "What is the Rescue Line / Emergency Contacts system?",
          a: "Rescue Line provides instant 1-tap phone and WhatsApp contacts for hostel wardens, campus security, ambulance, university hospital dispensary, women's helpline, and the anti-ragging squad.",
          tags: ['rescue line', 'emergency contacts', 'warden number', 'ambulance', 'security', 'anti ragging', 'hospital']
        },
        {
          id: 'cam-3',
          q: "Where can I view campus block locations and turnstile timings?",
          a: "Campus Navigator provides interactive maps for academic blocks, food courts, Uni-Mall amenities, laundry centers, and turnstile biometric checkpoint timings.",
          tags: ['campus navigator', 'block locations', 'uni mall', 'turnstile timing', 'gate timing', 'laundry']
        }
      ]
    },
    {
      id: 'market',
      name: 'Student Marketplace',
      questions: [
        {
          id: 'mkt-1',
          q: `Is the ${uName} Student Marketplace safe for exchanges?`,
          a: "Only verified university student accounts can list or message on the marketplace. For safety, always schedule physical item handovers in public, well-lit campus areas like Uni-Mall or central food courts.",
          tags: ['marketplace safe', 'verified students', 'scam protection', 'handover', 'public exchange', 'uni mall']
        },
        {
          id: 'mkt-2',
          q: "What items can I buy or sell on the marketplace?",
          a: "Popular listings include engineering mini-drafters, lab coats, scientific calculators, bicycles, textbooks, monitors, and hostel room essentials.",
          tags: ['buy sell', 'drafter', 'lab coat', 'calculator', 'bicycle', 'textbook', 'electronics']
        },
        {
          id: 'mkt-3',
          q: "How do I report a suspicious listing or spam message?",
          a: "Click the report flag on any listing or message. Our admin team investigates flagged items within 2 hours and takes immediate action, including listing removal and account restriction.",
          tags: ['report listing', 'spam', 'fraud report', 'moderation', 'block user']
        }
      ]
    },
    {
      id: 'security',
      name: 'Privacy & Security',
      questions: [
        {
          id: 'sec-1',
          q: "Are my registration number and academic records private?",
          a: "Yes. Sensitive credentials such as student registration numbers, private emails, and password hashes are encrypted and never shown on public profiles or directory listings.",
          tags: ['privacy', 'data security', 'encryption', 'registration number', 'private account', 'gdpr']
        },
        {
          id: 'sec-2',
          q: `Can I share live ongoing semester examination papers on ${fullBrandName}?`,
          a: "Strictly no. Sharing ongoing examination questions during active test hours is a serious violation of university rules. Accounts involved are permanently banned and reported to the university examination board.",
          tags: ['academic integrity', 'live exam', 'cheating', 'anti cheating', 'exam policy', 'ban', 'prohibited']
        },
        {
          id: 'sec-3',
          q: "What should I do if I forget my password or get locked out?",
          a: "Select 'Sign In' > 'Forgot Password' on the login screen. Enter your registered email address to receive an instant verification reset code.",
          tags: ['forgot password', 'account recovery', 'reset link', 'locked account', 'login help']
        }
      ]
    }
  ], [uName, fullBrandName]);

  // Loose search matching with synonym expansion & slug intersection
  const searchResults = useMemo(() => {
    const raw = searchQuery.trim();
    if (!raw) {
      if (selectedCategory === 'all') return faqData;
      return faqData.filter(c => c.id === selectedCategory);
    }

    const querySlug = toSlug(raw);
    const queryTokens = querySlug.split(' ').filter(Boolean);

    const expandedTokens = new Set<string>(queryTokens);
    queryTokens.forEach(t => {
      if (SYNONYM_MAP[t]) {
        SYNONYM_MAP[t].forEach(syn => expandedTokens.add(syn));
      }
      Object.entries(SYNONYM_MAP).forEach(([key, syns]) => {
        if (key.includes(t) || t.includes(key)) {
          syns.forEach(s => expandedTokens.add(s));
        }
      });
    });

    const activeCategories = selectedCategory === 'all'
      ? faqData
      : faqData.filter(c => c.id === selectedCategory);

    return activeCategories.map(cat => {
      const catSlug = toSlug(cat.name);

      const matchedQuestions = cat.questions
        .map(q => {
          const qSlug = toSlug(q.q);
          const aSlug = toSlug(q.a);
          const tagsSlug = q.tags.map(toSlug).join(' ');

          let score = 0;
          if (qSlug.includes(querySlug)) score += 100;
          if (aSlug.includes(querySlug)) score += 50;
          if (tagsSlug.includes(querySlug)) score += 60;
          if (catSlug.includes(querySlug)) score += 30;

          queryTokens.forEach(tok => {
            if (qSlug.includes(tok)) score += 25;
            if (tagsSlug.includes(tok)) score += 20;
            if (aSlug.includes(tok)) score += 10;
            if (catSlug.includes(tok)) score += 15;
          });

          expandedTokens.forEach(exp => {
            if (qSlug.includes(exp)) score += 12;
            if (tagsSlug.includes(exp)) score += 8;
            if (aSlug.includes(exp)) score += 4;
          });

          return { q, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.q);

      return {
        ...cat,
        questions: matchedQuestions
      };
    }).filter(cat => cat.questions.length > 0);
  }, [searchQuery, selectedCategory, faqData]);

  const toggleItem = (key: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="w-full space-y-7 pb-20 text-left">
      {/* Apple-like Clean Header */}
      <header className="pb-5 border-b border-zinc-100 dark:border-white/[0.06]">
        <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight">
          Help & <span className="text-orange-500">FAQs</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Everything you need to know about academic tools, attendance, and campus life at {shortBrandName}.
        </p>
      </header>

      {/* Minimal Monochrome Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search questions, 'bunk', 'grading', 'pyq'..."
          className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-zinc-100/70 dark:bg-white/[0.04] border-none focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-white/20 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 border-none bg-transparent cursor-pointer p-0.5"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Minimal Category Tabs (Monochrome, Apple Style) */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer border-none ${
            selectedCategory === 'all'
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-transparent hover:bg-zinc-100 dark:hover:bg-white/[0.04]'
          }`}
        >
          All
        </button>
        {faqData.map(cat => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer border-none ${
                isSelected
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-transparent hover:bg-zinc-100 dark:hover:bg-white/[0.04]'
              }`}
            >
              {cat.name.split('&')[0].trim()}
            </button>
          );
        })}
      </div>

      {/* Questions List (Seamless, Borderless, Pure Typography) */}
      {searchResults.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 text-xs">
          No questions found matching "{searchQuery}".
        </div>
      ) : (
        <div className="space-y-6">
          {searchResults.map((cat) => (
            <div key={cat.id} className="space-y-1">
              <h2 className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pt-3 pb-1">
                {cat.name}
              </h2>

              <div className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
                {cat.questions.map((item) => {
                  const isItemOpen = openItems.has(item.id) || (Boolean(searchQuery.trim()) && searchResults.length <= 2);

                  return (
                    <div key={item.id} className="py-0.5">
                      <button
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        className="w-full py-3 flex items-center justify-between gap-4 text-left border-none bg-transparent cursor-pointer group"
                      >
                        <span className="text-[13px] sm:text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                          {item.q}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 shrink-0 text-zinc-400 transition-transform duration-200 ${
                            isItemOpen ? 'rotate-180 text-zinc-900 dark:text-white' : 'group-hover:text-zinc-600 dark:group-hover:text-zinc-300'
                          }`}
                        />
                      </button>

                      {isItemOpen && (
                        <p className="text-xs sm:text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal pt-0.5 pb-3">
                          {item.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clean Support Footer */}
      <footer className="pt-8 text-center text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-white/[0.04]">
        <span>Still have a question? </span>
        <a
          href="mailto:anunayarvind@gmail.com"
          className="text-orange-500 hover:underline font-medium ml-1"
        >
          Contact student support
        </a>
      </footer>
    </div>
  );
};

export default HelpSection;
