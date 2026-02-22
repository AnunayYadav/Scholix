import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketplaceItem, UserProfile } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';
import { showToast } from './Toast.tsx';

const MarketplaceHub: React.FC<{ userProfile: UserProfile | null }> = ({ userProfile }) => {
    const navigate = useNavigate();
    const [items, setItems] = useState<MarketplaceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [showSellModal, setShowSellModal] = useState(false);
    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        price: '',
        category: 'Books',
        condition: 'Good'
    });

    const categories = ['All', 'Books', 'Electronics', 'Cycles', 'Hostel Essentials', 'Others'];

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        const data = await NexusServer.fetchMarketplaceItems();
        setItems(data as MarketplaceItem[]);
        setLoading(false);
    };

    const handleSellSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userProfile) { showToast("Sign in required to sell.", "info"); return; }

        try {
            await NexusServer.createMarketplaceItem({
                ...newItem,
                price: parseFloat(newItem.price),
                seller_id: userProfile.id,
                status: 'Available',
                images: [] // Image upload logic can be added later
            });
            showToast("Item listed successfully!", "success");
            setShowSellModal(false);
            fetchItems();
        } catch (err: any) {
            showToast("Error: " + err.message, "error");
        }
    };

    const filteredItems = filter === 'All' ? items : items.filter(item => item.category === filter);

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="space-y-1">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                        LPU <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Market</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Second-hand treasures for every Verto.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/roommate')}
                        className="px-6 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-orange-500/10 hover:text-orange-600 transition-all border-none cursor-pointer flex items-center gap-2"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        Find Roommates
                    </button>
                    <button
                        onClick={() => { if (!userProfile) showToast("Sign in required.", "info"); else setShowSellModal(true); }}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-xl shadow-orange-600/10 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
                    >
                        Post an Ad
                    </button>
                </div>
            </header>

            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap border-none cursor-pointer ${filter === cat ? 'bg-orange-600 text-white shadow-md' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40 hover:bg-orange-500/10'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-56 bg-slate-100 dark:bg-white/5 rounded-[24px] animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredItems.map(item => (
                        <div key={item.id} className="group p-5 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl rounded-[32px] border border-slate-200 dark:border-white/10 hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-600/5 transition-all duration-500 flex flex-col">
                            <div className="relative aspect-square mb-4 rounded-[20px] overflow-hidden bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                                {item.images && item.images.length > 0 ? (
                                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-slate-300 dark:text-white/10"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                                )}
                                <div className="absolute top-3 right-3 px-2 py-1 bg-orange-600 text-white rounded-md text-[8px] font-black uppercase tracking-widest shadow-lg leading-none">
                                    ₹{item.price}
                                </div>
                            </div>

                            <div className="space-y-2 flex-1">
                                <div className="flex justify-between items-start">
                                    <span className="text-[8px] font-black text-orange-600 uppercase tracking-widest">{item.category}</span>
                                    <span className="text-[8px] font-black text-slate-400 dark:text-white/20 uppercase tracking-widest">{item.condition}</span>
                                </div>
                                <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tighter leading-tight uppercase group-hover:text-orange-500 transition-colors line-clamp-2">{item.title}</h4>
                                <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400/60 leading-relaxed line-clamp-3">{item.description}</p>
                            </div>

                            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-orange-600/10 flex items-center justify-center text-orange-600 font-black text-[9px]">
                                        {item.seller_username?.[0]?.toUpperCase() || 'V'}
                                    </div>
                                    <span className="text-[8px] font-black text-slate-800 dark:text-white uppercase tracking-widest">{item.seller_username || 'Anonymous Verto'}</span>
                                </div>
                                <button className="p-1.5 text-slate-400 hover:text-orange-600 transition-colors border-none bg-transparent cursor-pointer">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showSellModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
                    <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-md rounded-[32px] p-6 relative shadow-2xl border border-slate-200 dark:border-white/10">
                        <button onClick={() => setShowSellModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors border-none bg-transparent cursor-pointer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 tracking-tighter uppercase">List Item</h3>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-6">Ready to pass your gear to the next Verto?</p>

                        <form onSubmit={handleSellSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Title</label>
                                <input type="text" required value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 px-4 py-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/10 outline-none focus:border-orange-500/50 text-slate-800 dark:text-white" placeholder="What are you selling?" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Price (₹)</label>
                                    <input type="number" required value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 px-4 py-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/10 outline-none focus:border-orange-500/50 text-slate-800 dark:text-white" placeholder="Price" />
                                </div>
                                <div>
                                    <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Category</label>
                                    <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 px-4 py-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/10 outline-none focus:border-orange-500/50 text-slate-800 dark:text-white appearance-none">
                                        {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Description</label>
                                <textarea required value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 px-4 py-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/10 outline-none focus:border-orange-500/50 min-h-[80px] text-slate-800 dark:text-white" placeholder="Brief details about the item's state..." />
                            </div>
                            <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-orange-600/20 active:scale-95 transition-all border-none cursor-pointer">List Now</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketplaceHub;
