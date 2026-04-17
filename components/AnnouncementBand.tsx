import React, { useState, useEffect } from 'react';
import NexusServer from '../services/nexusServer';
import { Announcement } from '../types';

const AnnouncementBand: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const active = await NexusServer.fetchActiveAppAnnouncements();
        // Filter out those marked as "don't display again"
        const filtered = active.filter((a: Announcement) => 
          localStorage.getItem(`announcement_${a.id}_hidden`) !== 'true'
        );
        
        if (filtered.length > 0) {
          setAnnouncements(filtered);
          setIsVisible(true);
        }
      } catch (e) {
        console.error("Failed to fetch announcements:", e);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleDontShowAgain = (id: string) => {
    localStorage.setItem(`announcement_${id}_hidden`, 'true');
    const updated = announcements.filter(a => a.id !== id);
    if (updated.length === 0) {
      setIsVisible(false);
    } else {
      setAnnouncements(updated);
      setCurrentIndex(0);
    }
  };

  const handleClose = () => {
     setIsCollapsed(true);
  };

  if (!isVisible || announcements.length === 0) return null;

  const current = announcements[currentIndex];

  if (isCollapsed) {
    return (
      <div className="fixed top-20 right-4 z-[9999] animate-bounce">
        <button 
          onClick={() => setIsCollapsed(false)}
          className="w-10 h-10 rounded-full bg-brand-primary text-white shadow-lg flex items-center justify-center border-none cursor-pointer hover:scale-110 transition-transform"
          title="Show Announcement"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
        </button>
      </div>
    );
  }

  return (
    <div className="relative bg-[#FF9500] dark:bg-brand-primary overflow-hidden z-[9999] shrink-0 border-b border-black/5 shadow-md transition-all duration-500">
      <div className="relative max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between min-h-[40px] px-4 py-2 gap-3">
        
        <div className="flex items-center gap-3 flex-1">
          {current.image_url && (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden shrink-0 border border-white/20 shadow-sm">
              <img src={current.image_url} alt="Announcement" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex flex-col">
            <h4 className="text-[10px] sm:text-[12px] font-bold text-black dark:text-white uppercase tracking-wider leading-tight">
              {current.title || 'New Announcement'}
            </h4>
            <p className="text-[9px] sm:text-[11px] font-medium text-black/80 dark:text-white/80 line-clamp-1">
              {current.description || 'Check out what\'s new in Scholix!'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {current.link_url && (
            <a 
              href={current.link_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-black text-white dark:bg-white dark:text-brand-primary px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all no-underline"
            >
              Learn More
            </a>
          )}
          
          <button 
            onClick={() => handleDontShowAgain(current.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-black dark:text-white border-none transition-all active:scale-95 cursor-pointer"
            title="Don't show this again"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12" /></svg>
            <span className="text-[9px] font-bold uppercase hidden sm:inline">Don't show again</span>
          </button>

          <button 
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-black/10 text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white transition-all border-none bg-transparent active:scale-95 flex items-center justify-center cursor-pointer"
            aria-label="Collapse"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
      
      {announcements.length > 1 && (
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black/10">
           <div 
             className="h-full bg-black/30 transition-all duration-300" 
             style={{ width: `${((currentIndex + 1) / announcements.length) * 100}%` }} 
           />
        </div>
      )}
    </div>
  );
};

export default AnnouncementBand;
