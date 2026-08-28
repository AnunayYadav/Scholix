import React, { useState, useEffect, useRef } from 'react';
import { ModernSidebarTab, ModernPDFOutlineItem, ModernBookmark, ModernReadingTheme } from './modernTypes.ts';

interface ModernPDFSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    numPages: number;
    currentPage: number;
    pdfDoc: any;
    outline: ModernPDFOutlineItem[];
    bookmarks: ModernBookmark[];
    readingTheme: ModernReadingTheme;
    onJumpToPage: (page: number) => void;
    onToggleBookmark: (pageNum: number) => void;
}

export const ModernPDFSidebar: React.FC<ModernPDFSidebarProps> = ({
    isOpen,
    onClose,
    numPages,
    currentPage,
    pdfDoc,
    outline,
    bookmarks,
    readingTheme,
    onJumpToPage,
    onToggleBookmark,
}) => {
    const [activeTab, setActiveTab] = useState<'thumbnails' | 'outline' | 'bookmarks'>('thumbnails');
    const [expandedOutlineNodes, setExpandedOutlineNodes] = useState<{ [key: string]: boolean }>({});

    const isLight = readingTheme === 'light';

    const toggleNode = (nodeTitle: string) => {
        setExpandedOutlineNodes(prev => ({ ...prev, [nodeTitle]: !prev[nodeTitle] }));
    };

    const renderOutlineTree = (items: ModernPDFOutlineItem[], depth = 0) => {
        return (
            <div className="flex flex-col space-y-1">
                {items.map((item, idx) => {
                    const hasChildren = item.items && item.items.length > 0;
                    const isExpanded = expandedOutlineNodes[item.title] !== false; // Default open
                    const key = `${item.title}-${idx}-${depth}`;

                    return (
                        <div key={key} className="flex flex-col">
                            <div
                                className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg text-xs transition-all cursor-pointer group ${
                                    item.pageNumber === currentPage
                                        ? 'bg-orange-500/15 text-orange-600 font-bold'
                                        : isLight
                                        ? 'hover:bg-zinc-100 text-zinc-700'
                                        : 'hover:bg-white/5 text-zinc-300'
                                }`}
                                style={{ paddingLeft: `${depth * 14 + 8}px` }}
                                onClick={() => {
                                    if (item.pageNumber) {
                                        onJumpToPage(item.pageNumber);
                                    }
                                }}
                            >
                                {hasChildren ? (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleNode(item.title);
                                        }}
                                        className={`w-4 h-4 flex items-center justify-center rounded border-none bg-transparent ${
                                            isLight ? 'text-zinc-500 hover:text-black' : 'text-zinc-400 hover:text-white'
                                        }`}
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                        >
                                            <path d="M9 18l6-6-6-6" />
                                        </svg>
                                    </button>
                                ) : (
                                    <span className="w-4 h-4 flex items-center justify-center opacity-30">•</span>
                                )}

                                <span className="truncate flex-1 font-medium">{item.title}</span>

                                {item.pageNumber && (
                                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                        isLight
                                            ? 'text-zinc-500 bg-zinc-100'
                                            : 'text-zinc-400 bg-white/5'
                                    }`}>
                                        {item.pageNumber}
                                    </span>
                                )}
                            </div>

                            {hasChildren && isExpanded && item.items && (
                                <div className="mt-0.5">
                                    {renderOutlineTree(item.items, depth + 1)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <>
            {/* Backdrop overlay on mobile */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-xs z-[55] animate-fade-in"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed top-12 md:top-14 bottom-0 left-0 w-72 sm:w-80 border-r z-[60] flex flex-col transition-transform duration-300 ease-out shadow-2xl ${
                    isLight
                        ? 'bg-white text-zinc-900 border-zinc-200'
                        : 'bg-[#0c0c0e] text-zinc-100 border-white/10'
                } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Tab Header Bar */}
                <div className={`flex items-center justify-between p-2.5 border-b ${
                    isLight ? 'border-zinc-200' : 'border-white/5'
                }`}>
                    <div className={`flex items-center gap-1 p-1 rounded-xl flex-1 mr-2 ${
                        isLight ? 'bg-zinc-100' : 'bg-white/5'
                    }`}>
                        <button
                            onClick={() => setActiveTab('thumbnails')}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all border-none flex items-center justify-center gap-1.5 ${
                                activeTab === 'thumbnails'
                                    ? isLight
                                        ? 'bg-white text-zinc-900 shadow-xs'
                                        : 'bg-[#18181b] text-white shadow-xs'
                                    : isLight
                                    ? 'text-zinc-600 hover:text-black'
                                    : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                            title="Pages"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="9" x="14" y="3" rx="1"/><rect width="7" height="9" x="3" y="14" rx="1"/><rect width="7" height="9" x="14" y="14" rx="1"/></svg>
                            <span>Pages</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('outline')}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all border-none flex items-center justify-center gap-1.5 ${
                                activeTab === 'outline'
                                    ? isLight
                                        ? 'bg-white text-zinc-900 shadow-xs'
                                        : 'bg-[#18181b] text-white shadow-xs'
                                    : isLight
                                    ? 'text-zinc-600 hover:text-black'
                                    : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                            title="Table of Contents"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
                            <span>Outline</span>
                            {outline.length > 0 && (
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab('bookmarks')}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all border-none flex items-center justify-center gap-1.5 ${
                                activeTab === 'bookmarks'
                                    ? isLight
                                        ? 'bg-white text-amber-600 shadow-xs'
                                        : 'bg-[#18181b] text-amber-400 shadow-xs'
                                    : isLight
                                    ? 'text-zinc-600 hover:text-amber-600'
                                    : 'text-zinc-400 hover:text-amber-400'
                            }`}
                            title="Bookmarks"
                        >
                            <svg viewBox="0 0 24 24" fill={bookmarks.length > 0 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                            <span>Saved</span>
                            {bookmarks.length > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 text-[9px] font-black">
                                    {bookmarks.length}
                                </span>
                            )}
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all border-none ${
                            isLight
                                ? 'text-zinc-500 hover:text-black hover:bg-zinc-100'
                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                    </button>
                </div>

                {/* Tab Body */}
                <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                    {/* Tab 1: Thumbnails Grid */}
                    {activeTab === 'thumbnails' && (
                        <div className="grid grid-cols-2 gap-3">
                            {Array.from({ length: numPages }).map((_, idx) => {
                                const pageNumber = idx + 1;
                                const isActive = currentPage === pageNumber;
                                const isBookmarked = bookmarks.some(b => b.pageNumber === pageNumber);

                                return (
                                    <div
                                        key={pageNumber}
                                        onClick={() => onJumpToPage(pageNumber)}
                                        className={`group relative flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${
                                            isActive
                                                ? 'bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/20 shadow-md'
                                                : isLight
                                                ? 'bg-zinc-50 border-zinc-200 hover:border-zinc-400'
                                                : 'bg-white/5 border-white/5 hover:border-white/20'
                                        }`}
                                    >
                                        <div className={`relative w-full aspect-[3/4] rounded-lg shadow-xs overflow-hidden flex flex-col items-center justify-center border ${
                                            isLight ? 'bg-white border-zinc-200' : 'bg-[#18181b] border-white/5'
                                        }`}>
                                            {/* Live Mini Preview Canvas or Page Number Silhouette */}
                                            <SidebarThumbnailCanvas
                                                pageNum={pageNumber}
                                                pdfDoc={pdfDoc}
                                            />
                                            {isBookmarked && (
                                                <div className="absolute top-1.5 right-1.5 text-amber-500">
                                                    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-3.5 h-3.5 drop-shadow-xs"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-1.5 flex items-center justify-between w-full px-1">
                                            <span className={`text-[11px] font-bold ${
                                                isActive
                                                    ? 'text-orange-500'
                                                    : isLight
                                                    ? 'text-zinc-700'
                                                    : 'text-zinc-300'
                                            }`}>
                                                Page {pageNumber}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleBookmark(pageNumber);
                                                }}
                                                className={`transition-opacity p-0.5 border-none bg-transparent ${isBookmarked ? 'opacity-100 text-amber-500' : 'opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-amber-500'}`}
                                                title="Bookmark page"
                                            >
                                                <svg viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Tab 2: Document Outline */}
                    {activeTab === 'outline' && (
                        <div>
                            {outline.length > 0 ? (
                                renderOutlineTree(outline)
                            ) : (
                                <div className="text-center py-12 space-y-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${
                                        isLight ? 'bg-zinc-100 text-zinc-400' : 'bg-white/5 text-zinc-400'
                                    }`}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
                                    </div>
                                    <p className={`text-xs font-semibold ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>No outline available in this document</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 3: Bookmarks */}
                    {activeTab === 'bookmarks' && (
                        <div className="space-y-2">
                            {bookmarks.length > 0 ? (
                                <>
                                    <div className={`text-[11px] font-bold uppercase tracking-wider px-1 pb-1 ${
                                        isLight ? 'text-zinc-500' : 'text-zinc-400'
                                    }`}>
                                        Saved Bookmarks ({bookmarks.length})
                                    </div>
                                    {bookmarks.map((bm, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => onJumpToPage(bm.pageNumber)}
                                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group ${
                                                isLight
                                                    ? 'bg-zinc-50 border-zinc-200 hover:border-orange-500/50'
                                                    : 'bg-white/5 border-white/5 hover:border-orange-500/50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-4 h-4 text-amber-500 shrink-0"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                                                <div>
                                                    <h4 className={`text-xs font-bold ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>
                                                        Page {bm.pageNumber}
                                                    </h4>
                                                    {bm.title && (
                                                        <p className={`text-[10px] truncate max-w-[170px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                                            {bm.title}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleBookmark(bm.pageNumber);
                                                }}
                                                className="text-zinc-400 hover:text-red-500 p-1 border-none bg-transparent transition-colors opacity-0 group-hover:opacity-100"
                                                title="Remove bookmark"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                                            </button>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="text-center py-12 space-y-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto text-amber-500 ${
                                        isLight ? 'bg-zinc-100' : 'bg-white/5'
                                    }`}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                                    </div>
                                    <p className={`text-xs font-semibold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>No bookmarks saved yet</p>
                                    <p className="text-[10px] text-zinc-400">Bookmark key pages for quick revision</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

// Lightweight Thumbnail Canvas Component with Lazy Rendering
const SidebarThumbnailCanvas: React.FC<{ pageNum: number; pdfDoc: any }> = ({ pageNum, pdfDoc }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [rendered, setRendered] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible || !pdfDoc || rendered) return;
        let active = true;

        const renderThumb = async () => {
            try {
                const page = await pdfDoc.getPage(pageNum);
                if (!active) return;
                const vp = page.getViewport({ scale: 0.22 });
                const canvas = canvasRef.current;
                if (!canvas) return;
                canvas.width = vp.width;
                canvas.height = vp.height;
                const ctx = canvas.getContext('2d', { alpha: false });
                if (!ctx) return;
                await page.render({ canvasContext: ctx, viewport: vp }).promise;
                if (active) setRendered(true);
            } catch (e) {
                // Ignore cancelled thumb renders
            }
        };

        renderThumb();
        return () => {
            active = false;
        };
    }, [isVisible, pdfDoc, pageNum, rendered]);

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center">
            <canvas ref={canvasRef} className="max-w-full max-h-full object-contain pointer-events-none" />
            {!rendered && (
                <span className="text-[11px] font-bold text-zinc-400">
                    {pageNum}
                </span>
            )}
        </div>
    );
};
