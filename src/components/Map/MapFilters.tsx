"use client";

import { BusinessMapData, ServiceCategory } from "@/lib/useLiveMap";
import { Filter } from "lucide-react";

interface Props {
  activeFilter: ServiceCategory | "All";
  onFilterChange: (filter: ServiceCategory | "All") => void;
}

const ALL_CATEGORIES: (ServiceCategory | "All")[] = [
  "All",
  "Hospital",
  "Bank",
  "Salon",
  "Restaurant",
  "Government Office"
];

export default function MapFilters({ activeFilter, onFilterChange }: Props) {
  return (
    <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col md:flex-row gap-3 pointer-events-none">
      
      {/* Background blur layer for the top bar */}
      <div className="flex bg-white/80 dark:bg-slate-900/80 bg-opacity-95 border border-slate-200/50 dark:border-slate-700/50 p-2 rounded-2xl shadow-lg pointer-events-auto overflow-x-auto hide-scrollbar max-w-full">
        <div className="flex items-center gap-2 pl-2 pr-4 border-r border-slate-200 dark:border-slate-700 shrink-0">
           <Filter size={16} className="text-slate-500" />
           <span className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden md:inline-block">Filter</span>
        </div>
        
        <div className="flex items-center gap-1.5 pl-3">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onFilterChange(cat)}
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                activeFilter === cat
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      
    </div>
  );
}
