import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NexusServer from '../services/nexusServer';
import { Announcement } from '../types';

const AnnouncementModal: React.FC = () => {
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    useEffect(() => {
        const checkAnnouncements = async () => {
            try {
                const active = await NexusServer.fetchActiveAppAnnouncements();
                
                const target = active.find(a => 
                    localStorage.getItem(`modal_announcement_${a.id}_hidden`) !== 'true'
                );
                
                if (target) {
                    setAnnouncement(target);
                    setTimeout(() => setIsOpen(true), 500);
                }
            } catch (err) {
                console.error('Error fetching modal announcement:', err);
            }
        };

        checkAnnouncements();
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        if (dontShowAgain && announcement?.id) {
            localStorage.setItem(`modal_announcement_${announcement.id}_hidden`, 'true');
        }
    };

    if (!announcement || !announcement.image_url) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100000] flex flex-col items-center justify-center p-4">
                    {/* Dark minimalist backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    {/* Image Container */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative max-w-full sm:max-w-xl flex flex-col items-center"
                    >
                        {/* THE IMAGE (Clickable if link exists) */}
                        <div className="relative group rounded-3xl overflow-hidden shadow-2xl">
                            {announcement.link_url ? (
                                <a href={announcement.link_url} target="_blank" rel="noopener noreferrer">
                                    <img 
                                        src={announcement.image_url} 
                                        className="w-full h-auto max-h-[75vh] object-contain block hover:opacity-95 transition-opacity cursor-pointer"
                                        alt="Announcement"
                                    />
                                </a>
                            ) : (
                                <img 
                                    src={announcement.image_url} 
                                    className="w-full h-auto max-h-[75vh] object-contain block"
                                    alt="Announcement"
                                />
                            )}

                            {/* Minimal Close Button in the corner of image */}
                            <button 
                                onClick={handleClose}
                                className="absolute top-4 right-4 w-10 h-10 bg-black/40 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 transition-all z-10"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Bottom Utility Bar (Don't Show Again) */}
                        <div className="mt-4 flex items-center justify-center">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input 
                                        type="checkbox" 
                                        className="peer sr-only"
                                        checked={dontShowAgain}
                                        onChange={(e) => setDontShowAgain(e.target.checked)}
                                    />
                                    <div className="w-4 h-4 border border-white/20 rounded-sm peer-checked:bg-orange-500 peer-checked:border-orange-500 transition-all group-hover:border-white/40" />
                                    <svg className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5" /></svg>
                                </div>
                                <span className="text-[10px] text-neutral-500 font-medium tracking-tight group-hover:text-neutral-300 transition-colors">
                                    Don't show this again
                                </span>
                            </label>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AnnouncementModal;
