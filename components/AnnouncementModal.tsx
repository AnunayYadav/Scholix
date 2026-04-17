import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NexusServer from '../services/nexusServer';
import { Announcement } from '../types';

const AnnouncementModal: React.FC = () => {
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const checkAnnouncements = async () => {
            try {
                const active = await NexusServer.fetchActiveAppAnnouncements();
                
                // Find first that ISN'T hidden
                const target = active.find(a => 
                    localStorage.getItem(`modal_announcement_${a.id}_hidden`) !== 'true'
                );
                
                if (target) {
                    setAnnouncement(target);
                    // Slight delay for premium feel
                    setTimeout(() => setIsOpen(true), 800);
                }
            } catch (err) {
                console.error('Error fetching modal announcement:', err);
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

    if (!announcement) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6 lg:p-8">
                    {/* Darker, deeper backdrop for focus */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/85 backdrop-blur-[10px]"
                        onClick={() => handleDismiss(false)}
                    />

                    {/* Main Container: No more fixed height, width responsive */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                        className="relative w-full max-w-[500px] bg-[#111] rounded-[32px] overflow-hidden border border-white/10 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)]"
                    >
                        {/* Image Layer: Uses h-auto to prevent cropping */}
                        <div className="relative w-full">
                            {announcement.image_url ? (
                                <img 
                                    src={announcement.image_url} 
                                    className="w-full h-auto max-h-[65vh] object-contain bg-black/20"
                                    alt="Announcement"
                                />
                            ) : (
                                <div className="aspect-video w-full flex items-center justify-center bg-white/5 uppercase font-black text-2xl tracking-tighter text-white/10 italic">Announcement</div>
                            )}

                            {/* Floating Close Button */}
                            <button 
                                onClick={() => handleDismiss(false)}
                                className="absolute top-4 right-4 w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all border border-white/5 active:scale-90"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Text and Actions */}
                        <div className="p-6 sm:p-10 space-y-6 bg-gradient-to-b from-transparent to-black/40">
                            <div className="space-y-2">
                                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter leading-tight uppercase italic drop-shadow-lg">
                                    {announcement.title}
                                </h2>
                                {announcement.description && (
                                    <p className="text-neutral-400 text-sm font-medium leading-relaxed opacity-80">
                                        {announcement.description}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 py-2">
                                {announcement.link_url && (
                                    <a 
                                        href={announcement.link_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white text-center font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-orange-600/20 transition-all active:scale-[0.98] no-underline flex items-center justify-center gap-2 group"
                                    >
                                        Explore Now
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 transition-transform group-hover:translate-x-1"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                    </a>
                                )}

                                <button 
                                    onClick={() => handleDismiss(true)}
                                    className="w-full py-3 text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] hover:text-white transition-all text-center border border-white/5 rounded-xl hover:bg-white/5 active:scale-95"
                                >
                                    Dismiss Forever
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AnnouncementModal;
