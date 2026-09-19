import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, X, Check } from 'lucide-react';

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
  searchPlaceholder?: string;
  searchable?: boolean;
  className?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  searchable = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autofocus search input on open
  useEffect(() => {
    if (isOpen && searchable) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen, searchable]);

  const selectedOption = options.find(o => o.value === value);

  // Filter options by search query
  const filteredOptions = options.filter(opt => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      opt.label.toLowerCase().includes(q) ||
      opt.value.toLowerCase().includes(q) ||
      (opt.subLabel && opt.subLabel.toLowerCase().includes(q))
    );
  });

  return (
    <div className={`space-y-1.5 relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 block px-0.5">
          {label}
        </label>
      )}

      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#17171a] hover:border-zinc-300 dark:hover:border-zinc-700 text-left transition-all flex items-center justify-between gap-2 cursor-pointer border ${
          isOpen
            ? 'border-brand-primary/50 ring-2 ring-brand-primary/10 shadow-sm'
            : 'border-zinc-200/80 dark:border-zinc-800/80'
        }`}
      >
        <span className="text-xs font-medium text-zinc-900 dark:text-white truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.15 }}
          className="text-zinc-400 flex-shrink-0"
        >
          <ChevronDown className="w-3.5 h-3.5" />
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
            className="absolute left-0 right-0 top-full mt-1.5 z-50 p-1.5 rounded-2xl bg-white dark:bg-[#17171a] border border-zinc-200/90 dark:border-zinc-800/80 shadow-lg overflow-hidden"
          >
            {/* Search Input Box */}
            {searchable && (
              <div className="p-1 pb-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 text-zinc-400 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-8 pr-7 py-1.5 bg-zinc-50 dark:bg-[#121215] border border-zinc-200/60 dark:border-zinc-800/80 rounded-lg text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 font-medium focus:outline-none focus:border-brand-primary/50"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Scrollable Options List */}
            <div className="max-h-56 overflow-y-auto custom-scrollbar pt-1 space-y-0.5">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-brand-primary/10 text-brand-primary font-semibold'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-[#202025]'
                      }`}
                    >
                      <div className="truncate">
                        <span className="block truncate">{opt.label}</span>
                        {opt.subLabel && (
                          <span className={`block text-[10px] truncate ${isSelected ? 'text-brand-primary/80' : 'text-zinc-400'}`}>
                            {opt.subLabel}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 flex-shrink-0 text-brand-primary" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="py-4 px-3 text-center text-xs text-zinc-400">
                  No options matching "{searchQuery}"
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDropdown;
