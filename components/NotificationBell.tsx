
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NexusServer from '../services/nexusServer';
import { NexusNotification, UserProfile } from '../types';

interface NotificationBellProps {
    userProfile: UserProfile | null;
}


const NotificationBell: React.FC<NotificationBellProps> = ({ userProfile }) => {
    const [personalNotifications, setPersonalNotifications] = useState<NexusNotification[]>([]);
    const [globalAnnouncements, setGlobalAnnouncements] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);
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

        // 3. Calculate Unread
        const lastSeenGlobal = localStorage.getItem('nexus_last_announcement_seen');
        const unreadGlobals = globals.filter(g => !lastSeenGlobal || new Date(g.created_at) > new Date(lastSeenGlobal)).length;
        const unreadPersonals = personals.filter(p => !p.read).length;

        setUnreadCount(unreadGlobals + unreadPersonals);
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
            setGlobalAnnouncements(prev => [newAnn, ...prev]);
            setUnreadCount(prev => prev + 1);
            triggerBrowserNotification(newAnn.title, newAnn.message);
        });

        // Subscribe to Personal (If Logged In)
        let unsubPersonal = () => { };
        if (userProfile) {
            unsubPersonal = NexusServer.subscribeToNotifications(userProfile.id, (newNotif) => {
                setPersonalNotifications(prev => [newNotif, ...prev]);
                setUnreadCount(prev => prev + 1);
                triggerBrowserNotification(newNotif.title, newNotif.message);
            });
        }

        return () => {
            unsubGlobal();
            unsubPersonal();
        };
    }, [userProfile]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => {
        setIsOpen(!isOpen);
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

        setUnreadCount(0);
    };

    const handleNotificationClick = async (item: any, isGlobal: boolean) => {
        if (!isGlobal && !item.read) {
            await NexusServer.markNotificationAsRead(item.id);
            setPersonalNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
        }

        if (item.link) {
            navigate(item.link);
        }
        setIsOpen(false);

        // Refresh count
        const lastSeen = localStorage.getItem('nexus_last_announcement_seen');
        const uG = globalAnnouncements.filter(g => !lastSeen || new Date(g.created_at) > new Date(lastSeen)).length;
        const uP = personalNotifications.filter(p => !p.read).length;
        setUnreadCount(uG + uP);
    };

    // Combine and sort
    const allNotifications = [
        ...globalAnnouncements.map(g => ({ ...g, isGlobal: true })),
        ...personalNotifications.map(p => ({ ...p, isGlobal: false }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className="p-2.5 rounded-full bg-slate-100 dark:bg-[#0a0a0a] text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-white transition-all border border-transparent dark:border-white/5 shadow-sm active:scale-90 relative"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-orange-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-black animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white/90 dark:bg-[#0a0a0a]/90 border border-slate-200 dark:border-white/10 rounded-[32px] shadow-[0_32px_64px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_64px_rgba(0,0,0,0.8)] overflow-hidden py-3 z-[60] animate-fade-in backdrop-blur-xl">
                    <div className="px-5 py-3 border-b border-slate-100 dark:border-white/5 mb-2 flex items-center justify-between">
                        <h3 className="text-[12px] font-black text-slate-800 dark:text-white uppercase tracking-wider">Updates</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline bg-transparent border-none p-0 cursor-pointer"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {allNotifications.length === 0 ? (
                            <div className="px-8 py-12 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/10 mx-auto mb-4">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Notifications</p>
                                <p className="text-[8px] text-slate-400/60 mt-1 uppercase tracking-wider">You're all caught up</p>
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
                                                    <p className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-[11px] truncate">{item.title}</p>
                                                </div>
                                                {isUnread && <div className="w-2 h-2 rounded-full bg-orange-600 shrink-0 mt-1" />}
                                            </div>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{item.message}</p>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                                {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    <div className="px-5 pt-3 mt-2 border-t border-slate-100 dark:border-white/5">
                        <button className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-white/40 hover:text-orange-600 dark:hover:text-white hover:bg-orange-600/5 dark:hover:bg-white/5 transition-all border-none cursor-not-allowed">
                            View All History
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
