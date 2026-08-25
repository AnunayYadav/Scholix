import React from 'react';

interface ImageRendererProps {
    imageUrl: string;
    displayFileName: string;
    scale: number;
    rotation: number;
    onZoom: (newScale: number) => void;
}

export const ImageRenderer: React.FC<ImageRendererProps> = ({
    imageUrl,
    displayFileName,
    scale,
    rotation,
    onZoom,
}) => {
    return (
        <div 
            className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 overflow-auto min-h-[60vh] select-none"
            onWheel={(e) => {
                e.preventDefault();
                const delta = e.deltaY < 0 ? 0.15 : -0.15;
                onZoom(Math.min(4, Math.max(0.2, scale + delta)));
            }}
        >
            <div 
                className="transition-transform duration-150 ease-out flex items-center justify-center max-w-full max-h-full"
                style={{
                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                    willChange: 'transform',
                }}
            >
                <img 
                    src={imageUrl} 
                    alt={displayFileName} 
                    className="max-w-full max-h-[78vh] rounded-2xl shadow-2xl object-contain border border-zinc-200 dark:border-white/10"
                    draggable={false}
                />
            </div>
        </div>
    );
};
