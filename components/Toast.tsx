
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const IconX = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
);

const IconInfo = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

const STYLES: Record<ToastType, {
    iconBg: string;
    iconColor: string;
    IconComp: React.FC;
    glowColor: string;
    leftBorder: string;
}> = {
    success: {
        iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
        iconColor: 'text-emerald-500 dark:text-emerald-400',
        IconComp: IconCheck,
        glowColor: 'shadow-emerald-500/5 dark:shadow-emerald-500/10',
        leftBorder: 'border-l-[3px] border-l-emerald-500 dark:border-l-emerald-400'
    },
    error: {
        iconBg: 'bg-rose-50 dark:bg-rose-500/10',
        iconColor: 'text-rose-500 dark:text-rose-400',
        IconComp: IconX,
        glowColor: 'shadow-rose-500/5 dark:shadow-rose-500/10',
        leftBorder: 'border-l-[3px] border-l-rose-500 dark:border-l-rose-400'
    },
    info: {
        iconBg: 'bg-blue-50 dark:bg-blue-500/10',
        iconColor: 'text-blue-500 dark:text-blue-400',
        IconComp: IconInfo,
        glowColor: 'shadow-blue-500/5 dark:shadow-blue-500/10',
        leftBorder: 'border-l-[3px] border-l-blue-500 dark:border-l-blue-400'
    },
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
            className={`flex items-center gap-3 pl-3.5 pr-4 py-3 rounded-xl border backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                toast.exiting
                    ? 'opacity-0 translate-y-2 scale-95'
                    : 'opacity-100 translate-y-0 scale-100 animate-toast-in'
            } bg-white/95 dark:bg-[#121214]/95 border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)] ${s.leftBorder} ${s.glowColor}`}
            style={{ width: '100%', minWidth: 280, maxWidth: 360 }}
        >
            <div className={`w-8 h-8 rounded-lg ${s.iconBg} flex items-center justify-center flex-shrink-0 ${s.iconColor}`}>
                <s.IconComp />
            </div>
            <p className="text-[12px] font-semibold tracking-wide text-zinc-800 dark:text-zinc-200 leading-snug flex-1 select-none">
                {toast.message}
            </p>
            <button
                onClick={() => onDismiss(toast.id)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-white/5 transition-all flex-shrink-0 border-none bg-transparent cursor-pointer"
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
        }, 300);
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
            {createPortal(
                <div className="fixed bottom-6 right-6 left-6 sm:left-auto z-[999999] flex flex-col-reverse gap-2.5 pointer-events-auto sm:w-auto" style={{ maxWidth: 'calc(100% - 3rem)' }}>
                    {toasts.map(toast => (
                        <ToastItemComponent key={toast.id} toast={toast} onDismiss={dismiss} />
                    ))}
                </div>,
                document.getElementById('modal-root') || document.body
            )}

            {/* Confirm Modal */}
            {confirmState && createPortal(
                <div className="modal-overlay modal-overlay-fade"
                    style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
                    onMouseDown={(e) => { if (e.target === e.currentTarget) handleConfirm(false); }}>
                    <div className="nexus-modal w-full max-w-sm p-7 text-center space-y-5 bg-white/95 dark:bg-[#121214]/95 border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-3xl">
                        <div className="w-12 h-12 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl flex items-center justify-center mx-auto text-brand-primary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                        </div>
                        <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed px-2">{confirmState.message}</p>
                        <div className="flex gap-3 px-2">
                            <button
                                onClick={() => handleConfirm(false)}
                                className="flex-1 py-2.5 bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 rounded-xl font-bold text-xs tracking-wider transition-all hover:bg-zinc-200 dark:hover:bg-white/10 border-none cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleConfirm(true)}
                                className="flex-[1.5] py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl font-bold text-xs tracking-wider shadow-lg shadow-brand-primary/15 active:scale-95 transition-all border-none cursor-pointer"
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
