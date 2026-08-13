import React, { useState, useMemo } from 'react';
import { FACILITIES_DATA, Facility } from '../data/facilitiesData';

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconLocation = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const IconTag = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const CampusFacilities: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

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

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Search and Filter Section */}
      <div className="pt-2 pb-6">
        <div className="relative group max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-brand-primary transition-colors">
            <IconSearch />
          </div>
          <input
            type="text"
            placeholder="Search stores, ATMs, or items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-[28px] md:rounded-full bg-zinc-200/50 dark:bg-white/5 border-none shadow-none focus:ring-2 focus:ring-brand-primary/50 outline-none text-zinc-800 dark:text-white font-medium text-sm transition-all placeholder:text-zinc-400"
          />
        </div>

        <div className="flex overflow-x-auto gap-2 py-6 no-scrollbar max-w-3xl mx-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-none px-5 py-2.5 rounded-full text-xs font-bold transition-all border-none shadow-none cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-brand-primary text-white font-bold' 
                  : 'bg-zinc-200/50 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center max-w-3xl mx-auto px-1">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Showing {filteredFacilities.length} {filteredFacilities.length === 1 ? 'facility' : 'facilities'}
          </p>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredFacilities.map((facility, idx) => (
          <div 
            key={`${facility.name}-${idx}`}
            className="group p-6 sm:p-7 rounded-[32px] md:rounded-[40px] border-none shadow-none bg-zinc-200/50 dark:bg-white/5 transition-all"
          >
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-brand-primary transition-colors tracking-tight">
                  {facility.name}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-3 py-1 rounded-full bg-zinc-200/60 dark:bg-[#222226] text-[10px] font-bold text-zinc-500 dark:text-zinc-400 border-none shadow-none">
                    {facility.category}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-200/60 dark:bg-[#222226] border-none shadow-none text-zinc-400 group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-all duration-300">
                <IconLocation />
              </div>
            </div>

            <div className="flex items-start gap-3 mb-6">
              <div className="mt-1 text-brand-primary flex-none scale-90">
                <IconLocation />
              </div>
              <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {facility.location}
              </p>
            </div>

            {facility.itemsOffered && facility.itemsOffered.length > 0 && (
              <div className="pt-5 border-t border-zinc-200/40 dark:border-white/5">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-3">Popular Items</span>
                <div className="flex flex-wrap gap-2">
                  {facility.itemsOffered.map((item, i) => {
                    const priceMatch = item.match(/\(₹(\d+)\)/);
                    const name = priceMatch ? item.replace(priceMatch[0], '').trim() : item;
                    const price = priceMatch ? priceMatch[1] : null;

                    return (
                      <div 
                        key={i}
                        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-200/50 dark:bg-[#222226] text-zinc-700 dark:text-zinc-300 text-xs font-semibold border-none shadow-none"
                      >
                        <span>{name}</span>
                        {price && (
                          <span className="text-brand-primary font-bold text-[10px] bg-brand-primary/10 px-2 py-0.5 rounded-full">
                            ₹{price}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredFacilities.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
              <IconSearch />
            </div>
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">No facilities found</h3>
            <p className="text-sm text-zinc-500 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampusFacilities;
