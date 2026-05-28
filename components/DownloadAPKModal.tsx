import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import NexusServer from '../services/nexusServer';

interface DownloadAPKModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DownloadAPKModal: React.FC<DownloadAPKModalProps> = ({ isOpen, onClose }) => {
  const [downloadCount, setDownloadCount] = useState<number>(40);
  const [animatedCount, setAnimatedCount] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const fetchDownloads = async () => {
      try {
        if (NexusServer.isConfigured()) {
          const count = await NexusServer.getEventCount('apk_download');
          if (isMounted) {
            // Only update if we haven't manually incremented yet or if the server has a higher count
            setDownloadCount(prev => Math.max(prev, 40 + count));
          }
        }
      } catch (error) {
        console.error('Error fetching downloads:', error);
      }
    };
    fetchDownloads();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setAnimatedCount(0);
      hasAnimatedRef.current = false;
      return;
    }

    if (hasAnimatedRef.current) {
      setAnimatedCount(downloadCount);
      return;
    }

    const duration = 2500; // 2.5 seconds
    const startTime = performance.now();
    const target = downloadCount;

    let animationFrameId: number;

    const updateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function: easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentCount = Math.floor(easeProgress * target);

      setAnimatedCount(currentCount);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      } else {
        hasAnimatedRef.current = true;
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen, downloadCount]);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      // Optimistic update
      setDownloadCount(prev => prev + 1);
      
      await NexusServer.trackEvent('apk_download');
      
      const link = document.createElement('a');
      link.href = '/Scholix.apk';
      link.download = 'Scholix.apk';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        setIsDownloading(false);
      }, 2000);
    } catch (error) {
      console.error('Download error:', error);
      setIsDownloading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xl"
            style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[380px] bg-white dark:bg-[#0d0d0d] rounded-[32px] border border-zinc-200/50 dark:border-white/5 shadow-2xl overflow-hidden p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={onClose} 
              className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors border-none bg-transparent active:scale-90 cursor-pointer outline-none"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>

            {/* Header / Icon */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-6 border border-emerald-500/10 relative group">
                <div className="absolute inset-0 bg-emerald-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-10 h-10 text-emerald-500 relative z-10">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1v12z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
                {/* Android Icon Badge */}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-zinc-800 rounded-xl shadow-lg flex items-center justify-center border border-zinc-100 dark:border-white/10">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#3DDC84]">
                    <path d="M17.523 15.3414c-.5511 0-.9982-.4471-.9982-.9982v-.0036c0-.5511.4471-.9982.9982-.9982s.9982.4471.9982.9982v.0036c0 .5511-.4471.9982-.9982.9982zm-11.046 0c-.5511 0-.9982-.4471-.9982-.9982v-.0036c0-.5511.4471-.9982.9982-.9982s.9982.4471.9982.9982v.0036c0 .5511-.4471.9982-.9982.9982zm11.4045-5.5909l1.9973-3.4591c.1218-.2109.05-.4809-.1609-.6027-.2109-.1218-.4809-.05-.6027.1609l-2.0254 3.5082C15.5482 8.3291 13.8445 7.8282 12 7.8282s-3.5482.5009-5.09 1.5291L4.8845 5.8491c-.1218-.2109-.3918-.2827-.6027-.1609-.2109.1218-.2827.3918-.1609.6027l1.9973 3.4591C3.1255 11.6027 1.1591 14.5364 1.1591 17.9545h21.6818c0-3.4181-1.9664-6.3518-4.9545-8.204z" />
                  </svg>
                </div>
              </div>
              
              <h3 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight mb-2">Scholix for Android</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed max-w-[260px]">The ultimate companion for your academic journey at LPU.</p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-zinc-50/50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center">
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.1em] mb-1.5">Downloads</span>
                <span className="text-xl font-semibold text-zinc-900 dark:text-white tabular-nums">
                  {animatedCount.toLocaleString()}
                </span>
              </div>
              <div className="bg-zinc-50/50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center">
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.1em] mb-1.5">File Size</span>
                <span className="text-xl font-semibold text-zinc-900 dark:text-white">6.59 MB</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownload}
                disabled={isDownloading}
                className={`w-full h-14 bg-brand-primary text-white font-semibold rounded-2xl shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-3 transition-all hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {isDownloading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                )}
                <span>{isDownloading ? 'Preparing Download...' : 'Download Scholix.apk'}</span>
              </motion.button>
              
              <button
                onClick={onClose}
                className="w-full h-12 bg-transparent text-zinc-500 dark:text-zinc-400 font-medium text-sm rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
              >
                Maybe Later
              </button>
            </div>

            {/* Footer Tip */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium tracking-wide">
                Compatible with Android 8.0+
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.getElementById('modal-root') || document.body
  );
};

export default DownloadAPKModal;
