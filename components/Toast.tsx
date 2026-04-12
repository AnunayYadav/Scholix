
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
    id: number;
    message: string;
    type: ToastType;
    exiting?: boolean;
}

// Module-level state for the toast system
let toastListeners: ((toast: ToastItem) => void)[] = [];
let nextId = 0;

export const showToast = (message: string, type: ToastType = 'info') => {
    const toastItem: ToastItem = { id: nextId++, message, type };
    toastListeners.forEach(listener => listener(toastItem));
};

export const toast = {
    success: (message: string) => showToast(message, 'success'),
    error: (message: string) => showToast(message, 'error'),
    info: (message: string) => showToast(message, 'info'),
};

// --- Confirm Modal ---
interface ConfirmState {
    message: string;
    resolve: (value: boolean) => void;
}

let confirmListeners: ((state: ConfirmState) => void)[] = [];

export const showConfirm = (message: string): Promise<boolean> => {
    return new Promise(resolve => {
        confirmListeners.forEach(listener => listener({ message, resolve }));
    });
};

// --- Icons ---
const IconCheck = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const IconX = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

const IconInfo = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

const STYLES: Record<ToastType, { bg: string; border: string; icon: string; IconComp: React.FC }> = {
    success: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-500', IconComp: IconCheck },
    error: { bg: 'bg-red-500/10', border: 'border-red-500/20', icon: 'text-red-500', IconComp: IconX },
    info: { bg: 'bg-brand-primary/10', border: 'border-brand-primary/20', icon: 'text-brand-primary', IconComp: IconInfo },
};

// --- Toast Item ---
const ToastItemComponent: React.FC<{ toast: ToastItem; onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
    const s = STYLES[toast.type];

    useEffect(() => {
        const timer = setTimeout(() => onDismiss(toast.id), 3500);
        return () => clearTimeout(timer);
    }, [toast.id, onDismiss]);

    return (
        <div
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-500 ${s.bg} ${s.border} ${toast.exiting ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}`}
            style={{ minWidth: 260, maxWidth: 380 }}
        >
            <div className={`w-8 h-8 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center flex-shrink-0 ${s.icon}`}>
                <s.IconComp />
            </div>
            <p className="text-[11px] font-medium tracking-wide text-zinc-800 dark:text-white leading-snug flex-1">
                {toast.message}
            </p>
            <button
                onClick={() => onDismiss(toast.id)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors flex-shrink-0 border-none bg-transparent p-0"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

// --- Toast Container (mount once in App.tsx) ---
export const ToastContainer: React.FC = () => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

    const dismiss = useCallback((id: number) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 500);
    }, []);

    useEffect(() => {
        const listener = (toast: ToastItem) => {
            setToasts(prev => [...prev.slice(-4), toast]); // max 5 toasts
        };
        toastListeners.push(listener);

        const confirmListener = (state: ConfirmState) => {
            setConfirmState(state);
        };
        confirmListeners.push(confirmListener);

        return () => {
            toastListeners = toastListeners.filter(l => l !== listener);
            confirmListeners = confirmListeners.filter(l => l !== confirmListener);
        };
    }, []);

    const handleConfirm = (value: boolean) => {
        confirmState?.resolve(value);
        setConfirmState(null);
    };

    return (
        <>
            {/* Toasts */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3 pointer-events-auto" style={{ maxWidth: 400 }}>
                {toasts.map(toast => (
                    <ToastItemComponent key={toast.id} toast={toast} onDismiss={dismiss} />
                ))}
            </div>

            {/* Confirm Modal */}
            {confirmState && createPortal(
                <div className="modal-overlay modal-overlay-fade"
                    style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
                    onMouseDown={(e) => { if (e.target === e.currentTarget) handleConfirm(false); }}>
                    <div className="nexus-modal w-full max-w-sm p-8 text-center space-y-6">
                        <div className="w-14 h-14 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl flex items-center justify-center mx-auto text-brand-primary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-7 h-7">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <p className="text-sm font-bold text-zinc-800 dark:text-white leading-relaxed">{confirmState.message}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleConfirm(false)}
                                className="flex-1 py-3 bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all hover:bg-zinc-200 dark:hover:bg-white/10 border-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleConfirm(true)}
                                className="flex-[2] py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-brand-primary/20 active:scale-95 transition-all border-none"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>,
                document.getElementById('modal-root') || document.body
            )}
        </>
    );
};
