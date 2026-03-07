"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, ArrowLeft, HeartPulse, Pill, Activity, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { joinQueue } from "@/lib/queueService";
import { useCustomerQueue } from "@/lib/useCustomerQueue";
import { useLanguage, Language } from "@/context/LanguageContext";
import { generateQueuePredictionStatement } from "@/lib/ai-queue-engine";
import FloatChatWidget from "@/components/AIChat";
import CameraScanner from "@/components/QR/CameraScanner";
import GeoTracker from "@/components/GeoTracker";
import PageTransition from "@/components/PageTransition";

import { QrCode, Sparkles } from "lucide-react";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function CustomerAppContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showScanner, setShowScanner] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const savedOrg = localStorage.getItem("active_org");
    const savedToken = localStorage.getItem("active_token");
    if (savedOrg && savedToken) {
      router.push(`/customer/queue/${savedOrg}/${savedToken}`);
    }
  }, [router]);

  // Mock Marketplace Data
  const categories = [
    { id: "all", label: "All nearby" },
    { id: "hospitals", label: "Hospitals" },
    { id: "banks", label: "Banks" },
    { id: "salons", label: "Salons" },
    { id: "government", label: "Government" }
  ];

  const nearbyBusinesses = [
    { id: "city-hospital", name: "City Hospital", category: "hospitals", icon: "🏥", distance: "1.2 km", waitTime: 15, queueLength: 8, address: "Andheri East, Mumbai" },
    { id: "metro-bank", name: "Metro Bank Branch", category: "banks", icon: "🏦", distance: "2.5 km", waitTime: 5, queueLength: 2, address: "Link Road, Andheri" },
    { id: "quickcut-salon", name: "QuickCut Salon", category: "salons", icon: "✂️", distance: "3.1 km", waitTime: 40, queueLength: 12, address: "Bandra West, Mumbai" },
    { id: "passport-office", name: "Regional Passport Office", category: "government", icon: "🛂", distance: "5.8 km", waitTime: 95, queueLength: 140, address: "BKC, Mumbai" },
  ];

  const filteredBusinesses = nearbyBusinesses.filter(b => 
    (activeCategory === "all" || b.category === activeCategory) &&
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans pb-24 overflow-x-hidden">
      
      {/* Sticky Header with Search */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 px-4 pt-6 pb-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg">Q</div>
               <div>
                  <h1 className="text-lg font-black text-slate-900 dark:text-white leading-none">QueueLess</h1>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1 mt-0.5"><MapPin size={10}/> Location active</p>
               </div>
             </div>
             <button onClick={() => setShowScanner(true)} className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-100 transition shadow-sm">
                <QrCode size={20} />
             </button>
          </div>

          <div className="relative relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input 
              type="text" 
              placeholder="Search hospitals, banks, salons..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-100 dark:bg-slate-900 border-none rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium shadow-inner"
            />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
         {/* Categories */}
         <div className="-mx-4 px-4 overflow-x-auto no-scrollbar mb-8">
            <div className="flex gap-2 w-max">
               {categories.map(cat => (
                 <button 
                   key={cat.id}
                   onClick={() => setActiveCategory(cat.id)}
                   className={`px-5 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${activeCategory === cat.id ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'}`}
                 >
                   {cat.label}
                 </button>
               ))}
            </div>
         </div>

         {/* Discovery Label */}
         <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
               <Sparkles size={18} className="text-amber-500" /> Nearby Queues
            </h2>
            <span className="text-xs font-bold text-slate-400">{filteredBusinesses.length} found</span>
         </div>

         {/* Feed */}
         <div className="space-y-4">
            <AnimatePresence>
               {filteredBusinesses.map(biz => (
                 <motion.div
                   key={biz.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden active:scale-[0.98] transition-transform"
                   onClick={() => router.push(`/customer/business/${biz.id}`)}
                 >
                    <div className="flex gap-4">
                       <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-3xl shrink-0">
                         {biz.icon}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                             <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate pr-2">{biz.name}</h3>
                             <span className="shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase px-2 py-1 rounded-md">{biz.distance}</span>
                          </div>
                          <p className="text-xs text-slate-500 truncate mb-3">{biz.address}</p>
                          
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                                   <Clock size={12} /> {biz.waitTime}m wait
                                </div>
                                <div className="text-xs font-semibold text-slate-500">
                                   <span className="font-bold text-slate-700 dark:text-slate-300">{biz.queueLength}</span> in queue
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                    
                    {/* Floating CTA Arrow */}
                    <div className="absolute right-4 bottom-4 w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                 </motion.div>
               ))}
            </AnimatePresence>

            {filteredBusinesses.length === 0 && (
              <div className="text-center py-12">
                 <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                   <MapPin size={24} />
                 </div>
                 <h3 className="font-bold text-slate-900 dark:text-white mb-1">No queues found</h3>
                 <p className="text-sm text-slate-500">Try adjusting your search or category filter.</p>
              </div>
            )}
         </div>
      </main>

      {/* Reused Scanner Modal */}
      {showScanner && (
        <CameraScanner 
          onClose={() => setShowScanner(false)}
          onScanSuccess={(decodedText) => {
             setShowScanner(false);
             try {
                const url = new URL(decodedText);
                const scannedOrg = url.searchParams.get("org");
                if (scannedOrg) {
                   router.push(`/customer/business/${scannedOrg}`);
                }
             } catch (e) {
                router.push(`/customer/business/${decodedText}`);
             }
          }} 
        />
      )}
    </div>
  );
}

export default function CustomerApp() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">Loading queue info...</div>}>
      <CustomerAppContent />
    </Suspense>
  );
}
