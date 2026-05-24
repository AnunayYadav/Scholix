import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import NexusServer from '../services/nexusServer';
import { NexusNotification, UserProfile } from '../types';

interface NotificationBellProps {
    userProfile: UserProfile | null;
}


const NotificationBell: React.FC<NotificationBellProps> = ({ userProfile }) => {
    const [personalNotifications, setPersonalNotifications] = useState<NexusNotification[]>([]);
    const [globalAnnouncements, setGlobalAnnouncements] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedNotification, setSelectedNotification] = useState<any | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
        }, 250);
    };
    const dropdownRef = useRef<HTMLDivElement>(null);
    const detailModalRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const loadData = async () => {
        // 1. Fetch Global (Everyone)
        const globals = await NexusServer.fetchGlobalAnnouncements();
        setGlobalAnnouncements(globals);

        // 2. Fetch Personal (If Logged In)
        let personals: NexusNotification[] = [];
        if (userProfile) {
            personals = await NexusServer.fetchNotifications(userProfile.id);
            setPersonalNotifications(personals);
        }
    };

    const triggerBrowserNotification = (title: string, body: string) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '/logo.png' // Matches your site icon
            });
        }
    };

    useEffect(() => {
        // Request permission on mount
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        loadData();

        // Subscribe to Global (Everyone)
        const unsubGlobal = NexusServer.subscribeToGlobalAnnouncements((newAnn) => {
            setGlobalAnnouncements(prev => {
                if (prev.some(g => g.id === newAnn.id)) return prev;
                triggerBrowserNotification(newAnn.title, newAnn.message);
                return [newAnn, ...prev];
            });
        });

        // Subscribe to Personal (If Logged In)
        let unsubPersonal = () => { };
        if (userProfile) {
            unsubPersonal = NexusServer.subscribeToNotifications(userProfile.id, (newNotif) => {
                setPersonalNotifications(prev => {
                    if (prev.some(p => p.id === newNotif.id)) return prev;
                    triggerBrowserNotification(newNotif.title, newNotif.message);
                    return [newNotif, ...prev];
                });
            });
        }

        return () => {
            unsubGlobal();
            unsubPersonal();
        };
    }, [userProfile]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (detailModalRef.current && detailModalRef.current.contains(event.target as Node)) return;
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
            // Mark global as seen locally when closing/opening
            if (globalAnnouncements.length > 0) {
                localStorage.setItem('nexus_last_announcement_seen', globalAnnouncements[0].created_at);
            }
        }
    };

    const markAllAsRead = async () => {
        if (userProfile) {
            await NexusServer.markAllNotificationsAsRead(userProfile.id);
            setPersonalNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }

        if (globalAnnouncements.length > 0) {
            localStorage.setItem('nexus_last_announcement_seen', globalAnnouncements[0].created_at);
        }
    };

    const handleNotificationClick = async (item: any, isGlobal: boolean) => {
        if (!isGlobal && !item.read) {
            await NexusServer.markNotificationAsRead(item.id);
            setPersonalNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
        }

        setSelectedNotification(item);
        setIsDetailModalOpen(true);
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
        <>
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className="p-2.5 rounded-full bg-zinc-100 dark:bg-[#0a0a0a] text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-white transition-all border border-transparent dark:border-white/5 shadow-sm active:scale-90 relative"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-orange-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-black animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className={`absolute right-[-10px] sm:right-0 mt-3 w-[280px] sm:w-[300px] bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-[28px] shadow-[0_32px_64px_rgba(0,0,0,0.15)] dark:shadow-[0_32px_64px_rgba(0,0,0,0.6)] overflow-hidden py-3 z-[60] backdrop-blur-xl`}
                    >
                    <div className="px-5 py-3 border-b border-zinc-100 dark:border-white/5 mb-2 flex items-center justify-between">
                        <h3 className="text-[11px] font-bold text-zinc-800 dark:text-white tracking-tight">Updates</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-[10px] font-bold text-orange-600 hover:underline bg-transparent border-none p-0 cursor-pointer"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {allNotifications.length === 0 ? (
                            <div className="px-8 py-12 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400 dark:text-white/10 mx-auto mb-4">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                                </div>
                                <p className="text-[10px] font-bold text-zinc-400 tracking-tight">No notifications</p>
                                <p className="text-[10px] text-zinc-400/60 mt-1">You're all caught up</p>
                            </div>
                        ) : (
                            allNotifications.map((item) => {
                                const lastSeen = localStorage.getItem('nexus_last_announcement_seen');
                                const isUnread = item.isGlobal
                                    ? (!lastSeen || new Date(item.created_at) > new Date(lastSeen))
                                    : !item.read;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleNotificationClick(item, item.isGlobal)}
                                        className={`w-full text-left px-5 py-4 flex gap-4 hover:bg-orange-600/5 dark:hover:bg-white/5 transition-all relative border-none bg-transparent group ${isUnread ? 'bg-orange-600/[0.02] dark:bg-orange-600/[0.04]' : ''}`}
                                    >
                                        <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center ${item.type === 'success' ? 'bg-green-500/10 text-green-500' :
                                            item.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                                                item.type === 'error' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-orange-500/10 text-orange-600'
                                            }`}>
                                            {item.type === 'success' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M20 6L9 17l-5-5" /></svg>}
                                            {item.type === 'warning' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
                                            {item.type === 'error' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>}
                                            {item.type === 'info' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>}
                                        </div>
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex flex-col min-w-0">
                                                    <p className="font-bold text-zinc-800 dark:text-white tracking-tight text-[10px] truncate">{item.title}</p>
                                                </div>
                                                {isUnread && <div className="w-2 h-2 rounded-full bg-orange-600 shrink-0 mt-1" />}
                                            </div>
                                            <p className="text-[9px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">{item.message}</p>
                                            <p className="text-[9px] font-bold text-zinc-400 mt-1 opacity-60">
                                                {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    <div className="px-5 pt-3 mt-2 border-t border-zinc-100 dark:border-white/5">
                        <button className="w-full py-3 rounded-2xl bg-zinc-100 dark:bg-white/5 text-[10px] font-medium text-zinc-500 dark:text-white/40 hover:text-orange-600 dark:hover:text-white hover:bg-orange-600/5 dark:hover:bg-white/5 transition-all border-none cursor-not-allowed">
                            View All History
                        </button>
                    </div>
                </motion.div>
                )}
            </AnimatePresence>

        </div>

            {/* Notification Detail Modal - rendered via portal */}
            {createPortal(
                <AnimatePresence>
                    {isDetailModalOpen && selectedNotification && (
                        <div ref={detailModalRef} className="fixed inset-0 z-[9999] flex items-center justify-center p-6 sm:p-0">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsDetailModalOpen(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white dark:bg-[#0c0c0c] w-full max-w-sm rounded-[40px] border border-zinc-200 dark:border-white/10 shadow-3xl overflow-hidden relative z-10"
                            >
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                            selectedNotification.type === 'success' ? 'bg-green-500/10 text-green-500' :
                                            selectedNotification.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                                            selectedNotification.type === 'error' ? 'bg-red-500/10 text-red-500' :
                                            'bg-orange-500/10 text-orange-600'
                                        }`}>
                                            {selectedNotification.type === 'success' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6"><path d="M20 6L9 17l-5-5" /></svg>}
                                            {selectedNotification.type === 'warning' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
                                            {selectedNotification.type === 'error' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>}
                                            {selectedNotification.type === 'info' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>}
                                        </div>
                                        <button 
                                            onClick={() => setIsDetailModalOpen(false)}
                                            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors border-none bg-transparent text-zinc-400 group"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5 group-hover:rotate-90 transition-transform"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </div>
                                    
                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 leading-tight tracking-tight">
                                        {selectedNotification.title}
                                    </h2>
                                    <p className="text-[10px] font-bold text-zinc-400 mb-6 flex items-center gap-2">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                        {new Date(selectedNotification.created_at).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    
                                    <div className="bg-zinc-50 dark:bg-white/5 rounded-[24px] p-6 mb-8 border border-zinc-100 dark:border-white/5 max-h-[300px] overflow-y-auto no-scrollbar">
                                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                                            {selectedNotification.message}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        {selectedNotification.link && (
                                            <button 
                                                onClick={() => {
                                                    navigate(selectedNotification.link);
                                                    setIsDetailModalOpen(false);
                                                    handleClose();
                                                }}
                                                className="w-full py-4 bg-brand-primary dark:bg-brand-primary text-white font-bold text-xs rounded-2xl shadow-xl shadow-brand-primary/20 active:scale-95 transition-all border-none"
                                            >
                                                Access Resource
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => setIsDetailModalOpen(false)}
                                            className={`w-full py-4 text-zinc-500 dark:text-zinc-400 font-bold text-xs rounded-2xl active:scale-95 transition-all border-none ${selectedNotification.link ? 'bg-transparent' : 'bg-zinc-100 dark:bg-white/5'}`}
                                        >
                                            Close Portal
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

export default NotificationBell;
