import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { PDFDocument } from 'pdf-lib';
import { UserProfile } from '../types.ts';
import { showToast } from './Toast.tsx';
import NexusServer from '../services/nexusServer.ts';
import { useUniversity } from '../hooks/useUniversity.tsx';
import './PDFViewer.css';

// ---- Interfaces ----

interface PDFViewerProps {
    url: string;
    onClose: () => void;
    fileName: string;
    userProfile?: UserProfile | null;
}

interface SearchResult {
    pageIndex: number;
    matchIndex: number;
}

// ---- Wait for PDF.js (loaded via CDN in index.html) ----

const waitForPdfJs = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (window.pdfjsLib) {
            resolve(window.pdfjsLib);
            return;
        }
        const onReady = () => resolve(window.pdfjsLib);
        window.addEventListener('pdfjsReady', onReady, { once: true });
        setTimeout(() => {
            window.removeEventListener('pdfjsReady', onReady);
            if (window.pdfjsLib) {
                resolve(window.pdfjsLib);
            } else {
                reject(new Error('PDF.js failed to load. Please refresh the page.'));
            }
        }, 15000);
    });
};

// ---- PageRenderer (Single Canvas, No Dual Buffering) ----

const PageRenderer = React.memo<{
    pageNum: number;
    pdfDoc: any;
    renderScale: number;
    baseDimensions: { width: number; height: number };
    searchQuery: string;
    currentSearchIndex: number;
    searchResults: SearchResult[];
    pdfjsLib: any;
    registerRef: (pageNum: number, el: HTMLDivElement | null) => void;
    isInteractingRef: React.MutableRefObject<boolean>;
    brandName: string;
}>(({ pageNum, pdfDoc, renderScale, baseDimensions, searchQuery, currentSearchIndex, searchResults, pdfjsLib, registerRef, isInteractingRef, brandName }) => {

    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const textLayerRef = useRef<HTMLDivElement>(null);
    const renderTaskRef = useRef<any>(null);
    const [pageInfo, setPageInfo] = useState(baseDimensions);
    const [renderedScale, setRenderedScale] = useState(renderScale);

    // Canvas render effect — fires on mount and when renderScale changes
    useEffect(() => {
        let cancelled = false;

        const render = async () => {
            if (isInteractingRef.current) return;
            const canvas = canvasRef.current;
            if (!pdfDoc || !canvas || !textLayerRef.current || !pdfjsLib) return;

            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
            }

            try {
                const page = await pdfDoc.getPage(pageNum);
                if (cancelled) return;

                const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
                const baseViewport = page.getViewport({ scale: 1.0 });
                setPageInfo({ width: baseViewport.width, height: baseViewport.height });

                const clampedScale = Math.min(renderScale, 2.5);
                const viewport = page.getViewport({ scale: clampedScale * pixelRatio });
                const cssViewport = page.getViewport({ scale: renderScale });

                canvas.height = viewport.height;
                canvas.width = viewport.width;
                canvas.style.width = `${cssViewport.width}px`;
                canvas.style.height = `${cssViewport.height}px`;

                const context = canvas.getContext('2d', { alpha: false });
                if (!context) return;

                renderTaskRef.current = page.render({
                    canvasContext: context,
                    viewport: viewport,
                });

                await renderTaskRef.current.promise;
                if (cancelled) return;

                setRenderedScale(renderScale);

                // Rebuild text layer
                const textContainer = textLayerRef.current;
                if (!textContainer) return;
                while (textContainer.firstChild) textContainer.removeChild(textContainer.firstChild);

                const textContent = await page.getTextContent();
                if (cancelled) return;

                // PDF.js v5+ TextLayer class API
                if (pdfjsLib.TextLayer) {
                    const tl = new pdfjsLib.TextLayer({
                        textContentSource: textContent,
                        container: textContainer,
                        viewport: cssViewport,
                    });
                    await tl.render();
                }
                // v3/v4 fallback: renderTextLayer function
                else if (pdfjsLib.renderTextLayer) {
                    await pdfjsLib.renderTextLayer({
                        textContent,
                        container: textContainer,
                        viewport: cssViewport,
                        textDivs: []
                    }).promise;
                }
            } catch (err: any) {
                if (err.name !== 'RenderingCancelledException') {
                    console.error('Page render error:', err);
                }
            }
        };

        render();

        return () => {
            cancelled = true;
            if (renderTaskRef.current) renderTaskRef.current.cancel();
        };
    }, [renderScale, pageNum, pdfDoc, pdfjsLib]);

    // Search highlighting effect
    useEffect(() => {
        if (isInteractingRef.current || !textLayerRef.current) return;

        // Clear existing marks
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
                const fragment = document.createDocumentFragment();
                let lastIndex = 0;
                let match: RegExpExecArray | null;
                const safeRegex = new RegExp(regex.source, regex.flags);
                while ((match = safeRegex.exec(originalText)) !== null) {
                    if (match.index > lastIndex) {
                        fragment.appendChild(document.createTextNode(originalText.slice(lastIndex, match.index)));
                    }
                    const mark = document.createElement('mark');
                    mark.className = `pdf-search-match ${isActivePage && globalMatchCount === activeResult?.matchIndex ? 'active-match' : ''}`;
                    mark.textContent = match[0];
                    fragment.appendChild(mark);
                    globalMatchCount++;
                    lastIndex = match.index + match[0].length;
                }
                if (lastIndex < originalText.length) {
                    fragment.appendChild(document.createTextNode(originalText.slice(lastIndex)));
                }
                span.textContent = '';
                span.appendChild(fragment);
            }
        });
    }, [searchQuery, currentSearchIndex, searchResults, pageNum, renderScale]);

    // Scroll to active search match
    const lastScrollMatchRef = useRef<number>(-1);
    useEffect(() => {
        if (currentSearchIndex !== lastScrollMatchRef.current && textLayerRef.current) {
            const activeResult = searchResults[currentSearchIndex];
            if (activeResult?.pageIndex === pageNum) {
                const activeEl = textLayerRef.current.querySelector('.active-match');
                if (activeEl) {
                    activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    lastScrollMatchRef.current = currentSearchIndex;
                }
            }
        }
    }, [currentSearchIndex, searchResults, pageNum]);

    return (
        <div
            ref={el => {
                if (el) {
                    containerRef.current = el;
                    registerRef(pageNum, el);
                }
            }}
            data-page={pageNum}
            className="relative bg-white dark:bg-[#0a0a0a] rounded-md origin-top-left select-none border border-zinc-200 dark:border-white/5 overflow-visible page-container"
            style={{
                width: `calc(${pageInfo.width}px * var(--pdf-scale, 1))`,
                height: `calc(${pageInfo.height}px * var(--pdf-scale, 1))`,
                marginBottom: `calc(24px * var(--pdf-scale, 1))`,
                contain: 'layout size',
            }}
        >
            <div className="absolute inset-0 overflow-hidden rounded-md">
                {/* Single Canvas — no dual A/B buffering */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 block rounded-md"
                    style={{
                        backfaceVisibility: 'hidden',
                        pointerEvents: 'none',
                        transform: `scale(calc(var(--pdf-scale, 1) / ${renderedScale})) translateZ(0)`,
                        transformOrigin: 'top left',
                        width: `${pageInfo.width * renderedScale}px`,
                        height: `${pageInfo.height * renderedScale}px`,
                    }}
                />

                {/* Text layer — CSS-scaled during zoom, rebuilt on settle */}
                <div
                    ref={textLayerRef}
                    className="textLayer absolute inset-0 pointer-events-none select-text z-20 opacity-20"
                    style={{
                        transform: `scale(calc(var(--pdf-scale, 1) / ${renderedScale}))`,
                        transformOrigin: 'top left',
                    }}
                />

                {/* Watermark — explicit color instead of currentColor */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.03] select-none z-30"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' transform='rotate(-35 150 150)' fill='%23666666' font-family='Inter, sans-serif' font-weight='700' font-size='32'%3E${brandName.toUpperCase()}%3C/text%3E%3C/svg%3E")`,
                        backgroundRepeat: 'repeat',
                        backgroundSize: '300px 300px',
                    }}
                />
            </div>
        </div>
    );
});

// ---- Main PDFViewer Component ----

const PDFViewer: React.FC<PDFViewerProps> = ({ url, onClose, fileName, userProfile }) => {
    const { fullBrandName } = useUniversity();

    // ---- State ----
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [isLoading, setIsLoading] = useState(true);
    const [loadProgress, setLoadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [pdfDoc, setPdfDoc] = useState<any>(null);
    const [pdfjsLibState, setPdfjsLibState] = useState<any>(null);
    const [isPrintBlocked, setIsPrintBlocked] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [renderScale, setRenderScale] = useState(scale);
    const [isClosing, setIsClosing] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
    const [showToolbar, setShowToolbar] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
    const [isSearching, setIsSearching] = useState(false);
    const [viewMode, setViewMode] = useState<'width' | 'page'>('width');
    const [baseDimensions, setBaseDimensions] = useState({ width: 595, height: 842 }); // A4 default

    const isAdmin = userProfile?.is_admin || false;

    // ---- Refs ----
    const pdfDocRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
    const visiblePages = useRef<Set<number>>(new Set());
    const currentPageRef = useRef(1);
    const scaleRef = useRef(scale);
    const numPagesRef = useRef(0);
    const isInteractingRef = useRef(false);
    const zoomTimeoutRef = useRef<any>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const lastScrollYRef = useRef(0);
    const searchInputRef = useRef<HTMLInputElement>(null);

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

    // Keep refs in sync
    useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);
    useEffect(() => { numPagesRef.current = numPages; }, [numPages]);

    // ---- Close Animation ----
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 250);
    };

    // ---- Theme Toggle ----
    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        if (newTheme) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    // ---- Toolbar Auto-Hide on Scroll ----
    const handleScroll = (e: React.UIEvent<HTMLElement>) => {
        const currentScrollY = e.currentTarget.scrollTop;
        if (currentScrollY > lastScrollYRef.current + 20) {
            setShowToolbar(false);
        } else if (currentScrollY < lastScrollYRef.current - 20 || currentScrollY < 50) {
            setShowToolbar(true);
        }
        lastScrollYRef.current = currentScrollY;
    };

    // ---- Zoom Pipeline (Single 150ms Debounce) ----
    const updateDOMScale = useCallback((currentScale: number, scrollLeft?: number, scrollTop?: number) => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        container.style.setProperty('--pdf-scale', currentScale.toString());
        if (scrollLeft !== undefined) container.scrollLeft = scrollLeft;
        if (scrollTop !== undefined) container.scrollTop = scrollTop;

        // Single debounce — sync to React state and trigger re-render after 150ms
        if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
        zoomTimeoutRef.current = setTimeout(() => {
            isInteractingRef.current = false;
            if (containerRef.current) {
                containerRef.current.classList.remove('is-zooming');
            }
            setScale(currentScale);
            setRenderScale(currentScale);

            // Sync current page after interaction
            if (visiblePages.current.size > 0) {
                const sorted = Array.from(visiblePages.current).sort((a: number, b: number) => a - b);
                setCurrentPage(sorted[0]);
            }
        }, 150);
    }, []);

    const handleZoom = useCallback((nextScale: number) => {
        const container = containerRef.current;
        if (!container) return;
        if (nextScale === scaleRef.current) return;

        isInteractingRef.current = true;
        container.classList.add('is-zooming');

        const rect = container.getBoundingClientRect();
        const focalX = rect.width / 2;
        const focalY = rect.height / 2;
        const ratio = nextScale / scaleRef.current;

        const nextLeft = (container.scrollLeft + focalX) * ratio - focalX;
        const nextTop = (container.scrollTop + focalY) * ratio - focalY;

        scaleRef.current = nextScale;
        updateDOMScale(nextScale, nextLeft, nextTop);
    }, [updateDOMScale]);

    // ---- Page Ref Registration ----
    const registerPageRef = useCallback((pageNum: number, el: HTMLDivElement | null) => {
        pageRefs.current[pageNum] = el;
        if (el && observerRef.current) {
            observerRef.current.observe(el);
        }
    }, []);

    // ---- PDF.js Loading (Single Load Point — No Script Injection) ----
    useEffect(() => {
        document.body.style.overflow = 'hidden';

        const loadPdf = async () => {
            try {
                setIsLoading(true);
                setLoadProgress(0);

                // Wait for PDF.js to be available (loaded via CDN in index.html)
                const pdfjsLib = await waitForPdfJs();
                setPdfjsLibState(pdfjsLib);

                // Fetch PDF as binary data with authentication
                const { data: { session } } = await NexusServer.getSession();

                const headers: Record<string, string> = {};
                if (session?.access_token) {
                    headers['Authorization'] = `Bearer ${session.access_token}`;
                }

                const response = await fetch(url, { headers });
                if (!response.ok) throw new Error('Failed to load document. Please check your connection.');

                // Stream-based download with progress tracking
                const contentLength = response.headers.get('content-length');
                const total = contentLength ? parseInt(contentLength, 10) : 0;
                const reader = response.body?.getReader();

                let data: Uint8Array;
                if (reader && total > 0) {
                    const chunks: Uint8Array[] = [];
                    let received = 0;
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        chunks.push(value);
                        received += value.length;
                        setLoadProgress(Math.min(Math.round((received / total) * 95), 95));
                    }
                    const combined = new Uint8Array(received);
                    let offset = 0;
                    for (const chunk of chunks) {
                        combined.set(chunk, offset);
                        offset += chunk.length;
                    }
                    data = combined;
                } else {
                    setLoadProgress(30);
                    const arrayBuffer = await response.arrayBuffer();
                    data = new Uint8Array(arrayBuffer);
                    setLoadProgress(80);
                }

                const loadingTask = pdfjsLib.getDocument({ data });
                const pdf = await loadingTask.promise;
                pdfDocRef.current = pdf;
                setPdfDoc(pdf);
                setNumPages(pdf.numPages);
                setLoadProgress(100);

                // Get first page dimensions for placeholders and initial scale
                const firstPage = await pdf.getPage(1);
                const originalViewport = firstPage.getViewport({ scale: 1.0 });
                setBaseDimensions({ width: originalViewport.width, height: originalViewport.height });

                const initialScale = window.innerWidth < 768 ? (window.innerWidth - 40) / originalViewport.width : 1.0;
                setScale(initialScale);
                scaleRef.current = initialScale;
                setRenderScale(initialScale);

                setIsLoading(false);
            } catch (err: any) {
                console.error('Error loading PDF:', err);
                setError(err?.message || 'Failed to load document. Please try again.');
                setIsLoading(false);
            }
        };

        loadPdf();

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [url]);

    // ---- Scale Sync (simplified — direct sync, no second debounce) ----
    useEffect(() => {
        if (isInteractingRef.current) return;
        scaleRef.current = scale;
        if (containerRef.current) {
            containerRef.current.style.setProperty('--pdf-scale', scale.toString());
        }
    }, [scale]);

    // ---- Native Touch/Wheel Event Listeners ----
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
                isInteractingRef.current = true;
                container.classList.add('is-zooming');

                const delta = -e.deltaY * 0.005;
                const nextScale = Math.min(Math.max(0.3, scaleRef.current + delta), 4);

                const rect = container.getBoundingClientRect();
                const focalX = e.clientX - rect.left;
                const focalY = e.clientY - rect.top;
                const ratio = nextScale / scaleRef.current;

                const nextLeft = (container.scrollLeft + focalX) * ratio - focalX;
                const nextTop = (container.scrollTop + focalY) * ratio - focalY;

                scaleRef.current = nextScale;
                updateDOMScale(nextScale, nextLeft, nextTop);
            }
        };

        const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                touchState.current.isPinching = true;
                touchState.current.lastDist = Math.hypot(
                    touch1.pageX - touch2.pageX,
                    touch1.pageY - touch2.pageY
                );
                isInteractingRef.current = true;
                container.classList.add('is-zooming');
            } else if (e.touches.length === 1) {
                const touch = e.touches[0];
                const now = Date.now();
                const { lastTap, lastTapX, lastTapY } = touchState.current;
                const dist = Math.hypot(touch.clientX - lastTapX, touch.clientY - lastTapY);

                if (now - lastTap < 300 && dist < 30) {
                    e.preventDefault();
                    const rect = container.getBoundingClientRect();
                    const focalX = touch.clientX - rect.left;
                    const focalY = touch.clientY - rect.top;
                    const nextScale = scaleRef.current > 1.2 ? 1.0 : 2.0;
                    const ratio = nextScale / scaleRef.current;

                    const nextLeft = (container.scrollLeft + focalX) * ratio - focalX;
                    const nextTop = (container.scrollTop + focalY) * ratio - focalY;

                    scaleRef.current = nextScale;
                    updateDOMScale(nextScale, nextLeft, nextTop);
                    touchState.current.lastTap = 0;
                } else {
                    touchState.current.lastTap = now;
                }
                touchState.current.lastTapX = touch.clientX;
                touchState.current.lastTapY = touch.clientY;
                touchState.current.wasScrolling = false;
            }
        };

        const onTouchMove = (e: TouchEvent) => {
            if (touchState.current.isPinching && e.touches.length === 2) {
                e.preventDefault();
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);

                if (touchState.current.lastDist > 0) {
                    const ratio = dist / touchState.current.lastDist;
                    const nextScale = Math.min(Math.max(0.3, scaleRef.current * ratio), 4);

                    const rect = container.getBoundingClientRect();
                    const focalX = (touch1.clientX + touch2.clientX) / 2 - rect.left;
                    const focalY = (touch1.clientY + touch2.clientY) / 2 - rect.top;
                    const realRatio = nextScale / scaleRef.current;

                    const nextLeft = (container.scrollLeft + focalX) * realRatio - focalX;
                    const nextTop = (container.scrollTop + focalY) * realRatio - focalY;

                    scaleRef.current = nextScale;
                    updateDOMScale(nextScale, nextLeft, nextTop);
                }
                touchState.current.lastDist = dist;
            } else if (e.touches.length === 1) {
                touchState.current.wasScrolling = true;
            }
        };

        const onTouchEnd = () => {
            if (touchState.current.wasScrolling) {
                touchState.current.lastTap = 0;
            }
            touchState.current.isPinching = false;
            touchState.current.lastDist = 0;
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        container.addEventListener('touchstart', onTouchStart, { passive: false });
        container.addEventListener('touchmove', onTouchMove, { passive: false });
        container.addEventListener('touchend', onTouchEnd);

        return () => {
            container.removeEventListener('wheel', handleWheel);
            container.removeEventListener('touchstart', onTouchStart);
            container.removeEventListener('touchmove', onTouchMove);
            container.removeEventListener('touchend', onTouchEnd);
        };
    }, [updateDOMScale]);

    // ---- IntersectionObserver for Page Tracking ----
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
                    if (!isInteractingRef.current) {
                        setCurrentPage(sorted[0]);
                    }
                }
            },
            { threshold: 0, rootMargin: '20%' }
        );

        observerRef.current = observer;

        // Observe all currently registered pages
        Object.values(pageRefs.current).forEach(ref => {
            if (ref) observer.observe(ref as Element);
        });

        return () => {
            observer.disconnect();
            observerRef.current = null;
        };
    }, [numPages, isLoading, pdfDoc]);

    // ---- Page Virtualization (±3 buffer) ----
    const BUFFER_PAGES = 3;
    const visiblePageSet = useMemo(() => {
        const set = new Set<number>();
        const start = Math.max(1, currentPage - BUFFER_PAGES);
        const end = Math.min(numPages, currentPage + BUFFER_PAGES);
        for (let i = start; i <= end; i++) set.add(i);
        return set;
    }, [currentPage, numPages]);

    // ---- Navigation ----
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

    // ---- Keyboard Handling (Separate Effect — Fixed Arrow Keys, Added Ctrl+F) ----
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const tag = (document.activeElement?.tagName || '').toLowerCase();
            const isInInput = tag === 'input' || tag === 'textarea' || tag === 'select';

            // Ctrl+F → focus search bar
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                searchInputRef.current?.focus();
                return;
            }

            // Block Print, Save, Inspect (security deterrent)
            if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's' || e.key === 'u' || (e.shiftKey && e.key === 'i'))) {
                if (!isAdmin) {
                    e.preventDefault();
                    showToast('This action is restricted.', 'error');
                }
            }
            if (e.key === 'F12' && !isAdmin) {
                e.preventDefault();
                showToast('This action is restricted.', 'error');
            }

            // Arrow key navigation — only when NOT in an input field
            if (!isInInput) {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    jumpToPage(Math.min(currentPageRef.current + 1, numPagesRef.current));
                }
                if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    jumpToPage(Math.max(currentPageRef.current - 1, 1));
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isAdmin]);

    // ---- Security Event Handlers ----
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();
        const handleCopy = (e: ClipboardEvent) => {
            if (!isAdmin) {
                e.preventDefault();
                showToast('Content copying restricted.', 'error');
            }
        };
        const handleBeforePrint = () => { if (!isAdmin) setIsPrintBlocked(true); };
        const handleAfterPrint = () => { setIsPrintBlocked(false); };

        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('copy', handleCopy);
        window.addEventListener('beforeprint', handleBeforePrint);
        window.addEventListener('afterprint', handleAfterPrint);

        return () => {
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('copy', handleCopy);
            window.removeEventListener('beforeprint', handleBeforePrint);
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, [isAdmin]);

    // ---- Search (Batched Async — No UI Freeze) ----
    const performSearch = async () => {
        if (!searchQuery.trim() || !pdfDocRef.current) {
            setSearchResults([]);
            setCurrentSearchIndex(-1);
            return;
        }

        setIsSearching(true);
        const results: SearchResult[] = [];
        const query = searchQuery.toLowerCase();
        const totalPages = numPagesRef.current;
        const BATCH_SIZE = 10;

        for (let batch = 0; batch < totalPages; batch += BATCH_SIZE) {
            const end = Math.min(batch + BATCH_SIZE, totalPages);

            for (let i = batch + 1; i <= end; i++) {
                const page = await pdfDocRef.current.getPage(i);
                const textContent = await page.getTextContent();

                let pageMatchCount = 0;
                textContent.items.forEach((item: any) => {
                    const str = item.str.toLowerCase();
                    let pos = str.indexOf(query);
                    while (pos !== -1) {
                        results.push({
                            pageIndex: i,
                            matchIndex: pageMatchCount,
                        });
                        pageMatchCount++;
                        pos = str.indexOf(query, pos + 1);
                    }
                });
            }

            // Yield to UI between batches
            if (batch + BATCH_SIZE < totalPages) {
                await new Promise(resolve => requestAnimationFrame(resolve));
            }
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

    // ---- Fit to Width / Fit to Page ----
    const fitToWidth = async () => {
        if (!pdfDocRef.current) return;
        const page = await pdfDocRef.current.getPage(1);
        const originalViewport = page.getViewport({ scale: 1.0 });
        const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
        const padding = window.innerWidth < 768 ? 20 : 120;
        const newScale = (containerWidth - padding) / originalViewport.width;
        handleZoom(newScale);
        setViewMode('page');
    };

    const fitToPage = async () => {
        if (!pdfDocRef.current) return;
        const page = await pdfDocRef.current.getPage(1);
        const originalViewport = page.getViewport({ scale: 1.0 });
        const containerHeight = containerRef.current?.clientHeight || window.innerHeight;
        const availableHeight = containerHeight - 160;
        const newScale = availableHeight / originalViewport.height;
        handleZoom(newScale);
        setViewMode('width');
    };

    const toggleFit = () => {
        if (viewMode === 'width') {
            fitToWidth();
        } else {
            fitToPage();
        }
    };

    // ---- Download with Cover Page ----
    const handleDownload = async () => {
        if (!url || isDownloading) return;

        const STORAGE_KEY = 'nexus_pdf_downloads';
        const today = new Date().toISOString().split('T')[0];
        if (!isAdmin) {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed.date === today && parsed.count >= 2) {
                        showToast('Daily limit (2 downloads) reached. Please try again tomorrow.', 'error');
                        return;
                    }
                }
            } catch (e) {
                console.warn("Could not parse download history", e);
            }
        }

        setIsDownloading(true);
        try {
            showToast('Preparing download...', 'info');

            const { data: { session } } = await NexusServer.getSession();

            const headers: Record<string, string> = {};
            if (session?.access_token) {
                headers['Authorization'] = `Bearer ${session.access_token}`;
            }

            // 1. Fetch the original PDF bytes
            const pdfResponse = await fetch(url, { headers });
            if (!pdfResponse.ok) throw new Error("Failed to verify download access.");
            const originalPdfBytes = await pdfResponse.arrayBuffer();

            // 2. Fetch the cover page image
            const coverResponse = await fetch('/pdfcover.png');
            if (!coverResponse.ok) throw new Error("Cover page asset not found.");
            const coverImageBytes = await coverResponse.arrayBuffer();

            // 3. Load original PDF and create the final output PDF
            const originalPdf = await PDFDocument.load(originalPdfBytes);
            const finalPdf = await PDFDocument.create();

            // 4. Copy first page from original PDF
            const [firstPage] = await finalPdf.copyPages(originalPdf, [0]);
            finalPdf.addPage(firstPage);

            // 5. Add cover image as second page — sized to match original pages
            const origFirstPage = originalPdf.getPage(0);
            const { width: pageWidth, height: pageHeight } = origFirstPage.getSize();

            const coverImage = await finalPdf.embedPng(coverImageBytes);
            const coverDims = coverImage.scale(1);

            const scaleX = pageWidth / coverDims.width;
            const scaleY = pageHeight / coverDims.height;
            const fitScale = Math.min(scaleX, scaleY);
            const drawWidth = coverDims.width * fitScale;
            const drawHeight = coverDims.height * fitScale;

            const coverPage = finalPdf.addPage([pageWidth, pageHeight]);
            coverPage.drawImage(coverImage, {
                x: (pageWidth - drawWidth) / 2,
                y: (pageHeight - drawHeight) / 2,
                width: drawWidth,
                height: drawHeight,
            });

            // 6. Copy remaining pages from the original PDF (page 2 onward)
            const remainingIndices = originalPdf.getPageIndices().slice(1);
            if (remainingIndices.length > 0) {
                const remainingPages = await finalPdf.copyPages(originalPdf, remainingIndices);
                remainingPages.forEach(page => finalPdf.addPage(page));
            }

            // 7. Serialize and download
            const finalPdfBytes = await finalPdf.save();
            const blob = new Blob([new Uint8Array(finalPdfBytes)], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            const baseName = (fileName || 'document.pdf').replace(/\.pdf$/i, '');
            const downloadName = `(scholix.app) ${baseName}.pdf`;
            link.setAttribute('download', downloadName);
            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

            if (!isAdmin) {
                try {
                    const stored = localStorage.getItem('nexus_pdf_downloads');
                    let count = 0;
                    const today = new Date().toISOString().split('T')[0];
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        if (parsed.date === today) count = parsed.count;
                    }
                    localStorage.setItem('nexus_pdf_downloads', JSON.stringify({ date: today, count: count + 1 }));
                } catch (e) {
                    console.warn("Could not update download history", e);
                }
            }

            showToast('Download complete.', 'success');
        } catch (err: any) {
            console.error("Download failure:", err);
            showToast(err?.message || 'Download failed. Please try again.', 'error');
        } finally {
            setIsDownloading(false);
        }
    };

    // ---- Error State ----
    if (error) {
        return createPortal(
            <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center p-6">
                <div className="text-center space-y-6 max-w-sm">
                    <div className="w-20 h-20 bg-red-500/10 rounded-[40px] flex items-center justify-center text-red-500 border border-red-500/20 mx-auto">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-10 h-10"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Load Error</h3>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">{error}</p>
                    <button onClick={handleClose} className="bg-white text-black px-10 py-4 rounded-3xl text-[10px] font-medium hover:scale-105 active:scale-95 transition-all shadow-xl">Go Back</button>
                </div>
            </div>,
            document.getElementById('modal-root') || document.body
        );
    }

    // ---- Main Render ----
    return createPortal(
        <div className={`fixed inset-0 z-[9999] flex flex-col bg-zinc-100 dark:bg-[#0a0a0a] animate-fade-in overflow-hidden transition-all duration-300 ${isClosing ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'} ${isFullscreen ? 'p-0' : ''}`}>
            {/* Toolbar */}
            <div className={`absolute top-0 left-0 right-0 flex items-center justify-between px-2 md:px-6 h-12 md:h-20 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl border-b border-zinc-200 dark:border-white/5 z-50 transition-transform duration-300 ${showToolbar ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="flex items-center gap-1 md:gap-4 overflow-hidden">
                    <button
                        onClick={handleClose}
                        className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-zinc-200 dark:bg-white/5 text-zinc-600 dark:text-white transition-all border-none group pdf-back-btn"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-0.5 transition-transform"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="hidden sm:block truncate">
                        <h3 className="text-[13px] font-medium text-zinc-900 dark:text-white tracking-tight truncate max-w-[200px]">{fileName}</h3>
                        <p className="text-[10px] font-medium tracking-wide leading-none mt-1" style={{ color: 'var(--brand-primary)' }}>{fullBrandName} Secure Protocol</p>
                    </div>
                </div>

                {/* Center: Search & Zoom */}
                <div className="flex items-center gap-1 md:gap-6">
                    {/* Search Bar */}
                    <div className="hidden sm:flex items-center bg-zinc-200 dark:bg-white/5 rounded-2xl border border-zinc-300 dark:border-white/10 px-3 py-1.5 focus-within:border-orange-600 transition-all group">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-zinc-400 dark:text-white/30 group-focus-within:text-orange-500"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Find..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && performSearch()}
                            autoCapitalize="none"
                            autoCorrect="off"
                            autoComplete="off"
                            spellCheck="false"
                            className="bg-transparent border-none outline-none text-xs font-normal text-zinc-900 dark:text-white px-2 w-24 md:w-32 placeholder:text-zinc-400 dark:placeholder:text-white/20"
                        />
                        {searchResults.length > 0 && (
                            <div className="flex items-center gap-2 pr-2">
                                <span className="text-[10px] font-medium text-orange-500 whitespace-nowrap">{currentSearchIndex + 1} / {searchResults.length}</span>
                                <div className="h-4 w-px bg-zinc-300 dark:bg-white/10 mx-1" />
                                <button onClick={prevSearch} className="text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white border-none bg-transparent active:scale-90"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-3 h-3"><path d="m15 18-6-6 6-6" /></svg></button>
                                <button onClick={nextSearch} className="text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white border-none bg-transparent active:scale-90"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-3 h-3"><path d="m9 18 6-6-6-6" /></svg></button>
                            </div>
                        )}
                        {isSearching && (
                            <span className="text-[10px] font-medium text-orange-500 animate-pulse">Searching...</span>
                        )}
                    </div>

                    {/* Scale Controls */}
                    <div className="flex items-center gap-0.5 md:gap-1 bg-zinc-200 dark:bg-white/5 rounded-xl md:rounded-2xl p-0.5 md:p-1 border border-zinc-300 dark:border-white/10">
                        <button
                            onClick={() => handleZoom(Math.max(0.2, scaleRef.current - 0.1))}
                            className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl flex items-center justify-center text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-300 dark:hover:bg-white/10 transition-all border-none bg-transparent"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 md:w-4 md:h-4"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        </button>
                        <span className="text-[10px] md:text-xs font-medium text-zinc-900 dark:text-white px-1 md:px-2 min-w-[40px] md:min-w-[50px] text-center">{Math.round(scale * 100)}%</span>
                        <button
                            onClick={() => handleZoom(Math.min(3, scaleRef.current + 0.1))}
                            className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl flex items-center justify-center text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-300 dark:hover:bg-white/10 transition-all border-none bg-transparent"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 md:w-4 md:h-4"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        </button>

                        <button
                            onClick={toggleFit}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center bg-zinc-300/50 dark:bg-white/5 text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white pdf-back-btn transition-all border-none"
                            title={viewMode === 'width' ? "Fit to Width" : "Fit to Page"}
                        >
                            {viewMode === 'width' ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 md:w-5 md:h-5">
                                    <path d="M2 12h20" />
                                    <path d="M7 7l-5 5 5 5" />
                                    <path d="M17 7l5 5-5 5" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 md:w-5 md:h-5">
                                    <path d="M8 3H5a2 2 0 0 0-2 2v3m14 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 md:gap-2">
                    <div className="hidden sm:flex items-center bg-zinc-200 dark:bg-white/5 border border-zinc-300 dark:border-white/10 rounded-2xl px-4 py-3 gap-3">
                        <input
                            type="number"
                            min={1}
                            max={numPages}
                            value={currentPage}
                            onChange={e => jumpToPage(parseInt(e.target.value) || 1)}
                            className="w-10 bg-transparent border-none outline-none text-center text-xs font-medium text-zinc-900 dark:text-white"
                        />
                        <span className="text-xs font-medium text-zinc-400 dark:text-white/20 tracking-wide">/ {numPages}</span>
                    </div>

                    <button
                        onClick={toggleTheme}
                        className="hidden md:flex w-10 h-10 rounded-xl items-center justify-center bg-zinc-200 dark:bg-white/5 text-zinc-500 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white border-none group"
                        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDarkMode ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 group-hover:text-amber-400 transition-colors"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 group-hover:text-blue-500 transition-colors"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                        )}
                    </button>

                    <button
                        onClick={toggleFullscreen}
                        className="hidden md:flex w-10 h-10 rounded-xl items-center justify-center bg-zinc-200 dark:bg-white/5 text-zinc-500 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white border-none group"
                        title="Toggle Fullscreen"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 group-hover:scale-110 transition-transform"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
                    </button>

                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center border-none transition-all shadow-lg ${isDownloading ? 'opacity-60 cursor-wait' : 'text-white hover:scale-110 active:scale-95'}`}
                        style={{ backgroundColor: 'var(--brand-primary)', boxShadow: '0 10px 15px -3px var(--brand-glow)' }}
                        title={isDownloading ? 'Preparing download...' : 'Download PDF'}
                    >
                        {isDownloading ? (
                            <svg className="w-4 h-4 md:w-5 md:h-5 animate-spin text-white" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 md:w-5 md:h-5 text-white"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
                <main
                    ref={containerRef}
                    onScroll={handleScroll}
                    onContextMenu={(e) => !isAdmin && e.preventDefault()}
                    onDragStart={(e) => !isAdmin && e.preventDefault()}
                    onSelectStart={(e) => !isAdmin && e.preventDefault()}
                    className="flex-1 overflow-auto bg-zinc-100 dark:bg-[#0a0a0a] relative select-none touch-auto overscroll-none pt-16 md:pt-20"
                    style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'none' } as any}
                >
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center w-full h-full min-h-[60vh]">
                            <div className="flex flex-col items-center gap-6">
                                {/* Animated ring spinner */}
                                <div className="relative w-20 h-20">
                                    <svg className="w-full h-full pdf-loader-ring" viewBox="0 0 80 80">
                                        <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="3" className="text-zinc-200 dark:text-white/5" />
                                        <circle cx="40" cy="40" r="34" fill="none" stroke="url(#loaderGradient)" strokeWidth="3" strokeLinecap="round" strokeDasharray="160 54" className="pdf-loader-arc" />
                                        <defs>
                                            <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#ea580c" />
                                                <stop offset="100%" stopColor="#f97316" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-orange-500/80 pdf-loader-pulse">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Progress text */}
                                <div className="flex flex-col items-center gap-1.5">
                                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 tracking-tight">
                                        {loadProgress > 0 ? `Loading document — ${loadProgress}%` : 'Connecting…'}
                                    </p>
                                    {loadProgress > 0 && (
                                        <div className="w-48 h-1 bg-zinc-200 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-300 ease-out"
                                                style={{ width: `${loadProgress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="flex flex-col items-center min-w-max mx-auto px-4 md:px-8"
                            style={{ paddingTop: 'calc(48px * var(--pdf-scale, 1))', paddingBottom: 'calc(48px * var(--pdf-scale, 1))' }}
                        >
                            {/* Virtualized Page Rendering */}
                            {Array.from({ length: numPages }).map((_, i) => {
                                const pageNum = i + 1;

                                // Render full PageRenderer for visible ± buffer pages
                                if (visiblePageSet.has(pageNum)) {
                                    return (
                                        <PageRenderer
                                            key={pageNum}
                                            pageNum={pageNum}
                                            pdfDoc={pdfDoc}
                                            renderScale={renderScale}
                                            baseDimensions={baseDimensions}
                                            searchQuery={searchQuery}
                                            currentSearchIndex={currentSearchIndex}
                                            searchResults={searchResults}
                                            pdfjsLib={pdfjsLibState}
                                            registerRef={registerPageRef}
                                            isInteractingRef={isInteractingRef}
                                            brandName={fullBrandName}
                                        />
                                    );
                                }

                                // Lightweight placeholder for non-visible pages
                                return (
                                    <div
                                        key={pageNum}
                                        data-page={pageNum}
                                        ref={el => { if (el) registerPageRef(pageNum, el); }}
                                        className="rounded-md border border-zinc-200/50 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02]"
                                        style={{
                                            width: `calc(${baseDimensions.width}px * var(--pdf-scale, 1))`,
                                            height: `calc(${baseDimensions.height}px * var(--pdf-scale, 1))`,
                                            marginBottom: `calc(24px * var(--pdf-scale, 1))`,
                                            contain: 'layout size',
                                        }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </main>

                {/* Floating Page Indicator (Mobile) */}
                <div className="md:hidden fixed bottom-10 right-8 z-50 text-white px-4 py-2 rounded-full font-black text-[10px] shadow-2xl animate-fade-in uppercase tracking-widest" style={{ backgroundColor: 'var(--brand-primary)' }}>
                    {currentPage} / {numPages}
                </div>
            </div>

            {/* Print Shield Overlay */}
            <div className="pdf-print-shield">
                <h1>PRINTING IS NOT PERMITTED</h1>
                <p>This document is protected. Printing is disabled.</p>
            </div>
        </div>,
        document.getElementById('modal-root') || document.body
    );
};

export default PDFViewer;
