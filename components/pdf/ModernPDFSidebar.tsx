import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Star, Check, Award, ShieldCheck, Layers, X, Sparkles } from 'lucide-react';
import { ModernPDFOutlineItem, ModernBookmark, ModernReadingTheme } from './modernTypes.ts';
import CommunityService from '../../services/communityService.ts';

interface ModernPDFSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    numPages: number;
    currentPage: number;
    pdfDoc: any;
    outline?: ModernPDFOutlineItem[];
    bookmarks?: ModernBookmark[];
    readingTheme: ModernReadingTheme;
    onJumpToPage: (page: number) => void;
    onToggleBookmark?: (pageNum: number) => void;
    file?: any;
    userProfile?: any;
}

export const ModernPDFSidebar: React.FC<ModernPDFSidebarProps> = ({
    isOpen,
    onClose,
    numPages,
    currentPage,
    pdfDoc,
    readingTheme,
    onJumpToPage,
    file,
    userProfile,
}) => {
    const [activeTab, setActiveTab] = useState<'thumbnails' | 'rate'>('thumbnails');
    const [userRating, setUserRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [averageRating, setAverageRating] = useState<number>(4.8);
    const [ratingVotesCount, setRatingVotesCount] = useState<number>(14);
    const [justRated, setJustRated] = useState(false);

    const isLight = readingTheme === 'light';

    // Deterministic fallback rating consistent with Scholix standards
    const deterministicRating = useMemo(() => {
        if (file?.rating_votes) {
            const votes = Object.values(file.rating_votes as Record<string, number>);
            if (votes.length > 0) {
                return Number((votes.reduce((a, b) => a + b, 0) / votes.length).toFixed(1));
            }
        }
        try {
            const raw = localStorage.getItem('scholix_mock_documents_ratings');
            if (raw) {
                const list = JSON.parse(raw);
                const found = list.find((r: any) => r.id === file?.id);
                if (found && found.rating_votes) {
                    const votes = Object.values(found.rating_votes as Record<string, number>);
                    if (votes.length > 0) {
                        return Number((votes.reduce((a, b) => a + b, 0) / votes.length).toFixed(1));
                    }
                }
            }
        } catch {}

        if (file?.rating && typeof file.rating === 'number') {
            return Number(file.rating.toFixed(1));
        }

        const str = file?.name || file?.id || 'doc';
        const sum = str.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
        return Number((4.5 + (sum % 5) * 0.1).toFixed(1));
    }, [file]);

    // Load rating data from community service and localStorage
    useEffect(() => {
        if (!file?.id) {
            setAverageRating(deterministicRating);
            setRatingVotesCount(14);
            return;
        }

        let isMounted = true;
        const load = async () => {
            try {
                const data = await CommunityService.fetchFileCommunityData(file.id);
                if (!isMounted) return;

                let votesMap: Record<string, number> = {};
                if (file.rating_votes) {
                    votesMap = { ...file.rating_votes };
                }
                try {
                    const raw = localStorage.getItem('scholix_mock_documents_ratings');
                    if (raw) {
                        const list = JSON.parse(raw);
                        const found = list.find((r: any) => r.id === file.id);
                        if (found?.rating_votes) {
                            votesMap = { ...votesMap, ...found.rating_votes };
                        }
                    }
                } catch {}

                const votesList = Object.values(votesMap) as number[];
                if (votesList.length > 0) {
                    const avg = Number((votesList.reduce((a: number, b: number) => a + b, 0) / votesList.length).toFixed(1));
                    setAverageRating(avg);
                    setRatingVotesCount(votesList.length);
                } else if (data.averageRating > 0) {
                    setAverageRating(data.averageRating);
                    setRatingVotesCount(data.ratingVotesCount || 1);
                } else {
                    setAverageRating(deterministicRating);
                    const seed = (file.name || 'seed').charCodeAt(0);
                    setRatingVotesCount(12 + (seed % 15));
                }

                const uid = userProfile?.id || 'guest_user';
                if (votesMap[uid]) {
                    setUserRating(votesMap[uid]);
                }
            } catch {
                if (isMounted) {
                    setAverageRating(deterministicRating);
                    setRatingVotesCount(14);
                }
            }
        };

        load();
        return () => { isMounted = false; };
    }, [file?.id, userProfile?.id, deterministicRating]);

    // Handle rating submission
    const handleRate = async (score: number) => {
        const uid = userProfile?.id || 'guest_user';
        setUserRating(score);
        setJustRated(true);
        setTimeout(() => setJustRated(false), 3500);

        try {
            if (file?.id) {
                await CommunityService.submitFileRating(file.id, uid, score);
            }
        } catch (err) {
            console.error('Rating submit failed:', err);
        }

        try {
            const raw = localStorage.getItem('scholix_mock_documents_ratings');
            let list = raw ? JSON.parse(raw) : [];
            let found = list.find((r: any) => r.id === file?.id);
            if (!found) {
                found = { id: file?.id, rating_votes: {} };
                list.push(found);
            }
            if (!found.rating_votes) found.rating_votes = {};
            found.rating_votes[uid] = score;
            localStorage.setItem('scholix_mock_documents_ratings', JSON.stringify(list));
            window.dispatchEvent(new Event('storage'));

            const votesList = Object.values(found.rating_votes) as number[];
            const avg = Number((votesList.reduce((a: number, b: number) => a + b, 0) / votesList.length).toFixed(1));
            setAverageRating(avg);
            setRatingVotesCount(votesList.length);
        } catch {}
    };

    const ratingLabels: { [key: number]: string } = {
        1: 'Needs Improvement',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Outstanding',
    };

    // Synthetic distribution bars calculated cleanly from average rating
    const breakdown = useMemo(() => {
        const avg = averageRating || 4.8;
        if (avg >= 4.7) return [82, 14, 4, 0, 0];
        if (avg >= 4.3) return [65, 25, 8, 2, 0];
        if (avg >= 3.8) return [45, 35, 15, 3, 2];
        return [30, 30, 25, 10, 5];
    }, [averageRating]);

    return (
        <>
            {/* Backdrop overlay on mobile */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-[55] animate-fade-in"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed top-12 md:top-14 bottom-0 left-0 w-72 sm:w-80 border-r z-[60] flex flex-col transition-transform duration-300 ease-out shadow-2xl backdrop-blur-2xl ${
                    isLight
                        ? 'bg-white/95 text-zinc-900 border-zinc-200/80'
                        : 'bg-[#09090b]/95 text-zinc-100 border-white/[0.08]'
                } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Apple-Style Refined Segmented Control Header */}
                <div className={`flex items-center justify-between px-3 py-2.5 border-b ${
                    isLight ? 'border-zinc-200/80' : 'border-white/[0.08]'
                }`}>
                    <div className={`flex items-center p-0.5 rounded-xl flex-1 mr-2 ${
                        isLight ? 'bg-zinc-150/80 bg-zinc-100' : 'bg-white/[0.07]'
                    }`}>
                        <button
                            onClick={() => setActiveTab('thumbnails')}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all border-none flex items-center justify-center gap-1.5 cursor-pointer ${
                                activeTab === 'thumbnails'
                                    ? isLight
                                        ? 'bg-white text-zinc-950 shadow-xs'
                                        : 'bg-white/15 text-white shadow-xs'
                                    : isLight
                                    ? 'text-zinc-500 hover:text-zinc-900'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                            title="Document Pages"
                        >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Pages</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                                activeTab === 'thumbnails'
                                    ? isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-white/20 text-white'
                                    : isLight ? 'bg-zinc-200/60 text-zinc-500' : 'bg-white/10 text-zinc-400'
                            }`}>
                                {numPages}
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('rate')}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all border-none flex items-center justify-center gap-1.5 cursor-pointer ${
                                activeTab === 'rate'
                                    ? isLight
                                        ? 'bg-white text-zinc-950 shadow-xs'
                                        : 'bg-white/15 text-white shadow-xs'
                                    : isLight
                                    ? 'text-zinc-500 hover:text-zinc-900'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                            title="Rate this document"
                        >
                            <Star className={`w-3.5 h-3.5 ${activeTab === 'rate' ? 'fill-amber-400 text-amber-400' : ''}`} />
                            <span>Rate Doc</span>
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all border-none cursor-pointer ${
                            isLight
                                ? 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100'
                                : 'text-zinc-500 hover:text-white hover:bg-white/10'
                        }`}
                        title="Close Sidebar"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Tab Body */}
                <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                    {/* View 1: Pages Grid */}
                    {activeTab === 'thumbnails' && (
                        <div className="grid grid-cols-2 gap-3">
                            {Array.from({ length: numPages }).map((_, idx) => {
                                const pageNumber = idx + 1;
                                const isActive = currentPage === pageNumber;

                                return (
                                    <div
                                        key={pageNumber}
                                        onClick={() => onJumpToPage(pageNumber)}
                                        className={`group relative flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${
                                            isActive
                                                ? 'bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/20 shadow-md'
                                                : isLight
                                                ? 'bg-zinc-50/80 border-zinc-200/80 hover:border-zinc-300'
                                                : 'bg-white/[0.03] border-white/[0.06] hover:border-white/20'
                                        }`}
                                    >
                                        <div className={`relative w-full aspect-[3/4] rounded-lg shadow-xs overflow-hidden flex flex-col items-center justify-center border ${
                                            isLight ? 'bg-white border-zinc-200' : 'bg-[#18181b] border-white/5'
                                        }`}>
                                            <SidebarThumbnailCanvas
                                                pageNum={pageNumber}
                                                pdfDoc={pdfDoc}
                                            />
                                        </div>

                                        <div className="mt-1.5 flex items-center justify-center w-full px-1">
                                            <span className={`text-[11px] font-semibold ${
                                                isActive
                                                    ? 'text-orange-500 font-bold'
                                                    : isLight
                                                    ? 'text-zinc-700'
                                                    : 'text-zinc-300'
                                            }`}>
                                                Page {pageNumber}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* View 2: Apple-Style Premium Rate Document View */}
                    {activeTab === 'rate' && (
                        <div className="flex flex-col space-y-3.5 py-1 animate-fade-in">
                            {/* Apple App Store / Books Style Rating Hero Card */}
                            <div className={`p-4 rounded-2xl border ${
                                isLight
                                    ? 'bg-zinc-50/70 border-zinc-200/80'
                                    : 'bg-white/[0.03] border-white/[0.06]'
                            }`}>
                                <div className="flex items-baseline justify-between mb-2">
                                    <div>
                                        <span className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                                            {averageRating.toFixed(1)}
                                        </span>
                                        <span className="text-xs font-medium text-zinc-400 ml-1">/ 5.0</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-0.5 justify-end">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star
                                                    key={s}
                                                    className={`w-3.5 h-3.5 ${
                                                        s <= Math.round(averageRating)
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'text-zinc-300 dark:text-zinc-700'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[11px] text-zinc-400 font-medium">
                                            {ratingVotesCount} student reviews
                                        </span>
                                    </div>
                                </div>

                                {/* Apple-Style Rating Distribution Bars */}
                                <div className="space-y-1.5 pt-2 border-t border-zinc-200/60 dark:border-white/[0.06]">
                                    {[5, 4, 3, 2, 1].map((stars, idx) => (
                                        <div key={stars} className="flex items-center gap-2 text-[10px]">
                                            <span className="w-3 text-zinc-400 font-medium text-right">{stars}★</span>
                                            <div className="flex-1 h-1.5 rounded-full bg-zinc-200/70 dark:bg-white/[0.08] overflow-hidden">
                                                <div
                                                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                                    style={{ width: `${breakdown[idx]}%` }}
                                                />
                                            </div>
                                            <span className="w-6 text-zinc-400 font-mono text-right">{breakdown[idx]}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Interactive Star Picker Card */}
                            <div className={`p-4 rounded-2xl border flex flex-col items-center text-center ${
                                isLight
                                    ? 'bg-zinc-50/70 border-zinc-200/80'
                                    : 'bg-white/[0.03] border-white/[0.06]'
                            }`}>
                                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">
                                    {userRating > 0 ? 'Your Rating' : 'Tap to Rate'}
                                </span>
                                <span className="text-[11px] text-zinc-400 mb-3">
                                    Help other students discover quality notes
                                </span>

                                <div className="flex items-center justify-center gap-2 py-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => handleRate(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="p-1 border-none bg-transparent cursor-pointer transition-transform hover:scale-115 active:scale-95"
                                            title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                        >
                                            <Star
                                                className={`w-6 h-6 transition-colors duration-150 ${
                                                    (hoverRating || userRating || 0) >= star
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'text-zinc-300 dark:text-white/20 hover:text-amber-300'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>

                                <div className="h-4 mt-2 flex items-center justify-center">
                                    <span className="text-xs font-semibold text-amber-500 dark:text-amber-400">
                                        {(hoverRating && ratingLabels[hoverRating]) ||
                                         (userRating && ratingLabels[userRating]) ||
                                         'Select a rating'}
                                    </span>
                                </div>

                                {justRated && (
                                    <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full animate-fade-in">
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Rating saved</span>
                                    </div>
                                )}
                            </div>

                            {/* Apple-Style Inset Grouped Info List */}
                            <div className={`rounded-2xl border overflow-hidden divide-y ${
                                isLight
                                    ? 'bg-zinc-50/50 border-zinc-200/80 divide-zinc-200/60'
                                    : 'bg-white/[0.02] border-white/[0.06] divide-white/[0.04]'
                            }`}>
                                <div className="p-3 flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Curriculum Aligned</div>
                                        <div className="text-[10px] text-zinc-400">Verified peer course material</div>
                                    </div>
                                </div>

                                <div className="p-3 flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                                        <Award className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Scholix Quality Certified</div>
                                        <div className="text-[10px] text-zinc-400">High-clarity study document</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Rating Bottom Bar (Always available when browsing Pages) */}
                {activeTab === 'thumbnails' && (
                    <div className={`p-3 border-t backdrop-blur-xl flex items-center justify-between gap-2 shrink-0 ${
                        isLight
                            ? 'bg-white/80 border-zinc-200/80'
                            : 'bg-[#09090b]/80 border-white/[0.08]'
                    }`}>
                        <div className="flex flex-col cursor-pointer" onClick={() => setActiveTab('rate')}>
                            <div className="flex items-center gap-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                <span>{averageRating.toFixed(1)}</span>
                                <span className="text-[10px] font-normal text-zinc-400">({ratingVotesCount})</span>
                            </div>
                            <span className="text-[10px] text-zinc-400 font-medium">
                                {userRating > 0 ? `Your rating: ${userRating}★` : 'Tap to rate'}
                            </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleRate(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-1 border-none bg-transparent cursor-pointer transition-transform hover:scale-115 active:scale-95"
                                    title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                >
                                    <Star
                                        className={`w-3.5 h-3.5 transition-colors ${
                                            (hoverRating || userRating || 0) >= star
                                                ? 'fill-amber-400 text-amber-400'
                                                : 'text-zinc-300 dark:text-zinc-600 hover:text-amber-300'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
};

// Lightweight Thumbnail Canvas Component with Lazy Rendering
const SidebarThumbnailCanvas: React.FC<{ pageNum: number; pdfDoc: any }> = ({ pageNum, pdfDoc }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [rendered, setRendered] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible || !pdfDoc || rendered) return;
        let active = true;

        const renderThumb = async () => {
            try {
                const page = await pdfDoc.getPage(pageNum);
                if (!active) return;
                const vp = page.getViewport({ scale: 0.22 });
                const canvas = canvasRef.current;
                if (!canvas) return;
                canvas.width = vp.width;
                canvas.height = vp.height;
                const ctx = canvas.getContext('2d', { alpha: false });
                if (!ctx) return;
                await page.render({ canvasContext: ctx, viewport: vp }).promise;
                if (active) setRendered(true);
            } catch (e) {
                // Ignore cancelled thumb renders
            }
        };

        renderThumb();
        return () => {
            active = false;
        };
    }, [isVisible, pdfDoc, pageNum, rendered]);

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center">
            <canvas ref={canvasRef} className="max-w-full max-h-full object-contain pointer-events-none" />
            {!rendered && (
                <span className="text-[11px] font-bold text-zinc-400">
                    {pageNum}
                </span>
            )}
        </div>
    );
};
