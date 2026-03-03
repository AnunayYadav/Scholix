import React, { useState, useEffect } from 'react';
import NexusServer from '../services/nexusServer';
import { UserProfile } from '../types';

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
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Send a notification to everyone</p>
                </div>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Notification Title</label>
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
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Notification Type</label>
                        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                            {(['info', 'success', 'warning', 'error'] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={`flex-1 py-2 rounded-xl text-[9px] font-medium transition-all ${type === t
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
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Message Content</label>
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
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Target Link (Optional)</label>
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
                    <div className={`mt-4 p-4 rounded-2xl text-[10px] font-medium text-center border ${status.error ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }`}>
                        {status.msg}
                    </div>
                )}
            </form>
        </div>
    );
};

const AdminStats: React.FC<AdminStatsProps> = ({ userProfile }) => {
    const [stats, setStats] = useState<{ pageStats: any[], eventStats: any[] } | null>(null);
    const [loading, setLoading] = useState(true);

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
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Real-time engagement metrics and performance stats.</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 rounded-full bg-orange-600/10 text-orange-600 border border-orange-600/20 font-bold text-xs uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all active:scale-95"
                >
                    Refresh Feed
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[0, 1].map(i => (
                        <div key={i} className="bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl rounded-[32px] border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                                <div className="h-5 w-32 skeleton-pulse rounded-lg" />
                                <div className="h-5 w-16 skeleton-pulse rounded-full" />
                            </div>
                            <div className="p-4 space-y-3">
                                {Array.from({ length: 6 }).map((_, j) => (
                                    <div key={j} className="flex items-center gap-4 p-3">
                                        <div className="h-4 w-4 skeleton-pulse rounded" />
                                        <div className="h-4 flex-1 skeleton-pulse rounded-md" />
                                        <div className="h-4 w-16 skeleton-pulse rounded-md" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    <GlobalBroadcaster />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Page Views Table */}
                        <div className="bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl rounded-[32px] border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">Page Performance</h3>
                                <span className="text-[10px] font-bold px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full border border-orange-500/20 uppercase">By Views</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 dark:bg-white/[0.01]">
                                            <th className="px-6 py-4 text-[10px] font-medium text-slate-400">Path</th>
                                            <th className="px-6 py-4 text-[10px] font-medium text-slate-400">Visitors</th>
                                            <th className="px-6 py-4 text-[10px] font-medium text-slate-400 text-right">Page Views</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {stats?.pageStats.map((stat, i) => (
                                            <tr key={stat.path} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-orange-600 dark:text-orange-400">{stat.path}</td>
                                                <td className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300">{stat.visitors.toLocaleString()}</td>
                                                <td className="px-6 py-4 font-black text-slate-900 dark:text-white text-right">{stat.views.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        {(!stats?.pageStats || stats.pageStats.length === 0) && (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic text-sm">No telemetry data available yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Event Stats Table */}
                        <div className="bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl rounded-[32px] border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">Interaction Events</h3>
                                <span className="text-[10px] font-bold px-3 py-1 bg-red-500/10 text-red-500 rounded-full border border-red-500/20 uppercase">Live Pulse</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 dark:bg-white/[0.01]">
                                            <th className="px-6 py-4 text-[10px] font-medium text-slate-400">Event Name</th>
                                            <th className="px-6 py-4 text-[10px] font-medium text-slate-400">Total Count</th>
                                            <th className="px-6 py-4 text-[10px] font-medium text-slate-400 text-right">Last Triggered</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {stats?.eventStats.map((stat) => (
                                            <tr key={stat.event_name} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 font-black text-slate-900 dark:text-white capitalize">{stat.event_name.replace(/_/g, ' ')}</td>
                                                <td className="px-6 py-4 font-black text-2xl text-orange-600 drop-shadow-sm">{stat.count.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-[10px] text-slate-500 dark:text-slate-400 text-right">
                                                    {new Date(stat.last_triggered).toLocaleDateString()} <br />
                                                    {new Date(stat.last_triggered).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                            </tr>
                                        ))}
                                        {(!stats?.eventStats || stats.eventStats.length === 0) && (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic text-sm">Waiting for first interactions...</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-black p-8 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 bg-orange-600/10 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:bg-orange-600/20 transition-all duration-700" />
                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Platform Summary</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-8">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Views</p>
                                    <p className="text-3xl font-black text-white">{stats?.pageStats.reduce((acc, curr) => acc + Number(curr.views), 0).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Visitors</p>
                                    <p className="text-3xl font-black text-white">{stats?.pageStats.reduce((acc, curr) => acc + Number(curr.visitors), 0).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Events</p>
                                    <p className="text-3xl font-black text-white">{stats?.eventStats.length || 0}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Health Status</p>
                                    <p className="text-3xl font-black text-emerald-500">OPTIMAL</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminStats;
