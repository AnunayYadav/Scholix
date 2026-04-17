import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NexusServer from '../services/nexusServer';
import { Announcement } from '../types';

const AnnouncementModal: React.FC = () => {
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const checkAnnouncements = async () => {
            console.log('DEBUG: Checking for announcements...');
            try {
                const active = await NexusServer.fetchActiveAppAnnouncements();
                console.log('DEBUG: Found active announcements:', active);
                
                if (active && active.length > 0) {
                    // Temporarily ignore localStorage to force it to show for testing
                    setAnnouncement(active[0]);
                    setIsOpen(true);
                    console.log('DEBUG: Modal should now be OPEN');
                } else {
                    console.log('DEBUG: No active announcements found in the specified time range.');
                }
            } catch (err) {
                console.error('DEBUG: Error details:', err);
            }
        };

        checkAnnouncements();
    }, []);

    const handleDismiss = (permanently: boolean = false) => {
        setIsOpen(false);
        if (permanently && announcement?.id) {
            localStorage.setItem(`modal_announcement_${announcement.id}_hidden`, 'true');
        }
    };

    if (!announcement || !isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-none">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/90 backdrop-blur-md pointer-events-auto"
                    onClick={() => handleDismiss(false)}
                />

                {/* Modal Content */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 50 }}
                    className="relative w-full max-w-lg bg-[#111] rounded-[40px] overflow-hidden border-2 border-orange-500 shadow-[0_0_50px_rgba(249,115,22,0.3)] pointer-events-auto"
                >
                    {/* Interactive Image Header */}
                    <div className="relative aspect-video w-full bg-neutral-900">
                        {announcement.image_url ? (
                            <img 
                                src={announcement.image_url} 
                                className="w-full h-full object-cover"
                                alt="Announcement"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/10 uppercase font-black text-4xl italic">No Image</div>
                        )}
                        
                        <button 
                            onClick={() => handleDismiss(false)}
                            className="absolute top-6 right-6 w-12 h-12 bg-black/60 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all border border-white/10"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="p-10 space-y-6">
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">{announcement.title}</h2>
                            {announcement.description && (
                                <p className="text-neutral-400 text-base mt-4 leading-relaxed font-medium">
                                    {announcement.description}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-4 pt-4">
                            {announcement.link_url && (
                                <a 
                                    href={announcement.link_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-5 bg-orange-600 hover:bg-orange-500 text-white text-center font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-orange-600/40 transition-all active:scale-95 no-underline"
                                >
                                    Action Required
                                </a>
                            )}

                            <div className="flex items-center justify-center">
                                <button 
                                    onClick={() => handleDismiss(true)}
                                    className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] hover:text-white transition-colors"
                                >
                                    Dismiss Forever
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AnnouncementModal;
