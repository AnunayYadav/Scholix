import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { LibraryFile } from '../../types.ts';
import { useUniversity } from '../../hooks/useUniversity.tsx';
import NexusServer from '../../services/nexusServer.ts';
import { showToast } from '../Toast.tsx';

// Modern PDF Components
import {
    ModernPDFViewerProps,
    ModernReadingTheme,
    ModernViewFitMode,
    ModernSearchResult,
    ModernPDFOutlineItem,
    ModernBookmark,
} from './modernTypes.ts';
import { ModernPDFToolbar } from './ModernPDFToolbar.tsx';
import { ModernPDFSidebar } from './ModernPDFSidebar.tsx';
import { ModernPDFPage } from './ModernPDFPage.tsx';
import { ModernPDFSelectionMenu } from './ModernPDFSelectionMenu.tsx';
import { ModernPDFShortcutsModal } from './ModernPDFShortcutsModal.tsx';
import { DocxRenderer } from './renderers/DocxRenderer.tsx';
import { ImageRenderer } from './renderers/ImageRenderer.tsx';
import { LegacyDocFallback } from './renderers/LegacyDocFallback.tsx';
import { executeSecureDownload } from './utils/pdfDownloader.ts';

export const ModernPDFViewer: React.FC<ModernPDFViewerProps> = ({
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
    const [rotation, setRotation] = useState(0);
    const [viewMode, setViewMode] = useState<ModernViewFitMode>('page');
    const [isLoading, setIsLoading] = useState(true);
    const [loadProgress, setLoadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [pdfDoc, setPdfDoc] = useState<any>(null);
    const [pdfjsLibState, setPdfjsLibState] = useState<any>(null);
    const [outline, setOutline] = useState<ModernPDFOutlineItem[]>([]);
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
    const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
    const [progressPercent, setProgressPercent] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);

    // Reading Theme (Matching previous viewer: dark / dark-clean / light)
    const [readingTheme, setReadingTheme] = useState<ModernReadingTheme>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('scholix_pdf_theme') as ModernReadingTheme | null;
            if (saved && (saved === 'dark' || saved === 'dark-clean' || saved === 'light')) {
                return saved;
            }
        }
        return typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });

    const handleSetTheme = useCallback((nextTheme: ModernReadingTheme) => {
        setReadingTheme(nextTheme);
        try {
            localStorage.setItem('scholix_pdf_theme', nextTheme);
        } catch (e) {
            console.warn('Failed to save reading theme preference:', e);
        }
    }, []);

    // Bookmarks
    const [bookmarks, setBookmarks] = useState<ModernBookmark[]>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem(`scholix_bookmarks_${fileId || fileName}`);
                if (saved) return JSON.parse(saved);
            } catch {}
        }
        return [];
    });

    const handleToggleBookmark = useCallback((pageNum: number, noteTitle?: string) => {
        setBookmarks(prev => {
            const exists = prev.some(b => b.pageNumber === pageNum);
            let updated: ModernBookmark[];
            if (exists) {
                updated = prev.filter(b => b.pageNumber !== pageNum);
                showToast(`Bookmark removed for Page ${pageNum}`, 'info');
            } else {
                updated = [...prev, { pageNumber: pageNum, title: noteTitle || `Page ${pageNum}`, createdAt: Date.now() }];
                showToast(`Bookmarked Page ${pageNum}`, 'success');
            }
            try {
                localStorage.setItem(`scholix_bookmarks_${fileId || fileName}`, JSON.stringify(updated));
            } catch {}
            return updated;
        });
    }, [fileId, fileName]);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ModernSearchResult[]>([]);
    const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);

    // Text Selection & Floating Menu State
    const [floatingMenuPos, setFloatingMenuPos] = useState<{ x: number; y: number } | null>(null);
    const [selectedText, setSelectedText] = useState('');

    // Refs
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
    const visiblePages = useRef<Set<number>>(new Set());
    const observerRef = useRef<IntersectionObserver | null>(null);
    const scaleRef = useRef(scale);
    scaleRef.current = scale;
    const lastScrollYRef = useRef(0);

    // Touch Pinch state
    const touchStartDistRef = useRef<number | null>(null);
    const touchStartScaleRef = useRef<number>(1.0);
    const lastTapTimeRef = useRef<number>(0);

    // Fade-in animation on mount
    useEffect(() => {
        const raf = requestAnimationFrame(() => setActive(true));
        return () => cancelAnimationFrame(raf);
    }, []);

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
    const handleClose = useCallback((resolvedFile?: any) => {
        setActive(false);
        setTimeout(() => {
            const fileObj = (resolvedFile && typeof resolvedFile === 'object' && 'id' in resolvedFile)
                ? resolvedFile as LibraryFile
                : undefined;
            onClose(fileObj);
        }, 250);
    }, [onClose]);

    // Load PDF engine and document
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
                        const resolvedOutline: ModernPDFOutlineItem[] = [];
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
        if (!scrollContainerRef.current || numPages === 0) return;

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

                if (visiblePages.current.size > 0 && !isZoomingRef.current) {
                    const sorted = Array.from<number>(visiblePages.current).sort((a, b) => a - b);
                    const topPage: number = sorted[0];
                    setCurrentPage(topPage);
                    setProgressPercent(Math.round((topPage / numPages) * 100));
                }
            },
            {
                root: scrollContainerRef.current,
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

    const zoomAnchorRef = useRef<{
        page: number;
        targetX: number;
        targetY: number;
        offsetXInPage: number;
        offsetYInPage: number;
        nextScale: number;
    } | null>(null);
    const isZoomingRef = useRef(false);
    const zoomTimeoutRef = useRef<any>(null);

    // Zoom Calculation Functions
    const calculateFitScale = useCallback((mode: ModernViewFitMode, baseWidth = 612, baseHeight = 792) => {
        if (typeof window === 'undefined') return 1.0;
        const isMobile = window.innerWidth < 768;
        const containerWidth = scrollContainerRef.current
            ? Math.max(180, scrollContainerRef.current.clientWidth - (isMobile ? 16 : 48))
            : Math.max(180, window.innerWidth - (isMobile ? 16 : 48));
        const containerHeight = scrollContainerRef.current
            ? Math.max(260, scrollContainerRef.current.clientHeight - (isMobile ? 64 : 96))
            : Math.max(260, window.innerHeight - (isMobile ? 64 : 96));

        if (mode === 'page') {
            const scaleX = containerWidth / baseWidth;
            const scaleY = containerHeight / baseHeight;
            return Math.min(scaleX, scaleY, 1.1);
        } else {
            return Math.min(3.0, Math.max(0.3, containerWidth / baseWidth));
        }
    }, []);

    // Smooth Focal-Point Zooming with Cursor / Pinch Focal Locking
    const handleZoomWithFocal = useCallback((nextScale: number, clientX?: number, clientY?: number) => {
        const clamped = Math.min(3.5, Math.max(0.35, nextScale));
        const container = scrollContainerRef.current;
        if (!container || clamped === scaleRef.current) return;

        isZoomingRef.current = true;
        if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
        zoomTimeoutRef.current = setTimeout(() => {
            isZoomingRef.current = false;
        }, 220);

        const containerRect = container.getBoundingClientRect();
        const targetX = clientX !== undefined ? clientX : (containerRect.left + containerRect.width / 2);
        const targetY = clientY !== undefined ? clientY : (containerRect.top + containerRect.height / 2);

        // Find the page currently under the cursor / focal point
        let anchorPage = currentPage;
        let targetPageEl = pageRefs.current[anchorPage];

        if (typeof document !== 'undefined') {
            const elAtPoint = document.elementFromPoint(targetX, targetY);
            const pageEl = elAtPoint?.closest('[data-page]') as HTMLDivElement | null;
            if (pageEl) {
                const pNum = Number(pageEl.getAttribute('data-page'));
                if (pNum && pageRefs.current[pNum]) {
                    anchorPage = pNum;
                    targetPageEl = pageRefs.current[pNum];
                }
            }
        }

        if (!targetPageEl) targetPageEl = pageRefs.current[anchorPage];

        let offsetXInPage = 0;
        let offsetYInPage = 0;

        if (targetPageEl) {
            const pageRect = targetPageEl.getBoundingClientRect();
            offsetXInPage = (targetX - pageRect.left) / scaleRef.current;
            offsetYInPage = (targetY - pageRect.top) / scaleRef.current;
        }

        zoomAnchorRef.current = {
            page: anchorPage,
            targetX,
            targetY,
            offsetXInPage,
            offsetYInPage,
            nextScale: clamped,
        };

        setScale(clamped);
        scaleRef.current = clamped;
    }, [currentPage]);

    // Restore exact focal position under cursor / pinch point (Pixel-Perfect Focal Zoom)
    React.useLayoutEffect(() => {
        if (zoomAnchorRef.current && scrollContainerRef.current) {
            const { page, targetX, targetY, offsetXInPage, offsetYInPage, nextScale } = zoomAnchorRef.current;
            const targetPageEl = pageRefs.current[page];
            const container = scrollContainerRef.current;

            if (targetPageEl && container) {
                const newPageRect = targetPageEl.getBoundingClientRect();
                const currentPointScreenX = newPageRect.left + offsetXInPage * nextScale;
                const currentPointScreenY = newPageRect.top + offsetYInPage * nextScale;

                const deltaX = currentPointScreenX - targetX;
                const deltaY = currentPointScreenY - targetY;

                container.scrollLeft += deltaX;
                container.scrollTop += deltaY;
            }
            zoomAnchorRef.current = null;
        }
    }, [scale]);

    // Initial scale calculation (Fit Page)
    useEffect(() => {
        if (!pdfDoc) return;
        setViewMode('page');

        let active = true;
        pdfDoc.getPage(1).then((firstPage: any) => {
            if (!active) return;
            const vp = firstPage.getViewport({ scale: 1.0, rotation });
            const initialScale = calculateFitScale('page', vp.width, vp.height);
            setScale(initialScale);
            scaleRef.current = initialScale;
        }).catch(() => {
            const fallbackScale = calculateFitScale('page');
            setScale(fallbackScale);
            scaleRef.current = fallbackScale;
        });

        return () => {
            active = false;
        };
    }, [pdfDoc, rotation, calculateFitScale]);

    const handleFitPage = useCallback(() => {
        setViewMode('page');
        if (pdfDoc) {
            pdfDoc.getPage(1).then((page: any) => {
                const vp = page.getViewport({ scale: 1.0, rotation });
                const nextScale = calculateFitScale('page', vp.width, vp.height);
                handleZoomWithFocal(nextScale);
            });
        }
    }, [pdfDoc, rotation, calculateFitScale, handleZoomWithFocal]);

    const handleFitWidth = useCallback(() => {
        setViewMode('width');
        if (pdfDoc) {
            pdfDoc.getPage(1).then((page: any) => {
                const vp = page.getViewport({ scale: 1.0, rotation });
                const nextScale = calculateFitScale('width', vp.width, vp.height);
                handleZoomWithFocal(nextScale);
            });
        }
    }, [pdfDoc, rotation, calculateFitScale, handleZoomWithFocal]);

    const handleToggleFit = useCallback(() => {
        if (viewMode === 'page') handleFitWidth();
        else handleFitPage();
    }, [viewMode, handleFitWidth, handleFitPage]);

    // Jump to specific page
    const jumpToPage = useCallback((pageNum: number) => {
        const target = Math.max(1, Math.min(numPages, pageNum));
        setCurrentPage(target);
        const pageEl = pageRefs.current[target];
        if (pageEl) {
            pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [numPages]);

    // Rotate document
    const handleRotate = useCallback(() => {
        if (isImage) {
            setImageRotation(prev => (prev + 90) % 360);
        } else {
            setRotation(prev => (prev + 90) % 360);
        }
    }, [isImage]);

    // Search Engine
    const performSearch = useCallback(async () => {
        if (!searchQuery.trim() || !pdfDoc) {
            setSearchResults([]);
            setCurrentSearchIndex(-1);
            return;
        }

        const query = searchQuery.trim().toLowerCase();
        const results: ModernSearchResult[] = [];

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
                    matchIndex++;
                    lastPos += query.length;
                }
            } catch (searchErr) {
                console.warn(`Search failed on page ${i}:`, searchErr);
            }
        }

        setSearchResults(results);

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
        if (selection && selection.toString().trim().length > 1) {
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
        if (currentScrollY > lastScrollYRef.current + 35 && currentScrollY > 100) {
            setShowToolbar(false);
        } else if (currentScrollY < lastScrollYRef.current - 25 || currentScrollY < 60) {
            setShowToolbar(true);
        }
        lastScrollYRef.current = currentScrollY;
    };

    // Touch Pinch-to-Zoom & Double-Tap
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            touchStartDistRef.current = dist;
            touchStartScaleRef.current = scaleRef.current;
        } else if (e.touches.length === 1) {
            const now = Date.now();
            if (now - lastTapTimeRef.current < 300) {
                // Double tap detected -> Smart zoom toggle
                handleToggleFit();
            }
            lastTapTimeRef.current = now;
        }
    };

    const rafZoomRef = useRef<number | null>(null);

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && touchStartDistRef.current) {
            e.preventDefault();
            const currentDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const factor = currentDist / touchStartDistRef.current;
            const newScale = touchStartScaleRef.current * factor;
            const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

            if (rafZoomRef.current) cancelAnimationFrame(rafZoomRef.current);
            rafZoomRef.current = requestAnimationFrame(() => {
                handleZoomWithFocal(newScale, midX, midY);
            });
        }
    };

    const handleTouchEnd = () => {
        touchStartDistRef.current = null;
        if (rafZoomRef.current) {
            cancelAnimationFrame(rafZoomRef.current);
            rafZoomRef.current = null;
        }
    };

    // Desktop Ctrl + Wheel Zoom Listener with RAF smoothing
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const delta = e.deltaY < 0 ? 0.12 : -0.12;
                if (rafZoomRef.current) cancelAnimationFrame(rafZoomRef.current);
                rafZoomRef.current = requestAnimationFrame(() => {
                    handleZoomWithFocal(scaleRef.current + delta, e.clientX, e.clientY);
                });
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            container.removeEventListener('wheel', handleWheel);
            if (rafZoomRef.current) cancelAnimationFrame(rafZoomRef.current);
        };
    }, [handleZoomWithFocal]);

    // Keyboard Shortcuts Listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.key === 'Escape') {
                if (isShortcutsOpen) setIsShortcutsOpen(false);
                else if (isSidebarOpen) setIsSidebarOpen(false);
                else handleClose();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                setShowToolbar(true);
                const searchInput = document.querySelector('input[placeholder="Find..."]') as HTMLInputElement;
                searchInput?.focus();
            } else if (e.key === '=' || e.key === '+') {
                handleZoomWithFocal(scaleRef.current + 0.15);
            } else if (e.key === '-') {
                handleZoomWithFocal(scaleRef.current - 0.15);
            } else if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleZoomWithFocal(1.0);
            } else if (e.key.toLowerCase() === 'r') {
                handleRotate();
            } else if (e.key.toLowerCase() === 't') {
                setIsSidebarOpen(prev => !prev);
            } else if (e.key === '?') {
                setIsShortcutsOpen(prev => !prev);
            } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                jumpToPage(currentPage - 1);
            } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
                jumpToPage(currentPage + 1);
            } else if (e.key === 'Home') {
                jumpToPage(1);
            } else if (e.key === 'End') {
                jumpToPage(numPages);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isShortcutsOpen, isSidebarOpen, handleClose, handleZoomWithFocal, handleRotate, jumpToPage, currentPage, numPages]);

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

    // Print handler
    const handlePrint = () => {
        window.print();
    };

    const getViewerBg = () => {
        if (readingTheme === 'light') return 'bg-[#e4e4e7] text-zinc-900';
        return 'bg-[#09090b] text-zinc-100';
    };

    if (error) {
        return createPortal(
            <div className="fixed inset-0 z-[10000] bg-black flex items-center justify-center p-6 animate-fade-in">
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
            className={`fixed inset-0 z-[9999] flex flex-col overflow-hidden pdf-viewer-overlay transition-colors duration-200 ${getViewerBg()} ${
                active ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-[0.99] pointer-events-none'
            }`}
            onMouseUp={handleMouseUp}
        >
            {/* Top Toolbar */}
            <ModernPDFToolbar
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
                onZoomIn={() => handleZoomWithFocal(scaleRef.current + 0.15)}
                onZoomOut={() => handleZoomWithFocal(scaleRef.current - 0.15)}
                onSetExactScale={(s) => handleZoomWithFocal(s)}
                viewMode={viewMode}
                onToggleFit={handleToggleFit}
                onFitPage={handleFitPage}
                onFitWidth={handleFitWidth}
                onRotate={handleRotate}
                currentPage={currentPage}
                numPages={numPages}
                onJumpToPage={jumpToPage}
                progressPercent={progressPercent}
                readingTheme={readingTheme}
                onSetTheme={handleSetTheme}
                isFullscreen={isFullscreen}
                onToggleFullscreen={toggleFullscreen}
                isDownloading={isDownloading}
                onDownload={triggerDownload}
                onPrint={handlePrint}
                onOpenShortcuts={() => setIsShortcutsOpen(true)}
            />

            {/* Multi-Tab Sidebar */}
            <ModernPDFSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                numPages={numPages}
                currentPage={currentPage}
                pdfDoc={pdfDoc}
                outline={outline}
                bookmarks={bookmarks}
                readingTheme={readingTheme}
                onJumpToPage={jumpToPage}
                onToggleBookmark={handleToggleBookmark}
            />

            {/* Contextual Floating Selection Menu */}
            <ModernPDFSelectionMenu
                position={floatingMenuPos}
                selectedText={selectedText}
                currentPage={currentPage}
                fileName={displayFileName}
                onClose={() => {
                    setFloatingMenuPos(null);
                    setSelectedText('');
                }}
                onAddBookmark={(text) => handleToggleBookmark(currentPage, text)}
            />

            {/* Keyboard Shortcuts Dialog */}
            <ModernPDFShortcutsModal
                isOpen={isShortcutsOpen}
                onClose={() => setIsShortcutsOpen(false)}
            />

            {/* Main Document Content Scroll Viewport */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
                <main
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className="flex-1 overflow-auto relative touch-pan-x touch-pan-y overscroll-contain pt-14 md:pt-16 custom-scrollbar select-text"
                    style={{
                        WebkitOverflowScrolling: 'touch',
                        overscrollBehavior: 'contain',
                    }}
                >
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-100/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm z-30">
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
                                    onZoom={(s) => handleZoomWithFocal(s)}
                                />
                            ) : isDocx && !docxRenderFailed && docxBuffer ? (
                                <DocxRenderer
                                    docxBuffer={docxBuffer}
                                    scale={scale}
                                    onZoom={(s) => handleZoomWithFocal(s)}
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
                                <div className="flex flex-col items-center min-w-fit w-full py-8 px-2 sm:px-6">
                                    {Array.from({ length: numPages }).map((_, i) => (
                                        <ModernPDFPage
                                            key={i}
                                            pageNum={i + 1}
                                            pdfDoc={pdfDoc}
                                            pdfjsLib={pdfjsLibState}
                                            scale={scale}
                                            rotation={rotation}
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

                {/* Floating Mobile Bottom Page Indicator */}
                {numPages > 1 && (
                    <div
                        className="md:hidden fixed bottom-5 right-5 z-40 text-white px-3.5 py-1.5 rounded-full font-bold text-[11px] shadow-2xl animate-fade-in flex items-center gap-1.5 border border-white/20 backdrop-blur-lg"
                        style={{ backgroundColor: 'var(--brand-primary)' }}
                    >
                        <span>{currentPage} / {numPages}</span>
                        <span className="opacity-40">•</span>
                        <span>{progressPercent}%</span>
                    </div>
                )}
            </div>

            {/* Custom Embedded CSS */}
            <style>{`
                .pdf-viewer-overlay {
                    transition: opacity 200ms cubic-bezier(0.16, 1, 0.3, 1), transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
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
                    background: rgba(249, 115, 22, 0.35);
                    color: transparent;
                }
                mark.pdf-search-match {
                    background-color: rgba(249, 115, 22, 0.35);
                    color: transparent;
                    border-radius: 2px;
                }
                mark.pdf-search-match.active-match {
                    background-color: #ea580c;
                    color: transparent;
                    box-shadow: 0 0 12px rgba(234, 88, 12, 0.6);
                    z-index: 10;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
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
                    animation: fade-in 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>,
        document.getElementById('modal-root') || document.body
    );
};

export default ModernPDFViewer;
