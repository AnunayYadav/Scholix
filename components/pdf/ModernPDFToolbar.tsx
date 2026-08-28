import React, { useState, useRef, useEffect } from 'react';
import { ModernReadingTheme, ModernViewFitMode, ModernSearchResult } from './modernTypes.ts';

interface ModernPDFToolbarProps {
    showToolbar: boolean;
    displayFileName: string;
    fullBrandName: string;
    isDocx: boolean;
    isLegacyDoc: boolean;
    isImage: boolean;
    isSidebarOpen: boolean;
    onToggleSidebar: () => void;
    onClose: () => void;
    // Search
    searchQuery: string;
    onSearchChange: (q: string) => void;
    onSearchSubmit: () => void;
    searchResults: ModernSearchResult[];
    currentSearchIndex: number;
    onPrevSearch: () => void;
    onNextSearch: () => void;
    // Zoom & Fit
    scale: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onSetExactScale: (scale: number) => void;
    viewMode: ModernViewFitMode;
    onToggleFit: () => void;
    onFitPage: () => void;
    onFitWidth: () => void;
    onRotate: () => void;
    // Navigation
    currentPage: number;
    numPages: number;
    onJumpToPage: (page: number) => void;
    progressPercent: number;
    // Themes & View
    readingTheme: ModernReadingTheme;
    onSetTheme: (theme: ModernReadingTheme) => void;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    // Download
    isDownloading: boolean;
    onDownload: () => void;
    onPrint?: () => void;
    onOpenShortcuts: () => void;
}

