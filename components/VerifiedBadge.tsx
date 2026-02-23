
import React from 'react';

interface VerifiedBadgeProps {
    isAdmin?: boolean;
    size?: string;
    className?: string;
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ isAdmin, size = "w-4 h-4", className = "" }) => {
    if (!isAdmin) return null;

    return (
        <span className={`inline-flex items-center justify-center text-[#1DA1F2] drop-shadow-[0_0_8px_rgba(29,161,242,0.3)] ${className}`} title="Verified Admin">
            <svg viewBox="0 0 24 24" fill="currentColor" className={size}>
                <path d="M22.5 12.5c0-1.58-.88-2.95-2.18-3.66.15-.44.23-.91.23-1.4 0-2.45-1.99-4.44-4.44-4.44-.49 0-.96.08-1.4.23-1.17-1.3-2.35-1.73-3.66-1.73-1.58 0-2.95.88-3.66 2.18-.44-.15-.91-.23-1.4-.23-2.45 0-4.44 1.99-4.44 4.44 0 .49.08.96.23 1.4-1.3.71-2.18 2.08-2.18 3.66 0 1.58.88 2.95 2.18 3.66-.15.44-.23.91-.23 1.4 0 2.45 1.99 4.44 4.44 4.44.49 0 .96-.08 1.4-.23 1.17 1.3 2.35 1.73 3.66 1.73 1.58 0 2.95-.88 3.66-2.18.44.15.91.23 1.4.23 2.45 0 4.44-1.99 4.44-4.44 0-.49-.08-.96-.23-1.4 1.3-.71 2.18-2.08 2.18-3.66zM10.5 17l-3.5-3.5 1.41-1.41L10.5 14.17l5.59-5.59L17.5 10l-7 7z" />
            </svg>
        </span>
    );
};

export default VerifiedBadge;
