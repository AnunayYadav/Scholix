
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
  const [shouldLoad, setShouldLoad] = useState(false);
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if container is wide enough (AdSense fluid ads need at least 250px)
    const checkWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        if (width >= 250) {
          setShouldLoad(true);
        } else {
          setShouldLoad(false);
        }
      }
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;

    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense failed to load:', e);
    }

    const observer = new MutationObserver(() => {
      if (!adRef.current) return;
      
      const status = adRef.current.getAttribute('data-ad-status');
      const iframe = adRef.current.querySelector('iframe');
      
      // Strict check: 'filled' is the only guaranteed successful status
      if (status === 'filled') {
        setIsLoaded(true);
        observer.disconnect();
      } else if (iframe && iframe.offsetHeight > 100) { 
        // Increased threshold to 100px to ensure it's a real ad and not a tiny placeholder
        setIsLoaded(true);
        observer.disconnect();
      } else if (status === 'unfilled') {
        setIsLoaded(false);
        observer.disconnect();
      }
    });

    if (adRef.current) {
      observer.observe(adRef.current, { 
        attributes: true, 
        childList: true, 
        subtree: true 
      });
      
      // Initial check for cached ads or early loads
      const status = adRef.current.getAttribute('data-ad-status');
      const iframe = adRef.current.querySelector('iframe');
      if (status === 'filled' || (iframe && iframe.offsetHeight > 100)) {
        setIsLoaded(true);
      }

      // Cleanup
      return () => observer.disconnect();
    }
  }, [shouldLoad]);

  return (
    <div 
      ref={containerRef}
      className={`nexus-ad-container w-full flex flex-col items-center transition-all duration-700 ${className} ${
        isLoaded 
          ? 'opacity-100 translate-y-0 my-6' 
          : 'opacity-0 h-0 max-h-0 overflow-hidden my-0 invisible'
      }`}
    >
      {!hideLabel && isLoaded && (
        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-2">
          Sponsored
        </span>
      )}
      <div 
        className={`w-full overflow-hidden flex justify-center transition-all duration-500 max-w-full ${
          isLoaded 
            ? 'bg-zinc-50 dark:bg-zinc-900/10 rounded-2xl border border-zinc-200 dark:border-white/5 opacity-100' 
            : 'bg-transparent border-transparent opacity-0'
        }`}
        style={{ 
          ...style,
          maxHeight: '450px', // Cap the height to prevent "too big" ads
        }}
      >
        {shouldLoad && (
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ 
              display: 'block', 
              width: '100%', 
              textAlign: 'center',
              minHeight: isLoaded ? '100px' : '0' 
            }}
            data-ad-client="ca-pub-9873621266746230"
            data-ad-slot={slot}
            data-ad-format={format}
            data-ad-layout={layout}
            data-full-width-responsive={responsive}
          />
        )}
      </div>
    </div>
  );
};


export default React.memo(NexusAd);
