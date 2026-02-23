import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { UserProfile } from '../types.ts';
import { showToast } from './Toast.tsx';

interface PDFViewerProps {
    url: string;
    onClose: () => void;
    fileName: string;
    userProfile?: UserProfile | null;
}

interface SearchResult {
    pageIndex: number;
    matchIndex: number;
    totalMatchesInPage: number;
}

// Move PageRenderer outside to prevent recreation on every parent render
const PageRenderer = React.memo<{
    pageNum: number;
    pdfDoc: any;
    renderScale: number;
    scale: number;
    userProfile: UserProfile | null | undefined;
    searchQuery: string;
    currentSearchIndex: number;
    searchResults: SearchResult[];
    pdfjsLib: any;
    registerRef: (pageNum: number, el: HTMLDivElement | null) => void;
}>(({ pageNum, pdfDoc, renderScale, scale, userProfile, searchQuery, currentSearchIndex, searchResults, pdfjsLib, registerRef }) => {

    const containerRef = useRef<HTMLDivElement>(null);
    const [renderTarget, setRenderTarget] = useState<{
        activeCanvas: 'A' | 'B';
        renderedScale: number;
    }>({ activeCanvas: 'A', renderedScale: 0 });

    const canvasARef = useRef<HTMLCanvasElement>(null);
    const canvasBRef = useRef<HTMLCanvasElement>(null);
    const textLayerRef = useRef<HTMLDivElement>(null);
    const renderTaskRef = useRef<any>(null);
    const [pageInfo, setPageInfo] = useState<{ width: number; height: number } | null>(null);

    useEffect(() => {
        const render = async () => {
            const targetId = renderTarget.activeCanvas === 'A' ? 'B' : 'A';
            const targetCanvas = targetId === 'A' ? canvasARef.current : canvasBRef.current;
            if (!pdfDoc || !targetCanvas || !textLayerRef.current || !pdfjsLib) return;

            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
            }

            try {
                const page = await pdfDoc.getPage(pageNum);
                const pixelRatio = window.devicePixelRatio || 1;
                const baseViewport = page.getViewport({ scale: 1.0 });
                setPageInfo({ width: baseViewport.width, height: baseViewport.height });

                const viewport = page.getViewport({ scale: renderScale * pixelRatio });
                const cssViewport = page.getViewport({ scale: renderScale });

                targetCanvas.height = viewport.height;
                targetCanvas.width = viewport.width;
                targetCanvas.style.width = `${cssViewport.width}px`;
                targetCanvas.style.height = `${cssViewport.height}px`;

                const context = targetCanvas.getContext('2d', { alpha: false });
                if (!context) return;

                renderTaskRef.current = page.render({
                    canvasContext: context,
                    viewport: viewport,
                });

                await renderTaskRef.current.promise;

                setRenderTarget({
                    activeCanvas: targetId,
                    renderedScale: renderScale
                });

                textLayerRef.current.innerHTML = '';
                const textContent = await page.getTextContent();
                await pdfjsLib.renderTextLayer({
                    textContent: textContent,
                    container: textLayerRef.current,
                    viewport: cssViewport,
                    textDivs: []
                }).promise;

                if (searchQuery.trim()) {
                    const spans = textLayerRef.current.querySelectorAll('span');
                    const query = searchQuery.toLowerCase();
                    spans.forEach(span => {
                        if (span.textContent?.toLowerCase().includes(query)) {
                            span.classList.add('search-match');
                        }
                    });
                }
            } catch (err: any) {
                if (err.name !== 'RenderingCancelledException') {
                    console.error('Page render error:', err);
                }
            }
        };

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    render();
                }
            },
            { threshold: 0.1 }
        );

        if (containerRef.current) observer.observe(containerRef.current);

        return () => {
            observer.disconnect();
            if (renderTaskRef.current) renderTaskRef.current.cancel();
        };
    }, [renderScale, pageNum, pdfDoc, pdfjsLib]);

    // Independent search highlighting effect to prevent full re-renders
    useEffect(() => {
        if (!textLayerRef.current) return;

        // Optimized reset: only remove our marks to preserve PDF.js structure
        const marks = textLayerRef.current.querySelectorAll('mark.pdf-search-match');
        marks.forEach(mark => {
            const textNode = document.createTextNode(mark.textContent || '');
            mark.parentNode?.replaceChild(textNode, mark);
        });
        textLayerRef.current.normalize();

        if (!searchQuery.trim()) return;

        const spans = textLayerRef.current.querySelectorAll('span');
        const query = searchQuery.trim().toLowerCase();
        const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');

        const activeResult = searchResults[currentSearchIndex];
        const isActivePage = activeResult?.pageIndex === pageNum;

        let globalMatchCount = 0;

        spans.forEach(span => {
            const originalText = span.textContent || '';
            if (originalText.toLowerCase().includes(query)) {
                // Replace text with mark tags
                span.innerHTML = originalText.replace(regex, (match) => {
                    const isCurrent = isActivePage && globalMatchCount === activeResult.matchIndex;
                    globalMatchCount++;
                    return `<mark class="pdf-search-match ${isCurrent ? 'active-match' : ''}">${match}</mark>`;
                });
            }
        });

        // Scroll active match into view if it's on this page
        if (isActivePage) {
            const activeEl = textLayerRef.current.querySelector('.active-match');
            if (activeEl) {
                activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [searchQuery, currentSearchIndex, searchResults, pageNum, renderTarget.renderedScale]);

    const currentScaleFactor = renderTarget.renderedScale > 0 ? scale / renderTarget.renderedScale : 1;

    return (
        <div
            ref={el => {
                (containerRef as any).current = el;
                registerRef(pageNum, el);
            }}
            data-page={pageNum}
            className="relative mb-6 bg-white dark:bg-[#0a0a0a] shadow-[0_32px_128px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_128px_rgba(0,0,0,0.5)] rounded-md origin-top-left select-none border border-slate-200 dark:border-white/5 overflow-visible snap-start snap-always"
            style={{
                width: pageInfo ? `${pageInfo.width * scale}px` : 'fit-content',
                height: pageInfo ? `${pageInfo.height * scale}px` : '400px',
                willChange: 'transform'
            }}
        >
            <div
                style={{
                    transform: `scale(${currentScaleFactor}) translateZ(0)`,
                    transformOrigin: 'top left',
                    width: 'fit-content'
                }}
            >
                <canvas
                    ref={canvasARef}
                    className={`block rounded-md shadow-inner ${renderTarget.activeCanvas === 'A' ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-0 z-0'}`}
                    style={{ backfaceVisibility: 'hidden', pointerEvents: 'none' }}
                />
                <canvas
                    ref={canvasBRef}
                    className={`block rounded-md shadow-inner ${renderTarget.activeCanvas === 'B' ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-0 z-0'}`}
                    style={{ backfaceVisibility: 'hidden', pointerEvents: 'none' }}
                />

                <div ref={textLayerRef} className="textLayer absolute inset-0 opacity-20 pointer-events-none select-text z-20" />

                {/* Dynamic Watermark */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.06] flex items-center justify-center overflow-hidden flex-wrap select-none p-10 z-30">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <span key={i} className="text-[35px] font-black uppercase rotate-[-35deg] whitespace-nowrap m-16 text-black/10 dark:text-black tracking-widest">
                            LPU NEXUS
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
});

const PDFViewer: React.FC<PDFViewerProps> = ({ url, onClose, fileName, userProfile }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pdfDoc, setPdfDoc] = useState<any>(null);
    const [pdfjsLibState, setPdfjsLibState] = useState<any>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [renderScale, setRenderScale] = useState(scale);

    // Touch/Pinch State
    const touchState = useRef<{
        lastDist: number;
        lastTap: number;
        lastTapX: number;
        lastTapY: number;
        isPinching: boolean;
        wasScrolling: boolean;
    }>({
        lastDist: 0,
        lastTap: 0,
        lastTapX: 0,
        lastTapY: 0,
        isPinching: false,
        wasScrolling: false
    });

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
    const [isSearching, setIsSearching] = useState(false);
    const [viewMode, setViewMode] = useState<'width' | 'page'>('width');

    const pdfDocRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

    // Track visible pages for current page indicator
    const visiblePages = useRef<Set<number>>(new Set());

    const isAdmin = userProfile?.is_admin || false;
    const currentPageRef = useRef(1);

    useEffect(() => {
        currentPageRef.current = currentPage;
    }, [currentPage]);

    // Load PDF.js from CDN
    useEffect(() => {
        document.body.style.overflow = 'hidden';

        const loadPdfJs = async () => {
            if (!(window as any).pdfjsLib) {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
                script.onload = () => initPdf();
                document.head.appendChild(script);
            } else {
                initPdf();
            }
        };

        const initPdf = async () => {
            const pdfjsLib = (window as any).pdfjsLib;
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            setPdfjsLibState(pdfjsLib);

            try {
                setIsLoading(true);
                const loadingTask = pdfjsLib.getDocument(url);
                const pdf = await loadingTask.promise;
                pdfDocRef.current = pdf;
                setPdfDoc(pdf);
                setNumPages(pdf.numPages);

                // Get first page to calculate initial scale
                const firstPage = await pdf.getPage(1);
                const originalViewport = firstPage.getViewport({ scale: 1.0 });
                const containerWidth = containerRef.current?.clientWidth || window.innerWidth;

                // Set default scale based on device
                if (window.innerWidth < 768) {
                    // Mobile: default to page-width (with 20px padding)
                    const pageWidthScale = (window.innerWidth - 40) / originalViewport.width;
                    setScale(pageWidthScale);
                } else {
                    setScale(1.0);
                }

                setIsLoading(false);
            } catch (err: any) {
                console.error('Error loading PDF:', err);
                setError('Failed to load document. The encryption handshake failed.');
                setIsLoading(false);
            }
        };

        loadPdfJs();

        // Security: Disable Right Click & Print
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's')) {
                if (!isAdmin) e.preventDefault();
            }
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                jumpToPage(Math.min(currentPageRef.current + 1, numPages));
            }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                jumpToPage(Math.max(currentPageRef.current - 1, 1));
            }
        };

        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [url, isAdmin, numPages]);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                // Potential auto-adjust logic here
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fitToWidth = async () => {
        if (!pdfDocRef.current) return;
        const page = await pdfDocRef.current.getPage(1);
        const originalViewport = page.getViewport({ scale: 1.0 });
        const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
        const padding = window.innerWidth < 768 ? 20 : 120; // More padding for desktop centering
        const newScale = (containerWidth - padding) / originalViewport.width;
        setScale(newScale);
        setViewMode('page'); // Next click will fit to page
    };

    const fitToPage = async () => {
        if (!pdfDocRef.current) return;
        const page = await pdfDocRef.current.getPage(1);
        const originalViewport = page.getViewport({ scale: 1.0 });
        const containerHeight = containerRef.current?.clientHeight || window.innerHeight;
        // Subtract toolbar (80px) and padding (80px)
        const availableHeight = containerHeight - 160;
        const newScale = availableHeight / originalViewport.height;
        setScale(newScale);
        setViewMode('width'); // Next click will fit to width
    };

    const toggleFit = () => {
        if (viewMode === 'width') {
            fitToWidth();
        } else {
            fitToPage();
        }
    };

    // Debounce scale updates for high-quality render to prevent flicker
    useEffect(() => {
        const timer = setTimeout(() => {
            setRenderScale(scale);
        }, 300);
        return () => clearTimeout(timer);
    }, [scale]);

    // Trackpad / Wheel Support
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                // Pinch to zoom or Ctrl+Wheel
                e.preventDefault();
                setScale(prev => {
                    const delta = -e.deltaY * 0.005; // Finer control for trackpad
                    const next = prev + delta;
                    return Math.min(Math.max(0.3, next), 4);
                });
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, []);

    // Gesture Handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            touchState.current.isPinching = true;
            touchState.current.lastDist = Math.hypot(
                Number(touch1.pageX) - Number(touch2.pageX),
                Number(touch1.pageY) - Number(touch2.pageY)
            );
        } else if (e.touches.length === 1) {
            const touch = e.touches[0];
            const now = Number(Date.now());
            const lastTap = touchState.current.lastTap;
            const lastTapX = touchState.current.lastTapX;
            const lastTapY = touchState.current.lastTapY;

            // Check if this is a double tap (within 300ms and 30px distance)
            const dist = Math.hypot(touch.pageX - lastTapX, touch.pageY - lastTapY);

            if (now - lastTap < 300 && dist < 30) {
                // Double tap detected
                setScale(prev => prev > 1.2 ? 1.0 : 2.0);
                // Reset to prevent any accidental triple-tap behavior
                touchState.current.lastTap = 0;
            } else {
                touchState.current.lastTap = now;
            }

            touchState.current.lastTapX = touch.pageX;
            touchState.current.lastTapY = touch.pageY;
            touchState.current.wasScrolling = false;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchState.current.isPinching && e.touches.length === 2) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const dist = Math.hypot(
                Number(touch1.pageX) - Number(touch2.pageX),
                Number(touch1.pageY) - Number(touch2.pageY)
            );
            const delta = Number(dist) - Number(touchState.current.lastDist);

            if (Math.abs(delta) > 10) {
                setScale(prev => {
                    const next = prev + (delta > 0 ? 0.05 : -0.05);
                    return Math.min(Math.max(0.3, next), 4);
                });
                touchState.current.lastDist = dist;
            }
        } else if (e.touches.length === 1) {
            touchState.current.wasScrolling = true;
        }
    };

    const handleTouchEnd = () => {
        // If the user was scrolling, the current tap shouldn't count towards a double-tap zoom
        if (touchState.current.wasScrolling) {
            touchState.current.lastTap = 0;
        }
        touchState.current.isPinching = false;
        touchState.current.lastDist = 0;
    };

    // Intersection Observer for lazy loading and current page tracking
    useEffect(() => {
        if (!numPages) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const pageNum = parseInt(entry.target.getAttribute('data-page') || '0');
                    if (entry.isIntersecting) {
                        visiblePages.current.add(pageNum);
                    } else {
                        visiblePages.current.delete(pageNum);
                    }
                });

                if (visiblePages.current.size > 0) {
                    const sorted = Array.from(visiblePages.current).sort((a: number, b: number) => a - b);
                    setCurrentPage(sorted[0]);
                }
            },
            { threshold: 0.1 } // More lenient threshold for better tracking
        );

        // Clear existing observations
        const currentRefs = pageRefs.current;
        Object.values(currentRefs).forEach(ref => {
            if (ref) observer.observe(ref as Element);
        });

        return () => observer.disconnect();
    }, [numPages, isLoading, pdfDoc, scale]); // Added scale to re-calculate when zoomed

    const jumpToPage = (pageNum: number) => {
        const target = pageRefs.current[pageNum];
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                showToast(`Error attempting to enable full-screen mode: ${err.message}`, 'error');
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Search Implementation
    const performSearch = async () => {
        if (!searchQuery.trim() || !pdfDocRef.current) {
            setSearchResults([]);
            setCurrentSearchIndex(-1);
            return;
        }

        setIsSearching(true);
        const results: SearchResult[] = [];
        const query = searchQuery.toLowerCase();

        for (let i = 1; i <= numPages; i++) {
            const page = await pdfDocRef.current.getPage(i);
            const textContent = await page.getTextContent();

            // Search within individual items for more precise match counting per span
            let pageMatchCount = 0;
            textContent.items.forEach((item: any) => {
                const str = item.str.toLowerCase();
                let pos = str.indexOf(query);
                while (pos !== -1) {
                    results.push({
                        pageIndex: i,
                        matchIndex: pageMatchCount,
                        totalMatchesInPage: 0
                    });
                    pageMatchCount++;
                    pos = str.indexOf(query, pos + 1);
                }
            });
        }


        setSearchResults(results);
        setIsSearching(false);
        if (results.length > 0) {
            setCurrentSearchIndex(0);
            jumpToPage(results[0].pageIndex);
        } else {
            setCurrentSearchIndex(-1);
        }
    };

    const nextSearch = () => {
        if (searchResults.length === 0) return;
        const next = (currentSearchIndex + 1) % searchResults.length;
        setCurrentSearchIndex(next);
        jumpToPage(searchResults[next].pageIndex);
    };

    const prevSearch = () => {
        if (searchResults.length === 0) return;
        const prev = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
        setCurrentSearchIndex(prev);
        jumpToPage(searchResults[prev].pageIndex);
    };

    // Download Functionality
    const handleDownload = async () => {
        if (!isAdmin) return;
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            showToast('Download failed. Protocol interrupted.', 'error');
        }
    };

    // Thumbnail Renderer Removed

    if (error) {
        return createPortal(
            <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center p-6">
                <div className="text-center space-y-6 max-w-sm">
                    <div className="w-20 h-20 bg-red-500/10 rounded-[40px] flex items-center justify-center text-red-500 border border-red-500/20 mx-auto">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-10 h-10"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Connection Fault</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">{error}</p>
                    <button onClick={onClose} className="bg-white text-black px-10 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">Abort Protocol</button>
                </div>
            </div>,
            document.body
        );
    }

    return createPortal(
        <div className={`fixed inset-0 z-[9999] flex flex-col bg-slate-100 dark:bg-[#050505] animate-fade-in overflow-hidden ${isFullscreen ? 'p-0' : ''}`}>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 md:px-6 h-16 md:h-20 bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5 z-50">
                <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-slate-200 dark:bg-white/5 hover:bg-orange-600 text-slate-600 dark:text-white transition-all border-none group"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="hidden sm:block truncate">
                        <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate max-w-[200px]">{fileName}</h3>
                        <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest leading-none mt-1">LPU Nexus Secure Protocol</p>
                    </div>
                </div>

                {/* Center: Search & Zoom */}
                <div className="flex items-center gap-2 md:gap-6">
                    {/* Search Bar */}
                    <div className="hidden sm:flex items-center bg-slate-200 dark:bg-white/5 rounded-2xl border border-slate-300 dark:border-white/10 px-3 py-1.5 focus-within:border-orange-600 transition-all group">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-slate-400 dark:text-white/30 group-focus-within:text-orange-500"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        <input
                            type="text"
                            placeholder="Find..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && performSearch()}
                            autoCapitalize="none"
                            autoCorrect="off"
                            autoComplete="off"
                            spellCheck="false"
                            className="bg-transparent border-none outline-none text-[11px] font-bold text-slate-900 dark:text-white px-2 w-24 md:w-32 placeholder:text-slate-400 dark:placeholder:text-white/20"
                        />
                        {searchResults.length > 0 && (
                            <div className="flex items-center gap-2 pr-2">
                                <span className="text-[9px] font-black text-orange-500 whitespace-nowrap">{currentSearchIndex + 1} / {searchResults.length}</span>
                                <div className="h-4 w-px bg-slate-300 dark:bg-white/10 mx-1" />
                                <button onClick={prevSearch} className="text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white border-none bg-transparent active:scale-90"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-3 h-3"><path d="m15 18-6-6 6-6" /></svg></button>
                                <button onClick={nextSearch} className="text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white border-none bg-transparent active:scale-90"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-3 h-3"><path d="m9 18 6-6-6-6" /></svg></button>
                            </div>
                        )}
                    </div>

                    {/* Scale Controls */}
                    <div className="flex items-center gap-1 bg-slate-200 dark:bg-white/5 rounded-2xl p-1 border border-slate-300 dark:border-white/10">
                        <button
                            onClick={() => setScale(prev => Math.max(0.2, prev - 0.1))}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-white/10 transition-all border-none bg-transparent"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        </button>
                        <span className="text-[10px] font-black text-slate-900 dark:text-white px-2 min-w-[50px] text-center">{Math.round(scale * 100)}%</span>
                        <button
                            onClick={() => setScale(prev => Math.min(3, prev + 0.1))}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-white/10 transition-all border-none bg-transparent"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        </button>

                        <button
                            onClick={toggleFit}
                            className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-300/50 dark:bg-white/5 text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-orange-600 transition-all border-none"
                            title={viewMode === 'width' ? "Fit to Width" : "Fit to Page"}
                        >
                            {viewMode === 'width' ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                    <path d="M2 12h20" />
                                    <path d="M7 7l-5 5 5 5" />
                                    <path d="M17 7l5 5-5 5" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                    <path d="M8 3H5a2 2 0 0 0-2 2v3m14 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                                </svg>
                            )}
                        </button>

                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl px-4 py-3 gap-3">
                        <input
                            type="number"
                            min={1}
                            max={numPages}
                            value={currentPage}
                            onChange={e => jumpToPage(parseInt(e.target.value) || 1)}
                            className="w-10 bg-transparent border-none outline-none text-center text-[10px] font-black text-slate-900 dark:text-white"
                        />
                        <span className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-widest">/ {numPages}</span>
                    </div>

                    <button
                        onClick={toggleFullscreen}
                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-200 dark:bg-white/5 text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white border-none group"
                        title="Toggle Fullscreen"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 group-hover:scale-110 transition-transform"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
                    </button>

                    {isAdmin && (
                        <button
                            onClick={handleDownload}
                            className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-600 text-white border-none hover:scale-110 active:scale-95 transition-all shadow-lg shadow-orange-600/20"
                            title="Download PDF"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Wrapper (Must be flex to allow main to fill) */}
            <div className="flex-1 overflow-hidden relative flex flex-col">

                <main
                    ref={containerRef}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className="flex-1 overflow-y-auto overflow-x-auto bg-slate-100 dark:bg-[#0a0a0a] relative flex flex-col items-center py-12 px-4 md:px-0 select-none scroll-smooth touch-pan-x touch-pan-y"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    {isLoading ? (
                        <div className="flex flex-col items-center w-full max-w-4xl px-4 space-y-8">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="w-full bg-slate-200 dark:bg-white/5 rounded-xl aspect-[1/1.4] animate-pulse relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-300/20 dark:via-white/5 to-transparent shimmer-effect" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center min-w-max mx-auto scroll-smooth">
                            {Array.from({ length: numPages }).map((_, i) => (
                                <PageRenderer
                                    key={i}
                                    pageNum={i + 1}
                                    pdfDoc={pdfDoc}
                                    renderScale={renderScale}
                                    scale={scale}
                                    userProfile={userProfile}
                                    searchQuery={searchQuery}
                                    currentSearchIndex={currentSearchIndex}
                                    searchResults={searchResults}
                                    pdfjsLib={pdfjsLibState}
                                    registerRef={(pageNum, el) => {
                                        pageRefs.current[pageNum] = el;
                                    }}
                                />

                            ))}
                        </div>
                    )}
                </main>

                {/* Floating Page Indicator (Mobile) */}
                <div className="md:hidden fixed bottom-10 right-8 z-50 bg-orange-600 text-white px-4 py-2 rounded-full font-black text-[10px] shadow-2xl animate-fade-in uppercase tracking-widest border border-orange-400/20">
                    {currentPage} / {numPages}
                </div>
            </div>

            <style>{`
                .textLayer {
                    position: absolute;
                    left: 0;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    overflow: hidden;
                    line-height: 1;
                    user-select: none;
                    pointer-events: none;
                }
                .textLayer > span {
                    color: transparent;
                    position: absolute;
                    white-space: pre;
                    cursor: text;
                    transform-origin: 0% 0%;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

                /* Fullscreen cleanup */
                :fullscreen .Toolbar { display: none; }
                
                .textLayer > span.search-match {
                    background-color: rgba(234, 88, 12, 0.4);
                    border-radius: 2px;
                    box-shadow: 0 0 10px rgba(234, 88, 12, 0.2);
                    color: white;
                }

                mark.pdf-search-match {
                    background-color: rgba(234, 88, 12, 0.3);
                    color: transparent;
                    border-radius: 1px;
                    transition: background 0.2s ease;
                }

                mark.pdf-search-match.active-match {
                    background-color: #ea580c;
                    color: transparent;
                    box-shadow: 0 0 15px rgba(234, 88, 12, 0.4);
                    z-index: 10;
                }
                
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .shimmer-effect {
                    animation: shimmer 2s infinite linear;
                    background-size: 200% 100%;
                }

                @keyframes shimmer {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(100%); }
                }
            `}</style>
        </div >,
        document.body
    );
};

export default PDFViewer;
