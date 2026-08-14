import React, { useState, useRef, useEffect } from 'react';

interface NexusDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  buttonClassName?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  renderCustomMenu?: (close: () => void) => React.ReactNode;
  align?: 'left' | 'right';
}

const NexusDropdown: React.FC<NexusDropdownProps> = ({
  options,
  value,
  onChange,
  label,
  className = "",
  buttonClassName = "",
  placeholder = "Select...",
  icon,
  renderCustomMenu,
  align = 'left'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative w-full ${isOpen ? 'z-50' : ''} ${className}`}>
      {label && (
        <label className="text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 ml-1 mb-1.5 block">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 bg-zinc-100 dark:bg-[#161618] border-none rounded-2xl text-xs font-semibold outline-none hover:bg-zinc-200/60 dark:hover:bg-[#1f1f23] focus:ring-2 focus:ring-orange-500/40 transition-all text-zinc-900 dark:text-white cursor-pointer min-w-0 group active:scale-[0.99] ${buttonClassName}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {icon && <span className="opacity-60 shrink-0">{icon}</span>}
          <span className="truncate text-left opacity-90 group-hover:opacity-100 transition-opacity font-semibold">
            {value || placeholder}
          </span>
        </div>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="w-3.5 h-3.5 text-orange-500 shrink-0 transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute top-[calc(100%+6px)] ${align === 'right' ? 'right-0' : 'left-0'} w-full min-w-[220px] max-h-[260px] bg-white dark:bg-[#161618] border-none rounded-2xl shadow-2xl overflow-hidden z-[100] p-1.5 space-y-1 animate-fade-in`}>
          <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
            {renderCustomMenu ? renderCustomMenu(() => setIsOpen(false)) : (
              options.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between group border-none cursor-pointer ${
                    value === option
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 font-bold'
                      : 'text-zinc-700 dark:text-zinc-300 bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-orange-500'
                  }`}
                >
                  <span className="truncate pr-2">{option}</span>
                  {value === option && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className="w-3.5 h-3.5 shrink-0">
                      <path d="M20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NexusDropdown;
