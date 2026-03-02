import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, NexusOriginal, Flashcard } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';
import { generateSubjectOriginals } from '../services/geminiService.ts';
import { extractTextFromPdf } from '../services/pdfUtils.ts';
import { showToast } from './Toast.tsx';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import QuizTaker from './QuizTaker.tsx';

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
    const [viewMode, setViewMode] = useState<'catalog' | 'unit-selection' | 'note-reader'>('catalog');
    const [activeTab, setActiveTab] = useState<'notes' | 'quiz' | 'flashcards'>('notes');
    const [selectedNoteIdx, setSelectedNoteIdx] = useState<number | null>(null);

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
                    setViewMode('unit-selection');
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
        setViewMode('unit-selection');
        setActiveTab('notes');
        setSelectedNoteIdx(null);
    };

    const handleUnitSelect = (idx: number) => {
        setSelectedNoteIdx(idx);
        setViewMode('note-reader');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBackToUnits = () => {
        setSelectedNoteIdx(null);
        setViewMode('unit-selection');
    };

    const handleBackToCatalog = () => {
        setActiveSubjectData(null);
        setViewMode('catalog');
        setSelectedNoteIdx(null);
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

    const parseLine = (text: string) => {
        // Updated regex to more accurately capture **bold** and $math$
        const parts = text.split(/(\*\*.*?\*\*|\$.*?\$)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="text-slate-900 dark:text-white font-black">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('$') && part.endsWith('$')) {
                const math = part.slice(1, -1);
                return <InlineMath key={i} math={math} />;
            }
            return part;
        });
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 bg-orange-600/10 rounded-full mb-4 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Nexus Content...</p>
        </div>
    );

    // 1. Catalog View
    if (viewMode === 'catalog') {
        return (
            <div className="space-y-8 animate-fade-in">
                <header className="flex items-center gap-6">
                    <button onClick={onBack} className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-orange-600 transition-all">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="space-y-0.5">
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Nexus Originals</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-600">Select a course to explore premium materials</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {allOriginals.map((subject) => (
                        <div
                            key={subject.id}
                            onClick={() => handleSubjectSelect(subject)}
                            className="group relative cursor-pointer glass-panel p-6 rounded-3xl border border-slate-100 dark:border-white/5 hover:border-orange-500/50 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl"
                        >
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="px-2.5 py-0.5 bg-orange-600 text-white text-[8px] font-black uppercase tracking-widest rounded-full">SEM {subject.semester}</span>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{subject.program}</span>
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-white leading-tight line-clamp-2">{subject.subject}</h3>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                                    <span className="text-[9px] font-black uppercase text-slate-500">{subject.content.notes.length} Modules</span>
                                    <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-orange-600 group-hover:text-white transition-all">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="glass-panel p-6 rounded-3xl border-dashed border-2 border-slate-200 dark:border-white/5 flex flex-col items-center justify-center text-center opacity-60">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">More Coming Soon</p>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Main Module Selection View
    if (viewMode === 'unit-selection' && activeSubjectData) {
        return (
            <div className="space-y-8 animate-fade-in">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <button onClick={handleBackToCatalog} className="w-10 h-10 bg-slate-100 dark:bg-[#0a0a0a] rounded-xl flex items-center justify-center text-slate-400 hover:text-orange-600 transition-all">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-orange-600">Nexus Catalog</span>
                                <span className="text-slate-300">/</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{activeSubjectData.ltp}</span>
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white leading-none mt-0.5">{activeSubjectData.subject}</h2>
                        </div>
                    </div>

                    <nav className="flex bg-slate-100 dark:bg-[#0a0a0a]/40 p-1 rounded-xl border border-slate-200 dark:border-white/5">
                        {(['notes', 'quiz', 'flashcards'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-800 text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </header>

                {activeTab === 'notes' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeSubjectData.content.notes.map((unit, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleUnitSelect(idx)}
                                className="group p-6 glass-panel rounded-3xl border border-slate-100 dark:border-white/5 hover:border-orange-500 text-left transition-all hover:scale-[1.02] flex flex-col gap-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 dark:bg-orange-600/10 px-2 py-0.5 rounded-full">Unit 0{unit.unit || idx + 1}</span>
                                    <div className="w-5 h-5 bg-slate-50 dark:bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3 text-slate-300 group-hover:text-white"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                    </div>
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-tight text-slate-700 dark:text-white group-hover:text-orange-600 transition-colors line-clamp-3">
                                    {unit.title.split(':').pop()?.trim()}
                                </h3>
                            </button>
                        ))}
                    </div>
                )}

                {activeTab === 'quiz' && (
                    <div className="glass-panel p-10 rounded-[40px] text-center space-y-6 max-w-2xl mx-auto">
                        <div className="w-16 h-16 bg-orange-600/10 rounded-2xl flex items-center justify-center mx-auto text-orange-600">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Subject Mastery Quiz</h3>
                            <p className="text-[11px] font-medium text-slate-500">Test your knowledge with {activeSubjectData.content.quizzes.length} premium questions.</p>
                        </div>
                        <button className="px-10 py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-600/20 active:scale-95 transition-all">Start Practice</button>
                    </div>
                )}

                {activeTab === 'flashcards' && (
                    <div className="flex items-center justify-center">
                        <FlashcardStack cards={activeSubjectData.content.flashcards} />
                    </div>
                )}
            </div>
        );
    }

    // 3. Note Reader View
    // 3. Note Reader View
    const renderContent = (body: string) => {
        const lines = body.split('\n');
        let currentBlockMath = '';
        let isBlockMath = false;

        return lines.map((line, i) => {
            const trimmedLine = line.trim();
            if (!trimmedLine && !isBlockMath) return <div key={i} className="h-4" />;

            // Block Math $$. . . $$
            if (trimmedLine.startsWith('$$')) {
                if (isBlockMath) {
                    isBlockMath = false;
                    const math = currentBlockMath;
                    currentBlockMath = '';
                    return (
                        <div key={i} className="equation-box my-10 p-10 bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-100 dark:border-white/5 rounded-[32px] shadow-sm flex items-center justify-center overflow-x-auto text-lg md:text-xl">
                            <BlockMath math={math} />
                        </div>
                    );
                } else {
                    isBlockMath = true;
                    // Check if closing $$ is on the same line
                    if (trimmedLine.length > 2 && trimmedLine.endsWith('$$')) {
                        isBlockMath = false;
                        return (
                            <div key={i} className="equation-box my-10 p-10 bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-100 dark:border-white/5 rounded-[32px] shadow-sm flex items-center justify-center overflow-x-auto text-lg md:text-xl">
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

            // Generate IDs for headings to support TOC anchors
            const getSlug = (text: string) => text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');

            if (trimmedLine.startsWith('# ')) {
                const text = trimmedLine.replace('# ', '').trim();
                return <h1 key={i} id={getSlug(text)} className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-20 mb-10 pt-10 border-t border-slate-100 dark:border-white/5 scroll-mt-24">{parseLine(text)}</h1>;
            }
            if (trimmedLine.startsWith('## ')) {
                const text = trimmedLine.replace('## ', '').trim();
                return <h2 key={i} id={getSlug(text)} className="text-xl md:text-3xl font-black uppercase tracking-tight text-slate-800 dark:text-white mt-14 mb-8 scroll-mt-24">{parseLine(text)}</h2>;
            }
            if (trimmedLine.startsWith('### ')) {
                const text = trimmedLine.replace('### ', '').trim();
                return <h3 key={i} id={getSlug(text)} className="text-lg md:text-xl font-black uppercase tracking-tight text-orange-600 mt-10 mb-6 scroll-mt-24">{parseLine(text)}</h3>;
            }

            if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
                const content = trimmedLine.substring(2).trim();
                // Special check for TOC links or definition style
                const tocMatch = content.match(/^\[(.*)\]\((#.*)\)$/);
                if (tocMatch) {
                    return (
                        <div key={i} className="flex gap-4 mb-3 ml-4">
                            <span className="text-orange-600 font-bold mt-2.5 text-[10px]">→</span>
                            <a href={tocMatch[2]} className="text-orange-600 font-black tracking-tight hover:underline transition-all decoration-2 underline-offset-4 decoration-orange-600/30">
                                {tocMatch[1]}
                            </a>
                        </div>
                    );
                }

                // Special keywords: Statement, Formula, Example, Explanation
                if (content.startsWith('**') && content.includes(':**')) {
                    const [keyword, ...rest] = content.split(':**');
                    const cleanKeyword = keyword.replace('**', '').trim();
                    const badgeColors: Record<string, string> = {
                        'Definition': 'bg-orange-50 dark:bg-orange-600/10 text-orange-600',
                        'Statement': 'bg-blue-50 dark:bg-blue-600/10 text-blue-600',
                        'Formula': 'bg-purple-50 dark:bg-purple-600/10 text-purple-600',
                        'Example': 'bg-green-50 dark:bg-green-600/10 text-green-600',
                        'Explanation': 'bg-slate-50 dark:bg-white/10 text-slate-600'
                    };
                    const colorClass = badgeColors[cleanKeyword] || 'bg-slate-50 dark:bg-white/10 text-slate-600';

                    return (
                        <div key={i} className="flex gap-4 mb-6 ml-2">
                            <span className="text-orange-600 font-bold mt-2 text-[8px] opacity-30">●</span>
                            <div className="flex-1 text-slate-700 dark:text-slate-300">
                                <span className={`${colorClass} px-2 py-0.5 rounded-md font-black uppercase tracking-tighter text-[9px] mr-2`}>{cleanKeyword}</span>
                                <strong className="text-slate-900 dark:text-white font-black mr-2">{cleanKeyword === 'Definition' ? '' : ''}</strong>
                                {parseLine(rest.join(':**'))}
                            </div>
                        </div>
                    );
                }

                return (
                    <div key={i} className="flex gap-4 mb-4 ml-2">
                        <span className="text-orange-600 font-bold mt-2 text-[8px] opacity-70">●</span>
                        <div className="flex-1 text-slate-700 dark:text-slate-300">{parseLine(content)}</div>
                    </div>
                );
            }
            if (trimmedLine.startsWith('> ')) {
                const text = trimmedLine.replace('> ', '');
                return (
                    <div key={i} className="p-8 md:p-10 bg-orange-600/5 dark:bg-orange-600/10 border-l-[6px] border-orange-600 rounded-[32px] italic my-12 text-orange-600 dark:text-orange-400 font-bold leading-relaxed shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                        </div>
                        {parseLine(text)}
                    </div>
                );
            }

            // Standalone TOC links
            if (trimmedLine.match(/^\[.*\]\(#.*\)$/)) {
                const match = trimmedLine.match(/^\[(.*)\]\((#.*)\)$/);
                if (match) {
                    return (
                        <a key={i} href={match[2]} className="block text-orange-600 font-black tracking-tight hover:underline mb-4 transition-all flex items-center gap-3 group decoration-2 underline-offset-4">
                            <div className="w-2 h-2 rounded-full border-2 border-orange-600 transition-all group-hover:bg-orange-600" />
                            {match[1]}
                        </a>
                    );
                }
            }

            return <p key={i} className="mb-6 text-slate-700 dark:text-slate-300 antialiased">{parseLine(line)}</p>;
        });
    };

    if (viewMode === 'note-reader' && activeSubjectData && selectedNoteIdx !== null) {
        const note = activeSubjectData.content.notes[selectedNoteIdx];
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-slide-up pb-20">
                <header className="flex items-center justify-between sticky top-0 py-4 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md z-30">
                    <div className="flex items-center gap-4">
                        <button onClick={handleBackToUnits} className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-orange-600 transition-all">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        </button>
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-orange-600">Unit 0{note.unit || selectedNoteIdx + 1}</p>
                            <h2 className="text-base md:text-lg font-black uppercase tracking-tight text-slate-800 dark:text-white line-clamp-1">{activeSubjectData.subject}</h2>
                        </div>
                    </div>
                    {userProfile?.is_admin && (
                        <button onClick={handleGenerate} className="p-2 text-slate-300 hover:text-orange-600 transition-colors">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
                        </button>
                    )}
                </header>

                <main className="glass-panel p-6 md:p-12 rounded-[40px] shadow-xl space-y-8 bg-white dark:bg-slate-900/50">
                    <div className="space-y-4">
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-tight">{note.title}</h1>
                        <div className="h-1.5 w-20 bg-orange-600 rounded-full" />
                    </div>

                    {note.image && (
                        <div className="w-full aspect-video rounded-[32px] overflow-hidden border border-slate-100 dark:border-white/10 shadow-lg">
                            <img src={note.image} alt={note.title} className="w-full h-full object-cover" />
                        </div>
                    )}

                    <div className="prose-content text-base md:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                        {renderContent(note.body)}
                    </div>

                    <footer className="pt-10 border-t border-slate-100 dark:border-white/5 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <span>End of Unit 0{note.unit || selectedNoteIdx + 1}</span>
                        <button onClick={handleBackToUnits} className="text-orange-600 hover:underline">Return to Modules</button>
                    </footer>
                </main>
            </div>
        );
    }

    return null;
};

const FlashcardStack = ({ cards }: { cards: Flashcard[] }) => {
    const [idx, setIdx] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const card = cards[idx];

    return (
        <div className="w-full max-w-sm space-y-6 py-6">
            <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative h-[400px] cursor-pointer group perspective-1000"
            >
                <div className={`relative w-full h-full transition-all duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    <div className="absolute inset-0 backface-hidden glass-panel flex flex-col items-center justify-center p-8 text-center rounded-[40px] shadow-lg border-slate-100 dark:border-white/10">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-orange-600 mb-6">Concept</p>
                        <h3 className="text-2xl font-black leading-tight text-slate-800 dark:text-white uppercase tracking-tight">{card.front}</h3>
                        <div className="absolute bottom-10 text-[7px] font-black uppercase text-slate-400 tracking-widest">Tap to reveal</div>
                    </div>
                    <div className="absolute inset-0 backface-hidden rotate-y-180 glass-panel flex flex-col items-center justify-center p-8 text-center rounded-[40px] shadow-lg bg-gradient-to-br from-orange-600 to-red-600 text-white border-none">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60 mb-6">Definition</p>
                        <p className="text-lg font-bold leading-relaxed">{card.back}</p>
                        <div className="absolute bottom-10 text-[7px] font-black uppercase text-white/50 tracking-widest">Tap to hide</div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between px-4">
                <button
                    disabled={idx === 0}
                    onClick={() => { setIdx(idx - 1); setIsFlipped(false); }}
                    className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-orange-600 disabled:opacity-30 transition-all active:scale-90"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {idx + 1} / {cards.length}
                </div>
                <button
                    disabled={idx === cards.length - 1}
                    onClick={() => { setIdx(idx + 1); setIsFlipped(false); }}
                    className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-orange-600 disabled:opacity-30 transition-all active:scale-90"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M9 18l6-6-6-6" /></svg>
                </button>
            </div>
        </div>
    );
};

export default NexusOriginals;
