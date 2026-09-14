import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Search, Minus, Plus, 
  RotateCw, Maximize2, Minimize2, Download, Sun, Moon, Contrast, PanelLeft, X, Check 
} from 'lucide-react';
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

    // Cycle through themes: dark-clean (dark UI, light pages) -> light -> dark (full dark)
    const handleCycleTheme = () => {
        if (readingTheme === 'dark-clean') {
            onSetTheme('light');
        } else if (readingTheme === 'light') {
            onSetTheme('dark');
        } else {
            onSetTheme('dark-clean');
        }
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 flex items-center justify-between px-3 sm:px-5 h-13 sm:h-14 z-50 transition-all duration-300 backdrop-blur-xl ${
                isLight
                    ? 'bg-white/85 text-zinc-900 border-b border-zinc-200/80 shadow-xs'
                    : 'bg-[#09090b]/85 text-zinc-100 border-b border-white/[0.08] shadow-md'
            } ${showToolbar ? 'translate-y-0' : '-translate-y-full'}`}
        >
            {/* Mobile Expanded Search Bar Overlay */}
            {isMobileSearchOpen && !isImage && (
                <div className={`sm:hidden absolute inset-0 z-20 flex items-center px-3 gap-2 ${
                    isLight ? 'bg-white text-zinc-900' : 'bg-[#09090b] text-white'
                }`}>
                    <div className={`flex-1 flex items-center rounded-full border px-3 h-8 ${
                        isLight ? 'bg-zinc-100 border-zinc-300' : 'bg-white/10 border-white/10'
                    }`}>
                        <Search className={`w-3.5 h-3.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`} />
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
                                <span className="text-[9px] font-mono font-bold text-amber-500 whitespace-nowrap mr-1">
                                    {currentSearchIndex + 1}/{searchResults.length}
                                </span>
                                <button
                                    onClick={onPrevSearch}
                                    className={`p-1 rounded-md border-none ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}
                                >
                                    <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={onNextSearch}
                                    className={`p-1 rounded-md border-none ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}
                                >
                                    <ChevronDown className="w-3 h-3" />
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
            <div className="flex items-center gap-2 overflow-hidden max-w-[55%] sm:max-w-[42%]">
                <button
                    onClick={onClose}
                    className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors border border-transparent cursor-pointer ${
                        isLight
                            ? 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 hover:border-zinc-200'
                            : 'text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/5'
                    }`}
                    title="Close (Esc)"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {!isImage && !isDocx && !isLegacyDoc && (
                    <button
                        onClick={onToggleSidebar}
                        className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors border cursor-pointer ${
                            isSidebarOpen
                                ? isLight
                                    ? 'bg-zinc-200 text-zinc-900 border-zinc-300'
                                    : 'bg-white/15 text-white border-white/15'
                                : isLight
                                    ? 'border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                                    : 'border-transparent text-zinc-400 hover:text-white hover:bg-white/10'
                        }`}
                        title="Toggle Sidebar (T)"
                    >
                        <PanelLeft className="w-4 h-4" />
                    </button>
                )}

                <div className="truncate ml-1">
                    <div className="flex items-center gap-1.5">
                        <h3 className={`text-xs sm:text-sm font-semibold tracking-tight truncate ${
                            isLight ? 'text-zinc-900' : 'text-zinc-100'
                        }`}>
                            {displayFileName}
                        </h3>
                        {isDocx && <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[8px] font-bold bg-blue-500/15 text-blue-500 border border-blue-500/20 uppercase tracking-wide shrink-0">DOCX</span>}
                        {isLegacyDoc && <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[8px] font-bold bg-blue-500/15 text-blue-500 border border-blue-500/20 uppercase tracking-wide shrink-0">DOC</span>}
                        {isImage && <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[8px] font-bold bg-purple-500/15 text-purple-500 border border-purple-500/20 uppercase tracking-wide shrink-0">IMG</span>}
                        {!isDocx && !isLegacyDoc && !isImage && <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[8px] font-bold bg-rose-500/15 text-rose-500 border border-rose-500/20 uppercase tracking-wide shrink-0">PDF</span>}
                    </div>
                    <p className="hidden sm:block text-[10px] text-zinc-400 dark:text-zinc-500 font-medium leading-none mt-0.5 truncate">
                        Scholix Reader • {numPages} {numPages === 1 ? 'page' : 'pages'}
                    </p>
                </div>
            </div>

            {/* Center Section (Desktop): Page Stepper & Search Bar */}
            <div className="hidden sm:flex items-center gap-2.5">
                {/* Page Navigation - Apple Segmented Pill */}
                {numPages > 1 && (
                    <div className={`flex items-center rounded-full p-0.5 border text-xs ${
                        isLight
                            ? 'bg-zinc-100/90 border-zinc-200/80 text-zinc-900'
                            : 'bg-white/[0.06] border-white/[0.08] text-white'
                    }`}>
                        <button
                            onClick={() => onJumpToPage(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors border-none cursor-pointer disabled:opacity-30 ${
                                isLight
                                    ? 'text-zinc-700 hover:bg-white'
                                    : 'text-zinc-300 hover:bg-white/10'
                            }`}
                            title="Previous Page (←)"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        <form onSubmit={handlePageInputSubmit} className="flex items-center px-1">
                            <input
                                type="text"
                                value={pageInputValue}
                                onChange={(e) => setPageInputValue(e.target.value)}
                                onBlur={handlePageInputSubmit}
                                className={`w-7 sm:w-8 text-center text-xs font-semibold bg-transparent border-none outline-none ${
                                    isLight ? 'text-zinc-900' : 'text-white'
                                }`}
                            />
                            <span className={`text-[11px] font-medium select-none ${
                                isLight ? 'text-zinc-500' : 'text-zinc-400'
                            }`}>
                                / {numPages}
                            </span>
                        </form>

                        <button
                            onClick={() => onJumpToPage(currentPage + 1)}
                            disabled={currentPage >= numPages}
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors border-none cursor-pointer disabled:opacity-30 ${
                                isLight
                                    ? 'text-zinc-700 hover:bg-white'
                                    : 'text-zinc-300 hover:bg-white/10'
                            }`}
                            title="Next Page (→)"
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* Search Bar - Apple Pill */}
                {!isImage && (
                    <div className={`flex items-center rounded-full border px-2.5 h-7 sm:h-8 transition-all ${
                        isLight
                            ? 'bg-zinc-100/90 border-zinc-200/80 focus-within:border-zinc-400'
                            : 'bg-white/[0.06] border-white/[0.08] focus-within:border-white/20'
                    }`}>
                        <Search className={`w-3.5 h-3.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`} />
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
                                <span className="text-[9px] font-mono font-bold text-amber-500 whitespace-nowrap mr-1">
                                    {currentSearchIndex + 1}/{searchResults.length}
                                </span>
                                <button
                                    onClick={onPrevSearch}
                                    className={`p-0.5 rounded border-none cursor-pointer ${isLight ? 'hover:bg-zinc-200 text-zinc-700' : 'hover:bg-white/10 text-zinc-300'}`}
                                    title="Previous match (Shift+Enter)"
                                >
                                    <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={onNextSearch}
                                    className={`p-0.5 rounded border-none cursor-pointer ${isLight ? 'hover:bg-zinc-200 text-zinc-700' : 'hover:bg-white/10 text-zinc-300'}`}
                                    title="Next match (Enter)"
                                >
                                    <ChevronDown className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right Section: Zoom, Theme, Rotate, Fullscreen, Download */}
            <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Mobile Search Toggle Icon */}
                {!isImage && (
                    <button
                        onClick={() => setIsMobileSearchOpen(true)}
                        className={`sm:hidden w-8 h-8 rounded-xl flex items-center justify-center transition-colors border border-transparent cursor-pointer ${
                            searchQuery
                                ? 'bg-amber-500/15 text-amber-500 font-bold'
                                : isLight
                                ? 'bg-zinc-100 text-zinc-600 hover:text-black'
                                : 'bg-white/5 text-zinc-400 hover:text-white'
                        }`}
                        title="Search"
                    >
                        <Search className="w-3.5 h-3.5" />
                    </button>
                )}

                {/* Zoom Controls - Apple Segmented Pill */}
                <div className={`hidden md:flex items-center rounded-full p-0.5 border text-xs relative ${
                    isLight
                        ? 'bg-zinc-100/90 border-zinc-200/80'
                        : 'bg-white/[0.06] border-white/[0.08]'
                }`} ref={zoomMenuRef}>
                    <button
                        onClick={onZoomOut}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors border-none cursor-pointer ${
                            isLight
                                ? 'text-zinc-700 hover:bg-white hover:text-black'
                                : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                        }`}
                        title="Zoom Out (-)"
                    >
                        <Minus className="w-3 h-3" />
                    </button>

                    <button
                        onClick={() => setIsZoomMenuOpen(prev => !prev)}
                        className={`px-2 h-6 rounded-full flex items-center gap-1 text-[11px] font-semibold transition-colors border-none cursor-pointer ${
                            isLight
                                ? 'text-zinc-900 hover:bg-white'
                                : 'text-zinc-200 hover:bg-white/10'
                        }`}
                        title="Zoom Presets"
                    >
                        <span>{Math.round(scale * 100)}%</span>
                        <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                    </button>

                    <button
                        onClick={onZoomIn}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors border-none cursor-pointer ${
                            isLight
                                ? 'text-zinc-700 hover:bg-white hover:text-black'
                                : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                        }`}
                        title="Zoom In (+)"
                    >
                        <Plus className="w-3 h-3" />
                    </button>

                    {/* Zoom Dropdown Popover */}
                    {isZoomMenuOpen && (
                        <div className={`absolute top-full right-0 mt-2 w-36 rounded-2xl shadow-2xl border p-1.5 z-50 animate-fade-in space-y-0.5 backdrop-blur-xl ${
                            isLight ? 'bg-white/95 border-zinc-200/80 text-zinc-900' : 'bg-[#121215]/95 border-white/10 text-zinc-100'
                        }`}>
                            {zoomPresets.map((preset, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (preset.action) preset.action();
                                        else if (preset.scale) onSetExactScale(preset.scale);
                                        setIsZoomMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors border-none flex items-center justify-between cursor-pointer ${
                                        isLight
                                            ? 'hover:bg-zinc-100 text-zinc-800'
                                            : 'hover:bg-white/5 text-zinc-200'
                                    }`}
                                >
                                    <span>{preset.label}</span>
                                    {preset.scale && Math.round(scale * 100) === Math.round(preset.scale * 100) && (
                                        <Check className="w-3 h-3 text-amber-500" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 1-Click Instant Theme Toggle */}
                <button
                    onClick={handleCycleTheme}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors border border-transparent cursor-pointer ${
                        isLight
                            ? 'hover:bg-zinc-100 text-zinc-700 hover:text-black'
                            : 'hover:bg-white/10 text-zinc-300 hover:text-white'
                    }`}
                    title={
                        readingTheme === 'dark-clean'
                            ? 'Reading Mode: Dark UI + Light Pages (Click for Light Mode)'
                            : readingTheme === 'light'
                            ? 'Reading Mode: Light Mode (Click for Full Dark Inverted)'
                            : 'Reading Mode: Full Dark Inverted (Click for Dark UI + Light Pages)'
                    }
                >
                    {readingTheme === 'dark-clean' && (
                        <Moon className="w-3.5 h-3.5" />
                    )}
                    {readingTheme === 'light' && (
                        <Sun className="w-3.5 h-3.5" />
                    )}
                    {readingTheme === 'dark' && (
                        <Contrast className="w-3.5 h-3.5" />
                    )}
                </button>

                {/* Rotate Button (Desktop) */}
                <button
                    onClick={onRotate}
                    className={`hidden md:flex w-8 h-8 rounded-xl items-center justify-center transition-colors border border-transparent cursor-pointer ${
                        isLight
                            ? 'hover:bg-zinc-100 text-zinc-700 hover:text-black'
                            : 'hover:bg-white/10 text-zinc-300 hover:text-white'
                    }`}
                    title="Rotate 90° (R)"
                >
                    <RotateCw className="w-3.5 h-3.5" />
                </button>

                {/* Fullscreen Button (Desktop) */}
                <button
                    onClick={onToggleFullscreen}
                    className={`hidden md:flex w-8 h-8 rounded-xl items-center justify-center transition-colors border border-transparent cursor-pointer ${
                        isLight
                            ? 'hover:bg-zinc-100 text-zinc-700 hover:text-black'
                            : 'hover:bg-white/10 text-zinc-300 hover:text-white'
                    }`}
                    title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F)'}
                >
                    {isFullscreen ? (
                        <Minimize2 className="w-3.5 h-3.5" />
                    ) : (
                        <Maximize2 className="w-3.5 h-3.5" />
                    )}
                </button>

                {/* Apple-Style Sleek Download Button */}
                <button
                    onClick={onDownload}
                    disabled={isDownloading}
                    className={`flex items-center gap-1.5 px-3 sm:px-3.5 h-8 rounded-xl text-xs font-semibold shadow-xs transition-all border cursor-pointer active:scale-95 disabled:opacity-50 ${
                        isLight
                            ? 'bg-zinc-900 text-white hover:bg-zinc-800 border-zinc-900/10'
                            : 'bg-white/80 hover:bg-white/90 text-zinc-950 border-white/20 backdrop-blur-md dark:bg-white/80 dark:hover:bg-white/90 dark:text-zinc-950'
                    }`}
                    title="Download Document"
                >
                    {isDownloading ? (
                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Download className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline text-xs font-semibold">Download</span>
                </button>
            </div>
        </header>
    );
};
