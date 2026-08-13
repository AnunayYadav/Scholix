import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { showToast } from './Toast.tsx';
import { allDirectory, coreContacts as coreContactsData, ContactInfo } from '../data/emergencyData.ts';
import { useUniversity } from '../hooks/useUniversity.tsx';

const EmergencyContacts: React.FC = () => {
    const { universityInfo, shortBrandName } = useUniversity();
    const [searchQuery, setSearchQuery] = useState('');
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
        navigator.clipboard.writeText(text);
        showToast("Number copied to clipboard!", "success");
    };

    const coreContacts = coreContactsData.map(contact => ({
        ...contact,
        icon: contact.iconType === 'fire' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute -right-4 -bottom-4 w-28 h-28 opacity-15 rotate-12 pointer-events-none text-white">
                <path d="M12 2c0 0-2 4.5-2 7.5s2 5.5 2 5.5 2-2.5 2-5.5-2-7.5-2-7.5z" />
                <path d="M12 6c0 0-1.5 3-1.5 5s1.5 4 1.5 4 1.5-2 1.5-4-1.5-5-1.5-5z" />
                <path d="M8.5 14.5c0 0-2.5 1.5-2.5 4.5s2.5 4 6 4 6-1 6-4-2.5-4.5-2.5-4.5" />
            </svg>
        ) : contact.iconType === 'hospital' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute -right-4 -bottom-4 w-28 h-28 opacity-15 -rotate-12 pointer-events-none text-white">
                <path d="M19 14l-2-2m0 0l-2 2m2-2V6m2 13H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11l3 3v11a2 2 0 0 1-2 2z" />
            </svg>
        ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute -right-4 -bottom-4 w-28 h-28 opacity-15 rotate-12 pointer-events-none text-white">
                <circle cx="12" cy="8" r="5" />
                <path d="M3 21c0-4.5 9-4.5 9-4.5s9 0 9 4.5" />
            </svg>
        )
    }));

    const filteredDirectory = useMemo(() => {
        if (!universityInfo || universityInfo.id !== 'lpu') return [];
        if (!searchQuery) return allDirectory;
        return allDirectory.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.subTitle?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, universityInfo]);

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-0 py-6 space-y-8 animate-fade-in pb-28 focus-visible:outline-none">
            {/* Header Section */}
            <header className="text-center space-y-1.5">
                <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight leading-none">
                    Rescue <span className="text-orange-500">Line</span>
                </h2>
                <p className="text-zinc-400 text-xs sm:text-sm font-semibold">
                    Essential Services Directory
                </p>
            </header>

            {/* Core Emergency Hero Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {coreContacts.map((contact, i) => (
                    <div
                        key={i}
                        className={`bg-gradient-to-br ${contact.color} p-4.5 sm:p-5.5 rounded-3xl relative overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group border-none flex flex-col justify-between min-h-[160px]`}
                    >
                        {contact.icon}
                        <div className="relative z-10 space-y-3.5">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-xs sm:text-sm font-black text-white/90 uppercase tracking-wider">{contact.title}</h3>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-black tracking-tight shrink-0">
                                    {contact.status.includes('24') ? (
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                                        </span>
                                    ) : (
                                        <span className="w-2 h-2 rounded-full bg-amber-300 shrink-0" />
                                    )}
                                    {contact.status}
                                </span>
                            </div>

                            <div className="space-y-2">
                                {contact.numbers.map((num, ni) => (
                                    <div key={ni} className="flex items-center justify-between py-1.5 px-3 rounded-2xl bg-black/20 hover:bg-black/30 backdrop-blur-sm transition-all group/num">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-white/90 shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                            <a href={`tel:${num}`} className="text-sm sm:text-base font-black text-white tracking-tight leading-none no-underline hover:underline truncate">
                                                {num}
                                            </a>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(num)}
                                            title="Copy Number"
                                            className="p-1.5 rounded-xl hover:bg-white/20 text-white/70 hover:text-white transition-all border-none bg-transparent cursor-pointer shrink-0"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {(!universityInfo || universityInfo.id !== 'lpu') && (
                <div className="flex flex-col items-center justify-center py-12 px-4 rounded-3xl border-none bg-white dark:bg-[#111113]">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mb-3">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-orange-500"><path d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>
                    </div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">Emergency Directory Coming Soon</h3>
                    <p className="text-zinc-400 text-xs text-center max-w-sm">We are currently curating the verified emergency contact list for <span className="text-orange-500 font-bold">{universityInfo?.name || shortBrandName}</span>.</p>
                </div>
            )}

            {/* Search and Directory */}
            <div className="space-y-5">
                <div className="relative max-w-2xl mx-auto">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search emergency services..."
                        autoCapitalize="none"
                        autoCorrect="off"
                        autoComplete="off"
                        spellCheck="false"
                        className="w-full h-11 sm:h-12 bg-zinc-100 dark:bg-[#141416] hover:bg-zinc-200/70 dark:hover:bg-[#1a1a1d] pl-11 pr-4 rounded-2xl border-none text-xs sm:text-sm font-semibold outline-none transition-colors text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
                    />
                </div>

                {/* Grouped Folders */}
                <div className="space-y-3.5">
                    {['Hostel', 'Doctor', 'Nursing', 'Women Support', 'Fire & Safety', 'Counseling', 'Hospital', 'Facility', 'Administrative', 'Accounts', 'Student Relations'].map((category) => {
                        const categoryItems = filteredDirectory.filter(item => item.category === category);
                        if (categoryItems.length === 0) return null;

                        const isExpanded = searchQuery.length > 0 || expandedCategories.includes(category);

                        return (
                            <div key={category} className="space-y-3.5">
                                <button
                                    onClick={() => toggleCategory(category)}
                                    className="w-full bg-white dark:bg-[#111113] hover:bg-zinc-50 dark:hover:bg-[#161618] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-none flex items-center justify-between gap-4 transition-all cursor-pointer group shadow-xs"
                                >
                                    <div className="flex items-center gap-3.5 sm:gap-4 text-left min-w-0">
                                        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-xs transition-transform group-hover:scale-105 ${
                                            category === 'Hostel' ? 'bg-orange-500' :
                                            category === 'Doctor' ? 'bg-red-500' :
                                            category === 'Nursing' ? 'bg-blue-500' :
                                            category === 'Counseling' ? 'bg-purple-500' :
                                            category === 'Hospital' ? 'bg-cyan-500' :
                                            category === 'Facility' ? 'bg-zinc-700' :
                                            category === 'Women Support' ? 'bg-pink-500' :
                                            category === 'Fire & Safety' ? 'bg-orange-600' :
                                            category === 'Accounts' ? 'bg-amber-500' :
                                            category === 'Student Relations' ? 'bg-emerald-500' :
                                            'bg-zinc-600'
                                        }`}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5.5 h-5.5 sm:w-6 sm:h-6">
                                                {category === 'Hostel' && <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />}
                                                {category === 'Doctor' && <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />}
                                                {category === 'Nursing' && <path d="M22 12h-4l-3 9L9 3l-3 9H2" />}
                                                {category === 'Counseling' && <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />}
                                                {category === 'Hospital' && <path d="M19 14l-2-2m0 0l-2 2m2-2V6h-4" />}
                                                {category === 'Facility' && <path d="M3 21h18M3 7v1h18V7l-9-5zm3 3v10m6-10v10m6-10v10" />}
                                                {category === 'Administrative' && <path d="M16 4h2a2 2 0 0 1-2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M8 2h8v4H8z" />}
                                                {category === 'Women Support' && <circle cx="12" cy="12" r="10" />}
                                                {category === 'Fire & Safety' && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />}
                                                {category === 'Accounts' && <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />}
                                                {category === 'Student Relations' && <path d="M17 21v-2a4 4 0 0 0-3-3.87M9 21v-2a4 4 0 0 1 3-3.87M16 3.13a4 4 0 0 1 0 7.75" />}
                                            </svg>
                                        </div>
                                        <div className="min-w-0 text-left">
                                            <h3 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white uppercase tracking-tight leading-snug">
                                                {category === 'Facility' ? 'Health Centre HQ' :
                                                    category === 'Hospital' ? 'External Referral Hospitals' :
                                                        category === 'Administrative' ? 'University Services' : category}
                                            </h3>
                                            <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-0.5">{categoryItems.length} Records Found</p>
                                        </div>
                                    </div>
                                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
                                        {categoryItems.map((item) => (
                                            <div key={item.id} className="group p-4 bg-white dark:bg-[#111113] hover:bg-zinc-50 dark:hover:bg-[#161618] border-none rounded-2xl flex flex-col justify-between transition-all shadow-xs">
                                                <div className="space-y-2.5">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <div className="min-w-0 text-left">
                                                            <h4 className="text-sm font-black text-zinc-900 dark:text-white tracking-tight uppercase leading-snug truncate">{item.title}</h4>
                                                            {item.subTitle && <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight mt-0.5">{item.subTitle}</p>}
                                                            {item.description && <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-1 italic leading-tight line-clamp-2">{item.description}</p>}
                                                        </div>
                                                        <button
                                                            onClick={() => copyToClipboard(item.numbers[0] || item.blocks?.[0]?.number || '')}
                                                            title="Copy Contact Number"
                                                            className="p-1.5 rounded-xl bg-zinc-100 dark:bg-white/5 text-zinc-400 hover:text-orange-500 hover:bg-orange-500/10 transition-all shrink-0 border-none cursor-pointer"
                                                        >
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                                                        </button>
                                                    </div>

                                                    {item.blocks && (
                                                        <div className="border-t border-zinc-100 dark:border-white/5 pt-2 flex items-center justify-between text-xs">
                                                            <span className="font-bold text-zinc-400 uppercase tracking-wide">Main Line</span>
                                                            <span className="font-black text-zinc-700 dark:text-zinc-200">{item.blocks[0].number}</span>
                                                        </div>
                                                    )}

                                                    {item.numbers.length > 0 && (
                                                        <div className="flex items-center justify-between text-xs pt-0.5">
                                                            <span className="font-bold text-zinc-400 uppercase tracking-wide">Direct Line</span>
                                                            <span className="font-black text-orange-500">{item.numbers[0]}</span>
                                                        </div>
                                                    )}

                                                    {item.availability && (
                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 rounded-full mt-1">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            <span className="text-xs font-bold text-emerald-500 leading-none">{item.availability}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-3.5">
                                                    {item.numbers.length > 0 ? (
                                                        <a href={`tel:${item.numbers[0]}`} className="w-full h-9 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white rounded-xl text-xs font-medium transition-all no-underline text-center border-none cursor-pointer shadow-xs">
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                                            Call Now
                                                        </a>
                                                    ) : (
                                                        <div className="w-full h-9 border border-dashed border-zinc-200 dark:border-white/10 flex items-center justify-center rounded-xl text-xs font-medium text-zinc-400">
                                                            Internal
                                                        </div>
                                                    )}
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

            {universityInfo && universityInfo.id === 'lpu' ? (
                <div className="bg-white dark:bg-[#111113] rounded-3xl p-5 sm:p-6 border-none shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-zinc-100 dark:border-white/5 pb-4">
                        <div className="space-y-1 text-left">
                            <span className="px-2.5 py-0.5 bg-orange-500/10 text-orange-500 rounded-md text-xs font-bold">
                                Official Directory
                            </span>
                            <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white tracking-tight">Uni Health Centre</h3>
                            <p className="text-zinc-400 text-xs font-semibold">UNI Health Centre – Block 03, {universityInfo.name} • Open 24x7 | 365 Days</p>
                        </div>
                        <div className="p-3.5 bg-zinc-50 dark:bg-white/5 rounded-2xl max-w-xs w-full text-left">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 text-center">Referral Concessions</p>
                            <ul className="text-xs font-bold text-zinc-800 dark:text-zinc-200 space-y-1 list-none p-0">
                                <li className="flex justify-between"><span>Private Wards</span> <span className="text-orange-500 font-extrabold">10% Off</span></li>
                                <li className="flex justify-between"><span>General Wards</span> <span className="text-orange-500 font-extrabold">20% Off</span></li>
                                <li className="flex justify-between"><span>Patel Hospital</span> <span className="text-orange-500 font-extrabold">5% Off</span></li>
                                <li className="flex justify-between"><span>Diagnostics</span> <span className="text-orange-500 font-extrabold">Up to 20%</span></li>
                            </ul>
                            <p className="text-xs mt-2 text-zinc-400 font-medium text-center italic">Carry UID Card for Concession</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                        <div className="space-y-2">
                            <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase">Medical Facilities</h4>
                            <ul className="space-y-1 text-xs font-semibold text-zinc-400">
                                <li>Diagnostic Laboratory</li>
                                <li>ECG & Cardiac Monitor</li>
                                <li>Oxygen & Nebulization</li>
                                <li>Defibrillator & Minor OT</li>
                                <li>Dental & Eye Clinics</li>
                                <li>8 Qualified Doctors</li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase">OPD Specialties</h4>
                            <ul className="space-y-1 text-xs font-semibold text-zinc-400">
                                <li>General Medicine & Surgery</li>
                                <li>Eye, Dental & Gynae</li>
                                <li>ENT, Skin & Ayurvedic</li>
                                <li>Psychological Consultation</li>
                                <li className="text-emerald-500 font-extrabold">Free Consultation</li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase">Indoor Facilities</h4>
                            <ul className="space-y-1 text-xs font-semibold text-zinc-400">
                                <li>31 Beds Available</li>
                                <li>Male & Female Wards</li>
                                <li>No Admission Charges</li>
                                <li>24hr Medical Store</li>
                                <li>Paid Only for Medicines</li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase">Emergency Support</h4>
                            <ul className="space-y-1 text-xs font-semibold text-zinc-400">
                                <li>6 Active Ambulances</li>
                                <li className="text-orange-500 font-extrabold">Free for Seriously Ill</li>
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
