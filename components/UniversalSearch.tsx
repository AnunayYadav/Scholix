
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import NexusServer from '../services/nexusServer.ts';
import { ModuleType, LibraryFile, Folder } from '../types.ts';

interface SearchResult {
  id: string;
  type: 'module' | 'file' | 'folder' | 'marketplace' | 'navigation' | 'roommate';
  title: string;
  description?: string;
  path: string;
  icon: React.ReactNode;
  category: string;
}

const UniversalSearch: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  const modules = [
    { id: 'library', name: 'Content Library', desc: 'Access 1000+ PYQs, notes and records.', path: '/library', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg> },
    { id: 'quiz', name: 'Quiz Taker', desc: 'Generate custom tests from your subjects.', path: '/quiz', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg> },
    { id: 'timetable', name: 'Timetable Hub', desc: 'Sync and manage your weekly schedule.', path: '/timetable', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
    { id: 'cgpa', name: 'CGPA Calc', desc: 'Calculate and forecast your performance.', path: '/cgpa', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /></svg> },
    { id: 'attendance', name: 'Attendance', desc: 'Track your attendance and safe-bunks.', path: '/attendance', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> },
    { id: 'placement', name: 'Placement Prefect', desc: 'Analyze resumes and prep for jobs.', path: '/placement', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg> },
    { id: 'campus', name: 'Campus Navigator', desc: 'Find blocks and rooms with ease.', path: '/campus', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /></svg> },
    { id: 'marketplace', name: 'LPU Market', desc: 'Buy/Sell used books and items.', path: '/marketplace', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/></svg> },
    { id: 'roommate', name: 'Roommate Finder', desc: 'Find your perfect LPU flatmate.', path: '/roommate', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg> },
    { id: 'emergency', name: 'Rescue Line', desc: 'Emergency LPU official contacts.', path: '/emergency', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6" /></svg> },
    { id: 'ai-tools', name: 'AI Directory', desc: 'Curated AI tools for students.', path: '/ai-tools', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><circle cx="12" cy="12" r="3"/></svg> },
  ];

  const navigations = [
    { title: 'Mess Menu', keywords: ['food', 'mess', 'dining', 'breakfast', 'lunch', 'dinner'], path: '/campus/mess', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg> },
    { title: 'Academic Calendar', keywords: ['holidays', 'exams', 'events', 'dates'], path: '/campus/academic', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
    { title: 'Gate Pass', keywords: ['leave', 'out', 'pass', 'ums'], path: '/help', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="m21 21-4.3-4.3" /><circle cx="11" cy="11" r="8" /></svg> },
  ];

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setQuery('');
      setResults([]);
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) handleClose();
        else onClose(); // This will trigger the parent to open it
      }
      if (!isOpen) return;

      if (e.key === 'Escape') handleClose();
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
  }, [isOpen, results, selectedIndex, handleClose]);

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

    try {
      // 3. Search Library Files & Folders
      const [files, folders] = await Promise.all([
        NexusServer.fetchFiles('All', q),
        NexusServer.fetchFolders('All')
      ]);

      folders.forEach(f => {
        if (f.name.toLowerCase().includes(searchLower)) {
          newResults.push({
            id: `folder-${f.id}`,
            type: 'folder',
            title: f.name,
            description: `${f.type.charAt(0).toUpperCase() + f.type.slice(1)} folder in ${f.program}`,
            path: `/library/${encodeURIComponent(f.program)}/${f.type === 'semester' ? encodeURIComponent(f.name) : ''}`,
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-orange-500"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>,
            category: 'Library Folders'
          });
        }
      });

      files.forEach(f => {
        newResults.push({
          id: `file-${f.id}`,
          type: 'file',
          title: f.name,
          description: `${f.subject} • ${f.semester} • ${f.size}`,
          path: `/library/${encodeURIComponent(f.program)}/${encodeURIComponent(f.semester)}/${encodeURIComponent(f.subject)}`,
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-slate-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
          category: 'Library Files'
        });
      });

      // 4. Search Marketplace
      const marketplaceItems = await NexusServer.fetchMarketplaceItems();
      marketplaceItems.forEach(item => {
        if (item.title.toLowerCase().includes(searchLower) || item.description?.toLowerCase().includes(searchLower)) {
          newResults.push({
            id: `market-${item.id}`,
            type: 'marketplace',
            title: item.title,
            description: `₹${item.price} • ${item.category}`,
            path: `/marketplace/item/${item.id}`,
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-green-500"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
            category: 'Marketplace'
          });
        }
      });

      // 5. Search Roommate Requests
      const roommateRequests = await NexusServer.fetchRoommateRequests();
      roommateRequests.forEach(req => {
        if (req.description?.toLowerCase().includes(searchLower) || req.preferences?.toLowerCase().includes(searchLower)) {
          newResults.push({
            id: `roommate-${req.id}`,
            type: 'roommate',
            title: `${req.user_username}'s Request`,
            description: req.description,
            path: '/roommate',
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-blue-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>,
            category: 'Roommates'
          });
        }
      });

    } catch (e) {
      console.error("Global search error:", e);
    }

    setResults(newResults.slice(0, 10)); // Limit to 10 results
    setIsLoading(false);
    setSelectedIndex(0);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    handleClose();
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div 
      className={`modal-overlay !p-0 sm:!p-4 ${isClosing ? 'closing' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className={`nexus-modal w-full max-w-2xl !rounded-none sm:!rounded-[32px] !border-none sm:!border shadow-2xl overflow-hidden transition-all duration-300 transform ${isClosing ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>
        <div className="flex items-center px-6 py-4 border-b border-slate-100 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-md">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5 text-orange-600 mr-4 shrink-0"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search files, folders, market, navigation..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-lg font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20"
          />
          <div className="flex items-center gap-2 ml-4">
            <span className="hidden sm:inline-block px-2 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-400 dark:text-white/40 border border-slate-200 dark:border-white/10">ESC</span>
            <button onClick={handleClose} className="p-2 text-slate-400 hover:text-orange-600 transition-colors border-none bg-transparent">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 sm:p-4 no-scrollbar">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center opacity-40 space-y-4">
              <div className="w-8 h-8 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
              <p className="text-xs font-bold uppercase tracking-widest">Scanning Nexus...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {/* Grouped results view would be better, but for now flat is fine */}
              <div className="grid grid-cols-1 gap-1">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left p-3 sm:p-4 rounded-2xl flex items-center gap-4 transition-all border-none group ${selectedIndex === index ? 'bg-orange-600 shadow-lg shadow-orange-600/20 scale-[1.01]' : 'bg-transparent hover:bg-slate-50 dark:hover:bg-white/5'}`}
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${selectedIndex === index ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40'}`}>
                      {result.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-sm sm:text-base font-bold truncate ${selectedIndex === index ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{result.title}</h4>
                        <span className={`text-[9px] font-black uppercase tracking-widest shrink-0 ${selectedIndex === index ? 'text-white/60' : 'text-slate-400 dark:text-white/20'}`}>{result.category}</span>
                      </div>
                      <p className={`text-[10px] sm:text-xs truncate ${selectedIndex === index ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>{result.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : query ? (
            <div className="py-20 text-center opacity-40 space-y-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12 mx-auto mb-4 opacity-20"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              <p className="text-sm font-bold">No results found for "{query}"</p>
              <p className="text-xs">Try searching for subjects, files, or marketplace items.</p>
            </div>
          ) : (
            <div className="py-8 space-y-6">
              <div className="px-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/20 mb-4">Quick Shortcuts</h3>
                <div className="flex flex-wrap gap-2">
                  {['Library', 'Quizzes', 'Timetable', 'Market', 'Attendance', 'Mess Menu'].map(s => (
                    <button 
                      key={s} 
                      onClick={() => setQuery(s)}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-bold text-slate-600 dark:text-white/60 hover:border-orange-500/50 hover:text-orange-600 transition-all active:scale-95"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="px-4 py-8 bg-orange-600/5 dark:bg-orange-600/10 rounded-3xl border border-orange-600/10">
                <p className="text-xs font-bold text-orange-600 mb-1 tracking-tight">Pro Tip</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Use <span className="text-slate-900 dark:text-white font-bold">Ctrl + K</span> to open this search from anywhere in the platform.</p>
              </div>
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center justify-between px-6 py-3 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-black/40">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded-md bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5"><path d="M12 5v14M5 12l7-7 7 7"/></svg>
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5"><path d="M12 19V5M5 12l7 7 7-7"/></svg>
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest">Navigate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-1 rounded-md bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[9px] font-black text-slate-400">ENTER</span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest">Select</span>
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest">LPU Nexus Neural Search</p>
        </div>
      </div>
    </div>
  );
};

export default UniversalSearch;
