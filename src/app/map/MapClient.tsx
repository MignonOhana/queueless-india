"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Clock, Users, Star, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';

// Dynamically import the Leaflet map to avoid SSR issues
const LeafletMap = dynamic(() => import('@/components/Map/LeafletBusinessMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  ),
});

// Major Indian cities with approximate coordinates
const CITIES = [
  { name: 'All India', lat: 20.5937, lng: 78.9629, zoom: 5 },
  { name: 'Delhi', lat: 28.6139, lng: 77.2090, zoom: 12 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, zoom: 12 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, zoom: 12 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, zoom: 12 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, zoom: 12 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567, zoom: 12 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639, zoom: 12 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, zoom: 12 },
];

const CATEGORIES = ['all', 'hospitals', 'banks', 'salons', 'restaurants', 'government'];

export interface MapBusiness {
  id: string;
  name: string;
  category: string;
  location: string;
  avg_rating: number;
  total_reviews: number;
  lat?: number;
  lng?: number;
  totalWaiting: number;
  isActive: boolean;
  estimatedWait: number;
}

export default function CityQueueMap() {
  const supabase = createClient();
  const [businesses, setBusinesses] = useState<MapBusiness[]>([]);
  const [activeCity, setActiveCity] = useState(CITIES[0]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<MapBusiness | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          queues!queues_org_id_fkey (
            total_waiting,
            is_active,
            is_accepting_tokens,
            last_issued_number
          )
        `)
        .order('avg_rating', { ascending: false });

      if (error) throw error;

      const mapped: MapBusiness[] = (data || []).map((biz: any) => {
        const queue = biz.queues?.[0];
        return {
          id: biz.id,
          name: biz.name,
          category: biz.category || 'other',
          location: biz.location || '',
          avg_rating: biz.avg_rating || 0,
          total_reviews: biz.total_reviews || 0,
          lat: biz.latitude,
          lng: biz.longitude,
          totalWaiting: queue?.total_waiting || 0,
          isActive: queue?.is_active || false,
          estimatedWait: (queue?.total_waiting || 0) * (biz.serviceMins || 5),
        };
      });

      setBusinesses(mapped);
    } catch (err) {
      console.error('Failed to fetch businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter((b) => {
    if (activeCategory !== 'all' && !b.category.toLowerCase().includes(activeCategory.replace('s', ''))) return false;
    if (searchQuery && !b.name.toLowerCase().includes(searchQuery.toLowerCase()) && !b.location.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="relative w-full h-screen bg-[#0a0a0a] overflow-hidden font-sans">
      {/* Map */}
      <div className="absolute inset-0">
        <LeafletMap
          businesses={filteredBusinesses}
          center={[activeCity.lat, activeCity.lng]}
          zoom={activeCity.zoom}
          onSelect={setSelectedBusiness}
        />
      </div>

      {/* Top Bar */}
      <header className="absolute top-0 inset-x-0 z-[500] p-4 pointer-events-none">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 pointer-events-auto">
          {/* Search + Back */}
          <div className="flex items-center gap-3">
            <Link
              href="/customer"
              className="flex items-center gap-2 bg-white/90 dark:bg-black/60 bg-opacity-95 border border-white/10 px-4 py-2.5 rounded-full text-white shadow-lg hover:bg-white/10 transition shrink-0"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-sm">Live Map</span>
            </Link>
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-black/60 bg-opacity-95 border border-white/10 rounded-full text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* City Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {CITIES.map((city) => (
              <button
                key={city.name}
                onClick={() => setActiveCity(city)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  activeCity.name === city.name
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-black/40 bg-opacity-95 text-slate-400 border border-white/10 hover:text-white'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>

          {/* Category Filters */}
          <div className="hidden md:flex items-center gap-2">
            {CATEGORIES.map((f) => (
              <button
                key={f}
                onClick={() => setActiveCategory(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  activeCategory === f
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-black/40 bg-opacity-95 text-slate-500 border border-white/10 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Wait Time Legend */}
      <div className="absolute top-44 md:top-36 right-4 z-[500] hidden md:block">
        <div className="bg-black/60 bg-opacity-95 border border-white/10 rounded-2xl p-4 w-44">
          <h4 className="text-white text-[10px] font-black uppercase tracking-widest mb-3">Wait Time</h4>
          <div className="space-y-2 text-xs font-medium text-slate-300">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Green</span>&lt; 15m
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400" /> Yellow</span> 15-30m
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500" /> Red</span>&gt; 30m
            </div>
          </div>
        </div>
      </div>

      {/* Selected Business Panel */}
      {selectedBusiness && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-[500]"
        >
          <div className="bg-black/80 bg-opacity-95 border border-white/10 rounded-3xl p-5 shadow-2xl">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-black text-lg">{selectedBusiness.name}</h3>
                <p className="text-slate-400 text-xs">{selectedBusiness.location}</p>
              </div>
              <button onClick={() => setSelectedBusiness(null)} className="text-slate-500 hover:text-white p-1">✕</button>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                <Star size={12} fill="currentColor" /> {selectedBusiness.avg_rating.toFixed(1)}
              </div>
              <div className="flex items-center gap-1 text-blue-400 text-xs font-bold">
                <Users size={12} /> {selectedBusiness.totalWaiting} waiting
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                <Clock size={12} /> ~{selectedBusiness.estimatedWait}m
              </div>
            </div>
            <Link
              href={`/b/${selectedBusiness.id}`}
              className="block w-full py-3 rounded-xl bg-[#00F5A0] text-black font-black text-center text-sm hover:brightness-110 transition"
            >
              Join Queue <ArrowRight size={14} className="inline ml-1" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Results Count */}
      <div className="absolute bottom-6 left-4 z-[500] md:hidden">
        <div className="bg-black/60 bg-opacity-95 border border-white/10 rounded-full px-4 py-2 text-xs text-slate-300 font-bold">
          {filteredBusinesses.length} businesses found
        </div>
      </div>
    </div>
  );
}
