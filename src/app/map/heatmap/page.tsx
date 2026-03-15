"use client";

import Navigation from "@/components/Navigation";
import dynamic from "next/dynamic";
import { Layers, Activity, MapPin } from "lucide-react";
import { useState, useMemo } from "react";
import { useLiveMap, ServiceCategory } from "@/lib/useLiveMap";
import MapFilters from "@/components/Map/MapFilters";
import SmartInsightsPanel from "@/components/Map/SmartInsightsPanel";
import { motion } from "framer-motion";

// Dynamically import the map to avoid SSR issues with Leaflet
const LiveHeatmap = dynamic(() => import("@/components/Map/LiveHeatmap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 border-t border-slate-800">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
        <Layers className="w-12 h-12 text-blue-500 animate-pulse relative z-10" />
      </div>
      <p className="font-medium text-slate-400 mt-4 animate-pulse uppercase tracking-widest text-sm">Initializing Heatmap Engine</p>
    </div>
  ),
});

export default function HeatmapPage() {
  const { businesses } = useLiveMap();
  const [activeFilter, setActiveFilter] = useState<ServiceCategory | "All">("All");
  const [mode, setMode] = useState<"heatmap" | "markers">("heatmap");
  const [showInsights, setShowInsights] = useState(true);

  // Filter businesses in real time based on active category
  const filteredBusinesses = useMemo(() => {
    if (activeFilter === "All") return businesses;
    return businesses.filter(b => b.category === activeFilter);
  }, [businesses, activeFilter]);

  return (
    <main className="h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col font-sans overflow-hidden">
      <div className="shrink-0 z-50">
        <Navigation />
      </div>
      
      <div className="flex-1 w-full relative flex flex-col pt-20">
        
        {/* Top Floating Controls */}
        <div className="absolute top-4 right-4 z-[1000] flex gap-2 pointer-events-none md:top-6 md:right-6">
          <div className="glass-card flex p-1 bg-white/90 dark:bg-slate-900/90 bg-opacity-95 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-xl pointer-events-auto">
            <button 
              onClick={() => setMode("heatmap")}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                mode === "heatmap" 
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Activity size={16} className={mode === "heatmap" ? "text-orange-500" : ""} />
              Heatmap
            </button>
            <button 
              onClick={() => setMode("markers")}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                mode === "markers" 
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <MapPin size={16} className={mode === "markers" ? "text-blue-500" : ""} />
              Markers
            </button>
          </div>
        </div>

        {/* Map Filters Overlay */}
        <MapFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />

        {/* The Fullscreen Map Component */}
        <div className="w-full h-full relative z-0">
          <LiveHeatmap businesses={filteredBusinesses} mode={mode} />
        </div>

        {/* Smart Insights Side Panel */}
        <SmartInsightsPanel 
          businesses={filteredBusinesses} 
          isOpen={showInsights} 
          onClose={() => setShowInsights(false)} 
        />

        {/* Toggle button to reopen insights panel if closed */}
        {!showInsights && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute bottom-8 right-8 z-[1000] bg-blue-600 text-white p-4 rounded-full shadow-2xl shadow-blue-600/30 hover:scale-110 active:scale-95 transition-transform"
            onClick={() => setShowInsights(true)}
          >
            <Activity size={24} />
          </motion.button>
        )}
      </div>
    </main>
  );
}
