import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface PDFViewerProps {
    url: string;
    onClose: () => void;
    fileName: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, onClose, fileName }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.5);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pdfDocRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Prevent scrolling on body when viewer is open
        document.body.style.overflow = 'hidden';

        const loadPdfJs = async () => {
            if (!(window as any).pdfjsLib) {
                const script = document.createElement('script');
                script.id = 'pdf-js-script';
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

            try {
                setIsLoading(true);
                const loadingTask = pdfjsLib.getDocument(url);
                const pdf = await loadingTask.promise;
                pdfDocRef.current = pdf;
                setNumPages(pdf.numPages);
                setIsLoading(false);
            } catch (err: any) {
                console.error('Error loading PDF:', err);
                setError('Failed to load PDF. Please check your connection.');
                setIsLoading(false);
            }
        };

        loadPdfJs();

        // Disable right click and keys
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p' || e.key === 'u')) {
                e.preventDefault();
            }
        };

        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [url]);

    useEffect(() => {
        if (pdfDocRef.current && !isLoading) {
            // Small timeout to ensure canvas is painted in the DOM
            const timer = setTimeout(() => {
                renderPage(pageNumber, scale);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [pageNumber, scale, isLoading]);

    const renderPage = async (num: number, currentScale: number) => {
        if (!pdfDocRef.current || !canvasRef.current) return;

        try {
            const page = await pdfDocRef.current.getPage(num);
            const viewport = page.getViewport({ scale: currentScale });
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                // Adjust for device pixel ratio to keep it sharp
                const dpr = window.devicePixelRatio || 1;
                canvas.height = viewport.height * dpr;
                canvas.width = viewport.width * dpr;
                canvas.style.width = `${viewport.width}px`;
                canvas.style.height = `${viewport.height}px`;

                context.scale(dpr, dpr);

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };

                await page.render(renderContext).promise;
            }
        } catch (err) {
            console.error('Render error:', err);
        }
    };

    const changePage = (offset: number) => {
        setPageNumber(prev => Math.min(Math.max(1, prev + offset), numPages || 1));
    };

    const changeScale = (delta: number) => {
        setScale(prev => Math.min(Math.max(0.5, prev + delta), 3));
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col bg-black animate-fade-in overflow-hidden">
            {/* Background elements to prevent "seeing through" blur during load */}
            <div className="absolute inset-0 bg-[#050505]" />

            {/* Dynamic Blobs for premium feel */}
            <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full" />
            <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-red-600/5 blur-[120px] rounded-full" />

            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 md:p-6 bg-black/80 backdrop-blur-xl border-b border-white/5 z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-orange-600 text-white transition-all border-none group"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="hidden md:block">
                        <h3 className="text-sm font-black text-white uppercase tracking-tighter truncate max-w-[250px]">{fileName}</h3>
                        <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest leading-none mt-1">Nexus Safe Protocol</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4 bg-white/5 p-1 rounded-2xl border border-white/10">
                    <button
                        onClick={() => changePage(-1)}
                        disabled={pageNumber <= 1}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white disabled:opacity-10 hover:bg-white/10 transition-all border-none"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <span className="text-[10px] font-black text-white px-2 min-w-[60px] text-center uppercase tracking-[0.2em]">
                        {pageNumber} / {numPages || '-'}
                    </span>
                    <button
                        onClick={() => changePage(1)}
                        disabled={pageNumber >= (numPages || 1)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white disabled:opacity-10 hover:bg-white/10 transition-all border-none"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="m9 18 6-6-6-6" /></svg>
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
                        <button
                            onClick={() => changeScale(-0.25)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-white/10 transition-all border-none"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        </button>
                        <span className="text-[9px] font-black text-white px-1 w-12 text-center">{Math.round(scale * 100)}%</span>
                        <button
                            onClick={() => changeScale(0.25)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-white/10 transition-all border-none"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main View Area */}
            <div
                ref={containerRef}
                className="relative flex-1 overflow-auto bg-[#0a0a0a] p-4 md:p-12 flex items-start justify-center no-scrollbar select-none z-10"
            >
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-6">
                        <div className="w-16 h-16 border-[5px] border-orange-600 border-t-transparent rounded-full animate-spin" />
                        <div className="text-center">
                            <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em] animate-pulse">Decrypting Protocol</p>
                            <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em] mt-2">Securing visual buffers...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-sm animate-fade-in">
                        <div className="w-20 h-20 bg-red-500/10 rounded-[40px] flex items-center justify-center text-red-500 border border-red-500/20">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-10 h-10"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Handshake Failed</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed mt-2">{error}</p>
                        </div>
                        <button onClick={onClose} className="bg-white text-black px-10 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">Abort Protocol</button>
                    </div>
                ) : (
                    <div className="relative shadow-[0_64px_128px_rgba(0,0,0,0.8)] border border-white/5 rounded-sm overflow-hidden bg-white">
                        <canvas ref={canvasRef} className="block" />

                        {/* Watermark overlay - Refined for security */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.04] flex items-center justify-center overflow-hidden flex-wrap select-none p-20">
                            {Array.from({ length: 100 }).map((_, i) => (
                                <span key={i} className="text-[40px] font-black uppercase rotate-[-35deg] whitespace-nowrap m-12 text-black">LPU NEXUS</span>
                            ))}
                        </div>

                        {/* Top Protection Layer */}
                        <div className="absolute inset-0 z-50 pointer-events-none" />
                    </div>
                )}
            </div>

            {/* Mobile Controls Overlay */}
            <div className="md:hidden fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/90 backdrop-blur-2xl px-8 py-5 rounded-[32px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-30 animate-fade-in">
                <button onClick={() => changePage(-1)} disabled={pageNumber <= 1} className="text-white disabled:opacity-20 border-none bg-transparent">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-5 h-5"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <div className="h-4 w-px bg-white/20 mx-2" />
                <span className="text-[11px] font-black text-white min-w-[50px] text-center tracking-widest">{pageNumber} / {numPages}</span>
                <div className="h-4 w-px bg-white/20 mx-2" />
                <button onClick={() => changePage(1)} disabled={pageNumber >= (numPages || 1)} className="text-white disabled:opacity-20 border-none bg-transparent">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-5 h-5"><path d="m9 18 6-6-6-6" /></svg>
                </button>
            </div>

            <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        canvas {
          image-rendering: -webkit-optimize-contrast;
          user-select: none;
          pointer-events: none;
          -webkit-user-drag: none;
        }
      `}</style>
        </div>,
        document.body
    );
};

export default PDFViewer;
