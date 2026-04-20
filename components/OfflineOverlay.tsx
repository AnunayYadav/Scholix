import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const OfflineOverlay: React.FC<{ isOffline: boolean }> = ({ isOffline }) => {
  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-2xl"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/4 -left-1/4 w-full h-full bg-brand-primary/20 rounded-full blur-[120px]"
            />
            <motion.div 
              animate={{ 
                scale: [1.2, 1, 1.2],
                rotate: [0, -90, 0],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-brand-secondary/20 rounded-full blur-[120px]"
            />
          </div>

          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-w-sm w-full mx-4 p-10 bg-white/40 dark:bg-zinc-900/40 border border-white/20 dark:border-white/5 rounded-[40px] shadow-2xl backdrop-blur-md text-center"
          >
            {/* Animated Icon */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-brand-primary/20 rounded-full blur-xl"
              />
              <div className="relative w-full h-full bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-3xl flex items-center justify-center shadow-lg transform rotate-12">
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="w-10 h-10 -rotate-12"
                >
                  <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-4 tracking-tight">
              Connection Lost
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-10 font-medium leading-relaxed">
              We've lost touch with the campus servers. <br /> Check your connection and try again.
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all shadow-xl shadow-zinc-900/20 dark:shadow-white/5 active:brightness-90"
            >
              Retry Connection
            </motion.button>
            
            <p className="mt-6 text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
              LPU Nexus • Offline Mode
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineOverlay;
