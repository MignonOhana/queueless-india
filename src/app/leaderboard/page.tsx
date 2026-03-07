"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, Medal, TrendingDown, ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";

const MOCK_LEADERBOARD = [
  { id: 1, name: "Sunrise Clinic", type: "Hospital", wait: 5, previousWait: 8, rating: 4.9, served: 142 },
  { id: 2, name: "QuickCut Salon", type: "Salon", wait: 6, previousWait: 12, rating: 4.8, served: 89 },
  { id: 3, name: "Metro Bank", type: "Bank", wait: 7, previousWait: 10, rating: 4.7, served: 312 },
  { id: 4, name: "Cafe Delight", type: "Restaurant", wait: 12, previousWait: 9, rating: 4.5, served: 205 },
  { id: 5, name: "City Center OPD", type: "Hospital", wait: 14, previousWait: 22, rating: 4.6, served: 450 },
  { id: 6, name: "RTO Office Vasant Vihar", type: "Government", wait: 25, previousWait: 45, rating: 4.2, served: 810 },
];

export default function LeaderboardPage() {
  const [filter, setFilter] = useState("All");

  const filteredData = MOCK_LEADERBOARD
    .filter(b => filter === "All" ? true : b.type === filter)
    .sort((a, b) => a.wait - b.wait);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300 } }
  };

  return (
    <PageTransition className="min-h-screen bg-[#0a0a0a] font-sans pb-24 relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] opacity-50 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 pt-24 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 text-amber-500 rounded-2xl mb-6 shadow-[0_0_30px_rgba(245,158,11,0.2)] border border-amber-500/20">
            <Trophy size={48} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            City Fast-Track Leaderboard
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Discover the most efficient venues in the city right now. Ranked by live average wait times.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {["All", "Hospital", "Bank", "Salon", "Restaurant", "Government"].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${
                filter === cat 
                 ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/30"
                 : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Leaderboard List */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="bg-white/5 border border-white/10 p-2 md:p-4 rounded-[2rem] backdrop-blur-xl shadow-2xl"
        >
           <AnimatePresence mode="popLayout">
             {filteredData.map((business, index) => (
                <motion.div 
                  layout
                  key={business.id}
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-4 p-4 md:p-6 mb-2 last:mb-0 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group relative overflow-hidden"
                >
                   {/* Rank Badge */}
                   <div className="w-12 h-12 shrink-0 flex items-center justify-center text-xl font-black">
                      {index === 0 ? <Medal size={36} className="text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" /> : 
                       index === 1 ? <Medal size={32} className="text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.5)]" /> : 
                       index === 2 ? <Medal size={32} className="text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]" /> : 
                       <span className="text-slate-600">#{index + 1}</span>}
                   </div>

                   {/* Info */}
                   <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-bold text-white truncate">{business.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-slate-300">{business.type}</span>
                        {business.wait < business.previousWait && (
                          <span className="flex items-center gap-0.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-1.5 rounded">
                            <TrendingDown size={14} /> {(business.previousWait - business.wait)}m faster
                          </span>
                        )}
                      </div>
                   </div>

                   {/* Stats Block */}
                   <div className="flex flex-col items-end gap-2 shrink-0 mr-4">
                      {/* Wait time */}
                      <div className="text-right">
                         <div className="text-3xl font-black text-emerald-400 flex items-center justify-end gap-1 leading-none">
                           {business.wait} <span className="text-sm font-bold text-emerald-400/50">min</span> 
                         </div>
                         <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Av Wait</p>
                      </div>
                      
                      {/* Served Today */}
                      <div className="text-right">
                         <div className="text-sm font-black text-indigo-400 flex items-center justify-end gap-1 leading-none">
                           {business.served} <span className="text-[10px] font-bold text-indigo-400/50 uppercase">ppl</span>
                         </div>
                         <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Served Today</p>
                      </div>
                   </div>
                   
                   {/* Join Hover Action */}
                   <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-indigo-600 to-transparent flex items-center justify-end pr-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-10 group-hover:translate-x-0 duration-300">
                      <Link href={`/customer/queue/${business.id}/A-01`} className="bg-white text-indigo-600 p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                        <ArrowRight size={20} />
                      </Link>
                   </div>
                </motion.div>
             ))}
             {filteredData.length === 0 && (
                <div className="p-12 text-center text-slate-400 font-medium">
                  <Building2 size={48} className="mx-auto mb-4 opacity-50" />
                  No fast-track venues found for this category currently.
                </div>
             )}
           </AnimatePresence>
        </motion.div>
      </div>

    </PageTransition>
  );
}
