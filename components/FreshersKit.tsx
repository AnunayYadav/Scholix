import React, { useState, useEffect, useMemo } from 'react';
import { useUniversity } from '../hooks/useUniversity.tsx';
import { 
  Check, 
  Plus, 
  Trash2, 
  FileText, 
  Home, 
  Laptop, 
  HeartPulse, 
  BookOpen, 
  ExternalLink, 
  RotateCcw, 
  Sparkles, 
  Lightbulb
} from 'lucide-react';
import { showToast } from './Toast.tsx';

const STORAGE_KEY = 'nexus_freshers_checklist_v3';
const CUSTOM_ITEMS_KEY = 'nexus_freshers_custom_items';

interface ChecklistItem {
  id: string;
  item: string;
  category: 'Documents' | 'Hostel' | 'Electronics' | 'Health' | 'Academic';
  checked: boolean;
  priority?: 'high' | 'normal';
  note?: string;
  link?: string;
  isCustom?: boolean;
}

const DEFAULT_ITEMS: ChecklistItem[] = [
  // Documents
  { id: 'doc-1', item: 'Original Marksheets (10th & 12th)', category: 'Documents', checked: false, priority: 'high', note: 'Keep at least 3 self-attested photocopies' },
  { id: 'doc-2', item: 'Migration & Transfer Certificate', category: 'Documents', checked: false, priority: 'high' },
  { id: 'doc-3', item: 'Passport Size Photos (8-10 copies)', category: 'Documents', checked: false, note: 'White background for official ID cards' },
  { id: 'doc-4', item: 'Aadhaar Card & Photo ID proofs', category: 'Documents', checked: false, priority: 'high' },
  { id: 'doc-5', item: 'Provisional Allotment Letter & Fee Receipts', category: 'Documents', checked: false },
  { id: 'doc-6', item: 'Anti-Ragging Affidavits (Student & Parent)', category: 'Documents', checked: false },

  // Hostel
  { id: 'hos-1', item: 'Single Bed Sheets & Pillow Covers (2 sets)', category: 'Hostel', checked: false },
  { id: 'hos-2', item: 'Brass Padlock & Set of Keys for Cupboard', category: 'Hostel', checked: false, priority: 'high', note: 'Tri-circle or Godrej 50mm' },
  { id: 'hos-3', item: 'Heavy Clothes Hangers (6-8 units)', category: 'Hostel', checked: false },
  { id: 'hos-4', item: 'Bucket, Mug & Laundry Bag', category: 'Hostel', checked: false, note: 'Available at campus marts on arrival' },
  { id: 'hos-5', item: 'Compact Umbrella or Raincoat', category: 'Hostel', checked: false },
  { id: 'hos-6', item: 'Mosquito Repellent (Good Knight / Odomos)', category: 'Hostel', checked: false },

  // Electronics
  { id: 'elec-1', item: 'Extension Cord with Surge Protector', category: 'Electronics', checked: false, link: 'https://www.amazon.in/s?k=extension+cord+surge+protector' },
  { id: 'elec-2', item: 'Laptop, Charger & Protective Sleeve', category: 'Electronics', checked: false, priority: 'high' },
  { id: 'elec-4', item: 'Compact Power Bank (10,000mAh+)', category: 'Electronics', checked: false },
  { id: 'elec-5', item: 'Electric Kettle & Iron (Hostel approved)', category: 'Electronics', checked: false, link: 'https://www.amazon.in/s?k=electric+kettle' },

  // Health
  { id: 'hlth-1', item: 'Basic First Aid & Pain Relief (Paracetamol, Band-Aids)', category: 'Health', checked: false, priority: 'high' },
  { id: 'hlth-2', item: 'Digestive & Anti-acidity Tablets', category: 'Health', checked: false },
  { id: 'hlth-3', item: 'Personal Prescriptions & Doctor Slips', category: 'Health', checked: false },
  { id: 'hlth-4', item: 'Thermometer & Antiseptic Liquid (Dettol/Savlon)', category: 'Health', checked: false },

  // Academic
  { id: 'acad-1', item: 'Scientific Calculator (fx-991CW or EX)', category: 'Academic', checked: false, note: 'Essential for Engineering & Science' },
  { id: 'acad-2', item: 'Document Folder & Clear Sleeves', category: 'Academic', checked: false },
  { id: 'acad-3', item: 'Stationery Kit (Pens, Highlighters, Sticky Notes)', category: 'Academic', checked: false },
];

