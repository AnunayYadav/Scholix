import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '../stores/notificationStore';
import { UserProfile } from '../types';

interface NotificationBellProps {
    userProfile: UserProfile | null;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ userProfile }) => {
    const { 
        personalNotifications, 
        globalAnnouncements, 
        markAllAsRead, 
        markNotificationAsRead 
    } = useNotificationStore();

    const [isOpen, setIsOpen] = useState(false);
    const [, setIsClosing] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
            setExpandedId(null);
        }, 200);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                handleClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Recalculate unreadCount when announcements or personal notifications change, de-duplicating by title + message
    useEffect(() => {
        const lastSeenGlobal = localStorage.getItem('nexus_last_announcement_seen');
        const combined = [
            ...globalAnnouncements.map(g => ({ ...g, isGlobal: true })),
            ...personalNotifications.map(p => ({ ...p, isGlobal: false }))
        ];
        
        const seen = new Set<string>();
        const unique = combined.filter(item => {
            const key = `${item.title.trim()}|${item.message.trim()}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        const unread = unique.filter(item => {
            if (item.isGlobal) {
                return !lastSeenGlobal || new Date(item.created_at) > new Date(lastSeenGlobal);
            } else {
                return !item.read;
            }
        }).length;

        setUnreadCount(unread);
    }, [globalAnnouncements, personalNotifications]);

    const handleToggle = () => {
        if (isOpen) {
            handleClose();
        } else {
            setIsOpen(true);
        }
        if (!isOpen && unreadCount > 0) {
            // Mark global as seen locally when opening
            if (globalAnnouncements.length > 0) {
                localStorage.setItem('nexus_last_announcement_seen', globalAnnouncements[0].created_at);
            }
        }
    };

    const handleMarkAllAsRead = async () => {
        if (userProfile) {
            await markAllAsRead(userProfile.id);
        }

        if (globalAnnouncements.length > 0) {
            localStorage.setItem('nexus_last_announcement_seen', globalAnnouncements[0].created_at);
        }
    };

    const handleNotificationClick = async (item: any, isGlobal: boolean) => {
        if (!isGlobal && !item.read) {
            await markNotificationAsRead(item.id);
        }

        // Toggle expand inline
        setExpandedId(prev => (prev === item.id ? null : item.id));
    };

    // Combine and sort, de-duplicating by title + message
    const allNotifications = useMemo(() => {
        const combined = [
            ...globalAnnouncements.map(g => ({ ...g, isGlobal: true })),
            ...personalNotifications.map(p => ({ ...p, isGlobal: false }))
        ];
        
        const uniqueNotifications: typeof combined = [];
        const seen = new Set<string>();

        combined.forEach(item => {
            const key = `${item.title.trim()}|${item.message.trim()}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueNotifications.push(item);
            }
        });

        return uniqueNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [globalAnnouncements, personalNotifications]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className="w-10 h-10 rounded-xl bg-white dark:bg-[#17171a] text-zinc-600 dark:text-zinc-400 hover:text-brand-primary dark:hover:text-white transition-all border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 active:scale-95 relative flex items-center justify-center cursor-pointer"
                aria-label="Notifications"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-[18px] h-[18px]">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-brand-primary rounded-full border-2 border-white dark:border-[#17171a] animate-pulse" />
                )}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.96, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 6 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-[-10px] sm:right-0 mt-2 w-[310px] sm:w-[340px] bg-white dark:bg-[#141416] border border-zinc-200/40 dark:border-white/[0.03] rounded-2xl shadow-2xl overflow-hidden z-[60]"
                    >
                    {/* Clean Header */}
                    <div className="px-3.5 py-2.5 border-b border-zinc-100/40 dark:border-white/[0.025] flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-zinc-900 dark:text-white tracking-tight">Updates</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-[11px] font-medium text-brand-primary hover:text-brand-primary/80 transition-colors bg-transparent border-none p-0 cursor-pointer"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Inline Expandable Notification List */}
                    <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-100/40 dark:divide-white/[0.02] custom-scrollbar">
                        {allNotifications.length === 0 ? (
                            <div className="px-6 py-8 text-center">
                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">No new updates</p>
                            </div>
                        ) : (
                            allNotifications.map((item) => {
                                const lastSeen = localStorage.getItem('nexus_last_announcement_seen');
                                const isUnread = item.isGlobal
                                    ? (!lastSeen || new Date(item.created_at) > new Date(lastSeen))
                                    : !item.read;
                                const isExpanded = expandedId === item.id;

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => handleNotificationClick(item, item.isGlobal)}
                                        className={`w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 hover:bg-zinc-50/60 dark:hover:bg-white/[0.025] transition-colors group cursor-pointer ${
                                            isExpanded ? 'bg-zinc-50/50 dark:bg-white/[0.02]' : ''
                                        } ${isUnread ? 'bg-brand-primary/[0.02] dark:bg-brand-primary/[0.03]' : ''}`}
                                    >
                                        <div className={`w-6 h-6 rounded-md shrink-0 mt-0.5 flex items-center justify-center ${
                                            item.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                                            item.type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                                            item.type === 'error' ? 'bg-rose-500/10 text-rose-400' :
                                            'bg-orange-500/10 text-orange-400'
                                        }`}>
                                            {item.type === 'success' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12" /></svg>}
                                            {item.type === 'warning' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>}
                                            {item.type === 'error' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>}
                                            {item.type === 'info' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="6" r="1.5" /><circle cx="12" cy="18" r="1.5" /></svg>}
                                        </div>

                                        <div className="flex flex-col min-w-0 flex-1">
                                            {/* Header Row */}
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <p className={`font-semibold text-zinc-800 dark:text-zinc-200 text-xs ${isExpanded ? '' : 'truncate'} group-hover:text-brand-primary transition-colors`}>
                                                        {item.title}
                                                    </p>
                                                    {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />}
                                                </div>
                                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0 font-medium">
                                                    {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>

                                            {/* Message Content: Collapsed (1-line preview) vs Expanded (Full text + action) */}
                                            {!isExpanded ? (
                                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 leading-normal mt-0.5 font-normal">
                                                    {item.message}
                                                </p>
                                            ) : (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.18, ease: "easeOut" }}
                                                    className="mt-1.5 pt-1.5 border-t border-zinc-100/40 dark:border-white/[0.02]"
                                                >
                                                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal whitespace-pre-line">
                                                        {item.message}
                                                    </p>
                                                    
                                                    <div className="flex items-center justify-between mt-2.5 pt-1">
                                                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                                                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>

                                                        {item.link && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(item.link);
                                                                    handleClose();
                                                                }}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-primary text-white text-[10px] font-semibold hover:bg-orange-600 active:scale-95 transition-all border-none cursor-pointer"
                                                            >
                                                                <span>Open</span>
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><polyline points="9 18 15 12 9 6" /></svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
