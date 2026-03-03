import React, { useState, useEffect, useMemo } from 'react';
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

    // Parse inline formatting (bold + math)
    const parseLine = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*|\$.*?\$)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-bold text-slate-800 dark:text-white">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('$') && part.endsWith('$')) {
                const math = part.slice(1, -1);
                return <InlineMath key={i} math={math} />;
            }
            return part;
        });
    };

    // --- LOADING STATE ---
    if (loading) return (
        <div className="animate-fade-in">
            <div className="flex flex-col items-center justify-center py-24 animate-pulse">
                <div className="w-12 h-12 bg-orange-600/10 rounded-full mb-4 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-xs text-slate-400">Loading content...</p>
            </div>
        </div>
    );

    // ===========================================
    // --- 1. CATALOG VIEW ---
    // ===========================================
    if (viewMode === 'catalog') {
        return (
            <div className="space-y-6 animate-fade-in pb-20">
                <header className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 bg-slate-100 dark:bg-[#0a0a0a] rounded-xl flex items-center justify-center text-slate-400 hover:text-orange-600 transition-all border-none flex-shrink-0">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight leading-none">
                        Nexus <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Originals</span>
                    </h2>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allOriginals.map((subject) => (
                        <div
                            key={subject.id}
                            onClick={() => handleSubjectSelect(subject)}
                            className="group relative cursor-pointer p-6 rounded-2xl border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0a0a0a]/40 hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg active:scale-[0.98]"
                        >
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="px-2.5 py-1 bg-orange-600 text-white text-[10px] font-semibold rounded-full">Sem {subject.semester}</span>
                                    <span className="text-xs text-slate-400">{subject.program}</span>
                                </div>
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-tight line-clamp-2">{subject.subject}</h3>
                                <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
                                    <span className="text-[9px] font-semibold text-slate-500">{subject.content.notes.length} Units</span>
                                    <span className="text-[9px] text-slate-300">•</span>
                                    <span className="text-[9px] font-semibold text-slate-500">{subject.content.quizzes.length} Qs</span>
                                    <span className="text-[9px] text-slate-300">•</span>
                                    <span className="text-[9px] font-semibold text-slate-500">{subject.content.flashcards.length} Cards</span>
                                    <div className="ml-auto w-7 h-7 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-orange-600 group-hover:text-white transition-all">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
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
            <div className="space-y-6 animate-fade-in pb-20">
                <header className="space-y-3">
                    <button onClick={handleBackToCatalog} className="flex items-center gap-2 text-sm text-slate-500 hover:text-orange-600 transition-colors border-none bg-transparent cursor-pointer group">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        <span>Back to courses</span>
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{activeSubjectData.subject}</h2>
                        <p className="text-xs text-slate-400 mt-1">{activeSubjectData.ltp} • Sem {activeSubjectData.semester}</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeSubjectData.content.notes.map((unit, idx) => {
                        const unitNum = unit.unit || idx + 1;
                        const unitQuizCount = activeSubjectData.content.quizzes.filter(q => q.unit === unitNum).length;

                        return (
                            <div
                                key={idx}
                                className="group p-5 rounded-2xl border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0a0a0a]/40 hover:border-orange-500/30 transition-all hover:shadow-md flex flex-col gap-4"
                            >
                                <div className="flex-1">
                                    <span className="inline-block px-2.5 py-1 border border-orange-200 dark:border-orange-600/30 text-orange-600 text-[10px] font-semibold rounded-md mb-3">
                                        Unit {unitNum}
                                    </span>
                                    <h3 className="text-sm font-semibold text-slate-700 dark:text-white leading-snug line-clamp-2">
                                        {unit.title.split(':').pop()?.trim()}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-6 pt-3 border-t border-slate-50 dark:border-white/5">
                                    <button
                                        onClick={() => handleOpenNotes(idx)}
                                        className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-orange-600 transition-colors border-none bg-transparent cursor-pointer group/btn"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                                        </svg>
                                        <span className="text-[10px] font-semibold">Notes</span>
                                    </button>
                                    <button
                                        onClick={() => handleOpenQuiz(idx)}
                                        className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-orange-600 transition-colors border-none bg-transparent cursor-pointer group/btn"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                            <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                                        </svg>
                                        <span className="text-[10px] font-semibold">MCQ</span>
                                    </button>
                                    <button
                                        onClick={() => handleOpenFlashcards(idx)}
                                        className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-orange-600 transition-colors border-none bg-transparent cursor-pointer group/btn"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                            <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M12 4v16" />
                                        </svg>
                                        <span className="text-[10px] font-semibold">Flashcards</span>
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
                                    <th key={hi} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-white/5">{h.trim()}</th>
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

            // Headings - clean sentence case, no ALL CAPS
            if (trimmedLine.startsWith('# ')) {
                const text = trimmedLine.replace('# ', '').trim();
                return <h1 key={i} id={getSlug(text)} className="text-xl font-bold text-slate-900 dark:text-white mt-10 mb-4 pt-6 border-t border-slate-100 dark:border-white/5 scroll-mt-20">{parseLine(text)}</h1>;
            }
            if (trimmedLine.startsWith('## ')) {
                const text = trimmedLine.replace('## ', '').trim();
                return <h2 key={i} id={getSlug(text)} className="text-lg font-bold text-slate-800 dark:text-white mt-8 mb-3 scroll-mt-20">{parseLine(text)}</h2>;
            }
            if (trimmedLine.startsWith('### ')) {
                const text = trimmedLine.replace('### ', '').trim();
                return <h3 key={i} id={getSlug(text)} className="text-base font-semibold text-slate-700 dark:text-slate-200 mt-6 mb-2 scroll-mt-20">{parseLine(text)}</h3>;
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
        const tocItems = note.body.split('\n')
            .filter(l => l.trim().startsWith('## ') || l.trim().startsWith('# '))
            .map(l => {
                const text = l.trim().replace(/^#+\s*/, '');
                const slug = text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
                const level = l.trim().startsWith('## ') ? 2 : 1;
                return { text, slug, level };
            });

        return (
            <div className="space-y-5 animate-fade-in pb-20">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-xs text-slate-400">
                    <button onClick={onBack} className="hover:text-orange-600 transition-colors border-none bg-transparent cursor-pointer">Home</button>
                    <span>/</span>
                    <button onClick={handleBackToCatalog} className="hover:text-orange-600 transition-colors border-none bg-transparent cursor-pointer">Sem {activeSubjectData.semester}</button>
                    <span>/</span>
                    <button onClick={handleBackToUnits} className="hover:text-orange-600 transition-colors border-none bg-transparent cursor-pointer">{subjectCode}</button>
                    <span>/</span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Unit {unitNum}</span>
                </nav>

                {/* Top bar */}
                <div className="flex items-center justify-between">
                    <button onClick={handleBackToUnits} className="flex items-center gap-2 text-sm text-slate-500 hover:text-orange-600 transition-colors border-none bg-transparent cursor-pointer">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        Back to Subject
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { setViewMode('quiz'); }}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:border-orange-500 hover:text-orange-600 transition-all bg-white dark:bg-[#0a0a0a]/40 cursor-pointer"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            Practice MCQ
                        </button>
                        <button
                            disabled={selectedUnitIdx === 0}
                            onClick={() => { setSelectedUnitIdx(selectedUnitIdx - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="w-9 h-9 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-orange-600 disabled:opacity-30 transition-all bg-white dark:bg-[#0a0a0a]/40"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M15 18l-6-6 6-6" /></svg>
                        </button>
                        <button
                            disabled={selectedUnitIdx === totalUnits - 1}
                            onClick={() => { setSelectedUnitIdx(selectedUnitIdx + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="w-9 h-9 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-orange-600 disabled:opacity-30 transition-all bg-white dark:bg-[#0a0a0a]/40"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M9 18l6-6-6-6" /></svg>
                        </button>
                    </div>
                </div>

                {/* Note content card */}
                <main className="p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0a0a0a]/40">
                    {/* Title section */}
                    <div className="mb-8">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
                            Unit {unitNum} – Notes
                        </h1>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="text-orange-600 font-medium">{subjectCode}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                {readTime} min read
                            </span>
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
                                        className={`block text-sm text-slate-500 dark:text-slate-400 hover:text-orange-600 transition-colors py-1 ${item.level === 2 ? 'ml-4' : ''}`}
                                    >
                                        {item.text}
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
            <div className="space-y-5 animate-fade-in pb-20">
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
            <div className="space-y-5 animate-fade-in pb-20">
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
                <p className="text-base font-medium text-slate-800 dark:text-white leading-relaxed">{q.question}</p>

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
                                {option}
                            </button>
                        );
                    })}
                </div>

                {showExplanation && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-600/20 rounded-xl animate-fade-in">
                        <p className="text-xs font-semibold text-blue-600 mb-1">Explanation</p>
                        <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">{q.explanation}</p>
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
                        <h3 className="text-lg font-bold leading-tight text-slate-800 dark:text-white">{card.front}</h3>
                        <div className="absolute bottom-6 text-xs text-slate-400">Tap to reveal</div>
                    </div>
                    <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 text-center rounded-2xl shadow-lg bg-gradient-to-br from-orange-600 to-red-600 text-white border-none">
                        <p className="text-xs text-white/60 mb-4 font-medium">Answer</p>
                        <p className="text-sm leading-relaxed">{card.back}</p>
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
