import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useUniversity } from '../hooks/useUniversity.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Search, 
  ExternalLink, 
  Loader2, 
  AlertTriangle,
  PlayCircle,
  Video,
  ChevronDown,
  X,
  ThumbsUp,
  ThumbsDown,
  Users,
  Sparkles,
  Clock,
  Minimize2,
  Maximize2,
  SlidersHorizontal,
  Calendar,
  BookOpen,
  FileText,
  List,
  Bookmark,
  Send
} from 'lucide-react';
import { IITM_BS_DS, BTECH_CSE_2025 } from '../data/curriculumData.ts';

interface YTVideo {
  id: string;
  title: string;
  channel: string;
  channelLogo: string;
  isLive: boolean;
  duration: string;
  views: string;
  published: string;
  thumbnail: string;
}

interface RecentLecture extends YTVideo {
  progress: number;
  watchedAt: number;
}

interface VideoDetails {
  likes: number;
  dislikes: number;
  subscribers: string;
  description: string;
}

interface DropdownOption {
  value: string;
  label: string;
}

const INVIDIOUS_INSTANCES = [
  "https://invidious.projectsegfau.lt",
  "https://invidious.flokinet.to",
  "https://invidious.lunar.icu",
  "https://invidious.private.coffee"
];

// Shorthand / Abbreviation Nicknames Mapping
const SUBJECT_NICKNAMES: Record<string, string> = {
  // IITM
  "BSMA1001": "Maths 1",
  "BSMA1002": "Stats 1",
  "BSCS1001": "CT",
  "BSHS1001": "English 1",
  "BSMA1003": "Maths 2",
  "BSMA1004": "Stats 2",
  "BSCS1002": "Python",
  "BSHS1002": "English 2",
  "BSCS2001": "DBMS",
  "BSCS2002": "PDSA",
  "BSCS2003": "MAD 1",
  "BSCS2003P": "MAD 1 Proj",
  "BSCS2005": "Java",
  "BSCS2006": "MAD 2",
  "BSCS2006P": "MAD 2 Proj",
  "BSSE2001": "System Commands",
  "BSCS2004": "MLF",
  "BSMS2001": "BDM",
  "BSCS2007": "MLT",
  "BSSE2002": "TDS",
  "BSCS2008": "MLP",
  "BSCS2008P": "MLP Proj",
  "BSMS2001P": "BDM Proj",
  "BSMS2002": "Business Analytics",
  "BSDA2001": "DL & GenAI",
  "BSDA2001P": "DL & GenAI Proj",
  "BSCS3001": "SE",
  "BSCS3002": "Software Testing",
  "BSGN3001": "SPG",
  "BSBT4001": "Bioinformatics",
  "BSBT4002": "Big Data & Bio",
  "BSCS4001": "Data Viz",
  "BSEE4001": "Speech Tech",
  "BSMS4002": "Design Thinking",
  "BSMS4001": "Industry 4.0",
  "BSMS3002": "Market Research",
  "BSCS4003": "Privacy & Security",
  "BSDA5001": "Intro to Big Data",
  "BSMS4003": "Financial Forensics",
  "BSMA3012": "LSM",
  "BSCS4021": "Adv Algorithms",
  "BSMA3014": "Stat Computing",
  "BSCS3031": "System Design",
  "BSCS3005": "C Programming",
  "BSMA2001": "Math Thinking",
  "BSMS3033": "Managerial Econ",
  "BSMS4023": "Game Theory",
  "BSMS3034": "Corp Finance",
  "BSDA5013": "DL Practice",
  "BSCS4022": "OS",
  "BSDA4001": "DS & AI Lab",
  "BSCS4010": "App Dev Lab",
  "BSCS4024": "Networks",
  "BSCS3021": "TOC",
  "BSCS4032": "Compiler Design",
  "BSMA3001": "Discrete Maths",
  "BSCS3003": "AI Search",
  "BSCS3004": "Deep Learning",
  "BSDA5004": "LLMs",
  "BSDA5002": "Math for GenAI",
  "BSDA5003": "Algorithms for DS",
  "BSDA5014": "MLOps",
  "BSDA5005": "NLP",
  "BSDA5006": "CV",
  "BSDA5007": "RL",
  
  // LPU
  "CSE111": "OC 1",
  "CSE326": "IP Lab",
  "INT108": "Python",
  "MTH165": "Maths 1",
  "ECE249": "BEEE",
  "CSE101": "CP",
  "CSE121": "OC 2",
  "CSE320": "SE",
  "INT306": "DBMS",
  "MTH166": "Maths 2",
  "CSE202": "OOP",
  "CSE205": "DSA",
  "CSE306": "Networks",
  "CSE423": "Cloud Computing",
  "INT335": "Design Thinking",
  "MTH401": "Discrete Maths",
  "PEL121": "Comm Skills 1",
  "PEL132": "Comm Skills 2",
  "CSE211": "COD",
  "CSE310": "Java",
  "CSE316": "OS",
  "MTH302": "Prob & Stats",
  "INT330": "Cloud Solutions",
  "INT242": "Cyber Security",
  "INT217": "Data Management",
  "INT219": "Front End Dev",
  "CSE273": "ML Foundations",
  "CSE374": "Adv SE",
  "CSE408": "DAA",
  "INT232": "R Prog",
  "INT222": "Adv Web Dev",
  "CSE274": "Applied ML",
  "CSE375": "Software Testing",
  "INT252": "ReactJS",
  "CSE471": "DL & CV",
  "CSE376": "Automated Testing",
  "CSE329": "Competitive Coding"
};

// Filter suggestions categories
const LECTURE_CATEGORIES = [
  { id: 'all', label: 'All Lectures', suffix: '' },
  { id: 'quiz1', label: 'Quiz 1 / Midterm', suffix: 'quiz 1 midterm' },
  { id: 'quiz2', label: 'Quiz 2', suffix: 'quiz 2' },
  { id: 'endterm', label: 'End Term / Finals', suffix: 'end term final exam' },
  { id: 'pyq', label: 'PYQs & Solutions', suffix: 'pyq past papers solved' }
];

