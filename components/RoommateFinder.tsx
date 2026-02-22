import React, { useState, useEffect } from 'react';
import { RoommateRequest, UserProfile } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';
import { showToast } from './Toast.tsx';

const RoommateFinder: React.FC<{ userProfile: UserProfile | null }> = ({ userProfile }) => {
    const [requests, setRequests] = useState<RoommateRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPostModal, setShowPostModal] = useState(false);
    const [newRequest, setNewRequest] = useState({
        location: '',
        budget: '',
        preferences: '',
        gender_preference: 'Any'
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        const data = await NexusServer.fetchRoommateRequests();
        setRequests(data as RoommateRequest[]);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userProfile) { showToast("Sign in required.", "info"); return; }

        try {
            await NexusServer.createRoommateRequest({
                ...newRequest,
                user_id: userProfile.id,
                status: 'Active'
            });
            showToast("Request posted successfully!", "success");
            setShowPostModal(false);
            fetchRequests();
        } catch (err: any) {
            showToast("Error: " + err.message, "error");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="space-y-1">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tighter leading-none">
                        Roommate <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Finder</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Find your perfect match to share your space.</p>
                </div>
                <button
                    onClick={() => { if (!userProfile) showToast("Sign in required.", "info"); else setShowPostModal(true); }}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-xl shadow-orange-600/10 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
                >
                    Post Request
                </button>
            </header>

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-24 bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map(req => (
                        <div key={req.id} className="group p-6 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl rounded-[32px] border border-slate-200 dark:border-white/10 hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-600/5 transition-all duration-500 flex flex-col md:flex-row gap-6 items-start md:items-center">
                            <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-lg font-black shadow-lg shrink-0">
                                {req.user_username?.[0]?.toUpperCase() || 'V'}
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{req.user_username || 'Anonymous Verto'}</h4>
                                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-md text-[8px] font-black uppercase tracking-widest">{req.status}</span>
                                </div>
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">"{req.preferences}"</p>
                                <div className="flex flex-wrap gap-4 pt-1">
                                    <div className="flex items-center gap-2 text-slate-400 dark:text-white/30 skew-x-[-12deg]">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                        <span className="text-[9px] font-black uppercase tracking-widest">{req.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400 dark:text-white/30 skew-x-[-12deg]">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
                                        <span className="text-[9px] font-black uppercase tracking-widest">Budget: {req.budget}</span>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full md:w-auto px-5 py-3 bg-slate-100 dark:bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-white hover:bg-orange-500 hover:text-white transition-all border-none cursor-pointer">
                                Connect
                            </button>
                        </div>
                    ))}
                    {requests.length === 0 && <div className="py-20 text-center text-slate-400 font-black uppercase tracking-widest opacity-40 text-[10px]">No requests found yet. Be the first to post!</div>}
                </div>
            )}

            {showPostModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
                    <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-md rounded-[32px] p-6 relative shadow-2xl border border-slate-200 dark:border-white/10">
                        <button onClick={() => setShowPostModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors border-none bg-transparent cursor-pointer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 tracking-tighter uppercase">Find Roommate</h3>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-6">Tell us what you're looking for.</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Preferred Location</label>
                                    <input type="text" required value={newRequest.location} onChange={e => setNewRequest({ ...newRequest, location: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 px-4 py-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/10 outline-none focus:border-orange-500/50 text-slate-800 dark:text-white" placeholder="e.g. Law Gate" />
                                </div>
                                <div>
                                    <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Budget Range</label>
                                    <input type="text" required value={newRequest.budget} onChange={e => setNewRequest({ ...newRequest, budget: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 px-4 py-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/10 outline-none focus:border-orange-500/50 text-slate-800 dark:text-white" placeholder="e.g. 5k-7k" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Lifestyle Preferences</label>
                                <textarea required value={newRequest.preferences} onChange={e => setNewRequest({ ...newRequest, preferences: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 px-4 py-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/10 outline-none focus:border-orange-500/50 min-h-[80px] text-slate-800 dark:text-white" placeholder="e.g. Non-smoker, Vegan, Late sleeper..." />
                            </div>
                            <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-orange-600/20 active:scale-95 transition-all border-none cursor-pointer">Post Request</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoommateFinder;
