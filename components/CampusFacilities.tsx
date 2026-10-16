import React, { useState, useMemo } from 'react';
import { FACILITIES_DATA } from '../data/facilitiesData';
import { 
  Search, 
  MapPin, 
  X, 
  Building2, 
  Copy, 
  Check, 
  Tag
} from 'lucide-react';
import { showToast } from './Toast.tsx';

const CampusFacilities: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(FACILITIES_DATA.map(f => f.category));
    return ['All', ...Array.from(cats).sort()];
  }, []);

  const filteredFacilities = useMemo(() => {
    return FACILITIES_DATA.filter(f => {
      const matchesSearch = 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.itemsOffered?.some(item => item.toLowerCase().includes(searchQuery.toLowerCase())));
      
      const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleCopyLocation = (location: string, idx: number) => {
    navigator.clipboard.writeText(location);
    setCopiedIndex(idx);
    showToast(`Copied "${location}" to clipboard`, "success");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 text-left">
      {/* Search and Filters */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search stores, ATMs, food, or blocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white dark:bg-[#141417] border border-zinc-200/80 dark:border-white/[0.08] focus:border-brand-primary/60 outline-none text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 font-medium transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <span className="text-xs font-semibold text-zinc-400 shrink-0">
            {filteredFacilities.length} {filteredFacilities.length === 1 ? 'facility' : 'facilities'} found
          </span>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs' 
                  : 'bg-white dark:bg-[#141417] text-zinc-600 dark:text-zinc-400 border-zinc-200/80 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {filteredFacilities.map((facility, idx) => (
          <div 
            key={`${facility.name}-${idx}`}
            className="group p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-[#141417] border border-zinc-200/80 dark:border-white/[0.08] hover:border-brand-primary/40 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              {/* Header: Title and Category */}
              <div className="flex items-start justify-between gap-2.5">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-brand-primary transition-colors tracking-tight line-clamp-1">
                  {facility.name}
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-wider shrink-0">
                  {facility.category}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                <span className="truncate font-medium">{facility.location}</span>
              </div>
            </div>

            {/* Popular Items / Services offered */}
            {facility.itemsOffered && facility.itemsOffered.length > 0 && (
              <div className="pt-2 border-t border-zinc-100 dark:border-white/[0.05] space-y-1.5">
                <div className="flex flex-wrap gap-1.5">
                  {facility.itemsOffered.map((item, i) => {
                    const priceMatch = item.match(/\(₹(\d+)\)/);
                    const name = priceMatch ? item.replace(priceMatch[0], '').trim() : item;
                    const price = priceMatch ? priceMatch[1] : null;

                    return (
                      <span 
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-white/[0.04] text-[11px] font-medium text-zinc-700 dark:text-zinc-300"
                      >
                        <span className="truncate max-w-[140px]">{name}</span>
                        {price && (
                          <span className="text-brand-primary font-bold text-[10px]">
                            ₹{price}
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Card Footer: Quick Copy Location Action */}
            <div className="pt-2 border-t border-zinc-100 dark:border-white/[0.04] flex items-center justify-between">
              <span className="text-[11px] text-zinc-400 font-medium truncate">
                On-campus facility
              </span>
              <button
                onClick={() => handleCopyLocation(facility.location, idx)}
                title="Copy location"
                className="px-2 py-1 rounded-lg text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-brand-primary hover:bg-brand-primary/10 transition-colors flex items-center gap-1 border-none bg-transparent cursor-pointer"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-500 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}

        {filteredFacilities.length === 0 && (
          <div className="col-span-full py-16 px-4 text-center rounded-2xl bg-white dark:bg-[#141417] border border-zinc-200/80 dark:border-white/[0.08] space-y-2">
            <Building2 className="w-8 h-8 text-zinc-400 mx-auto opacity-50" />
            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No facilities found</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
              No matching facility for "{searchQuery}". Try searching for another store or category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampusFacilities;
