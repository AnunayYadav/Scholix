import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Phone, Copy, Check, ChevronDown, Search, X,
    Building2, Stethoscope, HeartPulse, HelpCircle,
    Shield, Users, Flame, Scale, Landmark, ShieldAlert,
    PhoneCall
} from 'lucide-react';
import { showToast } from './Toast.tsx';
import { allDirectory, coreContacts as coreContactsData, ContactInfo } from '../data/emergencyData.ts';
import { useUniversity } from '../hooks/useUniversity.tsx';

const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'Hostel':
            return <Building2 className="w-5 h-5" />;
        case 'Doctor':
            return <Stethoscope className="w-5 h-5" />;
        case 'Nursing':
            return <HeartPulse className="w-5 h-5" />;
        case 'Counseling':
            return <HelpCircle className="w-5 h-5" />;
        case 'Hospital':
            return <Building2 className="w-5 h-5" />;
        case 'Facility':
            return <Shield className="w-5 h-5" />;
        case 'Women Support':
            return <Users className="w-5 h-5" />;
        case 'Fire & Safety':
            return <Flame className="w-5 h-5" />;
        case 'Accounts':
            return <Scale className="w-5 h-5" />;
        case 'Student Relations':
            return <Users className="w-5 h-5" />;
        case 'Administrative':
            return <Landmark className="w-5 h-5" />;
        default:
            return <ShieldAlert className="w-5 h-5" />;
    }
};

