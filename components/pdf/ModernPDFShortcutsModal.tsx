import React from 'react';

interface ModernPDFShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ModernPDFShortcutsModal: React.FC<ModernPDFShortcutsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const shortcuts = [
        { key: 'Esc', desc: 'Close viewer / Close modal or sidebar' },
        { key: 'Ctrl / ⌘ + F', desc: 'Find / Search in document' },
        { key: '+ / =', desc: 'Zoom in' },
        { key: '-', desc: 'Zoom out' },
        { key: 'Ctrl / ⌘ + 0', desc: 'Reset zoom to 100%' },
        { key: 'F / F11', desc: 'Toggle Fullscreen mode' },
        { key: 'H', desc: 'Toggle Hand / Pan tool' },
        { key: 'V', desc: 'Select Text tool' },
        { key: 'R', desc: 'Rotate document 90°' },
        { key: 'T', desc: 'Toggle Sidebar' },
        { key: '← / PageUp', desc: 'Previous page' },
        { key: '→ / PageDown', desc: 'Next page' },
        { key: 'Home / End', desc: 'First / Last page' },
        { key: 'Ctrl + Wheel', desc: 'Smooth zoom at cursor' },
        { key: '2-Finger Pinch', desc: 'Pinch-to-zoom (Touch)' },
        { key: 'Double Tap', desc: 'Smart Fit to Width (Touch)' },
    ];

    return (
        <div className="fixed inset-0 z-[10005] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/10 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 text-zinc-900 dark:text-zinc-100"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/5 pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><rect width="18" height="12" x="3" y="6" rx="2"/><line x1="8" x2="8" y1="10" y2="10"/><line x1="12" x2="12" y1="10" y2="10"/><line x1="16" x2="16" y1="10" y2="10"/><line x1="8" x2="8" y1="14" y2="14"/><line x1="12" x2="12" y1="14" y2="14"/><line x1="16" x2="16" y1="14" y2="14"/></svg>
                        </div>
                        <h3 className="text-sm font-bold tracking-tight">Keyboard & Touch Shortcuts</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all border-none"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto pr-1 text-xs">
                    {shortcuts.map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors">
                            <span className="text-zinc-500 dark:text-zinc-400 font-medium">{s.desc}</span>
                            <kbd className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-white/10 text-zinc-800 dark:text-zinc-200 font-mono text-[11px] font-semibold shadow-xs">
                                {s.key}
                            </kbd>
                        </div>
                    ))}
                </div>

                <div className="pt-2 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs shadow-md transition-all border-none cursor-pointer"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};
