
import React, { useState, useEffect, useMemo } from 'react';

const STORAGE_KEY = 'nexus_freshers_checklist';

const defaultItems = [
  { id: 1, item: "Original Marksheets (10th & 12th)", category: "Documents", checked: false },
  { id: 2, item: "Migration Certificate", category: "Documents", checked: false },
  { id: 3, item: "Passport Size Photos", category: "Documents", checked: false },
  { id: 4, item: "Aadhaar Card", category: "Documents", checked: false },
  { id: 5, item: "Bed Sheets & Pillow Covers", category: "Hostel", checked: false },
  { id: 6, item: "Padlock & Keys for Cupboard", category: "Hostel", checked: false },
  { id: 7, item: "Extension Cord (Surge Protector)", category: "Electronics", checked: false, link: "https://www.amazon.in/s?k=extension+cord" },
  { id: 8, item: "Electric Kettle", category: "Electronics", checked: false, link: "https://www.amazon.in/s?k=electric+kettle" },
  { id: 9, item: "Electric Iron", category: "Electronics", checked: false, link: "https://www.amazon.in/s?k=electric+iron" },
  { id: 10, item: "Basic Medicine Kit", category: "Essentials", checked: false },
];

const loadChecklist = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: Record<number, boolean> = JSON.parse(saved);
      return defaultItems.map(item => ({ ...item, checked: !!parsed[item.id] }));
    }
  } catch { }
  return defaultItems;
};

const FreshersKit: React.FC = () => {
  const [checklist, setChecklist] = useState(loadChecklist);

  useEffect(() => {
    const map: Record<number, boolean> = {};
    checklist.forEach(i => { if (i.checked) map[i.id] = true; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  }, [checklist]);

  const toggleItem = (id: number) => {
    setChecklist(checklist.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  };

  const progress = useMemo(() => {
    const done = checklist.filter(i => i.checked).length;
    return { done, total: checklist.length, pct: Math.round((done / checklist.length) * 100) };
  }, [checklist]);

  const categories = ["Documents", "Hostel", "Electronics", "Essentials"];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">Freshmen <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Kit</span></h2>
        <p className="text-slate-600 dark:text-slate-400 font-semibold">The essential checklist for a seamless start at LPU.</p>
      </header>

      {/* Progress Bar */}
      <div className="glass-panel p-5 rounded-2xl border dark:border-white/5 bg-white dark:bg-[#0a0a0a] shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">Progress</span>
          <span className="text-[11px] sm:text-xs font-semibold text-orange-600 dark:text-orange-500">{progress.done}/{progress.total} — {progress.pct}%</span>
        </div>
        <div className="h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress.pct}%` }}
          />
        </div>
        {progress.pct === 100 && (
          <p className="text-[11px] sm:text-xs font-semibold text-green-500 mt-3 text-center animate-pulse">🎉 All packed! You're ready for LPU.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map(cat => (
          <div key={cat} className="glass-panel p-6 rounded-2xl border dark:border-white/5 bg-white dark:bg-[#0a0a0a] shadow-sm">
            <h3 className="text-[11px] sm:text-xs font-bold text-orange-600 dark:text-orange-500 tracking-tight mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
              {cat}
            </h3>
            <ul className="space-y-4">
              {checklist.filter(i => i.category === cat).map(item => (
                <li key={item.id} className="flex items-center justify-between group">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleItem(item.id)}
                      className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all duration-300 border-none
                        ${item.checked
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                          : 'bg-slate-100 dark:bg-white/5 text-transparent hover:bg-orange-500/20'
                        }`}
                    >
                      {item.checked && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-3 h-3"><polyline points="20 6 9 17 4 12" /></svg>
                      )}
                    </button>
                    <span className={`text-sm font-bold transition-all duration-300 ${item.checked ? 'text-slate-400 dark:text-slate-600 line-through opacity-50' : 'text-slate-700 dark:text-slate-200'}`}>
                      {item.item}
                    </span>
                  </div>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noreferrer" className="text-[11px] sm:text-xs font-medium text-orange-500 hover:text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity bg-orange-500/10 px-3 py-1.5 rounded-lg">Get ↗</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="p-8 bg-gradient-to-br from-orange-600 to-red-700 rounded-2xl text-white shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 flex items-start space-x-6">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-md">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" /><path d="M12 16V12" /><path d="M12 8H12.01" /></svg>
          </div>
          <div>
            <h3 className="font-bold text-[11px] sm:text-xs tracking-tight mb-2 opacity-80">Pro Student Tip</h3>
            <p className="text-sm font-semibold leading-relaxed">
              Don't buy heavy textbooks yet. Use the <strong>Content Library</strong> to find verified digital notes first. Save that money for fests!
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl rounded-full -mr-24 -mt-24 group-hover:scale-110 transition-transform duration-700"></div>
      </div>
    </div>
  );
};

export default FreshersKit;

