import React, { useState } from 'react';
import { PDFThumbnail } from './PDFThumbnail.tsx';
import { PDFOutlineItem, SearchResult, SidebarTab } from '../types.ts';

interface PDFSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    numPages: number;
    currentPage: number;
    pdfDoc: any;
    outline: PDFOutlineItem[];
    searchResults: SearchResult[];
    searchSnippets?: { pageIndex: number; snippet: string }[];
    currentSearchIndex: number;
    searchQuery: string;
    onJumpToPage: (page: number) => void;
    onSelectSearchResult: (index: number) => void;
}

export const PDFSidebar: React.FC<PDFSidebarProps> = ({
    isOpen,
    onClose,
    numPages,
    currentPage,
    pdfDoc,
    outline,
    searchResults,
    searchSnippets = [],
    currentSearchIndex,
    searchQuery,
    onJumpToPage,
    onSelectSearchResult,
}) => {
    const [activeTab, setActiveTab] = useState<SidebarTab>('thumbnails');

    const renderOutlineNodes = (items: PDFOutlineItem[], depth = 0) => {
        if (!items || items.length === 0) return null;
        return (
            <ul className={`space-y-1 ${depth > 0 ? 'ml-3 pl-2 border-l border-zinc-200 dark:border-white/10' : ''}`}>
                {items.map((item, idx) => (
                    <li key={idx}>
                        <button
                            onClick={() => {
                                if (item.pageNumber) {
                                    onJumpToPage(item.pageNumber);
                                }
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between group ${
                                item.pageNumber === currentPage
                                    ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 font-bold'
                                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5'
                            }`}
                        >
                            <span className="truncate pr-2">{item.title}</span>
                            {item.pageNumber && (
                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold shrink-0 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                                    p.{item.pageNumber}
                                </span>
                            )}
                        </button>
                        {item.items && item.items.length > 0 && renderOutlineNodes(item.items, depth + 1)}
                    </li>
                ))}
            </ul>
        );
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Mobile Backdrop */}
            <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden animate-fade-in"
                onClick={onClose}
            />

            <aside className="absolute top-12 md:top-14 bottom-0 left-0 w-72 md:w-80 bg-white/95 dark:bg-[#0d0d0e]/95 backdrop-blur-xl border-r border-zinc-200 dark:border-white/10 z-40 flex flex-col shadow-2xl transition-transform duration-300 ease-out animate-fade-in">
                {/* Header & Tab Selector */}
                <div className="p-3 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-white/5 p-0.5 rounded-xl">
                        <button
                            onClick={() => setActiveTab('thumbnails')}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all border-none ${
                                activeTab === 'thumbnails'
                                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                        >
                            Pages ({numPages})
                        </button>
                        <button
                            onClick={() => setActiveTab('outline')}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all border-none ${
                                activeTab === 'outline'
                                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                        >
                            Outline
                        </button>
                        {searchResults.length > 0 && (
                            <button
                                onClick={() => setActiveTab('search')}
                                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all border-none flex items-center gap-1 ${
                                    activeTab === 'search'
                                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                                }`}
                            >
                                <span>Results</span>
                                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-orange-500 text-white font-black">
                                    {searchResults.length}
                                </span>
                            </button>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-all border-none bg-transparent"
                        title="Close Sidebar"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                    {activeTab === 'thumbnails' && (
                        <div className="grid grid-cols-2 gap-2.5">
                            {Array.from({ length: numPages }).map((_, i) => (
                                <PDFThumbnail
                                    key={i}
                                    pageNum={i + 1}
                                    pdfDoc={pdfDoc}
                                    isActive={currentPage === i + 1}
                                    onSelectPage={onJumpToPage}
                                />
                            ))}
                        </div>
                    )}

                    {activeTab === 'outline' && (
                        <div className="py-1">
                            {outline && outline.length > 0 ? (
                                renderOutlineNodes(outline)
                            ) : (
                                <div className="text-center py-12 px-4 space-y-2">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto">
                                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                                        <path d="M6 6h10" />
                                        <path d="M6 10h10" />
                                    </svg>
                                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">No outline available</p>
                                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">This document does not contain embedded chapters or bookmarks.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'search' && (
                        <div className="space-y-2">
                            <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-1">
                                {searchResults.length} matches for "{searchQuery}"
                            </p>
                            {searchResults.map((res, index) => (
                                <button
                                    key={index}
                                    onClick={() => onSelectSearchResult(index)}
                                    className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                                        currentSearchIndex === index
                                            ? 'bg-orange-500/10 border-orange-500/40 text-orange-700 dark:text-orange-300'
                                            : 'bg-zinc-50 dark:bg-white/5 border-zinc-200/50 dark:border-white/5 text-zinc-700 dark:text-zinc-300 hover:border-orange-500/20'
                                    }`}
                                >
                                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                                        <span className="text-orange-600 dark:text-orange-400">Page {res.pageIndex}</span>
                                        <span className="text-[10px] text-zinc-400">Match #{index + 1}</span>
                                    </div>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                                        {searchSnippets[index]?.snippet || `Occurrence on page ${res.pageIndex}`}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};
