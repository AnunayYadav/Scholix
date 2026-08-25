import React from 'react';
import { ReadingTheme, ViewFitMode, SearchResult } from '../types.ts';

interface PDFToolbarProps {
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
    searchResults: SearchResult[];
    currentSearchIndex: number;
    onPrevSearch: () => void;
    onNextSearch: () => void;
    // Zoom & Fit
    scale: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    viewMode: ViewFitMode;
    onToggleFit: () => void;
    onRotateImage?: () => void;
    // Navigation
    currentPage: number;
    numPages: number;
    onJumpToPage: (page: number) => void;
    progressPercent: number;
    // Themes & View
    readingTheme: ReadingTheme;
    onSetTheme: (theme: ReadingTheme) => void;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    // Download
    isDownloading: boolean;
    onDownload: () => void;
}

export const PDFToolbar: React.FC<PDFToolbarProps> = ({
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
    viewMode,
    onToggleFit,
    onRotateImage,
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
    return (
        <header
            className={`absolute top-0 left-0 right-0 flex items-center justify-between px-2 md:px-5 h-12 md:h-14 bg-white/95 dark:bg-[#060606]/95 backdrop-blur-2xl border-b border-zinc-200 dark:border-white/5 z-50 transition-transform duration-300 ${
                showToolbar ? 'translate-y-0' : '-translate-y-full'
            }`}
        >
            {/* Left: Back button + Sidebar toggle + Title */}
            <div className="flex items-center gap-1.5 overflow-hidden">
                <button
                    onClick={onClose}
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-transparent text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all border-none group pdf-back-btn"
                    title="Close Viewer"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </button>

                {!isImage && !isDocx && !isLegacyDoc && (
                    <button
                        onClick={onToggleSidebar}
                        className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all border-none ${
                            isSidebarOpen
                                ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400'
                                : 'bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                        title="Toggle Navigation Sidebar (Thumbnails & Outline)"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <line x1="9" y1="3" x2="9" y2="21" />
                        </svg>
                    </button>
                )}

                <div className="hidden sm:block truncate ml-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate max-w-[180px] md:max-w-[240px]">
                            {displayFileName}
                        </h3>
                        {isDocx && <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase tracking-wide shrink-0">DOCX</span>}
                        {isLegacyDoc && <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase tracking-wide shrink-0">DOC</span>}
                        {isImage && <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20 uppercase tracking-wide shrink-0">IMG</span>}
                        {!isDocx && !isLegacyDoc && !isImage && <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20 uppercase tracking-wide shrink-0">PDF</span>}
                    </div>
                    <p className="text-[9px] font-semibold tracking-wide leading-none mt-0.5" style={{ color: 'var(--brand-primary)' }}>
                        {fullBrandName} Document Engine
                    </p>
                </div>
            </div>

            {/* Center: Search & Zoom */}
            <div className="flex items-center gap-1.5 md:gap-3">
                {/* Search Bar */}
                {!isImage && (
                    <div className="hidden sm:flex items-center bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200/50 dark:border-white/5 px-2.5 h-8 md:h-9 focus-within:border-orange-500/50 transition-all group">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5 text-zinc-400 dark:text-white/20 group-focus-within:text-orange-500"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        <input
                            type="text"
                            placeholder="Find..."
                            value={searchQuery}
                            onChange={e => onSearchChange(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && onSearchSubmit()}
                            autoCapitalize="none"
                            autoCorrect="off"
                            autoComplete="off"
                            spellCheck="false"
                            className="bg-transparent border-none outline-none text-xs font-medium text-zinc-900 dark:text-white px-2 w-20 md:w-28 placeholder:text-zinc-400 dark:placeholder:text-white/20"
                        />
                        {searchResults.length > 0 && (
                            <div className="flex items-center gap-1 pr-1">
                                <span className="text-[9px] font-black text-orange-500 whitespace-nowrap">
                                    {currentSearchIndex + 1} / {searchResults.length}
                                </span>
                                <div className="h-3 w-px bg-zinc-200 dark:bg-white/10 mx-0.5" />
                                <button onClick={onPrevSearch} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white border-none bg-transparent active:scale-90 p-0.5">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className="w-2.5 h-2.5"><path d="m15 18-6-6 6-6" /></svg>
                                </button>
                                <button onClick={onNextSearch} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white border-none bg-transparent active:scale-90 p-0.5">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className="w-2.5 h-2.5"><path d="m9 18 6-6-6-6" /></svg>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Zoom Controls */}
                <div className="flex items-center bg-zinc-100 dark:bg-white/5 rounded-xl h-8 md:h-9 p-0.5 border border-zinc-200/50 dark:border-white/5">
                    <button
                        onClick={onZoomOut}
                        className="w-6.5 h-6.5 rounded-lg flex items-center justify-center text-zinc-500 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition-all border-none bg-transparent"
                        title="Zoom Out"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    </button>
                    <span className="text-[10px] font-bold text-zinc-900 dark:text-white px-1.5 min-w-[34px] md:min-w-[40px] text-center select-none">
                        {Math.round(scale * 100)}%
                    </span>
                    <button
                        onClick={onZoomIn}
                        className="w-6.5 h-6.5 rounded-lg flex items-center justify-center text-zinc-500 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition-all border-none bg-transparent"
                        title="Zoom In"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    </button>

                    {!isDocx && !isLegacyDoc && !isImage && (
                        <>
                            <div className="w-px h-4 bg-zinc-200 dark:bg-white/10 mx-0.5" />
                            <button
                                onClick={onToggleFit}
                                className="w-6.5 h-6.5 rounded-lg flex items-center justify-center text-zinc-500 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition-all border-none bg-transparent"
                                title={viewMode === 'width' ? "Fit to Page" : "Fit to Width"}
                            >
                                {viewMode === 'width' ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                                        <path d="M8 3H5a2 2 0 0 0-2 2v3m14 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                                        <path d="M2 12h20" />
                                        <path d="M7 7l-5 5 5 5" />
                                        <path d="M17 7l5 5-5 5" />
                                    </svg>
                                )}
                            </button>
                        </>
                    )}

                    {isImage && onRotateImage && (
                        <button
                            onClick={onRotateImage}
                            className="w-6.5 h-6.5 rounded-lg flex items-center justify-center text-zinc-500 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition-all border-none bg-transparent ml-0.5"
                            title="Rotate Image Clockwise"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" /></svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Right: Page Selector, Reading Theme, Fullscreen, Download */}
            <div className="flex items-center gap-1 md:gap-2">
                {/* Page Jump */}
                {numPages > 1 && (
                    <div className="hidden sm:flex items-center h-8 md:h-9 bg-zinc-100 dark:bg-white/5 border border-zinc-200/50 dark:border-white/5 rounded-xl px-2 gap-1">
                        <input
                            type="number"
                            min={1}
                            max={numPages}
                            value={currentPage}
                            onChange={e => onJumpToPage(parseInt(e.target.value) || 1)}
                            className="w-7 bg-transparent border-none outline-none text-center text-xs font-bold text-zinc-900 dark:text-white"
                        />
                        <span className="text-[10px] font-semibold text-zinc-400 dark:text-white/30 tracking-wide select-none">
                            / {numPages}
                        </span>
                    </div>
                )}

                {/* Progress Ring */}
                {numPages > 1 && (
                    <div className="hidden sm:flex relative w-8.5 h-8.5 md:w-9 md:h-9 items-center justify-center shrink-0 select-none cursor-default" title={`${progressPercent}% Read`}>
                        <svg className="w-7 h-7 -rotate-90" viewBox="0 0 32 32">
                            <circle cx="16" cy="16" r="13" className="stroke-zinc-200 dark:stroke-white/10" strokeWidth="2.5" fill="transparent" />
                            <circle cx="16" cy="16" r="13" className="stroke-orange-500" strokeWidth="2.5" fill="transparent" strokeDasharray={2 * Math.PI * 13} strokeDashoffset={2 * Math.PI * 13 - (progressPercent / 100) * (2 * Math.PI * 13)} strokeLinecap="round" />
                        </svg>
                        <span className="absolute text-[7.5px] md:text-[8px] font-black tracking-tighter text-zinc-800 dark:text-zinc-200">{progressPercent}%</span>
                    </div>
                )}

                {/* Theme Mode Selector (Dark (Dark Pages) / Dark (Normal Pages) / Light) */}
                <div className="flex items-center bg-zinc-100 dark:bg-white/5 rounded-xl h-8 md:h-9 p-0.5 border border-zinc-200/50 dark:border-white/5">
                    <button
                        onClick={() => onSetTheme(readingTheme === 'dark' ? 'dark-clean' : readingTheme === 'dark-clean' ? 'light' : 'dark')}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition-all border-none bg-transparent"
                        title={
                            readingTheme === 'dark'
                                ? 'Reading Mode: Full Dark (Dark Pages) — Click for Dark UI with Light Pages'
                                : readingTheme === 'dark-clean'
                                ? 'Reading Mode: Dark UI (Normal Light Pages) — Click for Light Mode'
                                : 'Reading Mode: Light — Click for Full Dark Mode'
                        }
                    >
                        {readingTheme === 'dark' && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-blue-400">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        )}
                        {readingTheme === 'dark-clean' && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-orange-400">
                                <circle cx="12" cy="12" r="9" strokeWidth="2" />
                                <path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" />
                            </svg>
                        )}
                        {readingTheme === 'light' && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-amber-500">
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
                </div>

                {/* Fullscreen */}
                <button
                    onClick={onToggleFullscreen}
                    className="hidden md:flex w-8 h-8 md:w-9 md:h-9 rounded-xl items-center justify-center bg-zinc-100 dark:bg-white/5 border border-zinc-200/50 dark:border-white/5 text-zinc-500 dark:text-white/35 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition-all border-none group"
                    title="Toggle Fullscreen"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 group-hover:scale-110 transition-transform"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
                </button>

                {/* Download */}
                <button
                    onClick={onDownload}
                    disabled={isDownloading}
                    className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center border-none transition-all shadow-lg ${
                        isDownloading ? 'opacity-60 cursor-wait' : 'text-white hover:scale-105 active:scale-95'
                    }`}
                    style={{ backgroundColor: 'var(--brand-primary)', boxShadow: '0 8px 12px -3px var(--brand-glow)' }}
                    title={isDownloading ? 'Preparing download...' : 'Download Document'}
                >
                    {isDownloading ? (
                        <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-white"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                    )}
                </button>
            </div>
        </header>
    );
};