const findFullTitleInCurriculum = (code: string): string | null => {
  const findInProg = (prog: any) => {
    for (const term of prog.terms) {
      for (const s of term.coreSubjects) {
        if (s.code.toUpperCase() === code.toUpperCase()) return s.title;
      }
      for (const b of term.electiveBaskets) {
        for (const s of b.subjects) {
          if (s.code.toUpperCase() === code.toUpperCase()) return s.title;
        }
      }
    }
    return null;
  };

  return findInProg(IITM_BS_DS) || findInProg(BTECH_CSE_2025);
};

const resolveSearchQuery = (query: string): string => {
  const q = query.trim().toUpperCase();
  if (!q) return query;

  // 1. Exact matching by course code (e.g. BSCS1001 -> Computational Thinking)
  for (const code of Object.keys(SUBJECT_NICKNAMES)) {
    if (code === q) {
      const fullTitle = findFullTitleInCurriculum(code);
      if (fullTitle) return fullTitle;
    }
  }

  // 2. Matching by Nickname (case-insensitive, e.g. CT -> Computational Thinking)
  for (const [code, nick] of Object.entries(SUBJECT_NICKNAMES)) {
    if (nick.toUpperCase() === q) {
      const fullTitle = findFullTitleInCurriculum(code);
      if (fullTitle) return fullTitle;
    }
  }

  // 3. Manual common initials backup
  const customAcronyms: Record<string, string> = {
    "CT": "Computational Thinking",
    "DBMS": "Database Management Systems",
    "DSA": "Data Structures and Algorithms",
    "PDSA": "Programming, Data Structures and Algorithms using Python",
    "MAD1": "Modern Application Development I",
    "MAD 1": "Modern Application Development I",
    "MAD2": "Modern Application Development II",
    "MAD 2": "Modern Application Development II",
    "MLF": "Machine Learning Foundations",
    "MLT": "Machine Learning Techniques",
    "MLP": "Machine Learning Practice",
    "SE": "Software Engineering",
    "MLOPS": "Machine Learning Operations (MLOps)",
    "OS": "Operating Systems",
    "TOC": "Theory of Computation",
    "DL": "Deep Learning",
    "NLP": "Natural Language Processing",
    "CV": "Computer Vision",
    "RL": "Reinforcement Learning"
  };

  if (customAcronyms[q]) {
    return customAcronyms[q];
  }

  return query;
};

const findCodeInCurriculum = (title: string): string | null => {
  const findInProg = (prog: any) => {
    for (const term of prog.terms) {
      for (const s of term.coreSubjects) {
        if (s.title.toLowerCase() === title.toLowerCase()) return s.code;
      }
      for (const b of term.electiveBaskets) {
        for (const s of b.subjects) {
          if (s.title.toLowerCase() === title.toLowerCase()) return s.code;
        }
      }
    }
    return null;
  };

  return findInProg(IITM_BS_DS) || findInProg(BTECH_CSE_2025);
};

const buildSearchQuery = (subject: string, catId: string, university: string, channelName?: string): string => {
  const isIITM = university === 'iitm_bs';
  
  const resolved = resolveSearchQuery(subject);
  const code = findCodeInCurriculum(resolved) || findCodeInCurriculum(subject);
  
  let subjectTerm = resolved;
  if (code) {
    const nickname = SUBJECT_NICKNAMES[code];
    if (isIITM) {
      subjectTerm = nickname || code; // e.g. Maths 1
    } else {
      subjectTerm = nickname ? `${code} ${nickname}` : code; // e.g. CSE202 OOP
    }
  }

  let categoryKeywords = '';
  if (isIITM) {
    switch (catId) {
      case 'quiz1':
        categoryKeywords = 'quiz 1 midterm week 1 to 4 one shots pyqs';
        break;
      case 'quiz2':
        categoryKeywords = 'quiz 2 week 5 to 8 one shots pyqs';
        break;
      case 'endterm':
        categoryKeywords = 'end term final exam week 9 to 12 one shots pyqs';
        break;
      case 'pyq':
        categoryKeywords = 'pyqs solved past papers solutions practice';
        break;
      default:
        categoryKeywords = 'lectures playlist complete course';
    }
  } else {
    // LPU Specific keywords
    switch (catId) {
      case 'quiz1':
        categoryKeywords = 'midterm CA1 CA2 unit 1 unit 2 unit 3 lectures one shot';
        break;
      case 'quiz2':
        categoryKeywords = 'CA3 unit 4 unit 5 lectures one shot';
        break;
      case 'endterm':
        categoryKeywords = 'endterm final exam syllabus unit 1 unit 2 unit 3 unit 4 unit 5 unit 6 lectures one shot';
        break;
      case 'pyq':
        categoryKeywords = 'endterm midterm CA1 CA2 CA3 pyqs solved past papers question bank';
        break;
      default:
        categoryKeywords = 'lectures chapters playlist unit wise';
    }
  }

  let query = '';
  if (channelName) {
    // Search within a specific channel
    query = `"${channelName}" ${subjectTerm} ${categoryKeywords}`;
  } else {
    // General search: brand + term + category keywords
    const brand = isIITM ? 'IITM BS' : 'LPU';
    query = `${brand} ${subjectTerm} ${categoryKeywords}`;
  }

  return query.trim().replace(/\s+/g, ' ');
};

const formatDuration = (totalSecs: number): string => {
  if (totalSecs <= 0) return "";
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  
  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  } else {
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
};

const fetchFromInvidious = async (query: string, page: number): Promise<YTVideo[]> => {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const targetUrl = `${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video&page=${page}`;
      const url = `/api/gateway?action=youtube-proxy&url=${encodeURIComponent(targetUrl)}`;
      const res = await fetch(url);
      
      const contentType = res.headers.get('content-type') || '';
      let data;
      if (!res.ok || contentType.includes('text/html')) {
        console.warn(`Gateway API proxy failed or returned HTML. Trying direct client-side fetch from Invidious...`);
        const directRes = await fetch(targetUrl);
        if (!directRes.ok) continue;
        data = await directRes.json();
      } else {
        data = await res.json();
      }
      
      if (!Array.isArray(data)) continue;
      
      return data.map((item: any) => {
        const videoId = item.videoId;
        const title = item.title || "Untitled Lecture";
        const channel = item.author || "University Channel";
        const duration = formatDuration(item.lengthSeconds || 0);
        const views = item.viewCount ? `${item.viewCount.toLocaleString()} views` : "";
        const published = item.publishedText || "";
        const thumbnail = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
        const channelLogo = item.authorThumbnails?.[0]?.url || "";
        const isLive = item.liveNow || item.isLive || false;
        
        return {
          id: videoId,
          title,
          channel,
          channelLogo,
          isLive,
          duration,
          views,
          published,
          thumbnail
        };
      });
    } catch (e) {
      console.warn(`Failed fetching from Invidious instance: ${instance}`, e);
    }
  }
  throw new Error("All backup lecture search servers are currently down.");
};

