import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoommateRequest, UserProfile } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';
import { showToast } from './Toast.tsx';

const RoommateFinder: React.FC<{ userProfile: UserProfile | null }> = ({ userProfile }) => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState<RoommateRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPostModal, setShowPostModal] = useState(false);
    const [showUserOnly, setShowUserOnly] = useState(false);
    const [editingRequest, setEditingRequest] = useState<RoommateRequest | null>(null);
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
        const mapped = data.map((req: any) => ({
            ...req,
            user_username: req.user?.username || req.user_username || 'Anonymous Verto',
            user_avatar: req.user?.avatar_url || req.user_avatar
        }));
        setRequests(mapped as RoommateRequest[]);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userProfile) { showToast("Sign in required.", "info"); return; }
        if (!newRequest.location || !newRequest.budget || !newRequest.preferences) {
            showToast("All fields are mandatory.", "info");
            return;
        }

        try {
            const requestData = {
                ...newRequest,
                user_id: userProfile.id,
                status: 'Active'
            };

            if (editingRequest) {
                await NexusServer.updateRoommateRequest(editingRequest.id, requestData);
                showToast("Request updated!", "success");
            } else {
                await NexusServer.createRoommateRequest(requestData);
                showToast("Request posted!", "success");
            }

            closeModal();
            fetchRequests();
        } catch (err: any) {
            showToast("Error: " + err.message, "error");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this request?")) return;
        try {
            await NexusServer.deleteRoommateRequest(id);
            showToast("Request deleted.", "success");
            fetchRequests();
        } catch (err: any) {
            showToast("Error: " + err.message, "error");
        }
    };

    const handleEdit = (req: RoommateRequest) => {
        setEditingRequest(req);
        setNewRequest({
            location: req.location,
            budget: req.budget,
            preferences: req.preferences,
            gender_preference: req.gender_preference || 'Any'
        });
        setShowPostModal(true);
    };

    const closeModal = () => {
        setShowPostModal(false);
        setEditingRequest(null);
        setNewRequest({ location: '', budget: '', preferences: '', gender_preference: 'Any' });
    };

    const filteredRequests = requests.filter(req => {
        return !showUserOnly || req.user_id === userProfile?.id;
    });

    return (
        <div className="max-w-[1440px] mx-auto px-6 py-10 pb-32">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="space-y-1 text-left">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tighter leading-none">
                        Roommate <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Finder</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Find your perfect match to share your space.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => navigate('/marketplace')}
                        className="p-3.5 rounded-2xl bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/5 text-slate-400 hover:text-orange-500 transition-all shadow-sm cursor-pointer flex items-center gap-2"
                        title="Back to Market"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-4 h-4"><polyline points="15 18 9 12 15 6" /></svg>
                        <span className="hidden lg:inline text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-orange-500">Market Hub</span>
                    </button>
                    <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block" />
                    <button
                        onClick={() => { if (!userProfile) showToast("Sign in required.", "info"); else setShowUserOnly(!showUserOnly); }}
                        className={`px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all border-none cursor-pointer flex items-center gap-2 ${showUserOnly ? 'bg-orange-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white'}`}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        {showUserOnly ? 'All Requests' : 'My Requests'}
                    </button>
                    <button
                        onClick={() => { if (!userProfile) showToast("Sign in required.", "info"); else setShowPostModal(true); }}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-xl shadow-orange-600/10 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
                    >
                        Post Request
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-24 bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map(req => (
                        <div key={req.id} className="group p-5 bg-white dark:bg-[#0c0c0c] rounded-[32px] border border-slate-200 dark:border-white/5 hover:border-orange-500/30 hover:shadow-xl transition-all duration-500 flex flex-col md:flex-row gap-5 items-start md:items-center relative overflow-hidden">
                            {req.user_id === userProfile?.id && (
                                <div className="absolute top-3 right-3 flex gap-1 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(req)} className="p-1.5 bg-white/90 dark:bg-black/80 rounded-lg text-blue-500 hover:text-blue-600 shadow-sm border-none cursor-pointer backdrop-blur-md">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                    </button>
                                    <button onClick={() => handleDelete(req.id)} className="p-1.5 bg-white/90 dark:bg-black/80 rounded-lg text-red-500 hover:text-red-600 shadow-sm border-none cursor-pointer backdrop-blur-md">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                    </button>
                                </div>
                            )}

                            <div className="w-10 h-10 rounded-[18px] bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-base font-black shadow-lg shrink-0">
                                {req.user_username?.[0]?.toUpperCase() || 'V'}
                            </div>

                            <div className="flex-1 space-y-1.5 text-left min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight">{req.user_username || 'Anonymous Verto'}</h4>
                                    <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-[7px] font-black uppercase tracking-widest">{req.status}</span>
                                </div>
                                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight italic line-clamp-1">"{req.preferences}"</p>
                                <div className="flex flex-wrap gap-4 pt-1">
                                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-white/20">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                        <span className="text-[8px] font-black uppercase tracking-widest">{req.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-white/20">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
                                        <span className="text-[8px] font-black uppercase tracking-widest">Budget: {req.budget}</span>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full md:w-auto px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-orange-600 dark:hover:bg-orange-600 hover:text-white dark:hover:text-white transition-all border-none cursor-pointer shadow-lg shadow-black/5">
                                Connect
                            </button>
                        </div>
                    ))}
                    {filteredRequests.length === 0 && <div className="py-20 text-center text-slate-400 font-black uppercase tracking-widest opacity-40 text-[10px]">No requests found yet.</div>}
                </div>
            )}

            {showPostModal && (
                <div className="fixed inset-0 z-[20000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
                    <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-md rounded-[32px] p-6 relative shadow-2xl border border-slate-200 dark:border-white/10 animate-slide-up">
                        <button onClick={closeModal} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors border-none bg-transparent cursor-pointer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 tracking-tighter uppercase">{editingRequest ? 'Edit Request' : 'Find Roommate'}</h3>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-6">Tell us what you're looking for.</p>

                        <form onSubmit={handleSubmit} className="space-y-4 text-left">
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
                            <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-orange-600/20 active:scale-95 transition-all border-none cursor-pointer">
                                {editingRequest ? 'Save Changes' : 'Post Request'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoommateFinder;
