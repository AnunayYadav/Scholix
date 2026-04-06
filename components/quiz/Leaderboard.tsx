import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NexusServer from '../../services/nexusServer';

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar_url?: string;
  avatar_frame?: string;
  totalStudyTime: number;
  level: number;
}

interface LeaderboardProps {
  currentUserId?: string | null;
}

const LeaderboardSection: React.FC<LeaderboardProps> = ({ currentUserId }) => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const data = await NexusServer.getStudyLeaderboard();
                setLeaderboard(data);
            } catch (error) {
                console.error("Failed to fetch leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hrs > 0) return `${hrs}h ${mins}m`;
        return `${mins}m`;
    };

    if (loading) {
        return (
            <div className="glass-panel p-8 rounded-[40px] animate-pulse">
                <div className="h-6 w-32 bg-slate-200 dark:bg-white/5 rounded-full mb-6" />
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-16 bg-slate-100 dark:bg-white/5 rounded-3xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-lg shadow-orange-500/10">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                            <path d="M12 15L12 19M12 15L15 12M12 15L9 12M12 5V15" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M4 20H20" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Study Kings</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Weekly Study Time Leaderboard</p>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Live Updates</span>
                </div>
            </div>

            <div className="glass-panel overflow-hidden rounded-[48px] border border-slate-100 dark:border-white/[0.08] shadow-2xl shadow-slate-200/20 dark:shadow-none bg-white/40 dark:bg-white/[0.02] backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.03]">
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rank</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Level</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Time Focused</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            <AnimatePresence>
                                {leaderboard.map((entry, idx) => (
                                    <motion.tr 
                                        key={entry.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className={`group hover:bg-orange-500/[0.02] dark:hover:bg-orange-500/[0.04] transition-all cursor-default ${entry.id === currentUserId ? 'bg-orange-500/[0.04] border-l-4 border-l-orange-500 shadow-inner' : ''}`}
                                    >
                                        <td className="px-8 py-5">
                                            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-black transition-all group-hover:scale-110 shadow-sm
                                                ${idx === 0 ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-amber-500/20' : 
                                                  idx === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-white shadow-slate-400/20' : 
                                                  idx === 2 ? 'bg-gradient-to-br from-orange-700 to-orange-900 text-white shadow-orange-900/20' : 
                                                  'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500'}
                                            `}>
                                                {idx + 1}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="relative flex-shrink-0">
                                                  <div className="w-12 h-12 rounded-[20px] overflow-hidden bg-slate-100 dark:bg-white/5 border-2 border-white dark:border-white/10 shadow-sm transition-all group-hover:rotate-6 group-hover:scale-110">
                                                      {entry.avatar_url ? (
                                                          <img src={entry.avatar_url} alt={entry.username} className="w-full h-full object-cover" />
                                                      ) : (
                                                          <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700 bg-slate-50 dark:bg-white/5">
                                                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                                          </div>
                                                      )}
                                                  </div>
                                                  {entry.avatar_frame && (
                                                      <img 
                                                        src={entry.avatar_frame} 
                                                        alt="Frame" 
                                                        className="absolute inset-0 w-full h-full scale-[1.35] pointer-events-none z-10 drop-shadow-xl" 
                                                      />
                                                  )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors truncate max-w-[150px]">
                                                        {entry.username}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter opacity-60">Nexus Scholar</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black tracking-tighter border border-emerald-500/20">
                                                    LVL {entry.level}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-black text-slate-900 dark:text-white font-mono tracking-tight group-hover:text-orange-500 transition-colors">
                                                    {formatTime(entry.totalStudyTime)}
                                                </span>
                                                <div className="w-12 h-1 bg-slate-100 dark:bg-white/5 rounded-full mt-1.5 overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min(100, (entry.totalStudyTime / (leaderboard[0]?.totalStudyTime || 1)) * 100)}%` }}
                                                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {leaderboard.length === 0 && (
                    <div className="p-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-slate-300 dark:text-slate-700">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">The board is empty</h3>
                            <p className="text-sm text-slate-500 max-w-xs mx-auto">Focus up and start studying to see your name here!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaderboardSection;
