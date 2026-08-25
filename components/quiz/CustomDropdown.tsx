import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DropdownOption {
  value: string;
  label: string;
  subLabel?: string;
}

interface CustomDropdownProps {
  label?: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select option...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className={`space-y-1 relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block">
          {label}
        </label>
      )}

      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-white/[0.04] hover:bg-zinc-200/70 dark:hover:bg-white/[0.07] text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
          isOpen ? 'ring-1 ring-orange-500/60 shadow-sm' : ''
        }`}
      >
        <span className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.15 }}
          className="text-zinc-400 flex-shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </motion.div>
      </button>

      {/* Floating Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 top-full mt-1.5 z-50 p-1.5 rounded-2xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 shadow-2xl max-h-60 overflow-y-auto no-scrollbar"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-orange-500 text-white font-bold shadow-sm shadow-orange-500/20'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="truncate">
                    <span className="block truncate">{opt.label}</span>
                    {opt.subLabel && (
                      <span className={`block text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-zinc-400'}`}>
                        {opt.subLabel}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5 flex-shrink-0 text-white">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDropdown;
