import React from 'react';

/**
 * SkeletonLoader - Premium animated skeleton placeholders
 * Use these inside components during data fetching states
 */

// Base shimmer skeleton block
export const Skeleton: React.FC<{
    className?: string;
    style?: React.CSSProperties;
}> = ({ className = '', style }) => (
    <div
        className={`skeleton-pulse rounded-2xl ${className}`}
        style={style}
        aria-hidden="true"
    />
);

// Card-shaped skeleton
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`glass-panel rounded-3xl p-6 space-y-4 ${className}`}>
        <Skeleton className="h-5 w-1/3 rounded-lg" />
        <Skeleton className="h-3 w-2/3 rounded-md" />
        <Skeleton className="h-3 w-1/2 rounded-md" />
        <div className="flex gap-3 pt-2">
            <Skeleton className="h-8 w-20 rounded-xl" />
            <Skeleton className="h-8 w-20 rounded-xl" />
        </div>
    </div>
);

// Page header skeleton
export const SkeletonHeader: React.FC = () => (
    <div className="space-y-4 mb-8">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-3 w-72 rounded-md" />
    </div>
);

// Grid of skeleton cards
export const SkeletonGrid: React.FC<{
    count?: number;
    columns?: string;
}> = ({ count = 6, columns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' }) => (
    <div className={`grid ${columns} gap-4`}>
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} />
        ))}
    </div>
);

// List item skeleton
export const SkeletonListItem: React.FC = () => (
    <div className="flex items-center gap-4 p-4 glass-panel rounded-2xl">
        <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3 rounded-md" />
            <Skeleton className="h-3 w-2/3 rounded-md" />
        </div>
        <Skeleton className="h-8 w-16 rounded-xl shrink-0" />
    </div>
);

// Full page skeleton (header + grid)
export const SkeletonPage: React.FC<{
    cards?: number;
    columns?: string;
}> = ({ cards = 6, columns }) => (
    <div className="animate-fade-in">
        <SkeletonHeader />
        <SkeletonGrid count={cards} columns={columns} />
    </div>
);

// Table skeleton
export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
    <div className="space-y-2">
        <div className="flex gap-4 p-3">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-4 flex-1 rounded-md" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-4 p-3 glass-panel rounded-xl">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-4 flex-1 rounded-md" />
            </div>
        ))}
    </div>
);

export default Skeleton;
