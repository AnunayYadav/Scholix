import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useModal - Reusable hook for modal behavior
 * Provides: Escape key dismiss, body scroll lock, exit animation, click-outside-to-close, focus trap
 * 
 * Usage:
 * const { isClosing, handleClose, overlayProps, modalProps } = useModal({ onClose, isOpen: true });
 * 
 * <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} {...overlayProps}>
 *   <div ref={modalRef} className={`nexus-modal ${isClosing ? 'closing' : ''}`} {...modalProps}>
 *     ...
 *   </div>
 * </div>
 */

interface UseModalOptions {
    onClose: () => void;
    isOpen?: boolean;
    closeOnEscape?: boolean;
    closeOnOverlayClick?: boolean;
    animationDuration?: number;
}

export const useModal = ({
    onClose,
    isOpen = true,
    closeOnEscape = true,
    closeOnOverlayClick = true,
    animationDuration = 250,
}: UseModalOptions) => {
    const [isClosing, setIsClosing] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    const handleClose = useCallback(() => {
        if (isClosing) return;
        setIsClosing(true);
        setTimeout(() => onClose(), animationDuration);
    }, [onClose, animationDuration, isClosing]);

    // Body scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
            return () => document.body.classList.remove('modal-open');
        }
    }, [isOpen]);

    // Escape key handler
    useEffect(() => {
        if (!closeOnEscape || !isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [closeOnEscape, isOpen, handleClose]);

    // Focus trap
    useEffect(() => {
        const modal = modalRef.current;
        if (!modal || !isOpen) return;

        const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const focusableElements = modal.querySelectorAll(focusableSelector);
        const firstFocusable = focusableElements[0] as HTMLElement;
        const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable?.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable?.focus();
                }
            }
        };

        modal.addEventListener('keydown', handleTab);
        // Auto-focus first focusable element
        setTimeout(() => firstFocusable?.focus(), 50);
        return () => modal.removeEventListener('keydown', handleTab);
    }, [isOpen]);

    const overlayProps = {
        onClick: (e: React.MouseEvent) => {
            if (closeOnOverlayClick && e.target === e.currentTarget) handleClose();
        },
    };

    return {
        isClosing,
        handleClose,
        modalRef,
        overlayProps,
        overlayClassName: `modal-overlay ${isClosing ? 'closing' : ''}`,
        modalClassName: `nexus-modal ${isClosing ? 'closing' : ''}`,
    };
};

export default useModal;
