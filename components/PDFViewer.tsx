import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { LibraryFile, UserProfile } from '../types.ts';
import { useUniversity } from '../hooks/useUniversity.tsx';
import NexusServer from '../services/nexusServer.ts';
import { showToast } from './Toast.tsx';

// Modular PDF components
import { PDFViewerProps, SearchResult, PDFOutlineItem, ReadingTheme, ViewFitMode } from './pdf/types.ts';
import { PDFToolbar } from './pdf/toolbar/PDFToolbar.tsx';
import { PDFSidebar } from './pdf/sidebar/PDFSidebar.tsx';
import { PDFPageRenderer } from './pdf/PDFPageRenderer.tsx';
import { PDFFloatingToolbar } from './pdf/PDFFloatingToolbar.tsx';
import { DocxRenderer } from './pdf/renderers/DocxRenderer.tsx';
import { ImageRenderer } from './pdf/renderers/ImageRenderer.tsx';
import { LegacyDocFallback } from './pdf/renderers/LegacyDocFallback.tsx';
import { executeSecureDownload } from './pdf/utils/pdfDownloader.ts';

const PDFViewer: React.FC<PDFViewerProps> = ({
    url,
    fileId,
    file,
    onClose,
    fileName,
    userProfile,
    onAuthRequired,
}) => {
    const { fullBrandName } = useUniversity();
    const isAdmin = userProfile?.is_admin || false;

    // Document State
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [viewMode, setViewMode] = useState<ViewFitMode>('width');
    const [isLoading, setIsLoading] = useState(true);
    const [loadProgress, setLoadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [pdfDoc, setPdfDoc] = useState<any>(null);
    const [pdfjsLibState, setPdfjsLibState] = useState<any>(null);
    const [outline, setOutline] = useState<PDFOutlineItem[]>([]);
    const [displayFileName, setDisplayFileName] = useState(fileName);
    const [active, setActive] = useState(false);

    // Multi-format state
    const [isImage, setIsImage] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageRotation, setImageRotation] = useState(0);
    const [isDocx, setIsDocx] = useState(false);
    const [isLegacyDoc, setIsLegacyDoc] = useState(false);
    const [docxBuffer, setDocxBuffer] = useState<ArrayBuffer | null>(null);
    const [docxRenderFailed, setDocxRenderFailed] = useState(false);
    const rawDocBytesRef = useRef<Uint8Array | null>(null);
    const pdfBytesRef = useRef<Uint8Array | null>(null);

    // UI & Navigation State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showToolbar, setShowToolbar] = useState(true);
    const [readingTheme, setReadingTheme] = useState<ReadingTheme>(() => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });
    const [progressPercent, setProgressPercent] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchSnippets, setSearchSnippets] = useState<{ pageIndex: number; snippet: string }[]>([]);
    const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);

    // Text Selection & Floating Menu State
    const [floatingMenuPos, setFloatingMenuPos] = useState<{ x: number; y: number } | null>(null);
    const [selectedText, setSelectedText] = useState('');

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const zoomWrapperRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
    const visiblePages = useRef<Set<number>>(new Set());
    const observerRef = useRef<IntersectionObserver | null>(null);
    const scaleRef = useRef(scale);
    const lastScrollYRef = useRef(0);
    const pendingUpdate = useRef<{ scale: number; scrollTop?: number } | null>(null);
    const animationFrameId = useRef<number | null>(null);
    const zoomingTimeoutRef = useRef<any>(null);

    // Fade-in animation on mount
    useEffect(() => {
        const raf = requestAnimationFrame(() => setActive(true));
        return () => cancelAnimationFrame(raf);
    }, []);

    // Sync file name
    useEffect(() => {
        setDisplayFileName(fileName);
    }, [fileName]);

    // Study Time Heartbeat Telemetry (30s)
    const lastTrackTimeRef = useRef<number>(Date.now());
    useEffect(() => {
        if (!userProfile?.id) return;
        const TRACK_INTERVAL = 30000;
        const intervalId = setInterval(async () => {
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - lastTrackTimeRef.current) / 1000);
            if (elapsedSeconds > 0) {
                lastTrackTimeRef.current = now;
                try {
                    await NexusServer.incrementStudyStats({ pdfStudyTime: elapsedSeconds });
                } catch (e) {
                    console.error("Study time heartbeat failed:", e);
                }
            }
        }, TRACK_INTERVAL);

        return () => {
            clearInterval(intervalId);
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - lastTrackTimeRef.current) / 1000);
            if (elapsedSeconds > 0) {
                NexusServer.incrementStudyStats({ pdfStudyTime: elapsedSeconds }).catch(() => {});
            }
        };
    }, [userProfile?.id]);

    // Handle Close
    const handleClose = (resolvedFile?: any) => {
        setActive(false);
        setTimeout(() => {
            const fileObj = (resolvedFile && typeof resolvedFile === 'object' && 'id' in resolvedFile)
                ? resolvedFile as LibraryFile
                : undefined;
            onClose(fileObj);
        }, 300);
    };

    // Load PDF.js engine and Document
    useEffect(() => {
        document.body.style.overflow = 'hidden';

        const initPdf = async () => {
            const pdfjsLib = (window as any).pdfjsLib;
            if (!pdfjsLib) {
                console.error("PDF.js library is not loaded.");
                setError("Failed to load PDF viewer engine.");
                setIsLoading(false);
                return;
            }
            pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
            setPdfjsLibState(pdfjsLib);

            try {
                setIsLoading(true);
                setLoadProgress(0);
                setError(null);

                let targetUrl = url;
                const pathToCheck = file?.storage_path || url || fileName || '';
                const isImg = /\.(png|jpg|jpeg|webp|svg|gif)$/i.test(pathToCheck);
                const isDocxFile = /\.docx$/i.test(pathToCheck);
                const isLegacyDocFile = /\.doc$/i.test(pathToCheck);

                // 1. Image Handler
                if (isImg) {
                    setIsImage(true);
                    let targetImgUrl = url;
                    if (!targetImgUrl && file) {
                        setDisplayFileName(file.name);
                        try {
                            const client = NexusServer.getClient();
                            if (client) {
                                const { data, error } = await client.storage.from('nexus-documents').download(file.storage_path);
                                if (!error && data) {
                                    targetImgUrl = URL.createObjectURL(data);
                                }
                            }
                        } catch (imgErr) {
                            console.warn("Image direct download failed, trying proxy...", imgErr);
                        }

                        if (!targetImgUrl) {
                            const sessionRes = await NexusServer.getSession();
                            const token = sessionRes?.data?.session?.access_token;
                            targetImgUrl = NexusServer.getFileUrl(file.storage_path, token) || undefined;
                        }
                    }

                    if (targetImgUrl) {
                        setImageUrl(targetImgUrl);
                        setIsLoading(false);
                        setNumPages(1);
                        return;
                    }
                }

                // 2. Word Document Handler
                if (isDocxFile || isLegacyDocFile) {
                    if (isDocxFile) setIsDocx(true);
                    if (isLegacyDocFile) setIsLegacyDoc(true);
                    if (file) setDisplayFileName(file.name);

                    let arrayBuffer: ArrayBuffer | null = null;
                    if (file) {
                        try {
                            const client = NexusServer.getClient();
                            if (client) {
                                const { data, error } = await client.storage.from('nexus-documents').download(file.storage_path);
                                if (!error && data) {
                                    arrayBuffer = await data.arrayBuffer();
                                }
                            }
                        } catch (e) {
                            console.warn("Direct download failed for Word doc:", e);
                        }

                        if (!arrayBuffer) {
                            try {
                                const sessionRes = await NexusServer.getSession();
                                const token = sessionRes?.data?.session?.access_token;
                                const resolvedUrl = NexusServer.getFileUrl(file.storage_path, token);
                                if (resolvedUrl) {
                                    const resp = await fetch(resolvedUrl, {
                                        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                                    });
                                    if (resp.ok) arrayBuffer = await resp.arrayBuffer();
                                }
                            } catch (proxyErr) {
                                console.warn("Proxy download failed for Word doc:", proxyErr);
                            }
                        }
                    } else if (url) {
                        try {
                            const resp = await fetch(url);
                            if (resp.ok) arrayBuffer = await resp.arrayBuffer();
                        } catch (urlErr) {
                            console.warn("URL fetch failed for Word doc:", urlErr);
                        }
                    }

                    if (arrayBuffer) {
                        rawDocBytesRef.current = new Uint8Array(arrayBuffer);
                        if (isDocxFile) setDocxBuffer(arrayBuffer);
                        setIsLoading(false);
                        setNumPages(1);
                        return;
                    }
                }

                // 3. PDF Handler
                if (!targetUrl && file) {
                    const client = NexusServer.getClient();
                    if (client) {
                        try {
                            const { data, error } = await client.storage.from('nexus-documents').download(file.storage_path);
                            if (!error && data) {
                                const buffer = await data.arrayBuffer();
                                pdfBytesRef.current = new Uint8Array(buffer);
                                targetUrl = URL.createObjectURL(data);
                            }
                        } catch (downloadErr) {
                            console.warn("Direct storage download failed, falling back...", downloadErr);
                        }
                    }

                    if (!targetUrl) {
                        const sessionRes = await NexusServer.getSession();
                        const token = sessionRes?.data?.session?.access_token;
                        targetUrl = NexusServer.getFileUrl(file.storage_path, token) || undefined;
                    }
                }

                if (!targetUrl) {
                    throw new Error("Unable to resolve document URL.");
                }

                const loadingTask = pdfjsLib.getDocument({
                    url: targetUrl,
                    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
                    cMapPacked: true,
                });

                loadingTask.onProgress = (progressData: { loaded: number; total: number }) => {
                    if (progressData.total > 0) {
                        setLoadProgress(Math.round((progressData.loaded / progressData.total) * 100));
                    }
                };

                const loadedPdf = await loadingTask.promise;
                setPdfDoc(loadedPdf);
                setNumPages(loadedPdf.numPages);

                // Fetch Table of Contents / Outlines
                try {
                    const outlineData = await loadedPdf.getOutline();
                    if (outlineData && Array.isArray(outlineData)) {
                        // Resolve page numbers for outline items
                        const resolvedOutline: PDFOutlineItem[] = [];
                        for (const item of outlineData) {
                            let pageNum: number | undefined;
                            if (item.dest) {
                                if (typeof item.dest === 'string') {
                                    const dest = await loadedPdf.getDestination(item.dest);
                                    if (dest && dest[0]) {
                                        const pageIndex = await loadedPdf.getPageIndex(dest[0]);
                                        pageNum = pageIndex + 1;
                                    }
                                } else if (Array.isArray(item.dest) && item.dest[0]) {
                                    const pageIndex = await loadedPdf.getPageIndex(item.dest[0]);
                                    pageNum = pageIndex + 1;
                                }
                            }
                            resolvedOutline.push({
                                title: item.title,
                                dest: item.dest,
                                pageNumber: pageNum,
                                items: item.items,
                            });
                        }
                        setOutline(resolvedOutline);
                    }
                } catch (outlineErr) {
                    console.warn("Failed to load PDF outline:", outlineErr);
                }

                setIsLoading(false);
            } catch (err: any) {
                console.error("PDF viewer loading error:", err);
                setError(err.message || "Failed to load document.");
                setIsLoading(false);
            }
        };

        initPdf();

        return () => {
            document.body.style.overflow = '';
        };
    }, [url, file, fileName]);

    // Active page observation during scrolling
    useEffect(() => {
        if (!containerRef.current || numPages === 0) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const page = Number(entry.target.getAttribute('data-page'));
                    if (entry.isIntersecting) {
                        visiblePages.current.add(page);
                    } else {
                        visiblePages.current.delete(page);
                    }
                });

                if (visiblePages.current.size > 0) {
                    const sorted = Array.from<number>(visiblePages.current).sort((a, b) => a - b);
                    const topPage: number = sorted[0];
                    setCurrentPage(topPage);
                    setProgressPercent(Math.round((topPage / numPages) * 100));
                }
            },
            {
                root: containerRef.current,
                threshold: 0.1,
            }
        );

        return () => {
            observerRef.current?.disconnect();
        };
    }, [numPages]);

    const registerPageRef = useCallback((pageNum: number, el: HTMLDivElement | null) => {
        pageRefs.current[pageNum] = el;
        if (el && observerRef.current) {
            observerRef.current.observe(el);
        }
    }, []);

    // 2-Phase Zoom: GPU CSS Scale + Debounced crisp state sync
    const updateDOMScale = useCallback((currentScale: number, scrollTop?: number) => {
        pendingUpdate.current = { scale: currentScale, scrollTop };

        if (animationFrameId.current === null) {
            animationFrameId.current = requestAnimationFrame(() => {
                if (pendingUpdate.current && containerRef.current) {
                    const { scale: s, scrollTop: top } = pendingUpdate.current;
                    containerRef.current.style.setProperty('--pdf-scale', s.toString());
                    if (top !== undefined) containerRef.current.scrollTop = top;
                }
                animationFrameId.current = null;
                pendingUpdate.current = null;
            });
        }

        if (zoomingTimeoutRef.current) clearTimeout(zoomingTimeoutRef.current);
        zoomingTimeoutRef.current = setTimeout(() => {
            setScale(currentScale);
            scaleRef.current = currentScale;
        }, 220);
    }, []);

    const handleZoom = useCallback((nextScale: number) => {
        const clamped = Math.min(3.5, Math.max(0.3, nextScale));
        if (clamped === scaleRef.current) return;

        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const focalY = rect.height / 2;
        const ratio = clamped / scaleRef.current;
        const nextTop = (container.scrollTop + focalY) * ratio - focalY;

        scaleRef.current = clamped;
        updateDOMScale(clamped, nextTop);
    }, [updateDOMScale]);

    const toggleFit = useCallback(() => {
        if (!containerRef.current) return;
        const containerWidth = containerRef.current.clientWidth - 48;
        if (viewMode === 'width') {
            // Switch to fit whole page
            const containerHeight = containerRef.current.clientHeight - 80;
            const targetScale = Math.min(containerWidth / 612, containerHeight / 792, 1.0);
            setViewMode('page');
            handleZoom(targetScale);
        } else {
            // Fit to width
            const targetScale = Math.min(2.0, Math.max(0.6, containerWidth / 612));
            setViewMode('width');
            handleZoom(targetScale);
        }
    }, [viewMode, handleZoom]);

    // Jump to specific page
    const jumpToPage = useCallback((pageNum: number) => {
        const target = Math.max(1, Math.min(numPages, pageNum));
        setCurrentPage(target);
        const pageEl = pageRefs.current[target];
        if (pageEl) {
            pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [numPages]);

    // In-document Search Engine
    const performSearch = useCallback(async () => {
        if (!searchQuery.trim() || !pdfDoc) {
            setSearchResults([]);
            setSearchSnippets([]);
            setCurrentSearchIndex(-1);
            return;
        }

        const query = searchQuery.trim().toLowerCase();
        const results: SearchResult[] = [];
        const snippets: { pageIndex: number; snippet: string }[] = [];

        for (let i = 1; i <= pdfDoc.numPages; i++) {
            try {
                const page = await pdfDoc.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                const pageTextLower = pageText.toLowerCase();

                let matchIndex = 0;
                let lastPos = 0;
                while ((lastPos = pageTextLower.indexOf(query, lastPos)) !== -1) {
                    results.push({
                        pageIndex: i,
                        matchIndex,
                        totalMatchesInPage: 0,
                    });

                    // Build snippet around the match
                    const snippetStart = Math.max(0, lastPos - 40);
                    const snippetEnd = Math.min(pageText.length, lastPos + query.length + 40);
                    const snippet = (snippetStart > 0 ? '...' : '') +
                        pageText.substring(snippetStart, snippetEnd).trim() +
                        (snippetEnd < pageText.length ? '...' : '');

                    snippets.push({ pageIndex: i, snippet });

                    matchIndex++;
                    lastPos += query.length;
                }
            } catch (searchErr) {
                console.warn(`Search failed on page ${i}:`, searchErr);
            }
        }

        setSearchResults(results);
        setSearchSnippets(snippets);

        if (results.length > 0) {
            setCurrentSearchIndex(0);
            jumpToPage(results[0].pageIndex);
        } else {
            setCurrentSearchIndex(-1);
            showToast(`No matches found for "${searchQuery}"`, 'info');
        }
    }, [searchQuery, pdfDoc, jumpToPage]);

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

    // Text Selection Event Listener for Floating Action Bar
    const handleMouseUp = () => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 2) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setSelectedText(selection.toString());
            setFloatingMenuPos({
                x: rect.left + rect.width / 2,
                y: rect.top,
            });
        } else {
            setFloatingMenuPos(null);
            setSelectedText('');
        }
    };

    // Fullscreen Toggle
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
            setIsFullscreen(true);
        } else {
            document.exitFullscreen().catch(() => {});
            setIsFullscreen(false);
        }
    };

    // Scroll Handler for Toolbar Autohide
    const handleScroll = (e: React.UIEvent<HTMLElement>) => {
        const currentScrollY = e.currentTarget.scrollTop;
        if (currentScrollY > lastScrollYRef.current + 30 && currentScrollY > 100) {
            setShowToolbar(false);
        } else if (currentScrollY < lastScrollYRef.current - 20 || currentScrollY < 60) {
            setShowToolbar(true);
        }
        lastScrollYRef.current = currentScrollY;
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.key === 'Escape') {
                if (isSidebarOpen) setIsSidebarOpen(false);
                else handleClose();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                setShowToolbar(true);
                const searchInput = document.querySelector('input[placeholder="Find..."]') as HTMLInputElement;
                searchInput?.focus();
            } else if (e.key === '=' || e.key === '+') {
                handleZoom(scaleRef.current + 0.15);
            } else if (e.key === '-') {
                handleZoom(scaleRef.current - 0.15);
            } else if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleZoom(1.0);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSidebarOpen, handleZoom]);

    // Download handler
    const triggerDownload = async () => {
        setIsDownloading(true);
        await executeSecureDownload({
            url,
            fileId,
            file,
            displayFileName,
            fileName,
            userProfile,
            isAdmin,
            isDocx,
            isLegacyDoc,
            isImage,
            pdfBytes: pdfBytesRef.current,
        });
        setIsDownloading(false);
    };

    if (error) {
        return createPortal(
            <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center p-6 animate-fade-in">
                <div className="text-center space-y-6 max-w-sm">
                    <div className="w-20 h-20 bg-red-500/10 rounded-[32px] flex items-center justify-center text-red-500 border border-red-500/20 mx-auto">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-10 h-10"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Document Unavailable</h3>
                    <p className="text-xs text-zinc-400 font-medium leading-relaxed">{error}</p>
                    <button
                        onClick={handleClose}
                        className="bg-white text-black px-8 py-3.5 rounded-2xl text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-xl border-none cursor-pointer"
                    >
                        Return to Library
                    </button>
                </div>
            </div>,
            document.getElementById('modal-root') || document.body
        );
    }

    return createPortal(
        <div
            className={`fixed inset-0 z-[9999] flex flex-col overflow-hidden pdf-viewer-overlay transition-all duration-300 ${
                readingTheme === 'light'
                    ? 'bg-zinc-100 text-zinc-900'
                    : 'bg-[#09090b] text-zinc-100'
            } ${active ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-[0.98] pointer-events-none'}`}
            onMouseUp={handleMouseUp}
        >
            {/* Top Toolbar */}
            <PDFToolbar
                showToolbar={showToolbar}
                displayFileName={displayFileName}
                fullBrandName={fullBrandName}
                isDocx={isDocx}
                isLegacyDoc={isLegacyDoc}
                isImage={isImage}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
                onClose={handleClose}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSearchSubmit={performSearch}
                searchResults={searchResults}
                currentSearchIndex={currentSearchIndex}
                onPrevSearch={prevSearch}
                onNextSearch={nextSearch}
                scale={scale}
                onZoomIn={() => handleZoom(scaleRef.current + 0.15)}
                onZoomOut={() => handleZoom(scaleRef.current - 0.15)}
                viewMode={viewMode}
                onToggleFit={toggleFit}
                onRotateImage={isImage ? () => setImageRotation(prev => (prev + 90) % 360) : undefined}
                currentPage={currentPage}
                numPages={numPages}
                onJumpToPage={jumpToPage}
                progressPercent={progressPercent}
                readingTheme={readingTheme}
                onSetTheme={setReadingTheme}
                isFullscreen={isFullscreen}
                onToggleFullscreen={toggleFullscreen}
                isDownloading={isDownloading}
                onDownload={triggerDownload}
            />

            {/* Sidebar (Thumbnails, Outline, Search) */}
            <PDFSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                numPages={numPages}
                currentPage={currentPage}
                pdfDoc={pdfDoc}
                outline={outline}
                searchResults={searchResults}
                searchSnippets={searchSnippets}
                currentSearchIndex={currentSearchIndex}
                searchQuery={searchQuery}
                onJumpToPage={jumpToPage}
                onSelectSearchResult={(idx) => {
                    setCurrentSearchIndex(idx);
                    jumpToPage(searchResults[idx].pageIndex);
                }}
            />

            {/* Floating Context Menu on Selection */}
            <PDFFloatingToolbar
                position={floatingMenuPos}
                selectedText={selectedText}
                currentPage={currentPage}
                fileName={displayFileName}
                onClose={() => {
                    setFloatingMenuPos(null);
                    setSelectedText('');
                }}
            />

            {/* Main Document Content Area */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
                <main
                    ref={containerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-auto relative touch-auto overscroll-none pt-14 md:pt-16 animate-fade-in custom-scrollbar"
                    style={{
                        WebkitOverflowScrolling: 'touch',
                        overscrollBehavior: 'none',
                        '--pdf-scale': scale.toString(),
                    } as any}
                >
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-100/60 dark:bg-[#0a0a0a]/60 backdrop-blur-sm z-30">
                            <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                                <div className="w-14 h-14 border-3 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                            </div>
                            <h4 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest animate-pulse">
                                Loading Document... {loadProgress > 0 && `${loadProgress}%`}
                            </h4>
                        </div>
                    ) : (
                        <>
                            {isImage && imageUrl ? (
                                <ImageRenderer
                                    imageUrl={imageUrl}
                                    displayFileName={displayFileName}
                                    scale={scale}
                                    rotation={imageRotation}
                                    onZoom={handleZoom}
                                />
                            ) : isDocx && !docxRenderFailed && docxBuffer ? (
                                <DocxRenderer
                                    docxBuffer={docxBuffer}
                                    scale={scale}
                                    onZoom={handleZoom}
                                    onError={() => setDocxRenderFailed(true)}
                                />
                            ) : isLegacyDoc || (isDocx && docxRenderFailed) ? (
                                <LegacyDocFallback
                                    displayFileName={displayFileName}
                                    isLegacyDoc={isLegacyDoc}
                                    isDownloading={isDownloading}
                                    onDownload={triggerDownload}
                                />
                            ) : (
                                <div
                                    ref={zoomWrapperRef}
                                    className="flex flex-col items-center min-w-max mx-auto px-4 md:px-8"
                                    style={{
                                        transform: 'scale(var(--pdf-scale)) translateZ(0)',
                                        transformOrigin: 'top center',
                                        willChange: 'transform',
                                        paddingBottom: 'calc(60px * var(--pdf-scale))',
                                    }}
                                >
                                    {Array.from({ length: numPages }).map((_, i) => (
                                        <PDFPageRenderer
                                            key={i}
                                            pageNum={i + 1}
                                            pdfDoc={pdfDoc}
                                            pdfjsLib={pdfjsLibState}
                                            scale={scale}
                                            readingTheme={readingTheme}
                                            searchQuery={searchQuery}
                                            currentSearchIndex={currentSearchIndex}
                                            searchResults={searchResults}
                                            registerRef={registerPageRef}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>

                {/* Floating Mobile Page Pill */}
                {numPages > 1 && (
                    <div
                        className="md:hidden fixed bottom-6 right-6 z-40 text-white px-3.5 py-1.5 rounded-full font-bold text-[11px] shadow-2xl animate-fade-in flex items-center gap-1.5 border border-white/20"
                        style={{ backgroundColor: 'var(--brand-primary)' }}
                    >
                        <span>{currentPage} / {numPages}</span>
                        <span className="opacity-40">•</span>
                        <span>{progressPercent}%</span>
                    </div>
                )}
            </div>

            {/* Custom Embedded Styles */}
            <style>{`
                .pdf-viewer-overlay {
                    transition: opacity 250ms cubic-bezier(0.16, 1, 0.3, 1), transform 250ms cubic-bezier(0.16, 1, 0.3, 1);
                }
                .textLayer {
                    position: absolute;
                    left: 0;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    overflow: hidden;
                    line-height: 1;
                    user-select: text;
                    pointer-events: auto;
                }
                .textLayer > span {
                    color: transparent;
                    position: absolute;
                    white-space: pre;
                    cursor: text;
                    transform-origin: 0% 0%;
                }
                .textLayer ::selection {
                    background: rgba(234, 88, 12, 0.35);
                    color: transparent;
                }
                mark.pdf-search-match {
                    background-color: rgba(234, 88, 12, 0.35);
                    color: transparent;
                    border-radius: 2px;
                }
                mark.pdf-search-match.active-match {
                    background-color: #ea580c;
                    color: transparent;
                    box-shadow: 0 0 12px rgba(234, 88, 12, 0.5);
                    z-index: 10;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(150, 150, 150, 0.25);
                    border-radius: 999px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(150, 150, 150, 0.45);
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>,
        document.getElementById('modal-root') || document.body
    );
};

export default PDFViewer;