const ThemeDropdown: React.FC<{
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (val: string) => void;
}> = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const currentOption = options.find(o => o.value === value) || options[0];

  return (
    <div ref={ref} className="relative space-y-1.5 w-full text-left">
      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider pl-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-zinc-900/40 dark:bg-black/30 border border-zinc-200/10 dark:border-white/5 rounded-xl px-3 py-2.5 text-xs font-semibold text-white outline-none hover:border-brand-primary/50 transition-all text-left cursor-pointer"
      >
        <span className="truncate pr-2">{currentOption?.label || value}</span>
        <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 mt-1 bg-zinc-900 dark:bg-[#0a0a0a] border border-zinc-200/10 dark:border-white/5 rounded-xl shadow-lg max-h-48 overflow-y-auto no-scrollbar p-1 space-y-0.5"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-semibold transition-all border-none rounded-lg cursor-pointer ${
                  value === opt.value
                    ? 'bg-brand-primary text-white'
                    : 'text-zinc-300 bg-transparent hover:bg-white/5 hover:text-brand-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LecturesSkeleton: React.FC = () => {
  return (
    <div className="space-y-12 animate-pulse max-w-5xl mx-auto w-full pt-4">
      {[1, 2, 3].map((shelfIdx) => (
        <div key={shelfIdx} className="space-y-4 text-left">
          {/* Header Skeleton */}
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-white/5 pb-2">
            <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-white/5" />
            <div className="h-3.5 w-32 bg-zinc-200 dark:bg-white/5 rounded" />
            <div className="h-4 w-12 bg-zinc-200 dark:bg-white/5 rounded-full" />
          </div>
          
          {/* Cards Row Skeleton */}
          <div className="flex gap-5 overflow-x-hidden pb-4">
            {[1, 2, 3, 4].map((cardIdx) => (
              <div 
                key={cardIdx} 
                className="shrink-0 w-[240px] sm:w-[260px] flex flex-col bg-zinc-50 dark:bg-white/[0.01] border border-zinc-200/50 dark:border-white/5 rounded-2xl overflow-hidden"
              >
                <div className="aspect-video bg-zinc-200 dark:bg-white/5 w-full" />
                <div className="p-3.5 space-y-3.5">
                  <div className="space-y-2">
                    <div className="h-3 bg-zinc-200 dark:bg-white/5 rounded w-5/6" />
                    <div className="h-3 bg-zinc-200 dark:bg-white/5 rounded w-2/3" />
                  </div>
                  <div className="h-2 bg-zinc-200 dark:bg-white/5 rounded w-1/3 pt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const LecturesHub: React.FC<{ hideHeader?: boolean }> = ({ hideHeader = false }) => {
  const { selectedUniversity } = useUniversity();
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [isRawView, setIsRawView] = useState(false);
  const [ytVideos, setYtVideos] = useState<YTVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scoped load more pagination variables per-shelf/channel concurrently
  const [channelPages, setChannelPages] = useState<Record<string, number>>({});
  const [channelHasMore, setChannelHasMore] = useState<Record<string, boolean>>({});
  const [loadingChannels, setLoadingChannels] = useState<Record<string, boolean>>({});

  // Direct Raw Feed View Pagination
  const [feedPage, setFeedPage] = useState(1);
  const [hasMoreFeed, setHasMoreFeed] = useState(true);
  const [loadingMoreFeed, setLoadingMoreFeed] = useState(false);

  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [activeVideoDetails, setActiveVideoDetails] = useState<VideoDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [recentLectures, setRecentLectures] = useState<RecentLecture[]>([]);
  
  const [activeTab, setActiveTab] = useState<'resources' | 'notes' | 'pyqs' | 'discussion'>('resources');
  const [noteText, setNoteText] = useState('');
  const [discussionText, setDiscussionText] = useState('');
  const [mockComments, setMockComments] = useState<{ id: string; user: string; text: string; time: string }[]>([]);

  const topRef = useRef<HTMLDivElement>(null);

  // Load recent lectures on mount
  useEffect(() => {
    const saved = localStorage.getItem('scholix_recent_lectures');
    if (saved) {
      try {
        setRecentLectures(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent lectures:", e);
      }
    }
  }, []);

  // Load note text and comments when activeVideoId changes
  useEffect(() => {
    if (activeVideoId) {
      const savedNote = localStorage.getItem(`scholix_note_${activeVideoId}`);
      setNoteText(savedNote || '');

      const savedComments = localStorage.getItem(`scholix_comments_${activeVideoId}`);
      if (savedComments) {
        setMockComments(JSON.parse(savedComments));
      } else {
        setMockComments([
          { id: '1', user: 'Anunay Yadav', text: 'This lecture explains recursion so much better than the professor did in class!', time: '2 hours ago' },
          { id: '2', user: 'Sumit Sharma', text: 'Does anyone know the time stamp where he explains the master theorem?', time: '5 hours ago' },
          { id: '3', user: 'Pooja Patel', text: 'Master theorem is at 24:15. It was super helpful!', time: '4 hours ago' }
        ]);
      }
    } else {
      setNoteText('');
      setMockComments([]);
    }
  }, [activeVideoId]);



  // Save/update recent lectures helper
  const saveRecentLecture = (video: YTVideo, progress: number = 0) => {
    setRecentLectures(prev => {
      const filtered = prev.filter(v => v.id !== video.id);
      const updated: RecentLecture = {
        ...video,
        progress,
        watchedAt: Date.now()
      };
      const newList = [updated, ...filtered].slice(0, 8);
      localStorage.setItem('scholix_recent_lectures', JSON.stringify(newList));
      return newList;
    });
  };

  const handleSelectVideo = (video: YTVideo) => {
    setActiveVideoId(video.id);
    saveRecentLecture(video, 10 + Math.floor(Math.random() * 80)); // Mock progress
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSelectRecentVideo = (video: RecentLecture) => {
    setActiveVideoId(video.id);
    saveRecentLecture(video, video.progress);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSaveNote = (text: string) => {
    setNoteText(text);
    if (activeVideoId) {
      localStorage.setItem(`scholix_note_${activeVideoId}`, text);
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discussionText.trim() || !activeVideoId) return;

    const newComment = {
      id: Date.now().toString(),
      user: 'Student User',
      text: discussionText.trim(),
      time: 'Just now'
    };

    const updated = [newComment, ...mockComments];
    setMockComments(updated);
    setDiscussionText('');
    localStorage.setItem(`scholix_comments_${activeVideoId}`, JSON.stringify(updated));
  };

  const activeVideo = useMemo(() => {
    if (!activeVideoId) return null;
    return ytVideos.find(v => v.id === activeVideoId) || recentLectures.find(v => v.id === activeVideoId) || null;
  }, [activeVideoId, ytVideos, recentLectures]);

  const categories = useMemo(() => {
    const isIITM = selectedUniversity === 'iitm_bs';
    return [
      { id: 'all', label: 'All Lectures' },
      { id: 'quiz1', label: isIITM ? 'Quiz 1 / Midterm' : 'Midterm / CA1 & CA2' },
      { id: 'quiz2', label: isIITM ? 'Quiz 2' : 'CA3' },
      { id: 'endterm', label: isIITM ? 'End Term / Finals' : 'End Term' },
      { id: 'pyq', label: 'PYQs & Solutions' }
    ];
  }, [selectedUniversity]);

  // Parse curriculum data dynamically to align exactly with Content Library
  const curriculumMap = useMemo(() => {
    const isIITM = selectedUniversity === 'iitm_bs';
    const curriculum = isIITM ? IITM_BS_DS : BTECH_CSE_2025;
    
    const levelsSet = new Set<string>();
    const levelToCourses: Record<string, string[]> = {};
    
    curriculum.terms.forEach(term => {
      let levelName = '';
      if (isIITM) {
        if (term.termName.includes('Foundation')) levelName = 'Foundation Level';
        else if (term.termName.includes('Diploma')) levelName = 'Diploma Level';
        else levelName = 'Degree Level';
      } else {
        if (term.termNumber <= 2) levelName = 'Year 1';
        else if (term.termNumber <= 4) levelName = 'Year 2';
        else if (term.termNumber <= 6) levelName = 'Year 3';
        else levelName = 'Year 4';
      }
      
      levelsSet.add(levelName);
      if (!levelToCourses[levelName]) {
        levelToCourses[levelName] = [];
      }
      
      const addCourse = (title: string) => {
        if (!levelToCourses[levelName].includes(title)) {
          levelToCourses[levelName].push(title);
        }
      };
      
      term.coreSubjects.forEach(s => addCourse(s.title));
      term.electiveBaskets.forEach(b => {
        b.subjects.forEach(s => addCourse(s.title));
      });
    });
    
    return {
      levels: Array.from(levelsSet),
      levelToCourses
    };
  }, [selectedUniversity]);

  const levels = curriculumMap.levels;

  // Set default level when levels options change
  useEffect(() => {
    if (levels.length > 0) {
      setSelectedLevel(levels[0]);
    }
  }, [levels]);

  // Retrieve courses matching active selected level
  const courseOptions = useMemo(() => {
    return curriculumMap.levelToCourses[selectedLevel] || [];
  }, [selectedLevel, curriculumMap]);

  // Auto-select first course when level courses options change
  useEffect(() => {
    if (courseOptions.length > 0) {
      setSelectedCourse(courseOptions[0]);
    } else {
      setSelectedCourse('');
    }
  }, [courseOptions]);

  const searchYouTube = async (subject: string, catId: string = 'all') => {
    if (!subject) return;

    setLoading(true);
    setYtVideos([]);
    setError(null);
    setActiveVideoId(null);
    
    // Reset scoped channel loaders
    setChannelPages({});
    setChannelHasMore({});
    setLoadingChannels({});

    // Reset Raw Feed pagination
    setFeedPage(1);
    setHasMoreFeed(true);
    setLoadingMoreFeed(false);

    const searchQuery = buildSearchQuery(subject, catId, selectedUniversity);
    const query = encodeURIComponent(searchQuery);
    
    try {
      let fetchedVideos: YTVideo[] = [];

      // Try scraping first
      try {
        const url = `/api/gateway?action=youtube-proxy&url=${encodeURIComponent(`https://www.youtube.com/results?search_query=${query}`)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("CORS Proxy returned error.");
        const html = await res.text();

        const startStr = 'var ytInitialData = ';
        const startIndex = html.indexOf(startStr);
        if (startIndex === -1) throw new Error("YouTube data payload not found.");

        const dataStart = startIndex + startStr.length;
        const endIndex = html.indexOf(';</script>', dataStart);
        if (endIndex === -1) throw new Error("YouTube payload boundary reading failure.");

        const jsonStr = html.substring(dataStart, endIndex);
        const data = JSON.parse(jsonStr);

        const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents;
        if (contents && Array.isArray(contents)) {
          for (const item of contents) {
            if (item.videoRenderer) {
              const vr = item.videoRenderer;
              const videoId = vr.videoId;
              const title = vr.title?.runs?.[0]?.text || "Untitled Lecture";
              const channel = vr.longBylineText?.runs?.[0]?.text || vr.ownerText?.runs?.[0]?.text || "University Channel";
              const duration = vr.lengthText?.simpleText || "";
              const views = vr.viewCountText?.simpleText || "";
              const published = vr.publishedTimeText?.simpleText || "";
              const thumbnail = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
              const channelLogo = vr.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails?.[0]?.url || "";
              const isLive = vr.badges?.some((b: any) => b.metadataBadgeRenderer?.style === "BADGE_STYLE_TYPE_LIVE_NOW" || b.metadataBadgeRenderer?.label === "LIVE") || !vr.lengthText;

              fetchedVideos.push({
                id: videoId,
                title,
                channel,
                channelLogo,
                isLive,
                duration,
                views,
                published,
                thumbnail
              });
            }
          }
        }
      } catch (scrapeErr) {
        console.warn("Direct YouTube scraping failed, trying Invidious fallback...", scrapeErr);
        fetchedVideos = await fetchFromInvidious(searchQuery, 1);
      }

      if (fetchedVideos.length === 0) {
        throw new Error("No lecture records match this search.");
      }

      setYtVideos(fetchedVideos);
      if (fetchedVideos.length > 0) {
        setActiveVideoId(fetchedVideos[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to search lecture videos.");
    } finally {
      setLoading(false);
    }
  };

  // Channel-specific Concurrent Load More Scraper
  const loadMoreForChannel = async (channelName: string) => {
    if (loading || loadingChannels[channelName]) return;

    setLoadingChannels(prev => ({ ...prev, [channelName]: true }));

    const nextPage = (channelPages[channelName] || 1) + 1;
    const activeSubject = searchText.trim() || selectedCourse;
    if (!activeSubject) {
      setLoadingChannels(prev => ({ ...prev, [channelName]: false }));
      return;
    }

    if (nextPage > 5) {
      setChannelHasMore(prev => ({ ...prev, [channelName]: false }));
      setLoadingChannels(prev => ({ ...prev, [channelName]: false }));
      return;
    }

    try {
      const queryStr = buildSearchQuery(activeSubject, activeCategory, selectedUniversity, channelName);
      const fetched = await fetchFromInvidious(queryStr, nextPage);

      const filtered = fetched.filter(v => 
        v.channel.toLowerCase().includes(channelName.toLowerCase()) || 
        channelName.toLowerCase().includes(v.channel.toLowerCase())
      );

      if (filtered.length === 0) {
        setChannelHasMore(prev => ({ ...prev, [channelName]: false }));
      } else {
        setYtVideos(prev => {
          const existingIds = new Set(prev.map(v => v.id));
          const uniqueNew = filtered.filter(v => !existingIds.has(v.id));
          return [...prev, ...uniqueNew];
        });
        setChannelPages(prev => ({ ...prev, [channelName]: nextPage }));
      }
    } catch (err) {
      console.error(`Failed to load more for channel ${channelName}:`, err);
      setChannelHasMore(prev => ({ ...prev, [channelName]: false }));
    } finally {
      setLoadingChannels(prev => ({ ...prev, [channelName]: false }));
    }
  };

  // Direct Raw YouTube Feed Load More Scraper
  const loadMoreForFeed = async () => {
    if (loading || loadingMoreFeed || !hasMoreFeed) return;
    setLoadingMoreFeed(true);

    const nextPage = feedPage + 1;
    const activeSubject = searchText.trim() || selectedCourse;
    if (!activeSubject) {
      setLoadingMoreFeed(false);
      return;
    }

    if (nextPage > 6) {
      setHasMoreFeed(false);
      setLoadingMoreFeed(false);
      return;
    }

    try {
      const searchQuery = buildSearchQuery(activeSubject, activeCategory, selectedUniversity);

      const fetched = await fetchFromInvidious(searchQuery, nextPage);
      if (fetched.length === 0) {
        setHasMoreFeed(false);
      } else {
        setYtVideos(prev => {
          const existingIds = new Set(prev.map(v => v.id));
          const uniqueNew = fetched.filter(v => !existingIds.has(v.id));
          return [...prev, ...uniqueNew];
        });
        setFeedPage(nextPage);
      }
    } catch (err) {
      console.error("Failed to load more for feed:", err);
      setHasMoreFeed(false);
    } finally {
      setLoadingMoreFeed(false);
    }
  };

  // Video Details Fetcher
  const fetchVideoDetails = async (videoId: string) => {
    setLoadingDetails(true);
    setActiveVideoDetails(null);

    for (const instance of INVIDIOUS_INSTANCES) {
      try {
        const targetUrl = `${instance}/api/v1/videos/${videoId}`;
        const url = `/api/gateway?action=youtube-proxy&url=${encodeURIComponent(targetUrl)}`;
        const res = await fetch(url);
        
        const contentType = res.headers.get('content-type') || '';
        let data;
        if (!res.ok || contentType.includes('text/html')) {
          console.warn(`Gateway API proxy failed or returned HTML. Trying direct client-side details fetch...`);
          const directRes = await fetch(targetUrl);
          if (!directRes.ok) continue;
          data = await directRes.json();
        } else {
          data = await res.json();
        }
        
        let subsStr = "0";
        const subs = data.authorSubscriberCount || 0;
        if (subs >= 1000000) {
          subsStr = `${(subs / 1000000).toFixed(1)}M`;
        } else if (subs >= 1000) {
          subsStr = `${(subs / 1000).toFixed(1)}K`;
        } else {
          subsStr = `${subs}`;
        }

        setActiveVideoDetails({
          likes: data.likeCount || 0,
          dislikes: data.dislikeCount || 0,
          subscribers: subsStr,
          description: data.description || ""
        });
        setLoadingDetails(false);
        return;
      } catch (e) {
        console.warn(`Failed details from instance: ${instance}`, e);
      }
    }
    setLoadingDetails(false);
  };

  useEffect(() => {
    if (activeVideoId) {
      fetchVideoDetails(activeVideoId);
    }
  }, [activeVideoId]);

  useEffect(() => {
    if (selectedCourse) {
      setSearchText(''); // Clear text search to prioritize dropdown
      searchYouTube(selectedCourse, activeCategory);
    }
  }, [selectedCourse, activeCategory, selectedUniversity]);

  const handleCustomSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      setIsRawView(true); // Automatically switch to YouTube Feed list view
      searchYouTube(searchText.trim(), activeCategory);
    }
  };

  // Horizontal Scroll Trigger (when user swipes to the right of any channel shelf)
  const handleHorizontalScroll = (e: React.UIEvent<HTMLDivElement>, channelName: string) => {
    const target = e.currentTarget;
    const isScrollable = target.scrollWidth > target.clientWidth;
    if (!isScrollable) return;

    const threshold = 300; // Trigger when within 300px of the right side to prevent delays
    const isNearRight = target.scrollWidth - target.scrollLeft - target.clientWidth < threshold;
    
    if (isNearRight && !loading && !loadingChannels[channelName] && channelHasMore[channelName] !== false) {
      loadMoreForChannel(channelName);
    }
  };

  // Group videos by channel
  const groupedVideos = useMemo(() => {
    const groups: Record<string, YTVideo[]> = {};
    ytVideos.forEach((video) => {
      const ch = video.channel || 'Unknown Channel';
      if (!groups[ch]) {
        groups[ch] = [];
      }
      groups[ch].push(video);
    });
    return groups;
  }, [ytVideos]);


  // Calculate rating percentage and ratio bar width
  const ratingMetrics = useMemo(() => {
    if (!activeVideoDetails) return null;
    const { likes, dislikes } = activeVideoDetails;
    const total = likes + dislikes;
    const pct = total > 0 ? Math.round((likes / total) * 100) : 0;
    
    return {
      percentage: pct,
      totalCount: total,
      likesFormatted: likes >= 1000 ? `${(likes / 1000).toFixed(1)}K` : `${likes}`,
      dislikesFormatted: dislikes >= 1000 ? `${(dislikes / 1000).toFixed(1)}K` : `${dislikes}`
    };
  }, [activeVideoDetails]);

  return (
    <div ref={topRef} className="max-w-5xl mx-auto w-full space-y-8 animate-fade-in pb-20 text-center md:text-left scroll-mt-6 px-4">
      
      {/* Scrollbar CSS Overrides */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {!hideHeader && (
        <header className="mb-6 border-b border-zinc-100 dark:border-white/5 pb-6 text-left">
          <span className="text-[10px] uppercase tracking-wider text-brand-primary font-bold">YT Library</span>
          <h2 className="text-xl md:text-2xl font-semibold mt-1 text-zinc-900 dark:text-white tracking-tight">
            YouTube <span className="text-brand-primary">Lectures</span>
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium text-[11px] sm:text-xs mt-1">
            Browse and watch university lectures inline without distraction.
          </p>
        </header>
      )}

      {/* Hero Recommendation Banner */}
      {!activeVideoId && (
        <div className="relative w-full aspect-[21/9] md:aspect-[3/1] bg-gradient-to-r from-zinc-900 to-black rounded-3xl overflow-hidden shadow-2xl flex items-center justify-start text-left p-6 sm:p-12 border border-zinc-200/10 dark:border-white/5">
          {recentLectures.length > 0 ? (
            <div className="absolute inset-0 z-0">
              <img 
                src={recentLectures[0].thumbnail} 
                alt="Hero BG" 
                className="w-full h-full object-cover blur-2xl opacity-30 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
            </div>
          ) : null}

          <div className="relative z-10 max-w-lg space-y-3 sm:space-y-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-bold bg-brand-primary/10 text-brand-primary uppercase tracking-widest border border-brand-primary/20">
              <Sparkles size={10} />
              Recommendation
            </span>

            {recentLectures.length > 0 ? (
              <>
                <h3 className="text-xl sm:text-2xl font-light text-white tracking-wide leading-tight line-clamp-2">
                  Resume: <span className="font-semibold">{recentLectures[0].title}</span>
                </h3>
                <p className="text-[10px] sm:text-xs text-zinc-400 font-medium">
                  {recentLectures[0].channel} • Progress: {recentLectures[0].progress}%
                </p>
                
                <button
                  onClick={() => handleSelectRecentVideo(recentLectures[0])}
                  className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-xs rounded-xl border-none cursor-pointer transition-all active:scale-95 shadow-lg shadow-brand-primary/25"
                >
                  <Play size={13} className="fill-white" />
                  Resume Lecture
                </button>
              </>
            ) : (
              <>
                <h3 className="text-xl sm:text-2xl font-light text-white tracking-wide leading-tight">
                  Start Your <span className="font-semibold text-brand-primary">Study Session</span>
                </h3>
                <p className="text-[10px] sm:text-xs text-zinc-400 font-medium leading-relaxed max-w-sm">
                  Select your university curriculum level, choose a course, and stream distraction-free video lectures instantly.
                </p>
                
                <button
                  onClick={() => {
                    const filtersEl = document.getElementById('search-filters-card');
                    filtersEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-zinc-950 hover:bg-zinc-100 font-bold text-xs rounded-xl border-none cursor-pointer transition-all active:scale-95"
                >
                  <SlidersHorizontal size={13} />
                  Explore Courses
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Active Embed Player */}
      <AnimatePresence>
        {activeVideoId && activeVideo && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className={`space-y-4 border rounded-3xl overflow-hidden text-left transition-all duration-300 ${
              isFocusMode
                ? 'fixed inset-0 z-50 bg-[#060606] p-4 sm:p-8 flex flex-col justify-center max-w-none'
                : 'p-6 bg-gradient-to-r from-zinc-900/40 to-black/80 dark:from-zinc-950/20 dark:to-black/50 border-zinc-200/10 dark:border-white/5 rounded-3xl backdrop-blur-md shadow-2xl'
            }`}
          >
            <div className={`flex items-center justify-between pb-2 border-b border-zinc-200/50 dark:border-white/5 ${isFocusMode ? 'max-w-5xl mx-auto w-full' : ''}`}>
              <span className="text-[9px] font-bold text-brand-primary uppercase flex items-center gap-1.5 animate-pulse">
                <PlayCircle size={12} />
                Now Playing Inline
              </span>
              
              <div className="flex items-center gap-2">


                <button 
                  onClick={() => {
                    setActiveVideoId(null);
                    setIsFocusMode(false);
                  }}
                  className="p-1.5 hover:bg-zinc-850 dark:hover:bg-white/5 rounded-xl border-none bg-transparent cursor-pointer text-zinc-400 hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <div className={`relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border dark:border-white/5 ${isFocusMode ? 'max-w-5xl mx-auto flex-1' : 'max-w-4xl mx-auto'}`}>
              <iframe 
                src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`}
                title="YouTube Lecture Player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>

            {/* Dynamic Video & Channel Stats Row */}
            <div className={`w-full pt-2 space-y-4 ${isFocusMode ? 'max-w-5xl mx-auto' : 'max-w-4xl mx-auto'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Channel Details */}
                <div className="flex items-center gap-3">
                  {activeVideo.channelLogo ? (
                    <img 
                      src={activeVideo.channelLogo} 
                      alt={activeVideo.channel}
                      className="w-10 h-10 rounded-full object-cover border dark:border-white/10"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-sm">
                      {activeVideo.channel.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-zinc-950 dark:text-white leading-tight">{activeVideo.title}</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{activeVideo.channel}</p>
                    {loadingDetails ? (
                      <span className="text-[9px] text-zinc-400 flex items-center gap-1 mt-0.5">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" /> Loading stats...
                      </span>
                    ) : activeVideoDetails ? (
                      <p className="text-[9px] text-zinc-400 font-semibold flex items-center gap-1.5 mt-0.5">
                        <Users size={10} className="text-zinc-500" />
                        {activeVideoDetails.subscribers} subscribers
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Likes / Dislikes Ratio Display */}
                {!loadingDetails && ratingMetrics && (
                  <div className="flex flex-col items-end gap-1.5 shrink-0 max-w-[200px] w-full sm:w-auto">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                      <span className="flex items-center gap-1 hover:text-green-500 transition-colors">
                        <ThumbsUp size={12} className="text-zinc-500" />
                        {ratingMetrics.likesFormatted} ({ratingMetrics.percentage}%)
                      </span>
                      <span className="flex items-center gap-1 hover:text-red-500 transition-colors">
                        <ThumbsDown size={12} className="text-zinc-500" />
                        {ratingMetrics.dislikesFormatted}
                      </span>
                    </div>
                    
                    {/* Rating Ratio Bar */}
                    <div className="w-full sm:w-36 h-1 bg-zinc-200 dark:bg-white/10 rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-emerald-500" 
                        style={{ width: `${ratingMetrics.percentage}%` }}
                      />
                      <div 
                        className="h-full bg-red-500" 
                        style={{ width: `${100 - ratingMetrics.percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className={`flex items-center justify-between px-1 pt-2 border-t border-zinc-200/50 dark:border-white/5 ${isFocusMode ? 'max-w-5xl mx-auto w-full' : 'max-w-4xl mx-auto'}`}>
              <span className="text-[10px] text-zinc-400">Distraction-free learning portal</span>
              <a 
                href={`https://www.youtube.com/watch?v=${activeVideoId}`}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-brand-primary font-bold flex items-center gap-1 hover:underline"
              >
                Watch on YouTube
                <ExternalLink size={10} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filters Card (Always visible, styled exactly like the Hero card) */}
      <div id="search-filters-card" className="w-full bg-gradient-to-r from-zinc-900/60 to-black/80 dark:from-zinc-950/40 dark:to-black/60 rounded-3xl p-6 sm:p-8 space-y-6 text-left border border-zinc-200/10 dark:border-white/5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/10 dark:border-white/5">
          <div>
            <h4 className="text-xs font-semibold text-white tracking-wide uppercase tracking-wider">Search & Filters</h4>
            <p className="text-[10px] text-zinc-400 mt-0.5">Select your course or enter custom query search terms below</p>
          </div>
          
          {/* View Mode Toggle Switch */}
          <div className="flex bg-zinc-855/40 dark:bg-black/30 p-0.5 rounded-xl border border-zinc-200/10 dark:border-white/5 shrink-0">
            <button
              type="button"
              onClick={() => setIsRawView(false)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border-none cursor-pointer transition-all ${
                !isRawView
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-transparent text-zinc-400 hover:text-white'
              }`}
            >
              Shelves
            </button>
            <button
              type="button"
              onClick={() => setIsRawView(true)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border-none cursor-pointer transition-all ${
                isRawView
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-transparent text-zinc-400 hover:text-white'
              }`}
            >
              Feed
            </button>
          </div>
        </div>

        {/* Dropdowns row */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="w-full sm:w-1/2">
            <ThemeDropdown
              label="Select Level"
              options={levels.map(l => ({ value: l, label: l }))}
              value={selectedLevel}
              onChange={setSelectedLevel}
            />
          </div>
          <div className="w-full sm:w-1/2">
            <ThemeDropdown
              label="Quick Select Course"
              options={courseOptions.map(c => ({ value: c, label: c }))}
              value={selectedCourse}
              onChange={setSelectedCourse}
            />
          </div>
        </div>

        {/* Custom Text Search */}
        <form onSubmit={handleCustomSearchSubmit} className="relative w-full">
          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider pl-1 block mb-1.5">Or Custom YouTube Search</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search custom topic (e.g. Backprop derivation, Dijkstra code)..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-24 py-3 bg-zinc-950/50 dark:bg-black/35 border border-zinc-200/10 dark:border-white/5 rounded-xl text-xs font-semibold text-white outline-none focus:ring-1 focus:ring-brand-primary"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-[10px] rounded-lg border-none cursor-pointer active:scale-95 transition-all shadow-md shadow-brand-primary/10"
            >
              Search
            </button>
          </div>
        </form>

        {/* Categories */}
        <div className="space-y-2">
          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider pl-1">Filter by Category</label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer active:scale-95 duration-200 border-solid ${
                    isActive
                      ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/10'
                      : 'bg-zinc-800/40 dark:bg-black/30 border border-zinc-200/10 dark:border-white/5 text-zinc-300 hover:border-brand-primary/50'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Continue Studying horizontal shelf */}
      {!activeVideoId && recentLectures.length > 0 && (
        <div className="space-y-4 text-left animate-fade-in">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-white/5 pb-2">
            <Clock size={14} className="text-brand-primary" />
            <h4 className="text-[10px] sm:text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest leading-none">
              Continue Watching
            </h4>
          </div>

          <div className="flex gap-5 overflow-x-auto no-scrollbar pb-3 snap-x snap-mandatory pt-1 px-1 -mx-1">
            {recentLectures.map((video) => (
              <div
                key={video.id}
                onClick={() => handleSelectRecentVideo(video)}
                className="snap-start shrink-0 w-[200px] sm:w-[240px] flex flex-col bg-zinc-50 dark:bg-white/[0.01] border border-zinc-200/50 dark:border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] hover:bg-zinc-100/50 dark:hover:bg-white/[0.03] transition-all duration-300 group animate-fade-in"
              >
                <div className="relative aspect-video bg-black overflow-hidden">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute bottom-2 right-2 bg-black/75 px-1.5 py-0.5 rounded text-[8px] font-bold text-white">
                    {video.duration}
                  </span>
                  
                  {/* Progress Bar overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
                    <div 
                      className="h-full bg-brand-primary" 
                      style={{ width: `${video.progress}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h5 className="text-[10px] sm:text-xs font-semibold text-zinc-950 dark:text-white leading-snug line-clamp-2">
                      {video.title}
                    </h5>
                    <p className="text-[8px] sm:text-[9px] text-zinc-500 truncate mt-1">{video.channel}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shimmering Skeleton Loader */}
      {loading && <LecturesSkeleton />}

      {/* Error Handling */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-red-500/[0.02] border border-dashed border-red-500/20 rounded-2xl max-w-xl mx-auto p-6 animate-fade-in">
          <AlertTriangle className="w-10 h-10 text-red-500" />
          <div>
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Lecture Directory Blocked</h4>
            <p className="text-[10px] text-zinc-400 max-w-sm mt-1 leading-relaxed">
              The scrapers could not query the direct YouTube feed due to local client proxy limits. Try selecting another category or course.
            </p>
          </div>
          <a 
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedCourse)}`}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 bg-brand-primary text-white rounded-xl text-[10px] font-bold border-none cursor-pointer hover:bg-brand-primary/95 flex items-center gap-1.5 shadow-md shadow-brand-primary/10"
          >
            Search YouTube Direct
            <ExternalLink size={12} />
          </a>
        </div>
      )}

      {/* Dynamic Display Mode */}
      {!loading && !error && ytVideos.length > 0 && (
        <>
          {isRawView ? (
            /* Raw Feed View Mode (YouTube style vertical grid feed) */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in text-left">
              {ytVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => handleSelectVideo(video)}
                  className={`group flex flex-col bg-[#111317] border rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.01] hover:bg-[#1a1c23]/30 transition-all duration-300 ${
                    activeVideoId === video.id ? 'border-brand-primary font-medium' : 'border-zinc-200/50 dark:border-white/5'
                  }`}
                >
                  {/* Video Thumbnail */}
                  <div className="relative aspect-video bg-black overflow-hidden border-b border-zinc-200/20 dark:border-white/5">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute bottom-2 right-2 bg-black/75 px-1.5 py-0.5 rounded text-[9px] font-bold text-white">
                      {video.duration}
                    </span>
                    {video.isLive && (
                      <span className="absolute top-2 left-2 bg-red-600 px-1.5 py-0.5 rounded text-[7px] font-bold text-white uppercase tracking-wider animate-pulse">
                        Live
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                      <div className="w-11 h-11 rounded-full bg-brand-primary flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300">
                        <Play size={16} className="text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Metadata block (with channel logo) */}
                  <div className="p-4 flex gap-3 flex-1 items-start">
                    {video.channelLogo ? (
                      <img 
                        src={video.channelLogo} 
                        alt={video.channel}
                        className="w-8 h-8 rounded-full object-cover border dark:border-white/10 shrink-0"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xs shrink-0">
                        {video.channel.charAt(0)}
                      </div>
                    )}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-zinc-950 dark:text-white leading-snug line-clamp-2">
                        {video.title}
                      </h4>
                      <div className="flex flex-col text-[10px] text-zinc-500 font-semibold">
                        <span className="truncate hover:text-brand-primary transition-colors">{video.channel}</span>
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          <span>{video.views}</span>
                          <span>•</span>
                          <span>{video.published}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Channel Shelves View Mode */
            <div className="space-y-12">
              {Object.entries(groupedVideos).map(([channelName, videosList]) => {
                const videos = videosList as YTVideo[];
                const firstVideo = videos[0];

                return (
                  <div key={channelName} className="space-y-4 text-left animate-fade-in">
                    {/* Channel Header */}
                    <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-white/5 pb-2">
                      {firstVideo?.channelLogo ? (
                        <img 
                          src={firstVideo.channelLogo} 
                          alt={channelName} 
                          className="w-5 h-5 rounded-full object-cover border dark:border-white/10 shrink-0"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                      )}
                      <h4 className="text-[10px] sm:text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest leading-none">
                        {channelName}
                      </h4>
                    </div>

                    {/* Horizontal Scrollable Row */}
                    <div className="relative w-full overflow-hidden">
                      <div 
                        onScroll={(e) => handleHorizontalScroll(e, channelName)}
                        className="flex gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-1 px-1 -mx-1 snap-x snap-mandatory animate-fade-in"
                      >
                        {videos.map((video) => (
                          <div
                            key={video.id}
                            onClick={() => handleSelectVideo(video)}
                            className={`snap-start shrink-0 w-[240px] sm:w-[260px] flex flex-col bg-[#111317] border rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] hover:bg-[#1a1c23]/30 transition-all duration-300 ${
                              activeVideoId === video.id ? 'border-brand-primary font-medium' : 'border-zinc-200/50 dark:border-white/5'
                            }`}
                          >
                            {/* Thumbnail with Play Overlay */}
                            <div className="relative aspect-video bg-black overflow-hidden border-b border-zinc-200/20 dark:border-white/5">
                              <img 
                                src={video.thumbnail} 
                                alt={video.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <span className="absolute bottom-2 right-2 bg-black/75 px-1.5 py-0.5 rounded text-[8px] font-bold text-white">
                                {video.duration}
                              </span>
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                                <div className="w-11 h-11 rounded-full bg-brand-primary flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300">
                                  <Play size={16} className="text-white fill-white ml-0.5" />
                                </div>
                              </div>
                            </div>
                            <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                              <div>
                                <h4 className="text-[11px] sm:text-xs font-semibold text-zinc-950 dark:text-white leading-snug line-clamp-2">
                                  {video.title}
                                </h4>
                              </div>
                              <div className="text-[9px] text-zinc-500 flex items-center gap-1.5 pt-1 border-t border-zinc-200/30 dark:border-white/[0.02] flex-wrap">
                                <span>{video.views}</span>
                                <span>•</span>
                                <span>{video.published}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default LecturesHub;
