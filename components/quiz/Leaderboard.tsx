import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NexusServer from '../../services/nexusServer';

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar_url?: string;
  totalStudyTime: number;
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

    const CrownIcon = ({ className }: { className?: string }) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
            <path d="M5 15l-3-9 5 3 5-6 5 6 5-3-3 9H5z" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/>
            <path d="M6 18h12" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );

    if (loading) {
        return (
            <div className="glass-panel p-8 rounded-[40px] animate-pulse bg-white/40 dark:bg-white/[0.02]">
                <div className="h-8 w-40 bg-slate-200 dark:bg-white/5 rounded-full mb-8" />
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-20 bg-slate-100 dark:bg-white/5 rounded-[24px]" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[20px] bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/20 rotate-3">
                        <CrownIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Study Kings</h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-[0.25em]">Total focus milestones</p>
                    </div>
                </div>
            </div>

            <div className="glass-panel overflow-hidden rounded-[40px] border border-slate-200/50 dark:border-white/[0.08] shadow-2xl shadow-slate-200/20 dark:shadow-none bg-white/50 dark:bg-white/[0.02] backdrop-blur-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="dark:bg-white/[0.01]">
                                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Rank</th>
                                <th className="px-8 py-6 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Top Achiever</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] text-right">Focustime</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                            <AnimatePresence>
                                {leaderboard.map((entry, idx) => (
                                    <motion.tr 
                                        key={entry.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`group hover:bg-orange-500/[0.03] dark:hover:bg-orange-500/[0.05] transition-all cursor-default relative ${entry.id === currentUserId ? 'bg-orange-500/[0.05]' : ''}`}
                                    >
                                        <td className="px-10 py-6">
                                            <div className="relative flex items-center justify-center w-10 h-10">
                                                {idx === 0 && (
                                                    <motion.div 
                                                        animate={{ rotate: [0, 5, -5, 0] }}
                                                        transition={{ repeat: Infinity, duration: 4 }}
                                                        className="absolute -top-3 -left-1 text-amber-500 drop-shadow-sm"
                                                    >
                                                        <CrownIcon className="w-4 h-4" />
                                                    </motion.div>
                                                )}
                                                <div className={`w-full h-full rounded-2xl flex items-center justify-center text-sm font-bold transition-all group-hover:scale-110
                                                    ${idx === 0 ? 'bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30' : 
                                                      idx === 1 ? 'bg-gradient-to-br from-slate-200 via-slate-400 to-slate-500 text-white shadow-lg shadow-slate-400/30' : 
                                                      idx === 2 ? 'bg-gradient-to-br from-orange-600 via-orange-800 to-orange-900 text-white shadow-lg shadow-orange-900/30' : 
                                                      'text-slate-400 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-white'}
                                                `}>
                                                    {idx + 1}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="relative">
                                                  <div className={`w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5 border-2 transition-all duration-500 group-hover:rotate-3 group-hover:scale-105
                                                      ${idx === 0 ? 'border-amber-500/50 p-0.5' : 
                                                        idx === 1 ? 'border-slate-400/50 p-0.5' :
                                                        idx === 2 ? 'border-orange-800/50 p-0.5' :
                                                        'border-white dark:border-white/10 shadow-sm'}
                                                  `}>
                                                      {entry.avatar_url ? (
                                                          <img src={entry.avatar_url} alt={entry.username} className="w-full h-full object-cover rounded-[14px]" />
                                                      ) : (
                                                          <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700 bg-slate-50 dark:bg-white/5 rounded-[14px]">
                                                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                                          </div>
                                                      )}
                                                  </div>
                                                  {idx === 0 && (
                                                      <div className="absolute -right-1 -bottom-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white border-2 border-white dark:border-[#0a0a0a] shadow-lg">
                                                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                      </div>
                                                  )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-base font-bold transition-colors truncate max-w-[200px]
                                                        ${idx === 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}
                                                    `}>
                                                        {entry.username}
                                                    </span>
                                                    {entry.id === currentUserId && (
                                                        <span className="text-[10px] font-semibold text-orange-500 uppercase tracking-tighter animate-pulse">You are here</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={`text-base font-bold font-mono tracking-tight transition-all
                                                    ${idx === 0 ? 'text-amber-600 dark:text-amber-400 scale-105 origin-right' : 'text-slate-900 dark:text-white'}
                                                `}>
                                                    {formatTime(entry.totalStudyTime)}
                                                </span>
                                                <div className="w-20 h-1 bg-slate-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min(100, (entry.totalStudyTime / (leaderboard[0]?.totalStudyTime || 1)) * 100)}%` }}
                                                        className={`h-full rounded-full ${idx === 0 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-orange-500 to-amber-500'}`}
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
                    <div className="p-32 text-center space-y-6">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-slate-300 dark:text-slate-700 shadow-inner">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Scholar Board Empty</h3>
                            <p className="text-sm text-slate-500 max-w-xs mx-auto">The chronicles of intense study sessions are yet to be written. Will you be the first King?</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaderboardSection;
