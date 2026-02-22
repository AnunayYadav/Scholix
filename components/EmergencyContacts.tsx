import React, { useState, useMemo } from 'react';
import { showToast } from './Toast.tsx';

interface ContactInfo {
    id: string;
    title: string;
    category: 'Hostel' | 'Doctor' | 'Nursing' | 'Counseling' | 'Facility' | 'Hospital' | 'Administrative';
    subTitle?: string;
    description?: string;
    numbers: string[];
    availability?: string;
    email?: string;
    blocks?: { label: string; number: string }[];
}

const EmergencyContacts: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
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
        { id: 'bh1', title: 'BH-1', category: 'Hostel', subTitle: 'Boys Hostel', numbers: ['9915020442'], blocks: [{ label: 'Block A', number: '01824444521' }, { label: 'Block B', number: '01824444522' }, { label: 'Block C', number: '01824444523' }] },
        { id: 'bh2', title: 'BH-2', category: 'Hostel', subTitle: 'Boys Hostel', numbers: ['9888598705'], blocks: [{ label: 'Block A, B', number: '01824444524' }] },
        { id: 'bh3', title: 'BH-3', category: 'Hostel', subTitle: 'Boys Hostel', numbers: ['9915710553'], blocks: [{ label: 'Block A, B', number: '01824444526' }, { label: 'Block C, D', number: '01824444527' }] },
        { id: 'bh4', title: 'BH-4', category: 'Hostel', subTitle: 'Boys Hostel', numbers: ['9876015107'], blocks: [{ label: 'Block A, B, C, D, E', number: '01824444529' }] },
        { id: 'bh5', title: 'BH-5', category: 'Hostel', subTitle: 'Boys Hostel', numbers: ['9780036434'], blocks: [{ label: 'Block A, B', number: '01824444530' }, { label: 'Block C', number: '01824444531' }] },
        { id: 'bh6', title: 'BH-6', category: 'Hostel', subTitle: 'Boys Hostel', numbers: ['9501110445'], blocks: [{ label: 'Block A', number: '01824444532' }, { label: 'Block B, C', number: '01824444533' }] },
        { id: 'bh7', title: 'BH-7', category: 'Hostel', subTitle: 'Boys Hostel', numbers: ['7508182896'], blocks: [{ label: 'Landline', number: '01824444536' }] },
        { id: 'bh8', title: 'BH-8', category: 'Hostel', subTitle: 'Boys Hostel', numbers: ['9780005942'], blocks: [{ label: 'Landline', number: '01824444528' }] },
        { id: 'apartment', title: 'BH Apartment', category: 'Hostel', subTitle: 'Luxury Housing', numbers: ['9878977900'], blocks: [{ label: 'Block A, B, C, D', number: '01824444520' }] },

        // Hostels GH
        { id: 'gh1', title: 'GH-1', category: 'Hostel', subTitle: 'Girls Hostel', numbers: ['9915020443'], blocks: [{ label: 'Landline', number: '01824444081' }] },
        { id: 'gh2', title: 'GH-2', category: 'Hostel', subTitle: 'Girls Hostel', numbers: ['9876644335'], blocks: [{ label: 'Landline', number: '01824444082' }] },
        { id: 'gh3', title: 'GH-3', category: 'Hostel', subTitle: 'Girls Hostel', numbers: ['9876740090'], blocks: [{ label: 'Landline', number: '01824444083' }] },
        { id: 'gh4', title: 'GH-4', category: 'Hostel', subTitle: 'Girls Hostel', numbers: ['9915020444'], blocks: [{ label: 'Landline', number: '01824444084' }] },
        { id: 'gh5', title: 'GH-5', category: 'Hostel', subTitle: 'Girls Hostel', numbers: ['9876015106'], blocks: [{ label: 'Block A, B', number: '0182444303' }] },
        { id: 'gh6', title: 'GH-6', category: 'Hostel', subTitle: 'Girls Hostel', numbers: ['9915020439'], blocks: [{ label: 'Block A, B', number: '0182444301' }] },

        // Doctors & Residents
        { id: 'nk_gupta', title: 'Dr. N.K. Gupta', subTitle: 'MO | Eye Specialist (31269)', category: 'Doctor', numbers: ['9878426871', '9815023005'], availability: '4 PM – 8 PM' },
        { id: 'vijay_mohan', title: 'Dr. Vijay Mohan', subTitle: 'Resident MO (12772)', category: 'Doctor', numbers: ['9878426880'], availability: '24 hrs (8 hr shift)' },
        { id: 'ajay_arneja', title: 'Dr. Ajay Arneja', subTitle: 'MO | Dentist (15536)', category: 'Doctor', numbers: ['9914033108'], availability: '4 PM – 8 PM' },
        { id: 'harjeet_singh', title: 'Dr. Harjeet Singh', subTitle: 'MO | Gen Physician (18211)', category: 'Doctor', numbers: ['9815760306'], availability: '8 hr shift' },
        { id: 'navneet_singh', title: 'Dr. Navneet Singh', subTitle: 'Resident MO (30482)', category: 'Doctor', numbers: ['8264557767'], availability: '24 hrs (8 hr shift)' },
        { id: 'anil_malhotra', title: 'Dr. Anil Malhotra', subTitle: 'MO | Gen Physician (24116)', category: 'Doctor', numbers: ['9815364977'], availability: '2 PM – 10 PM' },
        { id: 'reyhan_ahmad', title: 'Dr. Reyhan Ahmad', subTitle: 'Resident MO (31166)', category: 'Doctor', numbers: ['6005932395'], availability: '24 hrs (8 hr shift)' },
        { id: 'santosh_daniel', title: 'Dr. Santosh Daniel', subTitle: 'Resident MO (31230)', category: 'Doctor', numbers: ['9944838602'], availability: '24 hrs (8 hr shift)' },
        { id: 'mamta_arora', title: 'Dr. Mamta Arora', subTitle: 'Visiting | Skin Spec (61422)', category: 'Doctor', numbers: ['8146580816'], availability: 'Thu 4PM–6PM' },
        { id: 'vandana_l', title: 'Dr. Vandana Lalwani', subTitle: 'Visiting | Gynecologist (63977)', category: 'Doctor', numbers: ['9814857075'], availability: 'Tue & Fri 4PM–6PM' },

        // Nursing & Staff
        { id: 'lovepreet', title: 'Lovepreet Singh', subTitle: 'Staff Nurse (30342)', category: 'Nursing', numbers: ['9914550656'], availability: '24 hrs | BH-4 R801' },
        { id: 'jagdeep_n', title: 'Jagdeep Singh', subTitle: 'Deputy Supt Nursing (21156)', category: 'Nursing', numbers: ['9780036450'], availability: '24 hrs | BH-4/E810' },
        { id: 'davinder', title: 'Davinder Ram', subTitle: 'Staff Nurse (30012)', category: 'Nursing', numbers: ['8284896636'], availability: 'BH-4' },
        { id: 'jagsir', title: 'Jagsir Singh', subTitle: 'Staff Nurse (31219)', category: 'Nursing', numbers: ['7888339220'] },
        { id: 'naveen_n', title: 'Naveen Kumar', subTitle: 'Staff Nurse (31091)', category: 'Nursing', numbers: ['8700219223'] },
        { id: 'anu_bala', title: 'Anu Bala', subTitle: 'Staff Nurse (28865)', category: 'Nursing', numbers: ['8360751806'], availability: 'GH' },
        { id: 'manpreet_k', title: 'Manpreet Kaur', subTitle: 'Staff Nurse (31781)', category: 'Nursing', numbers: ['8427178725'], availability: 'GH' },
        { id: 'rajpinder', title: 'Rajpinder', subTitle: 'Staff Nurse (15477)', category: 'Nursing', numbers: ['6284518196'], availability: 'GH-5 Block-B 231' },
        { id: 'priyanka_d', title: 'Priyanka Devi', subTitle: 'Staff Nurse (22561)', category: 'Nursing', numbers: ['7831009173'], availability: 'GH-2/301' },
        { id: 'karamjit', title: 'Karamjit Kaur', subTitle: 'Staff Nurse (14456)', category: 'Nursing', numbers: ['7889114351'], availability: 'GH-2/322' },
        { id: 'rajinder_k', title: 'Rajinder Kaur', subTitle: 'Ward Lady (29903)', category: 'Nursing', numbers: ['7973370167'], availability: '7 PM to 7 AM' },
        { id: 'bholi', title: 'Bholi', subTitle: 'Ward Lady (70464)', category: 'Nursing', numbers: ['8968974206'], availability: '8:30 AM – 5:30 PM' },
        { id: 'rajesh_w', title: 'Rajesh Narayan', subTitle: 'Ward Boy (23034)', category: 'Nursing', numbers: ['8054618366'], availability: 'BH-1 C308' },
        { id: 'ghanshyam_w', title: 'Ghanshyam', subTitle: 'Ward Boy (22474)', category: 'Nursing', numbers: ['8283808959'], availability: 'BH-1 C308' },
        { id: 'krishan_w', title: 'Krishan Kumar', subTitle: 'Ward Boy (30152)', category: 'Nursing', numbers: ['9888210919'] },

        // Counseling & Health
        { id: 'shweta_b', title: 'Shweta Bharadwaj', subTitle: 'Psychologist (61212)', category: 'Counseling', numbers: ['01824444079'], availability: 'Tue 4–6PM | Sat 11–1PM' },
        { id: 'neha_s', title: 'Ms. Neha Sharma', subTitle: 'Psychologist (24088)', category: 'Counseling', numbers: ['01824444509'], availability: '9 AM – 5:30 PM' },
        { id: 'anusuya_h', title: 'Ms. Anusuya Hazarika', subTitle: 'Psychologist (24082)', category: 'Counseling', numbers: ['01824444509'] },
        { id: 'babita', title: 'Ms. Babita', subTitle: 'Psychologist (24639)', category: 'Counseling', numbers: ['01824444509'] },
        { id: 'anuradha', title: 'Ms. Anuradha', subTitle: 'Psychologist (25481)', category: 'Counseling', numbers: ['01824444509'] },

        // Medical Facilities (Internal)
        { id: 'hc_reception', title: 'HC Reception', subTitle: '24x7 Help Desk', category: 'Facility', numbers: ['01824444079', '01824501227'] },
        { id: 'hc_male_ward', title: 'Male Ward', subTitle: 'Indoor Facility', category: 'Facility', numbers: ['01824444066'] },
        { id: 'hc_female_ward', title: 'Female Ward', subTitle: 'Indoor Facility', category: 'Facility', numbers: ['01824444067'] },
        { id: 'hc_medical_store', title: 'Medical Store', subTitle: 'Subsidized Medicine', category: 'Facility', numbers: ['01824444068'], availability: '24 Hours Open' },
        { id: 'hc_lab', title: 'Medical Lab', subTitle: 'Diagnostic Lab', category: 'Facility', numbers: ['01824444069'] },
        {
            id: 'hc_cabins', title: 'Doctor Cabins', subTitle: 'Health Centre Cabins', category: 'Facility', numbers: [],
            blocks: [
                { label: 'Cabin 1', number: '01824444071' },
                { label: 'Cabin 2', number: '01824444072' },
                { label: 'Cabin 3', number: '01824444073' },
                { label: 'Cabin 4', number: '01824444074' },
                { label: 'AO Cabin 5', number: '01824444076' },
                { label: 'Cabin 6', number: '01824495015' },
                { label: 'Cabin 7', number: '01824444077' },
                { label: 'Cabin 8', number: '01824495016' }
            ]
        },

        // Referral Hospitals (External)
        { id: 'ref_doaba', title: 'Doaba Hospital', subTitle: 'Emergency Referral', category: 'Hospital', numbers: ['0181-2226200', '0181-2237137'] },
        { id: 'ref_apex', title: 'Apex Hospital', subTitle: 'Emergency Referral', category: 'Hospital', numbers: ['0181-2226148'] },
        { id: 'ref_sacred', title: 'Sacred Heart', subTitle: 'Emergency Referral', category: 'Hospital', numbers: ['0181-2670664', '0181-2671942'] },
        { id: 'ref_patel', title: 'Patel Hospital', subTitle: 'Emergency Referral', category: 'Hospital', numbers: ['0181-3041000', '0181-9815290790'] },
        { id: 'ref_kamal', title: 'Kamal Hospital', subTitle: 'Emergency Referral', category: 'Hospital', numbers: ['0181-222551'] },
        { id: 'ref_thind', title: 'Thind Eye Hospital', subTitle: 'Emergency Referral', category: 'Hospital', numbers: ['0181-4697500'] },

        // Administration
        { id: 'accounts', title: 'Fee Help Desk', subTitle: 'Accounts Support', category: 'Administrative', numbers: ['01824444337'], email: 'helpdesk.accounts@lpu.co.in', availability: '9AM - 5PM' },
        { id: 'student_rel', title: 'Student Relationship', subTitle: 'Direct Helpline', category: 'Administrative', numbers: ['01824510311', '7347000929'], email: 'parents@lpu.co.in' },
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
                        placeholder="Search hostel, doctor or department..."
                        className="w-full bg-white dark:bg-white/[0.03] pl-14 pr-6 py-5 rounded-[24px] border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-orange-600/10 focus:border-orange-500/30 transition-all dark:text-white"
                    />
                </div>

                {/* Grouped Folders */}
                {['Hostel', 'Doctor', 'Nursing', 'Counseling', 'Hospital', 'Facility', 'Administrative'].map((category) => {
                    const categoryItems = filteredDirectory.filter(item => item.category === category);
                    if (categoryItems.length === 0) return null;

                    const isExpanded = searchQuery.length > 0 || expandedCategories.includes(category);

                    return (
                        <div key={category} className="space-y-8 animate-fade-in">
                            {/* Category Folder Card */}
                            <button
                                onClick={() => toggleCategory(category)}
                                className={`w-full bg-white dark:bg-white/[0.03] p-6 md:p-8 rounded-[40px] border border-slate-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:border-orange-500/30 transition-all group active:scale-[0.98] ${isExpanded ? 'ring-2 ring-orange-500/20 border-orange-500/20' : ''}`}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${category === 'Hostel' ? 'bg-orange-600 text-white shadow-orange-600/20' :
                                            category === 'Doctor' ? 'bg-red-600 text-white shadow-red-600/20' :
                                                category === 'Nursing' ? 'bg-blue-600 text-white shadow-blue-600/20' :
                                                    category === 'Counseling' ? 'bg-purple-600 text-white shadow-purple-600/20' :
                                                        category === 'Hospital' ? 'bg-cyan-600 text-white shadow-cyan-600/20' :
                                                            category === 'Facility' ? 'bg-slate-700 text-white shadow-slate-700/20' :
                                                                'bg-emerald-600 text-white shadow-emerald-600/20'
                                        }`}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
                                            {category === 'Hostel' ? <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> :
                                                category === 'Doctor' ? <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm10 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" /> :
                                                    category === 'Nursing' ? <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm12-3s0 3-3 3-3-3-3-3M16 3.13a4 4 0 0 1 0 7.75" /> :
                                                        category === 'Counseling' ? <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /> :
                                                            category === 'Hospital' ? <path d="M19 14l-2-2m0 0l-2 2m2-2V6m2 13H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11l3 3v11a2 2 0 0 1-2 2z" /> :
                                                                category === 'Facility' ? <path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7M4 21V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v17" /> :
                                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6" />}
                                        </svg>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none text-left">
                                            {category === 'Hostel' ? 'Hostel Directory' :
                                                category === 'Doctor' ? 'Doctors & Residents' :
                                                    category === 'Nursing' ? 'Nursing & Staff' :
                                                        category === 'Counseling' ? 'Counseling Psychologists' :
                                                            category === 'Hospital' ? 'Referral Hospitals' :
                                                                category === 'Facility' ? 'Medical Facilities' : 'Administration'}
                                        </h3>
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-left">{categoryItems.length} Verified Records Found</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest border border-slate-200 dark:border-white/5 px-3 py-1.5 rounded-full">
                                        {isExpanded ? 'Collapse' : 'Expand Folder'}
                                    </span>
                                    <div className={`w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 transition-transform duration-500 ${isExpanded ? 'rotate-90' : ''}`}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="m9 18 6-6-6-6" /></svg>
                                    </div>
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                                    {categoryItems.map((item) => (
                                        <div key={item.id} className="group p-6 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-[32px] hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-600/5 transition-all duration-500 flex flex-col justify-between">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-0.5">
                                                        <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-tight">{item.title}</h4>
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
                                                        <span className="text-[8px] font-black uppercase text-blue-500 tracking-widest leading-none">{item.availability}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-6 flex gap-2">
                                                {item.numbers.length > 0 ? item.numbers.map((num, i) => (
                                                    <a key={i} href={`tel:${num}`} className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-orange-600 dark:hover:bg-orange-600 hover:text-white dark:hover:text-white transition-all no-underline">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                                        Call
                                                    </a>
                                                )) : (
                                                    <div className="flex-1 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl text-[8px] font-black uppercase text-slate-400 tracking-widest text-center italic">
                                                        Internal Line
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

                {filteredDirectory.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[40px] opacity-40">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">No matching records found</p>
                    </div>
                )}
            </div>

            {/* Uni Health Centre HQ Section */}
            <div className="bg-white dark:bg-white/[0.03] rounded-[60px] p-8 md:p-16 border border-slate-200 dark:border-white/10 shadow-[0_32px_128px_rgba(0,0,0,0.08)] space-y-16">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-slate-100 dark:border-white/5 pb-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/10 text-red-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                            Hospital HQ
                        </div>
                        <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Uni Health Centre</h3>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Block 03, Lovely Professional University • Open 24/7/365</p>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[32px] border border-slate-100 dark:border-white/5 max-w-xs">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">Referral Concessions</p>
                        <ul className="text-[10px] font-black text-slate-900 dark:text-white uppercase space-y-1.5 list-none p-0">
                            <li className="flex justify-between"><span>Private Wards</span> <span className="text-orange-600">10% Off</span></li>
                            <li className="flex justify-between"><span>General Wards</span> <span className="text-orange-600">20% Off</span></li>
                            <li className="flex justify-between"><span>Patel Hospital</span> <span className="text-orange-600">5% Off</span></li>
                            <li className="flex justify-between"><span>Diagnostics</span> <span className="text-orange-600">Up to 20%</span></li>
                        </ul>
                        <p className="text-[8px] mt-4 text-slate-400 font-medium text-center italic">Referral Advice Required</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Facilities Card */}
                    <div className="space-y-6">
                        <div className="w-12 h-12 rounded-2xl bg-orange-600/10 text-orange-600 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M19 14l-2-2m0 0l-2 2m2-2V6m2 13H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11l3 3v11a2 2 0 0 1-2 2z" /></svg>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Diagnostic Facilities</h4>
                            <ul className="space-y-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-relaxed">
                                <li>ECG & Cardiac Monitor</li>
                                <li>Oxygen & Nebulization</li>
                                <li>Diagnostic Laboratory</li>
                                <li>Minor OT & Dental Clinic</li>
                                <li>Eye Clinic & Cabin 1-8</li>
                                <li>24x7 Chemist Store</li>
                            </ul>
                        </div>
                    </div>

                    {/* OPD Card */}
                    <div className="space-y-6">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">OPD Specialties</h4>
                            <ul className="space-y-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-relaxed">
                                <li>Medicine & Surgery</li>
                                <li>Eye, Dental & Gynae</li>
                                <li>Psychology & Skin</li>
                                <li>ENT & Ayurvedic</li>
                                <li className="text-emerald-600 font-black">Free Consultation</li>
                                <li className="text-slate-400">Medicines Subsidized</li>
                            </ul>
                        </div>
                    </div>

                    {/* Indoor Card */}
                    <div className="space-y-6">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Indoor Wards</h4>
                            <ul className="space-y-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-relaxed">
                                <li>31 Specialized Beds</li>
                                <li>Separate Gender Wards</li>
                                <li>No Procedure Charges</li>
                                <li>Resident Doctors 24/7</li>
                                <li>Nursing Support</li>
                                <li>Referral Assistance</li>
                            </ul>
                        </div>
                    </div>

                    {/* Emergency Card */}
                    <div className="space-y-6">
                        <div className="w-12 h-12 rounded-2xl bg-red-600/10 text-red-600 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Rapid Emergency</h4>
                            <ul className="space-y-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-relaxed">
                                <li>6 Active Ambulances</li>
                                <li>Free (Serious Cases)</li>
                                <li>Jalandhar Referrals</li>
                                <li>Phagwara Referrals</li>
                                <li>Ludhiana Referrals</li>
                                <li>Specialist Network</li>
                            </ul>
                        </div>
                    </div>
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
