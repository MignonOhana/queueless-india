"use client";

import { BusinessMapData } from "@/lib/useLiveMap";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Activity, Clock, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

interface Props {
  businesses: BusinessMapData[];
  isOpen: boolean;
  onClose: () => void;
}

export default function SmartInsightsPanel({ businesses, isOpen, onClose }: Props) {
  
  const insights = useMemo(() => {
    if (!businesses.length) return null;

    // 1. Calculate Highest Wait Time (Busiest Area/Business)
    const busiest = [...businesses].sort((a, b) => b.heat_score - a.heat_score)[0];

    // 2. Recommend Shortest Wait (Safest Location)
    const fastest = [...businesses].sort((a, b) => a.avg_wait - b.avg_wait)[0];

    return { busiest, fastest };
  }, [businesses]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
           initial={{ x: "100%", opacity: 0 }}
           animate={{ x: 0, opacity: 1 }}
           exit={{ x: "100%", opacity: 0 }}
           transition={{ type: "spring", damping: 25, stiffness: 200 }}
           className="absolute top-0 right-0 h-full w-full md:w-[400px] bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-l border-slate-200/50 dark:border-slate-800/50 z-[1001] shadow-2xl flex flex-col pointer-events-auto"
        >
          <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10">
            <div className="flex items-center gap-2">
               <div className="bg-blue-100 dark:bg-blue-500/20 p-2 rounded-xl text-blue-600 dark:text-blue-400">
                  <Sparkles size={20} className="animate-pulse" />
               </div>
               <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">AI City Insights</h2>
            </div>
            <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <ArrowRight size={20} />
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            
            {/* The Busiest Area */}
            {insights?.busiest && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-sm uppercase tracking-wider">
                  <Activity size={16} /> Heart of Congestion
                </div>
                <div className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-5 shadow-sm shadow-rose-500/5">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">{insights.busiest.name}</h3>
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-4">
                     <MapPin size={14} /> Center Sector, {insights.busiest.category}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                     <div className="bg-rose-50 dark:bg-rose-500/10 rounded-xl p-3 flex flex-col">
                        <span className="text-2xl font-black text-rose-700 dark:text-rose-400">{insights.busiest.queue_length}</span>
                        <span className="text-[10px] font-bold text-rose-600/70 uppercase">Queue Size</span>
                     </div>
                     <div className="bg-orange-50 dark:bg-orange-500/10 rounded-xl p-3 flex flex-col">
                        <span className="text-2xl font-black text-orange-700 dark:text-orange-400">{insights.busiest.avg_wait}m</span>
                        <span className="text-[10px] font-bold text-orange-600/70 uppercase">Est Wait</span>
                     </div>
                  </div>
                </div>
              </div>
            )}

            <div className="w-full h-px bg-slate-200/50 dark:bg-slate-800/50"></div>

            {/* Smart Recommendation */}
            {insights?.fastest && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm uppercase tracking-wider">
                  <Clock size={16} /> AI Recommendation
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/50 dark:border-emerald-800/50 rounded-2xl p-5 shadow-sm">
                  <div className="inline-flex px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-bold rounded-full mb-3">
                    Fastest Service Nearby
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">{insights.fastest.name}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-5 leading-relaxed">
                    Skip the crowd. This location is currently reporting a queue of only <strong>{insights.fastest.queue_length} people</strong>.
                  </p>
                  
                  <Link href={`/customer/queue/${insights.fastest.id}`} className="block w-full text-center py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold rounded-xl transition-transform active:scale-95 shadow-md">
                    Join this Queue
                  </Link>
                </div>
              </div>
            )}

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
