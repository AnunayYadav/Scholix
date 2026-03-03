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
    renderCustomMenu
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
        <div ref={dropdownRef} className={`relative ${isOpen ? 'z-50' : ''} ${className}`}>
            {label && (
                <label className="text-[11px] sm:text-xs font-medium text-slate-500 ml-1 mb-2 block">
                    {label}
                </label>
            )}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-4 px-5 py-3 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-2xl text-[11px] sm:text-xs font-bold outline-none hover:border-orange-500/50 transition-all dark:text-white cursor-pointer min-w-[180px] justify-between group shadow-sm active:scale-95 ${buttonClassName}`}
            >
                <div className="flex items-center gap-3">
                    {icon && <span className="opacity-50">{icon}</span>}
                    <span className="opacity-80 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden text-ellipsis">
                        {value || placeholder}
                    </span>
                </div>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="w-3 h-3 text-orange-600 transition-transform duration-300"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[220px] bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in-up origin-top p-2 space-y-1">
                    <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                        {renderCustomMenu ? renderCustomMenu(() => setIsOpen(false)) : (
                            options.map(option => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => {
                                        onChange(option);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3.5 rounded-2xl text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-between group border-none ${value === option
                                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                                        : 'text-slate-600 dark:text-slate-400 bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 hover:text-orange-600'
                                        }`}
                                >
                                    {option}
                                    {value === option && (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-3.5 h-3.5">
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
