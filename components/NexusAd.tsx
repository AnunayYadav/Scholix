
import React, { useEffect, useState, useRef } from 'react';

interface NexusAdProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  layout?: 'in-article' | 'display' | 'fluid';
  responsive?: 'true' | 'false';
  className?: string;
  style?: React.CSSProperties;
  hideLabel?: boolean;
}

const NexusAd: React.FC<NexusAdProps> = ({ 
  slot, 
  format = 'auto', 
  layout,
  responsive = 'true', 
  className = '',
  style = {},
  hideLabel = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense failed to load:', e);
    }

    // Monitor the ad element for content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (adRef.current && (adRef.current.innerHTML.includes('iframe') || adRef.current.getAttribute('data-ad-status') === 'filled')) {
          setIsLoaded(true);
          observer.disconnect();
        }
      });
    });

    if (adRef.current) {
      observer.observe(adRef.current, { 
        attributes: true, 
        childList: true, 
        subtree: true 
      });
      
      // Fallback: check after 3 seconds if it filled but didn't trigger observer correctly
      const timer = setTimeout(() => {
        if (adRef.current && (adRef.current.offsetHeight > 0 || adRef.current.innerHTML.includes('iframe'))) {
          setIsLoaded(true);
        }
      }, 3000);

      return () => {
        observer.disconnect();
        clearTimeout(timer);
      };
    }
  }, []);

  return (
    <div 
      className={`nexus-ad-container my-6 w-full flex flex-col items-center transition-all duration-700 ${className} ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none h-0 overflow-hidden my-0'}`}
    >
      {!hideLabel && (
        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-2">
          Sponsored
        </span>
      )}
      <div 
        className="w-full overflow-hidden flex justify-center bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border border-zinc-200 dark:border-white/5" 
        style={style}
      >
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', textAlign: 'center' }}
          data-ad-client="ca-pub-9873621266746230"
          data-ad-slot={slot}
          data-ad-format={format}
          data-ad-layout={layout}
          data-full-width-responsive={responsive}
        />
      </div>
    </div>
  );
};

export default React.memo(NexusAd);
