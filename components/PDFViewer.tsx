import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { UserProfile } from '../types.ts';
import { showToast } from './Toast.tsx';
import NexusServer from '../services/nexusServer.ts';
import { useUniversity } from '../hooks/useUniversity.tsx';

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

const PageRenderer = React.memo<{
    pageNum: number;
    pdfDoc: any;
    renderScale: number;
    userProfile: UserProfile | null | undefined;
    searchQuery: string;
    currentSearchIndex: number;
    searchResults: SearchResult[];
    pdfjsLib: any;
    registerRef: (pageNum: number, el: HTMLDivElement | null) => void;
    isInteractingRef: React.MutableRefObject<boolean>;
}>(({ pageNum, pdfDoc, renderScale, userProfile, searchQuery, currentSearchIndex, searchResults, pdfjsLib, registerRef, isInteractingRef }) => {

    const containerRef = useRef<HTMLDivElement>(null);
    const [renderTarget, setRenderTarget] = useState<{
        activeCanvas: 'A' | 'B';
        scaleA: number;
        scaleB: number;
    }>({ activeCanvas: 'A', scaleA: renderScale || 1, scaleB: 0 });

    const canvasARef = useRef<HTMLCanvasElement>(null);
    const canvasBRef = useRef<HTMLCanvasElement>(null);
    const textLayerRef = useRef<HTMLDivElement>(null);
    const renderTaskRef = useRef<any>(null);
    const [pageInfo, setPageInfo] = useState<{ width: number; height: number } | null>(null);

    useEffect(() => {
        const render = async () => {
            if (isInteractingRef.current) return;
            const targetId = renderTarget.activeCanvas === 'A' ? 'B' : 'A';
            const targetCanvas = targetId === 'A' ? canvasARef.current : canvasBRef.current;
            if (!pdfDoc || !targetCanvas || !textLayerRef.current || !pdfjsLib) return;

            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
            }

            try {
                const page = await pdfDoc.getPage(pageNum);
                const maxPixelRatio = window.innerWidth < 768 ? 1.5 : 2;
                const pixelRatio = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
                const baseViewport = page.getViewport({ scale: 1.0 });
                setPageInfo({ width: baseViewport.width, height: baseViewport.height });

                const targetScale = Math.min(renderScale, 2.0);
                const viewport = page.getViewport({ scale: targetScale * pixelRatio });
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

                setRenderTarget(prev => ({
                    activeCanvas: targetId,
                    scaleA: targetId === 'A' ? renderScale : prev.scaleA,
                    scaleB: targetId === 'B' ? renderScale : prev.scaleB
                }));

                while (textLayerRef.current.firstChild) textLayerRef.current.removeChild(textLayerRef.current.firstChild);
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
                if (entries[0].isIntersecting && !isInteractingRef.current) {
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

    // Independent search highlighting effect
    useEffect(() => {
        if (isInteractingRef.current || !textLayerRef.current) return;

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

    // Dedicated effect for scrolling to match - Only trigger on index change, not scale
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

    const activeScale = renderTarget.activeCanvas === 'A' ? renderTarget.scaleA : renderTarget.scaleB;
    const scaleA = renderTarget.scaleA || activeScale || 1;
    const scaleB = renderTarget.scaleB || activeScale || 1;

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
                width: pageInfo ? `calc(${pageInfo.width}px * ${renderScale})` : '100%',
                height: pageInfo ? `calc(${pageInfo.height}px * ${renderScale})` : '100vh',
                marginBottom: `calc(24px * ${renderScale})`,
                contain: 'layout size',
                willChange: 'transform'
            } as any}
        >
            <div className="absolute inset-0 overflow-hidden rounded-md">
                <canvas
                    ref={canvasARef}
                    className={`absolute inset-0 block rounded-md transition-opacity duration-200 ${renderTarget.activeCanvas === 'A' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    style={{
                        backfaceVisibility: 'hidden',
                        pointerEvents: 'none',
                        transform: `scale(calc(${renderScale} / ${scaleA})) translateZ(0)`,
                        transformOrigin: 'top left',
                        width: pageInfo ? `${pageInfo.width * scaleA}px` : 'auto',
                        height: pageInfo ? `${pageInfo.height * scaleA}px` : 'auto',
                    }}
                />
                <canvas
                    ref={canvasBRef}
                    className={`absolute inset-0 block rounded-md transition-opacity duration-200 ${renderTarget.activeCanvas === 'B' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    style={{
                        backfaceVisibility: 'hidden',
                        pointerEvents: 'none',
                        transform: `scale(calc(${renderScale} / ${scaleB})) translateZ(0)`,
                        transformOrigin: 'top left',
                        width: pageInfo ? `${pageInfo.width * scaleB}px` : 'auto',
                        height: pageInfo ? `${pageInfo.height * scaleB}px` : 'auto',
                    }}
                />

                <div
                    ref={textLayerRef}
                    className="textLayer absolute inset-0 pointer-events-none select-text z-20 opacity-20 transition-opacity duration-200"
                />

                {/* Optimized Watermark */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none z-30 watermark-overlay" />
            </div>
        </div>
    );
});

const PDFViewer: React.FC<PDFViewerProps> = ({ url, onClose, fileName, userProfile }) => {
    const { fullBrandName } = useUniversity();

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

    const zoomWrapperRef = useRef<HTMLDivElement>(null);
    const pageOriginalWidthRef = useRef<number>(612);
    const animationFrameId = useRef<number | null>(null);
    const pendingUpdate = useRef<{
        scale: number;
        scrollLeft?: number;
        scrollTop?: number;
    } | null>(null);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 250);
    };

    const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
    const [showToolbar, setShowToolbar] = useState(true);
    const lastScrollYRef = useRef(0);

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

    const handleScroll = (e: React.UIEvent<HTMLElement>) => {
        const currentScrollY = e.currentTarget.scrollTop;
        if (currentScrollY > lastScrollYRef.current + 20) {
            setShowToolbar(false);
        } else if (currentScrollY < lastScrollYRef.current - 20 || currentScrollY < 50) {
            setShowToolbar(true);
        }
        lastScrollYRef.current = currentScrollY;
    };

    // Touch/Pinch State
    const touchState = useRef<{
        lastDist: number;
        lastTap: number;
        lastTapX: number;
        lastTapY: number;
        lastFocalX: number;
        lastFocalY: number;
        isPinching: boolean;
        wasScrolling: boolean;
    }>({
        lastDist: 0,
        lastTap: 0,
        lastTapX: 0,
        lastTapY: 0,
        lastFocalX: 0,
        lastFocalY: 0,
        isPinching: false,
        wasScrolling: false
    });

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
    const [isSearching, setIsSearching] = useState(false);
    const [viewMode, setViewMode] = useState<'width' | 'page'>('width');
    const [isZooming, setIsZooming] = useState(false);
    const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isAdmin = userProfile?.is_admin || false;
    const pdfDocRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
    const visiblePages = useRef<Set<number>>(new Set());
    const currentPageRef = useRef(1);
    const scaleRef = useRef(scale);

    useEffect(() => {
        currentPageRef.current = currentPage;
    }, [currentPage]);

    const isInteractingRef = useRef(false);
    const zoomingTimeoutRef = useRef<any>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const [isInteracting, setIsInteracting] = useState(false); 

    const getCenteringOffset = useCallback((s: number) => {
        if (!containerRef.current) return 0;
        const containerWidth = containerRef.current.clientWidth;
        const pageWidth = pageOriginalWidthRef.current * s;
        const padding = window.innerWidth < 768 ? 32 : 64;
        return Math.max(0, (containerWidth - (pageWidth + padding)) / 2);
    }, []);

    // Optimized DOM-only scale update via requestAnimationFrame
    const updateDOMScale = useCallback((currentScale: number, scrollLeft?: number, scrollTop?: number) => {
        pendingUpdate.current = { scale: currentScale, scrollLeft, scrollTop };
        
        if (animationFrameId.current === null) {
            animationFrameId.current = requestAnimationFrame(() => {
                if (pendingUpdate.current && containerRef.current) {
                    const { scale: s, scrollLeft: left, scrollTop: top } = pendingUpdate.current;
                    containerRef.current.style.setProperty('--pdf-scale', s.toString());
                    if (left !== undefined) containerRef.current.scrollLeft = left;
                    if (top !== undefined) containerRef.current.scrollTop = top;
                }
                animationFrameId.current = null;
                pendingUpdate.current = null;
            });
        }

        // Sync to React only after interaction settles to prevent re-render churn
        if (zoomingTimeoutRef.current) clearTimeout(zoomingTimeoutRef.current);
        zoomingTimeoutRef.current = setTimeout(() => {
            isInteractingRef.current = false;
            if (containerRef.current) {
                containerRef.current.classList.remove('is-zooming');
            }
            setScale(currentScale);
            setIsInteracting(false);
            
            // Sync current page after interaction ends
            if (visiblePages.current.size > 0) {
                const sorted = Array.from(visiblePages.current).sort((a: number, b: number) => a - b);
                setCurrentPage(sorted[0]);
            }
        }, 200); 
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

    const registerPageRef = useCallback((pageNum: number, el: HTMLDivElement | null) => {
        pageRefs.current[pageNum] = el;
        if (el && observerRef.current) {
            observerRef.current.observe(el);
        }
    }, []);
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
                setLoadProgress(0);
                
                // 🔐 Session Token Verification: Get the current user's session token
                const { data: { session } } = await NexusServer.getSession();
                
                // Load PDF progressively using PDF.js native stream & range-request transport
                const loadingTask = pdfjsLib.getDocument({
                    url: url,
                    httpHeaders: {
                        'Authorization': session ? `Bearer ${session.access_token}` : ''
                    },
                    disableRange: false,
                    disableAutoFetch: false,
                    disableStream: false,
                });

                // Track progressive loading progress
                loadingTask.onProgress = ({ loaded, total }) => {
                    if (total > 0) {
                        setLoadProgress(Math.round((loaded / total) * 100));
                    } else {
                        // Fallback progress if total size is unknown
                        setLoadProgress(prev => Math.min(prev + 5, 90));
                    }
                };

                const pdf = await loadingTask.promise;
                pdfDocRef.current = pdf;
                setPdfDoc(pdf);
                setNumPages(pdf.numPages);
                setLoadProgress(100);

                // Get first page to calculate initial scale
                const firstPage = await pdf.getPage(1);
                const originalViewport = firstPage.getViewport({ scale: 1.0 });
                pageOriginalWidthRef.current = originalViewport.width;
                setScale(window.innerWidth < 768 ? (window.innerWidth - 40) / originalViewport.width : 1.0);

                setIsLoading(false);
            } catch (err: any) {
                console.error('Error loading PDF:', err);
                setError('Failed to load document. The encryption handshake failed.');
                setIsLoading(false);
            }
        };

        loadPdfJs();

        // Security: Enhanced Event Blocking
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();
        const handleKeyDown = (e: KeyboardEvent) => {
            // Block Print, Save, Inspect
            if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's' || e.key === 'u' || e.shiftKey && e.key === 'i')) {
                if (!isAdmin) {
                    e.preventDefault();
                    showToast('Security Protocol Active: Download Protected.', 'error');
                }
            }
            // Block F12
            if (e.key === 'F12' && !isAdmin) {
                e.preventDefault();
                showToast('Developer Console Access Prohibited.', 'error');
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

        const handleCopy = (e: ClipboardEvent) => {
            if (!isAdmin) {
                e.preventDefault();
                showToast('Content Copying Restricted.', 'error');
            }
        };

        const handleBeforePrint = () => {
            if (!isAdmin) {
                setIsPrintBlocked(true);
            }
        };

        const handleAfterPrint = () => {
            setIsPrintBlocked(false);
        };

        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('copy', handleCopy);
        window.addEventListener('beforeprint', handleBeforePrint);
        window.addEventListener('afterprint', handleAfterPrint);

        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('copy', handleCopy);
            window.removeEventListener('beforeprint', handleBeforePrint);
            window.removeEventListener('afterprint', handleAfterPrint);
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, [url, isAdmin]);


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
        handleZoom(newScale);
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
        handleZoom(newScale);
        setViewMode('width'); // Next click will fit to width
    };

    const toggleFit = () => {
        if (viewMode === 'width') {
            fitToWidth();
        } else {
            fitToPage();
        }
    };

    useEffect(() => {
        if (isInteractingRef.current) return;

        // Keep scaleRef in sync with state for non-gesture updates (buttons, init)
        scaleRef.current = scale;

        const prevScale = renderScale;
        const timer = setTimeout(() => {
            if (prevScale !== scale) {
                const L_old = getCenteringOffset(prevScale);
                const L_new = getCenteringOffset(scale);
                const deltaCentering = L_new - L_old;

                setRenderScale(scale);
                
                if (containerRef.current) {
                    containerRef.current.style.setProperty('--pdf-scale', scale.toString());
                    if (deltaCentering !== 0) {
                        containerRef.current.scrollLeft += deltaCentering;
                    }
                }
            }
        }, 200); 
        return () => clearTimeout(timer);
    }, [scale, renderScale, getCenteringOffset]);

    // Simplified focal point logic removed in favor of direct gesture scroll handling

    // Native Non-Passive Event Listeners for Touch/Wheel to guarantee smoothness
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
                isInteractingRef.current = true;
                setIsInteracting(true);
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
                touchState.current.lastFocalX = (touch1.clientX + touch2.clientX) / 2;
                touchState.current.lastFocalY = (touch1.clientY + touch2.clientY) / 2;
                isInteractingRef.current = true;
                setIsInteracting(true);
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
                const currentFocalX = (touch1.clientX + touch2.clientX) / 2;
                const currentFocalY = (touch1.clientY + touch2.clientY) / 2;

                if (touchState.current.lastDist > 0) {
                    const ratio = dist / touchState.current.lastDist;
                    const nextScale = Math.min(Math.max(0.3, scaleRef.current * ratio), 4);
                    
                    const rect = container.getBoundingClientRect();
                    const localFocalX = currentFocalX - rect.left;
                    const localFocalY = currentFocalY - rect.top;
                    
                    // Pan calculations
                    const deltaX = currentFocalX - touchState.current.lastFocalX;
                    const deltaY = currentFocalY - touchState.current.lastFocalY;

                    const translatedScrollLeft = container.scrollLeft - deltaX;
                    const translatedScrollTop = container.scrollTop - deltaY;

                    const realRatio = nextScale / scaleRef.current;

                    const nextLeft = (translatedScrollLeft + localFocalX) * realRatio - localFocalX;
                    const nextTop = (translatedScrollTop + localFocalY) * realRatio - localFocalY;

                    scaleRef.current = nextScale;
                    updateDOMScale(nextScale, nextLeft, nextTop);
                }
                touchState.current.lastDist = dist;
                touchState.current.lastFocalX = currentFocalX;
                touchState.current.lastFocalY = currentFocalY;
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
            // No direct isInteractingRef.current = false here, let the timeout handle it
            // for smoother transition between pinch-stop and redraw
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
                    if (!isInteractingRef.current) {
                        setCurrentPage(sorted[0]);
                    }
                }
            },
            { threshold: 0, rootMargin: '20%' } // Zero threshold handles extreme zoom cases
        );

        observerRef.current = observer;

        // Observe all currently registered pages
        const currentRefs = pageRefs.current;
        Object.values(currentRefs).forEach(ref => {
            if (ref) observer.observe(ref as Element);
        });

        return () => {
            observer.disconnect();
            observerRef.current = null;
        };
    }, [numPages, isLoading, pdfDoc]);

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

    // 💾 Authenticated Download with Cover Page
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
            showToast('Preparing Secure Download...', 'info');
            
            const { data: { session } } = await NexusServer.getSession();

            // 1. Fetch the original PDF bytes
            const pdfResponse = await fetch(url, {
                headers: {
                    'Authorization': session ? `Bearer ${session.access_token}` : ''
                }
            });
            if (!pdfResponse.ok) throw new Error("Vault re-verification failed.");
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

            // Scale cover to fit within page dimensions while preserving aspect ratio
            const scaleX = pageWidth / coverDims.width;
            const scaleY = pageHeight / coverDims.height;
            const fitScale = Math.min(scaleX, scaleY);
            const drawWidth = coverDims.width * fitScale;
            const drawHeight = coverDims.height * fitScale;

            const coverPage = finalPdf.addPage([pageWidth, pageHeight]);
            // Center the image on the page
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

            // 6.5. Apply watermark to all content pages (except the cover page at index 1)
            const helveticaBoldFont = await finalPdf.embedFont(StandardFonts.HelveticaBold);
            const helveticaFont = await finalPdf.embedFont(StandardFonts.Helvetica);
            const watermarkText = 'SCHOLIX';
            const watermarkSize = 60;
            const pages = finalPdf.getPages();
            
            for (let i = 0; i < pages.length; i++) {
                if (i === 1) continue; // Skip cover page
                
                const page = pages[i];
                const { width, height } = page.getSize();
                
                // Center-aligned diagonal watermark text
                const textWidth = helveticaBoldFont.widthOfTextAtSize(watermarkText, watermarkSize);
                const textHeight = watermarkSize;
                
                const rad = 45 * Math.PI / 180;
                const cosTheta = Math.cos(rad);
                const sinTheta = Math.sin(rad);
                
                const cxRel = (textWidth / 2) * cosTheta - (textHeight / 2) * sinTheta;
                const cyRel = (textWidth / 2) * sinTheta + (textHeight / 2) * cosTheta;
                
                const x0 = (width / 2) - cxRel;
                const y0 = (height / 2) - cyRel;
                
                page.drawText(watermarkText, {
                    x: x0,
                    y: y0,
                    size: watermarkSize,
                    font: helveticaBoldFont,
                    color: rgb(0.7, 0.7, 0.7),
                    opacity: 0.19,
                    rotate: degrees(45),
                });

                // Subtle footer branding at the bottom center of each page
                const footerText = 'Downloaded from scholix.app | Secure Learning Platform';
                const footerSize = 8;
                const footerWidth = helveticaFont.widthOfTextAtSize(footerText, footerSize);
                
                page.drawText(footerText, {
                    x: (width - footerWidth) / 2,
                    y: 20,
                    size: footerSize,
                    font: helveticaFont,
                    color: rgb(0.5, 0.5, 0.5),
                    opacity: 0.4,
                });
            }

            // 6. Serialize and download
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

            showToast('Download Verified & Complete.', 'success');
        } catch (err: any) {
            console.error("Download failure:", err);
            showToast(err?.message || 'Download Blocked: Protocol Fault.', 'error');
        } finally {
            setIsDownloading(false);
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
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">{error}</p>
                    <button onClick={handleClose} className="bg-white text-black px-10 py-4 rounded-3xl text-[10px] font-medium hover:scale-105 active:scale-95 transition-all shadow-xl">Abort Protocol</button>
                </div>
            </div>,
            document.getElementById('modal-root') || document.body
        );
    }

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

            {/* Main Content Wrapper (Must be flex to allow main to fill) */}
            <div className="flex-1 overflow-hidden relative flex flex-col">

                <main
                    ref={containerRef}
                    onScroll={handleScroll}
                    onContextMenu={(e) => !isAdmin && e.preventDefault()}
                    onDragStart={(e) => !isAdmin && e.preventDefault()}
                    onSelectStart={(e) => !isAdmin && e.preventDefault()}
                    className="flex-1 overflow-auto bg-zinc-100 dark:bg-[#0a0a0a] relative select-none touch-auto overscroll-none pt-16 md:pt-20"
                    style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'none' }}
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
                                    {/* Center icon */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-orange-500/80 pdf-loader-pulse">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Progress text */}
                                <div className="flex flex-col items-center gap-1.5">
                                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 tracking-tight">
                                        {loadProgress > 0 ? `Loading document — ${loadProgress}%` : 'Establishing secure connection…'}
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
                            ref={zoomWrapperRef}
                            className="flex flex-col items-center min-w-max mx-auto px-4 md:px-8"
                            style={{
                                transform: `scale(calc(var(--pdf-scale) / ${renderScale})) translateZ(0)`,
                                transformOrigin: 'top left',
                                willChange: 'transform',
                                paddingTop: `${48 * renderScale}px`,
                                paddingBottom: `${48 * renderScale}px`,
                            }}
                        >
                            {Array.from({ length: numPages }).map((_, i) => (
                                <PageRenderer
                                    key={i}
                                    pageNum={i + 1}
                                    pdfDoc={pdfDoc}
                                    renderScale={renderScale}
                                    userProfile={userProfile}
                                    searchQuery={searchQuery}
                                    currentSearchIndex={currentSearchIndex}
                                    searchResults={searchResults}
                                    pdfjsLib={pdfjsLibState}
                                    registerRef={registerPageRef}
                                    isInteractingRef={isInteractingRef}
                                />

                            ))}
                        </div>
                    )}
                </main>

                {/* Floating Page Indicator (Mobile) */}
                <div className="md:hidden fixed bottom-10 right-8 z-50 text-white px-4 py-2 rounded-full font-black text-[10px] shadow-2xl animate-fade-in uppercase tracking-widest" style={{ backgroundColor: 'var(--brand-primary)' }}>
                    {currentPage} / {numPages}
                </div>
            </div>

            <style>{`
                .pdf-back-btn:hover {
                    background-color: var(--brand-primary) !important;
                    color: white !important;
                }
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

                /* PDF Loader Animations */
                .pdf-loader-ring {
                    animation: pdf-ring-spin 1.4s linear infinite;
                }

                .pdf-loader-arc {
                    animation: pdf-arc-dash 1.4s ease-in-out infinite;
                }

                .pdf-loader-pulse {
                    animation: pdf-icon-pulse 2s ease-in-out infinite;
                }

                @keyframes pdf-ring-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes pdf-arc-dash {
                    0% { stroke-dasharray: 1 213; stroke-dashoffset: 0; }
                    50% { stroke-dasharray: 120 213; stroke-dashoffset: -40; }
                    100% { stroke-dasharray: 1 213; stroke-dashoffset: -213; }
                }

                @keyframes pdf-icon-pulse {
                    0%, 100% { opacity: 0.6; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.08); }
                }

                .watermark-overlay {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' transform='rotate(-35 150 150)' fill='currentColor' fill-opacity='1' font-family='Inter, sans-serif' font-weight='700' font-size='32'%3E${fullBrandName.toUpperCase()}%3C/text%3E%3C/svg%3E");
                    background-repeat: repeat;
                    background-size: 300px 300px;
                }

                .is-zooming .textLayer {
                    opacity: 0 !important;
                    transition: none !important;
                }

                .is-zooming .page-container {
                    transition: none !important;
                }

                /* Security Print Shield */
                @media print {
                    body {
                        display: none !important;
                    }
                    * {
                        visibility: hidden !important;
                    }
                    .pdf-print-shield {
                        visibility: visible !important;
                        display: block !important;
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        background: #000 !important;
                        color: #ff0000 !important;
                        text-align: center !important;
                        padding-top: 200px !important;
                        font-family: sans-serif !important;
                        font-size: 24px !important;
                        font-weight: bold !important;
                        z-index: 999999 !important;
                    }
                }
                
                @media screen {
                    .pdf-print-shield {
                        display: none;
                    }
                }
            `}</style>

            {/* Print Shield Overlay */}
            <div className="pdf-print-shield">
                <h1>SECURITY BREACH DETECTED</h1>
                <p>UNAUTHORIZED PRINTING IS STRICTLY PROHIBITED</p>
                <p>IP and User Session Logged to Registry Service.</p>
            </div>
        </div >
,
        document.getElementById('modal-root') || document.body
    );
};

export default PDFViewer;
