import React, { useState, useMemo } from 'react';
import { useUniversity } from '../hooks/useUniversity';
import { ModuleType } from '../types';
import { HelpCircle, Search, Mail, ChevronDown } from 'lucide-react';

const HelpSection: React.FC = () => {
  const { universityInfo: university, fullBrandName, shortBrandName, studentTerm } = useUniversity();
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const faqs = useMemo(() => {
    return [
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
  }, [university, shortBrandName, fullBrandName, studentTerm]);

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
    <div className="w-full space-y-6 animate-fade-in pb-16 text-left">
      {/* Dedicated Clean Premium Header */}
      <header className="pb-5 border-b border-zinc-200/60 dark:border-white/[0.06]">
        <div className="flex items-center gap-1.5 mb-1">
          <HelpCircle className="w-3.5 h-3.5 text-brand-primary" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Support & FAQ
          </p>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
          Help & <span className="text-brand-primary">Knowledge Base</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal mt-0.5">
          Frequently asked questions, tool guidelines, and support contacts for {shortBrandName}.
        </p>
      </header>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search questions, calculators, tools..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#141417] border border-zinc-200/80 dark:border-white/[0.08] focus:border-brand-primary/60 outline-none text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 font-medium transition-all shadow-xs"
        />
        {searchQuery && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-brand-primary">
            {totalResults} {totalResults === 1 ? 'result' : 'results'}
          </span>
        )}
      </div>

      {/* FAQ Categories */}
      {filteredFaqs.length === 0 ? (
        <div className="text-center py-12 text-zinc-400 text-xs">
          No matching questions found for "{searchQuery}"
        </div>
      ) : (
        <div className="space-y-6">
          {filteredFaqs.map((cat, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 pb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary inline-block" />
                <span>{cat.category}</span>
              </h3>

              <div className="divide-y divide-zinc-100 dark:divide-white/[0.04] rounded-2xl bg-white dark:bg-[#141417] border border-zinc-200/80 dark:border-white/[0.08] overflow-hidden px-4">
                {cat.questions.map((item, qIdx) => {
                  const key = `${idx}-${qIdx}`;
                  const isOpen = openItems.has(key) || !!searchQuery.trim();
                  return (
                    <div key={qIdx} className="py-3">
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full flex items-start justify-between gap-3 text-left transition-colors border-none bg-transparent cursor-pointer group"
                      >
                        <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-brand-primary text-xs flex items-start leading-snug">
                          {item.q}
                        </h4>
                        <ChevronDown
                          className={`w-4 h-4 shrink-0 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {isOpen && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal pt-2 pr-4 pl-1">
                          {item.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact Support Callout */}
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/60 dark:border-white/[0.05] flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h4 className="text-xs font-semibold text-zinc-900 dark:text-white">Still have questions?</h4>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Our engineering and student support team is here to help.</p>
        </div>
        <a
          href="mailto:anunayarvind@gmail.com"
          className="px-3.5 py-1.5 rounded-xl bg-brand-primary hover:opacity-90 text-white text-xs font-semibold shrink-0 text-decoration-none transition-all active:scale-95"
        >
          Email Us
        </a>
      </div>
    </div>
  );
};

export default HelpSection;
