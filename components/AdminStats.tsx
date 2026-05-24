import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NexusServer from '../services/nexusServer';
import { UserProfile, QuizQuestion } from '../types';
import AdminAnnouncements from './AdminAnnouncements';

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
            setStatus({ msg: 'Select users first', error: true });
            return;
        }

        setIsSending(true);
        setStatus(null);
        try {
            if (audienceMode === 'global') {
                await NexusServer.sendGlobalAnnouncement(title, message, type, link || undefined);
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
            className="glass-panel p-6 rounded-[32px] border border-neutral-200 dark:border-white/5 relative overflow-hidden flex flex-col h-full"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl -mr-16 -mt-16" />
            
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">Broadcaster</h3>
                        <p className="text-[10px] font-medium text-neutral-500 tracking-tight">Push notifications to users</p>
                    </div>
                </div>

                <div className="flex p-1 bg-neutral-100 dark:bg-black/20 rounded-xl border border-neutral-200 dark:border-white/5 shrink-0">
                    <button 
                        onClick={() => setAudienceMode('global')}
                        className={`px-4 py-1.5 rounded-lg text-[9px] font-medium transition-all ${audienceMode === 'global' ? 'bg-neutral-900 dark:bg-white text-white dark:text-black shadow-lg' : 'text-neutral-400'}`}
                    >
                        Global
                    </button>
                    <button 
                        onClick={() => setAudienceMode('targeted')}
                        className={`px-4 py-1.5 rounded-lg text-[9px] font-medium transition-all ${audienceMode === 'targeted' ? 'bg-neutral-900 dark:bg-white text-white dark:text-black shadow-lg' : 'text-neutral-400'}`}
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
                            <label className="text-[10px] font-semibold text-neutral-500 ml-1 tracking-tight">Select users ({selectedUserIds.length} active)</label>
                            <button 
                                type="button"
                                onClick={() => setShowUserList(!showUserList)}
                                className="text-[9px] font-semibold text-orange-600 hover:text-orange-500 transition-colors"
                            >
                                {showUserList ? 'Collapse' : 'Manage users'}
                            </button>
                        </div>
                        
                        {showUserList ? (
                            <div className="space-y-3">
                                    <input 
                                        type="text"
                                        placeholder="Filter by name or campus ID..."
                                        className="w-full bg-neutral-100 dark:bg-black/40 border border-neutral-200 dark:border-white/5 rounded-xl px-4 py-2 text-[10px] font-medium focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all"
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
                                                        ? 'bg-orange-500/10 border-orange-500/30 text-orange-600 shadow-sm' 
                                                        : 'bg-neutral-50 dark:bg-black/20 border-neutral-200 dark:border-white/5 text-neutral-400 opacity-60'
                                                }`}
                                            >
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-semibold text-[10px] ${selectedUserIds.includes(user.id!) ? 'bg-orange-600 text-white' : 'bg-neutral-200 dark:bg-white/10'}`}>
                                                    {user.username?.[0].toUpperCase()}
                                                </div>
                                                <div className="truncate">
                                                    <p className="text-[9px] font-semibold truncate text-neutral-900 dark:text-neutral-200">{user.username}</p>
                                                    <p className="text-[8px] font-mono opacity-50">{user.registration_number}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                            </div>
                        ) : (
                            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                                {selectedUserIds.length === 0 ? (
                                    <p className="text-[9px] text-neutral-400 italic">No users selected.</p>
                                ) : (
                                        selectedUserIds.map(uid => {
                                            const user = allUsers.find(u => u.id === uid);
                                            return (
                                                <div key={uid} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-black/40 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-white/5 rounded-lg text-[9px] font-semibold">
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
                        <label className="text-[10px] font-semibold text-neutral-500 ml-1 tracking-tight">Main heading</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Announcement title..."
                            className="w-full bg-neutral-100 dark:bg-black/20 border border-neutral-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-neutral-500 ml-1 tracking-tight">Tag level</label>
                        <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-black/20 rounded-xl border border-neutral-200 dark:border-white/5">
                            {(['info', 'success', 'warning', 'error'] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-semibold transition-all ${type === t
                                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-black shadow-sm'
                                        : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-1 flex-1">
                    <label className="text-[10px] font-semibold text-neutral-500 ml-1 tracking-tight">Message component</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write detailed broadcast message..."
                        className="w-full bg-neutral-100 dark:bg-black/20 border border-neutral-200 dark:border-white/5 rounded-[24px] px-4 py-3 text-xs font-medium h-full min-h-[100px] resize-none focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all"
                        required
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-center pt-2">
                    <input
                        type="text"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="Redirect URL (optional)"
                        className="flex-1 bg-neutral-100 dark:bg-black/20 border border-neutral-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={isSending || !title || !message}
                        className="w-full sm:w-auto px-10 py-2.5 bg-orange-600 text-white font-semibold text-[10px] rounded-xl shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all disabled:opacity-50"
                    >
                        {isSending ? 'Sending...' : 'Transmit now'}
                    </button>
                </div>

                <AnimatePresence>
                    {status && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`p-3 rounded-xl text-[9px] font-semibold text-center border mt-4 ${
                                status.error ? 'bg-red-500/5 text-red-500 border-red-500/10' : 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10'
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
            text: 'text-orange-500', 
            bg: 'bg-orange-500', 
            lightBg: 'bg-orange-500/10', 
            veryLightBg: 'bg-orange-500/5', 
            border: 'border-orange-500/20',
            shadow: 'shadow-orange-500/20',
            hoverBg: 'hover:bg-orange-600'
        };
    }
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; sub: string; color: string; onClick?: () => void }> = ({ icon, label, value, sub, color, onClick }) => {
    const classes = getColorClasses(color);
    return (
        <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={onClick}
            className={`glass-panel p-6 rounded-[32px] border border-neutral-200 dark:border-white/10 shadow-xl relative overflow-hidden group cursor-pointer transition-all duration-300 bg-white dark:bg-white/[0.02]`}
        >
            <div className={`absolute top-0 right-0 w-24 h-24 ${classes.veryLightBg} blur-3xl -mr-12 -mt-12`} />
            <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg ${classes.lightBg} flex items-center justify-center ${classes.text}`}>
                    {icon}
                </div>
                <Sparkline color={color === 'orange' ? '#f97316' : color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : '#6366f1'} />
            </div>
            <div>
                <p className="text-[10px] font-medium text-neutral-500 tracking-tight mb-1 capitalize">{label}</p>
                <div className="flex items-baseline gap-2">
                    <h4 className="text-xl font-semibold text-neutral-900 dark:text-white tracking-tight">{value}</h4>
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
                <p className="text-[9px] font-medium text-neutral-400 tracking-tight mt-1 opacity-70">{sub}</p>
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
            className="glass-panel w-full p-5 md:p-6 rounded-[24px] border border-neutral-200 dark:border-white/10 shadow-xl overflow-hidden relative mt-4 bg-neutral-50/50 dark:bg-white/[0.02]"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className={`text-[8px] font-medium text-neutral-500 capitalize tracking-tight mb-1`}>{sub}</p>
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white tracking-tight">{type} Performance</h2>
                </div>
                <div className="flex items-center gap-4">
                    {/* Time Range Selector */}
                    <div className="hidden md:flex items-center p-1 bg-neutral-100 dark:bg-white/5 rounded-xl border border-neutral-200/50 dark:border-white/5">
                        {[7, 12, 30, 0].map((d) => (
                            <button
                                key={d}
                                onClick={() => setDays(d)}
                                className={`px-2.5 py-1.5 rounded-lg text-[8px] font-semibold transition-all duration-300 ${
                                    days === d 
                                    ? 'bg-white dark:bg-white/10 text-neutral-900 dark:text-white shadow-sm' 
                                    : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                                }`}
                            >
                                {d === 0 ? 'all' : `${d}d`}
                            </button>
                        ))}
                    </div>
                    
                    <button 
                        onClick={onClose} 
                        className="group p-1.5 hover:bg-red-500/10 rounded-lg transition-all duration-300 text-zinc-400 hover:text-red-500 border border-transparent hover:border-red-500/20"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white tracking-tighter">{value}</h3>
                    <div className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-semibold rounded-full border border-emerald-500/20">
                        +12.5% 
                    </div>
                </div>
                <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-lg leading-relaxed">Historical trends and capacity indicators synchronized.</p>
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
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-neutral-400">
                        <div className="w-6 h-6 border-2 border-neutral-200 border-t-orange-500 rounded-full animate-spin" />
                        <p className="font-semibold tracking-widest text-[7px] lowercase">syncing...</p>
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
                                    className="text-zinc-200 dark:text-white/5" 
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
                                    className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter"
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
                                <div className="absolute top-0 bottom-0 w-[1px] bg-zinc-400/20 dark:bg-white/10 border-l border-dashed border-zinc-300 dark:border-white/20" />
                                
                                {/* Indicator Dot */}
                                <div 
                                    className="absolute w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 shadow-lg -translate-x-1/2"
                                    style={{ 
                                        top: `${180 - (Math.max(5, (chartData[hoverIndex].count / Math.max(...chartData.map(c => c.count))) * 160))}px`,
                                        backgroundColor: color === 'orange' ? '#f97316' : color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : '#6366f1'
                                    }}
                                />

                                {/* Tooltip */}
                                <div 
                                    className={`absolute -translate-y-full -mt-4 bg-zinc-900 dark:bg-white text-white dark:text-black py-2 px-3 rounded-xl text-[10px] font-bold shadow-2xl z-10 whitespace-nowrap ${hoverIndex > chartData.length / 2 ? '-translate-x-full ml-[-10px]' : '-translate-x-0 ml-[10px]'}`}
                                    style={{ top: `${180 - (Math.max(5, (chartData[hoverIndex].count / Math.max(...chartData.map(c => c.count))) * 160))}px` }}
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="opacity-60 text-[8px] uppercase tracking-wider">{new Date(chartData[hoverIndex].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                        <span className="text-sm tracking-tight">{chartData[hoverIndex].count.toLocaleString()} {type}</span>
                                    </div>
                                    <div className={`absolute bottom-[-4px] border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent ${hoverIndex > chartData.length / 2 ? 'right-[10px]' : 'left-[10px]'} border-t-zinc-900 dark:border-t-white`} />
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-5 text-neutral-400 p-12 bg-neutral-50 dark:bg-white/[0.01] rounded-[30px] border border-dashed border-neutral-200 dark:border-white/10">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 opacity-10"><path d="M3 3v18h18M7 16l4-4 4 4 5-5" /></svg>
                        <p className="font-semibold tracking-[0.2em] text-[10px] text-center lowercase">no data found for this period</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-neutral-200 dark:border-white/5">
                <div className="px-5 py-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-100 dark:border-white/5 hover:border-orange-500/30 transition-colors">
                    <p className="text-[9px] font-semibold text-neutral-400 tracking-widest mb-1.5 lowercase">highest count</p>
                    <p className="text-xl font-semibold text-neutral-900 dark:text-white tracking-tighter">{chartData.length > 0 ? Math.max(...chartData.map(c => c.count)).toLocaleString() : 0}</p>
                </div>
                <div className="px-5 py-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-100 dark:border-white/5 hover:border-blue-500/30 transition-colors">
                    <p className="text-[9px] font-semibold text-neutral-400 tracking-widest mb-1.5 lowercase">time range</p>
                    <p className="text-xl font-semibold text-neutral-900 dark:text-white tracking-tighter">{chartData.length} Days</p>
                </div>
                <div className="px-5 py-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-100 dark:border-white/5 hover:border-emerald-500/30 transition-colors">
                    <p className="text-[9px] font-semibold text-neutral-400 tracking-widest mb-1.5 lowercase">status</p>
                    <p className="text-xl font-semibold text-emerald-500 tracking-tighter">live</p>
                </div>
            </div>
        </motion.div>
    );
}

const AdminStats: React.FC<AdminStatsProps> = ({ userProfile }) => {
    const [activeTab, setActiveTab] = useState<'monitor' | 'reports' | 'constructor' | 'inbound' | 'announcements'>('monitor');
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
    
    // Pagination and Sorting
    const [displayLimit, setDisplayLimit] = useState(10);
    const [sortBy, setSortBy] = useState<'username' | 'level' | 'xp'>('username');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');

    // Question State for Creator
    const [newQuestion, setNewQuestion] = useState({
        id: undefined as string | undefined,
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        difficulty: 'medium',
        type: 'mcq',
        questionType: 'MCQ',
        subject: '',
        unit: '',
        topic: '',
        explanation: '',
        starterCode: '',
        testCases: [] as { input: string; output: string; isHidden?: boolean }[]
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
    }, [activeTab]);

    // Load All Profiles for Tracker
    useEffect(() => {
        if (reportSubTab === 'tracker' && allProfiles.length === 0) {
            const fetchProfiles = async () => {
                setIsLoadingProfiles(true);
                try {
                    const profiles = await NexusServer.fetchAllProfiles();
                    // We no longer eager-fetch stats for every profile here to prevent rate limits
                    setAllProfiles(profiles);
                } catch (err) {
                    console.error("Profile Fetch Error:", err);
                } finally {
                    setIsLoadingProfiles(false);
                }
            };
            fetchProfiles();
        }
    }, [reportSubTab, allProfiles.length]);

    // Sorting and Filtering Logic
    const processedProfiles = useMemo(() => {
        let result = [...allProfiles];

        // 1. Search Filter
        if (userSearchText) {
            const query = userSearchText.toLowerCase();
            result = result.filter(u => 
                u.username?.toLowerCase().includes(query) || 
                u.registration_number?.includes(query)
            );
        }

        // 2. Role Filter
        if (filterRole === 'admin') {
            result = result.filter(u => u.is_admin);
        } else if (filterRole === 'user') {
            result = result.filter(u => !u.is_admin);
        }

        // 3. Sorting
        result.sort((a, b) => {
            let valA, valB;
            if (sortBy === 'level') {
                valA = a.level || 0;
                valB = b.level || 0;
            } else if (sortBy === 'xp') {
                valA = a.total_xp || 0;
                valB = b.total_xp || 0;
            } else {
                valA = (a.username || '').toLowerCase();
                valB = (b.username || '').toLowerCase();
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [allProfiles, userSearchText, filterRole, sortBy, sortOrder]);

    const paginatedProfiles = useMemo(() => {
        return processedProfiles.slice(0, displayLimit);
    }, [processedProfiles, displayLimit]);

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
        if (selectedUserActivity?.profile?.id === user.id) {
            setSelectedUserActivity(null);
            return;
        }
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
        console.log('AdminStats: handleCreateQuestion called', { id: newQuestion.id, payload: newQuestion });
        try {
            if (newQuestion.id) {
                console.log('AdminStats: Updating existing question');
                await NexusServer.updateQuestion(newQuestion as any);
            } else {
                console.log('AdminStats: Creating new question');
                await NexusServer.createQuestion(newQuestion);
            }
            setNewQuestion({
                id: undefined,
                question: '',
                options: ['', '', '', ''],
                correctAnswer: 0,
                difficulty: 'medium',
                type: 'mcq',
                questionType: 'MCQ',
                subject: '',
                unit: '',
                topic: '',
                explanation: '',
                starterCode: '',
                testCases: []
            });
            alert("Question database updated successfully!");
        } catch (err: any) {
            console.error('AdminStats: Failed to save question', err);
            alert("Failed to save to database: " + (err.message || "Unknown error"));
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
            console.error("Failed to resolve report", err);
            alert("Failed to resolve report");
        } finally {
            setActionLoading(null);
        }
    };

    const editReportedQuestion = (report: any) => {
        const q = report.question;
        if (!q) return;

        console.log('AdminStats: Editing reported question', q);
        setNewQuestion({
            id: q.id,
            question: q.question,
            options: Array.isArray(q.options) ? q.options : ['', '', '', ''],
            // Ensure index is treated as a Number so radio input checked={===idx} works
            correctAnswer: q.correct_answer !== undefined && q.correct_answer !== null ? Number(q.correct_answer) : (q.correctAnswer !== undefined ? Number(q.correctAnswer) : 0),
            difficulty: q.difficulty || 'medium',
            type: q.type || 'mcq',
            questionType: q.question_type || q.questionType || 'MCQ',
            subject: q.subject || report.subject || '',
            unit: q.unit || '',
            topic: q.topic || '',
            explanation: q.explanation || '',
            starterCode: q.starter_code || q.starterCode || '',
            testCases: q.test_cases || q.testCases || []
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
                    <p className="text-neutral-400 font-medium leading-relaxed">Administrator level authentication required to access the Command Center.</p>
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
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">Dashboard</h1>
                </div>

                <div className="flex p-1.5 bg-neutral-100 dark:bg-white/5 rounded-[20px] border border-neutral-200 dark:border-white/10 overflow-hidden">
                    {[
                        { id: 'monitor', label: 'Overview' },
                        { id: 'reports', label: 'Reports' },
                        { id: 'constructor', label: 'Editor' },
                        { id: 'announcements', label: 'Banners' },
                        { id: 'inbound', label: 'Feedbacks' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-semibold transition-all ${activeTab === tab.id
                                ? 'bg-neutral-900 dark:bg-white text-white dark:text-black shadow-xl shadow-black/10'
                                : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-white'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* High Level Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard 
                    label="Global Page Hits" 
                    value={data?.summary?.totalViews.toLocaleString() || '0'} 
                    sub="All Pages Combined" 
                    color="emerald"
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
                />
                <StatCard 
                    label="Raw Entry" 
                    value={data?.summary?.rawHits.toLocaleString() || '0'} 
                    sub="Website Raw Hits" 
                    color="orange"
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>}
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
                    color="orange"
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
                    onClick={() => setShowDetailedStats(showDetailedStats === 'Tickets' ? null : 'Tickets')}
                />
            </div>

            <AnimatePresence>
                {showDetailedStats && (
                    <DetailedDataView 
                        type={showDetailedStats}
                        value={
                            showDetailedStats === 'Traffic' ? data?.summary?.rawHits.toLocaleString() : 
                            showDetailedStats === 'Users' ? data?.summary?.visitors.toLocaleString() : 
                            showDetailedStats === 'Issues' ? data?.summary?.pendingReports : 
                            data?.summary?.totalFeedback.toLocaleString()
                        }
                        sub={
                            showDetailedStats === 'Traffic' ? 'Website Raw Hits' : 
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
                            <div className="glass-panel p-6 rounded-[24px] border border-neutral-200 dark:border-white/10 shadow-xl overflow-hidden relative">
                                <h3 className="text-[11px] font-semibold text-neutral-900 dark:text-white tracking-tight mb-6 border-b border-neutral-100 dark:border-white/5 pb-3 flex justify-between capitalize">
                                    Popular pages
                                    <span className="text-[9px] font-medium text-orange-500 lowercase opacity-60">overview</span>
                                </h3>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar scroll-smooth pr-2">
                                    {topPages.map((page: any, idx: number) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-bold tracking-tight">
                                                <span className="text-zinc-500 font-mono">{page.path}</span>
                                                <span className="text-zinc-900 dark:text-white">{page.views.toLocaleString()}</span>
                                            </div>
                                            <div className="h-2 w-full bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
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
                        <div className="glass-panel rounded-[24px] border border-neutral-200 dark:border-white/10 shadow-xl overflow-hidden">
                            <div className="p-4 border-b border-neutral-200 dark:border-white/5 flex items-center justify-between bg-neutral-50/50 dark:bg-white/[0.01]">
                                <h3 className="text-[11px] font-semibold text-neutral-900 dark:text-white tracking-tight capitalize">Activity log</h3>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-medium tracking-tight text-neutral-500">Live</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-[300px] overflow-y-auto no-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md z-10 text-zinc-500">
                                        <tr className="border-b border-zinc-100 dark:border-white/5">
                                            <th className="px-8 py-4 text-[10px] font-bold tracking-wider">Activity</th>
                                            <th className="px-8 py-4 text-[10px] font-bold tracking-wider">Total Times</th>
                                            <th className="px-8 py-4 text-[10px] font-bold tracking-wider text-right">Last Used</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                                        {data?.eventStats.map((event: any, idx: number) => (
                                            <tr key={idx} className="group hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="px-8 py-5">
                                                    <span className="text-xs font-bold text-zinc-700 dark:text-white/80 tracking-tight group-hover:text-orange-600 transition-colors">
                                                        {event.event_name.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg font-black text-zinc-900 dark:text-white">{event.count.toLocaleString()}</span>
                                                        <div className="h-1 w-12 bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                            <div className="h-full bg-orange-500" style={{ width: `${Math.min((event.count / 1000) * 100, 100)}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right font-mono text-[10px] text-zinc-500 uppercase">
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
                        <div className="flex gap-2 p-1 bg-neutral-100 dark:bg-white/5 rounded-2xl w-fit border border-neutral-200/50 dark:border-white/5 shadow-inner">
                            <button 
                                onClick={() => setReportSubTab('pending')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-medium capitalize transition-all duration-300 ${
                                    reportSubTab === 'pending' 
                                    ? 'bg-white dark:bg-white/10 text-neutral-900 dark:text-white shadow-xl' 
                                    : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    Issue Reports
                                    {reports.filter((r: any) => r.status === 'pending').length > 0 && (
                                        <span className="bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] animate-pulse">{reports.filter((r: any) => r.status === 'pending').length}</span>
                                    )}
                                </span>
                            </button>
                            <button 
                                onClick={() => setReportSubTab('tracker')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-medium capitalize transition-all duration-300 ${
                                    reportSubTab === 'tracker' 
                                    ? 'bg-white dark:bg-white/10 text-neutral-900 dark:text-white shadow-xl' 
                                    : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                                }`}
                            >
                                User tracker
                            </button>
                        </div>

                        {reportSubTab === 'pending' ? (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                                {reports.length > 0 ? reports.map((report, idx) => (
                                    <motion.div 
                                        key={report.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="glass-panel p-6 rounded-[24px] border border-zinc-200 dark:border-white/10 relative group bg-white/50 dark:bg-white/[0.02] hover:border-orange-500/30 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center font-bold text-xs border border-zinc-200/50 dark:border-white/5 text-zinc-600 dark:text-white/60">
                                                    {report.reporter?.username?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <h4 className="text-[13px] font-semibold text-zinc-800 dark:text-white tracking-tight">{report.reporter?.username || 'Guest'}</h4>
                                                    <p className="text-[10px] text-zinc-400 font-mono">{new Date(report.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-medium border ${
                                                report.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                            }`}>
                                                {report.status}
                                            </span>
                                        </div>

                                        <div className="p-4 bg-neutral-50 dark:bg-white/5 rounded-2xl border border-neutral-200 dark:border-white/5 mb-6">
                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                                    <p className="text-[11px] font-semibold text-orange-600/90 dark:text-orange-400 tracking-tight">
                                                        {report.reason}
                                                    </p>
                                                </div>
                                                <div className="text-[9px] font-mono text-neutral-400">
                                                    {report.subject || 'GUEST'} {report.topic && `• ${report.topic}`}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[12px] text-neutral-600 dark:text-neutral-400 leading-relaxed italic opacity-80">
                                                    {report.question?.question ? `"${report.question.question}"` : 'Question content could not be resolved.'}
                                                </p>
                                                {!report.question && (
                                                    <p className="text-[9px] text-neutral-500/60 font-medium">Link: {report.question_id || 'unlinked'}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            {report.status === 'pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => editReportedQuestion(report)}
                                                        className="py-3 rounded-xl bg-orange-600 text-white text-[11px] font-semibold hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/10"
                                                    >
                                                        Edit question
                                                    </button>
                                                    <button 
                                                        disabled={actionLoading === report.id}
                                                        onClick={() => resolveReport(report.id, 'resolved')}
                                                        className="py-3 rounded-xl bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 text-[11px] font-semibold hover:bg-emerald-500 hover:text-white transition-all"
                                                    >
                                                        Clear
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 rounded-3xl bg-zinc-50 dark:bg-white/[0.02] flex items-center justify-center text-zinc-300 dark:text-white/10 scale-110">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <p className="text-[13px] font-medium text-zinc-400 tracking-tight italic">All systems clear. No pending reports.</p>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-8"
                            >
                                {/* User Search Header */}
                                <div className="glass-panel p-8 rounded-[32px] border border-neutral-200 dark:border-white/10 shadow-2xl bg-gradient-to-br from-white/80 to-neutral-50 dark:from-white/[0.03] dark:to-transparent">
                                    <div className="max-w-2xl mx-auto space-y-6 text-center">
                                        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight capitalize">Global user tracking</h3>
                                        <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Search for any Verto by username or registration number to view their full activity spectrum.</p>
                                        
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-orange-500 transition-colors">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                                            </div>
                                            <input 
                                                type="text" 
                                                placeholder="Enter username or Reg No..." 
                                                className="w-full bg-white dark:bg-black/20 border border-neutral-100 dark:border-white/5 focus:border-orange-500/50 rounded-2xl py-4 pl-14 pr-6 text-sm font-semibold tracking-tight shadow-sm transition-all outline-none"
                                                value={userSearchText}
                                                onChange={(e) => handleUserSearch(e.target.value)}
                                            />
                                            {isSearchingUser && (
                                                <div className="absolute inset-y-0 right-5 flex items-center">
                                                    <div className="w-4 h-4 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                                                </div>
                                            )}

                                            {/* Quick Search Results */}
                                            {userSearchResults.length > 0 && !selectedUserActivity && (
                                                <div className="absolute top-full left-0 right-0 mt-3 p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 space-y-1">
                                                    {userSearchResults.map((user) => (
                                                        <button 
                                                            key={user.id}
                                                            onClick={() => selectUserForTracking(user)}
                                                            className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-white/5 rounded-xl transition-all group"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs capitalize">
                                                                    {user.username?.[0]}
                                                                </div>
                                                                <div className="text-left">
                                                                    <p className="text-[11px] font-semibold text-neutral-900 dark:text-white capitalize">{user.username}</p>
                                                                    <p className="text-[9px] font-medium text-neutral-400 lowercase">id: {user.registration_number}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <p className="text-[9px] font-semibold text-orange-500 capitalize px-2 py-0.5 bg-orange-500/10 rounded-full">View profile</p>
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-neutral-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Default User Table - Persistent Navigation */}
                                    <div className="mt-12 overflow-hidden">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 px-2">
                                                <div>
                                                    <h4 className="text-[11px] font-semibold text-neutral-400 flex items-center gap-2 mb-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                                        Global Verto Registry
                                                    </h4>
                                                    <p className="text-[10px] font-medium text-neutral-500">{processedProfiles.length} members found</p>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3">
                                                    {/* Role Filter */}
                                                    <div className="relative group/select min-w-[140px]">
                                                        <select 
                                                            value={filterRole}
                                                            onChange={(e) => setFilterRole(e.target.value as any)}
                                                            className="w-full appearance-none bg-neutral-100 dark:bg-black/40 border border-neutral-200 dark:border-white/5 rounded-xl px-4 py-2 text-[10px] font-semibold focus:outline-none cursor-pointer dark:text-neutral-400 hover:border-orange-500/30 transition-all"
                                                            style={{ colorScheme: 'dark' }}
                                                        >
                                                            <option value="all">All roles</option>
                                                            <option value="user">Regular users</option>
                                                            <option value="admin">Administrators</option>
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 group-hover/select:text-orange-500 transition-colors">
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M6 9l6 6 6-6" /></svg>
                                                        </div>
                                                    </div>

                                                    {/* Sort By */}
                                                    <div className="relative group/select min-w-[140px]">
                                                        <select 
                                                            value={sortBy}
                                                            onChange={(e) => setSortBy(e.target.value as any)}
                                                            className="w-full appearance-none bg-neutral-100 dark:bg-black/40 border border-neutral-200 dark:border-white/5 rounded-xl px-4 py-2 text-[10px] font-semibold focus:outline-none cursor-pointer dark:text-neutral-400 hover:border-orange-500/30 transition-all"
                                                            style={{ colorScheme: 'dark' }}
                                                        >
                                                            <option value="username">Sort by name</option>
                                                            <option value="level">Sort by level</option>
                                                            <option value="xp">Sort by XP</option>
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 group-hover/select:text-orange-500 transition-colors">
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M6 9l6 6 6-6" /></svg>
                                                        </div>
                                                    </div>

                                                    {/* Sort Order */}
                                                    <button 
                                                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                                        className="p-2 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/5 rounded-xl text-neutral-500 hover:text-orange-500 transition-colors"
                                                    >
                                                        {sortOrder === 'asc' ? (
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M3 4h13M3 8h9M3 12h5m7-8v16m0 0l-4-4m4 4l4-4" /></svg>
                                                        ) : (
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M3 4h13M3 8h9M3 12h5m7 8V4m0 16l-4-4m4 4l4-4" /></svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="glass-panel overflow-hidden border border-neutral-100 dark:border-white/5 rounded-[30px] shadow-xl">
                                                <div className="overflow-x-auto no-scrollbar">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead>
                                                            <tr className="bg-neutral-50/50 dark:bg-white/[0.01] border-b border-neutral-100 dark:border-white/5">
                                                                <th className="px-8 py-5 text-[10px] font-semibold text-neutral-400 capitalize tracking-tight">Verto profile</th>
                                                                <th className="px-8 py-5 text-[10px] font-semibold text-neutral-400 capitalize tracking-tight hidden sm:table-cell text-center">Reference</th>
                                                                <th className="px-8 py-5 text-[10px] font-semibold text-neutral-400 capitalize tracking-tight hidden md:table-cell">Affiliation</th>
                                                                <th className="px-8 py-5 text-[10px] font-semibold text-neutral-400 capitalize tracking-tight text-right">Access</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-neutral-50 dark:divide-white/5">
                                                            {isLoadingProfiles ? (
                                                                <tr>
                                                                    <td colSpan={4} className="py-24 text-center">
                                                                        <div className="flex flex-col items-center gap-4">
                                                                            <div className="w-12 h-12 border-4 border-zinc-100 dark:border-white/5 border-t-orange-500 rounded-full animate-spin" />
                                                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] font-mono animate-pulse">Synchronizing Records...</p>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ) : paginatedProfiles.length > 0 ? (
                                                                paginatedProfiles.map((user) => (
                                                                    <React.Fragment key={user.id}>
                                                                        <tr className={`group hover:bg-neutral-50/80 dark:hover:bg-white/[0.02] transition-all ${selectedUserActivity?.profile?.id === user.id ? 'bg-neutral-50 dark:bg-white/[0.01]' : ''}`}>
                                                                            <td className="px-8 py-5">
                                                                                <div className="flex items-center gap-5">
                                                                                    <div className="relative">
                                                                                        <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-neutral-600 dark:text-neutral-300 font-semibold text-sm shadow-sm overflow-hidden border border-neutral-200 dark:border-white/5 group-hover:scale-105 transition-transform">
                                                                                            {user.avatar_url ? (
                                                                                                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                                                            ) : (
                                                                                                user.username?.[0]?.toUpperCase() || 'V'
                                                                                            )}
                                                                                        </div>
                                                                                        {user.is_admin && (
                                                                                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 border-2 border-white dark:border-black flex items-center justify-center">
                                                                                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 tracking-tight">{user.username}</p>
                                                                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                                                                            <p className="text-[9px] font-semibold text-emerald-500 px-2 py-0.5 bg-emerald-500/10 rounded-full">Lvl {user.level || 1}</p>
                                                                                            <p className="text-[9px] font-medium text-neutral-400 font-mono tracking-tight">{(user.total_xp || 0).toLocaleString()} xp</p>
                                                                                            <p className="text-[9px] font-medium text-neutral-500 opacity-70 px-1 border-l border-neutral-200 dark:border-white/10">{user.is_admin ? 'Admin' : 'Verto'}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-8 py-5 hidden sm:table-cell text-center">
                                                                                <p className="text-[10px] font-medium text-neutral-600 dark:text-neutral-400 font-mono tracking-wider tabular-nums px-3 py-1 bg-neutral-100 dark:bg-white/5 rounded-lg inline-block">{user.registration_number || '----------'}</p>
                                                                            </td>
                                                                            <td className="px-8 py-5 hidden md:table-cell">
                                                                                <p className="text-[10px] font-medium text-neutral-500 truncate max-w-[180px]">{user.email || 'Email Protected'}</p>
                                                                            </td>
                                                                            <td className="px-8 py-5 text-right">
                                                                                <button 
                                                                                    onClick={() => selectUserForTracking(user)}
                                                                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-semibold transition-all ${selectedUserActivity?.profile?.id === user.id ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : 'bg-neutral-900 dark:bg-white/5 text-white dark:text-neutral-300 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 dark:hover:text-white'}`}
                                                                                >
                                                                                    {selectedUserActivity?.profile?.id === user.id ? 'Hide' : 'View'}
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                        {selectedUserActivity?.profile?.id === user.id && (
                                                                            <tr>
                                                                                <td colSpan={4} className="px-8 pb-10 pt-2 border-b border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.01]">
                                                                                    <motion.div 
                                                                                        initial={{ opacity: 0, height: 0 }}
                                                                                        animate={{ opacity: 1, height: 'auto' }}
                                                                                        className="overflow-hidden space-y-8 mt-4"
                                                                                    >
                                                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                                                                            <div className="p-4 bg-white dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5 rounded-2xl shadow-sm">
                                                                                                <p className="text-[8px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Level status</p>
                                                                                                <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-200 tracking-tight">Lvl {selectedUserActivity.profile?.level || 1}</p>
                                                                                            </div>
                                                                                            <div className="p-4 bg-white dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5 rounded-2xl shadow-sm">
                                                                                                <p className="text-[8px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Progression</p>
                                                                                                <p className="text-lg font-semibold text-emerald-500 tracking-tight">{(selectedUserActivity.profile?.total_xp || 0).toLocaleString()} <span className="text-[8px] opacity-60 ml-1">xp</span></p>
                                                                                            </div>
                                                                                            <div className="p-4 bg-white dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5 rounded-2xl shadow-sm">
                                                                                                <p className="text-[8px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Quizzes Taken</p>
                                                                                                <p className="text-lg font-semibold text-orange-500 tracking-tight">{selectedUserActivity.historyStats?.quizzesCompleted || 0} <span className="text-[8px] opacity-60 ml-1">tests</span></p>
                                                                                            </div>
                                                                                            <div className="p-4 bg-white dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5 rounded-2xl shadow-sm">
                                                                                                <p className="text-[8px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Study Focus</p>
                                                                                                <p className="text-lg font-semibold text-blue-500 tracking-tight">{(selectedUserActivity.historyStats?.studyTime / 3600).toFixed(1)} <span className="text-[8px] opacity-60 ml-1">hrs</span></p>
                                                                                            </div>
                                                                                            <div className="p-4 bg-white dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5 rounded-2xl shadow-sm">
                                                                                                <p className="text-[8px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Content Access</p>
                                                                                                <p className="text-lg font-semibold text-indigo-500 tracking-tight">{selectedUserActivity.historyStats?.filesAccessed || 0} <span className="text-[8px] opacity-60 ml-1">files</span></p>
                                                                                            </div>
                                                                                            <div className="p-4 bg-white dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5 rounded-2xl shadow-sm">
                                                                                                <p className="text-[8px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">GPA Simulations</p>
                                                                                                <p className="text-lg font-semibold text-purple-500 tracking-tight">{selectedUserActivity.historyStats?.cgpaCalculations || 0} <span className="text-[8px] opacity-60 ml-1">runs</span></p>
                                                                                            </div>
                                                                                            <div className="p-4 bg-white dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5 rounded-2xl shadow-sm">
                                                                                                <p className="text-[8px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Attendance Tracking</p>
                                                                                                <p className="text-lg font-semibold text-rose-500 tracking-tight">{selectedUserActivity.historyStats?.attendanceUpdates || 0} <span className="text-[8px] opacity-60 ml-1">updates</span></p>
                                                                                            </div>
                                                                                            <div className="p-4 bg-white dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5 rounded-2xl shadow-sm">
                                                                                                <p className="text-[8px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">Market/Social</p>
                                                                                                <p className="text-lg font-semibold text-teal-500 tracking-tight">{(selectedUserActivity.historyStats?.marketplacePosts || 0) + (selectedUserActivity.historyStats?.roommateRequests || 0)} <span className="text-[8px] opacity-60 ml-1">posts</span></p>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                                                            <div className="bg-white dark:bg-white/[0.01] p-6 rounded-3xl border border-neutral-200 dark:border-white/5">
                                                                                                <h5 className="text-[9px] font-semibold text-neutral-900 dark:text-neutral-400 uppercase tracking-widest mb-4 border-b border-neutral-100 dark:border-white/5 pb-3">Quiz performance (recent)</h5>
                                                                                                <div className="space-y-2">
                                                                                                    {selectedUserActivity.attempts?.length > 0 ? selectedUserActivity.attempts.slice(0, 5).map((att: any, i: number) => (
                                                                                                        <div key={i} className="flex justify-between items-center p-3 hover:bg-neutral-50 dark:hover:bg-white/[0.02] rounded-xl transition-all">
                                                                                                            <div>
                                                                                                                <p className="text-[10px] font-semibold text-neutral-800 dark:text-neutral-300 mb-0.5">{att.subject}</p>
                                                                                                                <p className="text-[8px] font-medium text-neutral-400">{new Date(att.created_at).toLocaleDateString()}</p>
                                                                                                            </div>
                                                                                                            <div className="text-right">
                                                                                                                <p className="text-[10px] font-semibold text-neutral-900 dark:text-neutral-200">{Math.round((att.score / att.total_questions) * 100)}%</p>
                                                                                                                <p className="text-[7px] font-semibold text-emerald-500">+{att.xp_gained} XP</p>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )) : (
                                                                                                        <p className="text-[10px] font-medium text-neutral-400 italic text-center py-6">No attempts logged.</p>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>

                                                                                            <div className="bg-white dark:bg-white/[0.01] p-6 rounded-3xl border border-neutral-200 dark:border-white/5">
                                                                                                <h5 className="text-[9px] font-semibold text-neutral-900 dark:text-neutral-400 uppercase tracking-widest mb-4 border-b border-neutral-100 dark:border-white/5 pb-3">Community activity</h5>
                                                                                                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 no-scrollbar">
                                                                                                    {selectedUserActivity.reports?.map((r: any, i: number) => (
                                                                                                        <div key={`rep-${i}`} className="flex gap-3 items-start border-l-2 border-red-500/30 pl-3 py-1">
                                                                                                            <div>
                                                                                                                <p className="text-[10px] font-medium text-neutral-800 dark:text-neutral-400 tracking-tight">Report: {r.reason}</p>
                                                                                                                <p className="text-[7px] text-neutral-500 font-semibold uppercase">{new Date(r.created_at).toLocaleDateString()}</p>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    ))}
                                                                                                    {selectedUserActivity.feedback?.map((f: any, i: number) => (
                                                                                                        <div key={`feed-${i}`} className="flex gap-3 items-start border-l-2 border-emerald-500/30 pl-3 py-1">
                                                                                                            <div>
                                                                                                                <p className="text-[10px] font-medium text-neutral-800 dark:text-neutral-400 tracking-tight">Feedback: {f.text.slice(0, 50)}...</p>
                                                                                                                <p className="text-[7px] text-neutral-500 font-semibold uppercase">{new Date(f.created_at).toLocaleDateString()}</p>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    ))}
                                                                                                    {selectedUserActivity.reports?.length === 0 && selectedUserActivity.feedback?.length === 0 && (
                                                                                                        <p className="text-[10px] font-medium text-neutral-400 italic text-center py-6">Zero social impact events.</p>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </motion.div>
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                    </React.Fragment>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan={4} className="py-24 text-center">
                                                                        <div className="flex flex-col items-center gap-3 opacity-30 grayscale">
                                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16"><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 10v4" /><path d="M10 12h4" /></svg>
                                                                            <p className="text-[10px] font-semibold text-neutral-400 tracking-wider">No records found</p>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Sync More Records Button */}
                                            {displayLimit < processedProfiles.length && (
                                                <div className="mt-8 flex justify-center pb-12">
                                                    <button 
                                                        onClick={() => setDisplayLimit(prev => prev + 10)}
                                                        className="px-8 py-3 rounded-2xl bg-white dark:bg-black/40 border border-neutral-200 dark:border-white/5 text-[10px] font-semibold text-neutral-600 dark:text-neutral-400 hover:text-orange-500 hover:border-orange-500/30 transition-all shadow-xl active:scale-95"
                                                    >
                                                        Sync more records ({processedProfiles.length - displayLimit} remaining)
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>


                            </motion.div>
                        )}
                    </div>
                )}

                {activeTab === 'constructor' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        <div className="lg:col-span-2 space-y-6">
                            <form onSubmit={handleCreateQuestion} className="glass-panel p-8 rounded-[40px] border border-neutral-200 dark:border-white/5 shadow-2xl space-y-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-2xl">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-200 tracking-tight capitalize">Question editor</h3>
                                        <p className="text-[10px] font-medium text-neutral-400 tracking-wider font-mono">{newQuestion.id ? `Editing record: ${newQuestion.id.slice(0, 12)}...` : 'Create a fresh record in the system'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input 
                                        type="text" 
                                        placeholder="Question ID (optional for creation)" 
                                        className="premium-input bg-neutral-50 dark:bg-white/5 px-5 py-3 rounded-2xl text-[11px] font-semibold tracking-tight md:col-span-2"
                                        value={newQuestion.id || ''}
                                        onChange={e => setNewQuestion({...newQuestion, id: e.target.value})}
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Subject code (CSE121)" 
                                        className="premium-input bg-neutral-50 dark:bg-white/5 px-5 py-3 rounded-2xl text-[11px] font-semibold uppercase tracking-tight"
                                        value={newQuestion.subject}
                                        onChange={e => setNewQuestion({...newQuestion, subject: e.target.value.toUpperCase()})}
                                        required
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Unit ID (1-6)" 
                                        className="premium-input bg-neutral-50 dark:bg-white/5 px-5 py-3 rounded-2xl text-[11px] font-semibold"
                                        value={newQuestion.unit}
                                        onChange={e => setNewQuestion({...newQuestion, unit: e.target.value})}
                                        required
                                    />
                                    <select
                                        className="premium-input bg-neutral-50 dark:bg-white/5 px-5 py-3 rounded-2xl text-[11px] font-semibold tracking-tight appearance-none"
                                        value={newQuestion.type}
                                        onChange={e => setNewQuestion({...newQuestion, type: e.target.value as any})}
                                        required
                                    >
                                        <option value="mcq">Type: MCQ</option>
                                        <option value="subjective">Type: Subjective</option>
                                        <option value="coding">Type: Coding</option>
                                    </select>
                                    <select
                                        className="premium-input bg-neutral-50 dark:bg-white/5 px-5 py-3 rounded-2xl text-[11px] font-semibold tracking-tight appearance-none"
                                        value={newQuestion.questionType}
                                        onChange={e => setNewQuestion({...newQuestion, questionType: e.target.value as any})}
                                        required
                                    >
                                        <option value="MCQ">QType: MCQ</option>
                                        <option value="PYQ">QType: PYQ</option>
                                        <option value="Case Study">QType: Case Study</option>
                                        <option value="Subjective">QType: Subjective</option>
                                    </select>
                                </div>

                                <textarea 
                                    placeholder="Type your question here..." 
                                    className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-[30px] px-6 py-5 text-[13px] font-medium h-32 focus:outline-none focus:border-orange-500/50 resize-none transition-all"
                                    value={newQuestion.question}
                                    onChange={e => setNewQuestion({...newQuestion, question: e.target.value})}
                                    required
                                />

                                {newQuestion.type === 'coding' && (
                                    <>
                                        <textarea 
                                            placeholder="Starter Code..." 
                                            className="w-full bg-neutral-900 border border-neutral-800 text-green-400 font-mono rounded-[30px] px-6 py-5 text-[12px] h-32 focus:outline-none focus:border-orange-500/50 resize-none transition-all"
                                            value={newQuestion.starterCode || ''}
                                            onChange={e => setNewQuestion({...newQuestion, starterCode: e.target.value})}
                                        />
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center px-4">
                                                <label className="text-[10px] font-bold text-zinc-500 tracking-wider">Test Cases</label>
                                                <button
                                                    type="button"
                                                    onClick={() => setNewQuestion({
                                                        ...newQuestion, 
                                                        testCases: [...(newQuestion.testCases || []), { input: '', output: '', isHidden: false }]
                                                    })}
                                                    className="bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 text-[9px] font-bold px-3 py-1.5 rounded-xl transition"
                                                >
                                                    + Add Test Case
                                                </button>
                                            </div>
                                            {(newQuestion.testCases || []).map((tc: any, tcIdx: number) => (
                                                <div key={tcIdx} className="flex gap-2 items-center">
                                                    <input
                                                        type="text"
                                                        placeholder="Input"
                                                        className="flex-1 bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl px-4 py-2.5 text-xs font-mono"
                                                        value={tc.input}
                                                        onChange={e => {
                                                            const nTcs = [...(newQuestion.testCases || [])];
                                                            nTcs[tcIdx].input = e.target.value;
                                                            setNewQuestion({...newQuestion, testCases: nTcs});
                                                        }}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Output"
                                                        className="flex-1 bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl px-4 py-2.5 text-xs font-mono"
                                                        value={tc.output}
                                                        onChange={e => {
                                                            const nTcs = [...(newQuestion.testCases || [])];
                                                            nTcs[tcIdx].output = e.target.value;
                                                            setNewQuestion({...newQuestion, testCases: nTcs});
                                                        }}
                                                    />
                                                    <label className="flex items-center gap-1.5 text-[9px] font-bold text-neutral-500 cursor-pointer pl-1 pr-2">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={tc.isHidden || false}
                                                            onChange={e => {
                                                                const nTcs = [...(newQuestion.testCases || [])];
                                                                nTcs[tcIdx].isHidden = e.target.checked;
                                                                setNewQuestion({...newQuestion, testCases: nTcs});
                                                            }}
                                                            className="w-3.5 h-3.5 accent-orange-500 rounded"
                                                        />
                                                        Hidden
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const nTcs = [...(newQuestion.testCases || [])];
                                                            nTcs.splice(tcIdx, 1);
                                                            setNewQuestion({...newQuestion, testCases: nTcs});
                                                        }}
                                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition"
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {newQuestion.type === 'mcq' && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-zinc-500 tracking-wider ml-4">Answer Options (Mark Correct)</label>
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
                                                    className="flex-1 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl px-6 py-3 text-xs font-bold transition-all group-hover:border-zinc-400 dark:group-hover:border-white/20"
                                                    value={opt}
                                                    onChange={e => {
                                                        const newOpts = [...newQuestion.options];
                                                        newOpts[idx] = e.target.value;
                                                        setNewQuestion({...newQuestion, options: newOpts});
                                                    }}
                                                    required={newQuestion.type === 'mcq'}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="w-full bg-neutral-900 dark:bg-white text-white dark:text-black font-bold text-[11px] py-4 rounded-2.5xl capitalize tracking-tight shadow-2xl shadow-black/20 hover:bg-orange-600 hover:text-white transition-all disabled:opacity-50"
                                >
                                    {isSaving ? 'Processing...' : 'Save record'}
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

                            <div className="glass-panel p-8 rounded-[40px] border border-zinc-200 dark:border-white/10 shadow-xl">
                                <h4 className="text-xs font-bold text-zinc-900 dark:text-white tracking-widest mb-6">Question Details</h4>
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-500 tracking-wider ml-1">Difficulty Level</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['easy', 'medium', 'hard'].map(level => (
                                                <button 
                                                    key={level}
                                                    type="button"
                                                    onClick={() => setNewQuestion({...newQuestion, difficulty: level})}
                                                    className={`py-2 rounded-xl text-[9px] font-semibold transition-all border ${
                                                        newQuestion.difficulty === level 
                                                        ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-600/20' 
                                                        : 'bg-neutral-100 dark:bg-black/40 text-neutral-500 border-transparent hover:border-neutral-300 dark:hover:border-white/10'
                                                    }`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-semibold text-neutral-500 tracking-tight ml-1">Topic</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Heapsort, Normalization" 
                                            className="w-full bg-neutral-100 dark:bg-black/40 border border-neutral-200 dark:border-white/5 rounded-2xl px-5 py-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all"
                                            value={newQuestion.topic}
                                            onChange={e => setNewQuestion({...newQuestion, topic: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-semibold text-neutral-500 tracking-tight ml-1">Explanation</label>
                                        <textarea 
                                            placeholder="Explain the correct answer here..." 
                                            className="w-full bg-neutral-100 dark:bg-black/40 border border-neutral-200 dark:border-white/5 rounded-2xl px-5 py-3 text-[10px] font-medium h-24 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all resize-none"
                                            value={newQuestion.explanation}
                                            onChange={e => setNewQuestion({...newQuestion, explanation: e.target.value})}
                                            required
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
                            <h3 className="text-xs font-semibold text-neutral-500 tracking-tight">Recent feedback</h3>
                            <button onClick={loadFeedback} className="text-[10px] font-semibold text-orange-600 hover:text-orange-500 transition-colors">Refresh feed</button>
                        </div>
                        {feedback.length > 0 ? (
                            feedback.map((f, i) => (
                                <motion.div 
                                    key={f.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass-panel p-6 rounded-[32px] border border-neutral-100 dark:border-white/5 shadow-xl relative"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-black font-semibold text-sm shadow-xl">
                                                {f.user?.username?.[0] || 'G'}
                                            </div>
                                            <div>
                                                <h4 className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-200 tracking-tight capitalize">{f.user?.username || 'Guest user'}</h4>
                                                <p className="text-[10px] font-mono text-neutral-400 lowercase">{f.user_email || 'anonymous submission'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-semibold text-neutral-500 tracking-tight">{new Date(f.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
                                            <p className="text-[9px] font-medium text-neutral-400 opacity-60">{new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                    <div className="p-6 rounded-[24px] bg-neutral-50 dark:bg-white/[0.02] border border-neutral-100 dark:border-white/5 mb-6">
                                        <p className="text-[13px] text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium italic">"{f.text}"</p>
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
                                                        className="w-full bg-neutral-50 dark:bg-black/40 border border-neutral-200 dark:border-white/5 rounded-[24px] p-5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-orange-500/30 min-h-[120px] resize-none transition-all"
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                    />
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => handleSendReply(f)}
                                                            disabled={isSendingReply || !replyText.trim()}
                                                            className="flex-1 bg-orange-600 text-white font-semibold text-[10px] py-3 rounded-2xl shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all disabled:opacity-50"
                                                        >
                                                            {isSendingReply ? 'Sending...' : 'Send reply'}
                                                        </button>
                                                        <button 
                                                            onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                                            className="px-6 bg-neutral-100 dark:bg-black/40 text-neutral-500 font-semibold text-[10px] py-3 rounded-2xl hover:bg-neutral-200 dark:hover:bg-white/5 transition-all"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <div className="flex items-center gap-4">
                                                    <button 
                                                        onClick={() => setReplyingTo(f.id)}
                                                        className="px-8 py-3 bg-neutral-100 dark:bg-black/40 border border-neutral-200 dark:border-white/5 text-neutral-600 dark:text-neutral-400 font-semibold text-[10px] tracking-tight rounded-2xl hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all shadow-sm"
                                                    >
                                                        {f.replies?.length > 0 ? 'Send another reply' : 'Reply to feedback'}
                                                    </button>
                                                    {f.replies?.length > 0 && (
                                                        <div className="flex items-center gap-2 group cursor-default px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                                Already replied ({f.replies.length} {f.replies.length === 1 ? 'time' : 'times'})
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 px-6 py-3 bg-orange-500/5 border border-orange-500/10 rounded-2xl w-fit">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                            <p className="text-[9px] font-semibold text-orange-600/80 tracking-tight">Guest feedback: Cannot reply</p>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-neutral-100/50 dark:bg-black/20 rounded-[40px] border-2 border-dashed border-neutral-200 dark:border-white/5">
                                <p className="text-xs font-semibold text-neutral-400">No feedback yet</p>
                                <p className="text-[10px] text-neutral-500 mt-2">Everything is quiet for now.</p>
                            </div>
                        )}
                    </motion.div>
                )}
                {activeTab === 'announcements' && (
                    <AdminAnnouncements />
                )}
            </AnimatePresence>

            {/* Health Overlay */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-neutral-900/10 dark:bg-black/40 p-10 rounded-[48px] border border-neutral-200 dark:border-white/5 shadow-2xl backdrop-blur-xl relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/5 blur-[120px] rounded-full -mr-64 -mt-64 group-hover:bg-orange-600/10 transition-all duration-1000" />
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                    <div className="md:col-span-4">
                        <h3 className="text-2xl font-semibold tracking-tight mb-2 text-neutral-900 dark:text-neutral-100">System status</h3>
                        <p className="text-xs text-neutral-500 font-medium tracking-tight">Active session analytics</p>
                        <div className="mt-8 p-4 bg-neutral-900 dark:bg-white/5 rounded-2xl border border-white/10 inline-flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                            <span className="text-xs font-semibold tracking-tight text-emerald-500">Live operational</span>
                        </div>
                    </div>
                    <div className="md:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
                        <div>
                            <p className="text-[10px] font-semibold text-neutral-500 tracking-tight mb-1">Page hits</p>
                            <p className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">{data?.summary?.totalViews.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold text-neutral-500 tracking-tight mb-1">Users</p>
                            <p className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">{data?.summary?.registered.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold text-neutral-500 tracking-tight mb-1">Events</p>
                            <p className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">{data?.eventStats.length || '0'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold text-neutral-500 tracking-tight mb-1">Uptime</p>
                            <p className="text-3xl font-semibold tracking-tight text-emerald-500">99.9%</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminStats;
