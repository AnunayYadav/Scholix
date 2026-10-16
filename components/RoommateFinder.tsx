import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { RoommateRequest, UserProfile } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';
import { showToast } from './Toast.tsx';
import VerifiedBadge from './VerifiedBadge.tsx';
import { 
    Search, 
    MapPin, 
    Wallet, 
    Users, 
    X, 
    Plus, 
    Phone, 
    MessageCircle, 
    Copy, 
    Check, 
    Trash2, 
    Edit3,
    Calendar,
    Sparkles,
    ShieldCheck
} from 'lucide-react';

const RoommateFinder: React.FC<{ userProfile: UserProfile | null }> = ({ userProfile }) => {
    const [requests, setRequests] = useState<RoommateRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPostModal, setShowPostModal] = useState(false);
    const [showUserOnly, setShowUserOnly] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'hostel' | 'flat' | 'boys' | 'girls'>('all');
    const [editingRequest, setEditingRequest] = useState<RoommateRequest | null>(null);
    const [connectingRequest, setConnectingRequest] = useState<RoommateRequest | null>(null);
    const [hasCopiedContact, setHasCopiedContact] = useState(false);

    const [newRequest, setNewRequest] = useState({
        location: '',
        budget: '',
        preferences: '',
        gender_preference: 'Any',
        contact_info: ''
    });

    const [isClosingPost, setIsClosingPost] = useState(false);
    const [isClosingConnect, setIsClosingConnect] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await NexusServer.fetchRoommateRequests();
            const mapped = (data || []).map((req: any) => ({
                ...req,
                user_username: req.user?.username || req.user_username || 'Nexus Scholar',
                user_avatar: req.user?.avatar_url || req.user_avatar,
                contact_info: req.contact_info || '',
                gender_preference: req.gender_preference || 'Any'
            }));
            setRequests(mapped as RoommateRequest[]);
        } catch (err: any) {
            console.error("Failed to load roommate requests:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClosePost = () => {
        setIsClosingPost(true);
        setTimeout(() => {
            setShowPostModal(false);
            setEditingRequest(null);
            setNewRequest({ location: '', budget: '', preferences: '', gender_preference: 'Any', contact_info: '' });
            setIsClosingPost(false);
        }, 250);
    };

    const handleCloseConnect = () => {
        setIsClosingConnect(true);
        setTimeout(() => {
            setConnectingRequest(null);
            setHasCopiedContact(false);
            setIsClosingConnect(false);
        }, 250);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userProfile) { 
            showToast("Please sign in to post a request.", "info"); 
            return; 
        }
        if (!newRequest.location.trim() || !newRequest.budget.trim() || !newRequest.preferences.trim() || !newRequest.contact_info.trim()) {
            showToast("Location, budget, contact info, and lifestyle details are required.", "info");
            return;
        }

        setSubmitting(true);
        try {
            const requestData = {
                ...newRequest,
                user_id: userProfile.id,
                status: 'Active'
            };

            if (editingRequest) {
                await NexusServer.updateRoommateRequest(editingRequest.id, requestData);
                showToast("Request updated successfully!", "success");
            } else {
                await NexusServer.createRoommateRequest(requestData);
                showToast("Roommate request posted!", "success");
                NexusServer.saveRecord(userProfile.id, 'roommate_post', `Posted roommate request for ${requestData.location}`, { 
                    location: requestData.location, 
                    budget: requestData.budget 
                });
            }

            handleClosePost();
            fetchRequests();
        } catch (err: any) {
            showToast("Error: " + (err.message || 'Failed to save request'), "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this listing?")) return;
        try {
            await NexusServer.deleteRoommateRequest(id);
            showToast("Listing deleted.", "success");
            fetchRequests();
        } catch (err: any) {
            showToast("Error: " + err.message, "error");
        }
    };

    const handleEdit = (req: RoommateRequest) => {
        setEditingRequest(req);
        setNewRequest({
            location: req.location || '',
            budget: req.budget || '',
            preferences: req.preferences || '',
            gender_preference: req.gender_preference || 'Any',
            contact_info: req.contact_info || ''
        });
        setShowPostModal(true);
    };

    // Filter logic
    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            if (showUserOnly && req.user_id !== userProfile?.id) return false;

            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const locMatch = req.location?.toLowerCase().includes(query);
                const prefMatch = req.preferences?.toLowerCase().includes(query);
                const userMatch = req.user_username?.toLowerCase().includes(query);
                if (!locMatch && !prefMatch && !userMatch) return false;
            }

            if (selectedCategory === 'hostel') {
                const loc = (req.location || '').toLowerCase();
                if (!loc.includes('hostel') && !loc.includes('bh') && !loc.includes('gh') && !loc.includes('seater')) {
                    return false;
                }
            } else if (selectedCategory === 'flat') {
                const loc = (req.location || '').toLowerCase();
                if (!loc.includes('flat') && !loc.includes('pg') && !loc.includes('gate') && !loc.includes('apartment') && !loc.includes('room')) {
                    return false;
                }
            } else if (selectedCategory === 'boys') {
                if (req.gender_preference !== 'Boys Only') return false;
            } else if (selectedCategory === 'girls') {
                if (req.gender_preference !== 'Girls Only') return false;
            }

            return true;
        });
    }, [requests, showUserOnly, userProfile?.id, searchQuery, selectedCategory]);

    const formatBudget = (raw: string) => {
        if (!raw || raw === '0') return 'Flexible Budget';
        if (raw.startsWith('₹') || raw.toLowerCase().includes('rs') || raw.toLowerCase().includes('k')) return raw;
        const num = parseFloat(raw);
        if (!isNaN(num) && num > 0) return `₹${num.toLocaleString('en-IN')}`;
        return raw;
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setHasCopiedContact(true);
        showToast("Contact copied to clipboard!", "success");
        setTimeout(() => setHasCopiedContact(false), 2500);
    };

    const formatRelativeTime = (dateStr: string) => {
        if (!dateStr) return 'Recently';
        const diffMs = Date.now() - new Date(dateStr).getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 30) return `${diffDays}d ago`;
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="animate-fade-in space-y-6">
            {/* Top Toolbar: Search, Filters & Action Buttons */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by hostel, flat, preferences..."
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
                        >
                            <Users className="w-3.5 h-3.5" />
                            <span>{showUserOnly ? 'All Listings' : 'My Requests'}</span>
                            {showUserOnly && (
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            )}
                        </button>

                        <button
                            onClick={() => {
                                if (!userProfile) showToast("Sign in required to post.", "info");
                                else setShowPostModal(true);
                            }}
                            className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl text-xs font-semibold tracking-wide shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-2 border-none cursor-pointer"
                        >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                            <span>Post Request</span>
                        </button>
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    {[
                        { id: 'all', label: 'All Requests' },
                        { id: 'hostel', label: 'Campus Hostels' },
                        { id: 'flat', label: 'Flats & PGs' },
                        { id: 'boys', label: 'Boys Only' },
                        { id: 'girls', label: 'Girls Only' },
                    ].map((pill) => (
                        <button
                            key={pill.id}
                            onClick={() => setSelectedCategory(pill.id as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border cursor-pointer ${
                                selectedCategory === pill.id
                                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs'
                                    : 'bg-white dark:bg-[#141417] text-zinc-600 dark:text-zinc-400 border-zinc-200/80 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-zinc-700'
                            }`}
                        >
                            {pill.label}
                        </button>
                    ))}
                    <span className="text-[11px] text-zinc-400 font-medium ml-auto pl-2 shrink-0">
                        {filteredRequests.length} {filteredRequests.length === 1 ? 'listing' : 'listings'}
                    </span>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="p-5 bg-white dark:bg-[#141417] rounded-2xl border border-zinc-200/80 dark:border-white/[0.08] space-y-4 animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-zinc-200/70 dark:bg-white/[0.05]" />
                                <div className="space-y-1.5 flex-1">
                                    <div className="h-4 w-32 bg-zinc-200/70 dark:bg-white/[0.05] rounded-md" />
                                    <div className="h-3 w-20 bg-zinc-200/70 dark:bg-white/[0.05] rounded-md" />
                                </div>
                            </div>
                            <div className="h-14 bg-zinc-200/50 dark:bg-white/[0.03] rounded-xl" />
                            <div className="flex justify-between items-center pt-2">
                                <div className="h-4 w-28 bg-zinc-200/70 dark:bg-white/[0.05] rounded-md" />
                                <div className="h-8 w-20 bg-zinc-200/70 dark:bg-white/[0.05] rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="py-20 px-4 text-center rounded-2xl bg-white dark:bg-[#141417] border border-zinc-200/80 dark:border-white/[0.08] space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
                        <Users className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-semibold text-zinc-900 dark:text-white">No roommate requests found</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                        {searchQuery 
                            ? `No listings matched "${searchQuery}". Try a different keyword or reset filters.`
                            : "Be the first student to post a roommate requirement in this category!"
                        }
                    </p>
                    <button
                        onClick={() => {
                            if (!userProfile) showToast("Sign in required to post.", "info");
                            else setShowPostModal(true);
                        }}
                        className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-all border-none cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Post Request Now</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4.5">
                    {filteredRequests.map(req => {
                        const isOwner = req.user_id === userProfile?.id;
                        return (
                            <div
                                key={req.id}
                                className="group relative bg-white dark:bg-[#141417] rounded-2xl border border-zinc-200/80 dark:border-white/[0.08] hover:border-brand-primary/40 transition-all duration-300 p-5 flex flex-col justify-between shadow-xs hover:shadow-lg"
                            >
                                <div className="space-y-3.5">
                                    {/* Card Header: User, Gender Pill, and Owner Controls */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {req.user_avatar ? (
                                                <img 
                                                    src={req.user_avatar} 
                                                    alt={req.user_username} 
                                                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-zinc-200/70 dark:border-white/10" 
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-xs">
                                                    {req.user_username?.[0]?.toUpperCase() || 'V'}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                                                        {req.user_username || 'Nexus Scholar'}
                                                    </h4>
                                                    <VerifiedBadge isAdmin={req.user_is_admin} size="w-3.5 h-3.5" />
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        Active
                                                    </span>
                                                    <span className="text-[10px] text-zinc-300 dark:text-zinc-600">•</span>
                                                    <span className="text-[10px] text-zinc-400 font-medium">
                                                        {formatRelativeTime(req.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            {/* Gender tag */}
                                            {req.gender_preference && req.gender_preference !== 'Any' ? (
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                                                    req.gender_preference === 'Boys Only'
                                                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                                }`}>
                                                    {req.gender_preference}
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-white/5 border border-zinc-200/60 dark:border-white/[0.05]">
                                                    Any Gender
                                                </span>
                                            )}

                                            {/* Owner actions */}
                                            {isOwner && (
                                                <div className="flex items-center gap-1 ml-1">
                                                    <button
                                                        onClick={() => handleEdit(req)}
                                                        title="Edit request"
                                                        className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors border-none bg-transparent cursor-pointer"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(req.id)}
                                                        title="Delete request"
                                                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors border-none bg-transparent cursor-pointer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Location & Budget Pills */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-white/[0.06] text-xs font-medium">
                                            <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                                            <span className="truncate max-w-[200px]">{req.location}</span>
                                        </div>

                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                                            <Wallet className="w-3.5 h-3.5 shrink-0" />
                                            <span>{formatBudget(req.budget)}</span>
                                        </div>
                                    </div>

                                    {/* Lifestyle & Preferences Quote Box */}
                                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/[0.04] text-left">
                                        <p className="text-xs text-zinc-600 dark:text-zinc-300 font-normal leading-relaxed line-clamp-3">
                                            "{req.preferences}"
                                        </p>
                                    </div>
                                </div>

                                {/* Card Footer: Connect Action */}
                                <div className="pt-3.5 mt-3.5 border-t border-zinc-100 dark:border-white/[0.05] flex items-center justify-between gap-3">
                                    <span className="text-[11px] text-zinc-400 font-medium">
                                        {req.contact_info ? 'Direct contact available' : 'Active student post'}
                                    </span>

                                    <button
                                        onClick={() => setConnectingRequest(req)}
                                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-brand-primary dark:hover:bg-brand-primary hover:text-white dark:hover:text-white transition-all border-none cursor-pointer active:scale-95 shadow-xs"
                                    >
                                        Connect
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Connect Modal */}
            {connectingRequest && createPortal(
                <div
                    className={`modal-overlay ${isClosingConnect ? 'closing' : ''}`}
                    style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
                    onClick={(e) => { if (e.target === e.currentTarget) handleCloseConnect(); }}
                >
                    <div className={`nexus-modal w-full max-w-md p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#141417] border border-zinc-200/80 dark:border-white/[0.08] shadow-2xl relative flex flex-col text-left ${isClosingConnect ? 'closing' : ''}`}>
                        <button
                            onClick={handleCloseConnect}
                            className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors border-none cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-3.5 mb-5">
                            {connectingRequest.user_avatar ? (
                                <img
                                    src={connectingRequest.user_avatar}
                                    alt={connectingRequest.user_username}
                                    className="w-12 h-12 rounded-2xl object-cover border border-zinc-200/80 dark:border-white/10"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-lg font-bold shadow-xs">
                                    {connectingRequest.user_username?.[0]?.toUpperCase() || 'V'}
                                </div>
                            )}
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
                                        {connectingRequest.user_username || 'Nexus Scholar'}
                                    </h3>
                                    <VerifiedBadge isAdmin={connectingRequest.user_is_admin} size="w-4 h-4" />
                                </div>
                                <p className="text-xs text-zinc-400 font-medium">Looking for a roommate</p>
                            </div>
                        </div>

                        {/* Details summary */}
                        <div className="space-y-3 mb-6">
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/[0.05]">
                                    <span className="text-[10px] font-semibold uppercase text-zinc-400 block mb-1">Target Location</span>
                                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1 truncate">
                                        <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                                        {connectingRequest.location}
                                    </span>
                                </div>
                                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/[0.05]">
                                    <span className="text-[10px] font-semibold uppercase text-zinc-400 block mb-1">Budget</span>
                                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate">
                                        <Wallet className="w-3.5 h-3.5 shrink-0" />
                                        {formatBudget(connectingRequest.budget)}
                                    </span>
                                </div>
                            </div>

                            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/[0.05]">
                                <span className="text-[10px] font-semibold uppercase text-zinc-400 block mb-1">Habits & Lifestyle</span>
                                <p className="text-xs text-zinc-600 dark:text-zinc-300 font-normal leading-relaxed italic">
                                    "{connectingRequest.preferences}"
                                </p>
                            </div>
                        </div>

                        {/* Contact Channel Options */}
                        <div className="space-y-2.5">
                            {connectingRequest.contact_info ? (
                                <>
                                    {/* Direct Phone / WhatsApp if valid digits */}
                                    {connectingRequest.contact_info.replace(/\D/g, '').length >= 10 && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <a
                                                href={`https://wa.me/${
                                                    connectingRequest.contact_info.replace(/\D/g, '').length === 10
                                                        ? '91' + connectingRequest.contact_info.replace(/\D/g, '')
                                                        : connectingRequest.contact_info.replace(/\D/g, '')
                                                }?text=${encodeURIComponent(`Hi ${connectingRequest.user_username || ''}, I saw your roommate request for ${connectingRequest.location} on Nexus!`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#22bf5b] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm text-decoration-none transition-all active:scale-95"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                <span>WhatsApp</span>
                                            </a>

                                            <a
                                                href={`tel:${connectingRequest.contact_info.replace(/\D/g, '')}`}
                                                className="py-3 px-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm text-decoration-none transition-all active:scale-95"
                                            >
                                                <Phone className="w-4 h-4" />
                                                <span>Call</span>
                                            </a>
                                        </div>
                                    )}

                                    {/* Copy Contact Handle / Raw Info */}
                                    <button
                                        onClick={() => copyToClipboard(connectingRequest.contact_info || '')}
                                        className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 dark:bg-white/[0.05] hover:bg-zinc-200/80 dark:hover:bg-white/[0.08] text-zinc-700 dark:text-zinc-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors border border-zinc-200/60 dark:border-white/[0.06] cursor-pointer"
                                    >
                                        {hasCopiedContact ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                        <span>{hasCopiedContact ? 'Copied to clipboard' : `Copy: ${connectingRequest.contact_info}`}</span>
                                    </button>
                                </>
                            ) : (
                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
                                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                        No direct phone was specified on this listing.
                                    </p>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                        You can look up @{connectingRequest.user_username} in the community chat or campus hub!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.getElementById('modal-root') || document.body
            )}

            {/* Post / Edit Request Modal */}
            {showPostModal && createPortal(
                <div
                    className={`modal-overlay ${isClosingPost ? 'closing' : ''}`}
                    style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
                    onClick={(e) => { if (e.target === e.currentTarget) handleClosePost(); }}
                >
                    <div className={`nexus-modal w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#141417] border border-zinc-200/80 dark:border-white/[0.08] shadow-2xl relative flex flex-col text-left ${isClosingPost ? 'closing' : ''}`}>
                        <button
                            onClick={handleClosePost}
                            className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors border-none cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="mb-5">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                                {editingRequest ? 'Edit Roommate Request' : 'Find a Roommate'}
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal mt-0.5">
                                Specify your room preferences and expectations.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 ml-0.5">
                                        Preferred Location *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newRequest.location}
                                        onChange={(e) => setNewRequest({ ...newRequest, location: e.target.value })}
                                        placeholder="e.g. BH-3 3-Seater / Law Gate"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/[0.08] focus:border-brand-primary/60 outline-none text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 font-medium transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 ml-0.5">
                                        Budget / Sharing *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newRequest.budget}
                                        onChange={(e) => setNewRequest({ ...newRequest, budget: e.target.value })}
                                        placeholder="e.g. 5,000 / mo or Split 50%"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/[0.08] focus:border-brand-primary/60 outline-none text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 font-medium transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 ml-0.5">
                                        Gender Preference
                                    </label>
                                    <select
                                        value={newRequest.gender_preference}
                                        onChange={(e) => setNewRequest({ ...newRequest, gender_preference: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/[0.08] focus:border-brand-primary/60 outline-none text-xs text-zinc-900 dark:text-white font-medium transition-all cursor-pointer"
                                    >
                                        <option value="Any">Any Gender</option>
                                        <option value="Boys Only">Boys Only</option>
                                        <option value="Girls Only">Girls Only</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 ml-0.5">
                                        Contact Info (WhatsApp / Phone) *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newRequest.contact_info}
                                        onChange={(e) => setNewRequest({ ...newRequest, contact_info: e.target.value })}
                                        placeholder="e.g. 98150XXXXX or @insta"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/[0.08] focus:border-brand-primary/60 outline-none text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 font-medium transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 ml-0.5">
                                    Lifestyle Habits & Expectations *
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={newRequest.preferences}
                                    onChange={(e) => setNewRequest({ ...newRequest, preferences: e.target.value })}
                                    placeholder="e.g. Non-smoker, focused on study, early riser, 3rd year CSE student..."
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/[0.08] focus:border-brand-primary/60 outline-none text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 font-medium transition-all resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={handleClosePost}
                                    className="px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-white/5 transition-colors border border-zinc-200/60 dark:border-white/[0.06] cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-sm active:scale-95 transition-all border-none cursor-pointer disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : editingRequest ? 'Update Request' : 'Post Request'}
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

export default RoommateFinder;
