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
  menuClassName?: string;
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
  align = 'left',
  menuClassName = ""
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

  const isExplicitWidth = className.includes('w-') || className.includes('shrink');
  const widthClass = isExplicitWidth ? '' : 'w-full';

  return (
    <div ref={dropdownRef} className={`relative ${widthClass} ${isOpen ? 'z-50' : ''} ${className}`}>
      {label && (
        <label className="text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 ml-1 mb-1.5 block">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-9 inline-flex items-center justify-between gap-2.5 px-4 bg-zinc-100 dark:bg-[#18181b] border border-zinc-200/40 dark:border-white/[0.04] rounded-full text-xs font-semibold text-zinc-900 dark:text-white cursor-pointer select-none transition-all active:scale-[0.98] outline-none hover:bg-zinc-200/60 dark:hover:bg-[#202024] whitespace-nowrap ${isExplicitWidth ? 'w-auto' : 'w-full'} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {icon && <span className="text-zinc-500 dark:text-zinc-400 shrink-0">{icon}</span>}
          <span className="truncate text-left font-semibold">
            {value || placeholder}
          </span>
        </div>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0 transition-transform duration-200 ml-0.5"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute top-[calc(100%+5px)] ${
            align === 'right' ? 'right-0' : 'left-0'
          } min-w-[170px] max-h-[260px] bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-2xl border border-zinc-200/60 dark:border-white/[0.08] rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)] overflow-hidden z-[100] p-1 animate-fade-in ${menuClassName}`}
        >
          <div className="max-h-[240px] overflow-y-auto custom-scrollbar space-y-0.5">
            {renderCustomMenu ? (
              renderCustomMenu(() => setIsOpen(false))
            ) : (
              options.map(option => {
                const isSelected = value === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between group border-none cursor-pointer select-none ${
                      isSelected
                        ? 'bg-zinc-100 dark:bg-white/[0.08] text-zinc-900 dark:text-white font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-white/[0.04] font-medium'
                    }`}
                  >
                    <span className="truncate pr-2">{option}</span>
                    {isSelected && (
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4 text-zinc-900 dark:text-white shrink-0"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NexusDropdown;
