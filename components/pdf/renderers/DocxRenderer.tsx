import React, { useEffect, useRef } from 'react';
import { renderAsync } from 'docx-preview';

interface DocxRendererProps {
    docxBuffer: ArrayBuffer;
    scale: number;
    onZoom: (newScale: number) => void;
    onError: (err: any) => void;
}

export const DocxRenderer: React.FC<DocxRendererProps> = ({
    docxBuffer,
    scale,
    onZoom,
    onError,
}) => {
    const docxContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (docxBuffer && docxContainerRef.current) {
            docxContainerRef.current.innerHTML = '';
            renderAsync(docxBuffer, docxContainerRef.current, undefined, {
                inWrapper: false,
                ignoreWidth: false,
                ignoreHeight: false,
                breakPages: true,
            }).catch(err => {
                console.error("DOCX render failed:", err);
                onError(err);
            });
        }
    }, [docxBuffer, onError]);

    return (
        <div 
            className="w-full flex flex-col items-center justify-start p-4 sm:p-8 overflow-auto min-h-[80vh]"
            onWheel={(e) => {
                if (e.ctrlKey) {
                    e.preventDefault();
                    const delta = e.deltaY < 0 ? 0.1 : -0.1;
                    onZoom(Math.min(2.5, Math.max(0.4, scale + delta)));
                }
            }}
        >
            <div
                className="transition-transform duration-150 ease-out origin-top flex flex-col items-center max-w-full"
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                    willChange: 'transform',
                    marginBottom: '80px'
                }}
            >
                <div 
                    ref={docxContainerRef} 
                    className="docx-preview-root bg-white text-zinc-900 rounded-xl shadow-2xl p-6 sm:p-12 max-w-[850px] w-full min-h-[1000px] border border-zinc-200 dark:border-white/10 select-text overflow-hidden"
                />
            </div>
        </div>
    );
};
