import React from 'react';
import { showToast } from '../Toast.tsx';

interface ModernPDFSelectionMenuProps {
    position: { x: number; y: number } | null;
    selectedText: string;
    currentPage?: number;
    fileName?: string;
    onClose: () => void;
    onAddBookmark?: (text: string) => void;
}

export const ModernPDFSelectionMenu: React.FC<ModernPDFSelectionMenuProps> = ({
    position,
    selectedText,
    onClose,
}) => {
    if (!position || !selectedText.trim()) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(selectedText);
            showToast('Copied to clipboard', 'success');
        } catch {
            showToast('Failed to copy', 'error');
        }
        window.getSelection()?.removeAllRanges();
        onClose();
    };

    const handleGoogleSearch = () => {
        const query = encodeURIComponent(selectedText.trim());
        window.open(`https://www.google.com/search?q=${query}`, '_blank');
        window.getSelection()?.removeAllRanges();
        onClose();
    };

    // Calculate smart screen position so it doesn't overflow
    const menuWidth = 160;
    const left = Math.max(16, Math.min(window.innerWidth - menuWidth - 16, position.x - menuWidth / 2));
    const top = Math.max(70, position.y - 48);

    return (
        <div
            className="pdf-selection-menu fixed z-[10002] flex items-center gap-1 p-1 bg-[#18181b]/95 dark:bg-[#121215]/95 text-white rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl animate-fade-in text-xs select-none"
            style={{
                left: `${left}px`,
                top: `${top}px`,
            }}
            onMouseDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
        >
            <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all font-semibold border-none text-zinc-200 hover:text-white cursor-pointer"
                title="Copy selection"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                <span>Copy</span>
            </button>

            <div className="w-px h-3.5 bg-white/10" />

            <button
                onClick={handleGoogleSearch}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all font-semibold border-none text-zinc-300 hover:text-white cursor-pointer"
                title="Search Google"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <span>Search</span>
            </button>
        </div>
    );
};
