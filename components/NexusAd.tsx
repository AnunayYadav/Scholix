
import React, { useEffect } from 'react';

interface NexusAdProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: 'true' | 'false';
  className?: string;
  style?: React.CSSProperties;
  hideLabel?: boolean;
}

const NexusAd: React.FC<NexusAdProps> = ({ 
  slot, 
  format = 'auto', 
  responsive = 'true', 
  className = '',
  style = {},
  hideLabel = false
}) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense failed to load:', e);
    }
  }, []);

  return (
    <div className={`nexus-ad-container my-6 w-full flex flex-col items-center ${className}`}>
      {!hideLabel && (
        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-2">
          Sponsored
        </span>
      )}
      <div className="w-full overflow-hidden flex justify-center bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border border-zinc-200 dark:border-white/5 min-h-[100px]" style={style}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client="ca-pub-9873621266746230"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive}
        />
      </div>
    </div>
  );
};

export default React.memo(NexusAd);
