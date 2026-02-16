
import React, { useState, useEffect, useRef } from 'react';

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

            try {
                setIsLoading(true);
                const loadingTask = pdfjsLib.getDocument(url);
                const pdf = await loadingTask.promise;
                pdfDocRef.current = pdf;
                setNumPages(pdf.numPages);
                renderPage(1, scale);
                setIsLoading(false);
            } catch (err: any) {
                console.error('Error loading PDF:', err);
                setError('Failed to load PDF. Please check your connection.');
                setIsLoading(false);
            }
        };

        const renderPage = async (num: number, currentScale: number) => {
            if (!pdfDocRef.current || !canvasRef.current) return;

            const page = await pdfDocRef.current.getPage(num);
            const viewport = page.getViewport({ scale: currentScale });
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: viewport,
            };

            await page.render(renderContext).promise;
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
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [url]);

    useEffect(() => {
        if (pdfDocRef.current) {
            renderPage(pageNumber, scale);
        }
    }, [pageNumber, scale]);

    const renderPage = async (num: number, currentScale: number) => {
        if (!pdfDocRef.current || !canvasRef.current) return;

        try {
            const page = await pdfDocRef.current.getPage(num);
            const viewport = page.getViewport({ scale: currentScale });
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                canvas.height = viewport.height;
                canvas.width = viewport.width;

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

    return (
        <div className="fixed inset-0 z-[1000] flex flex-col bg-black/95 backdrop-blur-xl animate-fade-in overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 md:p-6 bg-black/50 border-b border-white/10 z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white transition-all border-none"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="hidden md:block">
                        <h3 className="text-sm font-black text-white uppercase tracking-tighter truncate max-w-[200px]">{fileName}</h3>
                        <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest leading-none mt-1">Nexus Safe Viewer</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4 bg-white/5 p-1 rounded-2xl border border-white/10">
                    <button
                        onClick={() => changePage(-1)}
                        disabled={pageNumber <= 1}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/10 transition-all border-none"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <span className="text-[10px] font-black text-white px-2 min-w-[60px] text-center uppercase tracking-widest">
                        {pageNumber} / {numPages || '-'}
                    </span>
                    <button
                        onClick={() => changePage(1)}
                        disabled={pageNumber >= (numPages || 1)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/10 transition-all border-none"
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
                        <span className="text-[8px] font-black text-white px-2 w-10 text-center">{Math.round(scale * 100)}%</span>
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
                className="flex-1 overflow-auto bg-[#0a0a0a] p-4 md:p-8 flex items-start justify-center no-scrollbar select-none"
            >
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest animate-pulse">Decrypting content...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 max-w-xs">
                        <div className="w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mb-2">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                        </div>
                        <h3 className="text-lg font-black text-white uppercase">Access Restricted</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">{error}</p>
                        <button onClick={onClose} className="bg-white/5 text-white px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/10">Go Back</button>
                    </div>
                ) : (
                    <div className="relative shadow-[0_32px_128px_rgba(0,0,0,0.5)] border border-white/5 rounded-sm overflow-hidden">
                        <canvas ref={canvasRef} className="max-w-full h-auto shadow-2xl" />
                        {/* Watermark overlay */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center overflow-hidden flex-wrap">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <span key={i} className="text-[60px] font-black uppercase rotate-[-35deg] whitespace-nowrap p-10">LPU NEXUS</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Controls Overlay */}
            <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/80 backdrop-blur-lg px-6 py-4 rounded-3xl border border-white/10 shadow-2xl z-30">
                <button onClick={() => changePage(-1)} disabled={pageNumber <= 1} className="text-white disabled:opacity-20 border-none bg-transparent">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <span className="text-[10px] font-black text-white min-w-[40px] text-center">{pageNumber} / {numPages}</span>
                <button onClick={() => changePage(1)} disabled={pageNumber >= (numPages || 1)} className="text-white disabled:opacity-20 border-none bg-transparent">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="m9 18 6-6-6-6" /></svg>
                </button>
            </div>

            <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        canvas {
          image-rendering: high-quality;
          user-select: none;
          pointer-events: none;
        }
      `}</style>
        </div>
    );
};

export default PDFViewer;
