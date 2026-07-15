import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useUniversity } from '../hooks/useUniversity.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Search, 
  ExternalLink, 
  Loader2, 
  AlertTriangle,
  PlayCircle,
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
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  SkipForward,
  ListVideo,
  Timer,
  MonitorPlay
} from 'lucide-react';
import { IITM_BS_DS, BTECH_CSE_2025 } from '../data/curriculumData.ts';
import { SUBJECT_NICKNAMES, CUSTOM_ACRONYMS } from '../data/subjectNicknames.ts';
import { UserProfile } from '../types';
import NexusServer from '../services/nexusServer.ts';

// ─── Types ───

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

// ─── Constants ───

const INVIDIOUS_INSTANCES = [
  "https://invidious.projectsegfau.lt",
  "https://invidious.flokinet.to",
  "https://invidious.lunar.icu",
  "https://invidious.private.coffee"
];

// ─── Search Query Building ───

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

  if (SUBJECT_NICKNAMES[q]) {
    const fullTitle = findFullTitleInCurriculum(q);
    if (fullTitle) return fullTitle;
  }

  for (const [code, nick] of Object.entries(SUBJECT_NICKNAMES)) {
    if (nick.toUpperCase() === q) {
      const fullTitle = findFullTitleInCurriculum(code);
      if (fullTitle) return fullTitle;
    }
  }

  if (CUSTOM_ACRONYMS[q]) return CUSTOM_ACRONYMS[q];
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

  let subjectTerm: string;
  if (isIITM) {
    subjectTerm = resolved;
  } else {
    subjectTerm = code ? `${code} ${resolved}` : resolved;
  }

  let categorySuffix: string;
  if (isIITM) {
    switch (catId) {
      case 'quiz1': categorySuffix = 'quiz 1'; break;
      case 'quiz2': categorySuffix = 'quiz 2'; break;
      case 'endterm': categorySuffix = 'end term exam'; break;
      case 'pyq': categorySuffix = 'pyq solutions'; break;
      default: categorySuffix = 'lectures'; break;
    }
  } else {
    switch (catId) {
      case 'quiz1': categorySuffix = 'midterm one shot'; break;
      case 'quiz2': categorySuffix = 'CA3 one shot'; break;
      case 'endterm': categorySuffix = 'end term exam'; break;
      case 'pyq': categorySuffix = 'pyq solved papers'; break;
      default: categorySuffix = 'lectures'; break;
    }
  }

  let query: string;
  if (channelName) {
    query = `${channelName} ${subjectTerm} ${categorySuffix}`;
  } else {
    const brand = isIITM ? 'IITM BS' : 'LPU';
    query = `${brand} ${subjectTerm} ${categorySuffix}`;
  }
  return query.trim().replace(/\s+/g, ' ');
};

// ─── Utilities ───

const formatDuration = (totalSecs: number): string => {
  if (totalSecs <= 0) return "";
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  if (hrs > 0) return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const parseDurationToSeconds = (dur: string): number => {
  if (!dur) return 0;
  const parts = dur.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
};

const formatStudyTime = (totalSecs: number): string => {
  if (totalSecs <= 0) return "";
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
};

const safeJsonParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try { return JSON.parse(raw) ?? fallback; } catch { return fallback; }
};

// ─── API Fetchers ───

const fetchFromInvidious = async (query: string, page: number, signal?: AbortSignal): Promise<YTVideo[]> => {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const targetUrl = `${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video&page=${page}`;
      const url = `/api/gateway?action=youtube-proxy&url=${encodeURIComponent(targetUrl)}`;
      const res = await fetch(url, { signal });
      const contentType = res.headers.get('content-type') || '';
      let data;
      if (!res.ok || contentType.includes('text/html')) {
        const directRes = await fetch(targetUrl, { signal });
        if (!directRes.ok) continue;
        data = await directRes.json();
      } else {
        data = await res.json();
      }
      if (!Array.isArray(data)) continue;
      return data.map((item: any) => ({
        id: item.videoId,
        title: item.title || "Untitled Lecture",
        channel: item.author || "University Channel",
        channelLogo: item.authorThumbnails?.[0]?.url || "",
        isLive: item.liveNow || item.isLive || false,
        duration: formatDuration(item.lengthSeconds || 0),
        views: item.viewCount ? `${item.viewCount.toLocaleString()} views` : "",
        published: item.publishedText || "",
        thumbnail: `https://i.ytimg.com/vi/${item.videoId}/mqdefault.jpg`
      }));
    } catch (e: any) {
      if (e.name === 'AbortError') throw e;
      console.warn(`Failed: ${instance}`, e);
    }
  }
  throw new Error("All lecture search servers are currently unavailable.");
};

// ─── Sub-Components ───

