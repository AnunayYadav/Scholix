import React from 'react';
import { showToast } from '../Toast.tsx';

interface ModernPDFSelectionMenuProps {
    position: { x: number; y: number } | null;
    selectedText: string;
    currentPage: number;
    fileName: string;
    onClose: () => void;
    onAddBookmark?: (text: string) => void;
}

export const ModernPDFSelectionMenu: React.FC<ModernPDFSelectionMenuProps> = ({
    position,
    selectedText,
    currentPage,
    fileName,
    onClose,
    onAddBookmark,
}) => {
    if (!position || !selectedText.trim()) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(selectedText);
            showToast('Copied to clipboard', 'success');
        } catch {
            showToast('Failed to copy', 'error');
        }
        onClose();
    };

    const handleGoogleSearch = () => {
        const query = encodeURIComponent(selectedText.trim());
        window.open(`https://www.google.com/search?q=${query}`, '_blank');
        onClose();
    };

    const handleAskAI = () => {
        // Dispatch custom event for Nexus AI Assistant or copy context
        const event = new CustomEvent('scholix_ai_query', {
            detail: {
                text: selectedText,
                source: `${fileName} (Page ${currentPage})`,
            }
        });
        window.dispatchEvent(event);
        showToast('Sent to AI Assistant', 'info');
        onClose();
    };

    // Calculate smart screen position so it doesn't overflow
    const menuWidth = 240;
    const left = Math.max(16, Math.min(window.innerWidth - menuWidth - 16, position.x - menuWidth / 2));
    const top = Math.max(70, position.y - 48);

    return (
        <div
            className="fixed z-[10002] flex items-center gap-1 p-1 bg-[#18181b]/95 dark:bg-[#121215]/95 text-white rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl animate-fade-in text-xs select-none"
            style={{
                left: `${left}px`,
                top: `${top}px`,
            }}
            onMouseDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
        >
            <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all font-semibold border-none text-zinc-200 hover:text-white"
                title="Copy selection"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                <span>Copy</span>
            </button>

            <div className="w-px h-3.5 bg-white/10" />

            <button
                onClick={handleAskAI}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-orange-500/20 active:bg-orange-500/30 text-orange-400 hover:text-orange-300 transition-all font-bold border-none"
                title="Ask AI to explain selected concept"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
                <span>Ask AI</span>
            </button>

            <div className="w-px h-3.5 bg-white/10" />

            <button
                onClick={handleGoogleSearch}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all font-semibold border-none text-zinc-300 hover:text-white"
                title="Search Google"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <span>Search</span>
            </button>

            {onAddBookmark && (
                <>
                    <div className="w-px h-3.5 bg-white/10" />
                    <button
                        onClick={() => {
                            onAddBookmark(selectedText.slice(0, 40));
                            onClose();
                        }}
                        className="p-1.5 rounded-xl hover:bg-white/10 text-yellow-400 hover:text-yellow-300 transition-all border-none"
                        title="Bookmark Note"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                    </button>
                </>
            )}
        </div>
    );
};
