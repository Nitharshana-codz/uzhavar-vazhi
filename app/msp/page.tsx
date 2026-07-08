'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MSP_DATA } from '@/lib/msp-data';

const filters = ['All', 'Kharif', 'Rabi', 'Annual'] as const;

export default function MSPPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const filteredCrops = useMemo(() => {
    const query = search.toLowerCase();
    return MSP_DATA.filter((crop) => {
      const matchesSearch = crop.en.toLowerCase().includes(query) || crop.ta.includes(search);
      const matchesFilter = filter === 'All' || crop.season === filter;
      return matchesSearch && matchesFilter;
    });
  }, [filter, search]);

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <motion.main initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-soil">MSP Prices 2026-27</h1>
            <p className="font-tamil text-lg text-paddy">குறைந்தபட்ச ஆதரவு விலை 2026-27</p>
            <p className="text-sm text-soil/60 mt-1">Government guaranteed minimum prices for major Tamil Nadu crops.</p>
          </div>

          <div className="bg-white rounded-xl border border-straw shadow-sm p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-3">
              <label className="relative flex-1">
                <Search className="absolute left-3 top-3 w-5 h-5 text-soil/40" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search crop / பயிர் தேடுக"
                  className="w-full h-11 pl-10 pr-3 border border-straw rounded-lg bg-white focus:border-turmeric focus:ring-2 focus:ring-turmeric/20 outline-none"
                />
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {filters.map((item) => (
                  <button key={item} onClick={() => setFilter(item)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filter === item ? 'bg-turmeric text-white' : 'bg-white border border-straw text-soil hover:border-turmeric'}`}>
                    {item === 'All' ? 'All / அனைத்தும்' : item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredCrops.map((crop, index) => (
              <motion.div key={crop.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="bg-white rounded-xl border border-straw shadow-sm p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-soil">{crop.en}</h2>
                    <p className="font-tamil text-sm text-soil/60">{crop.ta}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs bg-paddy-light text-paddy">{crop.season}</span>
                </div>
                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-semibold text-paddy">Rs. {crop.msp.toLocaleString('en-IN')}</p>
                    <p className="text-sm text-soil/60">per quintal</p>
                  </div>
                  <div className="text-right text-turmeric">
                    <TrendingUp className="w-5 h-5 ml-auto" />
                    <p className="text-sm font-semibold">+{crop.change}%</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.main>
      <Footer />
    </div>
  );
}
