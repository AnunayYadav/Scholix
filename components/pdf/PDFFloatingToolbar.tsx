import React, { useState } from 'react';
import { showToast } from '../Toast.tsx';

interface PDFFloatingToolbarProps {
    position: { x: number; y: number } | null;
    selectedText: string;
    currentPage: number;
    fileName: string;
    onClose: () => void;
}

export const PDFFloatingToolbar: React.FC<PDFFloatingToolbarProps> = ({
    position,
    selectedText,
    currentPage,
    fileName,
    onClose,
}) => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    if (!position || !selectedText.trim()) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(selectedText);
        showToast('Text copied to clipboard', 'success');
        onClose();
    };

    const handleCopyCitation = () => {
        const cleanName = fileName.replace(/\.pdf$/i, '');
        const citation = `"${selectedText.trim()}" — ${cleanName}, Page ${currentPage} (Scholix Study Hub)`;
        navigator.clipboard.writeText(citation);
        showToast('Citation copied with page attribution', 'success');
        onClose();
    };

    const handleReadAloud = () => {
        if (!('speechSynthesis' in window)) {
            showToast('Text-to-speech not supported on this browser', 'error');
            return;
        }

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(selectedText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
        showToast('Reading selected text...', 'info');
    };

    return (
        <div
            className="fixed z-50 animate-fade-in"
            style={{
                top: `${Math.max(60, position.y - 48)}px`,
                left: `${Math.min(window.innerWidth - 240, Math.max(16, position.x - 100))}px`,
            }}
        >
            <div className="bg-zinc-900/95 dark:bg-[#141416]/95 backdrop-blur-xl text-white rounded-2xl p-1 shadow-2xl border border-white/10 flex items-center gap-0.5">
                <button
                    onClick={handleCopy}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-200 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 border-none bg-transparent"
                    title="Copy Text"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    <span>Copy</span>
                </button>

                <button
                    onClick={handleCopyCitation}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-200 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 border-none bg-transparent"
                    title="Copy with Page Citation"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v6c0 7 1 8 3 8Z"/><path d="M17 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 7 1 8 3 8Z"/></svg>
                    <span className="hidden sm:inline">Cite</span>
                </button>

                <button
                    onClick={handleReadAloud}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold hover:bg-white/10 transition-all flex items-center gap-1.5 border-none bg-transparent ${
                        isSpeaking ? 'text-orange-400 bg-orange-500/20' : 'text-zinc-200 hover:text-white'
                    }`}
                    title="Read Aloud (TTS)"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                    <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                </button>
            </div>
        </div>
    );
};