const CATEGORIES: { id: ChecklistItem['category']; label: string; icon: any }[] = [
  { id: 'Documents', label: 'Official Documents', icon: FileText },
  { id: 'Hostel', label: 'Hostel Essentials', icon: Home },
  { id: 'Electronics', label: 'Tech & Gadgets', icon: Laptop },
  { id: 'Health', label: 'Medical & Wellness', icon: HeartPulse },
  { id: 'Academic', label: 'Academic Supplies', icon: BookOpen },
];

const FreshersKit: React.FC = () => {
  const { shortBrandName, universityName } = useUniversity();
  const [activeTab, setActiveTab] = useState<'All' | ChecklistItem['category']>('All');
  const [customItemText, setCustomItemText] = useState('');
  const [customCategory, setCustomCategory] = useState<ChecklistItem['category']>('Hostel');
  const [showAddForm, setShowAddForm] = useState(false);

  // Load state
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    try {
      const savedChecked = localStorage.getItem(STORAGE_KEY);
      const savedCustom = localStorage.getItem(CUSTOM_ITEMS_KEY);

      const checkedMap: Record<string, boolean> = savedChecked ? JSON.parse(savedChecked) : {};
      const customItems: ChecklistItem[] = savedCustom ? JSON.parse(savedCustom) : [];

      const combined = [...DEFAULT_ITEMS, ...customItems];
      return combined.map(item => ({
        ...item,
        checked: !!checkedMap[item.id]
      }));
    } catch {
      return DEFAULT_ITEMS;
    }
  });

  // Save checked states
  useEffect(() => {
    const checkedMap: Record<string, boolean> = {};
    checklist.forEach(i => {
      if (i.checked) checkedMap[i.id] = true;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedMap));
  }, [checklist]);

  // Save custom items
  useEffect(() => {
    const customItems = checklist.filter(i => i.isCustom);
    localStorage.setItem(CUSTOM_ITEMS_KEY, JSON.stringify(customItems));
  }, [checklist]);

  const toggleItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      item: customItemText.trim(),
      category: customCategory,
      checked: false,
      isCustom: true
    };

    setChecklist(prev => [newItem, ...prev]);
    setCustomItemText('');
    setShowAddForm(false);
    showToast("Item added!", "success");
  };

  const handleDeleteCustomItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChecklist(prev => prev.filter(item => item.id !== id));
    showToast("Item removed.", "info");
  };

  const handleReset = () => {
    if (!window.confirm("Are you sure you want to uncheck all checklist items?")) return;
    setChecklist(prev => prev.map(i => ({ ...i, checked: false })));
    showToast("Checklist reset.", "info");
  };

  const progress = useMemo(() => {
    const total = checklist.length;
    const done = checklist.filter(i => i.checked).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { done, total, pct };
  }, [checklist]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20 px-4 text-left">
      {/* Header */}
      <header className="pt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse inline-block" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Campus Checklist
            </p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Freshers <span className="text-brand-primary">Kit</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-normal mt-0.5">
            Essential packing checklist for {shortBrandName || universityName}.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-primary hover:opacity-90 text-white flex items-center gap-1.5 shadow-xs transition-all active:scale-95 border-none cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
          <button
            onClick={handleReset}
            title="Reset checklist progress"
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-white dark:bg-[#141417] border border-zinc-200/80 dark:border-white/[0.08] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Sleek Minimal Progress Bar */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">Packing Progress</span>
            <span className="text-zinc-400 font-normal">• {progress.done} of {progress.total} packed</span>
            {progress.pct === 100 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500 ml-1">
                <Sparkles className="w-3 h-3" /> Ready for campus!
              </span>
            )}
          </div>
          <span className="font-bold text-brand-primary text-xs">{progress.pct}%</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress.pct}%` }}
          />
        </div>
      </div>

      {/* Quick Add Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleAddCustomItem} className="p-3.5 rounded-2xl bg-white dark:bg-[#141417] border border-brand-primary/40 shadow-xs animate-slide-up flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            required
            value={customItemText}
            onChange={(e) => setCustomItemText(e.target.value)}
            placeholder="Item name (e.g. Extra specs, Umbrella)..."
            className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.08] focus:border-brand-primary/60 outline-none text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 font-medium transition-all"
          />
          <select
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.08] focus:border-brand-primary/60 outline-none text-xs text-zinc-900 dark:text-white font-medium transition-all cursor-pointer"
          >
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <div className="flex items-center gap-1.5">
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all border-none cursor-pointer"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-2.5 py-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs transition-colors border-none bg-transparent cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveTab('All')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border cursor-pointer ${
            activeTab === 'All'
              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs'
              : 'bg-white dark:bg-[#141417] text-zinc-600 dark:text-zinc-400 border-zinc-200/80 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
        >
          All Items ({checklist.length})
        </button>
        {CATEGORIES.map(cat => {
          const catCount = checklist.filter(i => i.category === cat.id).length;
          const catDone = checklist.filter(i => i.category === cat.id && i.checked).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer ${
                activeTab === cat.id
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs'
                  : 'bg-white dark:bg-[#141417] text-zinc-600 dark:text-zinc-400 border-zinc-200/80 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                activeTab === cat.id ? 'bg-white/20 dark:bg-black/20' : 'bg-zinc-100 dark:bg-white/5 text-zinc-400'
              }`}>
                {catDone}/{catCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Categories & Seamless Clean List Items (NO NESTED BOXES) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {(activeTab === 'All' ? CATEGORIES : CATEGORIES.filter(c => c.id === activeTab)).map(cat => {
          const itemsInCat = checklist.filter(i => i.category === cat.id);
          if (itemsInCat.length === 0) return null;
          const IconComponent = cat.icon;
          const doneInCat = itemsInCat.filter(i => i.checked).length;

          return (
            <div
              key={cat.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#141417] border border-zinc-200/80 dark:border-white/[0.08] shadow-xs"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-100 dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4 text-brand-primary" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">
                    {cat.label}
                  </h3>
                </div>
                <span className="text-xs font-semibold text-zinc-400">
                  {doneInCat}/{itemsInCat.length}
                </span>
              </div>

              {/* Seamless List Items without inner boxes */}
              <ul className="divide-y divide-zinc-100/60 dark:divide-white/[0.03]">
                {itemsInCat.map(item => (
                  <li
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className="group py-2.5 px-1.5 rounded-lg flex items-start justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Minimal circular checkbox */}
                      <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        item.checked
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'border border-zinc-300 dark:border-white/20 group-hover:border-brand-primary/60 bg-transparent'
                      }`}>
                        {item.checked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-xs font-medium tracking-tight transition-colors ${
                            item.checked
                              ? 'text-zinc-400 dark:text-zinc-500 line-through'
                              : 'text-zinc-800 dark:text-zinc-200'
                          }`}>
                            {item.item}
                          </span>
                          {item.priority === 'high' && !item.checked && (
                            <span className="text-[10px] font-semibold text-rose-500 dark:text-rose-400">
                              • Crucial
                            </span>
                          )}
                        </div>

                        {item.note && (
                          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 leading-snug">
                            {item.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 text-zinc-400 hover:text-brand-primary transition-colors"
                          title="Find item online"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {item.isCustom && (
                        <button
                          onClick={(e) => handleDeleteCustomItem(item.id, e)}
                          className="p-1 text-zinc-400 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
                          title="Delete personal item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Minimal Senior Student Tips */}
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/60 dark:border-white/[0.05] flex items-start gap-3">
        <Lightbulb className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
          <strong className="text-zinc-700 dark:text-zinc-300 font-semibold">Pro Student Tip:</strong> Don't buy heavy physical reference textbooks upfront. Access verified digital notes and past semester papers in the Scholix Content Library first.
        </p>
      </div>
    </div>
  );
};

export default FreshersKit;