const EmergencyContacts: React.FC = () => {
    const { universityInfo, shortBrandName } = useUniversity();
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get('q');
        if (q) setSearchQuery(q);
    }, [location.search]);

    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const copyToClipboard = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedNumber(text);
        showToast("Number copied to clipboard!", "success");
        setTimeout(() => {
            setCopiedNumber(prev => prev === text ? null : prev);
        }, 1800);
    };

    const coreContacts = useMemo(() => {
        return coreContactsData.map(contact => ({
            ...contact,
            watermark: contact.iconType === 'fire' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute -right-3 -bottom-3 w-24 h-24 opacity-15 rotate-12 pointer-events-none text-white">
                    <path d="M12 2c0 0-2 4.5-2 7.5s2 5.5 2 5.5 2-2.5 2-5.5-2-7.5-2-7.5z" />
                    <path d="M12 6c0 0-1.5 3-1.5 5s1.5 4 1.5 4 1.5-2 1.5-4-1.5-5-1.5-5z" />
                    <path d="M8.5 14.5c0 0-2.5 1.5-2.5 4.5s2.5 4 6 4 6-1 6-4-2.5-4.5-2.5-4.5" />
                </svg>
            ) : contact.iconType === 'hospital' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute -right-3 -bottom-3 w-24 h-24 opacity-15 -rotate-12 pointer-events-none text-white">
                    <path d="M19 14l-2-2m0 0l-2 2m2-2V6m2 13H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11l3 3v11a2 2 0 0 1-2 2z" />
                </svg>
            ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute -right-3 -bottom-3 w-24 h-24 opacity-15 rotate-12 pointer-events-none text-white">
                    <circle cx="12" cy="8" r="5" />
                    <path d="M3 21c0-4.5 9-4.5 9-4.5s9 0 9 4.5" />
                </svg>
            )
        }));
    }, []);

    const filteredDirectory = useMemo(() => {
        if (!universityInfo || universityInfo.id !== 'lpu') return [];
        if (!searchQuery) return allDirectory;
        const q = searchQuery.toLowerCase();
        return allDirectory.filter(item =>
            item.title.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.subTitle?.toLowerCase().includes(q)
        );
    }, [searchQuery, universityInfo]);

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-0 py-6 space-y-7 animate-fade-in pb-28 focus-visible:outline-none">
            {/* Header Section */}
            <header className="text-center space-y-1">
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-none">
                    Rescue <span className="text-orange-500">Line</span>
                </h2>
                <p className="text-zinc-400 text-xs sm:text-sm font-medium">
                    Essential Services Directory
                </p>
            </header>

            {/* Core Priority Emergency Cards - Reduced width on desktop, horizontal carousel on mobile to avoid stretched banners */}
            <div className="max-w-2xl mx-auto w-full">
                <div className="flex md:grid overflow-x-auto no-scrollbar snap-x snap-mandatory gap-3 pb-2 md:pb-0 md:grid-cols-3 px-1 md:px-0">
                    {coreContacts.map((contact, i) => (
                        <div
                            key={i}
                            className={`bg-gradient-to-br ${contact.color} p-3.5 sm:p-4 rounded-2xl relative overflow-hidden shadow-sm flex flex-col justify-between gap-3 min-h-[125px] border border-white/10 w-[76vw] max-w-[260px] md:w-auto shrink-0 snap-center`}
                        >
                            {contact.watermark}
                            <div className="relative z-10 space-y-2">
                                {/* Card Header */}
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="text-xs sm:text-[12px] font-extrabold text-white uppercase tracking-wider truncate">
                                        {contact.title}
                                    </h3>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[9px] font-bold tracking-tight shrink-0">
                                        {contact.status.includes('24') ? (
                                            <span className="relative flex h-1.5 w-1.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                                            </span>
                                        ) : (
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-300 shrink-0" />
                                        )}
                                        {contact.status}
                                    </span>
                                </div>

                                {/* Contact Numbers in Translucent Glass Rows */}
                                <div className="space-y-1.5">
                                    {contact.numbers.map((num, ni) => (
                                        <div
                                            key={ni}
                                            className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-black/25 hover:bg-black/35 backdrop-blur-sm transition-all group/num"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-white/90 shrink-0">
                                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                                </svg>
                                                <a
                                                    href={`tel:${num}`}
                                                    className="text-xs font-bold text-white tracking-tight leading-none no-underline hover:underline truncate"
                                                >
                                                    {num}
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    onClick={() => copyToClipboard(num)}
                                                    title="Copy Number"
                                                    className="p-1 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-all border-none bg-transparent cursor-pointer"
                                                >
                                                    {copiedNumber === num ? (
                                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                    ) : (
                                                        <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {(!universityInfo || universityInfo.id !== 'lpu') && (
                <div className="flex flex-col items-center justify-center py-10 px-4 rounded-2xl border border-zinc-200/70 dark:border-white/5 bg-white dark:bg-[#111113]">
                    <div className="w-9 h-9 bg-orange-500/10 rounded-full flex items-center justify-center mb-2.5">
                        <ShieldAlert className="w-4.5 h-4.5 text-orange-500" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Emergency Directory Coming Soon</h3>
                    <p className="text-zinc-400 text-xs text-center max-w-sm">We are currently curating the verified emergency contact list for <span className="text-orange-500 font-bold">{universityInfo?.name || shortBrandName}</span>.</p>
                </div>
            )}

            {/* Search and Directory */}
            <div className="space-y-4">
                <div className="relative max-w-2xl mx-auto">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search emergency services..."
                        autoCapitalize="none"
                        autoCorrect="off"
                        autoComplete="off"
                        spellCheck="false"
                        className="w-full h-10 sm:h-11 bg-white dark:bg-[#111113] hover:bg-zinc-50 dark:hover:bg-[#161618] border border-zinc-200/70 dark:border-white/5 focus:border-orange-500/50 pl-10 pr-9 rounded-xl text-xs sm:text-sm font-medium outline-none transition-colors text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 shadow-xs"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 bg-transparent border-none cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Grouped Folders */}
                <div className="space-y-2.5">
                    {['Hostel', 'Doctor', 'Nursing', 'Women Support', 'Fire & Safety', 'Counseling', 'Hospital', 'Facility', 'Administrative', 'Accounts', 'Student Relations'].map((category) => {
                        const categoryItems = filteredDirectory.filter(item => item.category === category);
                        if (categoryItems.length === 0) return null;

                        const isExpanded = searchQuery.length > 0 || expandedCategories.includes(category);

                        return (
                            <div key={category} className="space-y-2">
                                <button
                                    onClick={() => toggleCategory(category)}
                                    className="w-full bg-white dark:bg-[#111113] hover:bg-zinc-50 dark:hover:bg-[#161618] py-2.5 px-3.5 sm:py-3 sm:px-4 rounded-xl sm:rounded-2xl border border-zinc-200/70 dark:border-white/5 flex items-center justify-between gap-3 transition-all cursor-pointer group shadow-xs select-none"
                                >
                                    <div className="flex items-center gap-3 text-left min-w-0">
                                        {/* Clean unboxed signature orange icon */}
                                        <div className="w-5 h-5 flex items-center justify-center shrink-0 text-orange-500">
                                            {getCategoryIcon(category)}
                                        </div>
                                        <div className="min-w-0 text-left">
                                            <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white group-hover:text-orange-500 transition-colors tracking-tight leading-snug">
                                                {category === 'Facility' ? 'Health Centre HQ' :
                                                    category === 'Hospital' ? 'External Referral Hospitals' :
                                                        category === 'Administrative' ? 'University Services' : category}
                                            </h3>
                                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-normal">
                                                {categoryItems.length} {categoryItems.length === 1 ? 'record' : 'records'} found
                                            </p>
                                        </div>
                                    </div>

                                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-colors shrink-0">
                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>

                                {isExpanded && (
                                    /* Clean minimal divided list (Apple-like, NO chunky boxes) */
                                    <div className="w-full divide-y divide-zinc-100 dark:divide-white/5 border border-zinc-200/70 dark:border-white/5 rounded-xl sm:rounded-2xl bg-white dark:bg-[#111113] overflow-hidden shadow-xs">
                                        {categoryItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 px-3.5 sm:px-4 hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition-colors gap-2 select-none group/row"
                                            >
                                                {/* Left side: Title & subtitle & availability */}
                                                <div className="min-w-0 flex-1 pr-2">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover/row:text-orange-500 transition-colors">
                                                            {item.title}
                                                        </span>
                                                        {item.subTitle && (
                                                            <span className="text-[11px] font-normal text-zinc-400 dark:text-zinc-500">
                                                                • {item.subTitle}
                                                            </span>
                                                        )}
                                                        {item.availability && (
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-semibold shrink-0">
                                                                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                                                {item.availability}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.description && (
                                                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-normal line-clamp-1 mt-0.5">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Right side: Numbers and minimal quick actions */}
                                                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-white/5">
                                                    <div className="flex items-center gap-2.5 text-xs">
                                                        {item.numbers.length > 0 && (
                                                            <a
                                                                href={`tel:${item.numbers[0]}`}
                                                                className="font-semibold text-orange-500 hover:underline tracking-tight no-underline flex items-center gap-1"
                                                            >
                                                                <Phone className="w-3 h-3 text-orange-500" />
                                                                {item.numbers[0]}
                                                            </a>
                                                        )}
                                                        {item.blocks && item.blocks[0] && (
                                                            <a
                                                                href={`tel:${item.blocks[0].number}`}
                                                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-medium tracking-tight no-underline hidden md:inline"
                                                                title={item.blocks[0].label}
                                                            >
                                                                <span className="text-zinc-500 text-[10px]">{item.blocks[0].label}:</span> {item.blocks[0].number}
                                                            </a>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button
                                                            onClick={() => copyToClipboard(item.numbers[0] || item.blocks?.[0]?.number || '')}
                                                            title="Copy Contact Number"
                                                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-all border-none bg-transparent cursor-pointer"
                                                        >
                                                            {copiedNumber === (item.numbers[0] || item.blocks?.[0]?.number) ? (
                                                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                            ) : (
                                                                <Copy className="w-3.5 h-3.5" />
                                                            )}
                                                        </button>
                                                        {item.numbers.length > 0 && (
                                                            <a
                                                                href={`tel:${item.numbers[0]}`}
                                                                title="Call Now"
                                                                className="p-1.5 rounded-lg text-zinc-400 hover:text-orange-500 hover:bg-orange-500/10 transition-all border-none bg-transparent cursor-pointer flex items-center"
                                                            >
                                                                <PhoneCall className="w-3.5 h-3.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Uni Health Centre Detailed Guide */}
            {universityInfo && universityInfo.id === 'lpu' ? (
                <div className="bg-white dark:bg-[#111113] rounded-2xl sm:rounded-3xl p-4.5 sm:p-5 border border-zinc-200/70 dark:border-white/5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-zinc-100 dark:border-white/5 pb-3.5">
                        <div className="space-y-1 text-left">
                            <span className="px-2 py-0.5 bg-orange-500/10 text-orange-500 rounded-full text-[11px] font-semibold">
                                Official Directory
                            </span>
                            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white tracking-tight">Uni Health Centre</h3>
                            <p className="text-zinc-400 text-xs font-medium">UNI Health Centre – Block 03, {universityInfo.name} • Open 24x7 | 365 Days</p>
                        </div>
                        <div className="p-3 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/5 rounded-xl max-w-xs w-full text-left">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 text-center">Referral Concessions</p>
                            <ul className="text-xs font-medium text-zinc-800 dark:text-zinc-200 space-y-1 list-none p-0">
                                <li className="flex justify-between"><span>Private Wards</span> <span className="text-orange-500 font-bold">10% Off</span></li>
                                <li className="flex justify-between"><span>General Wards</span> <span className="text-orange-500 font-bold">20% Off</span></li>
                                <li className="flex justify-between"><span>Patel Hospital</span> <span className="text-orange-500 font-bold">5% Off</span></li>
                                <li className="flex justify-between"><span>Diagnostics</span> <span className="text-orange-500 font-bold">Up to 20%</span></li>
                            </ul>
                            <p className="text-[10px] mt-1.5 text-zinc-400 font-normal text-center italic">Carry UID Card for Concession</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-left">
                        <div className="space-y-1.5">
                            <h4 className="text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Medical Facilities</h4>
                            <ul className="space-y-1 text-xs font-medium text-zinc-400 list-none p-0">
                                <li>Diagnostic Laboratory</li>
                                <li>ECG & Cardiac Monitor</li>
                                <li>Oxygen & Nebulization</li>
                                <li>Defibrillator & Minor OT</li>
                                <li>Dental & Eye Clinics</li>
                                <li>8 Qualified Doctors</li>
                            </ul>
                        </div>

                        <div className="space-y-1.5">
                            <h4 className="text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider">OPD Specialties</h4>
                            <ul className="space-y-1 text-xs font-medium text-zinc-400 list-none p-0">
                                <li>General Medicine & Surgery</li>
                                <li>Eye, Dental & Gynae</li>
                                <li>ENT, Skin & Ayurvedic</li>
                                <li>Psychological Consultation</li>
                                <li className="text-emerald-500 font-bold">Free Consultation</li>
                            </ul>
                        </div>

                        <div className="space-y-1.5">
                            <h4 className="text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Indoor Facilities</h4>
                            <ul className="space-y-1 text-xs font-medium text-zinc-400 list-none p-0">
                                <li>31 Beds Available</li>
                                <li>Male & Female Wards</li>
                                <li>No Admission Charges</li>
                                <li>24hr Medical Store</li>
                                <li>Paid Only for Medicines</li>
                            </ul>
                        </div>

                        <div className="space-y-1.5">
                            <h4 className="text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Emergency Support</h4>
                            <ul className="space-y-1 text-xs font-medium text-zinc-400 list-none p-0">
                                <li>6 Active Ambulances</li>
                                <li className="text-orange-500 font-bold">Free for Seriously Ill</li>
                                <li>24x7 Support</li>
                                <li>Referrals: JAL, PHG, LDH</li>
                                <li>Immediate Response Team</li>
                            </ul>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default EmergencyContacts;
