import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NexusServer from '../services/nexusServer';
import { UserProfile, QuizQuestion } from '../types';

interface AdminStatsProps {
    userProfile: UserProfile | null;
}

// Sparkline component to simulate data trend
const Sparkline: React.FC<{ color: string }> = ({ color }) => (
    <svg className="w-16 h-8 opacity-50" viewBox="0 0 100 40">
        <path
            d="M0 35 Q 20 10, 40 30 T 80 5 T 100 25"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
        />
    </svg>
);

const GlobalBroadcaster: React.FC = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
    const [link, setLink] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState<{ msg: string; error: boolean } | null>(null);

    // Targeted Audience State
    const [audienceMode, setAudienceMode] = useState<'global' | 'targeted'>('global');
    const [allUsers, setAllUsers] = useState<Partial<UserProfile>[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [showUserList, setShowUserList] = useState(false);

    useEffect(() => {
        if (audienceMode === 'targeted' && allUsers.length === 0) {
            const loadUsers = async () => {
                const users = await NexusServer.fetchAllProfiles();
                setAllUsers(users);
            };
            loadUsers();
        }
    }, [audienceMode, allUsers.length]);

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) return;
        if (audienceMode === 'targeted' && selectedUserIds.length === 0) {
            setStatus({ msg: 'SELECT TARGET VECTORS FIRST', error: true });
            return;
        }

        setIsSending(true);
        setStatus(null);
        try {
            if (audienceMode === 'global') {
                await NexusServer.sendGlobalAnnouncement(title, message, type, link || undefined);
                // Also blast to all individual feeds for maximum visibility
                await NexusServer.sendGlobalNotification(title, message, type, link || undefined);
            } else {
                await NexusServer.sendGlobalNotification(title, message, type, link || undefined, selectedUserIds);
            }
            setStatus({ msg: `TRANSMISSION SUCCESSFUL: ${audienceMode === 'global' ? 'ALL STREAMS' : `${selectedUserIds.length} VECTORS`}`, error: false });
            setTitle('');
            setMessage('');
            setLink('');
            setSelectedUserIds([]);
            setTimeout(() => setStatus(null), 5000);
        } catch (err) {
            setStatus({ msg: 'TRANSMISSION ABORTED: SYSTEM ERROR', error: true });
        } finally {
            setIsSending(false);
        }
    };

    const toggleUser = (id: string) => {
        setSelectedUserIds(prev => 
            prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
        );
    };

    const filteredUsers = allUsers.filter(u => 
        u.username?.toLowerCase().includes(userSearch.toLowerCase()) || 
        u.registration_number?.includes(userSearch)
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 rounded-[32px] border border-slate-200 dark:border-white/10 relative overflow-hidden flex flex-col h-full"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl -mr-16 -mt-16" />
            
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Broadcaster</h3>
                        <p className="text-[10px] font-medium text-slate-500 tracking-wider">System-wide signal distribution</p>
                    </div>
                </div>

                <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 shrink-0">
                    <button 
                        onClick={() => setAudienceMode('global')}
                        className={`px-4 py-1.5 rounded-lg text-[9px] font-bold transition-all ${audienceMode === 'global' ? 'bg-slate-950 dark:bg-white text-white dark:text-black shadow-lg' : 'text-slate-400'}`}
                    >
                        Global
                    </button>
                    <button 
                        onClick={() => setAudienceMode('targeted')}
                        className={`px-4 py-1.5 rounded-lg text-[9px] font-bold transition-all ${audienceMode === 'targeted' ? 'bg-slate-950 dark:bg-white text-white dark:text-black shadow-lg' : 'text-slate-400'}`}
                    >
                        Targeted
                    </button>
                </div>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4 flex-1 flex flex-col">
                {audienceMode === 'targeted' && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3 mb-2"
                    >
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-500 ml-1 tracking-tight">Target Selection ({selectedUserIds.length} Active)</label>
                            <button 
                                type="button"
                                onClick={() => setShowUserList(!showUserList)}
                                className="text-[9px] font-bold text-orange-600 hover:underline"
                            >
                                {showUserList ? 'Minimize' : 'Expand list'}
                            </button>
                        </div>
                        
                        {showUserList ? (
                            <div className="space-y-3">
                                    <input 
                                        type="text"
                                        placeholder="Search by name or ID..."
                                        className="premium-input w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-2 text-[10px] font-semibold"
                                        value={userSearch}
                                        onChange={e => setUserSearch(e.target.value)}
                                    />
                                    <div className="h-40 overflow-y-auto no-scrollbar grid grid-cols-2 gap-2 p-1">
                                        {filteredUsers.map(user => (
                                            <button
                                                key={user.id}
                                                type="button"
                                                onClick={() => user.id && toggleUser(user.id)}
                                                className={`p-2 rounded-xl border flex items-center gap-2 transition-all text-left ${
                                                    selectedUserIds.includes(user.id!) 
                                                        ? 'bg-orange-500/10 border-orange-500/30 text-orange-600' 
                                                        : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 opacity-60'
                                                }`}
                                            >
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] ${selectedUserIds.includes(user.id!) ? 'bg-orange-600 text-white' : 'bg-slate-200 dark:bg-white/10'}`}>
                                                    {user.username?.[0].toUpperCase()}
                                                </div>
                                                <div className="truncate">
                                                    <p className="text-[9px] font-bold truncate">{user.username}</p>
                                                    <p className="text-[8px] font-mono opacity-50">{user.registration_number}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                            </div>
                        ) : (
                            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                                {selectedUserIds.length === 0 ? (
                                    <p className="text-[9px] text-slate-400 italic">No target vectors initialized.</p>
                                ) : (
                                        selectedUserIds.map(uid => {
                                            const user = allUsers.find(u => u.id === uid);
                                            return (
                                                <div key={uid} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-orange-600/10 text-orange-600 border border-orange-500/20 rounded-lg text-[9px] font-bold">
                                                    {user?.username}
                                                    <button type="button" onClick={() => toggleUser(uid)} className="hover:text-red-500 transition-colors">×</button>
                                                </div>
                                            );
                                        })
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 ml-1 tracking-tight">Signal Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Announcement title..."
                            className="premium-input w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-2.5 text-xs font-semibold"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 ml-1 tracking-tight">Priority Level</label>
                        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                            {(['info', 'success', 'warning', 'error'] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold capitalize transition-all ${type === t
                                        ? 'bg-orange-600 text-white shadow-md'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-1 flex-1">
                    <label className="text-[10px] font-bold text-slate-500 ml-1 tracking-tight">Content Payload</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Establish message protocol..."
                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[24px] px-4 py-3 text-xs font-semibold h-full min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        required
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-center pt-2">
                    <input
                        type="text"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="Redirect path (e.g., /library)"
                        className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono"
                    />
                    <button
                        type="submit"
                        disabled={isSending || !title || !message}
                        className="w-full sm:w-auto px-10 py-2.5 bg-orange-600 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all disabled:opacity-50"
                    >
                        {isSending ? 'Transmitting...' : 'Send Broadcast'}
                    </button>
                </div>

                <AnimatePresence>
                    {status && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`p-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-center border ${
                                status.error ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            }`}
                        >
                            {status.msg}
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>
        </motion.div>
    );
};

const StatCard: React.FC<{ label: string; value: string | number; sub: string; icon: React.ReactNode; color: string }> = ({ label, value, sub, icon, color }) => (
    <motion.div 
        whileHover={{ y: -5 }}
        className="glass-panel p-5 rounded-[28px] border border-slate-200 dark:border-white/10 relative group overflow-hidden"
    >
        <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 blur-3xl -mr-12 -mt-12`} />
        <div className="flex items-center justify-between mb-3">
            <div className={`w-8 h-8 rounded-lg bg-${color}-500/10 flex items-center justify-center text-${color}-500`}>
                {icon}
            </div>
            <Sparkline color={color === 'orange' ? '#f97316' : color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : '#6366f1'} />
        </div>
        <div>
            <p className="text-[10px] font-bold text-slate-500 tracking-wider mb-1">{label}</p>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h4>
            <p className="text-[9px] font-semibold text-slate-400 tracking-wide mt-1 opacity-70">{sub}</p>
        </div>
    </motion.div>
);

const AdminStats: React.FC<AdminStatsProps> = ({ userProfile }) => {
    const [activeTab, setActiveTab] = useState<'monitor' | 'reports' | 'constructor' | 'inbound'>('monitor');
    const [data, setData] = useState<any>(null);
    const [reports, setReports] = useState<any[]>([]);
    const [feedback, setFeedback] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isSendingReply, setIsSendingReply] = useState(false);

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

    const loadCoreData = async () => {
        try {
            const stats = await NexusServer.getDetailedStats();
            setData(stats);
        } catch (err) {
            console.error("Dashboard Sync Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCoreData();
    }, []);

    useEffect(() => {
        if (activeTab === 'reports') loadReports();
        if (activeTab === 'inbound') loadFeedback();
    }, [activeTab]);

    const loadReports = async () => {
        setLoading(true);
        try {
            const r = await NexusServer.fetchQuestionReports();
            setReports(r);
        } finally {
            setLoading(false);
        }
    };

    const loadFeedback = async () => {
        setLoading(true);
        try {
            const f = await NexusServer.fetchFeedback();
            setFeedback(f);
        } finally {
            setLoading(false);
        }
    };

    const handleSendReply = async (f: any) => {
        if (!replyText.trim() || !f.user_id) return;
        setIsSendingReply(true);
        try {
            const shortText = f.text.length > 40 ? f.text.substring(0, 40) + '...' : f.text;
            const title = `Reply to your feedback "${shortText}"`;
            await NexusServer.sendGlobalNotification(title, replyText, 'info', undefined, [f.user_id]);
            setReplyingTo(null);
            setReplyText('');
            alert("Reply sent successfully.");
        } catch (e) {
            console.error("Reply Error:", e);
            alert("Unable to send reply. Please check your connection.");
        } finally {
            setIsSendingReply(false);
        }
    };

    const handleCreateQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (newQuestion.id) {
                await NexusServer.updateQuestion(newQuestion as any);
            } else {
                await NexusServer.createQuestion(newQuestion);
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
            alert("Question database updated.");
        } finally {
            setIsSaving(false);
        }
    };

    const resolveReport = async (reportId: string, status: string) => {
        setActionLoading(reportId);
        try {
            await NexusServer.updateReportStatus(reportId, status);
            setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
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
        setActiveTab('constructor');
    };

    const topPages = useMemo(() => {
        if (!data?.pageStats) return [];
        return data.pageStats.slice(0, 5);
    }, [data]);

    if (!userProfile?.is_admin) {
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <div className="text-center p-12 bg-white/5 backdrop-blur-2xl rounded-[40px] border border-white/10 max-w-md">
                    <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-8 h-8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Access Restricted</h2>
                    <p className="text-slate-400 font-medium leading-relaxed">Administrator level authentication required to access the Command Center.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-32 pt-6">
            {/* Command Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] font-bold text-emerald-600 tracking-wide">System Online • v1.3.0</p>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Command Center</h1>
                </div>

                <div className="flex p-1.5 bg-slate-100 dark:bg-white/5 rounded-[20px] border border-slate-200 dark:border-white/10 overflow-hidden">
                    {[
                        { id: 'monitor', label: 'Monitor' },
                        { id: 'reports', label: 'Reports' },
                        { id: 'constructor', label: 'Constructor' },
                        { id: 'inbound', label: 'Inbound' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-bold transition-all ${activeTab === tab.id
                                ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* High Level Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    label="Reach" 
                    value={data?.summary?.totalViews.toLocaleString() || '0'} 
                    sub="Total Page Views" 
                    color="orange"
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                />
                <StatCard 
                    label="Audience" 
                    value={data?.summary?.visitors.toLocaleString() || '0'} 
                    sub="Unique Visitors" 
                    color="blue"
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
                />
                <StatCard 
                    label="Bank Security" 
                    value={data?.summary?.pendingReports || '0'} 
                    sub="Active Reports" 
                    color="emerald"
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
                />
                <StatCard 
                    label="Feedback" 
                    value={data?.summary?.totalFeedback || '0'} 
                    sub="Inbound Tickets" 
                    color="indigo"
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
                />
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'monitor' && (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-10"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Performance Visualizer */}
                            <div className="glass-panel p-8 rounded-[40px] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden relative">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wider mb-8 border-b border-slate-100 dark:border-white/5 pb-4 flex justify-between">
                                    Path Distribution
                                    <span className="text-[10px] font-semibold text-orange-500">Top 5 segments</span>
                                </h3>
                                
                                <div className="space-y-6">
                                    {topPages.map((page: any, idx: number) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-bold tracking-tight">
                                                <span className="text-slate-500 font-mono">{page.path}</span>
                                                <span className="text-slate-900 dark:text-white">{page.views.toLocaleString()}</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(page.views / (topPages[0]?.views || 1)) * 100}%` }}
                                                    transition={{ duration: 1, delay: idx * 0.1 }}
                                                    className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full shadow-[0_0_12px_rgba(249,115,22,0.3)]"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <GlobalBroadcaster />
                        </div>

                        {/* Full Stats Table */}
                        <div className="glass-panel rounded-[40px] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wider">Interaction pulse</h3>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-bold tracking-wider text-slate-500">Live feed</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-[400px] overflow-y-auto no-scrollbar">
                                <table className="w-full text-left">
                                    <thead className="sticky top-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md z-10 text-slate-500">
                                        <tr className="border-b border-slate-100 dark:border-white/5">
                                            <th className="px-8 py-4 text-[10px] font-bold tracking-wider">Action segment</th>
                                            <th className="px-8 py-4 text-[10px] font-bold tracking-wider">Aggregate weight</th>
                                            <th className="px-8 py-4 text-[10px] font-bold tracking-wider text-right">Last trigger</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {data?.eventStats.map((event: any, idx: number) => (
                                            <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="px-8 py-5">
                                                    <span className="text-xs font-bold text-slate-700 dark:text-white/80 tracking-tight group-hover:text-orange-600 transition-colors">
                                                        {event.event_name.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg font-black text-slate-900 dark:text-white">{event.count.toLocaleString()}</span>
                                                        <div className="h-1 w-12 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                            <div className="h-full bg-orange-500" style={{ width: `${Math.min((event.count / 1000) * 100, 100)}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right font-mono text-[10px] text-slate-500 uppercase">
                                                    {new Date(event.last_triggered).toLocaleDateString()} at {new Date(event.last_triggered).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'reports' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {reports.map((report, idx) => (
                            <motion.div 
                                key={report.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass-panel p-6 rounded-[32px] border border-slate-200 dark:border-white/10 relative group"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center font-bold text-xs">
                                            {report.reporter?.username?.[0] || '?'}
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-tight">{report.reporter?.username || 'Guest'}</h4>
                                            <p className="text-[9px] font-semibold text-slate-400 tracking-wider font-mono">{new Date(report.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                        report.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                                    }`}>
                                        {report.status}
                                    </span>
                                </div>

                                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 mb-6">
                                    <p className="text-[10px] font-bold text-orange-600 tracking-wider mb-2">Claim: {report.reason}</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">"{report.question?.question}"</p>
                                </div>

                                <div className="flex gap-2">
                                    {report.status === 'pending' && (
                                        <>
                                            <button 
                                                onClick={() => editReportedQuestion(report)}
                                                className="flex-1 py-3 rounded-xl bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20"
                                            >
                                                Fix Entry
                                            </button>
                                            <button 
                                                disabled={actionLoading === report.id}
                                                onClick={() => resolveReport(report.id, 'resolved')}
                                                className="px-6 py-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold uppercase hover:bg-emerald-500 hover:text-white transition-all"
                                            >
                                                Dismiss
                                            </button>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {activeTab === 'constructor' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        <div className="lg:col-span-2 space-y-6">
                             <form onSubmit={handleCreateQuestion} className="glass-panel p-8 rounded-[40px] border border-slate-200 dark:border-white/10 shadow-2xl space-y-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-2xl">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Question Architect</h3>
                                        <p className="text-[10px] font-bold text-slate-400 tracking-wider">{newQuestion.id ? `Redefining Entity: ${newQuestion.id}` : 'Designing New Knowledge Point'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input 
                                        type="text" 
                                        placeholder="Subject Code (CSE121)" 
                                        className="premium-input bg-slate-100 dark:bg-white/5 px-5 py-3 rounded-2xl text-xs font-bold uppercase"
                                        value={newQuestion.subject}
                                        onChange={e => setNewQuestion({...newQuestion, subject: e.target.value.toUpperCase()})}
                                        required
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Unit ID (1-6)" 
                                        className="premium-input bg-slate-100 dark:bg-white/5 px-5 py-3 rounded-2xl text-xs font-bold"
                                        value={newQuestion.unit}
                                        onChange={e => setNewQuestion({...newQuestion, unit: e.target.value})}
                                        required
                                    />
                                </div>

                                <textarea 
                                    placeholder="Matrix Content Requirement..." 
                                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[30px] px-6 py-5 text-sm font-medium h-32 focus:outline-none focus:border-orange-500/50 resize-none"
                                    value={newQuestion.question}
                                    onChange={e => setNewQuestion({...newQuestion, question: e.target.value})}
                                    required
                                />

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-500 tracking-wider ml-4">Response Variants (Mark Correct)</label>
                                    {newQuestion.options.map((opt, idx) => (
                                        <div key={idx} className="flex gap-4 items-center group">
                                            <input 
                                                type="radio" 
                                                name="correct-ans" 
                                                checked={newQuestion.correctAnswer === idx}
                                                onChange={() => setNewQuestion({...newQuestion, correctAnswer: idx})}
                                                className="w-5 h-5 accent-orange-500 cursor-pointer"
                                            />
                                            <input 
                                                type="text" 
                                                placeholder={`Variant ${idx + 1}`} 
                                                className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-3 text-xs font-bold transition-all group-hover:border-slate-400 dark:group-hover:border-white/20"
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

                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="w-full bg-slate-950 dark:bg-white text-white dark:text-black font-bold text-xs py-4 rounded-2.5xl uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:bg-slate-900 transition-all disabled:opacity-50"
                                >
                                    {isSaving ? 'Compiling...' : 'Commit to Database'}
                                </button>
                             </form>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-orange-500 to-orange-700 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl rounded-full -mr-16 -mt-16" />
                                <h4 className="text-sm font-bold tracking-wider mb-6 border-b border-white/20 pb-4">Standard Protocol</h4>
                                <ul className="space-y-5">
                                    {[
                                        { t: 'Indexing', d: 'Correct answer vector is 0-indexed.' },
                                        { t: 'Subjects', d: 'Use uppercase codes (e.g. CSE121).' },
                                        { t: 'Markdown', d: 'Supports KaTeX and Rich Formatting.' },
                                        { t: 'Uniqueness', d: 'ID collision will trigger an update.' }
                                    ].map((step, i) => (
                                        <li key={i} className="flex gap-4">
                                            <div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center text-[10px] font-bold italic">{i+1}</div>
                                            <div>
                                                <p className="text-[10px] font-bold tracking-tight leading-tight">{step.t}</p>
                                                <p className="text-[9px] font-bold text-orange-100/70">{step.d}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="glass-panel p-8 rounded-[40px] border border-slate-200 dark:border-white/10 shadow-xl">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-widest mb-6">Metadata Layer</h4>
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 tracking-wider ml-1">Target Complexity</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['easy', 'medium', 'hard'].map(level => (
                                                <button 
                                                    key={level}
                                                    type="button"
                                                    onClick={() => setNewQuestion({...newQuestion, difficulty: level})}
                                                    className={`py-2 rounded-xl text-[9px] font-bold capitalize transition-all border ${
                                                        newQuestion.difficulty === level 
                                                        ? 'bg-orange-600 text-white border-orange-600' 
                                                        : 'bg-slate-100 dark:bg-white/5 text-slate-500 border-transparent hover:border-slate-300'
                                                    }`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 tracking-wider ml-1">Topic Taxonomy</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Heapsort, Normalization" 
                                            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3 text-xs font-bold"
                                            value={newQuestion.topic}
                                            onChange={e => setNewQuestion({...newQuestion, topic: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 tracking-wider ml-1">Detailed Explanation</label>
                                        <textarea 
                                            placeholder="Markdown-enabled logic dump..." 
                                            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3 text-[10px] font-semibold h-24 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                                            value={newQuestion.explanation}
                                            onChange={e => setNewQuestion({...newQuestion, explanation: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'inbound' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between px-4">
                            <h3 className="text-xs font-bold text-slate-500 tracking-wider">Communication stream</h3>
                            <button onClick={loadFeedback} className="text-[10px] font-bold text-orange-600 hover:underline">Refresh Feed</button>
                        </div>
                        {feedback.length > 0 ? (
                            feedback.map((f, i) => (
                                <motion.div 
                                    key={f.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass-panel p-8 rounded-[40px] border border-slate-200 dark:border-white/10 shadow-2xl relative"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-xl shadow-indigo-500/20">
                                                {f.user?.username?.[0] || 'G'}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{f.user?.username || 'Guest Identity'}</h4>
                                                <p className="text-[10px] font-mono text-slate-500">{f.user_email || 'Secured Origin'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-slate-500 tracking-wider">{new Date(f.created_at).toLocaleDateString()}</p>
                                            <p className="text-[9px] font-medium text-slate-400">{new Date(f.created_at).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-100 dark:bg-white/5 p-6 rounded-[30px] border border-slate-200 dark:border-white/10 mb-6">
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium italic">"{f.text}"</p>
                                    </div>

                                    {f.user_id ? (
                                        <div className="flex flex-col gap-4">
                                            {replyingTo === f.id ? (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="space-y-3"
                                                >
                                                    <textarea 
                                                        placeholder="Compose your reply mission..."
                                                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-[28px] p-5 text-sm font-medium focus:outline-none focus:border-indigo-500/50 min-h-[120px] resize-none"
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                    />
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => handleSendReply(f)}
                                                            disabled={isSendingReply || !replyText.trim()}
                                                            className="flex-1 bg-indigo-600 text-white font-bold text-xs py-3 rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-50"
                                                        >
                                                            {isSendingReply ? 'Sending...' : 'Send response'}
                                                        </button>
                                                        <button 
                                                            onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                                            className="px-6 bg-slate-200 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-bold text-xs py-3 rounded-2xl hover:bg-slate-300 dark:hover:bg-white/10 transition-all"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <button 
                                                    onClick={() => setReplyingTo(f.id)}
                                                    className="w-full sm:w-auto self-start px-8 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-bold text-[10px] tracking-tight rounded-2xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                                                >
                                                    Reply to feedback
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl w-fit">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                            <p className="text-[9px] font-bold text-amber-600 tracking-wider">Guest feedback: Protocol restricted</p>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-slate-100/50 dark:bg-white/5 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-white/10">
                                <p className="text-xs font-bold text-slate-400 tracking-widest">No Incoming Signals</p>
                                <p className="text-[10px] text-slate-500 mt-2">Communication feed is currently at equilibrium.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Health Overlay */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 dark:bg-[#0a0a0a] p-10 rounded-[50px] border border-white/5 shadow-3xl text-white relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/10 blur-[150px] rounded-full -mr-64 -mt-64 group-hover:bg-orange-600/20 transition-all duration-1000" />
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                    <div className="md:col-span-4">
                        <h3 className="text-2xl font-bold tracking-tight mb-2">System Health</h3>
                        <p className="text-xs text-slate-500 font-semibold tracking-wider">Operational Status Optimization</p>
                        <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10 inline-flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                            <span className="text-xs font-bold tracking-wider text-emerald-500">Peak Performance</span>
                        </div>
                    </div>
                    <div className="md:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 tracking-wider mb-1">Raw Views</p>
                            <p className="text-3xl font-bold tracking-tight">{data?.summary?.totalViews.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 tracking-wider mb-1">Registered</p>
                            <p className="text-3xl font-bold tracking-tight">{data?.summary?.registered.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 tracking-wider mb-1">Sync Points</p>
                            <p className="text-3xl font-bold tracking-tight">{data?.eventStats.length || '0'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 tracking-wider mb-1">Latency</p>
                            <p className="text-3xl font-bold tracking-tight text-emerald-500">12ms</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminStats;
