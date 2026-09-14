import React from 'react';
import { UploadCloud } from 'lucide-react';

interface EmptyStateNoDocumentProps {
  message?: string;
  onUpload?: () => void;
  className?: string;
}

export const EmptyStateNoDocument: React.FC<EmptyStateNoDocumentProps> = ({
  message = "Oops ! There's no document here.",
  onUpload,
  className = '',
}) => {
  return (
    <div className={`p-8 sm:p-12 text-center rounded-2xl flex flex-col items-center justify-center gap-4 animate-fade-in ${className}`}>
      {/* Document Graphic Illustration */}
      <div className="relative w-36 h-28 flex items-center justify-center select-none mb-1">
        {/* Background soft cloud/shadow streaks matching the image */}
        <div className="absolute w-20 h-3 bg-zinc-200/70 dark:bg-white/[0.06] rounded-full translate-x-7 -translate-y-6" />
        <div className="absolute w-24 h-3.5 bg-zinc-200/70 dark:bg-white/[0.06] rounded-full translate-x-8 -translate-y-1" />
        <div className="absolute w-28 h-3.5 bg-zinc-200/70 dark:bg-white/[0.06] rounded-full -translate-x-6 translate-y-4" />

        {/* Back paper sheet (slightly tilted to the left) */}
        <svg
          viewBox="0 0 54 68"
          className="absolute w-12 h-16 text-zinc-300 dark:text-zinc-600 drop-shadow-xs -rotate-8 -translate-x-3.5 translate-y-0.5"
          fill="none"
        >
          <rect
            x="1.5"
            y="1.5"
            width="51"
            height="65"
            rx="5"
            className="fill-white dark:fill-[#161618] stroke-zinc-400 dark:stroke-zinc-500"
            strokeWidth="2.5"
          />
        </svg>

        {/* Front paper sheet with folded corner and 5 text lines */}
        <svg
          viewBox="0 0 56 70"
          className="relative w-14 h-18 drop-shadow-sm translate-x-1"
          fill="none"
        >
          {/* Base sheet with dog-ear cut */}
          <path
            d="M5 2C3.34315 2 2 3.34315 2 5V65C2 66.6569 3.34315 68 5 68H51C52.6569 68 54 66.6569 54 65V16L40 2H5Z"
            className="fill-white dark:fill-[#1b1b1e] stroke-zinc-500 dark:stroke-zinc-400"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Fold flap */}
          <path
            d="M40 2V14C40 15.1046 40.8954 16 42 16H54"
            className="stroke-zinc-500 dark:stroke-zinc-400"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* 5 Text lines */}
          <line x1="12" y1="21" x2="28" y2="21" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="12" y1="29" x2="44" y2="29" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="12" y1="37" x2="44" y2="37" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="12" y1="45" x2="44" y2="45" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="12" y1="53" x2="34" y2="53" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Message */}
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 m-0">
        {message}
      </p>

      {/* Action Button */}
      {onUpload && (
        <button
          onClick={onUpload}
          className="h-10 px-6 rounded-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-semibold flex items-center gap-2.5 transition-all cursor-pointer border-none shadow-sm active:scale-95 mt-1"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload File</span>
        </button>
      )}
    </div>
  );
};

export default EmptyStateNoDocument;
