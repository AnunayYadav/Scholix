import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import { slugify } from '../utils/slugify';
import { MarketplaceItem, UserProfile } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';
import { showToast } from './Toast.tsx';
import VerifiedBadge from './VerifiedBadge.tsx';
import { useUniversity } from '../hooks/useUniversity.tsx';


const MarketplaceHub: React.FC<{ userProfile: UserProfile | null }> = ({ userProfile }) => {
    const navigate = useNavigate();
    const { category: urlCategory, itemId: urlItemId } = useParams();
    const { pathname } = useLocation();
    const { uniSlug, fullBrandName, studentTerm, universityName, communityName } = useUniversity();
    
    // Determine base route for navigation to be mount-point agnostic
    const baseRoute = pathname.includes('/campus/market') 
        ? `/${uniSlug}/campus/market` 
        : `/${uniSlug}/marketplace`;

    const [items, setItems] = useState<MarketplaceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(urlCategory || 'All');
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
    const [isClosingDetail, setIsClosingDetail] = useState(false);
    const [isClosingSell, setIsClosingSell] = useState(false);

    const handleCloseDetail = () => {
        setIsClosingDetail(true);
        setTimeout(() => {
            setSelectedItem(null);
            setIsClosingDetail(false);
            if (filter === 'All') {
                navigate(baseRoute);
            } else {
                navigate(`${baseRoute}/${slugify(filter)}`);
            }

        }, 250);
    };

    const handleCloseSell = () => {
        setIsClosingSell(true);
        setTimeout(() => {
            setShowSellModal(false);
            setEditingItem(null);
            setNewItem({ title: '', description: '', price: '', category: 'Books', condition: 'Good', phone: '', location: '' });
            setImagePreview(null);
            setSelectedFile(null);
            setIsClosingSell(false);
        }, 250);
    };

    const categories = ['All', 'Books', 'Electronics', 'Cycles', 'Hostel Essentials', 'Others'];

    useEffect(() => {
        fetchItems();
    }, []);

    // Sync state with URL category
    useEffect(() => {
        if (urlCategory) {
            const matched = categories.find(c => slugify(c) === urlCategory);
            if (matched) {
                setFilter(matched);
            } else {
                setFilter(urlCategory);
            }
        } else if (!urlItemId) {
            setFilter('All');
        }
    }, [urlCategory, urlItemId]);

    useEffect(() => {
        if (urlItemId && items.length > 0) {
            const item = items.find(i => i.id === urlItemId);
            if (item) setSelectedItem(item);
        }
    }, [urlItemId, items]);

    const handleFilterChange = (newCategory: string) => {
        setFilter(newCategory);
        if (newCategory === 'All') {
            navigate(baseRoute);
        } else {
            navigate(`${baseRoute}/${slugify(newCategory)}`);
        }

    };

    const fetchItems = async () => {
        setLoading(true);
        const data = await NexusServer.fetchMarketplaceItems();
        // Map joined seller profile data to the item properties
        const mapped = data.map((item: any) => ({
            ...item,
            seller_username: item.seller?.username || item.seller_username || `${studentTerm} Anonymous`,
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
                const cleanName = NexusServer.sanitizeStoragePath(selectedFile.name);
                const path = `marketplace/${userProfile.id}/${Date.now()}_${cleanName}`;
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
                // Tracking
                NexusServer.saveRecord(userProfile.id, 'marketplace_post', `Listed item: ${itemData.title}`, { title: itemData.title, category: itemData.category });
            }

            handleCloseSell();
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
        handleCloseSell();
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
        <div className="animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pt-4">
                {/* Filter Bar */}
                <div className="flex items-center bg-white dark:bg-[#0a0a0a] p-1.5 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm overflow-x-auto no-scrollbar w-full md:w-max order-2 md:order-1">
                    {categories.map(c => (
                        <button
                            key={c}
                            onClick={() => handleFilterChange(c)}
                            className={`px-4 py-2 rounded-xl text-[11px] sm:text-xs font-medium tracking-wider transition-all border-none cursor-pointer whitespace-nowrap ${filter === c
                                ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/20'
                                : 'text-zinc-400 hover:text-brand-primary dark:text-zinc-500 dark:hover:text-white bg-transparent'
                                }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto order-1 md:order-2">
                    <button
                        onClick={() => setShowUserOnly(!showUserOnly)}
                        className={`p-3.5 rounded-2xl transition-all border shadow-sm cursor-pointer ${showUserOnly
                            ? 'bg-brand-primary/10 border-brand-primary/50 text-brand-primary'
                            : 'bg-white dark:bg-[#0a0a0a] border-zinc-200 dark:border-white/5 text-zinc-400'
                            }`}
                        title="My Listings"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </button>
                    <button
                        onClick={() => {
                            if (!userProfile) showToast("Please sign in to list items", "info");
                            else setShowSellModal(true);
                        }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black px-6 py-4 rounded-2xl font-semibold text-[11px] sm:text-xs tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-xl hover:shadow-2xl border-none cursor-pointer"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Post Ad
                    </button>

                </div>
            </header>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8 mt-4 px-2 md:px-0">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="p-3 md:p-4 bg-white dark:bg-[#0a0a0a] rounded-[32px] md:rounded-[42px] border border-zinc-200 dark:border-white/5 flex flex-col">
                            <div className="aspect-square mb-4 rounded-[32px] skeleton-pulse" />
                            <div className="px-1 space-y-2 mb-3">
                                <div className="h-2 w-16 skeleton-pulse rounded-md" />
                                <div className="h-4 w-3/4 skeleton-pulse rounded-md" />
                                <div className="h-2 w-1/2 skeleton-pulse rounded-md" />
                            </div>
                            <div className="pt-4 mt-auto border-t border-zinc-100 dark:border-white/5 flex items-center gap-2">
                                <div className="w-8 h-8 skeleton-pulse rounded-lg" />
                                <div className="space-y-1.5 flex-1">
                                    <div className="h-2 w-20 skeleton-pulse rounded-md" />
                                    <div className="h-2 w-12 skeleton-pulse rounded-md" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8 mt-4 px-2 md:px-0">
                    {filteredItems.map(item => (
                        <div key={item.id} onClick={() => { setSelectedItem(item); navigate(`${baseRoute}/item/${item.id}`); }} className="group p-3 md:p-4 bg-white dark:bg-[#0a0a0a] rounded-[32px] md:rounded-[42px] border border-zinc-200 dark:border-white/5 hover:border-brand-primary/30 shadow-sm hover:shadow-2xl hover:shadow-brand-primary/5 transition-all duration-500 flex flex-col relative overflow-hidden cursor-pointer">

                            {/* Tags Overlay */}
                            <div className="absolute top-5 left-5 flex flex-col gap-2 z-30 transform -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                                {item.seller_id === userProfile?.id && (
                                    <div className="flex bg-white/95 dark:bg-[#0a0a0a]/80 backdrop-blur-md rounded-xl shadow-lg border border-zinc-200/50 dark:border-white/10 overflow-hidden">
                                        <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="p-2 text-blue-500 hover:bg-blue-500/10 transition-colors border-none bg-transparent cursor-pointer">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-2 text-red-500 hover:bg-red-500/10 transition-colors border-none bg-transparent cursor-pointer">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="relative aspect-square mb-4 rounded-[32px] overflow-hidden bg-zinc-50 dark:bg-white/[0.02] flex items-center justify-center border border-zinc-100 dark:border-white/5">
                                {item.images && item.images.length > 0 ? (
                                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 opacity-20">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 md:w-12 md:h-12 text-zinc-900 dark:text-white"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                                        <span className="text-[11px] sm:text-xs font-medium">No Image</span>
                                    </div>
                                )}

                                <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20">
                                    <div className="px-2 py-0.5 md:px-3 md:py-1 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-lg shadow-lg shadow-brand-primary/20 flex items-center gap-1 group-hover:scale-110 transition-transform duration-500">
                                        <span className="text-[11px] sm:text-xs font-bold opacity-70">₹</span>
                                        <span className="text-[11px] sm:text-xs font-bold tracking-tight">{item.price}</span>
                                    </div>
                                </div>

                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>

                             <div className="flex flex-col gap-1 text-left mb-3 min-w-0 px-1">
                                <div className="flex items-center gap-1.5 line-clamp-1">
                                    <div className="w-1 h-1 rounded-full bg-brand-primary animate-pulse" />
                                    <span className="text-[11px] sm:text-xs font-semibold text-brand-primary uppercase tracking-widest leading-none">{item.category}</span>
                                    <span className="text-[11px] sm:text-xs font-medium text-zinc-300 dark:text-zinc-600 uppercase tracking-widest">•</span>
                                    <span className="text-[11px] sm:text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none">{item.condition}</span>
                                </div>
                                <h3 className="text-[13px] md:text-[15px] font-bold text-zinc-900 dark:text-white tracking-tight leading-tight truncate">{item.title}</h3>
                                {item.description && <p className="text-[11px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 line-clamp-1 opacity-70">{item.description}</p>}
                            </div>


                             <div className="pt-4 mt-auto border-t border-zinc-100 dark:border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-[11px] sm:text-xs shrink-0 border border-brand-primary/5">
                                        {item.seller_username?.[0]?.toUpperCase() || studentTerm[0]}
                                    </div>
                                    <div className="flex flex-col text-left min-w-0 pr-2">
                                        <div className="flex items-center gap-1 min-w-0 pr-2">
                                            <span className="text-[11px] sm:text-xs font-bold text-zinc-800 dark:text-white uppercase tracking-wider truncate">{item.seller_username || studentTerm}</span>
                                            <VerifiedBadge isAdmin={item.seller_is_admin} size="w-3 h-3" />
                                        </div>
                                        {item.location && <span className="text-[11px] sm:text-xs font-semibold text-brand-primary uppercase tracking-tight opacity-70 truncate line-clamp-1">{item.location}</span>}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                    {item.seller_phone && (
                                        <>
                                            <a href={`tel:${item.seller_phone}`} onClick={(e) => e.stopPropagation()} className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-zinc-400 dark:text-white/40 hover:text-white hover:bg-brand-primary bg-zinc-50 dark:bg-white/5 rounded-lg transition-all hover:scale-105 active:scale-95 border-none">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 md:w-3.5 h-3 md:h-3.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                            </a>
                                            <a
                                                href={`https://wa.me/${item.seller_phone.replace(/\D/g, '').length === 10 ? '91' + item.seller_phone.replace(/\D/g, '') : item.seller_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in your "${item.title}" listed on ${fullBrandName}.`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-zinc-400 dark:text-white/40 hover:text-white hover:bg-[#25D366] bg-zinc-50 dark:bg-white/5 rounded-lg transition-all hover:scale-105 active:scale-95 border-none"
                                            >
                                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 md:w-4 md:h-4">
                                                    <path d="M12.004 2C6.474 2 2 6.474 2 12.004c0 1.944.558 3.754 1.524 5.289l-1.5 5.511 5.642-1.48c1.39.756 2.973 1.192 4.654 1.192 5.53 0 10.004-4.474 10.004-10.004S17.534 2 12.004 2zm0 18.25c-1.63 0-3.155-.444-4.464-1.218l-.32-.187-3.32.868.883-3.23-.205-.327c-.833-1.32-1.274-2.857-1.274-4.469 0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8zm4.615-6.233c-.253-.127-1.5-.74-1.733-.824-.233-.085-.403-.127-.573.127-.17.253-.655.824-.805 1s-.3.19-.553.064c-.253-.127-1.07-.394-2.038-1.258-.753-.672-1.26-1.503-1.408-1.756-.148-.253-.016-.39.11-.515.114-.114.253-.296.38-.444.127-.148.17-.253.254-.423.085-.17.042-.317-.02-.444-.063-.127-.571-1.376-.782-1.884-.206-.494-.413-.427-.572-.427-.148 0-.317-.01-.486-.01s-.444.064-.677.317c-.233.253-.89.868-.89 2.116s.91 2.455 1.037 2.624c.127.169 1.79 2.73 4.334 3.824.605.26 1.077.416 1.446.533.606.192 1.158.165 1.593.1.485-.072 1.492-.61 1.704-1.203.212-.593.212-1.101.148-1.203-.063-.102-.275-.186-.53-.313z" />
                                                </svg>
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredItems.length === 0 && (
                        <div className="col-span-full py-32 text-center text-zinc-400 font-medium opacity-30 text-[11px] sm:text-xs">
                            No treasures found in this category.
                        </div>
                    )}
                </div>
            )}

            {/* Detailed View Modal */}
            {selectedItem && createPortal(
                <div className={`modal-overlay ${isClosingDetail ? 'closing' : ''}`}
                    style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
                    onClick={(e) => { if (e.target === e.currentTarget) handleCloseDetail(); }}>
                    <div className={`bg-white dark:bg-[#0a0a0a] w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[40px] md:rounded-[56px] relative shadow-2xl border border-white/10 flex flex-col md:flex-row group animate-slide-up ${isClosingDetail ? 'closing' : ''}`} onClick={e => e.stopPropagation()}>
                        <button onClick={handleCloseDetail} className="absolute top-6 right-6 z-50 p-3 bg-black/20 hover:bg-brand-primary backdrop-blur-md text-white rounded-2xl transition-all border-none cursor-pointer">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>

                        <div className="w-full md:w-1/2 h-[300px] md:h-auto bg-zinc-50 dark:bg-white/[0.02] relative overflow-hidden">
                            {selectedItem.images && selectedItem.images.length > 0 ? (
                                <img src={selectedItem.images[0]} alt={selectedItem.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center opacity-10">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-32 h-32"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                                </div>
                            )}
                             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
                            <div className="absolute bottom-6 left-6 md:hidden">
                                <span className="px-4 py-2 bg-brand-primary text-white rounded-2xl font-bold text-lg">₹{selectedItem.price}</span>
                            </div>

                        </div>

                        <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col text-left">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                     <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-lg text-[11px] sm:text-xs font-medium">{selectedItem.category}</span>
                                        <span className="px-3 py-1 bg-zinc-100 dark:bg-white/5 text-zinc-400 dark:text-white/40 rounded-lg text-[11px] sm:text-xs font-medium">{selectedItem.condition} Condition</span>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tighter uppercase leading-none">{selectedItem.title}</h2>
                                    <div className="hidden md:block py-4">
                                        <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">₹{selectedItem.price}</span>
                                    </div>

                                </div>

                                <div className="space-y-4">
                                    <h5 className="text-[11px] sm:text-xs font-medium text-zinc-400 mb-1">Description</h5>
                                    <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400/80 leading-relaxed font-medium">{selectedItem.description}</p>
                                </div>

                                <div className="pt-8 border-t border-zinc-100 dark:border-white/5 space-y-6">
                                     <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-[22px] bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white text-xl font-bold shadow-xl">
                                            {(selectedItem.seller_username && selectedItem.seller_username.length > 0) ? selectedItem.seller_username[0].toUpperCase() : studentTerm[0]}
                                        </div>
                                        <div>
                                            <h5 className="text-[11px] sm:text-xs font-medium text-zinc-400 mb-1">Listed By</h5>
                                            <div className="flex items-center gap-2">
                                                <p className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{selectedItem.seller_username || `Anonymous ${studentTerm}`}</p>
                                                <VerifiedBadge isAdmin={selectedItem.seller_is_admin} size="w-5 h-5" />
                                            </div>
                                            {selectedItem.location && <p className="text-[11px] sm:text-xs font-semibold text-brand-primary uppercase tracking-widest mt-0.5">{selectedItem.location}</p>}
                                        </div>
                                    </div>


                                    <div className="flex flex-col sm:flex-row gap-3">
                                         {selectedItem.seller_phone && (
                                            <>
                                                <a href={`tel:${selectedItem.seller_phone}`} className="flex-1 bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-4 md:py-5 rounded-[24px] font-bold text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-brand-primary/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all text-decoration-none border-none">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                                    Call Seller
                                                </a>
                                                <a
                                                    href={`https://wa.me/${selectedItem.seller_phone.replace(/\D/g, '').length === 10 ? '91' + selectedItem.seller_phone.replace(/\D/g, '') : selectedItem.seller_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in your "${selectedItem.title}" listed on ${fullBrandName}.`)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 bg-[#25D366] text-white py-4 md:py-5 rounded-[24px] font-bold text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-[#25D366]/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all text-decoration-none border-none"
                                                >
                                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                                        <path d="M12.004 2C6.474 2 2 6.474 2 12.004c0 1.944.558 3.754 1.524 5.289l-1.5 5.511 5.642-1.48c1.39.756 2.973 1.192 4.654 1.192 5.53 0 10.004-4.474 10.004-10.004S17.534 2 12.004 2zm0 18.25c-1.63 0-3.155-.444-4.464-1.218l-.32-.187-3.32.868.883-3.23-.205-.327c-.833-1.32-1.274-2.857-1.274-4.469 0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8zm4.615-6.233c-.253-.127-1.5-.74-1.733-.824-.233-.085-.403-.127-.573.127-.17.253-.655.824-.805 1s-.3.19-.553.064c-.253-.127-1.07-.394-2.038-1.258-.753-.672-1.26-1.503-1.408-1.756-.148-.253-.016-.39.11-.515.114-.114.253-.296.38-.444.127-.148.17-.253.254-.423.085-.17.042-.317-.02-.444-.063-.127-.571-1.376-.782-1.884-.206-.494-.413-.427-.572-.427-.148 0-.317-.01-.486-.01s-.444.064-.677.317c-.233.253-.89.868-.89 2.116s.91 2.455 1.037 2.624c.127.169 1.79 2.73 4.334 3.824.605.26 1.077.416 1.446.533.606.192 1.158.165 1.593.1.485-.072 1.492-.61 1.704-1.203.212-.593.212-1.101.148-1.203-.063-.102-.275-.186-.53-.313z" />
                                                    </svg>
                                                    WhatsApp
                                                </a>
                                            </>
                                        )}

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.getElementById('modal-root') || document.body
            )}

            {/* Sell Modal */}
            {showSellModal && createPortal(
                <div className={`modal-overlay ${isClosingSell ? 'closing' : ''}`}
                    style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
                    onClick={(e) => { if (e.target === e.currentTarget) handleCloseSell(); }}>
                    <div className={`nexus-modal w-full max-w-md p-6 ${isClosingSell ? 'closing' : ''}`}>
                        <button onClick={handleCloseSell} className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors border-none bg-transparent cursor-pointer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg></button>

                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1 tracking-tighter">{editingItem ? 'Edit Listing' : 'List Item'}</h3>
                        <p className="text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-wider mb-6">Ready to pass your gear to the next {studentTerm}?</p>

                        <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar text-left">
                            <form onSubmit={handleSellSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[11px] sm:text-xs font-medium text-zinc-400 mb-2 ml-1">Product Photo</label>
                                    <div className="group relative w-full h-32 bg-zinc-50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-white/10 hover:border-brand-primary/50 transition-all overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => document.getElementById('market-image-upload')?.click()}>
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center space-y-1">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6 mx-auto text-zinc-300"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                                <p className="text-[11px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-widest">Click to upload</p>
                                            </div>
                                        )}
                                        <input id="market-image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] sm:text-xs font-medium text-zinc-400 mb-1 ml-1">Title</label>
                                    <input type="text" required value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} className="w-full bg-zinc-50 dark:bg-white/5 px-4 py-3 rounded-xl text-[11px] sm:text-xs font-medium border border-zinc-200 dark:border-white/10 outline-none focus:border-brand-primary/50 text-zinc-800 dark:text-white" placeholder="What are you selling?" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] sm:text-xs font-medium text-zinc-400 mb-1 ml-1">Price (₹)</label>
                                        <input type="number" required value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} className="w-full bg-zinc-50 dark:bg-white/5 px-4 py-3 rounded-xl text-[11px] sm:text-xs font-medium border border-zinc-200 dark:border-white/10 outline-none focus:border-brand-primary/50 text-zinc-800 dark:text-white" placeholder="Price" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] sm:text-xs font-medium text-zinc-400 mb-1 ml-1">Category</label>
                                        <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} className="w-full bg-zinc-50 dark:bg-white/5 px-4 py-3 rounded-xl text-[11px] sm:text-xs font-medium border border-zinc-200 dark:border-white/10 outline-none focus:border-brand-primary/50 text-zinc-800 dark:text-white appearance-none">
                                            {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] sm:text-xs font-medium text-zinc-400 mb-1 ml-1">Description</label>
                                    <textarea required value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} className="w-full bg-zinc-50 dark:bg-white/5 px-4 py-3 rounded-xl text-[11px] sm:text-xs font-medium border border-zinc-200 dark:border-white/10 outline-none focus:border-brand-primary/50 min-h-[80px] text-zinc-800 dark:text-white" placeholder="Brief details about the item's state..." />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] sm:text-xs font-medium text-zinc-400 mb-1 ml-1">Contact Number</label>
                                        <input
                                            type="text"
                                            required
                                            value={newItem.phone}
                                            onChange={e => {
                                                const val = e.target.value;
                                                if (/^\d*$/.test(val)) setNewItem({ ...newItem, phone: val });
                                            }}
                                            className="w-full bg-zinc-50 dark:bg-white/5 px-4 py-3 rounded-xl text-[11px] sm:text-xs font-medium border border-zinc-200 dark:border-white/10 outline-none focus:border-brand-primary/50 text-zinc-800 dark:text-white"
                                            placeholder="e.g. 98150XXXXX"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] sm:text-xs font-medium text-zinc-400 mb-1 ml-1">Hostel / Address</label>
                                        <input type="text" required value={newItem.location} onChange={e => setNewItem({ ...newItem, location: e.target.value })} className="w-full bg-zinc-50 dark:bg-white/5 px-4 py-3 rounded-xl text-[11px] sm:text-xs font-medium border border-zinc-200 dark:border-white/10 outline-none focus:border-brand-primary/50 text-zinc-800 dark:text-white" placeholder="e.g. BH-4, 502" />
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-4 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-[0.2em] shadow-xl shadow-brand-primary/20 active:scale-95 transition-all border-none cursor-pointer disabled:opacity-50">
                                    {loading ? (editingItem ? 'Updating...' : 'Listing...') : (editingItem ? 'Save Changes' : 'List Now')}
                                </button>
                            </form>

                        </div>
                    </div>
                </div>,
                document.getElementById('modal-root') || document.body
            )}
        </div>
    );
};

export default MarketplaceHub;
