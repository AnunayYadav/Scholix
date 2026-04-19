import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AITool } from '../types';
import NexusDropdown from './NexusDropdown';
import { useUniversity } from '../hooks/useUniversity.tsx';
import { aiTools } from '../data/aiToolsData';
import NexusAd from './NexusAd';

const AIToolsDirectory: React.FC = () => {
    const { shortBrandName } = useUniversity();
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get('q');
        if (q) setSearchQuery(q);
    }, [location.search]);
    const [visibleCount, setVisibleCount] = useState(24);
    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const loaderRef = React.useRef<HTMLDivElement>(null);

    const filteredTools = aiTools
        .filter(tool => {
            const matchesFilter = filter === 'All' || tool.category === filter;
            const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesFilter && matchesSearch;
        })
        .sort((a, b) => {
            if (a.isHero && !b.isHero) return -1;
            if (!a.isHero && b.isHero) return 1;
            return a.name.localeCompare(b.name);
        });

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Reset pagination when filter or search changes
    React.useEffect(() => {
        setVisibleCount(12);
    }, [filter, searchQuery]);

    // Intersection Observer for Infinite Scroll
    React.useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setVisibleCount(prev => prev + 12);
            }
        }, { threshold: 0.1 });

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => observer.disconnect();
    }, [filteredTools.length]);

    const categories = ['All', 'General', 'Writing', 'Coding', 'Research', 'Design', 'Productivity', 'Presentations', 'Video', 'Audio', 'Business', 'Education', '3D', 'Data', 'Security', 'Healthcare'];

    const categoryCounts = categories.reduce((acc, cat) => {
        if (cat === 'All') {
            acc[cat] = aiTools.length;
        } else {
            acc[cat] = aiTools.filter(t => t.category === cat).length;
        }
        return acc;
    }, {} as Record<string, number>);

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'General': return <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zM12 6a6 6 0 1 0 6 6 6 6 0 0 0-6-6z" />;
            case 'Writing': return <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />;
            case 'Coding': return <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />;
            case 'Research': return (
                <>
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                </>
            );
            case 'Design': return <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10a10 10 0 0 0 10-10c0-5.53-4.47-10-10-10zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />;
            case 'Productivity': return <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />;
            case 'Presentations': return (
                <>
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <path d="M8 21h8M12 17v4" />
                </>
            );
            case 'Video': return (
                <>
                    <path d="m22 8-6 4 6 4V8Z" />
                    <rect x="2" y="6" width="14" height="12" rx="2" ry="2" />
                </>
            );
            case 'Audio': return (
                <>
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8" />
                </>
            );
            case 'Business': return (
                <>
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </>
            );
            case 'Education': return (
                <>
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3.333 3 8.667 3 12 0v-5" />
                </>
            );
            case '3D': return (
                <>
                    <path d="m21 8-9-4-9 4v8l9 4 9-4V8L12 12 3 8" />
                    <path d="m12 12V20" />
                </>
            );
            case 'Data': return (
                <>
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5" />
                    <path d="M3 12c0 1.657 4.03 3 9 3s9-1.343 9-3" />
                </>
            );
            case 'Security': return (
                <>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </>
            );
            case 'Healthcare': return (
                <>
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    <path d="M12 5v14M5 12h14" />
                </>
            );
            default: return <circle cx="12" cy="12" r="10" />;
        }
    };

    const getToolIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('chatgpt')) return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                <path d="M12 8l4 4-4 4-4-4 4-4z" />
            </svg>
        );
        if (n.includes('gemini')) return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full text-blue-500">
                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36" />
                <path d="M12 8l4 4-4 4-4-4 4-4z" />
            </svg>
        );
        if (n.includes('claude')) return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full text-orange-200">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
            </svg>
        );
        if (n.includes('perplexity')) return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full text-emerald-500">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
        );
        if (n.includes('midjourney') || n.includes('firefly') || n.includes('dall')) return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full text-purple-500">
                <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10a10 10 0 0 0 10-10c0-5.53-4.47-10-10-10zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
            </svg>
        );
        if (n.includes('github') || n.includes('copilot') || n.includes('cursor')) return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
        );
        if (n.includes('suno') || n.includes('udio') || n.includes('elevenlabs')) return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full text-pink-500">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8" />
            </svg>
        );
        if (n.includes('canva') || n.includes('framer') || n.includes('uizard')) return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full text-cyan-500">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <path d="M8 21h8M12 17v4" />
            </svg>
        );
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
                <path d="M12 2a10 10 0 1 0 10 10H12V2Z" /><path d="M12 12l7-7" />
            </svg>
        );
    };


    return (
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-12 space-y-12 animate-fade-in pb-32">
            {/* Header Section */}
            <header className="text-center space-y-4 relative">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-orange-500/10 blur-[80px] rounded-full" />
                <h2 className="text-3xl md:text-5xl font-semibold text-zinc-800 dark:text-white tracking-tight leading-none">
                    AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 font-bold">Forge</span>
                </h2>
                <div className="flex flex-col items-center justify-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="h-[1px] w-8 md:w-16 bg-zinc-200 dark:bg-white/10" />
                        <p className="text-zinc-500 text-[11px] sm:text-xs font-medium leading-none">
                            Intelligence Hub {shortBrandName}
                        </p>
                        <div className="h-[1px] w-8 md:w-16 bg-zinc-200 dark:bg-white/10" />
                    </div>
                    <p className="text-[10px] sm:text-xs font-semibold text-zinc-400 dark:text-white/30 uppercase tracking-[0.4em] mt-2">
                        Discovery of <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 font-bold">500+</span> Premium AI Solutions
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-4 max-w-5xl mx-auto mt-8">
                    {/* Search Input Container */}
                    <div className="relative flex-1 group">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-500 transition-all duration-300 z-10 pointer-events-none">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </div>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Ignite your search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-24 h-[58px] bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 rounded-[24px] text-[13px] md:text-[14px] font-medium outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/40 transition-all dark:text-white shadow-2xl shadow-black/5"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                            <kbd className="hidden md:flex h-6 px-1.5 items-center justify-center rounded-md bg-zinc-100 dark:bg-white/10 text-[11px] sm:text-xs font-black text-zinc-400 dark:text-zinc-500">CMD</kbd>
                            <kbd className="hidden md:flex h-6 px-1.5 items-center justify-center rounded-md bg-zinc-100 dark:bg-white/10 text-[11px] sm:text-xs font-black text-zinc-400 dark:text-zinc-500">K</kbd>
                        </div>
                    </div>


                    {/* Category Dropdown */}
                    <NexusDropdown
                        value={filter}
                        onChange={setFilter}
                        options={categories}
                        icon={
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                                {getCategoryIcon(filter)}
                            </svg>
                        }
                        className="w-full md:w-auto md:min-w-[240px]"
                        buttonClassName="!h-[58px] !rounded-[24px] !text-[13px] md:!text-[14px] !font-semibold"
                        renderCustomMenu={(close) => (
                            <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => { setFilter(cat); close(); }}
                                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border-none ${filter === cat
                                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                            : 'text-zinc-500 dark:text-zinc-400 bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-orange-500'
                                            }`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 opacity-70">
                                                {getCategoryIcon(cat)}
                                            </svg>
                                            {cat}
                                        </span>
                                        <span className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-black border transition-colors ${filter === cat
                                            ? 'bg-white/20 border-white/30 text-white'
                                            : 'bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-400 dark:text-zinc-500'
                                            }`}>
                                            {categoryCounts[cat]}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    />
                </div>
            </header>

            {/* In-Article Ad Component */}
            <div className="max-w-5xl mx-auto w-full">
                <NexusAd slot="7296989983" layout="in-article" format="fluid" hideLabel />
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {filteredTools.length > 0 ? (
                    filteredTools.slice(0, visibleCount).map((tool, i) => (
                        <div
                            key={tool.id}
                            style={{ animationDelay: `${i * 50}ms` }}
                            className={`group relative p-4 md:p-6 bg-white dark:bg-[#0d0d0d] border rounded-[28px] md:rounded-[36px] transition-[border-color,transform,box-shadow,background-color] duration-300 flex flex-col justify-between overflow-hidden group/card shadow-2xl shadow-black/5 ${tool.isHero
                                ? 'border-amber-500/30 dark:border-amber-500/20 ring-1 ring-amber-500/5 bg-amber-50/10 dark:bg-amber-500/[0.01] hover:border-amber-500/50'
                                : 'border-zinc-100 dark:border-white/5 hover:border-orange-500/30'
                                }`}
                        >

                            {/* Watermark Icon */}
                            <div className="absolute -right-6 -top-6 w-32 h-32 text-zinc-900/[0.02] dark:text-white/[0.02] group-hover/card:text-orange-500/[0.05] transition-colors duration-500 pointer-events-none -rotate-12">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                    {getCategoryIcon(tool.category)}
                                </svg>
                            </div>

                            <div className="relative z-10 space-y-5">
                                <div className="flex items-center justify-between">
                                    {tool.isHero ? (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 dark:bg-amber-500/5 rounded-lg border border-amber-500/20 shadow-sm backdrop-blur-md">
                                            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider">Elite Pick</span>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5 text-amber-500"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                        </div>
                                    ) : <div />}
                                    <span className={`text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-full border ${tool.pricing === 'Free' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' :
                                        tool.pricing === 'Freemium' ? 'text-orange-500 border-orange-500/20 bg-orange-500/5' :
                                            'text-blue-500 border-blue-500/20 bg-blue-500/5'
                                        }`}>
                                        {tool.pricing}
                                    </span>
                                </div>

                                <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center p-3 transition-[background-color,color,box-shadow,border-color] duration-300 ${tool.isHero
                                    ? 'bg-zinc-50 dark:bg-white/5 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-inner'
                                    : 'bg-zinc-50 dark:bg-white/5 text-zinc-900 dark:text-white group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-zinc-900 group-hover:shadow-xl'
                                    }`}>
                                    {getToolIcon(tool.name)}
                                </div>

                                <div className="space-y-2 text-left">
                                    <h4 className="text-base md:text-lg font-semibold text-zinc-900 dark:text-white tracking-tight leading-none">
                                        {tool.name}
                                    </h4>
                                    <p className="text-[11px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2 tracking-wide">
                                        {tool.description}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-1">
                                    {tool.tags.map(tag => (
                                        <span key={tag} className="text-[10px] sm:text-[11px] font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-white/5 px-2 py-0.5 rounded-md border border-zinc-100 dark:border-white/5">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <a
                                href={tool.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`relative z-10 mt-6 group/btn h-12 flex items-center justify-center gap-2 rounded-[18px] text-[11px] font-semibold uppercase transition-all duration-300 no-underline shadow-lg active:scale-95 ${tool.isHero
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-orange-500/25 hover:-translate-y-0.5'
                                    : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-orange-500 dark:hover:bg-orange-500 hover:text-white dark:hover:text-white'
                                    }`}
                            >
                                Forge Ahead
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
                            </a>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-zinc-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-zinc-300">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10"><path d="M12 2v2M12 20v2M2 12h2M20 12h2M12 12l4 4M12 12l-4-4" /></svg>
                        </div>
                        <p className="text-zinc-400 font-medium text-xs">No intelligence found in the forge.</p>
                    </div>
                )}
            </div>

            {/* Pagination Loader Trigger */}
            {filteredTools.length > visibleCount && (
                <div ref={loaderRef} className="py-20 flex justify-center">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '200ms' }} />
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '400ms' }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIToolsDirectory;
