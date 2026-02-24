
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NexusServer from '../services/nexusServer';
import { NexusNotification, UserProfile } from '../types';

interface NotificationBellProps {
    userProfile: UserProfile | null;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ userProfile }) => {
    const [notifications, setNotifications] = useState<NexusNotification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!userProfile) return;

        const loadNotifications = async () => {
            const data = await NexusServer.fetchNotifications(userProfile.id);
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        };

        loadNotifications();

        const unsubscribe = NexusServer.subscribeToNotifications(userProfile.id, (newNotif) => {
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Optional: Play a subtle sound or show a toast
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(newNotif.title, { body: newNotif.message });
            }
        });

        return () => unsubscribe();
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
            // Mark all as read when opening? Or maybe specifically mark individual ones.
            // For simplicity, let's just mark all as read when they open the pane.
        }
    };

    const markAllAsRead = async () => {
        if (!userProfile) return;
        await NexusServer.markAllNotificationsAsRead(userProfile.id);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const handleNotificationClick = async (notification: NexusNotification) => {
        if (!notification.read) {
            await NexusServer.markNotificationAsRead(notification.id);
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }

        if (notification.link) {
            navigate(notification.link);
        }
        setIsOpen(false);
    };

    if (!userProfile) return null;

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
                        <h3 className="text-[12px] font-black text-slate-800 dark:text-white uppercase tracking-wider">Signals</h3>
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
                        {notifications.length === 0 ? (
                            <div className="px-8 py-12 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/10 mx-auto mb-4">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No New Signals</p>
                                <p className="text-[8px] text-slate-400/60 mt-1 uppercase tracking-wider">Everything is clear for now</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`w-full text-left px-5 py-4 flex gap-4 hover:bg-orange-600/5 dark:hover:bg-white/5 transition-all relative border-none bg-transparent group ${!notification.read ? 'bg-orange-600/[0.02] dark:bg-orange-600/[0.04]' : ''}`}
                                >
                                    <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center ${notification.type === 'success' ? 'bg-green-500/10 text-green-500' :
                                            notification.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                                                notification.type === 'error' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-orange-500/10 text-orange-600'
                                        }`}>
                                        {notification.type === 'success' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M20 6L9 17l-5-5" /></svg>}
                                        {notification.type === 'warning' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
                                        {notification.type === 'error' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>}
                                        {notification.type === 'info' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>}
                                    </div>
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-[11px] truncate">{notification.title}</p>
                                            {!notification.read && <div className="w-2 h-2 rounded-full bg-orange-600 shrink-0" />}
                                        </div>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{notification.message}</p>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                            {new Date(notification.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    <div className="px-5 pt-3 mt-2 border-t border-slate-100 dark:border-white/5">
                        <button className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-white/40 hover:text-orange-600 dark:hover:text-white hover:bg-orange-600/5 dark:hover:bg-white/5 transition-all border-none cursor-not-allowed">
                            View Audit Log
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
