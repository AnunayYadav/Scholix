import React, { useState, useEffect } from 'react';

const AnnouncementBand: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  // Use localStorage to remember if the user dismissed it
  useEffect(() => {
    const dismissed = localStorage.getItem('announcement_dismissed');
    if (dismissed === 'true') setIsVisible(false);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('announcement_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="relative bg-[#FF8A00] overflow-hidden z-[9999] shrink-0 border-b border-black/5 shadow-sm">
      <div className="relative max-w-7xl mx-auto px-4 py-2 flex items-center justify-center min-h-[38px]">
        <p className="text-[10px] sm:text-[12px] font-normal text-black tracking-[0.1em] text-center px-10 uppercase">
          LPU Nexus is now officially Scholix. Same tools, new identity.
        </p>

        <button 
          onClick={handleDismiss}
          className="absolute right-2 sm:right-4 p-1.5 rounded-full hover:bg-black/10 text-black/50 hover:text-black transition-all border-none bg-transparent active:scale-95 flex items-center justify-center"
          aria-label="Dismiss"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBand;
