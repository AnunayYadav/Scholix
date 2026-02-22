import React, { useState, useMemo } from 'react';
import { showToast } from './Toast.tsx';

interface ContactInfo {
    id: string;
    title: string;
    category: 'Hostel' | 'Personnel' | 'Administrative' | 'Medical' | 'Safety';
    subTitle?: string;
    description?: string;
    numbers: string[];
    availability?: string;
    email?: string;
    blocks?: { label: string; number: string }[];
}

const EmergencyContacts: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast("Number copied to clipboard!", "success");
    };

    const coreContacts = [
        {
            title: "Fire & Safety Cell",
            status: "24×7",
            numbers: ["01824-444201", "7508183870"],
            color: "bg-[#b91c1c]",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12">
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.5-4.5 2-4.5 2.5 0 3 2.5 2 4.5-.5 1 1 1.5 1.5 3a2.5 2.5 0 0 1-5 0z" />
                    <path d="M11 22c5.523 0 10-4.477 10-10 0-4.75-3.31-8.72-7.75-9.75a10 10 0 1 0-8.25 18.25c1.1.25 2.25.75 4 .75z" />
                </svg>
            )
        },
        {
            title: "Hospital Reception",
            status: "24×7",
            numbers: ["01824-444079", "01824-501227"],
            color: "bg-[#0369a1]",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 -rotate-12">
                    <path d="M19 14l-2-2m0 0l-2 2m2-2V6m2 13H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11l3 3v11a2 2 0 0 1-2 2z" />
                    <circle cx="12" cy="14" r="3" />
                </svg>
            )
        },
        {
            title: "Women Help Center",
            status: "9AM - 5PM",
            numbers: ["9915020408", "01824-444040"],
            color: "bg-[#be185d]",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M12 8v4M12 16h.01" />
                </svg>
            )
        }
    ];

    const allDirectory: ContactInfo[] = [
        // Hostels BH
        { id: 'bh1', title: 'BH-1', category: 'Hostel', subTitle: 'Boys Hostel', numbers: ['9915020442'], blocks: [{ label: 'Block A', number: '01824-444521' }, { label: 'Block B', number: '01824-444522' }, { label: 'Block C', number: '01824-444523' }] },
        { id: 'bh2', title: 'BH-2', category: 'Hostel', subTitle: 'Boys Hostel', numbers: ['9888598705'], blocks: [{ label: 'Block A, B', number: '01824-444524' }] },
        { id: 'bh3', title: 'BH-3', category: 'Hostel', subTitle: 'Boys Hostel', numbers: ['9915710553'], blocks: [{ label: 'Block A, B', number: '01824-444526' }, { label: 'Block C, D', number: '01824-444527' }] },
        { id: 'bh4', title: 'BH-4', category: 'Hostel', subTitle: 'Boys Hostel', numbers: ['9876015107'], blocks: [{ label: 'Block A, B, C, D, E', number: '01824-444529' }] },
        { id: 'bh5', title: 'BH-5', category: 'Hostel', subTitle: 'Boys Hostel', numbers: ['9780036434'], blocks: [{ label: 'Block A, B', number: '01824-444530' }, { label: 'Block C', number: '01824-444531' }] },
        { id: 'bh6', title: 'BH-6', category: 'Hostel', subTitle: 'Boys Hostel', numbers: ['9501110445'], blocks: [{ label: 'Block A', number: '01824-444532' }, { label: 'Block B, C', number: '01824-444533' }] },
        { id: 'bh7', title: 'BH-7', category: 'Hostel', subTitle: 'Boys Hostel', numbers: ['7508182896'], blocks: [{ label: 'Block ---', number: '01824-444536' }] },
        { id: 'bh8', title: 'BH-8', category: 'Hostel', subTitle: 'Boys Hostel', numbers: ['9780005942'], blocks: [{ label: 'Block ---', number: '01824-444528' }] },
        { id: 'apartment', title: 'BH Apartment', category: 'Hostel', subTitle: 'Luxury Housing', numbers: ['9878977900'], blocks: [{ label: 'Block A, B, C, D', number: '01824-444520' }] },

        // Hostels GH
        { id: 'gh1', title: 'GH-1', category: 'Hostel', subTitle: 'Girls Hostel', numbers: ['9915020443'], blocks: [{ label: 'Block ---', number: '01824-444081' }] },
        { id: 'gh2', title: 'GH-2', category: 'Hostel', subTitle: 'Girls Hostel', numbers: ['9876644335'], blocks: [{ label: 'Block ---', number: '01824-444082' }] },
        { id: 'gh3', title: 'GH-3', category: 'Hostel', subTitle: 'Girls Hostel', numbers: ['9876740090'], blocks: [{ label: 'Block ---', number: '01824-444083' }] },
        { id: 'gh4', title: 'GH-4', category: 'Hostel', subTitle: 'Girls Hostel', numbers: ['9915020444'], blocks: [{ label: 'Block ---', number: '01824-444084' }] },
        { id: 'gh5', title: 'GH-5', category: 'Hostel', subTitle: 'Girls Hostel', numbers: ['9876015106'], blocks: [{ label: 'Block A, B', number: '01824-444303' }] },
        { id: 'gh6', title: 'GH-6', category: 'Hostel', subTitle: 'Girls Hostel', numbers: ['9915020439'], blocks: [{ label: 'Block A, B', number: '01824-444301' }] },

        // Personnel
        { id: 'jagdeep', title: 'Mr. Jagdeep Singh', subTitle: 'Hospital Management', category: 'Personnel', numbers: ['9780036450'] },
        { id: 'male_ward', title: 'Hospital Male Ward', category: 'Personnel', numbers: ['01824-444066'] },
        { id: 'female_ward', title: 'Hospital Female Ward', category: 'Personnel', numbers: ['01824-444067'] },
        { id: 'lab', title: 'Medical Laboratory', category: 'Personnel', numbers: ['01824-444069'] },
        { id: 'drgupta', title: 'Dr. N. K. Gupta', category: 'Personnel', numbers: ['9878426871', '01824-444071'] },
        { id: 'drmonica', title: 'Dr. Monica', subTitle: 'Women Help Center', category: 'Personnel', numbers: ['9915020408', '01824-444040'] },
        { id: 'kuldeep', title: 'Mr. Kuldeep', subTitle: 'Fire Office', category: 'Personnel', numbers: ['9780036402'] },

        // Admin
        { id: 'accounts', title: 'Fee Help Desk', subTitle: 'Accounts Support', category: 'Administrative', numbers: ['01824-444337'], email: 'helpdesk.accounts@lpu.co.in', availability: '9AM - 5PM' },
        { id: 'student_rel', title: 'Student Relationship', subTitle: 'Direct Helpline', category: 'Administrative', numbers: ['01824-510311', '7347000929'], email: 'parents@lpu.co.in' },
    ];

    const filteredDirectory = useMemo(() => {
        if (!searchQuery) return allDirectory;
        return allDirectory.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.subTitle?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-12 animate-fade-in pb-32">
            {/* Header Section */}
            <header className="text-center space-y-4">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                    Emergency <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">Support</span>
                </h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] max-w-lg mx-auto leading-relaxed">
                    Official university emergency directory available 24/7.
                </p>
            </header>

            {/* Core Emergency Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {coreContacts.map((contact, i) => (
                    <div key={i} className={`${contact.color} p-8 rounded-[40px] relative overflow-hidden shadow-2xl shadow-black/20 group`}>
                        {contact.icon}
                        <div className="relative z-10 space-y-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">{contact.title}</p>
                                <h3 className="text-4xl font-black text-white tracking-tighter">{contact.status}</h3>
                            </div>
                            <div className="space-y-3">
                                {contact.numbers.map((num, ni) => (
                                    <div key={ni} className="flex items-center justify-between group/num">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                            </div>
                                            <span className="text-lg font-black text-white tracking-tight">{num}</span>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(num)}
                                            className="p-2 rounded-lg bg-white/0 group-hover/num:bg-white/10 text-white/40 group-hover/num:text-white transition-all border-none bg-transparent cursor-pointer"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search and Directory */}
            <div className="space-y-8">
                <div className="relative max-w-2xl mx-auto">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search hostel or department..."
                        className="w-full bg-white dark:bg-white/[0.03] pl-14 pr-6 py-5 rounded-[24px] border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-orange-600/10 focus:border-orange-500/30 transition-all dark:text-white"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDirectory.map((item) => (
                        <div key={item.id} className="group p-6 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-[32px] hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-600/5 transition-all duration-500 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${item.category === 'Hostel' ? 'bg-orange-500' :
                                                    item.category === 'Personnel' ? 'bg-blue-500' : 'bg-emerald-500'
                                                }`} />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{item.category}</span>
                                        </div>
                                        <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{item.title}</h4>
                                        {item.subTitle && <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase">{item.subTitle}</p>}
                                    </div>
                                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-400 group-hover:bg-orange-600/10 group-hover:text-orange-600 transition-all">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                                            {item.category === 'Hostel' ? <path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7M4 21V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v17" /> : <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />}
                                        </svg>
                                    </div>
                                </div>

                                {item.blocks && (
                                    <div className="grid grid-cols-1 gap-2 border-t border-slate-100 dark:border-white/5 pt-4">
                                        {item.blocks.map((block, bi) => (
                                            <div key={bi} className="flex justify-between items-center group/block">
                                                <span className="text-[9px] font-black uppercase text-slate-400">{block.label}</span>
                                                <button onClick={() => copyToClipboard(block.number)} className="text-[10px] font-black text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-all border-none bg-transparent cursor-pointer">{block.number}</button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {item.availability && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/5 rounded-full border border-blue-500/10">
                                        <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                                        <span className="text-[8px] font-black uppercase text-blue-500 tracking-widest">{item.availability}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex gap-2">
                                {item.numbers.map((num, i) => (
                                    <a key={i} href={`tel:${num}`} className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-orange-600 dark:hover:bg-orange-600 hover:text-white dark:hover:text-white transition-all no-underline">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                        Mobile
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Support Box */}
            <div className="bg-slate-900 dark:bg-black p-10 rounded-[40px] border border-slate-800 dark:border-white/5 text-center relative overflow-hidden group shadow-2xl">
                <div className="relative z-10 space-y-4">
                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Global Helpdesk</h3>
                    <p className="text-slate-400 text-xs font-medium max-w-sm mx-auto">For reporting issues regarding the LPU-Nexus platform itself, please use the feedback button in the sidebar.</p>
                </div>
            </div>
        </div>
    );
};

export default EmergencyContacts;
