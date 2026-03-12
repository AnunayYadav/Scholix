import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { UserProfile, NexusOriginal, Flashcard, QuizQuestion } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';
import { generateSubjectOriginals } from '../services/geminiService.ts';
import { extractTextFromPdf } from '../services/pdfUtils.ts';
import { showToast } from './Toast.tsx';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface NexusOriginalsProps {
    userProfile: UserProfile | null;
    activeSubject: string;
    activeSemester: string;
    activeProgram: string;
    onBack: () => void;
}

const parseLine = (text: string | undefined) => {
    if (!text) return null;
    const parts = text.split(/(\$\$[\s\S]*?\$\$|\$.*?\$|\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
            const math = part.slice(2, -2);
            return <div key={i} className="my-2 overflow-x-auto flex justify-center"><BlockMath math={math} /></div>;
        }
        if (part.startsWith('$') && part.endsWith('$')) {
            const math = part.slice(1, -1);
            return <InlineMath key={i} math={math} />;
        }
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
    });
};

const NexusOriginals: React.FC<NexusOriginalsProps> = ({
    userProfile,
    activeSubject: initialSubject,
    activeSemester: initialSemester,
    activeProgram: initialProgram,
    onBack
}) => {
    const [allOriginals, setAllOriginals] = useState<NexusOriginal[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    // UI Navigation States
    const [activeSubjectData, setActiveSubjectData] = useState<NexusOriginal | null>(null);
    const [viewMode, setViewMode] = useState<'catalog' | 'units' | 'notes' | 'quiz' | 'flashcards'>('catalog');
    const [selectedUnitIdx, setSelectedUnitIdx] = useState<number | null>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);

    // Optimized Scroll Progress Handler (Direct DOM manipulation for 0-latency)
    useEffect(() => {
        const scrollArea = document.getElementById('main-content-area');

        const updateProgress = () => {
            if (viewMode !== 'notes' || !scrollArea || !progressBarRef.current) return;
            const scrollTop = scrollArea.scrollTop;
            const totalHeight = scrollArea.scrollHeight - scrollArea.clientHeight;
            const progress = totalHeight > 0 ? (scrollTop / totalHeight) : 0;
            progressBarRef.current.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
        };

        if (viewMode === 'notes' && scrollArea) {
            scrollArea.addEventListener('scroll', updateProgress, { passive: true });
            updateProgress(); // Initial check
        }

        return () => scrollArea?.removeEventListener('scroll', updateProgress);
    }, [viewMode, selectedUnitIdx]);

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        try {
            const { nexusOriginalsData } = await import('../data/nexusOriginalsData.ts');
            setAllOriginals(nexusOriginalsData);

            if (initialSubject !== 'Search Subject') {
                const matched = nexusOriginalsData.find(d => {
                    const normActiveSub = initialSubject.toLowerCase();
                    const normDataSub = d.subject.toLowerCase();
                    return normDataSub.includes(normActiveSub) || normActiveSub.includes(normDataSub.split(':')[0].toLowerCase().trim());
                });
                if (matched) {
                    setActiveSubjectData(matched);
                    setViewMode('units');
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubjectSelect = (subject: NexusOriginal) => {
        setActiveSubjectData(subject);
        setViewMode('units');
        setSelectedUnitIdx(null);
    };

    const handleOpenNotes = (idx: number) => {
        setSelectedUnitIdx(idx);
        setViewMode('notes');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleOpenQuiz = (idx: number) => {
        setSelectedUnitIdx(idx);
        setViewMode('quiz');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleOpenFlashcards = (idx: number) => {
        setSelectedUnitIdx(idx);
        setViewMode('flashcards');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBackToUnits = () => {
        setSelectedUnitIdx(null);
        setViewMode('units');
    };

    const handleBackToCatalog = () => {
        setActiveSubjectData(null);
        setViewMode('catalog');
        setSelectedUnitIdx(null);
    };

    const handleGenerate = async () => {
        if (!userProfile?.is_admin) return;
        setGenerating(true);
        try {
            const allFiles = await NexusServer.fetchFiles(initialProgram);
            const syllabusFile = allFiles.find(f =>
                f.subject.toLowerCase().includes(initialSubject.toLowerCase()) &&
                (f.name.toLowerCase().includes('syllabus') || f.type.toLowerCase().includes('syllabus'))
            );
            let syllabusText = "General academic context for " + initialSubject;
            if (syllabusFile) {
                const url = await NexusServer.getFileUrl(syllabusFile.storage_path);
                const res = await fetch(url);
                const blob = await res.blob();
                syllabusText = await extractTextFromPdf(new File([blob], "syllabus.pdf"));
            }
            const generated = await generateSubjectOriginals(initialSubject, syllabusText);
            await NexusServer.upsertNexusOriginal(initialSubject, initialSemester, initialProgram, generated);
            showToast("Nexus Originals generated successfully!", "success");
            loadAllData();
        } catch (e: any) {
            showToast("Generation failed: " + e.message, "error");
        } finally {
            setGenerating(false);
        }
    };

    // Get unit-specific quizzes and flashcards
    const unitQuizzes = useMemo(() => {
        if (!activeSubjectData || selectedUnitIdx === null) return [];
        const unitNum = activeSubjectData.content.notes[selectedUnitIdx]?.unit || selectedUnitIdx + 1;
        return activeSubjectData.content.quizzes.filter(q => q.unit === unitNum);
    }, [activeSubjectData, selectedUnitIdx]);

    const unitFlashcards = useMemo(() => {
        if (!activeSubjectData || selectedUnitIdx === null) return [];
        const totalUnits = activeSubjectData.content.notes.length;
        const allCards = activeSubjectData.content.flashcards;
        const perUnit = Math.ceil(allCards.length / totalUnits);
        const start = selectedUnitIdx * perUnit;
        return allCards.slice(start, start + perUnit);
    }, [activeSubjectData, selectedUnitIdx]);

    // Estimate read time
    const estimateReadTime = (body: string) => {
        const wordCount = body.split(/\s+/).length;
        return Math.max(1, Math.ceil(wordCount / 200));
    };

    // --- LOADING STATE ---
    if (loading) return (
        <div className="animate-fade-in h-[60vh] flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center py-24">
                <div className="w-12 h-12 bg-orange-600/10 rounded-full mb-4 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-xs font-bold text-slate-400 tracking-widest animate-pulse uppercase">Initializing Library...</p>
            </div>
        </div>
    );
    // ===========================================
    // --- 1. CATALOG VIEW ---
    // ===========================================
    if (viewMode === 'catalog') {
        return (
            <div key="catalog" className="space-y-6 animate-fade-in pb-20">
                <header className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 bg-slate-100 dark:bg-[#0a0a0a] rounded-xl flex items-center justify-center text-slate-400 hover:text-orange-600 transition-all border-none flex-shrink-0">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight leading-none">
                        Nexus <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Originals</span>
                    </h2>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allOriginals.map((subject) => (
                        <div
                            key={subject.id}
                            onClick={() => handleSubjectSelect(subject)}
                            className="group relative cursor-pointer overflow-hidden rounded-[32px] border border-slate-200/60 dark:border-white/10 bg-white dark:bg-[#0a0a0a]/60 hover:border-orange-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-600/10 active:scale-[0.98] flex flex-col h-full"
                        >
                            {/* Decorative accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="p-7 flex flex-col h-full relative z-10">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-orange-600 tracking-widest uppercase mb-1">Semester {subject.semester}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{subject.program}</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-lg group-hover:shadow-orange-600/30">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug mb-6 flex-grow">{subject.subject}</h3>

                                <div className="grid grid-cols-3 gap-2 pt-5 border-t border-slate-100 dark:border-white/5">
                                    <div className="text-center">
                                        <p className="text-[14px] font-black text-slate-900 dark:text-white">{subject.content.notes.length}</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Units</p>
                                    </div>
                                    <div className="text-center border-x border-slate-100 dark:border-white/5">
                                        <p className="text-[14px] font-black text-slate-900 dark:text-white">{subject.content.quizzes.length}</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">MCQs</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[14px] font-black text-slate-900 dark:text-white">{subject.content.flashcards.length}</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Cards</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="p-6 rounded-2xl border-dashed border-2 border-slate-200 dark:border-white/5 flex flex-col items-center justify-center text-center opacity-50 min-h-[120px]">
                        <p className="text-xs text-slate-400">More coming soon</p>
                    </div>
                </div>
            </div>
        );
    }

    // ===========================================
    // --- 2. UNIT CARDS VIEW ---
    // ===========================================
    if (viewMode === 'units' && activeSubjectData) {
        return (
            <div key="units" className="space-y-8 animate-fade-in pb-20">
                <header className="relative py-8 px-6 rounded-[32px] overflow-hidden bg-white dark:bg-[#0a0d17] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-none">
                    {/* Immersive background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 dark:bg-orange-600/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-500/5 dark:bg-red-600/10 rounded-full blur-[80px] -ml-24 -mb-24" />

                    <div className="relative z-10 flex flex-col gap-6">
                        <button onClick={handleBackToCatalog} className="group flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-orange-600 dark:text-orange-500 uppercase transition-all bg-transparent border-none cursor-pointer">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                            Back to courses
                        </button>

                        <div className="space-y-2">
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                                {activeSubjectData.subject.split(':').pop()?.trim()}
                            </h2>
                            <div className="flex items-center gap-4 text-xs font-bold tracking-wider">
                                <span className="text-orange-600 dark:text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20 uppercase">{activeSubjectData.subject.split(':')[0]}</span>
                                <span className="text-slate-400">•</span>
                                <span className="text-slate-400 uppercase">{activeSubjectData.ltp}</span>
                                <span className="text-slate-400">•</span>
                                <span className="text-slate-400 uppercase">SEMESTER {activeSubjectData.semester}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeSubjectData.content.notes.map((unit, idx) => {
                        const unitNum = unit.unit || idx + 1;

                        return (
                            <div
                                key={idx}
                                className="group relative overflow-hidden p-6 rounded-[28px] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0a0a0a]/60 hover:border-orange-500/30 transition-all duration-500 hover:shadow-xl flex flex-col gap-6"
                            >
                                {/* Subtle unit number background */}
                                <div className="absolute -top-4 -right-4 text-8xl font-black text-slate-200/80 dark:text-white/[0.08] pointer-events-none group-hover:text-orange-500/[0.08] transition-colors">
                                    {unitNum}
                                </div>

                                <div className="relative z-10 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-orange-600 rounded-full" />
                                        <span className="text-[10px] font-black text-orange-600 tracking-widest uppercase">
                                            Unit {unitNum}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-snug line-clamp-2 min-h-[40px]">
                                        {unit.title.split(':').pop()?.trim()}
                                    </h3>
                                </div>

                                <div className="relative z-10 grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                                    <button
                                        onClick={() => handleOpenNotes(idx)}
                                        className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-600/10 transition-all border-none bg-transparent cursor-pointer group/btn"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 group-hover/btn:scale-110 transition-transform">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                                        </svg>
                                        <span className="text-[10px] font-black uppercase tracking-tighter">Notes</span>
                                    </button>
                                    <button
                                        onClick={() => handleOpenQuiz(idx)}
                                        className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-600/10 transition-all border-none bg-transparent cursor-pointer group/btn"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-5 h-5 group-hover/btn:scale-110 transition-transform" viewBox="0 0 16 16">
                                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                            <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94" />
                                        </svg>
                                        <span className="text-[10px] font-black uppercase tracking-tighter">MCQ</span>
                                    </button>
                                    <button
                                        onClick={() => handleOpenFlashcards(idx)}
                                        className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-600/10 transition-all border-none bg-transparent cursor-pointer group/btn"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 group-hover/btn:scale-110 transition-transform">
                                            <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M12 4v16" />
                                        </svg>
                                        <span className="text-[10px] font-black uppercase tracking-tighter">Cards</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // ===========================================
    // --- Content Renderer for Notes ---
    // ===========================================
    const renderContent = (body: string) => {
        const lines = body.split('\n');
        let h1Counter = 0;
        let h2Counter = 0;
        let h3Counter = 0;
        let isFirstH1 = true;
        let currentBlockMath = '';
        let isBlockMath = false;
        let currentTable: string[][] = [];
        let inTable = false;

        const flushTable = (key: number) => {
            if (currentTable.length === 0) return null;
            const headers = currentTable[0];
            const rows = currentTable.slice(2); // skip header separator
            const tbl = (
                <div key={key} className="my-6 overflow-x-auto rounded-xl border border-slate-100 dark:border-white/5">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-white/5">
                                {headers.map((h, hi) => (
                                    <th key={hi} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-white/5">{parseLine(h.trim())}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, ri) => (
                                <tr key={ri} className="border-b border-slate-50 dark:border-white/5 last:border-0">
                                    {row.map((cell, ci) => (
                                        <td key={ci} className="px-4 py-3 text-slate-600 dark:text-slate-300">{parseLine(cell.trim())}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
            currentTable = [];
            return tbl;
        };

        return lines.map((line, i) => {
            const trimmedLine = line.trim();

            // Skip inline "Table of Contents" section from the body (we render our own)
            if (/^#{1,3}\s+table\s+of\s+contents$/i.test(trimmedLine)) {
                return null;
            }
            // Skip TOC-style link lines like "* [Ohm's Law](#ohms-law)" or "[Ohm's Law](#ohms-law)"
            if (trimmedLine.match(/^(\*\s+|[-]\s+)?\[.*\]\(#.*\)$/)) {
                return null;
            }

            // Table handling
            if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
                const cells = trimmedLine.split('|').filter(c => c.trim() !== '');
                if (cells.every(c => c.trim().match(/^[-:]+$/))) {
                    // Header separator row
                    currentTable.push(cells);
                    inTable = true;
                    return null;
                }
                currentTable.push(cells);
                inTable = true;
                return null;
            } else if (inTable) {
                inTable = false;
                const table = flushTable(i);
                // Process current line after table
                if (!trimmedLine && !isBlockMath) return <React.Fragment key={i}>{table}<div className="h-3" /></React.Fragment>;
                return <React.Fragment key={i}>{table}</React.Fragment>;
            }

            if (!trimmedLine && !isBlockMath) return <div key={i} className="h-3" />;

            // Block math
            if (trimmedLine.startsWith('$$')) {
                if (isBlockMath) {
                    isBlockMath = false;
                    const math = currentBlockMath;
                    currentBlockMath = '';
                    return (
                        <div key={i} className="my-6 py-5 px-6 bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-100 dark:border-white/5 rounded-xl flex items-center justify-center overflow-x-auto">
                            <BlockMath math={math} />
                        </div>
                    );
                } else {
                    isBlockMath = true;
                    if (trimmedLine.length > 2 && trimmedLine.endsWith('$$')) {
                        isBlockMath = false;
                        return (
                            <div key={i} className="my-6 py-5 px-6 bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-100 dark:border-white/5 rounded-xl flex items-center justify-center overflow-x-auto">
                                <BlockMath math={trimmedLine.slice(2, -2)} />
                            </div>
                        );
                    }
                    return null;
                }
            }

            if (isBlockMath) {
                currentBlockMath += line + ' ';
                return null;
            }

            const getSlug = (text: string) => text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');

            // Headings - hierarchical numbering
            if (trimmedLine.startsWith('# ')) {
                const text = trimmedLine.replace('# ', '').trim();
                if (text.toLowerCase() === 'table of contents') return null;

                let number = '';
                const isReallyFirst = isFirstH1;
                if (isFirstH1) {
                    isFirstH1 = false;
                } else {
                    h1Counter++;
                    h2Counter = 0;
                    h3Counter = 0;
                    number = `${h1Counter}. `;
                }
                return <h1 key={i} id={getSlug(text)} className={`text-xl font-bold text-slate-900 dark:text-white mb-4 pt-6 scroll-mt-[140px] ${isReallyFirst ? '' : 'mt-10 border-t border-slate-100 dark:border-white/5'}`}>{number}{parseLine(text)}</h1>;
            }
            if (trimmedLine.startsWith('## ')) {
                const text = trimmedLine.replace('## ', '').trim();
                if (text.toLowerCase() === 'table of contents') return null;

                h2Counter++;
                h3Counter = 0;
                const number = h1Counter > 0 ? `${h1Counter}.${h2Counter}. ` : `${h2Counter}. `;
                return <h2 key={i} id={getSlug(text)} className="text-lg font-bold text-slate-800 dark:text-white mt-8 mb-3 scroll-mt-[140px]">{number}{parseLine(text)}</h2>;
            }
            if (trimmedLine.startsWith('### ')) {
                const text = trimmedLine.replace('### ', '').trim();
                if (text.toLowerCase() === 'table of contents') return null;

                h3Counter++;
                const prefix = h1Counter > 0 ? `${h1Counter}.${h2Counter}` : `${h2Counter}`;
                const number = `${prefix}.${h3Counter}. `;
                return <h3 key={i} id={getSlug(text)} className="text-base font-semibold text-slate-700 dark:text-slate-200 mt-6 mb-2 scroll-mt-[140px]">{number}{parseLine(text)}</h3>;
            }

            // Bullet points
            if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
                const content = trimmedLine.substring(2).trim();
                const tocMatch = content.match(/^\[(.*)\]\((#.*)\)$/);
                if (tocMatch) {
                    return (
                        <div key={i} className="mb-2 ml-4">
                            <a href={tocMatch[2]} className="text-slate-600 dark:text-slate-300 text-sm hover:text-orange-600 transition-colors">
                                {tocMatch[1]}
                            </a>
                        </div>
                    );
                }

                // Keyword bullets like **Definition:** ...
                if (content.startsWith('**') && content.includes(':**')) {
                    const [keyword, ...rest] = content.split(':**');
                    const cleanKeyword = keyword.replace('**', '').trim();
                    return (
                        <div key={i} className="flex gap-2.5 mb-3 ml-1">
                            <span className="text-orange-500 mt-2 text-[6px]">●</span>
                            <div className="flex-1 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                <strong className="text-slate-800 dark:text-white font-semibold">{cleanKeyword}:</strong> {parseLine(rest.join(':**'))}
                            </div>
                        </div>
                    );
                }

                return (
                    <div key={i} className="flex gap-2.5 mb-2.5 ml-1">
                        <span className="text-orange-500 mt-2 text-[6px]">●</span>
                        <div className="flex-1 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{parseLine(content)}</div>
                    </div>
                );
            }

            // Numbered lists
            const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.*)/);
            if (numberedMatch) {
                return (
                    <div key={i} className="flex gap-2.5 mb-2.5 ml-1">
                        <span className="text-slate-400 text-sm font-medium mt-0.5 min-w-[18px]">{numberedMatch[1]}.</span>
                        <div className="flex-1 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{parseLine(numberedMatch[2])}</div>
                    </div>
                );
            }

            // Blockquotes
            if (trimmedLine.startsWith('> ')) {
                const text = trimmedLine.replace('> ', '');
                return (
                    <div key={i} className="p-4 bg-orange-50/50 dark:bg-orange-600/5 border-l-3 border-orange-500 rounded-r-lg italic my-4 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                        {parseLine(text)}
                    </div>
                );
            }

            // Links in content
            if (trimmedLine.match(/^\[.*\]\(#.*\)$/)) {
                const match = trimmedLine.match(/^\[(.*)\]\((#.*)\)$/);
                if (match) {
                    return (
                        <a key={i} href={match[2]} className="block text-slate-600 dark:text-slate-300 text-sm hover:text-orange-600 transition-colors mb-2 ml-4">
                            {match[1]}
                        </a>
                    );
                }
            }

            // Regular paragraph
            return <p key={i} className="mb-3 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{parseLine(line)}</p>;
        });
    };

    // ===========================================
    // --- 3. NOTE READER VIEW ---
    // ===========================================
    if (viewMode === 'notes' && activeSubjectData && selectedUnitIdx !== null) {
        const note = activeSubjectData.content.notes[selectedUnitIdx];
        const unitNum = note.unit || selectedUnitIdx + 1;
        const subjectCode = activeSubjectData.subject.split(':')[0]?.trim() || '';
        const readTime = estimateReadTime(note.body);
        const totalUnits = activeSubjectData.content.notes.length;

        // Table of contents extraction
        let h1Counter = 0;
        let h2Counter = 0;
        let h3Counter = 0;
        let isFirstH1 = true;

        const tocItems = note.body.split('\n')
            .filter(l => l.trim().startsWith('### ') || l.trim().startsWith('## ') || l.trim().startsWith('# '))
            .map(l => {
                const trimmed = l.trim();
                const text = trimmed.replace(/^#+\s*/, '').trim();

                // Skip "Table of Contents" heading
                if (text.toLowerCase() === 'table of contents') return null;

                let number = '';
                if (trimmed.startsWith('# ')) {
                    if (isFirstH1) {
                        isFirstH1 = false;
                        // First H1 is unit title, no numbering
                    } else {
                        h1Counter++;
                        h2Counter = 0;
                        h3Counter = 0;
                        number = `${h1Counter}`;
                    }
                } else if (trimmed.startsWith('## ')) {
                    h2Counter++;
                    h3Counter = 0;
                    number = h1Counter > 0 ? `${h1Counter}.${h2Counter}` : `${h2Counter}`;
                } else if (trimmed.startsWith('### ')) {
                    h3Counter++;
                    const prefix = h1Counter > 0 ? `${h1Counter}.${h2Counter}` : `${h2Counter}`;
                    number = `${prefix}.${h3Counter}`;
                }

                const slug = text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
                const level = trimmed.startsWith('### ') ? 3 : (trimmed.startsWith('## ') ? 2 : 1);
                return { text, slug, level, number };
            })
            .filter(Boolean) as { text: string; slug: string; level: number; number: string }[];

        return (
            <div key={`notes-${selectedUnitIdx}`} className="space-y-6 animate-fade-in pb-20 relative">
                {/* Scroll Progress Bar - Ref-based for 60fps performance */}
                {createPortal(
                    <div className="absolute bottom-0 left-0 w-full h-[4px] z-[60] bg-transparent pointer-events-none overflow-hidden">
                        <div
                            ref={progressBarRef}
                            className="h-full bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 transition-transform duration-75 ease-out origin-left will-change-transform shadow-[0_2px_10px_rgba(249,115,22,0.8)]"
                            style={{ transform: 'scaleX(0)' }}
                        />
                    </div>,
                    document.getElementById('app-navbar') || document.body
                )}
                {/* Modern Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2">
                    <div className="space-y-3">
                        {/* Styled Breadcrumbs */}
                        <nav className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
                            <button onClick={onBack} className="text-slate-400 hover:text-orange-500 transition-colors bg-transparent border-none cursor-pointer">Nexus</button>
                            <span className="text-slate-300">/</span>
                            <button onClick={handleBackToCatalog} className="text-slate-400 hover:text-orange-500 transition-colors bg-transparent border-none cursor-pointer">Semester {activeSubjectData.semester}</button>
                            <span className="text-slate-300">/</span>
                            <button onClick={handleBackToUnits} className="text-orange-500 bg-transparent border-none cursor-pointer">{subjectCode}</button>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-900 dark:text-white">Unit {unitNum}</span>
                        </nav>

                        <button onClick={handleBackToUnits} className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all bg-transparent border-none cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                            </div>
                            <span>Return to Index</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => { setViewMode('quiz'); }}
                            className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-orange-600/20 hover:shadow-orange-600/30 transition-all cursor-pointer border-none scale-100 active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4" viewBox="0 0 16 16">
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94" />
                            </svg>
                            PRACTICE MCQ
                        </button>

                        <div className="flex items-center p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                            <button
                                disabled={selectedUnitIdx === 0}
                                onClick={() => { setSelectedUnitIdx(selectedUnitIdx - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-orange-600 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-all border-none bg-transparent cursor-pointer"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M15 18l-6-6 6-6" /></svg>
                            </button>
                            <div className="w-[1px] h-4 bg-slate-200 dark:bg-white/10 mx-1" />
                            <button
                                disabled={selectedUnitIdx === totalUnits - 1}
                                onClick={() => { setSelectedUnitIdx(selectedUnitIdx + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-orange-600 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-all border-none bg-transparent cursor-pointer"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M9 18l6-6-6-6" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Note content card */}
                <main className="relative overflow-hidden group">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative p-6 md:p-10 rounded-[32px] border border-slate-100 dark:border-white/5 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-xl shadow-2xl shadow-slate-200/50 dark:shadow-none">
                        {/* Title section */}
                        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-orange-600 tracking-[0.2em] uppercase">Academic Original</p>
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                    Unit {unitNum} <span className="text-slate-300 dark:text-white/20 mx-2">/</span> Notes
                                </h1>
                                <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-white/5 rounded-full">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                        <span>{subjectCode}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 opacity-60"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                        <span>{readTime} MIN READ</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {note.image && (
                            <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-100 dark:border-white/10 mb-8">
                                <img src={note.image} alt={note.title} className="w-full h-full object-cover" />
                            </div>
                        )}

                        {/* Table of Contents */}
                        {tocItems.length > 2 && (
                            <details className="mb-8 border border-slate-100 dark:border-white/5 rounded-xl overflow-hidden group" open>
                                <summary className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 cursor-pointer select-none text-sm font-semibold text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-400"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                                    Table of Contents
                                </summary>
                                <div className="p-4 max-h-60 overflow-y-auto space-y-1.5 border-t border-slate-100 dark:border-white/5">
                                    {tocItems.map((item, ti) => (
                                        <a
                                            key={ti}
                                            href={`#${item.slug}`}
                                            className={`block text-sm text-slate-500 dark:text-slate-400 hover:text-orange-600 transition-colors py-1 ${item.level === 2 ? 'ml-4' : item.level === 3 ? 'ml-8' : ''}`}
                                        >
                                            {item.number && `${item.number}. `}{item.text}
                                        </a>
                                    ))}
                                </div>
                            </details>
                        )}

                        {/* Note body */}
                        <div className="leading-relaxed">
                            {renderContent(note.body)}
                        </div>

                        {/* Footer */}
                        <div className="pt-6 mt-8 border-t border-slate-100 dark:border-white/5 flex justify-between items-center text-xs text-slate-400">
                            <span>End of Unit {unitNum}</span>
                            <button onClick={handleBackToUnits} className="text-orange-600 hover:underline border-none bg-transparent cursor-pointer text-xs">Back to Subject</button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // ===========================================
    // --- 4. QUIZ VIEW ---
    // ===========================================
    if (viewMode === 'quiz' && activeSubjectData && selectedUnitIdx !== null) {
        const note = activeSubjectData.content.notes[selectedUnitIdx];
        const unitNum = note.unit || selectedUnitIdx + 1;

        return (
            <div key={`quiz-${selectedUnitIdx}`} className="space-y-5 animate-fade-in pb-20">
                <div className="flex items-center justify-between">
                    <button onClick={handleBackToUnits} className="flex items-center gap-2 text-sm text-slate-500 hover:text-orange-600 transition-colors border-none bg-transparent cursor-pointer">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        Back to Subject
                    </button>
                    <button
                        onClick={() => handleOpenNotes(selectedUnitIdx)}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:border-orange-500 hover:text-orange-600 transition-all bg-white dark:bg-[#0a0a0a]/40 cursor-pointer"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                        </svg>
                        View Notes
                    </button>
                </div>
                <div className="text-center mb-2">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Unit {unitNum} – Practice MCQ</h2>
                </div>
                <UnitQuiz questions={unitQuizzes} unitNum={unitNum} />
            </div>
        );
    }

    // ===========================================
    // --- 5. FLASHCARDS VIEW ---
    // ===========================================
    if (viewMode === 'flashcards' && activeSubjectData && selectedUnitIdx !== null) {
        const note = activeSubjectData.content.notes[selectedUnitIdx];
        const unitNum = note.unit || selectedUnitIdx + 1;

        return (
            <div key={`flashcards-${selectedUnitIdx}`} className="space-y-5 animate-fade-in pb-20">
                <div className="flex items-center justify-between">
                    <button onClick={handleBackToUnits} className="flex items-center gap-2 text-sm text-slate-500 hover:text-orange-600 transition-colors border-none bg-transparent cursor-pointer">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        Back to Subject
                    </button>
                </div>
                <div className="text-center mb-2">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Unit {unitNum} – Flashcards</h2>
                </div>
                <div className="flex items-center justify-center">
                    <FlashcardStack cards={unitFlashcards} />
                </div>
            </div>
        );
    }

    return null;
};

// ==================== UNIT QUIZ COMPONENT ====================
const UnitQuiz: React.FC<{ questions: QuizQuestion[]; unitNum: number }> = ({ questions, unitNum }) => {
    const [currentQ, setCurrentQ] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    if (questions.length === 0) {
        return (
            <div className="p-10 rounded-2xl border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0a0a0a]/40 text-center">
                <p className="text-sm text-slate-400">No quiz questions available for this unit</p>
            </div>
        );
    }

    const handleAnswer = (idx: number) => {
        if (selectedAnswer !== null) return;
        setSelectedAnswer(idx);
        setShowExplanation(true);
        setAnswered(prev => prev + 1);
        if (idx === questions[currentQ].correctAnswer) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentQ < questions.length - 1) {
            setCurrentQ(prev => prev + 1);
            setSelectedAnswer(null);
            setShowExplanation(false);
        } else {
            setIsComplete(true);
        }
    };

    const handleRestart = () => {
        setCurrentQ(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setScore(0);
        setAnswered(0);
        setIsComplete(false);
    };

    if (isComplete) {
        const percentage = Math.round((score / questions.length) * 100);
        return (
            <div className="p-8 rounded-2xl border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0a0a0a]/40 text-center space-y-5 animate-fade-in">
                <div className="w-20 h-20 rounded-2xl bg-orange-600/10 flex items-center justify-center mx-auto">
                    <span className="text-3xl font-bold text-orange-600">{percentage}%</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Quiz Complete!</h3>
                    <p className="text-sm text-slate-500 mt-1">You scored {score} out of {questions.length}</p>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${percentage >= 70 ? 'bg-green-500' : percentage >= 40 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${percentage}%` }} />
                </div>
                <button onClick={handleRestart} className="px-8 py-3 bg-orange-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-orange-600/20 active:scale-95 transition-all border-none hover:shadow-xl cursor-pointer">
                    Retry Quiz
                </button>
            </div>
        );
    }

    const q = questions[currentQ];

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Progress */}
            <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Question {currentQ + 1} of {questions.length}</span>
                <span>Score: {score}/{answered}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-orange-600 rounded-full transition-all duration-500" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
            </div>

            {/* Question */}
            <div className="p-6 rounded-2xl border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0a0a0a]/40 space-y-4">
                <p className="text-base font-light text-slate-800 dark:text-white leading-relaxed">Q) {parseLine(q.question)}</p>

                <div className="space-y-2.5">
                    {q.options.map((option, idx) => {
                        let optionStyle = 'border-slate-100 dark:border-white/5 bg-white dark:bg-[#0a0a0a]/40 hover:border-orange-500/50 text-slate-600 dark:text-slate-300';
                        if (selectedAnswer !== null) {
                            if (idx === q.correctAnswer) {
                                optionStyle = 'border-green-500 bg-green-50 dark:bg-green-600/10 text-green-700 dark:text-green-400';
                            } else if (idx === selectedAnswer && idx !== q.correctAnswer) {
                                optionStyle = 'border-red-500 bg-red-50 dark:bg-red-600/10 text-red-700 dark:text-red-400';
                            } else {
                                optionStyle = 'border-slate-100 dark:border-white/5 bg-white dark:bg-[#0a0a0a]/20 text-slate-400 opacity-50';
                            }
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                disabled={selectedAnswer !== null}
                                className={`w-full text-left p-4 rounded-xl border text-sm transition-all ${optionStyle} ${selectedAnswer === null ? 'active:scale-[0.98] cursor-pointer' : 'cursor-default'}`}
                            >
                                <span className="font-semibold mr-2 text-xs">{String.fromCharCode(65 + idx)}.</span>
                                {parseLine(option)}
                            </button>
                        );
                    })}
                </div>

                {showExplanation && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-600/20 rounded-xl animate-fade-in">
                        <p className="text-xs font-semibold text-blue-600 mb-1">Explanation</p>
                        <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">{parseLine(q.explanation)}</p>
                    </div>
                )}

                {selectedAnswer !== null && (
                    <button onClick={handleNext} className="w-full py-3 bg-orange-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-orange-600/20 active:scale-95 transition-all border-none hover:shadow-xl cursor-pointer">
                        {currentQ < questions.length - 1 ? 'Next Question →' : 'View Results'}
                    </button>
                )}
            </div>
        </div>
    );
};

// ==================== FLASHCARD STACK COMPONENT ====================
const FlashcardStack = ({ cards }: { cards: Flashcard[] }) => {
    const [idx, setIdx] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    if (cards.length === 0) {
        return (
            <div className="p-10 rounded-2xl border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0a0a0a]/40 text-center w-full">
                <p className="text-sm text-slate-400">No flashcards available for this unit</p>
            </div>
        );
    }

    const card = cards[idx];

    return (
        <div className="w-full max-w-sm space-y-5 py-4">
            <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative h-[360px] cursor-pointer group perspective-1000"
            >
                <div className={`relative w-full h-full transition-all duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 text-center rounded-2xl shadow-lg border border-slate-100 dark:border-white/10 bg-white dark:bg-[#0a0a0a]/60">
                        <p className="text-xs text-orange-600 mb-4 font-medium">Concept</p>
                        <h3 className="text-lg font-bold leading-tight text-slate-800 dark:text-white">{parseLine(card.front)}</h3>
                        <div className="absolute bottom-6 text-xs text-slate-400">Tap to reveal</div>
                    </div>
                    <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 text-center rounded-2xl shadow-lg bg-gradient-to-br from-orange-600 to-red-600 text-white border-none">
                        <p className="text-xs text-white/60 mb-4 font-medium">Answer</p>
                        <div className="text-sm leading-relaxed">{parseLine(card.back)}</div>
                        <div className="absolute bottom-6 text-xs text-white/50">Tap to hide</div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between px-2">
                <button
                    disabled={idx === 0}
                    onClick={() => { setIdx(idx - 1); setIsFlipped(false); }}
                    className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-orange-600 disabled:opacity-30 transition-all active:scale-90 border border-slate-100 dark:border-white/5"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <div className="text-xs text-slate-500">
                    {idx + 1} / {cards.length}
                </div>
                <button
                    disabled={idx === cards.length - 1}
                    onClick={() => { setIdx(idx + 1); setIsFlipped(false); }}
                    className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-orange-600 disabled:opacity-30 transition-all active:scale-90 border border-slate-100 dark:border-white/5"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M9 18l6-6-6-6" /></svg>
                </button>
            </div>
        </div>
    );
};

export default NexusOriginals;
