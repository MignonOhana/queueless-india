"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, ChevronDown, Clock, Heart, ArrowRight, Activity, QrCode, TrendingUp, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { MOCK_BUSINESSES, CURRENT_LOCATION, Business } from "@/lib/mockHomeData";
import { supabase } from "@/lib/supabaseClient";

// Dynamically import Leaflet map to avoid SSR errors
const LeafletMiniMap = dynamic(() => import("@/components/Map/LeafletMiniMap"), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl flex items-center justify-center font-bold text-slate-400">Loading Map...</div> 
});

const CATEGORIES = [
  { id: "all", name: "All Queues", icon: "🌐" },
  { id: "Hospitals", name: "Hospitals", icon: "🏥" },
  { id: "Banks", name: "Banks", icon: "🏦" },
  { id: "Salons", name: "Salons", icon: "💇" },
  { id: "Government", name: "Government", icon: "🏛" },
  { id: "Restaurants", name: "Restaurants", icon: "🍽" },
  { id: "Events", name: "Events", icon: "🎟" },
  { id: "Airport Services", name: "Airport Services", icon: "✈" },
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTokenMap, setActiveTokenMap] = useState<any>(null); // To store active queue if joined
  const [liveBusinesses, setLiveBusinesses] = useState<Business[]>(MOCK_BUSINESSES);

  useEffect(() => {
    // Check local storage for an active queue token
    const savedOrg = localStorage.getItem("active_org");
    const savedToken = localStorage.getItem("active_token");
    if (savedOrg && savedToken) {
      setActiveTokenMap({ orgId: savedOrg, tokenId: savedToken });
    }
    
    // Fetch live organically created businesses from Supabase MVP DB
    const fetchLiveBusinesses = async () => {
      const { data, error } = await supabase.from("businesses").select("*");
      if (!error && data && data.length > 0) {
        const mappedData: Business[] = data.map((b: any) => ({
          id: b.id,
          name: b.name,
          category: b.category,
          address: b.location,
          distance: +(Math.random() * 5 + 0.5).toFixed(1), // Random mock distance 0.5 to 5.5
          waitTime: b.serviceMins || 15, 
          queueLength: Math.floor(Math.random() * 10),
          image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop", // placeholder
          icon: CATEGORIES.find(c => c.name === b.category)?.icon || "🏢",
          coordinates: [28.6139 + (Math.random() - 0.5) * 0.1, 77.2090 + (Math.random() - 0.5) * 0.1], // Slight random offset from center
          isFastest: b.fastPassEnabled,
          isPopular: true,
          isFavorite: false
        }));
        // Merge latest live data to the front of the list, keeping mock data to fill out page
        setLiveBusinesses([...mappedData, ...MOCK_BUSINESSES]);
      }
    };
    
    fetchLiveBusinesses();
  }, []);

  // Filter Data
  const filteredBusinesses = useMemo(() => {
    return liveBusinesses.filter(b => {
      const matchCategory = activeCategory === "all" || b.category === activeCategory;
      const matchSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    }).sort((a, b) => a.distance - b.distance); // Sort geographically nearest first
  }, [searchQuery, activeCategory]);

  const fastestQueues = liveBusinesses.filter(b => b.isFastest);
  const popularQueues = liveBusinesses.filter(b => b.isPopular);
  const favoriteQueues = liveBusinesses.filter(b => b.isFavorite);

  // Reusable Queue Card Component
  const QueueCard = ({ biz, layout = "vertical" }: { biz: Business, layout?: "vertical" | "horizontal" }) => {
    if (layout === "horizontal") {
      return (
        <div 
          onClick={() => router.push(`/customer/business/${biz.id}`)}
          className="bg-white rounded-2xl p-4 min-w-[260px] max-w-[260px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100 flex gap-4 active:scale-95 transition-transform cursor-pointer hover:shadow-lg"
        >
          <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 relative">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src={biz.image} alt={biz.name} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-black/10 flex items-center justify-center text-2xl drop-shadow-md">{biz.icon}</div>
          </div>
          <div className="flex flex-col justify-center flex-1 min-w-0">
             <h4 className="font-bold text-slate-800 text-sm truncate">{biz.name}</h4>
             <p className="text-slate-500 text-xs mb-1 truncate">{biz.address} • {biz.distance}km</p>
             <div className="flex items-center gap-1 text-xs font-bold text-[#22C55E]">
                <Clock size={12} /> {biz.waitTime} min wait
             </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        onClick={() => router.push(`/customer/business/${biz.id}`)}
        className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100 active:scale-95 transition-transform cursor-pointer hover:shadow-xl group"
      >
        <div className="relative h-32 w-full rounded-xl overflow-hidden mb-4 bg-slate-100">
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src={biz.image} alt={biz.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
           <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider text-slate-800">
             {biz.distance} km
           </div>
           <div className="absolute bottom-2 left-2 flex items-center gap-2">
             <span className="text-2xl drop-shadow-md">{biz.icon}</span>
             {biz.queueLength > 5 ? (
                <span className="text-white font-bold text-[10px] tracking-widest uppercase bg-rose-500/80 px-2 py-0.5 rounded-md backdrop-blur-md shadow-sm border border-rose-400">Busy</span>
             ) : biz.queueLength === 0 ? (
                <span className="text-emerald-900 font-bold text-[10px] tracking-widest uppercase bg-emerald-400/90 px-2 py-0.5 rounded-md backdrop-blur-md shadow-sm border border-emerald-300">Open Now</span>
             ) : (
                <span className="text-white font-bold text-sm tracking-wide bg-black/30 px-2 py-0.5 rounded-md backdrop-blur-md border border-white/20 shadow-sm">{biz.category}</span>
             )}
           </div>
        </div>
        <div className="flex justify-between items-start mb-2">
           <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">{biz.name}</h3>
              <p className="text-slate-500 text-xs mt-0.5">{biz.address}</p>
           </div>
           {biz.isFavorite && <Heart size={16} className="fill-[#0B6EFE] text-[#0B6EFE] shrink-0" />}
        </div>
        
        <div className="flex items-center justify-between mt-4">
           <div className="flex items-center gap-1.5 bg-[#22C55E]/10 text-[#22C55E] px-2.5 py-1 rounded-lg text-xs font-bold">
              <Clock size={14} /> {biz.waitTime} min wait
           </div>
           <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
             <Activity size={14} className="text-slate-400" />
             Token {biz.category.charAt(0).toUpperCase()}-{100 + biz.queueLength}
           </div>
        </div>
        
        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
           <button className="bg-[#0B6EFE]/10 text-[#0B6EFE] font-bold text-sm py-2 rounded-xl hover:bg-[#0B6EFE] hover:text-white transition-colors">View Queue</button>
           <button className="bg-[#0B6EFE] text-white font-bold text-sm py-2 rounded-xl shadow-lg shadow-[#0B6EFE]/30 hover:bg-[#0B6EFE]/90 transition-colors">Join Now</button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 font-sans selection:bg-[#0B6EFE]/30 selection:text-[#0B6EFE]">
      
      {/* SECTION 1 - LOCATION HEADER */ }
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-2xl px-4 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-4 border-b border-slate-200/50 shadow-sm">
         <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
               <div className="flex items-center gap-1 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                 <MapPin size={12} className="text-[#F59E0B]" /> Current Location
               </div>
               <div className="flex items-center gap-2">
                 <h2 className="text-slate-900 font-extrabold text-lg flex items-center">{CURRENT_LOCATION.name}</h2>
                 <ChevronDown size={18} className="text-[#0B6EFE]" />
               </div>
            </div>
            {/* User Profile Hook */}
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shadow-inner">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src="https://ui-avatars.com/api/?name=User&background=0B6EFE&color=fff" alt="User" />
            </div>
         </div>

         {/* SECTION 2 - GLOBAL SEARCH BAR */}
         <div className="max-w-2xl mx-auto mt-4">
            <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-slate-400 group-focus-within:text-[#0B6EFE] transition-colors" />
               </div>
               <input 
                  type="text" 
                  placeholder="Search hospitals, banks, salons, events..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.2rem] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B6EFE]/50 focus:border-[#0B6EFE] transition-all font-medium shadow-[0_2px_15px_rgba(0,0,0,0.03)]"
               />
            </div>
         </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-10">
         
         {/* SECTION 10 - LIVE QUEUE PULSE */}
         <section className="bg-gradient-to-br from-indigo-900 via-slate-900 to-black rounded-[2rem] p-5 shadow-[0_8px_30px_rgba(30,27,75,0.2)] relative overflow-hidden border border-white/10 z-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[80px] opacity-20 pointer-events-none -z-10" />
            <div className="flex items-center justify-between mb-4 relative z-10">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                  <h2 className="text-white font-bold text-sm tracking-widest uppercase">Live Queue Pulse</h2>
               </div>
            </div>
            
            <div className="relative z-10 h-14 overflow-hidden mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)">
               <motion.div
                 animate={{ y: [0, -56, -112, -168, -224] }}
                 transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                 className="flex flex-col gap-4"
               >
                  <div className="flex items-start gap-3 h-10">
                     <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg shrink-0 shadow-inner"><TrendingUp size={16} /></div>
                     <div>
                        <p className="font-bold text-white text-sm">AIIMS Hospital</p>
                        <p className="text-xs text-indigo-200 font-medium">3 people joined in the last 10 mins</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-3 h-10">
                     <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0 shadow-inner"><Zap size={16} /></div>
                     <div>
                        <p className="font-bold text-white text-sm">Urban Salon</p>
                        <p className="text-xs text-amber-200 font-medium">Fast Pass almost sold out!</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-3 h-10">
                     <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0 shadow-inner"><Activity size={16} /></div>
                     <div>
                        <p className="font-bold text-white text-sm">City Center OPD</p>
                        <p className="text-xs text-emerald-200 font-medium">Wait time dropped by 15 mins</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-3 h-10">
                     <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg shrink-0 shadow-inner"><TrendingUp size={16} /></div>
                     <div>
                        <p className="font-bold text-white text-sm">Axis Bank</p>
                        <p className="text-xs text-indigo-200 font-medium">Queue is moving very fast currently</p>
                     </div>
                  </div>
                  {/* Seamless loop clone of first element */}
                  <div className="flex items-start gap-3 h-10">
                     <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg shrink-0 shadow-inner"><TrendingUp size={16} /></div>
                     <div>
                        <p className="font-bold text-white text-sm">AIIMS Hospital</p>
                        <p className="text-xs text-indigo-200 font-medium">3 people joined in the last 10 mins</p>
                     </div>
                  </div>
               </motion.div>
            </div>
         </section>

         {/* SECTION 9 - ACTIVE QUEUE CARD (Sticky behavior implied by being top of feed) */}
         {activeTokenMap && (
            <motion.div 
               initial={{ opacity: 0, y: -20, height: 0 }}
               animate={{ opacity: 1, y: 0, height: "auto" }}
               className="bg-slate-900 text-white rounded-[1.5rem] p-5 shadow-2xl relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#F59E0B] rounded-full blur-[80px] opacity-30" />
               <div className="relative z-10 flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                     <div className="p-1.5 bg-white/20 rounded-lg"><Activity size={18} /></div>
                     <span className="font-bold tracking-widest text-[10px] uppercase text-[#F59E0B]">Your Active Token</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="px-2 py-1 bg-white/10 rounded-md text-xs font-bold text-white">Active</span>
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         localStorage.removeItem("active_org");
                         localStorage.removeItem("active_token");
                         setActiveTokenMap(null);
                       }}
                       className="p-1 bg-white/10 hover:bg-white/20 rounded-md text-white/70 hover:text-white transition-colors flex items-center justify-center shrink-0"
                       title="Dismiss Test Token"
                     >
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                     </button>
                  </div>
               </div>
               <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-1">City Hospital</h3>
                  <div className="flex items-center justify-between mt-4">
                     <div>
                        <p className="text-slate-400 text-xs font-semibold mb-1">Token Number</p>
                        <p className="text-3xl font-black text-[#F59E0B]">H-042</p>
                     </div>
                     <div className="text-right">
                        <p className="text-slate-400 text-xs font-semibold mb-1">Status</p>
                        <p className="text-lg font-bold">5 Ahead</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => router.push(`/customer/queue/${activeTokenMap.orgId}/${activeTokenMap.tokenId}`)}
                    className="w-full mt-6 bg-white text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                  >
                     View Queue Status <ArrowRight size={16} />
                  </button>
               </div>
            </motion.div>
         )}

         {/* SECTION 3 - CATEGORY CHIPS */}
         <section>
            <div className="-mx-4 px-4 overflow-x-auto no-scrollbar scroll-smooth">
               <div className="flex gap-3 w-max pb-4">
                  {CATEGORIES.map(cat => (
                     <button 
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex flex-col items-center gap-2 w-20 py-3 rounded-2xl transition-all shadow-sm ${
                           activeCategory === cat.id 
                           ? "bg-[#0B6EFE] text-white shadow-[#0B6EFE]/30 scale-105 border-transparent" 
                           : "bg-white border border-slate-100 text-slate-600 hover:border-slate-300"
                        }`}
                     >
                        <span className="text-2xl drop-shadow-sm">{cat.icon}</span>
                        <span className="text-[10px] font-bold text-center leading-tight px-1">{cat.name}</span>
                     </button>
                  ))}
               </div>
            </div>
         </section>

         {/* Search Filter Warning if empty */}
         {filteredBusinesses.length === 0 && (
            <div className="text-center py-12">
               <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 mb-4 shadow-sm">
                  <Search size={24} />
               </div>
               <h3 className="text-lg font-bold text-slate-800 mb-1">No queues found</h3>
               <p className="text-slate-500 text-sm">Try widening your search or category.</p>
            </div>
         )}

         {/* FEED CONTENT - Only show rows if not explicitly searching */}
         {searchQuery.length === 0 && activeCategory === "all" ? (
            <>
               {/* SECTION 8 - FAVORITE BUSINESSES */}
               <section>
                  <div className="flex items-center justify-between mb-4">
                     <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">⭐ Your Favorites</h2>
                  </div>
                  <div className="-mx-4 px-4 overflow-x-auto no-scrollbar pb-4">
                     <div className="flex gap-4 w-max">
                        {favoriteQueues.map(biz => <QueueCard key={biz.id} biz={biz} layout="horizontal" />)}
                     </div>
                  </div>
               </section>

               {/* SECTION 5 - FASTEST QUEUES */}
               <section>
                  <div className="flex items-center justify-between mb-4 mt-2">
                     <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">⚡ Fastest Service Nearby</h2>
                  </div>
                  <div className="-mx-4 px-4 overflow-x-auto no-scrollbar pb-4">
                     <div className="flex gap-4 w-max">
                        {fastestQueues.map(biz => <QueueCard key={`fast-${biz.id}`} biz={biz} layout="horizontal" />)}
                     </div>
                  </div>
               </section>

               {/* SECTION 7 - MAP PREVIEW */}
               <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-80 relative overflow-hidden group cursor-pointer block">
                  <div className="absolute top-5 left-5 right-5 z-10 flex justify-between items-start pointer-events-none">
                     <h2 className="text-lg font-black text-slate-900 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg">City Map View</h2>
                  </div>
                  <LeafletMiniMap center={CURRENT_LOCATION.coordinates} markers={liveBusinesses.slice(0, 10).map(b => ({ id: b.id, name: b.name, position: b.coordinates, waitTime: b.waitTime }))} />
                  
                  {/* Fake View Map overlay */}
                  <div 
                     onClick={() => router.push('/map')}
                     className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-6 z-10 pointers-events-auto"
                  >
                     <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2 hover:-translate-y-1 transition-transform">
                        Explore Full Map <ArrowRight size={16} />
                     </button>
                  </div>
               </section>

               {/* SECTION 6 - POPULAR QUEUES */}
               <section>
                  <div className="flex items-center justify-between mb-4">
                     <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">🔥 Popular Right Now</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {popularQueues.map(biz => <QueueCard key={`pop-${biz.id}`} biz={biz} />)}
                  </div>
               </section>
            </>
         ) : null}

         {/* SECTION 4 - STANDARD NEARBY QUEUES FEED */}
         {(searchQuery.length > 0 || activeCategory !== "all") && (
            <section>
               <h2 className="text-lg font-black text-slate-900 mb-4 px-1">{filteredBusinesses.length} Queues nearby</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredBusinesses.map(biz => <QueueCard key={biz.id} biz={biz} />)}
               </div>
            </section>
         )}

      </main>

      {/* Legacy Navigation Removal Override - Mobile Nav is globally handled now. Ensure we don't render two bottom bars. */}

    </div>
  );
}
