import React, { useState, useEffect, useRef } from 'react';
import { ModernSearchResult, ModernReadingTheme, ModernPageDimensions } from './modernTypes.ts';

interface ModernPDFPageProps {
    pageNum: number;
    pdfDoc: any;
    pdfjsLib: any;
    scale: number;
    rotation: number;
    readingTheme: ModernReadingTheme;
    searchQuery: string;
    currentSearchIndex: number;
    searchResults: ModernSearchResult[];
    registerRef: (pageNum: number, el: HTMLDivElement | null) => void;
}

export const ModernPDFPage: React.FC<ModernPDFPageProps> = React.memo(({
    pageNum,
    pdfDoc,
    pdfjsLib,
    scale,
    rotation,
    readingTheme,
    searchQuery,
    currentSearchIndex,
    searchResults,
    registerRef,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const textLayerRef = useRef<HTMLDivElement>(null);
    const renderTaskRef = useRef<any>(null);
    const debounceTimerRef = useRef<any>(null);

    const [pageInfo, setPageInfo] = useState<ModernPageDimensions | null>(null);
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [isRendered, setIsRendered] = useState(false);
    const [hasBeenRenderedOnce, setHasBeenRenderedOnce] = useState(false);

    // Initial page dimension discovery
    useEffect(() => {
        let active = true;
        const fetchDimensions = async () => {
            if (!pdfDoc) return;
            try {
                const page = await pdfDoc.getPage(pageNum);
                if (!active) return;
                const baseViewport = page.getViewport({ scale: 1.0, rotation });
                setPageInfo({ width: baseViewport.width, height: baseViewport.height });
            } catch (e) {
                console.warn(`Failed to get dimensions for page ${pageNum}:`, e);
            }
        };
        fetchDimensions();
        return () => {
            active = false;
        };
    }, [pdfDoc, pageNum, rotation]);

    // IntersectionObserver with 600px pre-buffer to preload smoothly
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                setIsIntersecting(entry.isIntersecting);
            },
            {
                rootMargin: '600px 0px 600px 0px',
                threshold: 0.01,
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    // Double-Buffered Offscreen Canvas & Vector Text Layer Rendering
    useEffect(() => {
        if (!isIntersecting || !pdfDoc || !pdfjsLib) {
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
                renderTaskRef.current = null;
            }
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            return;
        }

        let active = true;

        const executeRender = async () => {
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
            }

            try {
                const page = await pdfDoc.getPage(pageNum);
                if (!active) return;

                const baseViewport = page.getViewport({ scale: 1.0, rotation });
                if (!pageInfo) {
                    setPageInfo({ width: baseViewport.width, height: baseViewport.height });
                }

                // HiDPI backing buffer calculation (capped at 2x)
                const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
                const actualRenderScale = scale * dpr;
                const viewport = page.getViewport({ scale: actualRenderScale, rotation });

                // 1. Offscreen Double-Buffering: Render into memory canvas first
                const offscreenCanvas = document.createElement('canvas');
                offscreenCanvas.width = Math.round(viewport.width);
                offscreenCanvas.height = Math.round(viewport.height);

                const offscreenContext = offscreenCanvas.getContext('2d', { alpha: false });
                if (!offscreenContext || !active) return;

                // Fill with white background initially
                offscreenContext.fillStyle = '#ffffff';
                offscreenContext.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

                renderTaskRef.current = page.render({
                    canvasContext: offscreenContext,
                    viewport: viewport,
                });

                await renderTaskRef.current.promise;
                if (!active) return;

                // 2. Seamless 0ms frame swap onto visible canvas without blank/black flash
                const visibleCanvas = canvasRef.current;
                if (visibleCanvas) {
                    visibleCanvas.width = offscreenCanvas.width;
                    visibleCanvas.height = offscreenCanvas.height;
                    const visibleContext = visibleCanvas.getContext('2d');
                    if (visibleContext) {
                        visibleContext.drawImage(offscreenCanvas, 0, 0);
                    }
                }

                setIsRendered(true);
                setHasBeenRenderedOnce(true);

                // 3. Render vector text selection layer matching exact layout scale
                if (textLayerRef.current) {
                    textLayerRef.current.innerHTML = '';
                    const textContent = await page.getTextContent();
                    if (!active) return;

                    const scaledViewport = page.getViewport({ scale: scale, rotation });
                    await pdfjsLib.renderTextLayer({
                        textContentSource: textContent,
                        container: textLayerRef.current,
                        viewport: scaledViewport,
                        textDivs: [],
                    }).promise;
                }
            } catch (err: any) {
                if (err.name !== 'RenderingCancelledException') {
                    console.error(`Page ${pageNum} render error:`, err);
                }
            }
        };

        // Debounce render if already rendered once (smooth 60fps CSS scaling while pinch zooming)
        if (hasBeenRenderedOnce) {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = setTimeout(() => {
                executeRender();
            }, 80);
        } else {
            executeRender();
        }

        return () => {
            active = false;
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
            }
        };
    }, [isIntersecting, pageNum, pdfDoc, pdfjsLib, scale, rotation, hasBeenRenderedOnce]);

    // Search matches highlighting
    useEffect(() => {
        if (!isRendered || !textLayerRef.current) return;

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
                    mark.className = `pdf-search-match ${
                        isActivePage && globalMatchCount === activeResult?.matchIndex ? 'active-match' : ''
                    }`;
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
    }, [searchQuery, currentSearchIndex, searchResults, pageNum, isRendered]);

    // Scroll to active search match on this page
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

    // Compute theme styles for canvas
    const getCanvasFilter = () => {
        if (readingTheme === 'dark') {
            return 'invert(0.92) hue-rotate(180deg) brightness(0.95) contrast(1.1)';
        }
        return 'none';
    };

    const getPageBg = () => {
        if (readingTheme === 'dark') return 'bg-[#18181b] border-white/5 shadow-2xl';
        if (readingTheme === 'dark-clean') return 'bg-white border-white/10 shadow-2xl ring-1 ring-white/5';
        return 'bg-white border border-zinc-300/80 shadow-xl';
    };

    // Calculate actual pixel dimensions
    const baseW = pageInfo ? pageInfo.width : 612;
    const baseH = pageInfo ? pageInfo.height : 792;
    const displayWidth = Math.round(baseW * scale);
    const displayHeight = Math.round(baseH * scale);

    return (
        <div
            ref={el => {
                if (el) {
                    containerRef.current = el;
                    registerRef(pageNum, el);
                }
            }}
            data-page={pageNum}
            className={`relative rounded-xl border page-container mb-8 select-text ${getPageBg()}`}
            style={{
                width: `${displayWidth}px`,
                height: `${displayHeight}px`,
                minWidth: `${displayWidth}px`,
                minHeight: `${displayHeight}px`,
                contain: 'layout size',
            }}
        >
            <div className="absolute inset-0 overflow-hidden rounded-xl bg-white">
                {/* Visible Double-Buffered Canvas Layer */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 block w-full h-full rounded-xl pointer-events-none"
                    style={{
                        filter: getCanvasFilter(),
                        transition: 'filter 150ms ease',
                    }}
                />

                {/* Vector Text Layer for Crisp Selection */}
                <div
                    ref={textLayerRef}
                    className="textLayer absolute inset-0 select-text z-20 pointer-events-auto"
                    style={{
                        width: `${displayWidth}px`,
                        height: `${displayHeight}px`,
                        '--scale-factor': scale.toString(),
                    } as any}
                />
            </div>

            {/* Placeholder / Loading Spinner ONLY on First Load */}
            {(!hasBeenRenderedOnce && isIntersecting) && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-50/80 dark:bg-[#09090b]/80 backdrop-blur-xs rounded-xl z-30 animate-fade-in">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                        <span className="text-[10px] font-bold text-zinc-400">Page {pageNum}</span>
                    </div>
                </div>
            )}
        </div>
    );
});
