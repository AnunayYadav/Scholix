import React, { useState } from 'react';
import { EmergencyContact } from '../types.ts';

const EmergencyContacts: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const contacts: EmergencyContact[] = [
        { id: '1', name: 'University Helpline', designation: 'General Assistance', phone: '01824-404404', email: 'info@lpu.co.in', category: 'Helpdesk' },
        { id: '2', name: 'Security Control Room', designation: '24/7 Security', phone: '01824-444444', email: 'security@lpu.co.in', category: 'Security' },
        { id: '3', name: 'University Hospital', designation: 'Medical Emergencies', phone: '01824-444555', email: 'health@lpu.co.in', category: 'Healthcare' },
        { id: '4', name: 'Boys Hostel Warden', designation: 'Hostel Admin', phone: '01824-123456', email: 'bh.warden@lpu.co.in', category: 'Hostel' },
        { id: '5', name: 'Girls Hostel Warden', designation: 'Hostel Admin', phone: '01824-654321', email: 'gh.warden@lpu.co.in', category: 'Hostel' },
        { id: '6', name: 'Anti-Ragging Cell', designation: 'Student Welfare', phone: '1800-180-5522', email: 'antiragging@lpu.co.in', category: 'Administration' },
        { id: '7', name: 'IT Helpdesk', designation: 'Technical Support', phone: '01824-400400', email: 'it.help@lpu.co.in', category: 'Helpdesk' },
    ];

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <header className="space-y-3 mb-8 text-center">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                    Rescue <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600">Line</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Quick access to LPU officials and support services.</p>

                <div className="relative mt-6 max-w-sm mx-auto">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-5 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-red-500/10 transition-all dark:text-white"
                    />
                </div>
            </header>

            <div className="grid gap-3">
                {filteredContacts.map(contact => (
                    <div key={contact.id} className="group p-5 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-[28px] hover:border-red-500/30 transition-all duration-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${contact.category === 'Security' ? 'bg-red-500/10 text-red-500' :
                                        contact.category === 'Healthcare' ? 'bg-emerald-500/10 text-emerald-500' :
                                            'bg-blue-500/10 text-blue-500'
                                    }`}>
                                    {contact.category}
                                </span>
                                <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{contact.name}</h4>
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-[0.1em]">{contact.designation}</p>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                            <a href={`tel:${contact.phone}`} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-white hover:bg-orange-600 hover:text-white transition-all no-underline">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                Call
                            </a>
                            <a href={`mailto:${contact.email}`} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-white hover:bg-red-600 hover:text-white transition-all no-underline">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                Email
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmergencyContacts;