export const ModernPDFToolbar: React.FC<ModernPDFToolbarProps> = ({
    showToolbar,
    displayFileName,
    fullBrandName,
    isDocx,
    isLegacyDoc,
    isImage,
    isSidebarOpen,
    onToggleSidebar,
    onClose,
    searchQuery,
    onSearchChange,
    onSearchSubmit,
    searchResults,
    currentSearchIndex,
    onPrevSearch,
    onNextSearch,
    scale,
    onZoomIn,
    onZoomOut,
    onSetExactScale,
    viewMode,
    onToggleFit,
    onFitPage,
    onFitWidth,
    onRotate,
    currentPage,
    numPages,
    onJumpToPage,
    progressPercent,
    readingTheme,
    onSetTheme,
    isFullscreen,
    onToggleFullscreen,
    isDownloading,
    onDownload,
}) => {
    const [pageInputValue, setPageInputValue] = useState(currentPage.toString());
    const [isZoomMenuOpen, setIsZoomMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    const zoomMenuRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setPageInputValue(currentPage.toString());
    }, [currentPage]);

    // Focus search input when mobile search is opened
    useEffect(() => {
        if (isMobileSearchOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 50);
        }
    }, [isMobileSearchOpen]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (zoomMenuRef.current && !zoomMenuRef.current.contains(e.target as Node)) {
                setIsZoomMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const handlePageInputSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const p = parseInt(pageInputValue, 10);
        if (!isNaN(p) && p >= 1 && p <= numPages) {
            onJumpToPage(p);
        } else {
            setPageInputValue(currentPage.toString());
        }
    };

    const zoomPresets = [
        { label: 'Fit to Page', action: onFitPage },
        { label: 'Fit to Width', action: onFitWidth },
        { label: '50%', scale: 0.5 },
        { label: '75%', scale: 0.75 },
        { label: '100%', scale: 1.0 },
        { label: '125%', scale: 1.25 },
        { label: '150%', scale: 1.5 },
        { label: '200%', scale: 2.0 },
        { label: '300%', scale: 3.0 },
    ];

    const isLight = readingTheme === 'light';

    // Cycle through themes: dark (full dark) -> dark-clean (dark UI, light pages) -> light (full light)
    const handleCycleTheme = () => {
        if (readingTheme === 'dark') {
            onSetTheme('dark-clean');
        } else if (readingTheme === 'dark-clean') {
            onSetTheme('light');
        } else {
            onSetTheme('dark');
        }
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 flex items-center justify-between px-2 sm:px-4 h-12 sm:h-14 z-50 transition-transform duration-300 ${
                isLight
                    ? 'bg-[#ffffff] text-[#18181b] border-b border-zinc-200 shadow-xs'
                    : 'bg-[#09090b] text-[#f4f4f5] border-b border-white/10 shadow-md'
            } ${showToolbar ? 'translate-y-0' : '-translate-y-full'}`}
        >
            {/* Mobile Expanded Search Bar Overlay */}
            {isMobileSearchOpen && !isImage && (
                <div className={`sm:hidden absolute inset-0 z-20 flex items-center px-3 gap-2 ${
                    isLight ? 'bg-white text-zinc-900' : 'bg-[#09090b] text-white'
                }`}>
                    <div className={`flex-1 flex items-center rounded-xl border px-2.5 h-8 ${
                        isLight ? 'bg-zinc-100 border-zinc-300' : 'bg-white/10 border-white/10'
                    }`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`w-3.5 h-3.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Find in document..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    if (e.shiftKey) onPrevSearch();
                                    else onNextSearch();
                                }
                            }}
                            className={`flex-1 bg-transparent border-none outline-none text-xs font-medium px-2 ${
                                isLight ? 'text-zinc-900 placeholder:text-zinc-500' : 'text-white placeholder:text-zinc-400'
                            }`}
                        />
                        {searchResults.length > 0 && (
                            <div className="flex items-center gap-0.5">
                                <span className="text-[9px] font-black text-orange-500 whitespace-nowrap mr-1">
                                    {currentSearchIndex + 1}/{searchResults.length}
                                </span>
                                <button
                                    onClick={onPrevSearch}
                                    className={`p-1 rounded border-none ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><path d="m18 15-6-6-6 6"/></svg>
                                </button>
                                <button
                                    onClick={onNextSearch}
                                    className={`p-1 rounded border-none ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><path d="m6 9 6 6 6-6"/></svg>
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => {
                            setIsMobileSearchOpen(false);
                            onSearchChange('');
                        }}
                        className={`text-xs font-bold px-2 py-1 rounded-lg border-none bg-transparent ${
                            isLight ? 'text-zinc-600 hover:text-black' : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        Cancel
                    </button>
                </div>
            )}

            {/* Left Section: Back button, Sidebar toggle, Title */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden max-w-[55%] sm:max-w-[40%]">
                <button
                    onClick={onClose}
                    className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all border-none group ${
                        isLight
                            ? 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                            : 'text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                    title="Close (Esc)"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </button>

                {!isImage && !isDocx && !isLegacyDoc && (
                    <button
                        onClick={onToggleSidebar}
                        className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all border-none ${
                            isSidebarOpen
                                ? 'bg-orange-500/15 text-orange-600 font-bold'
                                : isLight
                                ? 'bg-zinc-100 text-zinc-600 hover:text-black hover:bg-zinc-200'
                                : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                        }`}
                        title="Toggle Navigation Sidebar (T)"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>
                        </svg>
                    </button>
                )}

                <div className="truncate ml-0.5">
                    <div className="flex items-center gap-1.5">
                        <h3 className={`text-xs font-bold tracking-tight truncate ${
                            isLight ? 'text-zinc-900' : 'text-zinc-100'
                        }`}>
                            {displayFileName}
                        </h3>
                        {isDocx && <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[8px] font-black bg-blue-500/15 text-blue-600 border border-blue-500/20 uppercase tracking-wide shrink-0">DOCX</span>}
                        {isLegacyDoc && <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[8px] font-black bg-blue-500/15 text-blue-600 border border-blue-500/20 uppercase tracking-wide shrink-0">DOC</span>}
                        {isImage && <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[8px] font-black bg-purple-500/15 text-purple-600 border border-purple-500/20 uppercase tracking-wide shrink-0">IMG</span>}
                        {!isDocx && !isLegacyDoc && !isImage && <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[8px] font-black bg-orange-500/15 text-orange-600 border border-orange-500/20 uppercase tracking-wide shrink-0">PDF</span>}
                    </div>
                    <p className="hidden sm:block text-[9px] font-bold tracking-wide leading-none mt-0.5" style={{ color: 'var(--brand-primary)' }}>
                        {fullBrandName} Reader Pro
                    </p>
                </div>
            </div>

            {/* Center Section (Desktop Only): Page Stepper & Search Bar */}
            <div className="hidden sm:flex items-center gap-2">
                {/* Page Navigation */}
                {numPages > 1 && (
                    <div className={`flex items-center rounded-xl p-0.5 border text-xs ${
                        isLight
                            ? 'bg-zinc-100 border-zinc-300 text-zinc-900'
                            : 'bg-white/5 border-white/10 text-white'
                    }`}>
                        <button
                            onClick={() => onJumpToPage(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-all border-none disabled:opacity-30 ${
                                isLight
                                    ? 'text-zinc-700 hover:bg-white'
                                    : 'text-zinc-300 hover:bg-white/10'
                            }`}
                            title="Previous Page (←)"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="m15 18-6-6 6-6"/></svg>
                        </button>

                        <form onSubmit={handlePageInputSubmit} className="flex items-center px-1">
                            <input
                                type="text"
                                value={pageInputValue}
                                onChange={(e) => setPageInputValue(e.target.value)}
                                onBlur={handlePageInputSubmit}
                                className={`w-7 sm:w-8 text-center text-xs font-bold bg-transparent border-none outline-none ${
                                    isLight ? 'text-zinc-900' : 'text-white'
                                }`}
                            />
                            <span className={`text-[11px] font-semibold select-none ${
                                isLight ? 'text-zinc-500' : 'text-zinc-400'
                            }`}>
                                / {numPages}
                            </span>
                        </form>

                        <button
                            onClick={() => onJumpToPage(currentPage + 1)}
                            disabled={currentPage >= numPages}
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-all border-none disabled:opacity-30 ${
                                isLight
                                    ? 'text-zinc-700 hover:bg-white'
                                    : 'text-zinc-300 hover:bg-white/10'
                            }`}
                            title="Next Page (→)"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="m9 18 6-6-6-6"/></svg>
                        </button>
                    </div>
                )}

                {/* Search Bar on Desktop */}
                {!isImage && (
                    <div className={`flex items-center rounded-xl border px-2 h-7 sm:h-8 transition-all ${
                        isLight
                            ? 'bg-zinc-100 border-zinc-300 focus-within:border-orange-500'
                            : 'bg-white/5 border-white/10 focus-within:border-orange-500/50'
                    }`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`w-3.5 h-3.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        <input
                            type="text"
                            placeholder="Find..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    if (e.shiftKey) onPrevSearch();
                                    else onNextSearch();
                                }
                            }}
                            className={`bg-transparent border-none outline-none text-xs font-medium px-2 w-20 md:w-28 ${
                                isLight ? 'text-zinc-900 placeholder:text-zinc-500' : 'text-white placeholder:text-zinc-400'
                            }`}
                        />
                        {searchResults.length > 0 && (
                            <div className="flex items-center gap-0.5 pr-0.5">
                                <span className="text-[9px] font-black text-orange-500 whitespace-nowrap mr-1">
                                    {currentSearchIndex + 1}/{searchResults.length}
                                </span>
                                <button
                                    onClick={onPrevSearch}
                                    className={`p-0.5 rounded border-none ${isLight ? 'hover:bg-zinc-200 text-zinc-700' : 'hover:bg-white/10 text-zinc-300'}`}
                                    title="Previous match (Shift+Enter)"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><path d="m18 15-6-6-6 6"/></svg>
                                </button>
                                <button
                                    onClick={onNextSearch}
                                    className={`p-0.5 rounded border-none ${isLight ? 'hover:bg-zinc-200 text-zinc-700' : 'hover:bg-white/10 text-zinc-300'}`}
                                    title="Next match (Enter)"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><path d="m6 9 6 6 6-6"/></svg>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right Section: Mobile Search, Desktop Zoom, Theme, Rotate, Fullscreen, Download */}
            <div className="flex items-center gap-1 sm:gap-1.5">
                {/* Mobile Search Toggle Icon */}
                {!isImage && (
                    <button
                        onClick={() => setIsMobileSearchOpen(true)}
                        className={`sm:hidden w-8 h-8 rounded-xl flex items-center justify-center transition-all border-none ${
                            searchQuery
                                ? 'bg-orange-500/15 text-orange-600 font-bold'
                                : isLight
                                ? 'bg-zinc-100 text-zinc-600 hover:text-black'
                                : 'bg-white/5 text-zinc-400 hover:text-white'
                        }`}
                        title="Search"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </button>
                )}

                {/* Zoom Controls (Desktop only - mobile uses native pinch) */}
                <div className={`hidden md:flex items-center rounded-xl p-0.5 border text-xs relative ${
                    isLight
                        ? 'bg-zinc-100 border-zinc-300'
                        : 'bg-white/5 border-white/10'
                }`} ref={zoomMenuRef}>
                    <button
                        onClick={onZoomOut}
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-all border-none font-bold text-sm ${
                            isLight
                                ? 'text-zinc-700 hover:bg-white hover:text-black'
                                : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                        }`}
                        title="Zoom Out (-)"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><line x1="5" x2="19" y1="12" y2="12"/></svg>
                    </button>

                    <button
                        onClick={() => setIsZoomMenuOpen(prev => !prev)}
                        className={`px-1.5 sm:px-2 h-6 sm:h-7 rounded-lg flex items-center gap-1 text-xs font-bold transition-all border-none ${
                            isLight
                                ? 'text-zinc-900 hover:bg-white'
                                : 'text-zinc-200 hover:bg-white/10'
                        }`}
                        title="Zoom Presets"
                    >
                        <span>{Math.round(scale * 100)}%</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5 opacity-60"><path d="m6 9 6 6 6-6"/></svg>
                    </button>

                    <button
                        onClick={onZoomIn}
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-all border-none font-bold text-sm ${
                            isLight
                                ? 'text-zinc-700 hover:bg-white hover:text-black'
                                : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                        }`}
                        title="Zoom In (+)"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
                    </button>

                    {/* Zoom Dropdown Popover */}
                    {isZoomMenuOpen && (
                        <div className={`absolute top-full right-0 mt-2 w-36 rounded-2xl shadow-2xl border p-1.5 z-50 animate-fade-in space-y-0.5 ${
                            isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-[#121215] border-white/10 text-zinc-100'
                        }`}>
                            {zoomPresets.map((preset, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (preset.action) preset.action();
                                        else if (preset.scale) onSetExactScale(preset.scale);
                                        setIsZoomMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors border-none flex items-center justify-between ${
                                        isLight
                                            ? 'hover:bg-zinc-100 text-zinc-800'
                                            : 'hover:bg-white/5 text-zinc-200'
                                    }`}
                                >
                                    <span>{preset.label}</span>
                                    {preset.scale && Math.round(scale * 100) === Math.round(preset.scale * 100) && (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3 text-orange-500"><polyline points="20 6 9 17 4 12"/></svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 1-Click Instant Theme Toggle */}
                <button
                    onClick={handleCycleTheme}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all border-none ${
                        isLight
                            ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-black'
                            : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
                    }`}
                    title={
                        readingTheme === 'dark'
                            ? 'Reading Mode: Full Dark (Dark Pages) — Click for Dark UI with Light Pages'
                            : readingTheme === 'dark-clean'
                            ? 'Reading Mode: Dark UI (Light Pages) — Click for Light Mode'
                            : 'Reading Mode: Light — Click for Full Dark Mode'
                    }
                >
                    {readingTheme === 'dark' && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-blue-400">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                    )}
                    {readingTheme === 'dark-clean' && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-orange-400">
                            <circle cx="12" cy="12" r="9" strokeWidth="2" />
                            <path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" />
                        </svg>
                    )}
                    {readingTheme === 'light' && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-amber-500">
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="23" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                            <line x1="1" y1="12" x2="3" y2="12" />
                            <line x1="21" y1="12" x2="23" y2="12" />
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                    )}
                </button>

                {/* Rotate Button (Desktop) */}
                <button
                    onClick={onRotate}
                    className={`hidden md:flex w-8 h-8 rounded-xl items-center justify-center transition-all border-none ${
                        isLight
                            ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-black'
                            : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
                    }`}
                    title="Rotate 90° (R)"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                </button>

                {/* Fullscreen Button (Desktop) */}
                <button
                    onClick={onToggleFullscreen}
                    className={`hidden md:flex w-8 h-8 rounded-xl items-center justify-center transition-all border-none ${
                        isLight
                            ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-black'
                            : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
                    }`}
                    title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F)'}
                >
                    {isFullscreen ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                    )}
                </button>

                {/* Download Button */}
                <button
                    onClick={onDownload}
                    disabled={isDownloading}
                    className="w-8 h-8 rounded-xl flex items-center justify-center bg-orange-500 hover:bg-orange-600 active:scale-95 text-white transition-all border-none shadow-xs disabled:opacity-50"
                    title="Download Secure PDF"
                >
                    {isDownloading ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                    )}
                </button>
            </div>
        </header>
    );
};
