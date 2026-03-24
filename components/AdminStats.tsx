import React, { useState, useEffect } from 'react';
import NexusServer from '../services/nexusServer';
import { UserProfile, QuizQuestion } from '../types';

interface AdminStatsProps {
    userProfile: UserProfile | null;
}

const GlobalBroadcaster: React.FC = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
    const [link, setLink] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState<{ msg: string; error: boolean } | null>(null);

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) return;

        setIsSending(true);
        setStatus(null);
        try {
            await NexusServer.sendGlobalAnnouncement(title, message, type, link || undefined);
            setStatus({ msg: 'SIGNAL BROADCAST SUCCESSFUL', error: false });
            setTitle('');
            setMessage('');
            setLink('');
        } catch (err) {
            setStatus({ msg: 'BROADCAST FAILED', error: true });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl rounded-[32px] border border-slate-200 dark:border-white/10 p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 bg-orange-600/5 blur-3xl rounded-full -mr-10 -mt-10" />

            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-xl shadow-orange-600/20">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Announcements</h3>
                    <p className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Send a notification to everyone</p>
                </div>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[11px] sm:text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Notification Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., NEW CONTENT ALERT"
                            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-orange-500/50 transition-all"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] sm:text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Notification Type</label>
                        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                            {(['info', 'success', 'warning', 'error'] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={`flex-1 py-2 rounded-xl text-[11px] sm:text-xs font-medium transition-all ${type === t
                                        ? 'bg-orange-600 text-white shadow-lg'
                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] sm:text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Message Content</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Detailed information for the user population..."
                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[24px] px-5 py-4 text-sm font-medium focus:outline-none focus:border-orange-500/50 transition-all min-h-[100px] resize-none"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[11px] sm:text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Target Link (Optional)</label>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            placeholder="/library, /marketplace, etc."
                            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3 text-sm font-mono focus:outline-none focus:border-orange-500/50 transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSending || !title || !message}
                        className="w-full bg-orange-600 text-white font-black text-xs uppercase tracking-[0.2em] py-4 rounded-2xl shadow-xl shadow-orange-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                    >
                        {isSending ? 'SENDING...' : 'SEND NOTIFICATION'}
                    </button>
                </div>

                {status && (
                    <div className={`mt-4 p-4 rounded-2xl text-[11px] sm:text-xs font-medium text-center border ${status.error ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }`}>
                        {status.msg}
                    </div>
                )}
            </form>
        </div>
    );
};

const AdminStats: React.FC<AdminStatsProps> = ({ userProfile }) => {
    const [activeTab, setActiveTab] = useState<'stats' | 'reports' | 'questions' | 'feedback'>('stats');
    const [stats, setStats] = useState<{ pageStats: any[], eventStats: any[] } | null>(null);
    const [reports, setReports] = useState<any[]>([]);
    const [feedback, setFeedback] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Question State for Creator
    const [newQuestion, setNewQuestion] = useState({
        id: undefined as string | undefined,
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        difficulty: 'medium',
        type: 'mcq',
        subject: '',
        unit: '',
        topic: '',
        explanation: ''
    });

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await NexusServer.getDetailedStats();
                setStats(data);
            } catch (err) {
                console.error("Failed to load stats:", err);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    useEffect(() => {
        if (activeTab === 'reports') loadReports();
        if (activeTab === 'feedback') loadFeedback();
    }, [activeTab]);

    const loadReports = async () => {
        setLoading(true);
        try {
            const data = await NexusServer.fetchQuestionReports();
            setReports(data);
        } catch (err) {
            console.error("Failed to load reports:", err);
        } finally {
            setLoading(false);
        }
    };

    const loadFeedback = async () => {
        setLoading(true);
        try {
            const data = await NexusServer.fetchFeedback();
            setFeedback(data);
        } catch (err) {
            console.error("Failed to load feedback:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (newQuestion.id) {
                await NexusServer.updateQuestion(newQuestion as any);
                alert("QUESTION UPDATED IN BANK");
            } else {
                await NexusServer.createQuestion(newQuestion);
                alert("NEW QUESTION ADDED TO BANK");
            }
            setNewQuestion({
                id: undefined,
                question: '',
                options: ['', '', '', ''],
                correctAnswer: 0,
                difficulty: 'medium',
                type: 'mcq',
                subject: '',
                unit: '',
                topic: '',
                explanation: ''
            });
        } catch (err) {
            console.error("Failed to manage question:", err);
            alert("Error: " + (err as any).message);
        } finally {
            setIsSaving(false);
        }
    };

    const resolveReport = async (reportId: string, status: string) => {
        setActionLoading(reportId);
        try {
            await NexusServer.updateReportStatus(reportId, status);
            setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
        } catch (err) {
            console.error("Failed to update status:", err);
        } finally {
            setActionLoading(null);
        }
    };

    const editReportedQuestion = (report: any) => {
        const q = report.question;
        setNewQuestion({
            id: q.id,
            question: q.question,
            options: Array.isArray(q.options) ? q.options : ['', '', '', ''],
            correctAnswer: q.correct_answer ?? 0,
            difficulty: q.difficulty || 'medium',
            type: q.type || 'mcq',
            subject: q.subject || report.subject || '',
            unit: q.unit || '',
            topic: q.topic || '',
            explanation: q.explanation || ''
        } as any);
        setActiveTab('questions');
    };

    if (!userProfile?.is_admin) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center p-8 bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10">
                    <h2 className="text-2xl font-black text-red-500 mb-4">ACCESS DENIED</h2>
                    <p className="text-slate-400">This terminal is restricted to Nexus Administrators only.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">Nexus Intelligence</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">System diagnostics and administrative controls.</p>
                </div>
                
                {/* Custom Tabs */}
                <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                    {[
                        { id: 'stats', label: 'Stats' },
                        { id: 'reports', label: 'Reports' },
                        { id: 'questions', label: 'Question Tool' },
                        { id: 'feedback', label: 'Feedback' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? 'bg-orange-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">
                  <div className="inline-block w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Accessing Secure Records...</p>
                </div>
            ) : (
                <>
                    {activeTab === 'stats' && (
                        <>
                            <GlobalBroadcaster />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Page Views Table */}
                                <div className="bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl rounded-[32px] border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl">
                                    <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                                        <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">Page Performance</h3>
                                        <span className="text-[11px] sm:text-xs font-bold px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full border border-orange-500/20 uppercase">By Views</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50/50 dark:bg-white/[0.01]">
                                                    <th className="px-6 py-4 text-[11px] sm:text-xs font-medium text-slate-400">Path</th>
                                                    <th className="px-6 py-4 text-[11px] sm:text-xs font-medium text-slate-400">Visitors</th>
                                                    <th className="px-6 py-4 text-[11px] sm:text-xs font-medium text-slate-400 text-right">Page Views</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                                {stats?.pageStats.map((stat) => (
                                                    <tr key={stat.path} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                        <td className="px-6 py-4 font-mono text-xs text-orange-600 dark:text-orange-400">{stat.path}</td>
                                                        <td className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">{stat.visitors.toLocaleString()}</td>
                                                        <td className="px-6 py-4 font-black text-slate-900 dark:text-white text-right">{stat.views.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Event Stats Table */}
                                <div className="bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl rounded-[32px] border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl">
                                    <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                                        <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">Interaction Events</h3>
                                        <span className="text-[11px] sm:text-xs font-bold px-3 py-1 bg-red-500/10 text-red-500 rounded-full border border-red-500/20 uppercase">Live Pulse</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50/50 dark:bg-white/[0.01]">
                                                    <th className="px-6 py-4 text-[11px] sm:text-xs font-medium text-slate-400">Event Name</th>
                                                    <th className="px-6 py-4 text-[11px] sm:text-xs font-medium text-slate-400">Count</th>
                                                    <th className="px-6 py-4 text-[11px] sm:text-xs font-medium text-slate-400 text-right">Triggered</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                                {stats?.eventStats.map((stat) => (
                                                    <tr key={stat.event_name} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                        <td className="px-6 py-4 font-black text-slate-900 dark:text-white capitalize">{stat.event_name.replace(/_/g, ' ')}</td>
                                                        <td className="px-6 py-4 font-black text-2xl text-orange-600">{stat.count.toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-[11px] text-slate-500 dark:text-slate-400 text-right">
                                                            {new Date(stat.last_triggered).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'reports' && (
                        <div className="bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl rounded-[32px] border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-orange-500/5">
                                <div>
                                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">Question Reports</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Reviewing user flags and error tickets</p>
                                </div>
                                <button onClick={loadReports} className="p-2 rounded-xl bg-orange-600/10 text-orange-600 hover:bg-orange-600 hover:text-white transition-all">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 dark:bg-white/[0.01]">
                                            <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400">Reporter</th>
                                            <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400">Issue</th>
                                            <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400">Question Path</th>
                                            <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400">Status</th>
                                            <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {reports.map((report) => (
                                            <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-black text-slate-900 dark:text-white">{report.reporter?.username || 'GUEST'}</p>
                                                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">{new Date(report.created_at).toLocaleString()}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-block px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold border border-red-500/20 mb-2">
                                                        {report.reason}
                                                    </span>
                                                    <p className="text-xs text-slate-500 font-medium line-clamp-2">{report.question?.question}</p>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-[10px] text-orange-600 dark:text-orange-400 uppercase">
                                                    {report.subject || 'GENERAL'} <br />
                                                    UNIT {report.question?.unit || report.question?.topic}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${report.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
                                                        }`}>
                                                        {report.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        {report.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => editReportedQuestion(report)}
                                                                    className="px-3 py-1.5 rounded-lg bg-orange-600 text-white text-[10px] font-bold hover:scale-105 transition-all shadow-lg shadow-orange-600/20"
                                                                >
                                                                    Fix/Edit
                                                                </button>
                                                                <button
                                                                    disabled={actionLoading === report.id}
                                                                    onClick={() => resolveReport(report.id, 'resolved')}
                                                                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-bold hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                                                                >
                                                                    Resolve
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'feedback' && (
                        <div className="bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl rounded-[32px] border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl">
                             <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">System Feedback</h3>
                                <button onClick={loadFeedback} className="p-2 rounded-xl bg-orange-600/10 text-orange-600 hover:bg-orange-600 hover:text-white transition-all">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                </button>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-white/5">
                                {feedback.map(f => (
                                    <div key={f.id} className="p-6 hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center font-bold text-[10px]">
                                                    {f.user?.username?.[0].toUpperCase() || 'G'}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 dark:text-white">{f.user?.username || 'GUEST USER'}</p>
                                                    <p className="text-[10px] font-mono text-slate-400">{f.user_email || 'No email associated'}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-medium text-slate-400">{new Date(f.created_at).toLocaleString()}</span>
                                        </div>
                                        <div className="ml-11 bg-slate-100 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10">
                                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{f.text}</p>
                                        </div>
                                    </div>
                                ))}
                                {feedback.length === 0 && <p className="p-10 text-center text-slate-500 italic">No feedback received yet.</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'questions' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <form onSubmit={handleCreateQuestion} className="bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl rounded-[32px] border border-slate-200 dark:border-white/10 p-8 shadow-2xl space-y-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-lg">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M12 5v14M5 12h14" /></svg>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                                    {newQuestion.id ? 'Refine Logic Node' : 'New Question Constructor'}
                                                </h3>
                                                {newQuestion.id && <p className="text-[10px] font-bold text-orange-600 uppercase">Managing ID: {newQuestion.id}</p>}
                                            </div>
                                        </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input 
                                                type="text" 
                                                placeholder="Subject (e.g., CSE121)" 
                                                className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold w-full"
                                                value={newQuestion.subject}
                                                onChange={e => setNewQuestion({...newQuestion, subject: e.target.value})}
                                                required
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="Unit (e.g., 1)" 
                                                className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold w-full"
                                                value={newQuestion.unit}
                                                onChange={e => setNewQuestion({...newQuestion, unit: e.target.value})}
                                                required
                                            />
                                        </div>
                                        
                                        <textarea 
                                            placeholder="Question Content..." 
                                            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-medium h-24 resize-none"
                                            value={newQuestion.question}
                                            onChange={e => setNewQuestion({...newQuestion, question: e.target.value})}
                                            required
                                        />

                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Options (Mark dot for correct)</p>
                                            {newQuestion.options.map((opt, idx) => (
                                                <div key={idx} className="flex gap-3 items-center">
                                                    <input 
                                                        type="radio" 
                                                        name="correct-ans" 
                                                        checked={newQuestion.correctAnswer === idx}
                                                        onChange={() => setNewQuestion({...newQuestion, correctAnswer: idx})}
                                                        className="w-4 h-4 accent-orange-600"
                                                    />
                                                    <input 
                                                        type="text" 
                                                        placeholder={`Option ${idx + 1}`} 
                                                        className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium"
                                                        value={opt}
                                                        onChange={e => {
                                                            const newOpts = [...newQuestion.options];
                                                            newOpts[idx] = e.target.value;
                                                            setNewQuestion({...newQuestion, options: newOpts});
                                                        }}
                                                        required
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <textarea 
                                            placeholder="Explanation (Optional)" 
                                            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3 text-[11px] font-medium h-20 resize-none opacity-80"
                                            value={newQuestion.explanation}
                                            onChange={e => setNewQuestion({...newQuestion, explanation: e.target.value})}
                                        />

                                        <button 
                                            type="submit" 
                                            disabled={isSaving}
                                            className="w-full bg-slate-950 dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-widest py-4 rounded-2xl shadow-xl transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {isSaving ? 'INJECTING...' : 'PERSIST TO BANK'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="bg-orange-600 p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden">
                                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="absolute -bottom-10 -right-10 w-48 h-48 opacity-20"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                                     <h4 className="text-xl font-black uppercase tracking-tighter relative z-10">Protocols</h4>
                                     <ul className="mt-4 space-y-4 text-xs font-bold text-orange-100 relative z-10">
                                         <li className="flex gap-2"><span>×</span> Correct indexing is 0-based in system.</li>
                                         <li className="flex gap-2"><span>×</span> Subject codes must be exact match.</li>
                                         <li className="flex gap-2"><span>×</span> Explanations support Markdown formatting.</li>
                                     </ul>
                                </div>
                                <div className="bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl rounded-[32px] border border-slate-200 dark:border-white/10 p-8 shadow-2xl">
                                     <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Metadata</h4>
                                     <div className="space-y-4">
                                         <div className="space-y-2">
                                             <label className="text-[10px] font-black text-slate-400 uppercase">Difficulty</label>
                                             <select 
                                                value={newQuestion.difficulty}
                                                onChange={e => setNewQuestion({...newQuestion, difficulty: e.target.value})}
                                                className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm font-bold"
                                             >
                                                 <option value="easy">Easy</option>
                                                 <option value="medium">Medium</option>
                                                 <option value="hard">Hard</option>
                                             </select>
                                         </div>
                                         <div className="space-y-2">
                                             <label className="text-[10px] font-black text-slate-400 uppercase">Category Tag</label>
                                             <input 
                                                type="text" 
                                                placeholder="e.g., Recursion, SQL" 
                                                className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm font-bold"
                                                value={newQuestion.topic}
                                                onChange={e => setNewQuestion({...newQuestion, topic: e.target.value})}
                                            />
                                         </div>
                                     </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'stats' && (
                <div className="bg-gradient-to-br from-slate-900 to-black p-8 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 bg-orange-600/10 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:bg-orange-600/20 transition-all duration-700" />
                    <div className="relative z-10">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Platform Summary</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-8">
                            <div>
                                <p className="text-[11px] sm:text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Total Views</p>
                                <p className="text-3xl font-black text-white">{stats?.pageStats.reduce((acc, curr) => acc + Number(curr.views), 0).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[11px] sm:text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Total Visitors</p>
                                <p className="text-3xl font-black text-white">{stats?.pageStats.reduce((acc, curr) => acc + Number(curr.visitors), 0).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[11px] sm:text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Active Events</p>
                                <p className="text-3xl font-black text-white">{stats?.eventStats.length || 0}</p>
                            </div>
                            <div>
                                <p className="text-[11px] sm:text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Health Status</p>
                                <p className="text-3xl font-black text-emerald-500">OPTIMAL</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStats;
