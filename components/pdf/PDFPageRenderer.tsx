import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SearchResult, ReadingTheme, PageDimensions } from './types.ts';

interface PDFPageRendererProps {
    pageNum: number;
    pdfDoc: any;
    pdfjsLib: any;
    scale: number;
    readingTheme: ReadingTheme;
    searchQuery: string;
    currentSearchIndex: number;
    searchResults: SearchResult[];
    registerRef: (pageNum: number, el: HTMLDivElement | null) => void;
}

export const PDFPageRenderer: React.FC<PDFPageRendererProps> = React.memo(({
    pageNum,
    pdfDoc,
    pdfjsLib,
    scale,
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

    const [pageInfo, setPageInfo] = useState<PageDimensions | null>(null);
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [isRendered, setIsRendered] = useState(false);

    // Initial page dimension discovery
    useEffect(() => {
        let active = true;
        const fetchDimensions = async () => {
            if (!pdfDoc) return;
            try {
                const page = await pdfDoc.getPage(pageNum);
                if (!active) return;
                const baseViewport = page.getViewport({ scale: 1.0 });
                setPageInfo({ width: baseViewport.width, height: baseViewport.height });
            } catch (e) {
                console.warn(`Failed to get dimensions for page ${pageNum}:`, e);
            }
        };
        fetchDimensions();
        return () => {
            active = false;
        };
    }, [pdfDoc, pageNum]);

    // IntersectionObserver for Virtual Windowing (Mount/Unmount Canvas)
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                setIsIntersecting(entry.isIntersecting);
            },
            {
                rootMargin: '450px 0px 450px 0px', // Buffer 1-2 pages above & below
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

    // Canvas & Text Layer Rendering when intersecting
    useEffect(() => {
        if (!isIntersecting || !pdfDoc || !pdfjsLib) {
            // Page is out of view -> Clean up canvas memory immediately
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
                renderTaskRef.current = null;
            }
            if (canvasRef.current) {
                canvasRef.current.width = 0;
                canvasRef.current.height = 0;
            }
            if (textLayerRef.current) {
                textLayerRef.current.innerHTML = '';
            }
            setIsRendered(false);
            return;
        }

        let active = true;

        const renderPage = async () => {
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
            }

            try {
                const page = await pdfDoc.getPage(pageNum);
                if (!active) return;

                const baseViewport = page.getViewport({ scale: 1.0 });
                if (!pageInfo) {
                    setPageInfo({ width: baseViewport.width, height: baseViewport.height });
                }

                // Optimal resolution calculation
                const maxPixelRatio = window.innerWidth < 768 ? 1.5 : 2;
                const pixelRatio = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
                const renderScale = Math.max(1.2, scale) * pixelRatio;
                const viewport = page.getViewport({ scale: renderScale });

                const canvas = canvasRef.current;
                if (!canvas) return;

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                const context = canvas.getContext('2d', { alpha: false });
                if (!context || !active) return;

                renderTaskRef.current = page.render({
                    canvasContext: context,
                    viewport: viewport,
                });

                await renderTaskRef.current.promise;
                if (!active) return;

                setIsRendered(true);

                // Render vector text selection layer
                if (textLayerRef.current) {
                    textLayerRef.current.innerHTML = '';
                    const textContent = await page.getTextContent();
                    if (!active) return;

                    await pdfjsLib.renderTextLayer({
                        textContentSource: textContent,
                        container: textLayerRef.current,
                        viewport: baseViewport,
                        textDivs: [],
                    }).promise;
                }
            } catch (err: any) {
                if (err.name !== 'RenderingCancelledException') {
                    console.error(`Page ${pageNum} render error:`, err);
                }
            }
        };

        renderPage();

        return () => {
            active = false;
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
            }
        };
    }, [isIntersecting, pageNum, pdfDoc, pdfjsLib, scale]);

    // Search query match highlighting
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

    // Compute theme filters for canvas
    const getCanvasFilter = () => {
        if (readingTheme === 'dark') {
            return 'invert(0.92) hue-rotate(180deg) brightness(0.95) contrast(1.1)';
        }
        return 'none';
    };

    return (
        <div
            ref={el => {
                if (el) {
                    containerRef.current = el;
                    registerRef(pageNum, el);
                }
            }}
            data-page={pageNum}
            className={`relative rounded-xl origin-top-left border overflow-visible page-container shadow-lg transition-colors duration-200 ${
                readingTheme === 'dark'
                    ? 'bg-[#18181b] border-white/5'
                    : readingTheme === 'dark-clean'
                    ? 'bg-white border-white/15 shadow-2xl ring-1 ring-white/5'
                    : 'bg-white border-zinc-200 shadow-md'
            }`}
            style={{
                width: pageInfo ? `${pageInfo.width}px` : '612px',
                height: pageInfo ? `${pageInfo.height}px` : '792px',
                marginBottom: '28px',
                contain: 'layout size',
                willChange: 'transform',
            }}
        >
            <div className="absolute inset-0 overflow-hidden rounded-xl">
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 block w-full h-full rounded-xl"
                    style={{
                        backfaceVisibility: 'hidden',
                        filter: getCanvasFilter(),
                        transition: 'filter 200ms ease',
                    }}
                />

                {/* Selectable Vector Text Layer */}
                <div
                    ref={textLayerRef}
                    className="textLayer absolute inset-0 select-text z-20"
                    style={{
                        width: pageInfo ? `${pageInfo.width}px` : '100%',
                        height: pageInfo ? `${pageInfo.height}px` : '100%',
                        transform: 'scale(1.0)',
                        transformOrigin: 'top left',
                        '--scale-factor': '1.0',
                    } as any}
                />

                {/* Watermark Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none z-30 watermark-overlay" />
            </div>

            {(!isRendered && isIntersecting) && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-50/80 dark:bg-[#060606]/80 backdrop-blur-xs rounded-xl z-30 animate-fade-in">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-7 h-7 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                        <span className="text-[10px] font-bold text-zinc-400">Loading Page {pageNum}...</span>
                    </div>
                </div>
            )}
        </div>
    );
});
