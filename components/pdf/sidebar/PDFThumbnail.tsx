import React, { useEffect, useRef, useState } from 'react';

interface PDFThumbnailProps {
    pageNum: number;
    pdfDoc: any;
    isActive: boolean;
    onSelectPage: (pageNum: number) => void;
}

export const PDFThumbnail: React.FC<PDFThumbnailProps> = React.memo(({
    pageNum,
    pdfDoc,
    isActive,
    onSelectPage,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isRendered, setIsRendered] = useState(false);
    const [aspectRatio, setAspectRatio] = useState(0.75); // default standard letter ratio

    useEffect(() => {
        let active = true;
        let renderTask: any = null;

        const renderThumbnail = async () => {
            if (!pdfDoc || !canvasRef.current) return;
            try {
                const page = await pdfDoc.getPage(pageNum);
                if (!active) return;

                const baseViewport = page.getViewport({ scale: 1.0 });
                const ratio = baseViewport.height / baseViewport.width;
                setAspectRatio(ratio);

                // Thumbnail target width: 140px
                const targetWidth = 140;
                const thumbScale = targetWidth / baseViewport.width;
                const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
                const viewport = page.getViewport({ scale: thumbScale * dpr });

                const canvas = canvasRef.current;
                if (!canvas) return;

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                const context = canvas.getContext('2d', { alpha: false });
                if (!context || !active) return;

                renderTask = page.render({
                    canvasContext: context,
                    viewport: viewport,
                });

                await renderTask.promise;
                if (active) {
                    setIsRendered(true);
                }
            } catch (err: any) {
                if (err.name !== 'RenderingCancelledException') {
                    console.warn(`Thumbnail render error on page ${pageNum}:`, err);
                }
            }
        };

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && active && !isRendered) {
                    renderThumbnail();
                    observer.disconnect();
                }
            },
            { rootMargin: '150px' }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            active = false;
            observer.disconnect();
            if (renderTask) {
                renderTask.cancel();
            }
            if (canvasRef.current) {
                canvasRef.current.width = 0;
                canvasRef.current.height = 0;
            }
        };
    }, [pageNum, pdfDoc]);

    return (
        <div
            ref={containerRef}
            onClick={() => onSelectPage(pageNum)}
            className={`group flex flex-col items-center cursor-pointer p-1.5 rounded-xl transition-all ${
                isActive
                    ? 'bg-orange-500/10 ring-2 ring-orange-500'
                    : 'hover:bg-zinc-100 dark:hover:bg-white/5'
            }`}
        >
            <div 
                className="relative w-full rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-white/5"
                style={{ paddingBottom: `${aspectRatio * 100}%` }}
            >
                <canvas
                    ref={canvasRef}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
                        isRendered ? 'opacity-100' : 'opacity-0'
                    }`}
                />
                {!isRendered && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full border-2 border-zinc-400/40 border-t-orange-500 animate-spin" />
                    </div>
                )}
            </div>
            <span className={`mt-1.5 text-[11px] font-bold ${
                isActive 
                    ? 'text-orange-600 dark:text-orange-400' 
                    : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white'
            }`}>
                {pageNum}
            </span>
        </div>
    );
});
