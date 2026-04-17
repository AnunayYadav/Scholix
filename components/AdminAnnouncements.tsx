import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NexusServer from '../services/nexusServer';
import { Announcement } from '../types';

const AdminAnnouncements: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: '',
        description: '',
        link_url: '',
        start_at: new Date().toISOString().slice(0, 16),
        end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        is_active: true
    });

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const loadAnnouncements = async () => {
        setLoading(true);
        try {
            const data = await NexusServer.fetchAllAppAnnouncements();
            setAnnouncements(data);
        } catch (err) {
            console.error('Error loading announcements:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                ...form,
                start_at: new Date(form.start_at).toISOString(),
                end_at: new Date(form.end_at).toISOString(),
            };
            await NexusServer.createAppAnnouncement(payload, imageFile || undefined);
            
            // Reset form
            setForm({
                title: '',
                description: '',
                link_url: '',
                start_at: new Date().toISOString().slice(0, 16),
                end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
                is_active: true
            });
            setImageFile(null);
            setPreviewUrl(null);
            
            await loadAnnouncements();
            alert('Announcement created successfully!');
        } catch (err) {
            console.error('Error creating announcement:', err);
            alert('Failed to create announcement');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleActive = async (id: string, current: boolean) => {
        try {
            await NexusServer.updateAppAnnouncement(id, { is_active: !current });
            setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, is_active: !current } : a));
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const deleteAnnouncement = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await NexusServer.deleteAppAnnouncement(id);
            setAnnouncements(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            console.error('Error deleting announcement:', err);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Create Form */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 rounded-[32px] border border-neutral-200 dark:border-white/5 relative overflow-hidden"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M12 19V5M5 12h14" /></svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Post New Announcement</h3>
                        <p className="text-xs text-neutral-500 font-medium">Create a dynamic banner for all users</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                className="w-full bg-neutral-100 dark:bg-black/20 border border-neutral-200 dark:border-white/5 rounded-2xl px-5 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                                placeholder="Enter a catchy title..."
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Description (Optional)</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                className="w-full bg-neutral-100 dark:bg-black/20 border border-neutral-200 dark:border-white/5 rounded-2xl px-5 py-3 text-sm font-medium h-24 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                                placeholder="Additional details..."
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Redirect Link (Optional)</label>
                            <input
                                type="url"
                                value={form.link_url}
                                onChange={e => setForm({ ...form, link_url: e.target.value })}
                                className="w-full font-mono bg-neutral-100 dark:bg-black/20 border border-neutral-200 dark:border-white/5 rounded-2xl px-5 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Start AT</label>
                                <input
                                    type="datetime-local"
                                    value={form.start_at}
                                    onChange={e => setForm({ ...form, start_at: e.target.value })}
                                    className="w-full bg-neutral-100 dark:bg-black/20 border border-neutral-200 dark:border-white/5 rounded-2xl px-5 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">End AT</label>
                                <input
                                    type="datetime-local"
                                    value={form.end_at}
                                    onChange={e => setForm({ ...form, end_at: e.target.value })}
                                    className="w-full bg-neutral-100 dark:bg-black/20 border border-neutral-200 dark:border-white/5 rounded-2xl px-5 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Cover Image</label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="announcement-image"
                                />
                                <label 
                                    htmlFor="announcement-image"
                                    className="flex flex-col items-center justify-center w-full h-40 bg-neutral-100 dark:bg-black/20 border-2 border-dashed border-neutral-200 dark:border-white/10 rounded-2xl cursor-pointer hover:border-orange-500/50 transition-all overflow-hidden"
                                >
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 mb-2 text-neutral-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                                            <span className="text-xs font-semibold text-neutral-500">Pick image or drop here</span>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full py-4 bg-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-orange-600/20 hover:bg-orange-700 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {isSaving ? 'Uploading...' : 'Publish Announcement'}
                        </button>
                    </div>
                </form>
            </motion.div>

            {/* List View */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h4 className="text-sm font-bold text-neutral-500 uppercase tracking-[0.2em]">Active History</h4>
                    <span className="text-[10px] bg-neutral-100 dark:bg-white/5 px-2 py-1 rounded-full text-neutral-400 font-bold">{announcements.length} TOTAL</span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-48 bg-neutral-100 dark:bg-white/5 rounded-[32px] animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnimatePresence>
                            {announcements.map((ann) => (
                                <motion.div
                                    key={ann.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="glass-panel p-6 rounded-[32px] border border-neutral-200 dark:border-white/5 flex flex-col gap-4 group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            {ann.image_url ? (
                                                <img src={ann.image_url} className="w-12 h-12 rounded-xl object-cover" alt="" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-neutral-400">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" /></svg>
                                                </div>
                                            )}
                                            <div>
                                                <h5 className="font-bold text-neutral-900 dark:text-white">{ann.title}</h5>
                                                <p className="text-[10px] text-neutral-500 font-medium">Until {new Date(ann.end_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => toggleActive(ann.id!, ann.is_active)}
                                                className={`p-2 rounded-lg transition-all ${ann.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}
                                            >
                                                {ann.is_active ? (
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M20 6L9 17l-5-5" /></svg>
                                                ) : (
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                                )}
                                            </button>
                                            <button 
                                                onClick={() => deleteAnnouncement(ann.id!)}
                                                className="p-2 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                            </button>
                                        </div>
                                    </div>

                                    {ann.description && (
                                        <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">{ann.description}</p>
                                    )}

                                    {ann.link_url && (
                                        <div className="flex items-center gap-2 text-[10px] text-orange-500 font-mono">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                            <span className="truncate">{ann.link_url}</span>
                                        </div>
                                    )}

                                    <div className="mt-auto pt-4 border-t border-neutral-100 dark:border-white/5 grid grid-cols-2 gap-4">
                                        <div className="text-[9px] uppercase tracking-wider font-bold text-neutral-400">
                                            Status: <span className={ann.is_active ? 'text-emerald-500' : 'text-red-500'}>{ann.is_active ? 'ACTIVE' : 'INACTIVE'}</span>
                                        </div>
                                        <div className="text-[9px] uppercase tracking-wider font-bold text-neutral-400 text-right">
                                            Created: {new Date(ann.created_at!).toLocaleDateString()}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAnnouncements;