const CompactDropdown: React.FC<{
  prefix?: string; options: DropdownOption[]; value: string; onChange: (val: string) => void; className?: string;
}> = ({ prefix, options, value, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const currentOption = options.find(o => o.value === value) || options[0];

  return (
    <div ref={ref} className={`relative text-left ${className}`}>
      <button
        type="button" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} aria-haspopup="listbox"
        className="w-full flex items-center justify-between gap-1.5 bg-zinc-900/40 dark:bg-black/30 border border-zinc-200/10 dark:border-white/5 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none hover:border-brand-primary/50 transition-all text-left cursor-pointer"
      >
        <span className="truncate pr-1">
          {prefix && <span className="text-zinc-400 font-medium mr-1">{prefix}:</span>}
          {currentOption?.label || value}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }}
            role="listbox" className="absolute z-50 left-0 mt-1 min-w-[200px] max-w-[280px] bg-zinc-900 dark:bg-[#0a0a0a] border border-zinc-200/10 dark:border-white/5 rounded-xl shadow-2xl max-h-48 overflow-y-auto no-scrollbar p-1 space-y-0.5 backdrop-blur-xl"
          >
            {options.map((opt) => (
              <button key={opt.value} type="button" role="option" aria-selected={value === opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs font-semibold transition-all border-none rounded-lg cursor-pointer ${
                  value === opt.value ? 'bg-brand-primary text-white' : 'text-zinc-300 bg-transparent hover:bg-white/5 hover:text-brand-primary'
                }`}
              >{opt.label}</button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LecturesSkeleton: React.FC = () => (
  <div className="space-y-12 max-w-5xl mx-auto w-full pt-4">
    {[1, 2, 3].map((shelfIdx) => (
      <div key={shelfIdx} className="space-y-4 text-left">
        <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-white/5 pb-2">
          <div className="w-5 h-5 rounded-full bg-white/5 animate-pulse" />
          <div className="h-3.5 w-32 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="flex gap-5 overflow-x-hidden pb-4">
          {[1, 2, 3, 4].map((cardIdx) => (
            <div key={cardIdx} className="shrink-0 w-[240px] sm:w-[260px] flex flex-col bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden">
              <div className="aspect-video bg-white/5 w-full shimmer-bg" />
              <div className="p-3.5 space-y-3">
                <div className="h-3 bg-white/5 rounded w-5/6 shimmer-bg" />
                <div className="h-3 bg-white/5 rounded w-2/3 shimmer-bg" />
                <div className="h-2 bg-white/5 rounded w-1/3 shimmer-bg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// ─── Video Card — Netflix-Style with Hover Expand ───

const VideoCard: React.FC<{
  video: YTVideo;
  isActive: boolean;
  isBookmarked: boolean;
  onSelect: (video: YTVideo) => void;
  onToggleBookmark: (videoId: string) => void;
  variant: 'shelf' | 'feed';
  index?: number;
}> = ({ video, isActive, isBookmarked, onSelect, onToggleBookmark, variant, index = 0 }) => {
  const isShelf = variant === 'shelf';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3), ease: [0.25, 0.46, 0.45, 0.94] }}
      role="button"
      tabIndex={0}
      aria-label={`Play ${video.title} by ${video.channel}`}
      onClick={() => onSelect(video)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(video); } }}
      className={`group relative ${isShelf ? 'snap-start shrink-0 w-[240px] sm:w-[270px]' : ''} flex flex-col cursor-pointer transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60`}
    >
      {/* Thumbnail */}
      <div className={`relative aspect-video bg-zinc-950 overflow-hidden rounded-xl transition-all duration-300 ${
        isActive ? 'ring-2 ring-brand-primary shadow-lg shadow-brand-primary/20 scale-[0.98]' : 'group-hover:shadow-md'
      }`}>
        <img src={video.thumbnail} alt={video.title} loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {video.duration && (
          <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-bold text-white z-10">
            {video.duration}
          </span>
        )}
        {video.isLive && (
          <span className="absolute top-2 left-2 bg-red-600 px-2 py-0.5 rounded text-[7px] font-bold text-white uppercase tracking-wider animate-pulse z-10">
            ● Live
          </span>
        )}
        
        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <div className="w-12 h-12 rounded-full bg-brand-primary/90 backdrop-blur-sm flex items-center justify-center shadow-2xl shadow-brand-primary/30 transform scale-75 group-hover:scale-100 transition-all duration-300">
            <Play size={18} className="text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Bookmark */}
        <button type="button" aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          onClick={(e) => { e.stopPropagation(); onToggleBookmark(video.id); }}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 border-none cursor-pointer z-20"
        >
          {isBookmarked ? <BookmarkCheck size={13} className="text-brand-primary" /> : <Bookmark size={13} />}
        </button>
      </div>

      {/* Metadata */}
      <div className="pt-2 px-0.5 pb-1 flex gap-2 flex-1 items-start">
        {!isShelf && (
          video.channelLogo ? (
            <img src={video.channelLogo} alt={video.channel} loading="lazy"
              className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0 mt-0.5"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xs shrink-0 mt-0.5">
              {video.channel.charAt(0)}
            </div>
          )
        )}
        <div className="space-y-1 min-w-0 flex-1">
          <h4 className="text-[11px] sm:text-xs font-semibold text-white leading-snug line-clamp-2 group-hover:text-brand-primary/90 transition-colors">
            {video.title}
          </h4>
          {!isShelf && (
            <span className="text-[10px] text-zinc-500 font-medium truncate block">{video.channel}</span>
          )}
          <div className="text-[9px] text-zinc-600 flex items-center gap-1.5 flex-wrap">
            {video.views && <span>{video.views}</span>}
            {video.views && video.published && <span>•</span>}
            {video.published && <span>{video.published}</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Up Next Sidebar ───

const UpNextPanel: React.FC<{
  videos: YTVideo[];
  activeVideoId: string;
  bookmarks: Set<string>;
  onSelect: (v: YTVideo) => void;
  onToggleBookmark: (id: string) => void;
}> = ({ videos, activeVideoId, bookmarks, onSelect, onToggleBookmark }) => {
  const upNextVideos = useMemo(() => {
    const idx = videos.findIndex(v => v.id === activeVideoId);
    if (idx === -1) return videos.slice(0, 10);
    return [...videos.slice(idx + 1), ...videos.slice(0, idx)].slice(0, 10);
  }, [videos, activeVideoId]);

  if (upNextVideos.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-white/5">
        <ListVideo size={13} className="text-brand-primary" />
        <h5 className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Up Next</h5>
        <span className="text-[9px] text-zinc-600 ml-auto">{upNextVideos.length} videos</span>
      </div>
      <div className="space-y-2 max-h-[500px] overflow-y-auto no-scrollbar pr-1">
        {upNextVideos.map((video, i) => (
          <div
            key={video.id}
            role="button" tabIndex={0}
            aria-label={`Play next: ${video.title}`}
            onClick={() => onSelect(video)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(video); } }}
            className="group flex gap-3 p-2 rounded-xl cursor-pointer hover:bg-white/[0.03] transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary/50"
          >
            {/* Index */}
            <span className="text-[10px] text-zinc-600 font-bold w-4 shrink-0 pt-1 text-center">{i + 1}</span>
            
            {/* Thumbnail */}
            <div className="relative w-28 sm:w-32 aspect-video rounded-lg overflow-hidden bg-black shrink-0">
              <img src={video.thumbnail} alt={video.title} loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {video.duration && (
                <span className="absolute bottom-1 right-1 bg-black/80 px-1 py-px rounded text-[7px] font-bold text-white">
                  {video.duration}
                </span>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200">
                <Play size={14} className="text-white fill-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-1 pt-0.5">
              <h6 className="text-[10px] sm:text-[11px] font-semibold text-zinc-200 leading-snug line-clamp-2 group-hover:text-white transition-colors">
                {video.title}
              </h6>
              <p className="text-[9px] text-zinc-600 truncate">{video.channel}</p>
              {video.views && <p className="text-[8px] text-zinc-700">{video.views}</p>}
            </div>

            {/* Bookmark */}
            <button type="button"
              onClick={(e) => { e.stopPropagation(); onToggleBookmark(video.id); }}
              className="p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-brand-primary bg-transparent border-none cursor-pointer shrink-0 self-center"
            >
              {bookmarks.has(video.id) ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};



// ═══════════════════════════════════════════════════
// ─── MAIN COMPONENT ───
// ═══════════════════════════════════════════════════

interface LecturesHubProps {
  hideHeader?: boolean;
  userProfile?: UserProfile | null;
}

export const LecturesHub: React.FC<LecturesHubProps> = ({ hideHeader = false, userProfile = null }) => {
  const { selectedUniversity } = useUniversity();
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [isRawView, setIsRawView] = useState(false);
  const [ytVideos, setYtVideos] = useState<YTVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [channelPages, setChannelPages] = useState<Record<string, number>>({});
  const [channelHasMore, setChannelHasMore] = useState<Record<string, boolean>>({});
  const [loadingChannels, setLoadingChannels] = useState<Record<string, boolean>>({});
  const [feedPage, setFeedPage] = useState(1);
  const [hasMoreFeed, setHasMoreFeed] = useState(true);
  const [loadingMoreFeed, setLoadingMoreFeed] = useState(false);

  // Player
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [activeVideoDetails, setActiveVideoDetails] = useState<VideoDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  // Persistence
  const [recentLectures, setRecentLectures] = useState<RecentLecture[]>([]);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  // Refs
  const topRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const feedEndRef = useRef<HTMLDivElement>(null);

  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const lastSavedProgressRef = useRef<Record<string, number>>({});

  // ─── Load persisted data ───
  useEffect(() => {
    setRecentLectures(safeJsonParse(localStorage.getItem('scholix_recent_lectures'), []));
    setBookmarks(new Set(safeJsonParse<string[]>(localStorage.getItem('scholix_bookmarks'), [])));
  }, []);

  const activeVideo = useMemo(() => {
    if (!activeVideoId) return null;
    return ytVideos.find(v => v.id === activeVideoId) || recentLectures.find(v => v.id === activeVideoId) || null;
  }, [activeVideoId, ytVideos, recentLectures]);

  // ─── Sync watch progress from Supabase on mount/login ───
  useEffect(() => {
    const syncSupabaseProgress = async () => {
      if (!userProfile?.id) return;
      try {
        const stats = await NexusServer.fetchStudyStats(userProfile.id);
        if (stats && Array.isArray(stats.recent_activities)) {
          const supabaseProgressRecords = stats.recent_activities.filter(
            (act: any) => act.type === 'video_progress'
          );

          if (supabaseProgressRecords.length > 0) {
            setRecentLectures(prev => {
              const mergedMap = new Map<string, RecentLecture>();
              // Load local records first
              prev.forEach(l => mergedMap.set(l.id, l));

              // Load newer records from Supabase
              supabaseProgressRecords.forEach((rec: any) => {
                const data = rec.content;
                if (data && data.videoId) {
                  const existingLocal = mergedMap.get(data.videoId);
                  const videoInfo = data.video || (existingLocal ? existingLocal : null);
                  
                  if (videoInfo) {
                    const localWatchedAt = existingLocal?.watchedAt || 0;
                    const supabaseWatchedAt = data.watchedAt || new Date(rec.created_at).getTime() || 0;

                    // If Supabase record is newer, or local doesn't exist, use Supabase progress
                    if (!existingLocal || supabaseWatchedAt > localWatchedAt) {
                      mergedMap.set(data.videoId, {
                        ...videoInfo,
                        progress: data.progress,
                        watchedAt: supabaseWatchedAt
                      });
                      // Seed last saved progress ref to avoid immediate rewrite
                      lastSavedProgressRef.current[data.videoId] = data.progress;
                    }
                  }
                }
              });

              // Sort by watchedAt descending and limit to 8
              const newList = Array.from(mergedMap.values())
                .sort((a, b) => b.watchedAt - a.watchedAt)
                .slice(0, 8);

              localStorage.setItem('scholix_recent_lectures', JSON.stringify(newList));
              return newList;
            });
          }
        }
      } catch (err) {
        console.error("Failed to sync progress from Supabase:", err);
      }
    };

    syncSupabaseProgress();
  }, [userProfile]);

  // ─── Bookmark toggle ───
  const toggleBookmark = useCallback((videoId: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      next.has(videoId) ? next.delete(videoId) : next.add(videoId);
      localStorage.setItem('scholix_bookmarks', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const saveRecentLecture = useCallback((video: YTVideo, progress: number = 0) => {
    setRecentLectures(prev => {
      const filtered = prev.filter(v => v.id !== video.id);
      const updated: RecentLecture = { ...video, progress, watchedAt: Date.now() };
      const newList = [updated, ...filtered].slice(0, 8);
      localStorage.setItem('scholix_recent_lectures', JSON.stringify(newList));
      return newList;
    });
  }, []);

  const updateProgress = useCallback((video: YTVideo, progress: number, currentTime: number) => {
    // 1. Update local storage and React state
    setRecentLectures(prev => {
      const filtered = prev.filter(v => v.id !== video.id);
      const updated: RecentLecture = { ...video, progress, watchedAt: Date.now() };
      const newList = [updated, ...filtered].slice(0, 8);
      localStorage.setItem('scholix_recent_lectures', JSON.stringify(newList));
      return newList;
    });

    // 2. Sync to Supabase if logged in
    if (userProfile?.id) {
      const lastSaved = lastSavedProgressRef.current[video.id] || 0;
      // Write if progress changes by >= 3%, or is complete (100%), or is just starting (> 0)
      if (Math.abs(progress - lastSaved) >= 3 || progress === 100 || (lastSaved === 0 && progress > 0)) {
        lastSavedProgressRef.current[video.id] = progress;
        
        console.log("Saving video progress to Supabase:", {
          videoId: video.id,
          title: video.title,
          progress,
          currentTime
        });

        NexusServer.saveRecord(
          userProfile.id,
          'video_progress',
          video.id,
          {
            videoId: video.id,
            progress,
            currentTime,
            watchedAt: Date.now(),
            video: video
          }
        ).catch(err => {
          console.error("Error saving progress to Supabase:", err);
        });
      }
    }
  }, [userProfile]);

  const stopProgressInterval = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const startProgressInterval = useCallback(() => {
    stopProgressInterval();
    progressIntervalRef.current = window.setInterval(() => {
      const player = playerRef.current;
      if (player && typeof player.getCurrentTime === 'function' && typeof player.getDuration === 'function') {
        try {
          const currentTime = player.getCurrentTime();
          const duration = player.getDuration();
          const state = typeof player.getPlayerState === 'function' ? player.getPlayerState() : -1;
          const loadedFraction = typeof player.getVideoLoadedFraction === 'function' ? player.getVideoLoadedFraction() : 0;
          
          if (duration > 0) {
            const progress = Math.min(100, Math.round((currentTime / duration) * 100));
            
            console.log("YouTube Player Progress Update:", {
              currentTime: Math.round(currentTime),
              duration: Math.round(duration),
              progress: progress.toFixed(2) + "%",
              playerState: state,
              bufferedFraction: loadedFraction
            });

            if (activeVideo) {
              updateProgress(activeVideo, progress, currentTime);
            }
          }
        } catch (err) {
          console.warn("Error reading from YT Player API:", err);
        }
      }
    }, 4000); // Check every 4 seconds
  }, [activeVideo, updateProgress, stopProgressInterval]);

  // ─── YouTube Iframe Player API Injection & Initialization ───
  useEffect(() => {
    if (activeVideoId) {
      if (!(window as any).YT) {
        (window as any).onYouTubeIframeAPIReady = () => {
          initializePlayer();
        };

        const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
        if (!existingScript) {
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }
      } else {
        initializePlayer();
      }
    }

    return () => {
      stopProgressInterval();
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.warn("Error destroying YT Player:", e);
        }
        playerRef.current = null;
      }
    };

    function initializePlayer() {
      setTimeout(() => {
        const iframeElement = document.getElementById('yt-player');
        if (!iframeElement || !(window as any).YT || !(window as any).YT.Player) return;

        playerRef.current = new (window as any).YT.Player('yt-player', {
          events: {
            onStateChange: (event: any) => {
              if (event.data === 1) {
                startProgressInterval();
              } else {
                stopProgressInterval();
              }
            }
          }
        });
      }, 500);
    }
  }, [activeVideoId, startProgressInterval, stopProgressInterval]);

  const handleSelectVideo = useCallback((video: YTVideo) => {
    setActiveVideoId(video.id);
    const existing = recentLectures.find(r => r.id === video.id);
    saveRecentLecture(video, existing?.progress || 0);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [recentLectures, saveRecentLecture]);

  const handleSelectRecentVideo = useCallback((video: RecentLecture) => {
    setActiveVideoId(video.id);
    saveRecentLecture(video, video.progress);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [saveRecentLecture]);

  const handlePlayNext = useCallback(() => {
    if (!activeVideoId || ytVideos.length === 0) return;
    const idx = ytVideos.findIndex(v => v.id === activeVideoId);
    const nextIdx = (idx + 1) % ytVideos.length;
    handleSelectVideo(ytVideos[nextIdx]);
  }, [activeVideoId, ytVideos, handleSelectVideo]);

  const activeVideoMemo = useMemo(() => {
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

  // ─── Curriculum parsing ───
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
      if (!levelToCourses[levelName]) levelToCourses[levelName] = [];
      const addCourse = (title: string) => {
        if (!levelToCourses[levelName].includes(title)) levelToCourses[levelName].push(title);
      };
      term.coreSubjects.forEach(s => addCourse(s.title));
      term.electiveBaskets.forEach(b => b.subjects.forEach(s => addCourse(s.title)));
    });
    return { levels: Array.from(levelsSet), levelToCourses };
  }, [selectedUniversity]);

  const levels = curriculumMap.levels;

  useEffect(() => { if (levels.length > 0) setSelectedLevel(levels[0]); }, [levels]);

  const courseOptions = useMemo(() => curriculumMap.levelToCourses[selectedLevel] || [], [selectedLevel, curriculumMap]);

  useEffect(() => { setSelectedCourse(courseOptions.length > 0 ? courseOptions[0] : ''); }, [courseOptions]);

  // ─── Search ───
  const searchYouTube = useCallback(async (subject: string, catId: string = 'all') => {
    if (!subject) return;
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true); setYtVideos([]); setError(null); setActiveVideoId(null);
    setChannelPages({}); setChannelHasMore({}); setLoadingChannels({});
    setFeedPage(1); setHasMoreFeed(true); setLoadingMoreFeed(false);

    const searchQuery = buildSearchQuery(subject, catId, selectedUniversity);
    const query = encodeURIComponent(searchQuery);
    
    try {
      let fetchedVideos: YTVideo[] = [];
      try {
        const url = `/api/gateway?action=youtube-proxy&url=${encodeURIComponent(`https://www.youtube.com/results?search_query=${query}`)}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error("Proxy error.");
        const html = await res.text();
        const startStr = 'var ytInitialData = ';
        const startIndex = html.indexOf(startStr);
        if (startIndex === -1) throw new Error("Payload not found.");
        const dataStart = startIndex + startStr.length;
        const endIndex = html.indexOf(';</script>', dataStart);
        if (endIndex === -1) throw new Error("Payload boundary error.");
        const data = JSON.parse(html.substring(dataStart, endIndex));
        const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents;
        if (contents && Array.isArray(contents)) {
          for (const item of contents) {
            if (item.videoRenderer) {
              const vr = item.videoRenderer;
              fetchedVideos.push({
                id: vr.videoId, title: vr.title?.runs?.[0]?.text || "Untitled",
                channel: vr.longBylineText?.runs?.[0]?.text || vr.ownerText?.runs?.[0]?.text || "Channel",
                channelLogo: vr.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails?.[0]?.url || "",
                isLive: vr.badges?.some((b: any) => b.metadataBadgeRenderer?.style === "BADGE_STYLE_TYPE_LIVE_NOW" || b.metadataBadgeRenderer?.label === "LIVE") || !vr.lengthText,
                duration: vr.lengthText?.simpleText || "", views: vr.viewCountText?.simpleText || "",
                published: vr.publishedTimeText?.simpleText || "", thumbnail: `https://i.ytimg.com/vi/${vr.videoId}/mqdefault.jpg`
              });
            }
          }
        }
      } catch (scrapeErr: any) {
        if (scrapeErr.name === 'AbortError') throw scrapeErr;
        fetchedVideos = await fetchFromInvidious(searchQuery, 1, controller.signal);
      }
      if (controller.signal.aborted) return;
      if (fetchedVideos.length === 0) throw new Error("No lectures found.");
      setYtVideos(fetchedVideos);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err.message || "Search failed.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [selectedUniversity]);

  // ─── Channel Load More ───
  const loadMoreForChannel = useCallback(async (channelName: string) => {
    if (loading || loadingChannels[channelName]) return;
    setLoadingChannels(prev => ({ ...prev, [channelName]: true }));
    const nextPage = (channelPages[channelName] || 1) + 1;
    const activeSubject = searchText.trim() || selectedCourse;
    if (!activeSubject || nextPage > 5) {
      setChannelHasMore(prev => ({ ...prev, [channelName]: false }));
      setLoadingChannels(prev => ({ ...prev, [channelName]: false }));
      return;
    }
    try {
      const q = buildSearchQuery(activeSubject, activeCategory, selectedUniversity, channelName);
      const fetched = await fetchFromInvidious(q, nextPage);
      const filtered = fetched.filter(v => v.channel.toLowerCase().includes(channelName.toLowerCase()) || channelName.toLowerCase().includes(v.channel.toLowerCase()));
      if (filtered.length === 0) { setChannelHasMore(prev => ({ ...prev, [channelName]: false })); }
      else {
        setYtVideos(prev => { const ids = new Set(prev.map(v => v.id)); return [...prev, ...filtered.filter(v => !ids.has(v.id))]; });
        setChannelPages(prev => ({ ...prev, [channelName]: nextPage }));
      }
    } catch { setChannelHasMore(prev => ({ ...prev, [channelName]: false })); }
    finally { setLoadingChannels(prev => ({ ...prev, [channelName]: false })); }
  }, [loading, loadingChannels, channelPages, searchText, selectedCourse, activeCategory, selectedUniversity]);

  // ─── Feed Load More ───
  const loadMoreForFeed = useCallback(async () => {
    if (loading || loadingMoreFeed || !hasMoreFeed) return;
    setLoadingMoreFeed(true);
    const nextPage = feedPage + 1;
    const activeSubject = searchText.trim() || selectedCourse;
    if (!activeSubject || nextPage > 6) { setHasMoreFeed(false); setLoadingMoreFeed(false); return; }
    try {
      const fetched = await fetchFromInvidious(buildSearchQuery(activeSubject, activeCategory, selectedUniversity), nextPage);
      if (fetched.length === 0) setHasMoreFeed(false);
      else {
        setYtVideos(prev => { const ids = new Set(prev.map(v => v.id)); return [...prev, ...fetched.filter(v => !ids.has(v.id))]; });
        setFeedPage(nextPage);
      }
    } catch { setHasMoreFeed(false); }
    finally { setLoadingMoreFeed(false); }
  }, [loading, loadingMoreFeed, hasMoreFeed, feedPage, searchText, selectedCourse, activeCategory, selectedUniversity]);

  // ─── Video Details ───
  const fetchVideoDetails = useCallback(async (videoId: string) => {
    setLoadingDetails(true); setActiveVideoDetails(null);
    for (const instance of INVIDIOUS_INSTANCES) {
      try {
        const targetUrl = `${instance}/api/v1/videos/${videoId}`;
        const url = `/api/gateway?action=youtube-proxy&url=${encodeURIComponent(targetUrl)}`;
        const res = await fetch(url);
        const ct = res.headers.get('content-type') || '';
        let data;
        if (!res.ok || ct.includes('text/html')) { const d = await fetch(targetUrl); if (!d.ok) continue; data = await d.json(); }
        else data = await res.json();
        const subs = data.authorSubscriberCount || 0;
        setActiveVideoDetails({
          likes: data.likeCount || 0, dislikes: data.dislikeCount || 0,
          subscribers: subs >= 1e6 ? `${(subs / 1e6).toFixed(1)}M` : subs >= 1e3 ? `${(subs / 1e3).toFixed(1)}K` : `${subs}`,
          description: data.description || ""
        });
        setLoadingDetails(false); return;
      } catch { /* try next */ }
    }
    setLoadingDetails(false);
  }, []);

  useEffect(() => { if (activeVideoId) fetchVideoDetails(activeVideoId); }, [activeVideoId, fetchVideoDetails]);

  useEffect(() => {
    if (selectedCourse) { setSearchText(''); searchYouTube(selectedCourse, activeCategory); }
  }, [selectedCourse, activeCategory, selectedUniversity, searchYouTube]);

  // ─── Keyboard Shortcuts ───
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Escape') { if (activeVideoId) { setActiveVideoId(null); } }
      if (e.key === 'n' && activeVideoId) handlePlayNext();
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [activeVideoId, handlePlayNext]);

  // ─── Feed infinite scroll ───
  useEffect(() => {
    if (!isRawView || !feedEndRef.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e?.isIntersecting && hasMoreFeed && !loadingMoreFeed) loadMoreForFeed(); }, { rootMargin: '400px' });
    obs.observe(feedEndRef.current);
    return () => obs.disconnect();
  }, [isRawView, hasMoreFeed, loadingMoreFeed, loadMoreForFeed]);

  const handleCustomSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) { setIsRawView(true); searchYouTube(searchText.trim(), activeCategory); }
  };

  const handleHorizontalScroll = (e: React.UIEvent<HTMLDivElement>, ch: string) => {
    const t = e.currentTarget;
    if (t.scrollWidth <= t.clientWidth) return;
    if (t.scrollWidth - t.scrollLeft - t.clientWidth < 300 && !loading && !loadingChannels[ch] && channelHasMore[ch] !== false) loadMoreForChannel(ch);
  };

  const groupedVideos = useMemo(() => {
    const g: Record<string, YTVideo[]> = {};
    ytVideos.forEach(v => { const ch = v.channel || 'Unknown'; if (!g[ch]) g[ch] = []; g[ch].push(v); });
    return g;
  }, [ytVideos]);

  const ratingMetrics = useMemo(() => {
    if (!activeVideoDetails) return null;
    const { likes, dislikes } = activeVideoDetails;
    const total = likes + dislikes;
    const pct = total > 0 ? Math.round((likes / total) * 100) : 0;
    return { percentage: pct, likesFormatted: likes >= 1000 ? `${(likes / 1000).toFixed(1)}K` : `${likes}`, dislikesFormatted: dislikes >= 1000 ? `${(dislikes / 1000).toFixed(1)}K` : `${dislikes}` };
  }, [activeVideoDetails]);

  // ═══════════════════════════════════════════════════
  // ─── RENDER ───
  // ═══════════════════════════════════════════════════

  return (
    <div ref={topRef} className="max-w-5xl mx-auto w-full space-y-8 animate-fade-in pb-20 text-center md:text-left scroll-mt-6 px-4">



      {!hideHeader && (
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-white/5 text-left mb-2">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight leading-tight">
              YouTube <span className="text-brand-primary">Lectures</span>
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-[11px] sm:text-xs mt-0.5">
              Browse and watch university lectures inline without distraction
            </p>
          </div>

          {/* Compact Filters & Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Level Dropdown */}
            <CompactDropdown 
              prefix="Level" 
              options={levels.map(l => ({ value: l, label: l }))} 
              value={selectedLevel} 
              onChange={setSelectedLevel} 
              className="w-[calc(50%-4px)] sm:w-auto min-w-[130px]"
            />
            
            {/* Course Dropdown */}
            <CompactDropdown 
              prefix="Course" 
              options={courseOptions.map(c => ({ value: c, label: c }))} 
              value={selectedCourse} 
              onChange={setSelectedCourse} 
              className="w-[calc(50%-4px)] sm:w-auto min-w-[180px] max-w-[280px]"
            />

            {/* Category Dropdown */}
            <CompactDropdown 
              prefix="Category" 
              options={categories.map(cat => ({ value: cat.id, label: cat.label }))} 
              value={activeCategory} 
              onChange={setActiveCategory} 
              className="w-[calc(50%-4px)] sm:w-auto min-w-[130px]"
            />

            {/* Search bar */}
            <form onSubmit={handleCustomSearchSubmit} className="relative w-[calc(50%-4px)] sm:w-auto">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search topic..." 
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full sm:w-[150px] md:w-[180px] pl-8 pr-3 py-2 bg-black/30 border border-white/5 rounded-xl text-xs font-semibold text-white outline-none focus:ring-1 focus:ring-brand-primary/50 placeholder:text-zinc-600 transition-all"
              />
            </form>

            {/* Shelves / Feed Toggle */}
            <div className="flex bg-black/40 p-0.5 rounded-xl border border-white/5 shrink-0 ml-auto sm:ml-0">
              {[{ key: false, label: 'Shelves' }, { key: true, label: 'Feed' }].map(m => (
                <button 
                  key={String(m.key)} 
                  type="button" 
                  onClick={() => setIsRawView(m.key)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold border-none cursor-pointer transition-all ${
                    isRawView === m.key ? 'bg-brand-primary text-white shadow-sm' : 'bg-transparent text-zinc-400 hover:text-white'
                  }`}
                >{m.label}</button>
              ))}
            </div>
          </div>
        </header>
      )}

      {/* ─── Hero Banner ─── */}
      {!activeVideoId && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full aspect-[16/7] sm:aspect-[21/9] md:aspect-[3/1] bg-gradient-to-br from-zinc-950 via-zinc-900 to-black rounded-3xl overflow-hidden shadow-2xl flex items-center justify-start text-left p-6 sm:p-12 border border-white/[0.06]"
        >
          {/* Animated background accent */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
            <div className="absolute inset-0 bg-gradient-to-l from-brand-primary/20 via-transparent to-transparent" />
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl animate-pulse" />
          </div>

          {recentLectures.length > 0 && (
            <div className="absolute inset-0 z-0">
              <img src={recentLectures[0].thumbnail} alt="" aria-hidden="true"
                className="w-full h-full object-cover blur-3xl opacity-20 scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/40" />
            </div>
          )}

          <div className="relative z-10 max-w-lg space-y-3 sm:space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-bold bg-brand-primary/10 text-brand-primary uppercase tracking-widest border border-brand-primary/20 backdrop-blur-sm">
              <Sparkles size={10} />
              {recentLectures.length > 0 ? 'Continue Studying' : 'Start Learning'}
            </span>

            {recentLectures.length > 0 ? (
              <>
                <h3 className="text-lg sm:text-2xl font-light text-white tracking-wide leading-tight line-clamp-2">
                  Resume: <span className="font-semibold">{recentLectures[0].title}</span>
                </h3>
                <p className="text-[10px] sm:text-xs text-zinc-400 font-medium">{recentLectures[0].channel}</p>
                <button onClick={() => handleSelectRecentVideo(recentLectures[0])}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-xs rounded-xl border-none cursor-pointer transition-all active:scale-95 shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/30"
                >
                  <Play size={14} className="fill-white" /> Resume Lecture
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg sm:text-2xl font-light text-white tracking-wide leading-tight">
                  Start Your <span className="font-semibold text-brand-primary">Study Session</span>
                </h3>
                <p className="text-[10px] sm:text-xs text-zinc-400 font-medium leading-relaxed max-w-sm">
                  Select your course and stream distraction-free video lectures instantly.
                </p>
                <button onClick={() => topRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-zinc-950 hover:bg-zinc-100 font-bold text-xs rounded-xl border-none cursor-pointer transition-all active:scale-95"
                >
                  <SlidersHorizontal size={13} /> Explore Courses
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* ─── Player + Up Next ─── */}
      <AnimatePresence>
        {activeVideoId && activeVideo && (
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Main Player Column */}
            <div className="flex-1 min-w-0 space-y-4">
              
              {/* The Player Card itself */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="text-left transition-all duration-300 border border-white/[0.06] rounded-3xl overflow-hidden p-5 sm:p-6 space-y-4 bg-gradient-to-br from-[#0e0f12] to-[#080809] shadow-2xl shadow-black/40"
              >
                {/* Header bar */}
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-[9px] font-bold text-brand-primary uppercase flex items-center gap-1.5">
                    <PlayCircle size={12} /> Now Playing
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={handlePlayNext} aria-label="Play next video (N)" title="Next (N)"
                      className="p-1.5 hover:bg-white/5 rounded-lg border-none bg-transparent cursor-pointer text-zinc-500 hover:text-white transition-colors">
                      <SkipForward size={13} />
                    </button>
                    <button onClick={() => setActiveVideoId(null)} aria-label="Close player"
                      className="p-1.5 hover:bg-white/5 rounded-lg border-none bg-transparent cursor-pointer text-zinc-500 hover:text-red-400 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* YouTube embed wrapper */}
                <div className="relative aspect-video w-full rounded-2xl border border-white/5 overflow-hidden bg-black shadow-2xl">
                  <iframe
                    id="yt-player"
                    src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
                    title={activeVideo.title} frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen className="absolute inset-0 w-full h-full"
                  />
                </div>

                {/* Video info + stats */}
                <div className="space-y-3 pt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {activeVideo.channelLogo ? (
                        <img src={activeVideo.channelLogo} alt={activeVideo.channel}
                          className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-sm shrink-0">
                          {activeVideo.channel.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-white leading-tight line-clamp-2">{activeVideo.title}</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{activeVideo.channel}</p>
                        {loadingDetails ? (
                          <span className="text-[9px] text-zinc-500 flex items-center gap-1 mt-0.5">
                            <Loader2 className="w-2.5 h-2.5 animate-spin" /> Loading...
                          </span>
                        ) : activeVideoDetails ? (
                          <p className="text-[9px] text-zinc-500 font-semibold flex items-center gap-1.5 mt-0.5">
                            <Users size={10} /> {activeVideoDetails.subscribers} subs
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {!loadingDetails && ratingMetrics && (
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400">
                          <span className="flex items-center gap-1">
                            <ThumbsUp size={12} className="text-emerald-500" />
                            {ratingMetrics.likesFormatted} ({ratingMetrics.percentage}%)
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsDown size={12} className="text-red-400" />
                            {ratingMetrics.dislikesFormatted}
                          </span>
                        </div>
                        <div className="w-36 h-1 bg-white/10 rounded-full overflow-hidden flex">
                          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${ratingMetrics.percentage}%` }} />
                          <div className="h-full bg-red-500/70" style={{ width: `${100 - ratingMetrics.percentage}%` }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-1 pt-2 border-t border-white/5">
                    <span className="text-[9px] text-zinc-600 flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[8px] font-mono text-zinc-500">N</kbd> Next
                      <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[8px] font-mono text-zinc-500">Esc</kbd> Close
                    </span>
                    <a href={`https://www.youtube.com/watch?v=${activeVideoId}`} target="_blank" rel="noreferrer"
                      className="text-[10px] text-brand-primary font-bold flex items-center gap-1 hover:underline">
                      YouTube <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ── Up Next Sidebar (desktop only) ── */}
            {ytVideos.length > 1 && (
              <div className="hidden lg:block w-[340px] shrink-0">
                <div className="sticky top-6 bg-[#0c0c0e] border border-white/[0.06] rounded-2xl p-4 shadow-xl">
                  <UpNextPanel
                    videos={ytVideos}
                    activeVideoId={activeVideoId}
                    bookmarks={bookmarks}
                    onSelect={handleSelectVideo}
                    onToggleBookmark={toggleBookmark}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>



      {/* ─── Continue Watching ─── */}
      {!activeVideoId && recentLectures.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="space-y-4 text-left">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Clock size={14} className="text-brand-primary" />
            <h4 className="text-[10px] sm:text-xs font-bold text-zinc-300 uppercase tracking-widest">Continue Watching</h4>
          </div>
          <div className="flex gap-5 overflow-x-auto no-scrollbar pb-3 snap-x snap-mandatory pt-1 px-1 -mx-1">
            {recentLectures.map((video, i) => (
              <motion.div key={video.id}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06, duration: 0.4 }}
                role="button" tabIndex={0} aria-label={`Resume ${video.title}`}
                onClick={() => handleSelectRecentVideo(video)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectRecentVideo(video); } }}
                className="group snap-start shrink-0 w-[200px] sm:w-[240px] flex flex-col cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50"
              >
                <div className="relative aspect-video bg-zinc-950 overflow-hidden rounded-xl group-hover:shadow-md">
                  <img src={video.thumbnail} alt={video.title} loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {video.duration && (
                    <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-bold text-white z-10">
                      {video.duration}
                    </span>
                  )}
                  {/* Netflix-style progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-zinc-800/80">
                    <div className="h-full bg-brand-primary rounded-r-full transition-all" style={{ width: `${video.progress}%` }} />
                  </div>
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                    <div className="w-10 h-10 rounded-full bg-brand-primary/90 backdrop-blur-sm flex items-center justify-center shadow-xl">
                      <Play size={14} className="text-white fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="pt-2 px-0.5 pb-1 space-y-1">
                  <h5 className="text-[10px] sm:text-[11px] font-semibold text-white leading-snug line-clamp-2">{video.title}</h5>
                  <p className="text-[8px] sm:text-[9px] text-zinc-600 truncate">{video.channel}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Loading ─── */}
      {loading && <LecturesSkeleton />}

      {/* ─── Error ─── */}
      {error && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-red-500/[0.02] border border-dashed border-red-500/20 rounded-2xl max-w-xl mx-auto p-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
          <div>
            <h4 className="text-xs font-bold text-zinc-200">Search Failed</h4>
            <p className="text-[10px] text-zinc-500 max-w-sm mt-1 leading-relaxed">{error}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => searchYouTube(searchText.trim() || selectedCourse, activeCategory)}
              className="px-5 py-2.5 bg-brand-primary text-white rounded-xl text-[10px] font-bold border-none cursor-pointer hover:bg-brand-primary/90 transition-all active:scale-95">
              Retry
            </button>
            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedCourse)}`} target="_blank" rel="noreferrer"
              className="px-5 py-2.5 bg-white/5 text-zinc-300 rounded-xl text-[10px] font-bold border border-white/10 flex items-center gap-1.5">
              YouTube <ExternalLink size={12} />
            </a>
          </div>
        </motion.div>
      )}

      {/* ─── Empty State ─── */}
      {!loading && !error && ytVideos.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-24 text-center space-y-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-brand-primary/5 flex items-center justify-center border border-brand-primary/10">
              <MonitorPlay size={32} className="text-brand-primary/60" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center">
              <Sparkles size={12} className="text-brand-primary" />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-200">Select a Course to Begin</h4>
            <p className="text-[11px] text-zinc-500 mt-1.5 max-w-md leading-relaxed">
              Choose a level and course from the filters above, or search for any topic to start browsing lectures.
            </p>
          </div>
        </motion.div>
      )}

      {/* ─── Results Display ─── */}
      {!loading && !error && ytVideos.length > 0 && (
        <>
          {isRawView ? (
            /* ── Feed Grid ── */
            <div className="space-y-6 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {ytVideos.map((video, i) => (
                  <VideoCard key={video.id} video={video} isActive={activeVideoId === video.id}
                    isBookmarked={bookmarks.has(video.id)} onSelect={handleSelectVideo}
                    onToggleBookmark={toggleBookmark} variant="feed" index={i}
                  />
                ))}
              </div>

              <div ref={feedEndRef} className="flex justify-center py-6">
                {loadingMoreFeed && (
                  <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-primary" /> Loading more...
                  </div>
                )}
                {!loadingMoreFeed && hasMoreFeed && ytVideos.length >= 10 && (
                  <button onClick={loadMoreForFeed}
                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-xl text-xs font-bold border border-white/10 cursor-pointer transition-all active:scale-95 flex items-center gap-2">
                    Load More <ChevronDown size={14} />
                  </button>
                )}
                {!hasMoreFeed && ytVideos.length > 0 && (
                  <p className="text-[10px] text-zinc-600 font-medium">End of results</p>
                )}
              </div>
            </div>
          ) : (
            /* ── Channel Shelves ── */
            <div className="space-y-10">
              {Object.entries(groupedVideos).map(([channelName, videosList]) => {
                const videos = videosList as YTVideo[];
                const firstVideo = videos[0];
                const totalDuration = videos.reduce((sum, v) => sum + parseDurationToSeconds(v.duration), 0);

                return (
                  <motion.div key={channelName}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    className="space-y-4 text-left"
                  >
                    {/* Channel Header */}
                    <div className="flex items-center gap-2.5 border-b border-white/5 pb-2.5">
                      {firstVideo?.channelLogo ? (
                        <img src={firstVideo.channelLogo} alt={channelName} loading="lazy"
                          className="w-6 h-6 rounded-full object-cover border border-white/10 shrink-0"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-brand-primary shrink-0" />
                      )}
                      <h4 className="text-[10px] sm:text-xs font-bold text-zinc-200 uppercase tracking-widest leading-none flex-1">
                        {channelName}
                      </h4>
                      <div className="flex items-center gap-3 text-[9px] text-zinc-600 font-medium shrink-0">
                        {totalDuration > 0 && (
                          <span className="flex items-center gap-1">
                            <Timer size={10} /> {formatStudyTime(totalDuration)}
                          </span>
                        )}
                        <span>{videos.length} videos</span>
                      </div>
                    </div>

                    {/* Horizontal Row */}
                    <div className="relative w-full overflow-hidden">
                      <div onScroll={(e) => handleHorizontalScroll(e, channelName)}
                        className="flex gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-1 px-1 -mx-1 snap-x snap-mandatory"
                      >
                        {videos.map((video, i) => (
                          <VideoCard key={video.id} video={video} isActive={activeVideoId === video.id}
                            isBookmarked={bookmarks.has(video.id)} onSelect={handleSelectVideo}
                            onToggleBookmark={toggleBookmark} variant="shelf" index={i}
                          />
                        ))}

                        {loadingChannels[channelName] && (
                          <div className="snap-start shrink-0 w-[120px] flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-brand-primary animate-spin" />
                          </div>
                        )}
                        {channelHasMore[channelName] !== false && !loadingChannels[channelName] && videos.length >= 3 && (
                          <button onClick={() => loadMoreForChannel(channelName)} aria-label={`More from ${channelName}`}
                            className="snap-start shrink-0 w-[100px] flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-brand-primary transition-colors cursor-pointer bg-transparent border-none">
                            <div className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                              <ChevronRight size={18} />
                            </div>
                            <span className="text-[9px] font-bold">More</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
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
