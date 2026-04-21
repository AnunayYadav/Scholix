
import React, { useState, useMemo } from 'react';
import { useUniversity } from '../hooks/useUniversity';
import { ModuleType } from '../types';

const HelpSection: React.FC = () => {
  const { universityInfo: university, fullBrandName, shortBrandName, studentTerm } = useUniversity();
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const enabledModules = university?.features.enabledModules || [];

  const faqs = useMemo(() => {
    const allFaqs = [
      {
        id: 'market',
        category: `${university?.shortName || shortBrandName} Market & Roommates`,
        module: ModuleType.MARKETPLACE,
        questions: [
          { q: "How do I find roommates?", a: `Navigate to the '${university?.shortName || shortBrandName} Market' section and click on the 'Find Roommates' button at the top. You can post your requirements or connect with others looking for a stay.` },
          { q: "Is the marketplace safe?", a: `${university?.shortName || shortBrandName} Market is exclusively for verified students. However, always meet in public campus areas for exchanges. You can report suspicious listings via the feedback modal.` }
        ]
      },
      {
        id: 'ai',
        category: 'AI Forge (Directory)',
        module: ModuleType.AI_TOOLS,
        questions: [
          { q: "Are all AI tools listed here free?", a: "We curate a mix of Free, Freemium, and Paid tools. Most student-focused tools like Gamma (for PPTs) and ChatGPT have generous free tiers. Check the tags on each card for pricing details." },
          { q: "How often is the directory updated?", a: "The 'AI Forge' is updated weekly with the latest breakthroughs in AI for coding, research, and presentations to keep you ahead in your academics." }
        ]
      },
      {
        id: 'academics',
        category: 'Tools & Academics',
        module: ModuleType.CGPA,
        questions: [
          { q: "How does the 'Safe to Skip' calculation work?", a: "It calculates the difference between your current attendance and your target percentage (e.g., 75%) to determine how many upcoming lectures you can miss without dropping below your goal. It's accurate to the nearest session." },
          { q: `Does the CGPA calculator support ${university?.shortName || shortBrandName}'s relative grading?`, a: `The calculator uses the standard 10-point scale. Since relative grading varies by batch performance, use this as a 'Target Minimum'. If you match these grades, you're guaranteed that CGPA regardless of the curve.` }
        ]
      },
      {
        id: 'campus',
        category: 'Campus & Support',
        module: ModuleType.CAMPUS,
        questions: [
          { q: "What is the 'Rescue Line'?", a: "The Rescue Line (Emergency Contacts) provides instant access to hostel wardens, campus security, and healthcare services. It's built for rapid response in critical situations." },
          { q: "How do I contribute notes to the library?", a: `Go to 'Study Material', click 'Contribute', and upload your PYQs or notes. Our Admin ${(studentTerm === 'Verto' ? 'Vertos' : 'Team')} will review and approve them within 24 hours.` }
        ]
      },
      {
        id: 'integrity',
        category: 'Academic Integrity & Policies',
        questions: [
          { q: `Can I share ongoing examination papers on ${fullBrandName}?`, a: `Absolutely NOT. Sharing ongoing semester examination papers through WhatsApp, Telegram, or platforms like ${fullBrandName} is a serious violation of academic integrity and university examination rules. We strictly prohibit such activities.` },
          { q: "What are the consequences of sharing live exam material?", a: `The University takes such misconduct very seriously. Strict disciplinary action is taken against any student found involved, including possible suspension or cancellation of exams. Any ${fullBrandName} account found uploading such material will be permanently banned.` },
          { q: `What is ${fullBrandName}'s liability regarding user-uploaded content?`, a: `${fullBrandName} is an intermediary platform for crowdsourced study material. We do not own, endorse, or verify user-uploaded content, nor are we liable for it. We enforce a zero-tolerance policy for academic malpractice. Users are solely responsible for upholding honesty and fairness in academics.` }
        ]
      },
      {
        id: 'privacy',
        category: 'Data Privacy & Account',
        questions: [
          { q: "Is my personal data securely stored?", a: `Yes. ${fullBrandName} employs enterprise-grade security protocols. We never share your registration details, metrics, or academic records with third parties without your direct authorization.` },
          { q: "What happens if I lose access to my account?", a: "You can securely reset your password from the login screen. Ensure you have access to your registered student email address, as secure recovery links are exclusively dispatched there." },
          { q: "How can I report a bug or request a new feature?", a: "We love student feedback! You can reach out directly via the feedback modal or email us at anunayarvind@gmail.com. We review every request and ship weekly updates." }
        ]
      }
    ];

    // Filter by enabled modules
    return allFaqs.filter(cat => !cat.module || enabledModules.includes(cat.module));
  }, [university, fullBrandName, studentTerm, enabledModules]);

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
  }, [searchQuery, faqs]);

  const totalResults = filteredFaqs.reduce((acc, cat) => acc + cat.questions.length, 0);

  return (
    <div className="w-full pb-12 space-y-6 animate-fade-in">      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600 group-focus-within:text-brand-primary transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search FAQs..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#030303] text-[13px] font-bold text-zinc-800 dark:text-white outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/30 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 placeholder:font-bold"
        />
        {searchQuery && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-medium text-brand-primary">
            {totalResults} result{totalResults !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {filteredFaqs.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-zinc-100 dark:border-white/5 rounded-2xl opacity-40">
          <p className="text-[11px] font-medium">No matching questions found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          {filteredFaqs.map((cat, idx) => (
            <div key={idx} className="p-6 md:p-8 rounded-[32px] bg-zinc-50 dark:bg-[#111111] space-y-4">
              <h3 className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-white/5 pb-2">{cat.category}</h3>
              <div className="space-y-2">
                {cat.questions.map((item, qIdx) => {
                  const key = `${idx}-${qIdx}`;
                  const isOpen = openItems.has(key) || !!searchQuery.trim();
                  return (
                    <div key={qIdx} className="rounded-xl overflow-hidden bg-zinc-50 dark:bg-white/[0.03]">
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full flex items-start justify-between gap-3 text-left p-3 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors border-none group/q cursor-pointer"
                      >
                        <h4 className="font-bold text-zinc-800 dark:text-white text-[12px] flex items-start leading-snug">
                          <span className="text-brand-primary mr-1.5 flex-shrink-0">Q.</span>
                          {item.q}
                        </h4>
                        <svg
                          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                          className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-zinc-400 dark:text-zinc-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                      >
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium px-4 pb-3 pt-1 border-l-2 border-zinc-100 dark:border-white/10 ml-3.5">
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

      {/* Support Action */}
      <div className="mt-8 p-6 bg-zinc-900 dark:bg-[#030303] border border-zinc-800 dark:border-white/5 rounded-2xl text-center relative overflow-hidden group">
        <h3 className="text-white text-[15px] font-black mb-2 relative z-10 tracking-tight">Need further assistance?</h3>
        <p className="text-zinc-400 mb-5 relative z-10 text-[11px] font-medium">Reach out to our support team for any other queries.</p>
        <a
          href="https://mail.google.com/mail/?view=cm&fs=1&to=anunayarvind@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 bg-white text-black px-6 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-brand-primary hover:text-white active:scale-95 transition-all relative z-10"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <span>Email Support</span>
        </a>
      </div>
    </div>
  );
};

export default HelpSection;

