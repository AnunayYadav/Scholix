import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Plus, Trash2, CheckCircle2, XCircle, ExternalLink, Image as ImageIcon, Calendar, Link as LinkIcon } from 'lucide-react';
import NexusServer from '../services/nexusServer';
import { Announcement } from '../types';

const AdminAnnouncements: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const getLocalISOString = (date: Date) => {
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offset).toISOString().slice(0, 16);
    };

    const [form, setForm] = useState({
        title: '',
        description: '',
        link_url: '',
        start_at: getLocalISOString(new Date()),
        end_at: getLocalISOString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
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
        if (!form.title.trim()) {
            alert('Please enter an announcement title');
            return;
        }
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
                start_at: getLocalISOString(new Date()),
                end_at: getLocalISOString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
                is_active: true
            });
            setImageFile(null);
            setPreviewUrl(null);
            
            await loadAnnouncements();
            alert('Announcement published successfully!');
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
        <div className="space-y-8 pb-16">
            {/* Create Form */}
            <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-white/[0.08] p-6 sm:p-8 rounded-3xl shadow-xs relative overflow-hidden"
            >
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-100 dark:border-white/[0.06]">
                    <div className="w-11 h-11 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/20">
                        <Megaphone className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white tracking-tight">Create Splash Banner</h3>
                        <p className="text-xs text-zinc-500 font-medium">Broadcast an in-app banner or high-impact modal alert across the platform</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-zinc-500 tracking-tight">Banner Title *</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                className="w-full bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-white font-medium focus:outline-none focus:border-orange-500 transition-all placeholder:text-zinc-400"
                                placeholder="e.g. End-Term PYQs Now Live!"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-zinc-500 tracking-tight">Description</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                className="w-full bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-white font-medium focus:outline-none focus:border-orange-500 transition-all placeholder:text-zinc-400 resize-none h-24"
                                placeholder="Details about this announcement, release or event..."
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-zinc-500 tracking-tight">Action URL (Optional)</label>
                            <div className="relative">
                                <LinkIcon className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="url"
                                    value={form.link_url}
                                    onChange={e => setForm({ ...form, link_url: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500 transition-all placeholder:text-zinc-400"
                                    placeholder="https://scholix.org/lpu/quiz"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-zinc-500 tracking-tight">Active From</label>
                                <input
                                    type="datetime-local"
                                    value={form.start_at}
                                    onChange={e => setForm({ ...form, start_at: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 font-medium focus:outline-none focus:border-orange-500 transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-zinc-500 tracking-tight">Active Until</label>
                                <input
                                    type="datetime-local"
                                    value={form.end_at}
                                    onChange={e => setForm({ ...form, end_at: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 font-medium focus:outline-none focus:border-orange-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-zinc-500 tracking-tight">Poster / Image (Optional)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="announcement-image-input"
                            />
                            <label 
                                htmlFor="announcement-image-input"
                                className="flex flex-col items-center justify-center w-full h-28 bg-zinc-50 dark:bg-white/[0.03] border border-dashed border-zinc-300 dark:border-white/[0.12] rounded-2xl cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/[0.02] transition-all overflow-hidden relative group"
                            >
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-1.5 text-zinc-400 group-hover:text-orange-500 transition-colors">
                                        <ImageIcon className="w-6 h-6" />
                                        <span className="text-[11px] font-medium">Click to select banner graphic</span>
                                    </div>
                                )}
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full py-3 bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-semibold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{isSaving ? 'Publishing...' : 'Publish Announcement'}</span>
                        </button>
                    </div>
                </form>
            </motion.div>

            {/* List View */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Live & Scheduled Banners</h4>
                    <span className="text-[11px] bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200/80 dark:border-white/[0.08] px-2.5 py-0.5 rounded-full text-zinc-600 dark:text-zinc-400 font-semibold">{announcements.length} Total</span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2].map(i => (
                            <div key={i} className="h-40 bg-zinc-100 dark:bg-white/[0.03] rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl">
                        <Megaphone className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">No active announcements</p>
                        <p className="text-[11px] text-zinc-400 mt-1">Create one above to display banners to your users</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence>
                            {announcements.map((ann) => (
                                <motion.div
                                    key={ann.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-white/[0.08] p-5 rounded-2xl shadow-xs flex flex-col justify-between group hover:border-zinc-300 dark:hover:border-white/[0.14] transition-all"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-3">
                                                {ann.image_url ? (
                                                    <img src={ann.image_url} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-zinc-200/60 dark:border-white/[0.08]" alt="" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20">
                                                        <Megaphone className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h5 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-white line-clamp-1">{ann.title}</h5>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>Until {new Date(ann.end_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button 
                                                    onClick={() => toggleActive(ann.id!, ann.is_active)}
                                                    className={`p-1.5 rounded-lg transition-all ${ann.is_active ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-white/[0.05] text-zinc-400'}`}
                                                    title={ann.is_active ? "Deactivate" : "Activate"}
                                                >
                                                    {ann.is_active ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                                </button>
                                                <button 
                                                    onClick={() => deleteAnnouncement(ann.id!)}
                                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                    title="Delete Announcement"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {ann.description && (
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-3">{ann.description}</p>
                                        )}

                                        {ann.link_url && (
                                            <a 
                                                href={ann.link_url} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 text-[11px] text-orange-600 dark:text-orange-400 hover:underline font-mono mb-3 truncate max-w-full"
                                            >
                                                <ExternalLink className="w-3 h-3 shrink-0" />
                                                <span className="truncate">{ann.link_url}</span>
                                            </a>
                                        )}
                                    </div>

                                    <div className="pt-3 border-t border-zinc-100 dark:border-white/[0.06] flex items-center justify-between text-[10px]">
                                        <span className={`font-semibold px-2 py-0.5 rounded-md ${ann.is_active ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-white/[0.05] text-zinc-500'}`}>
                                            {ann.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                        <span className="text-zinc-400">Created: {new Date(ann.created_at!).toLocaleDateString()}</span>
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
