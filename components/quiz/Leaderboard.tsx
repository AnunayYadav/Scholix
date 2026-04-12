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
    const [isExpanded, setIsExpanded] = useState(false);

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
            <div className="glass-panel p-4 py-6 rounded-[32px] animate-pulse bg-white/40 dark:bg-white/[0.02]">
                <div className="flex items-center justify-between gap-4 px-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-zinc-200 dark:bg-white/5 rounded-2xl" />
                        <div className="h-6 w-48 bg-zinc-200 dark:bg-white/5 rounded-full" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <motion.div 
                layout
                initial={false}
                className="glass-panel overflow-hidden rounded-[32px] border border-zinc-200/50 dark:border-white/[0.08] shadow-2xl shadow-zinc-200/10 dark:shadow-none bg-white/50 dark:bg-white/[0.02] backdrop-blur-2xl transition-all"
            >
                {/* Expandable Header */}
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full text-left px-8 py-6 flex items-center justify-between group"
                >
                    <div className="flex items-center gap-5">
                        <motion.div 
                            layout
                            className="w-12 h-12 rounded-[20px] bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/20 rotate-3 group-hover:rotate-6 transition-transform"
                        >
                            <CrownIcon className="w-6 h-6" />
                        </motion.div>
                        <div className="flex flex-col">
                            <h3 className="text-lg font-bold text-zinc-800 dark:text-white tracking-tight">Study Kings Leaderboard</h3>
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-widest flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
                                    {leaderboard.length} Scholars Active
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-zinc-400 group-hover:text-orange-500 transition-colors uppercase tracking-widest hidden sm:inline-block">
                            {isExpanded ? 'Collapse' : 'View Full'}
                        </span>
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400 dark:text-zinc-500 group-hover:text-orange-500 group-hover:bg-orange-500/10 transition-all shadow-sm"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M6 9l6 6 6-6"/></svg>
                        </motion.div>
                    </div>
                </button>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                            <div className="border-t border-zinc-100 dark:border-white/[0.05] max-h-[580px] overflow-y-auto custom-scrollbar relative overflow-x-auto">
                                <table className="w-full text-left border-separate border-spacing-0 min-w-[600px]">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md">
                                            <th className="px-10 py-5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] border-b border-zinc-100 dark:border-white/[0.05]">Rank</th>
                                            <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] border-b border-zinc-100 dark:border-white/[0.05]">Top Achiever</th>
                                            <th className="px-10 py-5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] text-right border-b border-zinc-100 dark:border-white/[0.05]">Focustime</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.05]">
                                        {leaderboard.map((entry, idx) => (
                                            <motion.tr 
                                                key={entry.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className={`group hover:bg-orange-500/[0.02] dark:hover:bg-orange-500/[0.03] transition-all cursor-default relative ${entry.id === currentUserId ? 'bg-orange-500/[0.05]' : ''}`}
                                            >
                                                <td className="px-10 py-5">
                                                    <div className="relative flex items-center justify-center w-9 h-9">
                                                        {idx === 0 && (
                                                            <div className="absolute -top-2.5 -left-1 text-amber-500 drop-shadow-sm">
                                                                <CrownIcon className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                        <div className={`w-full h-full rounded-2xl flex items-center justify-center text-xs font-bold transition-all group-hover:scale-105
                                                            ${idx === 0 ? 'bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20' : 
                                                              idx === 1 ? 'bg-gradient-to-br from-zinc-200 via-zinc-400 to-zinc-500 text-white shadow-lg shadow-zinc-400/20' : 
                                                              idx === 2 ? 'bg-gradient-to-br from-orange-600 via-orange-800 to-orange-900 text-white shadow-lg shadow-orange-900/20' : 
                                                              'text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-white'}
                                                        `}>
                                                            {idx + 1}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <div className={`w-12 h-12 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-white/5 border-2 transition-all duration-500 group-hover:rotate-2
                                                                ${idx === 0 ? 'border-amber-500/50 p-0.5' : 
                                                                  idx === 1 ? 'border-zinc-400/50 p-0.5' :
                                                                  idx === 2 ? 'border-orange-800/50 p-0.5' :
                                                                  'border-white dark:border-white/10 shadow-sm'}
                                                            `}>
                                                                {entry.avatar_url ? (
                                                                    <img src={entry.avatar_url} alt={entry.username} className="w-full h-full object-cover rounded-[14px]" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-700 bg-zinc-50 dark:bg-white/5 rounded-[14px]">
                                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {idx === 0 && (
                                                                <div className="absolute -right-1 -bottom-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-white border-2 border-white dark:border-[#0a0a0a] shadow-lg">
                                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className={`text-sm font-bold transition-colors truncate max-w-[150px]
                                                                ${idx === 0 ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-900 dark:text-white'}
                                                            `}>
                                                                {entry.username}
                                                            </span>
                                                            {entry.id === currentUserId && (
                                                                <span className="text-[9px] font-bold text-orange-500 uppercase tracking-tighter animate-pulse">You are here</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-5 text-right">
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className={`text-sm font-bold font-mono tracking-tight transition-all
                                                            ${idx === 0 ? 'text-amber-600 dark:text-amber-400 scale-105 origin-right' : 'text-zinc-900 dark:text-white'}
                                                        `}>
                                                            {formatTime(entry.totalStudyTime)}
                                                        </span>
                                                        <div className="w-16 h-1 bg-zinc-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
                                                            <div 
                                                                style={{ width: `${Math.min(100, (entry.totalStudyTime / (leaderboard[0]?.totalStudyTime || 1)) * 100)}%` }}
                                                                className={`h-full rounded-full ${idx === 0 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-orange-500 to-amber-500'}`}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {leaderboard.length === 0 && (
                                <div className="py-16 text-center space-y-4">
                                    <div className="w-16 h-16 bg-zinc-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-zinc-300 dark:text-zinc-700 shadow-inner">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-base font-bold text-zinc-900 dark:text-white">Scholar Board Empty</h3>
                                        <p className="text-xs text-zinc-500 max-w-[200px] mx-auto">The throne remains unclaimed. Be the first King!</p>
                                    </div>
                                </div>
                            )}

                            <div className="p-4 bg-zinc-50/50 dark:bg-white/[0.01] border-t border-zinc-100 dark:border-white/[0.05]">
                                <button 
                                    onClick={() => setIsExpanded(false)}
                                    className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-400 hover:text-orange-500 transition-colors uppercase tracking-[0.2em]"
                                >
                                    <span>Collapse Board</span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M18 15l-6-6-6 6"/></svg>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default LeaderboardSection;
