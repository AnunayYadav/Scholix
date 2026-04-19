
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
    const observer = new MutationObserver(() => {
      if (!adRef.current) return;
      
      const status = adRef.current.getAttribute('data-ad-status');
      const adsStatus = adRef.current.getAttribute('data-adsbygoogle-status');
      const hasIframe = adRef.current.querySelector('iframe');
      
      // If the ad is filled or has an iframe, show it
      if (status === 'filled' || hasIframe) {
        setIsLoaded(true);
        observer.disconnect();
      } 
      // If the ad is explicitly unfilled, ensure it stays hidden
      else if (status === 'unfilled') {
        setIsLoaded(false);
      }
    });

    if (adRef.current) {
      observer.observe(adRef.current, { 
        attributes: true, 
        childList: true, 
        subtree: true 
      });
      
      // Fallback check: Sometimes status changes without triggering observer if already done
      const initialCheck = () => {
        if (!adRef.current) return;
        if (adRef.current.getAttribute('data-ad-status') === 'filled' || adRef.current.querySelector('iframe')) {
          setIsLoaded(true);
        }
      };
      
      initialCheck();

      // Longer fallback for slow mobile networks
      const timer = setTimeout(() => {
        if (adRef.current) {
          const status = adRef.current.getAttribute('data-ad-status');
          if (status === 'filled' || adRef.current.querySelector('iframe')) {
            setIsLoaded(true);
          }
        }
      }, 5000);

      return () => {
        observer.disconnect();
        clearTimeout(timer);
      };
    }
  }, []);

  return (
    <div 
      className={`nexus-ad-container w-full flex flex-col items-center transition-all duration-700 ${className} ${
        isLoaded 
          ? 'opacity-100 translate-y-0 my-6' 
          : 'opacity-0 -translate-y-4 pointer-events-none h-0 max-h-0 overflow-hidden my-0 invisible'
      }`}
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
