import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import NexusServer from '../services/nexusServer.ts';
import { allDirectory } from '../data/emergencyData.ts';
import { slugify } from '../utils/slugify.ts';
import { useUniversity } from '../hooks/useUniversity.tsx';
import { FileIcon } from './FileIcon.tsx';

interface SearchResult {
  id: string;
  type: 'module' | 'file' | 'folder' | 'marketplace' | 'navigation' | 'roommate' | 'ai-tool' | 'ai-category' | 'contact' | 'contact-category';
  title: string;
  description?: string;
  path: string;
  icon: React.ReactNode;
  category: string;
}

interface UniversalSearchProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  isInline?: boolean;
  resultsPortalRef?: React.RefObject<HTMLDivElement>;
}

const UniversalSearch: React.FC<UniversalSearchProps> = ({ 
  className = '', 
  placeholder = 'Search Scholix...', 
  autoFocus = false, 
  isInline = false,
  resultsPortalRef
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { shortBrandName, brandPrimary } = useUniversity();

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      setIsOpen(true);
    }
  }, [autoFocus]);

  const modules = [
    { id: 'library', name: 'Content Library', desc: 'Access 1000+ PYQs, notes and records.', path: '/library', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg> },
    { id: 'quiz', name: 'Quiz Taker', desc: 'Generate custom tests from your subjects.', path: '/quiz', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg> },
    { id: 'timetable', name: 'Timetable Hub', desc: 'Sync and manage your weekly schedule.', path: '/timetable', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
    { id: 'cgpa', name: 'CGPA Calc', desc: 'Calculate and forecast your performance.', path: '/cgpa', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /></svg> },
    { id: 'attendance', name: 'Attendance', desc: 'Track your attendance and safe-bunks.', path: '/attendance', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> },
    { id: 'placement', name: 'Placement Prefect', desc: 'Analyze resumes and prep for jobs.', path: '/placement', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg> },
    { id: 'campus', name: 'Campus Hub', desc: 'Find blocks and rooms with ease.', path: '/campus', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /></svg> },
    { id: 'marketplace', name: `${shortBrandName} Market`, desc: 'Buy/Sell used books and items.', path: '/market', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/></svg> },
    { id: 'roommate', name: 'Roommate Finder', desc: `Find your perfect ${shortBrandName} flatmate.`, path: '/roommate', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg> },
    { id: 'emergency', name: 'Rescue Line', desc: `Emergency ${shortBrandName} official contacts.`, path: '/emergency', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6" /></svg> },

  ];

  const navigations = [
    { title: 'Mess Menu', keywords: ['food', 'mess', 'dining', 'breakfast', 'lunch', 'dinner'], path: '/campus/mess', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg> },
    { title: 'Academic Calendar', keywords: ['holidays', 'exams', 'events', 'dates'], path: '/campus/academic', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
    { title: 'Gate Pass', keywords: ['leave', 'out', 'pass', 'ums'], path: '/help', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="m21 21-4.3-4.3" /><circle cx="11" cy="11" r="8" /></svg> },
  ];

  const handleSelect = useCallback((result: SearchResult) => {
    navigate(result.path);
    if (!isInline) {
      setIsOpen(false);
      setQuery('');
      inputRef.current?.blur();
    }
  }, [navigate, isInline]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }

      if (!isOpen) return;

      if (e.key === 'Escape' && !isInline) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (results.length || 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + (results.length || 1)) % (results.length || 1));
      }
      if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, handleSelect, isInline]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!isInline && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isInline]);

  const performSearch = async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const searchLower = q.toLowerCase();
    const newResults: SearchResult[] = [];

    // 1. Search Modules
    modules.forEach(m => {
      if (m.name.toLowerCase().includes(searchLower) || m.desc.toLowerCase().includes(searchLower)) {
        newResults.push({
          id: m.id,
          type: 'module',
          title: m.name,
          description: m.desc,
          path: m.path,
          icon: m.icon,
          category: 'Apps'
        });
      }
    });

    // 2. Search Navigation / Keywords
    navigations.forEach(n => {
      if (n.title.toLowerCase().includes(searchLower) || n.keywords.some(k => k.includes(searchLower))) {
        newResults.push({
          id: `nav-${n.title}`,
          type: 'navigation',
          title: n.title,
          description: `Quick access to ${n.title}`,
          path: n.path,
          icon: n.icon,
          category: 'Navigation'
        });
      }
    });



    // 5. Search Rescue Line Contacts
    allDirectory.forEach(contact => {
      if (contact.title.toLowerCase().includes(searchLower) || 
          contact.subTitle?.toLowerCase().includes(searchLower) ||
          contact.numbers.some(n => n.includes(searchLower))) {
        newResults.push({
          id: `contact-${contact.id}`,
          type: 'contact',
          title: contact.title,
          description: `${contact.subTitle || ''} • ${contact.numbers[0] || 'Internal'}`,
          path: `/emergency?q=${encodeURIComponent(contact.title)}`,
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-red-500"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
          category: 'Rescue Line'
        });
      }
    });

    // 6. Search Rescue Line Categories
    const matchedRescueCats = new Set<string>();
    allDirectory.forEach(c => {
      if (c.category.toLowerCase().includes(searchLower)) matchedRescueCats.add(c.category);
    });
    matchedRescueCats.forEach(cat => {
      newResults.push({
        id: `rescue-cat-${cat}`,
        type: 'contact-category',
        title: cat,
        description: `Rescue contacts for ${cat}`,
        path: `/emergency?q=${encodeURIComponent(cat)}`,
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-red-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
        category: 'Rescue Categories'
      });
    });

    try {
      const trimmedQuery = q.trim();
      const codeMatch = trimmedQuery.match(/\b([a-zA-Z]{2,5})\s*[-_]?\s*(\d{2,4}[a-zA-Z]?)\b/i);
      const normalizedCode = codeMatch ? (codeMatch[1] + codeMatch[2]).toLowerCase() : null;

      const [files, folders] = await Promise.all([
        NexusServer.fetchFiles('All', q),
        NexusServer.fetchFolders('All')
      ]);

      folders.forEach(f => {
        const folderNameLower = f.name.toLowerCase();
        const matchesQuery = folderNameLower.includes(searchLower);
        const matchesCode = normalizedCode ? folderNameLower.includes(normalizedCode) : false;

        if (matchesQuery || matchesCode) {
          newResults.push({
            id: `folder-${f.id}`,
            type: 'folder',
            title: f.name,
            description: `${f.type.charAt(0).toUpperCase() + f.type.slice(1)} • ${f.program}`,
            path: `/library/${slugify(f.program)}`,
            icon: (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5 text-brand-primary">
                <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
              </svg>
            ),
            category: f.type === 'subject' ? 'Subject' : 'Folder'
          });
        }
      });

      files.slice(0, 8).forEach(f => {
        newResults.push({
          id: `file-${f.id}`,
          type: 'file',
          title: f.name,
          description: `${f.subject} • ${f.size}`,
          path: `/library/${slugify(f.program)}/${slugify(f.semester)}/${slugify(f.subject)}`,
          icon: <FileIcon fileName={f.storage_path} size="w-4 h-5" />,
          category: 'File'
        });
      });

      const marketplaceItems = await NexusServer.fetchMarketplaceItems();
      marketplaceItems.slice(0, 4).forEach(item => {
        if (item.title.toLowerCase().includes(searchLower) || item.description?.toLowerCase().includes(searchLower)) {
          newResults.push({
            id: `market-${item.id}`,
            type: 'marketplace',
            title: item.title,
            description: `₹${item.price} • ${item.category}`,
            path: `/market/item/${item.id}`,
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-green-500"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
            category: 'Marketplace'
          });
        }
      });

      const roommateRequests = await NexusServer.fetchRoommateRequests();
      roommateRequests.slice(0, 4).forEach(req => {
        if (req.description?.toLowerCase().includes(searchLower) || req.preferences?.toLowerCase().includes(searchLower)) {
          newResults.push({
            id: `roommate-${req.id}`,
            type: 'roommate',
            title: `${req.user_username}'s Request`,
            description: req.description,
            path: '/roommate',
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-blue-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>,
            category: 'Roommates'
          });
        }
      });

    } catch (e) {
      console.error("Global search error:", e);
    }

    setResults(newResults.slice(0, 12));
    setIsLoading(false);
    setSelectedIndex(0);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const renderResults = () => {
    if (!isOpen) return null;

    const resultsDropdown = (
      <div className={`${isInline || resultsPortalRef ? 'relative mt-3' : 'absolute top-full left-0 right-0 mt-2 z-[100]'} bg-white dark:bg-[#17171a] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl search-dropdown-anim`}>
        <div className={`no-scrollbar p-1.5 ${(isInline || resultsPortalRef) ? 'max-h-none' : 'max-h-[70vh] overflow-y-auto'}`}>
          {isLoading ? (
            <div className="py-10 flex flex-col items-center justify-center opacity-40">
              <div className="w-5 h-5 rounded-full border-2 border-brand-primary border-t-transparent animate-spin mb-3"></div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em]">Searching Scholix...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 gap-0.5">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left px-3 py-2 sm:py-2.5 rounded-xl flex items-center gap-3 transition-colors border-none group cursor-pointer relative ${
                    selectedIndex === index 
                      ? 'bg-zinc-100 dark:bg-[#202025]' 
                      : 'bg-transparent hover:bg-zinc-50 dark:hover:bg-[#1a1a1d]'
                  }`}
                >
                  {/* Subtle brand left indicator when selected */}
                  <div className={`w-0.5 h-4 rounded-full bg-brand-primary shrink-0 transition-opacity ${
                    selectedIndex === index ? 'opacity-100' : 'opacity-0'
                  }`} />

                  {/* Icon */}
                  <div className="w-6 h-6 flex items-center justify-center shrink-0 text-zinc-500 dark:text-zinc-400">
                    {result.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-[13px] sm:text-[13.5px] font-medium tracking-tight truncate transition-colors ${
                        selectedIndex === index ? 'text-zinc-950 dark:text-white' : 'text-zinc-800 dark:text-zinc-200'
                      }`}>
                        {result.title}
                      </h4>
                      <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider shrink-0">
                        {result.category}
                      </span>
                    </div>
                    {result.description && (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 font-normal truncate mt-0.5">
                        {result.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="py-10 text-center opacity-40">
              <p className="text-xs font-medium">No results for "{query}"</p>
            </div>
          ) : (
            <div className="p-3 space-y-3">
              <div className="space-y-2">
                <h3 className="text-[9px] font-medium uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Trending Now</h3>
                <div className="flex flex-wrap gap-1.5">
                  {['Library', 'Quizzes', 'Timetable', 'Market', 'Attendance'].map(s => (
                    <button 
                      key={s} 
                      onClick={() => setQuery(s)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-[#202025] border border-zinc-200/80 dark:border-zinc-800/80 text-[11px] font-normal text-zinc-600 dark:text-zinc-400 hover:border-brand-primary/50 hover:text-brand-primary transition-all cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {!(isInline || resultsPortalRef) && (
          <div className="px-4 py-2 bg-zinc-50/80 dark:bg-[#121215] border-t border-zinc-200/70 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-[#202025] text-[9.5px] font-sans font-medium text-zinc-600 dark:text-zinc-400">↵</kbd> select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-[#202025] text-[9.5px] font-sans font-medium text-zinc-600 dark:text-zinc-400">↑↓</kbd> navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-[#202025] text-[9.5px] font-sans font-medium text-zinc-600 dark:text-zinc-400">esc</kbd> close
              </span>
            </div>
            {results.length > 0 && (
              <span className="text-[10.5px] font-medium text-zinc-400 dark:text-zinc-500">{results.length} results</span>
            )}
          </div>
        )}
      </div>
    );

    if (resultsPortalRef?.current) {
      return createPortal(resultsDropdown, resultsPortalRef.current);
    }

    return resultsDropdown;
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Bar Input */}
      <div className={`relative group transition-all duration-300 ${isOpen && !isInline && !resultsPortalRef ? 'z-[60]' : 'z-40'}`}>
        <div className={`flex items-center gap-3 px-5 h-10 rounded-xl sm:rounded-2xl bg-white dark:bg-[#17171a] border border-zinc-200/80 dark:border-zinc-800/80 transition-all ${isOpen && !isInline && !resultsPortalRef ? 'border-brand-primary/60 dark:border-brand-primary/50' : 'hover:border-zinc-300 dark:hover:border-zinc-700'}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`w-4 h-4 transition-colors ${isOpen ? 'text-brand-primary' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="flex-1 bg-transparent border-none outline-none text-sm font-normal text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
          />
          {!isOpen && (
            <div className="flex items-center gap-1 opacity-20 group-hover:opacity-40 transition-all">
              <span className="px-1 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[9px] font-medium tracking-tighter">CTRL</span>
              <span className="px-1 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[9px] font-medium tracking-tighter">K</span>
            </div>
          )}
          {query && (
            <button 
              onClick={() => { setQuery(''); setResults([]); }}
              className="p-1 hover:text-brand-primary transition-colors border-none bg-transparent"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          )}
        </div>

        {renderResults()}
      </div>
    </div>
  );
};

export default UniversalSearch;
