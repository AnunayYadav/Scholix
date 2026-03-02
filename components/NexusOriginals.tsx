import React, { useState, useEffect } from 'react';
import { UserProfile, NexusOriginal, Flashcard } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';
import { generateSubjectOriginals } from '../services/geminiService.ts';
import { extractTextFromPdf } from '../services/pdfUtils.ts';
import { showToast } from './Toast.tsx';

interface NexusOriginalsProps {
    userProfile: UserProfile | null;
    activeSubject: string;
    activeSemester: string;
    activeProgram: string;
    onBack: () => void;
}

const NexusOriginals: React.FC<NexusOriginalsProps> = ({
    userProfile,
    activeSubject,
    activeSemester,
    activeProgram,
    onBack
}) => {
    const [data, setData] = useState<NexusOriginal | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<'notes' | 'quiz' | 'flashcards'>('notes');
    const [activeNoteIdx, setActiveNoteIdx] = useState(0);

    useEffect(() => {
        loadOriginals();
    }, [activeSubject, activeSemester, activeProgram]);

    const loadOriginals = async () => {
        setLoading(true);
        try {
            // Dynamic import to keep bundle size small
            const { nexusOriginalsData } = await import('../data/nexusOriginalsData.ts');

            const localResult = nexusOriginalsData.find(d => {
                const normActiveSub = activeSubject.toLowerCase();
                const normDataSub = d.subject.toLowerCase();
                const subjectMatch = normDataSub.includes(normActiveSub) ||
                    normActiveSub.includes(normDataSub.split(':')[0].toLowerCase().trim());

                const normActiveSem = activeSemester.toLowerCase().replace('semester', '').trim();
                const normDataSem = d.semester.toString().toLowerCase().replace('semester', '').trim();
                const semMatch = normActiveSem === normDataSem;

                const normActiveProg = activeProgram.toLowerCase().replace(/\s+/g, '').replace('.', '');
                const normDataProg = d.program.toString().toLowerCase().replace(/\s+/g, '').replace('.', '');
                const programMatch = normActiveProg.includes(normDataProg) || normDataProg.includes(normActiveProg);

                return subjectMatch && semMatch && programMatch;
            });

            if (localResult) {
                setData(localResult);
            } else {
                // Fallback to Supabase
                const result = await NexusServer.fetchNexusOriginal(activeSubject, activeSemester, activeProgram);
                setData(result);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!userProfile?.is_admin) return;
        setGenerating(true);
        try {
            const allFiles = await NexusServer.fetchFiles(activeProgram);
            const syllabusFile = allFiles.find(f =>
                f.subject.toLowerCase().includes(activeSubject.toLowerCase()) &&
                (f.name.toLowerCase().includes('syllabus') || f.type.toLowerCase().includes('syllabus'))
            );

            let syllabusText = "General academic context for " + activeSubject;
            if (syllabusFile) {
                const url = await NexusServer.getFileUrl(syllabusFile.storage_path);
                const res = await fetch(url);
                const blob = await res.blob();
                syllabusText = await extractTextFromPdf(new File([blob], "syllabus.pdf"));
            }

            const generated = await generateSubjectOriginals(activeSubject, syllabusText);
            await NexusServer.upsertNexusOriginal(activeSubject, activeSemester, activeProgram, generated);

            showToast("Nexus Originals generated successfully!", "success");
            loadOriginals();
        } catch (e: any) {
            showToast("Generation failed: " + e.message, "error");
        } finally {
            setGenerating(false);
        }
    };

    const parseLine = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*|\$.*?\$)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="text-slate-900 dark:text-white font-black">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('$') && part.endsWith('$')) {
                return <code key={i} className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-orange-600 font-mono font-bold text-xs">{part.slice(1, -1)}</code>;
            }
            return part;
        });
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 bg-orange-600/10 rounded-full mb-4 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Nexus Originals...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 bg-slate-100 dark:bg-black rounded-xl flex items-center justify-center text-slate-400 hover:text-orange-600 transition-all border-none shadow-sm"
                        title="Back to Library"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-600/20">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-orange-600">Nexus Original</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
                            {data?.ltp && <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-l border-slate-200 dark:border-white/10 pl-2 ml-1">{data.ltp}</span>}
                            {data?.credits && <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-l border-slate-200 dark:border-white/10 pl-2 ml-1">Credits: {data.credits}</span>}
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-white leading-none mt-1">
                            {activeSubject === 'Search Subject' ? 'Select a Subject' : activeSubject}
                        </h2>
                    </div>
                </div>

                {data && (
                    <nav className="flex bg-slate-100 dark:bg-black/40 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5">
                        {(['notes', 'quiz', 'flashcards'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-800 text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                )}
            </header>

            {!data ? (
                <div className="py-20 text-center space-y-6 glass-panel rounded-[40px] border-dashed border-2 border-slate-200 dark:border-white/5 animate-scale-in">
                    <div className="w-16 h-16 bg-orange-600/10 rounded-3xl flex items-center justify-center mx-auto text-orange-600 mb-4">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    </div>
                    <div className="max-w-xs mx-auto">
                        <h3 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-white">Content Unavailable</h3>
                        <p className="text-xs font-medium text-slate-500 mt-2">
                            {activeSubject === 'Search Subject'
                                ? 'Please select a specific subject from the library to view original notes.'
                                : 'Premium AI-generated content is not yet available for this subject.'}
                        </p>
                    </div>
                    {userProfile?.is_admin && activeSubject !== 'Search Subject' && (
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="px-8 py-3 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50"
                        >
                            {generating ? 'Generating Content...' : 'Generate Nexus Originals'}
                        </button>
                    )}
                </div>
            ) : (
                <div className="min-h-[500px]">
                    {activeTab === 'notes' && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                            <div className="md:col-span-4 space-y-4">
                                <div className="px-6 py-2">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Table of Contents</h4>
                                </div>
                                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {data.content.notes.map((note, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setActiveNoteIdx(idx);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className={`w-full p-6 rounded-3xl border text-left transition-all ${activeNoteIdx === idx ? 'bg-orange-600 border-orange-500 text-white shadow-xl scale-[1.02]' : 'bg-white dark:bg-black/40 border-slate-100 dark:border-white/5 text-slate-500 hover:border-orange-500/30'}`}
                                        >
                                            <p className="text-[8px] font-black uppercase tracking-widest mb-1 opacity-60">Chapter 0{idx + 1}</p>
                                            <p className="text-sm font-black uppercase tracking-tight">{note.title}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="md:col-span-8 glass-panel p-6 md:p-12 rounded-[48px] shadow-2xl space-y-8 animate-slide-up">
                                <div className="space-y-2">
                                    <div className="text-[9px] font-black uppercase tracking-widest text-orange-600">Chapter 0{activeNoteIdx + 1}</div>
                                    <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-tight">{data.content.notes[activeNoteIdx].title}</h3>
                                </div>

                                <div className="prose-container border-t border-slate-100 dark:border-white/5 pt-8 space-y-6">
                                    {data.content.notes[activeNoteIdx].image && (
                                        <div className="w-full aspect-video rounded-[40px] overflow-hidden mb-10 border border-white/10 shadow-2xl group">
                                            <img
                                                src={data.content.notes[activeNoteIdx].image}
                                                alt={data.content.notes[activeNoteIdx].title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        </div>
                                    )}
                                    <div className="text-base md:text-lg font-medium leading-relaxed dark:text-slate-300 space-y-4">
                                        {data.content.notes[activeNoteIdx].body.split('\n').map((line, i) => {
                                            const trimmedLine = line.trim();
                                            if (!trimmedLine) return <div key={i} className="h-4" />;

                                            if (trimmedLine.startsWith('# ')) return <h1 key={i} className="text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-12 mb-6">{trimmedLine.replace('# ', '')}</h1>;
                                            if (trimmedLine.startsWith('## ')) return <h2 key={i} className="text-2xl font-black uppercase tracking-tight text-slate-800 dark:text-white mt-10 mb-5">{trimmedLine.replace('## ', '')}</h2>;
                                            if (trimmedLine.startsWith('### ')) return <h3 key={i} className="text-xl font-black uppercase tracking-tight text-orange-600 mt-8 mb-4">{trimmedLine.replace('### ', '')}</h3>;
                                            if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) return (
                                                <div key={i} className="flex gap-4 mb-4 ml-4">
                                                    <span className="text-orange-600 font-bold mt-1">●</span>
                                                    <span className="flex-1">{parseLine(trimmedLine.substring(2))}</span>
                                                </div>
                                            );
                                            if (trimmedLine.startsWith('> ')) return (
                                                <div key={i} className="p-8 bg-orange-600/5 border-l-8 border-orange-600 rounded-2xl italic my-10 text-orange-600 text-lg md:text-xl font-bold">
                                                    {parseLine(trimmedLine.replace('> ', ''))}
                                                </div>
                                            );
                                            return <p key={i} className="mb-4">{parseLine(line)}</p>;
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'quiz' && (
                        <div className="glass-panel p-12 rounded-[56px] shadow-2xl text-center space-y-8 animate-scale-in">
                            <div className="w-20 h-20 bg-orange-600/10 rounded-[32px] flex items-center justify-center mx-auto text-orange-600 mb-4">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-10 h-10"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                            </div>
                            <div className="max-w-md mx-auto space-y-4">
                                <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Original Quiz Hub</h3>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed">Test your mastery with AI-generated questions specific to your syllabus. {data.content.quizzes.length} high-impact questions curated for this subject.</p>
                            </div>
                            <button className="px-12 py-5 bg-orange-600 text-white rounded-[40px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-orange-600/30 hover:scale-105 active:scale-95 transition-all border-none">
                                Start Practice Session
                            </button>
                        </div>
                    )}

                    {activeTab === 'flashcards' && (
                        <div className="flex items-center justify-center py-12 animate-scale-in">
                            <FlashcardStack cards={data.content.flashcards} />
                        </div>
                    )}
                </div>
            )}

            {userProfile?.is_admin && (
                <footer className="pt-12 border-t border-slate-100 dark:border-white/5 flex justify-end">
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="flex items-center gap-3 px-6 py-3 bg-slate-100 dark:bg-black/60 text-slate-400 hover:text-orange-600 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all border-none"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`}><path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
                        {generating ? 'Re-Generating...' : 'Regenerate Content'}
                    </button>
                </footer>
            )}
        </div>
    );
};

const FlashcardStack = ({ cards }: { cards: Flashcard[] }) => {
    const [idx, setIdx] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const card = cards[idx];

    return (
        <div className="w-full max-w-sm space-y-8">
            <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative h-[450px] cursor-pointer group perspective-1000"
            >
                <div className={`relative w-full h-full transition-all duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    <div className="absolute inset-0 backface-hidden glass-panel flex flex-col items-center justify-center p-12 text-center rounded-[56px] shadow-2xl border-orange-500/20">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-600 mb-8">Concept</p>
                        <h3 className="text-3xl font-black leading-tight text-slate-900 dark:text-white uppercase tracking-tight">{card.front}</h3>
                        <div className="absolute bottom-12 text-[8px] font-black uppercase text-slate-400 tracking-widest animate-bounce">Tap to reveal</div>
                    </div>
                    <div className="absolute inset-0 backface-hidden rotate-y-180 glass-panel flex flex-col items-center justify-center p-12 text-center rounded-[56px] shadow-2xl bg-gradient-to-br from-orange-600 to-red-600 text-white border-none">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-8">Definition</p>
                        <p className="text-xl font-bold leading-relaxed">{card.back}</p>
                        <div className="absolute bottom-12 text-[8px] font-black uppercase text-white/50 tracking-widest">Tap to hide</div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between px-6">
                <button
                    disabled={idx === 0}
                    onClick={() => { setIdx(idx - 1); setIsFlipped(false); }}
                    className="w-14 h-14 bg-white dark:bg-black/40 rounded-2xl flex items-center justify-center text-slate-400 hover:text-orange-600 disabled:opacity-30 border-none shadow-sm transition-all hover:scale-110 active:scale-90"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-black/40 px-4 py-2 rounded-full">
                    {idx + 1} / {cards.length}
                </div>
                <button
                    disabled={idx === cards.length - 1}
                    onClick={() => { setIdx(idx + 1); setIsFlipped(false); }}
                    className="w-14 h-14 bg-white dark:bg-black/40 rounded-2xl flex items-center justify-center text-slate-400 hover:text-orange-600 disabled:opacity-30 border-none shadow-sm transition-all hover:scale-110 active:scale-90"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6"><path d="M9 18l6-6-6-6" /></svg>
                </button>
            </div>
        </div>
    );
};

export default NexusOriginals;
