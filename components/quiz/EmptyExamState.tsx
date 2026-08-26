import React from 'react';
import { motion } from 'framer-motion';

interface EmptyExamStateProps {
  courseName?: string;
  category?: string;
  year?: string;
  onResetFilters?: () => void;
  onCreateCustomTest: () => void;
}

export const EmptyExamState: React.FC<EmptyExamStateProps> = ({
  courseName,
  category = 'all',
  year = 'all',
  onResetFilters,
  onCreateCustomTest,
}) => {
  const isFiltered = category !== 'all' || year !== 'all';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="py-14 px-6 flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto"
    >
      {/* ─── Animated Vector Art: Scanning Document / Nothing Found ─── */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Pulsing Radar / Search Waves */}
        <motion.div
          animate={{
            scale: [1, 1.4, 1.8],
            opacity: [0.35, 0.15, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          className="absolute w-28 h-28 rounded-full bg-orange-500/20 pointer-events-none"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1.6],
            opacity: [0.25, 0.1, 0],
          }}
          transition={{
            duration: 3,
            delay: 1,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          className="absolute w-28 h-28 rounded-full bg-orange-500/15 pointer-events-none"
        />

        {/* Floating Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* SVG Document & Scanner Illustration */}
        <svg
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-36 h-36 relative z-10 drop-shadow-2xl"
        >
          {/* Document Base */}
          <motion.g
            animate={{
              y: [0, -4, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Document Shadow */}
            <rect x="38" y="28" width="84" height="108" rx="14" fill="#000000" fillOpacity="0.25" />

            {/* Document Body */}
            <rect
              x="36"
              y="24"
              width="84"
              height="108"
              rx="14"
              className="fill-zinc-100 dark:fill-[#1a1a1e] stroke-zinc-200 dark:stroke-white/10"
              strokeWidth="2"
            />

            {/* Folded Corner */}
            <path
              d="M96 24L120 48H104C99.5817 48 96 44.4183 96 40V24Z"
              className="fill-zinc-200 dark:fill-[#24242a] stroke-zinc-300 dark:stroke-white/10"
              strokeWidth="2"
            />

            {/* Document Header Line */}
            <rect x="48" y="40" width="36" height="5" rx="2.5" className="fill-orange-500/80" />

            {/* Document Skeleton Lines */}
            <rect x="48" y="54" width="60" height="4" rx="2" className="fill-zinc-300 dark:fill-white/15" />
            <rect x="48" y="65" width="48" height="4" rx="2" className="fill-zinc-300 dark:fill-white/15" />
            <rect x="48" y="76" width="56" height="4" rx="2" className="fill-zinc-300 dark:fill-white/15" />
            <rect x="48" y="87" width="40" height="4" rx="2" className="fill-zinc-300 dark:fill-white/15" />
            <rect x="48" y="98" width="52" height="4" rx="2" className="fill-zinc-300 dark:fill-white/15" />
            <rect x="48" y="109" width="32" height="4" rx="2" className="fill-zinc-300 dark:fill-white/15" />
          </motion.g>

          {/* Floating Orbiting Magnifying Glass */}
          <motion.g
            animate={{
              x: [0, 8, 4, -4, 0],
              y: [0, -6, 2, -4, 0],
              rotate: [0, 5, -3, 2, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Glass Rim */}
            <circle
              cx="92"
              cy="80"
              r="22"
              className="fill-orange-500/10 dark:fill-orange-500/20 stroke-orange-500"
              strokeWidth="4"
            />

            {/* Lens Reflection Highlight */}
            <path
              d="M78 72C80 66 86 62 92 62"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="opacity-70"
            />

            {/* Sparkle inside Lens */}
            <motion.path
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              d="M92 76L93.5 80L97.5 81.5L93.5 83L92 87L90.5 83L86.5 81.5L90.5 80L92 76Z"
              fill="#fb923c"
            />

            {/* Glass Handle */}
            <path
              d="M108 96L126 114"
              className="stroke-orange-600"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M112 100L124 112"
              stroke="#fdba74"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </motion.g>

          {/* Floating Sparkles & Question Badge */}
          <motion.g
            animate={{
              y: [0, -5, 0],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <circle cx="34" cy="46" r="3" fill="#f97316" />
            <circle cx="132" cy="68" r="2.5" fill="#fb923c" />
            <circle cx="30" cy="98" r="2" fill="#fdba74" />
          </motion.g>
        </svg>
      </div>

      {/* ─── Typography Description ─── */}
      <div className="space-y-1.5">
        <h3 className="text-base md:text-lg font-black text-zinc-900 dark:text-white tracking-tight">
          No Question Papers Found
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium max-w-sm leading-relaxed">
          {courseName ? (
            <>
              No authentic question papers have been cataloged for <span className="font-bold text-orange-500">{courseName}</span> under current filters.
            </>
          ) : (
            'No question papers match the selected course or filter criteria.'
          )}
        </p>
      </div>

      {/* ─── Actions: Reset Filters & Custom Creator ─── */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
        {isFiltered && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        )}
        <button
          type="button"
          onClick={onCreateCustomTest}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>Create Custom Test</span>
        </button>
      </div>
    </motion.div>
  );
};

export default EmptyExamState;
