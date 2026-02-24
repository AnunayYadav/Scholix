
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
          className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-600/10 focus:border-orange-500/30 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 placeholder:font-bold"
        />
        {searchQuery && (
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest text-orange-500">
            {totalResults} result{totalResults !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {filteredFaqs.length === 0 ? (
        <div className="text-center py-16 border-4 border-dashed border-slate-100 dark:border-white/5 rounded-2xl opacity-40">
          <p className="text-[10px] font-black uppercase tracking-widest">No matching questions found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFaqs.map((cat, idx) => (
            <div key={idx} className="glass-panel p-8 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-black flex flex-col h-full shadow-sm hover:shadow-xl transition-all">
              <h3 className="text-[10px] font-black text-orange-600 dark:text-orange-500 uppercase tracking-[0.3em] mb-6 border-b border-slate-100 dark:border-white/5 pb-4">{cat.category}</h3>
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

      <div className="mt-12 p-10 bg-slate-900 dark:bg-black border border-slate-800 dark:border-white/5 rounded-2xl text-center shadow-2xl relative overflow-hidden group">
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L21 3l-1.5 4.7z" />
          </svg>
          <span>WhatsApp for Help</span>
        </a>
      </div>
    </div>
  );
};

export default HelpSection;

