"use client";

import { MapPin, Search } from "lucide-react";

export default function HomeLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 flex flex-col pt-16 h-screen overflow-hidden">
      
      {/* Skeleton Top Nav (Search Bar Area) */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 p-4 sticky top-0 z-40 transition-colors shrink-0">
        <div className="max-w-7xl mx-auto flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={20} />
            <div className="w-full h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          </div>
          <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse flex items-center justify-center shrink-0">
            <MapPin className="text-slate-300 dark:text-slate-600" size={24} />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full relative h-[calc(100vh-120px)]">
        
        {/* Left List Area Skeletons */}
        <div className="w-full md:w-[450px] lg:w-[500px] h-full flex flex-col shrink-0 bg-white dark:bg-slate-950 z-20 transition-colors border-r border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
           
           {/* Filters Skeleton */}
           <div className="p-4 flex gap-3 overflow-hidden border-b border-slate-100 dark:border-slate-800 shrink-0">
             {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-24 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse shrink-0" />
             ))}
           </div>

           {/* Cards Skeleton List */}
           <div className="p-4 flex flex-col gap-4 overflow-hidden flex-1">
             {[1, 2, 3, 4].map((i) => (
               <div key={`card-${i}`} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-slate-800/50 rounded-full blur-2xl animate-pulse -mr-10 -mt-10" />
                  
                  <div className="flex gap-4 items-start">
                     <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0" />
                     <div className="flex-1 flex flex-col gap-2 pt-1">
                        <div className="h-5 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
                        <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
                     </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                     <div className="h-8 w-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg animate-pulse" />
                     <div className="h-8 w-24 bg-slate-50 dark:bg-slate-800 rounded-lg animate-pulse" />
                  </div>
               </div>
             ))}
           </div>
        </div>

        {/* Right Map Area Skeleton */}
        <div className="hidden md:block flex-1 bg-slate-100/50 dark:bg-slate-900/50 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-32 h-32 rounded-full border-4 border-slate-200 dark:border-slate-800 animate-ping opacity-20" />
               <MapPin className="absolute text-slate-300 dark:text-slate-700 w-12 h-12 animate-pulse" />
            </div>
            {/* Fake Map Markers */}
            <div className="absolute top-1/4 left-1/4 w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 animate-pulse opacity-50" />
            <div className="absolute top-1/3 right-1/4 w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 animate-pulse opacity-50" />
            <div className="absolute bottom-1/3 left-1/3 w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 animate-pulse opacity-50" />
        </div>

      </div>
    </div>
  );
}
