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
    const [showUserOnly, setShowUserOnly] = useState(false);
    const [showSellModal, setShowSellModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
    const [editingItem, setEditingItem] = useState<MarketplaceItem | null>(null);
    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        price: '',
        category: 'Books',
        condition: 'Good',
        phone: '',
        location: ''
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const categories = ['All', 'Books', 'Electronics', 'Cycles', 'Hostel Essentials', 'Others'];

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        const data = await NexusServer.fetchMarketplaceItems();
        // Map joined seller profile data to the item properties
        const mapped = data.map((item: any) => ({
            ...item,
            seller_username: item.seller?.username || item.seller_username || 'Verto Anonymous',
            seller_avatar: item.seller?.avatar_url || item.seller_avatar
        }));
        setItems(mapped as MarketplaceItem[]);
        setLoading(false);
    };

    const handleSellSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userProfile) { showToast("Sign in required.", "info"); return; }
        if (!newItem.title || !newItem.description || !newItem.price || !newItem.phone || !newItem.location) {
            showToast("All fields are mandatory.", "info");
            return;
        }

        setLoading(true);
        try {
            let imageUrls: string[] = editingItem?.images || [];

            if (selectedFile) {
                const path = `marketplace/${userProfile.id}/${Date.now()}_${selectedFile.name}`;
                const publicUrl = await NexusServer.uploadMarketplaceImage(selectedFile, path);
                imageUrls = [publicUrl]; // For now we only support one image for simplicity in UI
            }

            const itemData = {
                title: newItem.title,
                description: newItem.description,
                category: newItem.category,
                condition: newItem.condition,
                price: parseFloat(newItem.price),
                seller_id: userProfile.id,
                seller_phone: newItem.phone,
                location: newItem.location,
                status: 'Available',
                images: imageUrls
            };

            if (editingItem) {
                await NexusServer.updateMarketplaceItem(editingItem.id, itemData);
                showToast("Item updated successfully!", "success");
            } else {
                await NexusServer.createMarketplaceItem(itemData);
                showToast("Item listed successfully!", "success");
            }

            closeModal();
            fetchItems();
        } catch (err: any) {
            showToast("Error: " + err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this listing?")) return;
        try {
            await NexusServer.deleteMarketplaceItem(id);
            showToast("Item deleted.", "success");
            fetchItems();
        } catch (err: any) {
            showToast("Error: " + err.message, "error");
        }
    };

    const handleEdit = (item: MarketplaceItem) => {
        setEditingItem(item);
        setNewItem({
            title: item.title,
            description: item.description,
            price: item.price.toString(),
            category: item.category,
            condition: item.condition,
            phone: item.seller_phone || '',
            location: item.location || ''
        });
        setImagePreview(item.images?.[0] || null);
        setShowSellModal(true);
    };

    const closeModal = () => {
        setShowSellModal(false);
        setEditingItem(null);
        setNewItem({ title: '', description: '', price: '', category: 'Books', condition: 'Good', phone: '', location: '' });
        setImagePreview(null);
        setSelectedFile(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const filteredItems = items.filter(item => {
        const categoryMatch = filter === 'All' || item.category === filter;
        const userMatch = !showUserOnly || item.seller_id === userProfile?.id;
        return categoryMatch && userMatch;
    });

    return (
        <div className="max-w-[1440px] mx-auto px-6 py-10 pb-32">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="space-y-1 text-left">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                        LPU <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Market</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Second-hand treasures for every Verto.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => navigate('/roommate')}
                        className="px-5 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-orange-500/10 hover:text-orange-600 transition-all border-none cursor-pointer flex items-center gap-2"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        Find Roommates
                    </button>
                    <button
                        onClick={() => { if (!userProfile) showToast("Sign in required.", "info"); else setShowUserOnly(!showUserOnly); }}
                        className={`px-5 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all border-none cursor-pointer flex items-center gap-2 ${showUserOnly ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white'}`}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        {showUserOnly ? 'All Items' : 'My Ads'}
                    </button>
                    <button
                        onClick={() => { if (!userProfile) showToast("Sign in required.", "info"); else setShowSellModal(true); }}
                        className="px-5 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-xl shadow-orange-600/10 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-80 bg-slate-100 dark:bg-white/5 rounded-[40px] animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-4">
                    {filteredItems.map(item => (
                        <div key={item.id} className="group p-4 bg-white dark:bg-[#0c0c0c] rounded-[48px] border border-slate-200 dark:border-white/5 hover:border-orange-500/30 shadow-sm hover:shadow-2xl hover:shadow-orange-600/5 transition-all duration-500 flex flex-col relative overflow-hidden">
                            {/* Tags Overlay */}
                            <div className="absolute top-6 left-6 flex flex-col gap-2 z-30 transform -translate-x-2 group-hover:translate-x-0 transition-transform duration-500">
                                {item.seller_id === userProfile?.id && (
                                    <div className="flex gap-1.5 p-1.5 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-2xl shadow-xl border border-white/20">
                                        <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-xl transition-colors border-none bg-transparent cursor-pointer">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                        </button>
                                        <div className="w-[1px] h-4 bg-slate-200 dark:bg-white/10 self-center" />
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors border-none bg-transparent cursor-pointer">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="relative aspect-square mb-5 rounded-[36px] overflow-hidden bg-slate-50 dark:bg-white/[0.02] flex items-center justify-center border border-slate-100 dark:border-white/5">
                                {item.images && item.images.length > 0 ? (
                                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                ) : (
                                    <div className="flex flex-col items-center gap-3 opacity-20">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 text-slate-900 dark:text-white"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                                        <span className="text-[10px] font-black uppercase tracking-widest">No Image</span>
                                    </div>
                                )}

                                <div className="absolute top-4 right-4 z-20">
                                    <div className="px-3.5 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl shadow-xl shadow-orange-600/30 flex items-center gap-1.5 group-hover:scale-110 transition-transform duration-500">
                                        <span className="text-[10px] font-black opacity-70">₹</span>
                                        <span className="text-sm font-black tracking-tight">{item.price}</span>
                                    </div>
                                </div>

                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>

                            <div className="px-2 space-y-4 flex-1 text-left">
                                <div className="flex justify-between items-center h-4">
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                                        <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">{item.category}</span>
                                    </div>
                                    <div className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-full">
                                        <span className="text-[8px] font-black text-slate-400 dark:text-white/40 uppercase tracking-widest">{item.condition}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tighter leading-tight uppercase group-hover:text-orange-500 transition-colors line-clamp-1">{item.title}</h4>
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400/50 leading-relaxed line-clamp-2 min-h-[30px]">{item.description}</p>
                                </div>
                            </div>

                            <div className="pt-5 mt-5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between px-1">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-white/10 dark:to-white/5 flex items-center justify-center text-orange-600 font-black text-[11px] shadow-inner border border-white/50 dark:border-white/10 group-hover:rotate-6 transition-transform">
                                        {item.seller_username?.[0]?.toUpperCase() || 'V'}
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[9px] font-black text-slate-800 dark:text-white uppercase tracking-widest leading-none">{(item.seller_username && item.seller_username.length > 1) ? item.seller_username : 'Verto Anonymous'}</span>
                                        {item.location && <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight mt-1 opacity-70 flex items-center gap-1">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                            {item.location}
                                        </span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {item.seller_phone && (
                                        <a href={`tel:${item.seller_phone}`} className="w-9 h-9 flex items-center justify-center text-white bg-[#0e0e0e] hover:bg-orange-600 rounded-2xl transition-all shadow-xl shadow-black/5 group/btn hover:scale-110 active:scale-95 border-none">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className="w-3.5 h-3.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                        </a>
                                    )}
                                    <button onClick={() => setSelectedItem(item)} className="w-9 h-9 flex items-center justify-center text-slate-400 dark:text-white/40 hover:text-white hover:bg-orange-600 bg-slate-100 dark:bg-white/5 rounded-2xl transition-all hover:scale-110 active:scale-95 border-none cursor-pointer">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className="w-4 h-4"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredItems.length === 0 && (
                        <div className="col-span-full py-32 text-center text-slate-400 font-black uppercase tracking-[0.3em] opacity-30 text-[10px]">
                            No treasures found in this category.
                        </div>
                    )}
                </div>
            )}

            {/* Detailed View Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-xl animate-fade-in" onClick={() => setSelectedItem(null)}>
                    <div className="bg-white dark:bg-[#080808] w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[40px] md:rounded-[56px] relative shadow-2xl border border-white/10 flex flex-col md:flex-row group animate-scale-up" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 z-50 p-3 bg-black/20 hover:bg-orange-600 backdrop-blur-md text-white rounded-2xl transition-all border-none cursor-pointer">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>

                        <div className="w-full md:w-1/2 h-[300px] md:h-auto bg-slate-50 dark:bg-white/[0.02] relative overflow-hidden">
                            {selectedItem.images && selectedItem.images.length > 0 ? (
                                <img src={selectedItem.images[0]} alt={selectedItem.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center opacity-10">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-32 h-32"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
                            <div className="absolute bottom-6 left-6 md:hidden">
                                <span className="px-4 py-2 bg-orange-600 text-white rounded-2xl font-black text-lg">₹{selectedItem.price}</span>
                            </div>
                        </div>

                        <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col text-left">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-orange-600/10 text-orange-600 rounded-lg text-[9px] font-black uppercase tracking-widest">{selectedItem.category}</span>
                                        <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/40 rounded-lg text-[9px] font-black uppercase tracking-widest">{selectedItem.condition} Condition</span>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">{selectedItem.title}</h2>
                                    <div className="hidden md:block py-4">
                                        <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">₹{selectedItem.price}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Description</h5>
                                    <p className="text-sm md:text-base text-slate-600 dark:text-slate-400/80 leading-relaxed font-medium">{selectedItem.description}</p>
                                </div>

                                <div className="pt-8 border-t border-slate-100 dark:border-white/5 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-[22px] bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xl font-black shadow-xl">
                                            {(selectedItem.seller_username && selectedItem.seller_username.length > 0) ? selectedItem.seller_username[0].toUpperCase() : 'V'}
                                        </div>
                                        <div>
                                            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Listed By</h5>
                                            <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedItem.seller_username || 'Anonymous Verto'}</p>
                                            {selectedItem.location && <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mt-0.5">{selectedItem.location}</p>}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        {selectedItem.seller_phone && (
                                            <a href={`tel:${selectedItem.seller_phone}`} className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-5 rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-orange-600/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all text-decoration-none border-none">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                                Call Seller
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showSellModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
                    <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-md rounded-[32px] p-6 relative shadow-2xl border border-slate-200 dark:border-white/10 animate-slide-up">
                        <button onClick={closeModal} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors border-none bg-transparent cursor-pointer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 tracking-tighter uppercase">{editingItem ? 'Edit Listing' : 'List Item'}</h3>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-6">Ready to pass your gear to the next Verto?</p>

                        <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar text-left">
                            <form onSubmit={handleSellSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Product Photo</label>
                                    <div className="group relative w-full h-32 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-orange-500/50 transition-all overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => document.getElementById('market-image-upload')?.click()}>
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center space-y-1">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6 mx-auto text-slate-300"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Click to upload</p>
                                            </div>
                                        )}
                                        <input id="market-image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </div>
                                </div>
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
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Contact Number</label>
                                        <input
                                            type="text"
                                            required
                                            value={newItem.phone}
                                            onChange={e => {
                                                const val = e.target.value;
                                                if (/^\d*$/.test(val)) setNewItem({ ...newItem, phone: val });
                                            }}
                                            className="w-full bg-slate-50 dark:bg-white/5 px-4 py-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/10 outline-none focus:border-orange-500/50 text-slate-800 dark:text-white"
                                            placeholder="e.g. 98150XXXXX"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">Hostel / Address</label>
                                        <input type="text" required value={newItem.location} onChange={e => setNewItem({ ...newItem, location: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 px-4 py-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/10 outline-none focus:border-orange-500/50 text-slate-800 dark:text-white" placeholder="e.g. BH-4, 502" />
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-orange-600/20 active:scale-95 transition-all border-none cursor-pointer disabled:opacity-50">
                                    {loading ? (editingItem ? 'Updating...' : 'Listing...') : (editingItem ? 'Save Changes' : 'List Now')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketplaceHub;
