import React, { useState, useEffect } from 'react';
import NexusServer from '../services/nexusServer';
import { UserProfile } from '../types';

interface AdminStatsProps {
    userProfile: UserProfile | null;
}

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
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Nexus Intelligence</h1>
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
                    <div className="h-96 bg-slate-200 dark:bg-white/5 animate-pulse rounded-[32px]" />
                    <div className="h-96 bg-slate-200 dark:bg-white/5 animate-pulse rounded-[32px]" />
                </div>
            ) : (
                <>
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
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Path</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Visitors</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Page Views</th>
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
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Event Name</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Total Count</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Last Triggered</th>
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
