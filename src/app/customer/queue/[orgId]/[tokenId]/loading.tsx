"use client";

import { Clock, MapPin } from "lucide-react";

export default function QueueLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#070B14] font-sans text-white overflow-hidden relative selection:bg-indigo-500/30">
      
      {/* Background Ambient Skeleton Blur */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
         <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-fuchsia-500/10 rounded-full blur-[150px] mix-blend-screen animate-pulse" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col pt-16 px-6 max-w-lg mx-auto pb-32">
        {/* Header Skeleton */}
        <header className="mb-12 flex items-center justify-between">
          <div>
            <div className="h-4 w-24 bg-white/10 rounded-full mb-3 animate-pulse" />
            <div className="h-8 w-48 bg-white/20 rounded-xl animate-pulse" />
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-full animate-pulse flex items-center justify-center shrink-0">
             <MapPin className="text-white/30" size={20} />
          </div>
        </header>

        {/* 3D Card Skeleton Placeholder */}
        <div className="w-full aspect-[3/4] max-h-[500px] bg-white/5 border border-white/10 rounded-[3rem] flex flex-col items-center justify-center relative overflow-hidden mb-12 shadow-2xl">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse -mr-10 -mt-10" />
           <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl animate-pulse -ml-10 -mb-10" />
           
           <div className="h-4 w-32 bg-white/10 rounded-full mb-8 animate-pulse" />
           <div className="w-48 h-24 bg-white/20 rounded-2xl mb-8 animate-pulse" />
           <div className="h-8 w-40 bg-emerald-500/20 rounded-full animate-pulse" />
        </div>

        {/* Floating Bottom Stats Skeleton */}
        <div className="fixed bottom-8 left-4 right-4 max-w-lg mx-auto grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-5 shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 animate-pulse flex items-center justify-center shrink-0">
               <Clock className="text-white/20" size={24} />
            </div>
            <div className="flex-1 flex flex-col gap-2">
               <div className="h-3 w-16 bg-white/10 rounded-full animate-pulse" />
               <div className="h-6 w-12 bg-white/20 rounded-xl animate-pulse" />
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-5 shadow-xl flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-white/5 animate-pulse shrink-0" />
             <div className="flex-1 flex flex-col gap-2">
               <div className="h-3 w-16 bg-white/10 rounded-full animate-pulse" />
               <div className="h-6 w-12 bg-emerald-500/20 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
