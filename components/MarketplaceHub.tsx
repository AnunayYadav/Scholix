import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { slugify } from '../utils/slugify';
import { MarketplaceItem, UserProfile } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';
import { showToast } from './Toast.tsx';
import VerifiedBadge from './VerifiedBadge.tsx';
import { useUniversity } from '../hooks/useUniversity.tsx';
import { 
    Search, 
    Plus, 
    X, 
    MapPin, 
    Phone, 
    MessageCircle, 
    Edit3, 
    Trash2, 
    User, 
    ImageIcon, 
    Sparkles, 
    ShoppingBag,
    UploadCloud
} from 'lucide-react';

const MarketplaceHub: React.FC<{ userProfile: UserProfile | null }> = ({ userProfile }) => {
    const navigate = useNavigate();
    const { category: urlCategory, itemId: urlItemId } = useParams();
    const { pathname } = useLocation();
    const { uniSlug, fullBrandName, studentTerm } = useUniversity();
    
    // Determine base route for navigation to be mount-point agnostic
    const baseRoute = (pathname.includes('/campus/market') || pathname.includes('/market'))
        ? `/${uniSlug}/campus/market` 
        : `/${uniSlug}/campus/market`;

    const [items, setItems] = useState<MarketplaceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(urlCategory || 'All');
    const [searchQuery, setSearchQuery] = useState('');
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
    const [submitting, setSubmitting] = useState(false);

    const categories = ['All', 'Books', 'Electronics', 'Cycles', 'Hostel Essentials', 'Others'];

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
        try {
            const data = await NexusServer.fetchMarketplaceItems();
            const mapped = (data || []).map((item: any) => ({
                ...item,
                seller_username: item.seller?.username || item.seller_username || `${studentTerm} Anonymous`,
                seller_avatar: item.seller?.avatar_url || item.seller_avatar
            }));
            setItems(mapped as MarketplaceItem[]);
        } catch (err: any) {
            console.error("Failed to load marketplace items:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSellSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userProfile) { showToast("Sign in required.", "info"); return; }
        if (!newItem.title.trim() || !newItem.description.trim() || !newItem.price || !newItem.phone.trim() || !newItem.location.trim()) {
            showToast("All fields including phone and location are mandatory.", "info");
            return;
        }

        setSubmitting(true);
        try {
            let imageUrls: string[] = editingItem?.images || [];

            if (selectedFile) {
                const cleanName = NexusServer.sanitizeStoragePath(selectedFile.name);
                const path = `marketplace/${userProfile.id}/${Date.now()}_${cleanName}`;
                const publicUrl = await NexusServer.uploadMarketplaceImage(selectedFile, path);
                imageUrls = [publicUrl];
            }

            const itemData = {
                title: newItem.title.trim(),
                description: newItem.description.trim(),
                category: newItem.category,
                condition: newItem.condition,
                price: parseFloat(newItem.price),
                seller_id: userProfile.id,
                seller_phone: newItem.phone.trim(),
                location: newItem.location.trim(),
                status: 'Available',
                images: imageUrls
            };

            if (editingItem) {
                await NexusServer.updateMarketplaceItem(editingItem.id, itemData);
                showToast("Item listing updated successfully!", "success");
            } else {
                await NexusServer.createMarketplaceItem(itemData);
                showToast("Item listed on marketplace!", "success");
                NexusServer.saveRecord(userProfile.id, 'marketplace_post', `Listed item: ${itemData.title}`, { 
                    title: itemData.title, 
                    category: itemData.category 
                });
            }

            handleCloseSell();
            fetchItems();
        } catch (err: any) {
            showToast("Error: " + (err.message || 'Failed to list item'), "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this listing?")) return;
        try {
            await NexusServer.deleteMarketplaceItem(id);
            showToast("Listing deleted.", "success");
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const categoryMatch = filter === 'All' || item.category === filter;
            const userMatch = !showUserOnly || item.seller_id === userProfile?.id;
            
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const titleMatch = item.title?.toLowerCase().includes(query);
                const descMatch = item.description?.toLowerCase().includes(query);
                const locMatch = item.location?.toLowerCase().includes(query);
                if (!titleMatch && !descMatch && !locMatch) return false;
            }

            return categoryMatch && userMatch;
        });
    }, [items, filter, showUserOnly, userProfile?.id, searchQuery]);

    const formatPrice = (price: number) => {
        return `₹${Number(price || 0).toLocaleString('en-IN')}`;
    };

    return (
        <div className="animate-fade-in space-y-6">
            {/* Top Toolbar: Search, Categories, My Listings & Post Ad */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search books, cycles, electronics, gear..."
                            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white dark:bg-[#141417] border border-zinc-200/80 dark:border-white/[0.08] focus:border-brand-primary/60 outline-none text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 font-medium transition-all shadow-xs"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2.5 shrink-0">
                        <button
                            onClick={() => {
                                if (!userProfile) showToast("Sign in required.", "info");
                                else setShowUserOnly(!showUserOnly);
                            }}
                            className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all border flex items-center gap-2 cursor-pointer ${
                                showUserOnly
                                    ? 'bg-brand-primary text-white border-brand-primary shadow-xs'
                                    : 'bg-white dark:bg-[#141417] border-zinc-200/80 dark:border-white/[0.08] text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                            }`}
                            title="Filter by my listed items"
                        >
                            <User className="w-3.5 h-3.5" />
                            <span>{showUserOnly ? 'All Items' : 'My Listings'}</span>
                            {showUserOnly && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                        </button>

                        <button
                            onClick={() => {
                                if (!userProfile) showToast("Please sign in to list items.", "info");
                                else setShowSellModal(true);
                            }}
                            className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl text-xs font-semibold tracking-wide shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-2 border-none cursor-pointer"
                        >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                            <span>Post Ad</span>
                        </button>
                    </div>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    {categories.map((c) => (
                        <button
                            key={c}
                            onClick={() => handleFilterChange(c)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border cursor-pointer ${
                                filter === c
                                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs'
                                    : 'bg-white dark:bg-[#141417] text-zinc-600 dark:text-zinc-400 border-zinc-200/80 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-zinc-700'
                            }`}
                        >
                            {c}
                        </button>
                    ))}
                    <span className="text-[11px] text-zinc-400 font-medium ml-auto pl-2 shrink-0">
                        {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                    </span>
                </div>
            </div>

            {/* Product Cards Grid */}
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4.5">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-[#141417] rounded-2xl border border-zinc-200/80 dark:border-white/[0.08] overflow-hidden space-y-3 p-3 animate-pulse">
                            <div className="aspect-[4/3] rounded-xl bg-zinc-200/70 dark:bg-white/[0.05]" />
                            <div className="space-y-1.5 px-1">
                                <div className="h-3 w-16 bg-zinc-200/70 dark:bg-white/[0.05] rounded" />
                                <div className="h-4 w-3/4 bg-zinc-200/70 dark:bg-white/[0.05] rounded-md" />
                                <div className="h-3 w-1/2 bg-zinc-200/70 dark:bg-white/[0.05] rounded" />
                            </div>
                            <div className="pt-2 border-t border-zinc-100 dark:border-white/[0.05] flex items-center justify-between">
                                <div className="h-3 w-20 bg-zinc-200/70 dark:bg-white/[0.05] rounded" />
                                <div className="h-6 w-12 bg-zinc-200/70 dark:bg-white/[0.05] rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="py-20 px-4 text-center rounded-2xl bg-white dark:bg-[#141417] border border-zinc-200/80 dark:border-white/[0.08] space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-semibold text-zinc-900 dark:text-white">No items found</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                        {searchQuery 
                            ? `No listings matched "${searchQuery}". Try a different keyword or reset filters.`
                            : `No listings available in "${filter}". Pass your gear to the next ${studentTerm}!`
                        }
                    </p>
                    <button
                        onClick={() => {
                            if (!userProfile) showToast("Sign in required to post.", "info");
                            else setShowSellModal(true);
                        }}
                        className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-all border-none cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Post the First Ad</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4.5">
                    {filteredItems.map(item => {
                        const isOwner = item.seller_id === userProfile?.id;
                        return (
                            <div
                                key={item.id}
                                onClick={() => { setSelectedItem(item); navigate(`${baseRoute}/item/${item.id}`); }}
                                className="group relative bg-white dark:bg-[#141417] rounded-2xl border border-zinc-200/80 dark:border-white/[0.08] hover:border-brand-primary/40 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-lg cursor-pointer"
                            >
                                <div>
                                    {/* Image Container with Badges */}
                                    <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-white/[0.02] overflow-hidden">
                                        {item.images && item.images.length > 0 ? (
                                            <img
                                                src={item.images[0]}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 gap-1.5 opacity-60">
                                                <ImageIcon className="w-8 h-8" />
                                                <span className="text-[10px] font-medium">No Image</span>
                                            </div>
                                        )}

                                        {/* Condition Badge pinned top-left */}
                                        <div className="absolute top-2.5 left-2.5 z-10">
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-xs">
                                                {item.condition || 'Good'}
                                            </span>
                                        </div>

                                        {/* Price Tag pinned top-right */}
                                        <div className="absolute top-2.5 right-2.5 z-10">
                                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/95 dark:bg-[#141417]/95 backdrop-blur-md text-zinc-900 dark:text-white border border-zinc-200/60 dark:border-white/10 shadow-xs">
                                                {formatPrice(item.price)}
                                            </span>
                                        </div>

                                        {/* Owner edit/delete buttons on image hover */}
                                        {isOwner && (
                                            <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                                                    title="Edit listing"
                                                    className="p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-blue-400 hover:text-white transition-colors border border-white/10 cursor-pointer"
                                                >
                                                    <Edit3 className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                                    title="Delete listing"
                                                    className="p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-rose-400 hover:text-white transition-colors border border-white/10 cursor-pointer"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Item Meta Information */}
                                    <div className="p-3.5 space-y-1.5 text-left">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">
                                                {item.category}
                                            </span>
                                            {item.location && (
                                                <>
                                                    <span className="text-[10px] text-zinc-300 dark:text-zinc-600">•</span>
                                                    <span className="text-[10px] text-zinc-400 truncate flex items-center gap-0.5">
                                                        <MapPin className="w-2.5 h-2.5 shrink-0" />
                                                        {item.location}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white tracking-tight line-clamp-1 group-hover:text-brand-primary transition-colors">
                                            {item.title}
                                        </h3>

                                        {item.description && (
                                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 font-normal">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Seller & Quick Contact Row */}
                                <div className="px-3.5 pb-3 pt-2 border-t border-zinc-100 dark:border-white/[0.05] flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                                            {item.seller_username?.[0]?.toUpperCase() || 'V'}
                                        </div>
                                        <div className="min-w-0 flex items-center gap-1">
                                            <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300 truncate">
                                                {item.seller_username || studentTerm}
                                            </span>
                                            <VerifiedBadge isAdmin={item.seller_is_admin} size="w-3 h-3" />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        {item.seller_phone && (
                                            <>
                                                <a
                                                    href={`tel:${item.seller_phone}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    title="Call Seller"
                                                    className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-white/[0.05] hover:bg-brand-primary hover:text-white text-zinc-500 dark:text-zinc-300 flex items-center justify-center transition-colors border-none text-decoration-none"
                                                >
                                                    <Phone className="w-3 h-3" />
                                                </a>
                                                <a
                                                    href={`https://wa.me/${item.seller_phone.replace(/\D/g, '').length === 10 ? '91' + item.seller_phone.replace(/\D/g, '') : item.seller_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in your "${item.title}" on ${fullBrandName}.`)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    title="Chat on WhatsApp"
                                                    className="w-7 h-7 rounded-lg bg-emerald-500/10 hover:bg-[#25D366] text-emerald-600 dark:text-emerald-400 hover:text-white flex items-center justify-center transition-colors border-none text-decoration-none"
                                                >
                                                    <MessageCircle className="w-3.5 h-3.5" />
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Detailed Item Modal */}
            {selectedItem && createPortal(
                <div
                    className={`modal-overlay ${isClosingDetail ? 'closing' : ''}`}
                    style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
                    onClick={(e) => { if (e.target === e.currentTarget) handleCloseDetail(); }}
                >
                    <div 
                        className={`bg-white dark:bg-[#141417] w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl relative shadow-2xl border border-zinc-200/80 dark:border-white/[0.08] flex flex-col md:flex-row text-left ${isClosingDetail ? 'closing' : ''}`}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={handleCloseDetail}
                            className="absolute top-4 right-4 z-50 w-8 h-8 rounded-xl bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-all border-none cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Modal Image */}
                        <div className="w-full md:w-1/2 h-[260px] md:h-auto bg-zinc-100 dark:bg-white/[0.02] relative overflow-hidden flex items-center justify-center">
                            {selectedItem.images && selectedItem.images.length > 0 ? (
                                <img
                                    src={selectedItem.images[0]}
                                    alt={selectedItem.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-zinc-400 gap-2 opacity-50">
                                    <ImageIcon className="w-12 h-12" />
                                    <span className="text-xs font-medium">No photo uploaded</span>
                                </div>
                            )}
                            <div className="absolute top-4 left-4">
                                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-xs">
                                    {selectedItem.condition} Condition
                                </span>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 p-6 sm:p-8 overflow-y-auto custom-scrollbar flex flex-col justify-between space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-wider">
                                            {selectedItem.category}
                                        </span>
                                        {selectedItem.location && (
                                            <span className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
                                                <MapPin className="w-3 h-3 text-brand-primary" />
                                                {selectedItem.location}
                                            </span>
                                        )}
                                    </div>

                                    <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                                        {selectedItem.title}
                                    </h2>

                                    <div className="pt-1">
                                        <span className="text-2xl sm:text-3xl font-extrabold text-brand-primary">
                                            {formatPrice(selectedItem.price)}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <h5 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                                        Description
                                    </h5>
                                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal whitespace-pre-wrap">
                                        {selectedItem.description}
                                    </p>
                                </div>
                            </div>

                            {/* Seller & Action Footer */}
                            <div className="pt-5 border-t border-zinc-100 dark:border-white/[0.06] space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-sm font-bold shadow-xs">
                                        {selectedItem.seller_username?.[0]?.toUpperCase() || 'V'}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate">
                                                {selectedItem.seller_username || studentTerm}
                                            </h4>
                                            <VerifiedBadge isAdmin={selectedItem.seller_is_admin} size="w-3.5 h-3.5" />
                                        </div>
                                        <p className="text-[11px] text-zinc-400 font-medium">Verified Campus Seller</p>
                                    </div>
                                </div>

                                {selectedItem.seller_phone ? (
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <a
                                            href={`https://wa.me/${selectedItem.seller_phone.replace(/\D/g, '').length === 10 ? '91' + selectedItem.seller_phone.replace(/\D/g, '') : selectedItem.seller_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in buying your "${selectedItem.title}" on ${fullBrandName}.`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#22bf5b] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs text-decoration-none transition-all active:scale-95"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            <span>WhatsApp</span>
                                        </a>

                                        <a
                                            href={`tel:${selectedItem.seller_phone}`}
                                            className="py-3 px-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs text-decoration-none transition-all active:scale-95"
                                        >
                                            <Phone className="w-4 h-4" />
                                            <span>Call Seller</span>
                                        </a>
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] text-center text-xs text-zinc-400">
                                        No phone provided on this listing.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>,
                document.getElementById('modal-root') || document.body
            )}

            {/* Post / Edit Ad Modal */}
            {showSellModal && createPortal(
                <div
                    className={`modal-overlay ${isClosingSell ? 'closing' : ''}`}
                    style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
                    onClick={(e) => { if (e.target === e.currentTarget) handleCloseSell(); }}
                >
                    <div className={`nexus-modal w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#141417] border border-zinc-200/80 dark:border-white/[0.08] shadow-2xl relative flex flex-col text-left ${isClosingSell ? 'closing' : ''}`}>
                        <button
                            onClick={handleCloseSell}
                            className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors border-none cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="mb-5">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                                {editingItem ? 'Edit Listing' : 'Post an Ad'}
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal mt-0.5">
                                List books, gear, cycles, and electronics for fellow students.
                            </p>
                        </div>

                        <form onSubmit={handleSellSubmit} className="space-y-4 max-h-[72vh] overflow-y-auto pr-1 custom-scrollbar">
                            {/* Photo Upload Box */}
                            <div>
                                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 ml-0.5">
                                    Product Photo
                                </label>
                                <div
                                    onClick={() => document.getElementById('market-image-upload')?.click()}
                                    className="group relative w-full h-32 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-white/10 hover:border-brand-primary/50 transition-all overflow-hidden flex flex-col items-center justify-center cursor-pointer bg-zinc-50 dark:bg-white/[0.02]"
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center space-y-1.5 p-4">
                                            <UploadCloud className="w-7 h-7 mx-auto text-zinc-400 group-hover:text-brand-primary transition-colors" />
                                            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                                                Click to upload product image
                                            </p>
                                            <p className="text-[10px] text-zinc-400">PNG, JPG, WEBP up to 5MB</p>
                                        </div>
                                    )}
                                    <input
                                        id="market-image-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 ml-0.5">
                                    Item Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newItem.title}
                                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                    placeholder="e.g. PEL130 Practice Book (Like New)"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/[0.08] focus:border-brand-primary/60 outline-none text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 font-medium transition-all"
                                />
                            </div>

                            {/* Price & Category */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 ml-0.5">
                                        Price (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={newItem.price}
                                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                        placeholder="e.g. 399"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/[0.08] focus:border-brand-primary/60 outline-none text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 font-medium transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 ml-0.5">
                                        Category *
                                    </label>
                                    <select
                                        value={newItem.category}
                                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/[0.08] focus:border-brand-primary/60 outline-none text-xs text-zinc-900 dark:text-white font-medium transition-all cursor-pointer"
                                    >
                                        {categories.filter(c => c !== 'All').map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Condition & Location */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 ml-0.5">
                                        Condition *
                                    </label>
                                    <select
                                        value={newItem.condition}
                                        onChange={(e) => setNewItem({ ...newItem, condition: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/[0.08] focus:border-brand-primary/60 outline-none text-xs text-zinc-900 dark:text-white font-medium transition-all cursor-pointer"
                                    >
                                        <option value="Brand New">Brand New</option>
                                        <option value="Like New">Like New</option>
                                        <option value="Good">Good</option>
                                        <option value="Fair">Fair</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 ml-0.5">
                                        Hostel / Pickup Point *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newItem.location}
                                        onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                                        placeholder="e.g. BH-5 or Uni Mall"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/[0.08] focus:border-brand-primary/60 outline-none text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 font-medium transition-all"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 ml-0.5">
                                    Description *
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={newItem.description}
                                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                    placeholder="Provide key details, edition, included accessories, or reasons for selling..."
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/[0.08] focus:border-brand-primary/60 outline-none text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 font-medium transition-all resize-none"
                                />
                            </div>

                            {/* Contact Number */}
                            <div>
                                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 ml-0.5">
                                    WhatsApp / Phone Number *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newItem.phone}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (/^\d*$/.test(val)) setNewItem({ ...newItem, phone: val });
                                    }}
                                    placeholder="e.g. 98150XXXXX (for WhatsApp and call)"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/[0.08] focus:border-brand-primary/60 outline-none text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 font-medium transition-all"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseSell}
                                    className="px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-white/5 transition-colors border border-zinc-200/60 dark:border-white/[0.06] cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-sm active:scale-95 transition-all border-none cursor-pointer disabled:opacity-50"
                                >
                                    {submitting ? 'Listing...' : editingItem ? 'Save Changes' : 'List Item Now'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.getElementById('modal-root') || document.body
            )}
        </div>
    );
};

export default MarketplaceHub;
