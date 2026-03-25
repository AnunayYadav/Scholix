import React, { useState, useEffect, useMemo, useRef } from 'react';
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
                const users = await NexusServer.fetchAllProfiles(100, 0);
                setAllUsers(users);
            };
            loadUsers();
        }
    }, [audienceMode, allUsers.length]);

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) return;
        if (audienceMode === 'targeted' && selectedUserIds.length === 0) {
            setStatus({ msg: 'Select users first', error: true });
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
            setStatus({ msg: `Message Sent: ${audienceMode === 'global' ? 'Everyone' : `${selectedUserIds.length} Users`}`, error: false });
            setTitle('');
            setMessage('');
            setLink('');
            setSelectedUserIds([]);
            setTimeout(() => setStatus(null), 5000);
        } catch (err) {
            setStatus({ msg: 'Error sending message', error: true });
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
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Notifications</h3>
                        <p className="text-[10px] font-medium text-slate-500 tracking-wider">Send messages to users</p>
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
                            <label className="text-[10px] font-bold text-slate-500 ml-1 tracking-tight">Select Users ({selectedUserIds.length} Selected)</label>
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
                                    <p className="text-[9px] text-slate-400 italic">No users selected yet.</p>
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
                        <label className="text-[10px] font-bold text-slate-500 ml-1 tracking-tight">Notification Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Type heading..."
                            className="premium-input w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-2.5 text-xs font-semibold"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 ml-1 tracking-tight">Importance</label>
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
                    <label className="text-[10px] font-bold text-slate-500 ml-1 tracking-tight">Message Body</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message here..."
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
                        {isSending ? 'Sending...' : 'Send Now'}
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

const getColorClasses = (color: string) => {
    switch(color) {
        case 'orange': return { 
            text: 'text-orange-500', 
            bg: 'bg-orange-500', 
            lightBg: 'bg-orange-500/10', 
            veryLightBg: 'bg-orange-500/5', 
            border: 'border-orange-500/20',
            shadow: 'shadow-orange-500/20',
            hoverBg: 'hover:bg-orange-600'
        };
        case 'blue': return { 
            text: 'text-blue-500', 
            bg: 'bg-blue-500', 
            lightBg: 'bg-blue-500/10', 
            veryLightBg: 'bg-blue-500/5', 
            border: 'border-blue-500/20',
            shadow: 'shadow-blue-500/20',
            hoverBg: 'hover:bg-blue-600'
        };
        case 'emerald': return { 
            text: 'text-emerald-500', 
            bg: 'bg-emerald-500', 
            lightBg: 'bg-emerald-500/10', 
            veryLightBg: 'bg-emerald-500/5', 
            border: 'border-emerald-500/20',
            shadow: 'shadow-emerald-500/20',
            hoverBg: 'hover:bg-emerald-600'
        };
        default: return { 
            text: 'text-indigo-500', 
            bg: 'bg-indigo-500', 
            lightBg: 'bg-indigo-500/10', 
            veryLightBg: 'bg-indigo-500/5', 
            border: 'border-indigo-500/20',
            shadow: 'shadow-indigo-500/20',
            hoverBg: 'hover:bg-indigo-600'
        };
    }
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; sub: string; color: string; onClick?: () => void }> = ({ icon, label, value, sub, color, onClick }) => {
    const classes = getColorClasses(color);
    return (
        <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={onClick}
            className={`glass-panel p-6 rounded-[32px] border border-slate-200 dark:border-white/10 shadow-xl relative overflow-hidden group cursor-pointer transition-all duration-300 bg-white dark:bg-white/[0.02]`}
        >
            <div className={`absolute top-0 right-0 w-24 h-24 ${classes.veryLightBg} blur-3xl -mr-12 -mt-12`} />
            <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg ${classes.lightBg} flex items-center justify-center ${classes.text}`}>
                    {icon}
                </div>
                <Sparkline color={color === 'orange' ? '#f97316' : color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : '#6366f1'} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-500 tracking-wider mb-1 uppercase">{label}</p>
                <div className="flex items-baseline gap-2">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h4>
                    {onClick && (
                        <motion.div 
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 0 }}
                            whileHover={{ opacity: 1, x: 0 }}
                            className="text-[8px] font-bold text-orange-500 uppercase tracking-widest hidden group-hover:block"
                        >
                            View Details →
                        </motion.div>
                    )}
                </div>
                <p className="text-[9px] font-semibold text-slate-400 tracking-wide mt-1 opacity-70">{sub}</p>
            </div>
        </motion.div>
    );
}

const DetailedDataView: React.FC<{ type: string; value: string | number; sub: string; color: string; onClose: () => void }> = ({ type, value, sub, color, onClose }) => {
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(12);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const t = type === 'Traffic' ? 'views' : 
                      type === 'Users' ? 'visitors' : 
                      type === 'Tickets' ? 'feedback' : 'reports';
            const res = await NexusServer.getTimeSeriesStats(t as any, days);
            setChartData(res);
            setLoading(false);
        };
        fetch();
    }, [type, days]);

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="glass-panel w-full p-5 md:p-6 rounded-[24px] border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden relative mt-4 bg-slate-50/50 dark:bg-white/[0.02]"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className={`text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1`}>{sub}</p>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{type} Performance</h2>
                </div>
                <div className="flex items-center gap-4">
                    {/* Time Range Selector */}
                    <div className="hidden md:flex items-center p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5">
                        {[7, 12, 30, 0].map((d) => (
                            <button
                                key={d}
                                onClick={() => setDays(d)}
                                className={`px-2.5 py-1.5 rounded-lg text-[8px] font-bold uppercase transition-all duration-300 ${
                                    days === d 
                                    ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' 
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                }`}
                            >
                                {d === 0 ? 'All' : `${d}d`}
                            </button>
                        ))}
                    </div>
                    
                    <button 
                        onClick={onClose} 
                        className="group p-1.5 hover:bg-red-500/10 rounded-lg transition-all duration-300 text-slate-400 hover:text-red-500 border border-transparent hover:border-red-500/20"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tighter">{value}</h3>
                    <div className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-bold rounded-full border border-emerald-500/20">
                        +12.5% 
                    </div>
                </div>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1.5 max-w-lg leading-relaxed">Historical trends and capacity indicators synchronized.</p>
            </div>

            <div 
                ref={containerRef}
                className="h-[180px] w-full relative mb-8 group/graph cursor-crosshair"
                onMouseMove={(e) => {
                    if (!containerRef.current || chartData.length === 0) return;
                    const rect = containerRef.current.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const index = Math.round((x / rect.width) * (chartData.length - 1));
                    setHoverIndex(Math.max(0, Math.min(chartData.length - 1, index)));
                }}
                onMouseLeave={() => setHoverIndex(null)}
            >
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                        <div className="w-6 h-6 border-2 border-slate-200 border-t-orange-500 rounded-full animate-spin" />
                        <p className="font-bold uppercase tracking-widest text-[7px]">Syncing...</p>
                    </div>
                ) : chartData.length > 0 ? (
                    <>
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 180">
                            <defs>
                                <linearGradient id={`line-gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={color === 'orange' ? '#f97316' : color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : '#6366f1'} stopOpacity="0.15" />
                                    <stop offset="100%" stopColor={color === 'orange' ? '#f97316' : color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : '#6366f1'} stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            
                            {/* Horizontal Grid lines */}
                            {[0, 45, 90, 135].map((y) => (
                                <line 
                                    key={y} 
                                    x1="0" y1={y} x2="100" y2={y} 
                                    stroke="currentColor" 
                                    strokeWidth="0.5" 
                                    strokeDasharray="1,2" 
                                    className="text-slate-200 dark:text-white/5" 
                                />
                            ))}

                            <path 
                                d={`M 0 180 ${chartData.map((d, i) => {
                                    const x = (i / (chartData.length - 1)) * 100;
                                    const y = 180 - (Math.max(5, (d.count / Math.max(...chartData.map(c => c.count))) * 160));
                                    return `L ${x} ${y}`;
                                }).join(' ')} L 100 180 Z`}
                                fill={`url(#line-gradient-${color})`}
                                className="transition-all duration-1000"
                            />

                            <path 
                                d={`M 0 ${180 - (Math.max(5, (chartData[0].count / Math.max(...chartData.map(c => c.count))) * 160))} ${chartData.map((d, i) => {
                                    const x = (i / (chartData.length - 1)) * 100;
                                    const y = 180 - (Math.max(5, (d.count / Math.max(...chartData.map(c => c.count))) * 160));
                                    return `L ${x} ${y}`;
                                }).join(' ')}`}
                                fill="none"
                                stroke={color === 'orange' ? '#f97316' : color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : '#6366f1'}
                                strokeWidth="2"
                                vectorEffect="non-scaling-stroke"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>

                        {/* X-Axis Labels */}
                        <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-1 pointer-events-none">
                            {[0, Math.floor((chartData.length - 1) / 2), chartData.length - 1].map((idx) => (
                                <span 
                                    key={idx} 
                                    className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter"
                                >
                                    {new Date(chartData[idx].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                            ))}
                        </div>

                        {/* Hover Overlays (HTML for pixel-perfect scaling) */}
                        {hoverIndex !== null && (
                            <div 
                                className="absolute top-0 bottom-0 pointer-events-none transition-all duration-75"
                                style={{ left: `${(hoverIndex / (chartData.length - 1)) * 100}%` }}
                            >
                                {/* Vertical Guideline */}
                                <div className="absolute top-0 bottom-0 w-[1px] bg-slate-400/20 dark:bg-white/10 border-l border-dashed border-slate-300 dark:border-white/20" />
                                
                                {/* Indicator Dot */}
                                <div 
                                    className="absolute w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 shadow-lg -translate-x-1/2"
                                    style={{ 
                                        top: `${180 - (Math.max(5, (chartData[hoverIndex].count / Math.max(...chartData.map(c => c.count))) * 160))}px`,
                                        backgroundColor: color === 'orange' ? '#f97316' : color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : '#6366f1'
                                    }}
                                />

                                {/* Tooltip */}
                                <div 
                                    className={`absolute -translate-y-full -mt-4 bg-slate-900 dark:bg-white text-white dark:text-black py-2 px-3 rounded-xl text-[10px] font-bold shadow-2xl z-10 whitespace-nowrap ${hoverIndex > chartData.length / 2 ? '-translate-x-full ml-[-10px]' : '-translate-x-0 ml-[10px]'}`}
                                    style={{ top: `${180 - (Math.max(5, (chartData[hoverIndex].count / Math.max(...chartData.map(c => c.count))) * 160))}px` }}
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="opacity-60 text-[8px] uppercase tracking-wider">{new Date(chartData[hoverIndex].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                        <span className="text-sm tracking-tight">{chartData[hoverIndex].count.toLocaleString()} {type}</span>
                                    </div>
                                    <div className={`absolute bottom-[-4px] border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent ${hoverIndex > chartData.length / 2 ? 'right-[10px]' : 'left-[10px]'} border-t-slate-900 dark:border-t-white`} />
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-5 text-slate-400 p-12 bg-slate-50 dark:bg-white/[0.01] rounded-[30px] border border-dashed border-slate-200 dark:border-white/10">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 opacity-10"><path d="M3 3v18h18M7 16l4-4 4 4 5-5" /></svg>
                        <p className="font-bold uppercase tracking-[0.2em] text-[10px] text-center">No data found for this period</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-white/5">
                <div className="px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 hover:border-orange-500/30 transition-colors">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Highest Count</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tighter">{chartData.length > 0 ? Math.max(...chartData.map(c => c.count)).toLocaleString() : 0}</p>
                </div>
                <div className="px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 hover:border-blue-500/30 transition-colors">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Time Range</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tighter">{chartData.length} Days</p>
                </div>
                <div className="px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 hover:border-emerald-500/30 transition-colors">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Status</p>
                    <p className="text-xl font-bold text-emerald-500 tracking-tighter">Live</p>
                </div>
            </div>
        </motion.div>
    );
}

const AdminStats: React.FC<AdminStatsProps> = ({ userProfile }) => {
    const [activeTab, setActiveTab] = useState<'monitor' | 'reports' | 'constructor' | 'inbound' | 'tracker'>('monitor');
    const [data, setData] = useState<any>(null);
    const [reports, setReports] = useState<any[]>([]);
    const [feedback, setFeedback] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isSendingReply, setIsSendingReply] = useState(false);
    const [showDetailedStats, setShowDetailedStats] = useState<string | null>(null);

    // User Tracker States
    const [reportSubTab, setReportSubTab] = useState<'pending' | 'tracker'>('pending');
    const [userSearchText, setUserSearchText] = useState('');
    const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
    const [allProfiles, setAllProfiles] = useState<any[]>([]);
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
    const [selectedUserActivity, setSelectedUserActivity] = useState<any>(null);
    const [isSearchingUser, setIsSearchingUser] = useState(false);

    // User Tracker Pagination
    const [profilesOffset, setProfilesOffset] = useState(0);
    const [hasMoreProfiles, setHasMoreProfiles] = useState(true);
    const [isLoadingMoreProfiles, setIsLoadingMoreProfiles] = useState(false);
    const PROFILES_LIMIT = 10;

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
        loadReports();
        loadFeedback();
    }, []);

    // Load Profiles for Tracker with Pagination
    useEffect(() => {
        if (reportSubTab === 'tracker' && allProfiles.length === 0) {
            const fetchInitialProfiles = async () => {
                setIsLoadingProfiles(true);
                try {
                    const profiles = await NexusServer.fetchAllProfiles(PROFILES_LIMIT, 0);
                    // Fetch summary stats for each profile
                    const profilesWithStats = await Promise.all(
                        profiles.map(async (p: any) => {
                            const activity = await NexusServer.getUserDetailedActivity(p.id);
                            return { ...p, stats: activity?.historyStats };
                        })
                    );
                    setAllProfiles(profilesWithStats);
                    setProfilesOffset(PROFILES_LIMIT);
                    if (profiles.length < PROFILES_LIMIT) {
                        setHasMoreProfiles(false);
                    }
                } catch (err) {
                    console.error("Profile Fetch Error:", err);
                } finally {
                    setIsLoadingProfiles(false);
                }
            };
            fetchInitialProfiles();
        }
    }, [reportSubTab, allProfiles.length]);

    const loadMoreProfiles = async () => {
        if (isLoadingMoreProfiles || !hasMoreProfiles) return;
        setIsLoadingMoreProfiles(true);
        try {
            const nextProfiles = await NexusServer.fetchAllProfiles(PROFILES_LIMIT, profilesOffset);
            if (nextProfiles.length === 0) {
                setHasMoreProfiles(false);
                return;
            }

            // Fetch summary stats for each profile
            const profilesWithStats = await Promise.all(
                nextProfiles.map(async (p: any) => {
                    const activity = await NexusServer.getUserDetailedActivity(p.id);
                    return { ...p, stats: activity?.historyStats };
                })
            );

            setAllProfiles(prev => [...prev, ...profilesWithStats]);
            setProfilesOffset(prev => prev + PROFILES_LIMIT);
            if (nextProfiles.length < PROFILES_LIMIT) {
                setHasMoreProfiles(false);
            }
        } catch (err) {
            console.error("Load More Profiles Error:", err);
        } finally {
            setIsLoadingMoreProfiles(false);
        }
    };

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

    const handleUserSearch = async (val: string) => {
        setUserSearchText(val);
        if (val.length < 2) {
            setUserSearchResults([]);
            return;
        }
        setIsSearchingUser(true);
        try {
            const results = await NexusServer.searchUsers(val);
            setUserSearchResults(results);
        } finally {
            setIsSearchingUser(false);
        }
    };

    const selectUserForTracking = async (user: any) => {
        setUserSearchResults([]);
        setUserSearchText('');
        setLoading(true);
        try {
            const activity = await NexusServer.getUserDetailedActivity(user.id);
            setSelectedUserActivity(activity);
        } catch (err) {
            console.error("User Activity Fetch Error:", err);
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
            
            // 1. Send the actual notification to the user
            await NexusServer.sendGlobalNotification(title, replyText, 'info', undefined, [f.user_id]);
            
            // 2. Link the reply to the feedback record for tracking
            const currentReplies = f.replies || [];
            const updatedReplies = [...currentReplies, { text: replyText, date: new Date().toISOString() }];
            
            try {
                await NexusServer.updateFeedback(f.id, { replies: updatedReplies });
                // Update local state so count increases immediately
                setFeedback(prev => prev.map(item => item.id === f.id ? { ...item, replies: updatedReplies } : item));
            } catch (err) {
                console.warn("Feedback reply tracking failed (likely missing 'replies' column), but notification was sent:", err);
            }

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
        return data.pageStats; 
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
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
                </div>

                <div className="flex p-1.5 bg-slate-100 dark:bg-white/5 rounded-[20px] border border-slate-200 dark:border-white/10 overflow-hidden">
                    {[
                        { id: 'monitor', label: 'Stats' },
                        { id: 'tracker', label: 'Tracking' },
                        { id: 'reports', label: 'Reports' },
                        { id: 'constructor', label: 'Editor' },
                        { id: 'inbound', label: 'Feedback' }
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
                    label="Traffic" 
                    value={data?.summary?.totalViews.toLocaleString() || '0'} 
                    sub="Total Page Views" 
                    color="orange"
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                    onClick={() => setShowDetailedStats('Traffic')}
                />
                <StatCard 
                    label="Users" 
                    value={data?.summary?.visitors.toLocaleString() || '0'} 
                    sub="Unique Visitors" 
                    color="blue"
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
                    onClick={() => setShowDetailedStats('Users')}
                />
                <StatCard 
                    label="Issues" 
                    value={data?.summary?.pendingReports || '0'} 
                    sub="Active Reports" 
                    color="emerald"
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
                    onClick={() => setShowDetailedStats('Issues')}
                />
                <StatCard 
                    label="Tickets" 
                    value={data?.summary?.totalFeedback || '0'} 
                    sub="User Feedback" 
                    color="indigo"
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
                    onClick={() => setShowDetailedStats(showDetailedStats === 'Tickets' ? null : 'Tickets')}
                />
            </div>

            <AnimatePresence>
                {showDetailedStats && (
                    <DetailedDataView 
                        type={showDetailedStats}
                        value={
                            showDetailedStats === 'Traffic' ? data?.summary?.totalViews.toLocaleString() : 
                            showDetailedStats === 'Users' ? data?.summary?.visitors.toLocaleString() : 
                            showDetailedStats === 'Issues' ? data?.summary?.pendingReports : 
                            data?.summary?.totalFeedback.toLocaleString()
                        }
                        sub={
                            showDetailedStats === 'Traffic' ? 'Total Page Views' : 
                            showDetailedStats === 'Users' ? 'Unique Visitors' : 
                            showDetailedStats === 'Issues' ? 'Active Reports' : 
                            'User Feedback'
                        }
                        color={
                            showDetailedStats === 'Traffic' ? 'orange' : 
                            showDetailedStats === 'Users' ? 'blue' : 
                            showDetailedStats === 'Issues' ? 'emerald' : 
                            'indigo'
                        }
                        onClose={() => setShowDetailedStats(null)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {activeTab === 'monitor' && (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Performance Visualizer */}
                            <div className="glass-panel p-6 rounded-[24px] border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden relative">
                                <h3 className="text-[11px] font-bold text-slate-900 dark:text-white tracking-wider mb-6 border-b border-slate-100 dark:border-white/5 pb-3 flex justify-between uppercase">
                                    Popular Pages
                                    <span className="text-[9px] font-semibold text-orange-500 lowercase opacity-60">overview</span>
                                </h3>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar scroll-smooth pr-2">
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
                        <div className="glass-panel rounded-[24px] border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden">
                            <div className="p-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
                                <h3 className="text-[11px] font-bold text-slate-900 dark:text-white tracking-widest uppercase">Activity Log</h3>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-bold tracking-wider text-slate-500">Live</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-[300px] overflow-y-auto no-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md z-10 text-slate-500">
                                        <tr className="border-b border-slate-100 dark:border-white/5">
                                            <th className="px-8 py-4 text-[10px] font-bold tracking-wider">Activity</th>
                                            <th className="px-8 py-4 text-[10px] font-bold tracking-wider">Total Times</th>
                                            <th className="px-8 py-4 text-[10px] font-bold tracking-wider text-right">Last Used</th>
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
                    <div className="space-y-8">
                        {/* Sub Navigation */}
                        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl w-fit border border-slate-200/50 dark:border-white/5 shadow-inner">
                            <button 
                                onClick={() => setReportSubTab('pending')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                                    reportSubTab === 'pending' 
                                    ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xl' 
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    Pending Issues
                                    {reports.length > 0 && (
                                        <span className="bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] animate-pulse">{reports.length}</span>
                                    )}
                                </span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('tracker')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                                    activeTab === 'tracker' 
                                    ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xl' 
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                }`}
                            >
                                User Tracker
                            </button>
                        </div>

                        {reportSubTab === 'pending' && (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                                {reports.length > 0 ? reports.map((report, idx) => (
                                    <motion.div 
                                        key={report.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="glass-panel p-6 rounded-[24px] border border-slate-200 dark:border-white/10 relative group bg-white/50 dark:bg-white/[0.02]"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center font-bold text-xs border border-slate-200/50 dark:border-white/5 text-slate-600 dark:text-white/60">
                                                    {report.reporter?.username?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-tight">{report.reporter?.username || 'Guest'}</h4>
                                                    <p className="text-[9px] font-semibold text-slate-400 tracking-wider font-mono">{new Date(report.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border shadow-sm ${
                                                report.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse'
                                            }`}>
                                                {report.status}
                                            </span>
                                        </div>

                                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 mb-6 hover:border-orange-500/20 transition-all cursor-default">
                                            <p className="text-[10px] font-bold text-orange-600 tracking-wider mb-2 flex items-center gap-2">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                {report.reason}
                                            </p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">"{report.question?.question}"</p>
                                        </div>

                                        <div className="flex gap-2">
                                            {report.status === 'pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => editReportedQuestion(report)}
                                                        className="flex-1 py-3 rounded-xl bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20"
                                                    >
                                                        Edit Question
                                                    </button>
                                                    <button 
                                                        disabled={actionLoading === report.id}
                                                        onClick={() => resolveReport(report.id, 'resolved')}
                                                        className="px-6 py-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold uppercase hover:bg-emerald-500 hover:text-white transition-all"
                                                    >
                                                        Clear
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="col-span-full py-20 text-center">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">All systems clear. No pending reports.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                )}

                {activeTab === 'tracker' && (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-8"
                            >
                                {/* User Search Header */}
                                <div className="glass-panel p-8 rounded-[32px] border border-slate-200 dark:border-white/10 shadow-2xl bg-gradient-to-br from-white/80 to-slate-50 dark:from-white/[0.03] dark:to-transparent">
                                    <div className="max-w-2xl mx-auto space-y-6 text-center">
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Global User Tracking</h3>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Search for any Verto by username or registration number to view their full activity spectrum.</p>
                                        
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                                            </div>
                                            <input 
                                                type="text" 
                                                placeholder="Enter username or Reg No..." 
                                                className="w-full bg-white dark:bg-slate-950/20 border-2 border-slate-100 dark:border-white/5 focus:border-orange-500/50 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold tracking-tight shadow-sm transition-all outline-none"
                                                value={userSearchText}
                                                onChange={(e) => handleUserSearch(e.target.value)}
                                            />
                                            {isSearchingUser && (
                                                <div className="absolute inset-y-0 right-5 flex items-center">
                                                    <div className="w-5 h-5 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                                                </div>
                                            )}

                                            {/* Quick Search Results */}
                                            {userSearchResults.length > 0 && !selectedUserActivity && (
                                                <div className="absolute top-full left-0 right-0 mt-3 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 space-y-1">
                                                    {userSearchResults.map((user) => (
                                                        <button 
                                                            key={user.id}
                                                            onClick={() => selectUserForTracking(user)}
                                                            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all group"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs uppercase tracking-tighter">
                                                                    {user.username?.[0]}
                                                                </div>
                                                                <div className="text-left">
                                                                    <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">{user.username}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400 tracking-wider">REG: {user.registration_number}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-right mr-4">
                                                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">Inspect Full Profile</p>
                                                                </div>
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Default User Table */}
                                    {!selectedUserActivity && (
                                        <div className="mt-12 overflow-hidden">
                                            <div className="flex items-center justify-between mb-6 px-2">
                                                <h4 className="text-xs font-bold text-slate-400 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    Global Verto Registry
                                                </h4>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-[10px] font-bold text-slate-500 tracking-tight">{allProfiles.length} Members Loaded</p>
                                                </div>
                                            </div>
                                            
                                            <div className="glass-panel overflow-hidden border border-slate-100 dark:border-white/5 rounded-[30px] shadow-xl">
                                                <div className="overflow-x-auto no-scrollbar">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead>
                                                            <tr className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/10">
                                                                <th className="px-8 py-5 text-[9px] font-bold text-slate-400 tracking-wide">Verto Profile</th>
                                                                <th className="px-8 py-5 text-[9px] font-bold text-slate-400 tracking-wide hidden sm:table-cell text-center">Reference</th>
                                                                <th className="px-8 py-5 text-[9px] font-bold text-slate-400 tracking-wide hidden md:table-cell">Affiliation</th>
                                                                <th className="px-8 py-5 text-[9px] font-bold text-slate-400 tracking-wide text-right">Access</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                                            {isLoadingProfiles ? (
                                                                <tr>
                                                                    <td colSpan={4} className="py-24 text-center">
                                                                        <div className="flex flex-col items-center gap-4">
                                                                            <div className="w-12 h-12 border-4 border-slate-100 dark:border-white/5 border-t-orange-500 rounded-full animate-spin" />
                                                                            <p className="text-[10px] font-bold text-slate-400 tracking-wide font-mono animate-pulse">Synchronizing Records...</p>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ) : allProfiles.length > 0 ? (
                                                                allProfiles.filter(u => 
                                                                    !userSearchText || 
                                                                    u.username?.toLowerCase().includes(userSearchText.toLowerCase()) || 
                                                                    u.registration_number?.includes(userSearchText)
                                                                ).map((user) => (
                                                                    <tr key={user.id} className="group hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-all">
                                                                        <td className="px-8 py-5">
                                                                            <div className="flex items-center gap-5">
                                                                                <div className="relative">
                                                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/5 dark:to-white/10 flex items-center justify-center text-slate-600 dark:text-white font-black text-sm shadow-sm overflow-hidden border border-white/50 dark:border-white/5 group-hover:scale-105 transition-transform">
                                                                                        {user.avatar_url ? (
                                                                                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                                                        ) : (
                                                                                            user.username?.[0]?.toUpperCase() || 'V'
                                                                                        )}
                                                                                    </div>
                                                                                    {user.is_admin && (
                                                                                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                                                                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">{user.username}</p>
                                                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                                                        <p className="text-[9px] font-bold text-emerald-500 px-2 py-0.5 bg-emerald-500/10 rounded-full uppercase tracking-tighter">LVL {user.level || 1}</p>
                                                                                        <p className="text-[9px] font-bold text-slate-400 font-mono tracking-tighter">{(user.total_xp || 0).toLocaleString()} XP</p>
                                                                                        {user.stats && (
                                                                                            <>
                                                                                                <p className="text-[9px] font-bold text-blue-500 border-l border-slate-200 dark:border-white/10 pl-2 ml-1">{(user.stats.studyTime / 60).toFixed(0)}m Study</p>
                                                                                                <p className="text-[9px] font-bold text-orange-500">· {user.stats.quizzesCompleted || 0} Quizzes</p>
                                                                                                <p className="text-[9px] font-bold text-indigo-500">· {user.stats.filesAccessed || 0} Files</p>
                                                                                            </>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-8 py-5 hidden sm:table-cell text-center">
                                                                            <p className="text-[10px] font-black text-slate-600 dark:text-slate-300 font-mono tracking-wider tabular-nums px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-lg inline-block">{user.registration_number || '----------'}</p>
                                                                        </td>
                                                                        <td className="px-8 py-5 hidden md:table-cell">
                                                                            <p className="text-[10px] font-bold text-slate-500 truncate max-w-[180px]">{user.email || 'Email Protected'}</p>
                                                                        </td>
                                                                        <td className="px-8 py-5 text-right">
                                                                            <button 
                                                                                onClick={() => selectUserForTracking(user)}
                                                                                className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black text-[10px] font-bold tracking-tight hover:bg-orange-600 hover:text-white dark:hover:bg-orange-600 dark:hover:text-white transition-all shadow-sm"
                                                                            >
                                                                                Inspect
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan={4} className="py-24 text-center">
                                                                        <div className="flex flex-col items-center gap-3 opacity-30 grayscale">
                                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16"><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 10v4" /><path d="M10 12h4" /></svg>
                                                                            <p className="text-[10px] font-bold text-slate-400 tracking-wide">Registry Empty</p>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                 </div>
                                                 {/* Load More Button */}
                                                 {hasMoreProfiles && (
                                                     <div className="p-8 flex justify-center border-t border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]">
                                                         <button 
                                                             onClick={loadMoreProfiles}
                                                             disabled={isLoadingMoreProfiles}
                                                             className="px-10 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-orange-500/50 hover:text-orange-600 transition-all shadow-sm disabled:opacity-50 flex items-center gap-3"
                                                         >
                                                             {isLoadingMoreProfiles ? (
                                                                 <>
                                                                     <div className="w-4 h-4 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                                                                     Loading...
                                                                 </>
                                                             ) : (
                                                                 <>
                                                                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M19 9l-7 7-7-7" /></svg>
                                                                     Load More Profiles
                                                                 </>
                                                             )}
                                                         </button>
                                                     </div>
                                                 )}
                                                
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Active Selection Board */}
                                {selectedUserActivity && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center justify-between px-2">
                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                                                Active Profile: <span className="text-orange-600">{selectedUserActivity.profile?.username}</span>
                                            </h4>
                                            <button 
                                                onClick={() => setSelectedUserActivity(null)}
                                                className="text-[9px] font-bold uppercase text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                Close Session
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                                            <div className="p-5 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm">
                                                <p className="text-[9px] font-bold text-slate-400 tracking-wide mb-2">Level/XP</p>
                                                <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">LVL {selectedUserActivity.profile?.level || 1} <span className="text-[10px] text-emerald-500 opacity-60 ml-2">{(selectedUserActivity.profile?.total_xp || 0).toLocaleString()} XP</span></p>
                                            </div>
                                            <div className="p-5 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm">
                                                <p className="text-[9px] font-bold text-slate-400 tracking-wide mb-2">Quiz Power</p>
                                                <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{selectedUserActivity.attempts?.length || 0} <span className="text-[10px] text-orange-500 opacity-60 ml-2">Tests</span></p>
                                            </div>
                                            <div className="p-5 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm">
                                                <p className="text-[9px] font-bold text-slate-400 tracking-wide mb-2">Study Volume</p>
                                                <p className="text-xl font-black text-blue-500 tracking-tighter">{(selectedUserActivity.historyStats?.studyTime / 3600).toFixed(1)} <span className="text-[10px] opacity-60 ml-2">Hours Active</span></p>
                                            </div>
                                            <div className="p-5 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm">
                                                <p className="text-[9px] font-bold text-slate-400 tracking-wide mb-2">Resource Use</p>
                                                <p className="text-xl font-black text-indigo-500 tracking-tighter">{selectedUserActivity.historyStats?.filesAccessed || 0} <span className="text-[10px] opacity-60 ml-2">Files</span></p>
                                            </div>
                                            <div className="p-5 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm">
                                                <p className="text-[9px] font-bold text-slate-400 tracking-wide mb-2">CGPA Analytics</p>
                                                <p className="text-xl font-black text-purple-500 tracking-tighter">{selectedUserActivity.historyStats?.cgpaCalculations || 0} <span className="text-[10px] opacity-60 ml-2">Calcs</span></p>
                                            </div>
                                            <div className="p-5 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm">
                                                <p className="text-[9px] font-bold text-slate-400 tracking-wide mb-2">Impact Points</p>
                                                <p className="text-xl font-black text-emerald-500 tracking-tighter">{(selectedUserActivity.reports?.length + selectedUserActivity.feedback?.length) * 10} <span className="text-[10px] opacity-60 ml-2">Social</span></p>
                                            </div>
                                            <div className="p-5 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm">
                                                <p className="text-[9px] font-bold text-slate-400 tracking-wide mb-2">Quiz Mastery</p>
                                                <p className="text-xl font-black text-orange-600 tracking-tighter">{selectedUserActivity.historyStats?.quizzesCompleted || 0} <span className="text-[10px] opacity-60 ml-2">Comp.</span></p>
                                            </div>
                                        </div>

                                        {/* Activity Log Grid */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Quiz Performance */}
                                            <div className="glass-panel p-6 rounded-[24px] border border-slate-200 dark:border-white/10">
                                                <h5 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4 border-b border-slate-100 dark:border-white/5 pb-3">Quiz History (Last 10)</h5>
                                                <div className="space-y-3">
                                                    {selectedUserActivity.attempts?.length > 0 ? selectedUserActivity.attempts.map((att: any, i: number) => (
                                                        <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all group">
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-800 dark:text-white/80 uppercase mb-0.5">{att.subject}</p>
                                                                <p className="text-[8px] font-bold text-slate-400">{new Date(att.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs font-bold text-slate-900 dark:text-white">{Math.round((att.score / att.total_questions) * 100)}%</p>
                                                                <p className="text-[8px] font-bold text-emerald-500">+{att.xp_gained} XP</p>
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <p className="text-[10px] font-bold text-slate-300 italic text-center py-10">No attempts found.</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Contributions */}
                                            <div className="glass-panel p-6 rounded-[24px] border border-slate-200 dark:border-white/10">
                                                <h5 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4 border-b border-slate-100 dark:border-white/5 pb-3">Issues & Feedback</h5>
                                                <div className="space-y-4">
                                                    {selectedUserActivity.reports?.map((r: any, i: number) => (
                                                        <div key={i} className="flex gap-3 items-start border-l-2 border-red-500/30 pl-3">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1" />
                                                            <div>
                                                                <p className="text-[10px] font-bold text-slate-800 dark:text-white/70">Reported: {r.reason}</p>
                                                                <p className="text-[8px] text-slate-500">{new Date(r.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {selectedUserActivity.feedback?.map((f: any, i: number) => (
                                                        <div key={i} className="flex gap-3 items-start border-l-2 border-orange-500/30 pl-3">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1" />
                                                            <div>
                                                                <p className="text-[10px] font-bold text-slate-800 dark:text-white/70">Feedback: {f.text.slice(0, 40)}...</p>
                                                                <p className="text-[8px] text-slate-500">{new Date(f.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {selectedUserActivity.reports?.length === 0 && selectedUserActivity.feedback?.length === 0 && (
                                                        <p className="text-[10px] font-bold text-slate-300 italic text-center py-10">No public reports or feedback.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
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
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Question Editor</h3>
                                        <p className="text-[10px] font-bold text-slate-400 tracking-wider">{newQuestion.id ? `Editing Question: ${newQuestion.id}` : 'Adding a new question to the database'}</p>
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
                                    placeholder="Type your question here..." 
                                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[30px] px-6 py-5 text-sm font-medium h-32 focus:outline-none focus:border-orange-500/50 resize-none"
                                    value={newQuestion.question}
                                    onChange={e => setNewQuestion({...newQuestion, question: e.target.value})}
                                    required
                                />

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-500 tracking-wider ml-4">Answer Options (Mark Correct)</label>
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
                                                placeholder={`Option ${idx + 1}`} 
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
                                    {isSaving ? 'Saving...' : 'Save Question'}
                                </button>
                             </form>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-orange-500 to-orange-700 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl rounded-full -mr-16 -mt-16" />
                                <h4 className="text-sm font-bold tracking-wider mb-6 border-b border-white/20 pb-4">Instructions</h4>
                                <ul className="space-y-5">
                                    {[
                                        { t: 'Index', d: 'Correct answer index is 0-indexed (0 to 3).' },
                                        { t: 'Codes', d: 'Use uppercase subject codes (e.g. CSE121).' },
                                        { t: 'Format', d: 'Supports KaTeX and regular text formatting.' },
                                        { t: 'Updates', d: 'Using an existing ID will update that question.' }
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
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-widest mb-6">Question Details</h4>
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 tracking-wider ml-1">Difficulty Level</label>
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
                                        <label className="text-[10px] font-bold text-slate-500 tracking-wider ml-1">Topic</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Heapsort, Normalization" 
                                            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3 text-xs font-bold"
                                            value={newQuestion.topic}
                                            onChange={e => setNewQuestion({...newQuestion, topic: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 tracking-wider ml-1">Explanation</label>
                                        <textarea 
                                            placeholder="Explain the correct answer here..." 
                                            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3 text-[10px] font-semibold h-24 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                                            value={newQuestion.explanation}
                                            onChange={e => setNewQuestion({...newQuestion, explanation: e.target.value})}
                                        />
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
                            <h3 className="text-xs font-bold text-slate-500 tracking-wider">feedback feed</h3>
                            <button onClick={loadFeedback} className="text-[10px] font-bold text-orange-600 hover:underline">refresh list</button>
                        </div>
                        {feedback.length > 0 ? (
                            feedback.map((f, i) => (
                                <motion.div 
                                    key={f.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass-panel p-6 rounded-[24px] border border-slate-200 dark:border-white/10 shadow-xl relative"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-xl shadow-indigo-500/20">
                                                {f.user?.username?.[0] || 'G'}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{f.user?.username || 'Guest'}</h4>
                                                <p className="text-[10px] font-mono text-slate-500">{f.user_email || 'No Email'}</p>
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
                                                        placeholder="Write your reply here..."
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
                                                            {isSendingReply ? 'Sending...' : 'Send Reply'}
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
                                                <div className="flex items-center gap-4">
                                                    <button 
                                                        onClick={() => setReplyingTo(f.id)}
                                                        className="px-8 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-bold text-[10px] tracking-tight rounded-2xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                                                    >
                                                        Reply to feedback
                                                    </button>
                                                    {f.replies?.length > 0 && (
                                                        <div className="flex items-center gap-2 group cursor-default">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                                                {f.replies.length} {f.replies.length === 1 ? 'reply' : 'replies'}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl w-fit">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                            <p className="text-[9px] font-bold text-amber-600 tracking-wider">Guest feedback: Cannot reply</p>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-slate-100/50 dark:bg-white/5 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-white/10">
                                <p className="text-xs font-bold text-slate-400 tracking-widest">No Feedback Yet</p>
                                <p className="text-[10px] text-slate-500 mt-2">Everything is quiet for now.</p>
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
                        <h3 className="text-2xl font-bold tracking-tight mb-2">System Status</h3>
                        <p className="text-xs text-slate-500 font-semibold tracking-wider">Operational Overview</p>
                        <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10 inline-flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                            <span className="text-xs font-bold tracking-wider text-emerald-500">Peak Performance</span>
                        </div>
                    </div>
                    <div className="md:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 tracking-wider mb-1">Page Views</p>
                            <p className="text-3xl font-bold tracking-tight">{data?.summary?.totalViews.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 tracking-wider mb-1">Users</p>
                            <p className="text-3xl font-bold tracking-tight">{data?.summary?.registered.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 tracking-wider mb-1">Events</p>
                            <p className="text-3xl font-bold tracking-tight">{data?.eventStats.length || '0'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 tracking-wider mb-1">Uptime</p>
                            <p className="text-3xl font-bold tracking-tight text-emerald-500">99.9%</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminStats;
