import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { showToast } from './Toast.tsx';
import { allDirectory, coreContacts as coreContactsData, ContactInfo } from '../data/emergencyData.ts';

const EmergencyContacts: React.FC = () => {
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 rotate-12 md:w-44 md:h-44 pointer-events-none">
                    <path d="M12 2c0 0-2 4.5-2 7.5s2 5.5 2 5.5 2-2.5 2-5.5-2-7.5-2-7.5z" />
                    <path d="M12 6c0 0-1.5 3-1.5 5s1.5 4 1.5 4 1.5-2 1.5-4-1.5-5-1.5-5z" />
                    <path d="M8.5 14.5c0 0-2.5 1.5-2.5 4.5s2.5 4 6 4 6-1 6-4-2.5-4.5-2.5-4.5" />
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" opacity="0.1" />
                </svg>
            ) : contact.iconType === 'hospital' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 -rotate-12 md:w-44 md:h-44 pointer-events-none">
                    <path d="M19 14l-2-2m0 0l-2 2m2-2V6m2 13H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11l3 3v11a2 2 0 0 1-2 2z" />
                </svg>
            ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="absolute -right-6 -bottom-6 w-28 h-28 opacity-10 rotate-12 md:w-48 md:h-48 pointer-events-none">
                    <circle cx="12" cy="8" r="5" />
                    <path d="M3 21c0-4.5 9-4.5 9-4.5s9 0 9 4.5" />
                    <path d="M12 11v6m-3-3h6" opacity="0.3" />
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" opacity="0.1" />
                </svg>
            )
    }));

    const filteredDirectory = useMemo(() => {
        if (!searchQuery) return allDirectory;
        return allDirectory.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.subTitle?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in pb-32 focus-visible:outline-none">
            {/* Header Section */}
            <header className="text-center space-y-3">
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tighter leading-none">
                    Rescue <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">Line</span>
                </h2>
                <div className="flex items-center justify-center gap-2">
                    <div className="h-[1px] w-8 md:w-12 bg-slate-200 dark:bg-white/10" />
                    <p className="text-slate-500 text-[11px] sm:text-xs font-medium leading-none">
                        Essential Services Directory
                    </p>
                    <div className="h-[1px] w-8 md:w-12 bg-slate-200 dark:bg-white/10" />
                </div>
            </header>

            {/* Core Emergency Cards */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-6">
                {coreContacts.map((contact, i) => (
                    <div
                        key={i}
                        className={`bg-gradient-to-br ${contact.color} p-4 md:p-8 rounded-[28px] md:rounded-[40px] relative overflow-hidden shadow-lg shadow-black/10 group active:scale-[0.98] transition-all duration-300 ${i === 2 ? 'w-1/2 md:flex-1' : 'w-[calc(50%-6px)] md:flex-1'} h-auto md:h-full`}
                    >
                        {contact.icon}
                        <div className="relative z-20 h-full flex flex-col justify-between space-y-4 md:space-y-6">
                            <div className="space-y-1">
                                <p className="text-[11px] sm:text-xs font-medium md:tracking-[0.2em] text-white/70">{contact.title}</p>
                                <h3 className="text-xl md:text-3xl font-black text-white tracking-tighter leading-none">{contact.status}</h3>
                            </div>
                            <div className="space-y-2 md:space-y-3">
                                {contact.numbers.map((num, ni) => (
                                    <div key={ni} className="flex items-center justify-between group/num">
                                        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5 md:w-3.5 md:h-3.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                            </div>
                                            <span className="text-[9.5px] md:text-lg font-black text-white tracking-tight leading-none whitespace-nowrap">{num}</span>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(num)}
                                            className="p-1 md:p-2 rounded-lg md:rounded-xl bg-white/0 hover:bg-white/20 text-white/50 hover:text-white transition-all border-none bg-transparent cursor-pointer relative z-30 shrink-0"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5 md:w-4 md:h-4"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search and Directory */}
            <div className="space-y-6 md:space-y-8">
                <div className="relative max-w-xl mx-auto px-2 md:px-0">
                    <div className="absolute left-6 md:left-6 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search emergency services..."
                        autoCapitalize="none"
                        autoCorrect="off"
                        autoComplete="off"
                        spellCheck="false"
                        className="w-full bg-slate-50 dark:bg-white/[0.03] pl-12 md:pl-14 pr-6 py-4 md:py-5 rounded-2xl md:rounded-[24px] border border-slate-200 dark:border-white/10 text-[13px] md:text-[14px] font-bold outline-none focus:ring-4 focus:ring-orange-600/10 focus:border-orange-500/30 transition-all dark:text-white"
                    />
                </div>

                {/* Grouped Folders */}
                {['Hostel', 'Doctor', 'Nursing', 'Women Support', 'Fire & Safety', 'Counseling', 'Hospital', 'Facility', 'Administrative', 'Accounts', 'Student Relations'].map((category) => {
                    const categoryItems = filteredDirectory.filter(item => item.category === category);
                    if (categoryItems.length === 0) return null;

                    const isExpanded = searchQuery.length > 0 || expandedCategories.includes(category);

                    return (
                        <div key={category} className="space-y-4 md:space-y-6 animate-fade-in">
                            <button
                                onClick={() => toggleCategory(category)}
                                className={`w-full bg-white dark:bg-white/[0.03] p-4 md:p-6 rounded-2xl md:rounded-[32px] border border-slate-200 dark:border-white/10 flex items-center justify-between gap-4 transition-all group active:scale-[0.99] ${isExpanded ? 'ring-2 ring-orange-500/10 border-orange-500/20' : ''}`}
                            >
                                <div className="flex items-center gap-4 md:gap-5 text-left min-w-0">
                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105 shrink-0 ${category === 'Hostel' ? 'bg-orange-600 text-white' :
                                        category === 'Doctor' ? 'bg-red-600 text-white' :
                                            category === 'Nursing' ? 'bg-blue-600 text-white' :
                                                category === 'Counseling' ? 'bg-purple-600 text-white' :
                                                    category === 'Hospital' ? 'bg-cyan-600 text-white' :
                                                        category === 'Facility' ? 'bg-slate-700 text-white' :
                                                            category === 'Women Support' ? 'bg-rose-600 text-white' :
                                                                category === 'Fire & Safety' ? 'bg-red-700 text-white' :
                                                                    category === 'Accounts' ? 'bg-amber-600 text-white' :
                                                                        category === 'Student Relations' ? 'bg-emerald-600 text-white' :
                                                                            'bg-slate-600 text-white'
                                        }`}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 md:w-6 h-5 md:h-6">
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
                                        <h3 className="text-[16px] md:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                                            {category === 'Facility' ? 'Health Centre HQ' :
                                                category === 'Hospital' ? 'External Referral Hospitals' :
                                                    category === 'Administrative' ? 'University Services' : category}
                                        </h3>
                                        <p className="text-[11px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-1">{categoryItems.length} Records Found</p>
                                    </div>
                                </div>
                                <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-4 animate-slide-up pb-2">
                                    {categoryItems.map((item) => (
                                        <div key={item.id} className="group p-4 md:p-6 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl md:rounded-[32px] hover:border-orange-500/30 hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="min-w-0 text-left">
                                                        <h4 className="text-[14px] md:text-lg font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-tight">{item.title}</h4>
                                                        {item.subTitle && <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-tight mt-0.5">{item.subTitle}</p>}
                                                        {item.description && <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 italic leading-tight">{item.description}</p>}
                                                    </div>
                                                    <div className="p-2 rounded-lg md:rounded-xl bg-slate-50 dark:bg-white/10 text-slate-400 group-hover:text-orange-600 transition-all shrink-0">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 md:w-5 md:h-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                                    </div>
                                                </div>

                                                {item.blocks && (
                                                    <div className="border-t border-slate-100 dark:border-white/5 pt-3 flex flex-col md:flex-row md:items-center justify-between gap-1">
                                                        <span className="text-[11px] sm:text-xs font-medium text-slate-400 tracking-widest leading-none">Main Line</span>
                                                        <span className="text-[10px] md:text-[13px] font-black text-slate-700 dark:text-slate-200 leading-none">{item.blocks[0].number}</span>
                                                    </div>
                                                )}

                                                {item.availability && (
                                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/5 rounded-full border border-emerald-500/10">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[11px] sm:text-xs font-medium text-emerald-600 leading-none">{item.availability}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-4 md:mt-6">
                                                {item.numbers.length > 0 ? (
                                                    <a href={`tel:${item.numbers[0]}`} className="w-full h-10 md:h-12 flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl md:rounded-2xl text-[11px] sm:text-xs font-medium hover:bg-orange-600 dark:hover:bg-orange-600 hover:text-white dark:hover:text-white transition-all no-underline text-center">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5 md:w-4 md:h-4"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                                        Call
                                                    </a>
                                                ) : (
                                                    <div className="w-full h-10 md:h-12 border border-dotted border-slate-200 dark:border-white/10 flex items-center justify-center rounded-xl md:rounded-2xl text-[11px] sm:text-xs font-bold uppercase text-slate-400 tracking-wider italic">
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

            {/* University Health Centre - Exhaustive Information Section */}
            <div className="bg-white dark:bg-white/[0.03] rounded-[32px] md:rounded-[48px] p-6 md:p-10 border border-slate-200 dark:border-white/10 shadow-xl space-y-8 md:space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-100 dark:border-white/5 pb-8">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-red-600/10 text-red-600 rounded-full text-[11px] sm:text-xs font-medium text-left">
                            Official Directory
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tighter leading-none text-left">Uni Health Centre</h3>
                        <p className="text-slate-500 text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-left">UNI Health Centre – Block 03, LPU • Open 24x7 | 365 Days</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-[24px] border border-slate-100 dark:border-white/5 max-w-xs w-full text-left">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">Referral Hospital Concessions</p>
                        <ul className="text-[9px] font-black text-slate-900 dark:text-white uppercase space-y-1.5 list-none p-0">
                            <li className="flex justify-between"><span>Private Wards</span> <span className="text-orange-600">10% Off</span></li>
                            <li className="flex justify-between"><span>General Wards</span> <span className="text-orange-600">20% Off</span></li>
                            <li className="flex justify-between"><span>Patel Hospital</span> <span className="text-orange-600">5% Off</span></li>
                            <li className="flex justify-between"><span>Diagnostics</span> <span className="text-orange-600">Up to 20%</span></li>
                        </ul>
                        <p className="text-[11px] sm:text-xs mt-3 text-slate-400 font-medium text-center italic">Carry UID Card for Concession</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    {/* Facilities Card */}
                    <div className="space-y-3 text-left">
                        <div className="w-10 h-10 rounded-xl bg-orange-600/10 text-orange-600 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M19 14l-2-2m0 0l-2 2m2-2V6m2 13H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11l3 3v11a2 2 0 0 1-2 2z" /></svg>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-[15px] md:text-[17px] font-bold text-slate-900 dark:text-white tracking-tighter uppercase">Medical Facilities</h4>
                            <ul className="space-y-1 text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-relaxed">
                                <li>Diagnostic Laboratory</li>
                                <li>ECG & Cardiac Monitor</li>
                                <li>Oxygen & Nebulization</li>
                                <li>Defibrillator & Minor OT</li>
                                <li>Dental & Eye Clinics</li>
                                <li>8 Qualified Full-time Doctors</li>
                            </ul>
                        </div>
                    </div>

                    {/* OPD Card */}
                    <div className="space-y-3 text-left">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-[15px] md:text-[17px] font-bold text-slate-900 dark:text-white tracking-tighter uppercase">OPD Specialties</h4>
                            <ul className="space-y-1 text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-relaxed">
                                <li>General Medicine & Surgery</li>
                                <li>Eye Testing, Dental & Gynae</li>
                                <li>ENT, Skin & Ayurvedic</li>
                                <li>Psychological Consultation</li>
                                <li className="text-emerald-600 font-black">Free Consultation (No Charges)</li>
                            </ul>
                        </div>
                    </div>

                    {/* Indoor Card */}
                    <div className="space-y-3 text-left">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-[15px] md:text-[17px] font-bold text-slate-900 dark:text-white tracking-tighter uppercase">Indoor Facilities</h4>
                            <ul className="space-y-1 text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-relaxed">
                                <li>31 Beds Available</li>
                                <li>Separate Male & Female Wards</li>
                                <li>No Admission Charges</li>
                                <li>24hr Subsidized Medical Store</li>
                                <li>Paid Only for Medicines</li>
                            </ul>
                        </div>
                    </div>

                    {/* Emergency Card */}
                    <div className="space-y-3 text-left">
                        <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-[15px] md:text-[17px] font-bold text-slate-900 dark:text-white tracking-tighter uppercase">Emergency Support</h4>
                            <ul className="space-y-1 text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-relaxed">
                                <li>6 Active Ambulances</li>
                                <li className="text-red-500">Free for Seriously Ill</li>
                                <li>24x7 Emergency Support</li>
                                <li>Referrals: JAL, PHG, LDH</li>
                                <li>Immediate Response Team</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Support Box */}
            <div className="bg-slate-950 dark:bg-[#0a0a0a] p-8 md:p-10 rounded-[32px] md:rounded-[40px] border border-white/5 text-center relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/5 to-transparent opacity-50" />
                <div className="relative z-10 space-y-3 md:space-y-4">
                    <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase leading-none">Global Helpdesk</h3>
                    <p className="text-slate-500 text-[11px] sm:text-xs font-medium max-w-sm mx-auto">Access 24/7 university assistance through the official campus hotline or student relationship portal.</p>
                </div>
            </div>
        </div>
    );
};

export default EmergencyContacts;
