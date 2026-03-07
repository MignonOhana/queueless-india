"use client";

import { useState, useEffect, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { ColumnLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Clock, Building2, TrendingUp, X, Filter, BarChart3, Radar } from 'lucide-react';
import Link from 'next/link';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJDSU5lLVlnIn0.123";

const INITIAL_VIEW_STATE = {
  longitude: 72.8777,
  latitude: 19.0760,
  zoom: 13,
  pitch: 60,
  bearing: -20
};

const MOCK_BUSINESSES = [
  { id: 'b1', name: 'City Hospital OPD', type: 'hospitals', coordinates: [72.8777, 19.0760], queueLength: 45, waitTime: 35 },
  { id: 'b2', name: 'Metro Bank Branch', type: 'banks', coordinates: [72.8650, 19.0800], queueLength: 12, waitTime: 10 },
  { id: 'b3', name: 'QuickCut Salon', type: 'salons', coordinates: [72.8850, 19.0700], queueLength: 4, waitTime: 5 },
  { id: 'b4', name: 'Regional Passport Office', type: 'government', coordinates: [72.8900, 19.0600], queueLength: 120, waitTime: 90 },
  { id: 'b5', name: 'Spice Route Restaurant', type: 'restaurants', coordinates: [72.8700, 19.0900], queueLength: 22, waitTime: 40 },
  // Adding more data points for a better heatmap
  { id: 'b6', name: 'Central Clinic', type: 'hospitals', coordinates: [72.8800, 19.0720], queueLength: 30, waitTime: 25 },
  { id: 'b7', name: 'Downtown Bank', type: 'banks', coordinates: [72.8720, 19.0650], queueLength: 8, waitTime: 5 },
  { id: 'b8', name: 'Visa Centre', type: 'government', coordinates: [72.8880, 19.0620], queueLength: 85, waitTime: 60 },
  { id: 'b9', name: 'Cafe Mocha', type: 'restaurants', coordinates: [72.8650, 19.0880], queueLength: 15, waitTime: 20 },
];

export default function CityQueueMap() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(MOCK_BUSINESSES);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  
  // New States for AI Crowd Radar
  const [viewMode, setViewMode] = useState<'live' | 'radar'>('live');
  const [radarOffset, setRadarOffset] = useState<number>(0); 

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      // Only randomly fluctuate if we are in live view
      setData(prev => prev.map(biz => {
        const change = Math.floor(Math.random() * 6) - 2;
        const newQueue = Math.max(0, biz.queueLength + change);
        return {
          ...biz,
          queueLength: newQueue,
          waitTime: Math.max(0, biz.waitTime + (change * 1.5))
        };
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const filteredData = useMemo(() => {
    let base = activeFilter === 'all' ? data : data.filter(d => d.type === activeFilter);
    
    // For AI Crowd Radar, we simulate future congestion math
    if (viewMode === 'radar' && radarOffset > 0) {
       return base.map(biz => {
         // E.g., Hospitals get busier in 1hr, Restaurants get busier in 2-3hrs
         let modifier = 1;
         if (biz.type === 'hospitals') modifier = radarOffset === 1 ? 1.5 : 0.8;
         if (biz.type === 'restaurants') modifier = radarOffset >= 2 ? 1.8 : 0.5;
         if (biz.type === 'government') modifier = radarOffset === 3 ? 0.2 : 1.2;
         
         return {
           ...biz,
           queueLength: Math.round(biz.queueLength * modifier),
           waitTime: Math.round(biz.waitTime * modifier)
         };
       });
    }
    
    return base;
  }, [data, activeFilter, viewMode, radarOffset]);

  const layers = [
    viewMode === 'live' 
      ? new ColumnLayer({
          id: 'queue-columns',
          data: filteredData,
          diskResolution: 12,
          radius: 80,
          extruded: true,
          pickable: true,
          elevationScale: 5,
          getPosition: (d: any) => d.coordinates,
          getFillColor: (d: any) => {
            if (d.waitTime < 15) return [16, 185, 129, 255]; // Green
            if (d.waitTime < 45) return [245, 158, 11, 255]; // Yellow
            return [239, 68, 68, 255]; // Red
          },
          getElevation: (d: any) => d.queueLength * 2,
          onClick: (info) => { if (info.object) setSelectedBusiness(info.object); },
          transitions: { getElevation: 1000, getFillColor: 1000 }
        })
      : new HeatmapLayer({
          id: 'ai-crowd-radar',
          data: filteredData,
          getPosition: (d: any) => d.coordinates,
          getWeight: (d: any) => d.queueLength,
          radiusPixels: 60,
          intensity: 1.5,
          threshold: 0.1,
          colorRange: [
            [26, 152, 80],
            [145, 207, 96],
            [217, 239, 139],
            [254, 224, 139],
            [252, 141, 89],
            [215, 48, 39]
          ],
          transitions: { getWeight: 800 }
        })
  ];

  if (!mounted) return null;

  return (
    <div className="relative w-full h-screen bg-[#0a0a0a] overflow-hidden font-sans">
      
      {/* 3D Map Canvas - Base map removed to bypass Turbopack build failure */}
      <div className="absolute inset-0">
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
          layers={layers}
          getTooltip={({object}) => viewMode === 'live' && object && `${object.name}\nWait: ${object.waitTime}m`}
        />
      </div>

      {/* Top Navigation & View Toggle */}
      <header className="absolute top-0 inset-x-0 z-10 p-4 md:p-6 pointer-events-none">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pointer-events-auto">
            
            <div className="flex items-center gap-4">
               <Link href="/" className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full text-white hover:bg-white/10 transition">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="font-bold tracking-tight text-sm">City Map</span>
               </Link>

               {/* Live vs Radar Toggle */}
               <div className="flex bg-black/40 backdrop-blur-xl border border-white/10 p-1 rounded-full">
                  <button 
                    onClick={() => { setViewMode('live'); setRadarOffset(0); setSelectedBusiness(null); }}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'live' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    <BarChart3 size={14} /> Live
                  </button>
                  <button 
                    onClick={() => { setViewMode('radar'); setSelectedBusiness(null); }}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'radar' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 line-through decoration-rose-400/0' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Radar size={14} className={viewMode === 'radar' ? "animate-spin-slow" : ""} /> AI Radar
                  </button>
               </div>
            </div>

            {/* Filters */}
            <div className="hidden md:flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 p-1.5 rounded-full">
              {['all', 'hospitals', 'banks', 'salons', 'restaurants', 'government'].map(f => (
                <button 
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${activeFilter === f ? 'bg-white/20 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  {f}
                </button>
              ))}
            </div>
            
         </div>
      </header>

      {/* AI Radar Time Slider */}
      <AnimatePresence>
         {viewMode === 'radar' && (
            <motion.div 
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 50 }}
               className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 z-40 bg-black/80 backdrop-blur-2xl border border-rose-500/30 p-4 rounded-3xl w-[calc(100%-3rem)] md:w-full max-w-md shadow-[0_0_50px_rgba(225,29,72,0.2)]"
            >
               <div className="flex justify-between items-center mb-4 px-2">
                 <h3 className="text-rose-400 font-bold text-sm tracking-wider flex items-center gap-2"><Radar size={16}/> PREDICTIVE TIMELINE</h3>
                 <span className="text-white font-black text-lg">{radarOffset === 0 ? "Right Now" : `+${radarOffset} Hours`}</span>
               </div>
               
               <div className="flex gap-2">
                  {[0, 1, 2, 3].map(h => {
                     const timeStr = new Date(Date.now() + h * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                     return (
                       <button 
                         key={h}
                         onClick={() => setRadarOffset(h)}
                         className={`flex-1 flex flex-col items-center py-2 rounded-xl border transition-all ${radarOffset === h ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'}`}
                       >
                         <span className="font-bold text-sm">{h === 0 ? 'Now' : `+${h}h`}</span>
                         <span className="text-[10px] font-semibold opacity-70 mt-0.5">{timeStr}</span>
                       </button>
                     );
                  })}
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Floating HUD Indicators */}
      <div className="absolute top-24 right-6 z-10 hidden md:flex flex-col gap-3 pointer-events-none">
         <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 w-48 shadow-2xl">
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-3">
              {viewMode === 'live' ? 'Load Legend' : 'Density Heatmap'}
            </h4>
            {viewMode === 'live' ? (
              <div className="space-y-2 text-xs font-medium text-slate-300">
                <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span> Low</span> &lt; 15m</div>
                <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span> Med</span> 15-45m</div>
                <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span> High</span> &gt; 45m</div>
              </div>
            ) : (
              <div className="h-4 w-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-rose-600 rounded-full" />
            )}
         </div>
      </div>

      {/* Selected Business Custom Popup (Live Mode Only) */}
      <AnimatePresence>
        {viewMode === 'live' && selectedBusiness && (
          <motion.div 
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.y > 100 || velocity.y > 500) {
                setSelectedBusiness(null);
              }
            }}
            className="absolute bottom-0 inset-x-0 z-50 w-full md:left-12 md:bottom-12 md:translate-x-0 md:max-w-sm bg-black/95 md:bg-black/80 backdrop-blur-3xl border-t md:border border-white/20 px-6 pt-4 pb-32 md:p-6 rounded-t-[2.5rem] md:rounded-[2rem] shadow-[0_-10px_50px_rgba(0,0,0,0.5)] md:shadow-[0_10px_50px_rgba(0,0,0,0.5)] touch-pan-y"
          >
             {/* Bottom Sheet Pill Handle for Mobile */}
             <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6 md:hidden shrink-0" />
             
             <button onClick={() => setSelectedBusiness(null)} className="hidden md:block absolute top-4 right-4 text-slate-400 hover:text-white transition bg-white/5 rounded-full p-1 border border-white/5">
               <X size={18} />
             </button>

             <div className="flex items-center gap-4 mb-4 mt-2">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 ${
                 selectedBusiness.waitTime < 15 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                 selectedBusiness.waitTime < 45 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                 'bg-rose-500/20 text-rose-400 border-rose-500/30'
               }`}>
                 <Building2 size={28} />
               </div>
               <div>
                  <h2 className="text-xl font-bold text-white leading-tight">{selectedBusiness.name}</h2>
                  <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mt-1">{selectedBusiness.type}</p>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                   <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1"><Clock size={12}/> Est Wait</div>
                   <div className="text-2xl font-black text-white">{Math.round(selectedBusiness.waitTime)} <span className="text-sm font-medium text-slate-500">min</span></div>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                   <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1"><TrendingUp size={12}/> In Queue</div>
                   <div className="text-2xl font-black text-white">{selectedBusiness.queueLength} <span className="text-sm font-medium text-slate-500">ppl</span></div>
                </div>
             </div>

             {/* AI Insight Box */}
             <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-4 rounded-2xl mb-6">
                <div className="flex justify-between items-center mb-2">
                   <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"/> AI Prediction</h4>
                </div>
                <div className="space-y-1.5 text-sm font-medium">
                   <div className="flex justify-between items-center text-slate-300">
                      <span>Predicted Peak Hr</span>
                      <span className="text-white font-bold">{selectedBusiness.type === 'hospitals' ? '1:00 PM' : '7:00 PM'}</span>
                   </div>
                   <div className="flex justify-between items-center text-slate-300">
                      <span>Best Time to Visit</span>
                      <span className="text-emerald-400 font-bold">{selectedBusiness.type === 'hospitals' ? '3:30 PM' : '11:00 AM'}</span>
                   </div>
                </div>
             </div>

             <div className="flex flex-col gap-2">
               <Link 
                 href={`/customer/queue/${selectedBusiness.id}/A-10`} 
                 className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 transition-all text-center"
               >
                 Join Remote Queue
               </Link>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
