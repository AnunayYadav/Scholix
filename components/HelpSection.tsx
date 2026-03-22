
import React, { useState, useMemo } from 'react';

const HelpSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const faqs = [
    {
      category: 'LPU Market & Roommates',
      questions: [
        { q: "How do I find roommates?", a: "Navigate to the 'LPU Market' section and click on the 'Find Roommates' button at the top. You can post your requirements or connect with others looking for a stay." },
        { q: "Is the marketplace safe?", a: "LPU Market is exclusively for verified students. However, always meet in public campus areas for exchanges. You can report suspicious listings via the feedback modal." }
      ]
    },
    {
      category: 'AI Forge (Directory)',
      questions: [
        { q: "Are all AI tools listed here free?", a: "We curate a mix of Free, Freemium, and Paid tools. Most student-focused tools like Gamma (for PPTs) and ChatGPT have generous free tiers. Check the tags on each card for pricing details." },
        { q: "How often is the directory updated?", a: "The 'AI Forge' is updated weekly with the latest breakthroughs in AI for coding, research, and presentations to keep you ahead in your academics." }
      ]
    },
    {
      category: 'Tools & Academics',
      questions: [
        { q: "How does the 'Safe to Skip' calculation work?", a: "It calculates the difference between your current attendance and your target percentage (e.g., 75%) to determine how many upcoming lectures you can miss without dropping below your goal. It's accurate to the nearest session." },
        { q: "Does the CGPA calculator support LPU's relative grading?", a: "The calculator uses the standard LPU 10-point scale. Since relative grading varies by batch performance, use this as a 'Target Minimum'. If you match these grades, you're guaranteed that CGPA regardless of the curve." }
      ]
    },
    {
      category: 'Campus & Support',
      questions: [
        { q: "What is the 'Rescue Line'?", a: "The Rescue Line (Emergency Contacts) provides instant access to hostel wardens, campus security, and healthcare services. It's built for rapid response in critical situations." },
        { q: "How do I contribute notes to the library?", a: "Go to 'Study Material', click 'Contribute', and upload your PYQs or notes. Our Admin Vertos will review and approve them within 24 hours." }
      ]
    },
    {
      category: 'Academic Integrity & Policies',
      questions: [
        { q: "Can I share ongoing examination papers on LPU-Nexus?", a: "Absolutely NOT. Sharing ongoing semester examination papers through WhatsApp, Telegram, or platforms like LPU-Nexus is a serious violation of academic integrity and university examination rules. We strictly prohibit such activities." },
        { q: "What are the consequences of sharing live exam material?", a: "The University takes such misconduct very seriously. Strict disciplinary action is taken against any student found involved, including possible suspension or cancellation of exams. Any LPU-Nexus account found uploading such material will be permanently banned." },
        { q: "What is LPU-Nexus's liability regarding user-uploaded content?", a: "LPU-Nexus is an intermediary platform for crowdsourced study material. We do not own, endorse, or verify user-uploaded content, nor are we liable for it. We enforce a zero-tolerance policy for academic malpractice. Users are solely responsible for upholding honesty and fairness in academics." }
      ]
    },
    {
      category: 'Data Privacy & Account',
      questions: [
        { q: "Is my personal data securely stored?", a: "Yes. LPU-Nexus employs enterprise-grade security protocols. We never share your registration details, metrics, or academic records with third parties without your direct authorization." },
        { q: "What happens if I lose access to my account?", a: "You can securely reset your password from the login screen. Ensure you have access to your registered student email address, as secure recovery links are exclusively dispatched there." },
        { q: "How can I report a bug or request a new feature?", a: "We love student feedback! You can reach out directly via our WhatsApp support lifeline linked at the bottom of this page. We review every request and ship weekly updates." }
      ]
    }
  ];

  const toggleItem = (key: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const q = searchQuery.toLowerCase();
    return faqs
      .map(cat => ({
        ...cat,
        questions: cat.questions.filter(
          item => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
        )
      }))
      .filter(cat => cat.questions.length > 0);
  }, [searchQuery]);

  const totalResults = filteredFaqs.reduce((acc, cat) => acc + cat.questions.length, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <header className="mb-10">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tighter">Knowledge <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Base</span></h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg font-medium leading-relaxed">Master the LPU-Nexus ecosystem with verified intel.</p>
      </header>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 group-focus-within:text-orange-500 transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search FAQs..."
          className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-600/10 focus:border-orange-500/30 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 placeholder:font-bold"
        />
        {searchQuery && (
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[11px] sm:text-xs font-medium text-orange-500">
            {totalResults} result{totalResults !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {filteredFaqs.length === 0 ? (
        <div className="text-center py-16 border-4 border-dashed border-slate-100 dark:border-white/5 rounded-2xl opacity-40">
          <p className="text-[11px] sm:text-xs font-medium">No matching questions found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFaqs.map((cat, idx) => (
            <div key={idx} className="glass-panel p-8 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a] flex flex-col h-full shadow-sm hover:shadow-xl transition-all">
              <h3 className="text-[11px] sm:text-xs font-black text-orange-600 dark:text-orange-500 uppercase tracking-[0.3em] mb-6 border-b border-slate-100 dark:border-white/5 pb-4">{cat.category}</h3>
              <div className="space-y-3 flex-1">
                {cat.questions.map((item, qIdx) => {
                  const key = `${idx}-${qIdx}`;
                  const isOpen = openItems.has(key) || !!searchQuery.trim();
                  return (
                    <div key={qIdx} className="rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full flex items-start justify-between gap-3 text-left p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/5 transition-all border-none group/q cursor-pointer"
                      >
                        <h4 className="font-black text-slate-800 dark:text-white leading-tight text-sm md:text-base flex items-start">
                          <span className="text-orange-500 mr-2 flex-shrink-0">Q.</span>
                          {item.q}
                        </h4>
                        <svg
                          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                          className={`w-4 h-4 flex-shrink-0 mt-1 text-slate-400 dark:text-slate-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                      >
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium px-4 pb-4 pt-2 border-l-2 border-slate-100 dark:border-white/10 ml-4">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compliance & Policy Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 glass-panel p-10 rounded-[32px] border border-orange-500/10 bg-orange-500/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[80px] rounded-full -mr-32 -mt-32" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                <div className="space-y-3">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Compliance & Policies</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm">Learn about how we handle your data, our adherence to university academic rules, and our commitment to privacy.</p>
                </div>
                <div className="flex gap-4">
                  <a 
                    href="/privacy" 
                    className="px-8 py-3.5 bg-orange-600 text-white rounded-2xl text-[13px] font-bold hover:bg-orange-500 hover:-translate-y-1 transition-all shadow-lg shadow-orange-600/20 active:scale-95 flex items-center gap-2"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    View Privacy Policy
                  </a>
                </div>
            </div>
          </div>
      </div>

      <div className="mt-12 p-10 bg-slate-900 dark:bg-[#0a0a0a] border border-slate-800 dark:border-white/5 rounded-2xl text-center shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none transition-transform duration-1000 group-hover:scale-110">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>
        <h3 className="text-white text-2xl font-black mb-4 relative z-10 uppercase tracking-tight">Still have questions?</h3>
        <p className="text-slate-400 mb-8 max-w-md mx-auto relative z-10 text-sm font-medium">Our student support team is ready to help you navigate through your campus journey.</p>
        <a
          href="https://wa.me/918935031251?text=Hi!%20I%20need%20some%20help%20with%20LPU-Nexus."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-3 bg-white text-black px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#25D366] hover:text-white hover:scale-105 active:scale-95 transition-all shadow-xl relative z-10"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.412.001 12.04c0 2.123.542 4.198 1.585 6.03l-1.585 6.187 6.326-1.66A11.826 11.826 0 0012.05 24.122c6.635 0 12.047-5.412 12.05-12.046a11.83 11.83 0 00-3.517-8.477z" />
          </svg>
          <span>WhatsApp for Help</span>
        </a>
      </div>
    </div>
  );
};

export default HelpSection;

