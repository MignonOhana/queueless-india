"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, X, Radar, Navigation } from 'lucide-react';
import Link from 'next/link';
import QueueMap from '@/components/QueueMap';

export default function CityQueueMap() {
  const [mounted, setMounted] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  
  if (!mounted) return null;

  return (
    <div className="relative w-full h-[80vh] md:h-screen bg-[#0a0a0a] overflow-hidden font-sans">
      
      {/* Interactive Google Map Component */}
      <div className="absolute inset-0">
         <QueueMap 
            onLocationFound={(lat, lng) => console.log("User located:", lat, lng)} 
         />
      </div>

      {/* Top Navigation & Filters */}
      <header className="absolute top-0 inset-x-0 z-10 p-4 md:p-6 pointer-events-none">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pointer-events-auto">
            
            <div className="flex items-center gap-4">
               <Link href="/customer" className="flex items-center gap-2 bg-white/90 dark:bg-black/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 px-4 py-2 rounded-full text-slate-800 dark:text-white shadow-sm hover:bg-white dark:hover:bg-white/10 transition">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="font-bold tracking-tight text-sm">Live City Map</span>
               </Link>
            </div>

            {/* Filters */}
            <div className="hidden md:flex items-center gap-2 bg-white/90 dark:bg-black/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-1.5 rounded-full shadow-sm">
              {['all', 'hospitals', 'banks', 'salons', 'restaurants', 'government'].map(f => (
                <button 
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${activeFilter === f ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
                >
                  {f}
                </button>
              ))}
            </div>
            
         </div>
      </header>

      {/* Floating HUD Indicators */}
      <div className="absolute top-24 right-6 z-10 hidden md:flex flex-col gap-3 pointer-events-none">
         <div className="bg-white/90 dark:bg-black/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-4 w-48 shadow-lg">
            <h4 className="text-slate-800 dark:text-white text-xs font-bold uppercase tracking-widest mb-3">
              Wait Time Legend
            </h4>
            <div className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm border border-emerald-600/20"></span> Green</span> &lt; 10m</div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm border border-amber-500/20"></span> Yellow</span> 10-25m</div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm border border-rose-600/20"></span> Red</span> &gt; 25m</div>
            </div>
         </div>
      </div>

    </div>
  );
}
