"use client";

import { motion } from "framer-motion";
import { ArrowRight, Building2, MapPin, Clock, Download } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { STAGGER_CONTAINER, FADE_UP_ANIMATION_VARIANTS } from "../lib/utils";

export default function Hero() {
  const [isStandalone, setIsStandalone] = useState(true); // Default true to avoid hydration mismatch, update in effect
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone);
    setIsMobile(/iphone|ipad|ipod|android/i.test(navigator.userAgent.toLowerCase()));
  }, []);

  const triggerInstall = () => {
    window.dispatchEvent(new Event('show-pwa-prompt'));
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center pt-32 pb-20 overflow-hidden bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-300">
      
      {/* Background Gradient Mesh */}
      <div className="absolute top-0 inset-x-0 h-[500px] pointer-events-none overflow-hidden">
        <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-30 dark:opacity-20 blur-[100px] rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column: Copy & Actions */}
        <motion.div 
          variants={STAGGER_CONTAINER}
          initial="hidden"
          animate="show"
          className="text-left"
        >
          {/* Animated Badge */}
          <motion.div 
            variants={FADE_UP_ANIMATION_VARIANTS}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50/95 dark:bg-indigo-500/95 border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-medium text-sm mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
            QueueLess 2.0 is now live
          </motion.div>

          {/* Main Headline */}
          <motion.div variants={FADE_UP_ANIMATION_VARIANTS}>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6 whitespace-pre-line">
              NO LINE.{"\n"}
              NO WAIT.{"\n"}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
                JUST ARRIVE.
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p 
            variants={FADE_UP_ANIMATION_VARIANTS}
            className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mb-10 leading-relaxed"
          >
            QueueLess India lets customers scan a QR code, join queues remotely, track wait time live, and receive alerts before their turn.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={FADE_UP_ANIMATION_VARIANTS}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            {isMobile && !isStandalone ? (
              <button 
                onClick={triggerInstall}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-lg hover:shadow-xl hover:shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Download App
              </button>
            ) : null}

            <Link href="/customer" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group">
              Discover Queues
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm">
              <Building2 size={18} className="text-slate-500" />
              Business Login
            </Link>
          </motion.div>
          
          <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="mt-8 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
             <div className="flex -space-x-2">
               {[1,2,3,4].map((i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-white dark:border-slate-950 bg-slate-200 dark:bg-slate-800 z-[${5-i}]`} />
               ))}
             </div>
             <p>Trusted by <strong>1,000+</strong> businesses across India</p>
          </motion.div>
        </motion.div>

        {/* Right Column: Floating UI Visual */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.2 }}
           className="relative h-[600px] w-full hidden lg:block"
        >
           {/* Abstract Phone/App Frame */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[600px] bg-white dark:bg-slate-950 rounded-[40px] border-[8px] border-slate-100 dark:border-slate-900 shadow-2xl overflow-hidden z-10">
              
              {/* Fake App Header */}
              <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600 p-6 flex flex-col justify-end">
                <p className="text-white/80 text-sm font-medium">City Hospital</p>
                <h3 className="text-white font-bold text-xl">General OPD</h3>
              </div>

              {/* Fake App Content */}
              <div className="p-6 bg-slate-50 dark:bg-slate-950 h-full relative">
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center mb-6">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">YOUR TOKEN</p>
                    <div className="text-6xl font-black text-slate-900 dark:text-white mb-2">A-42</div>
                    <div className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-medium bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full">
                       <Clock size={14} /> 15 mins wait
                    </div>
                 </div>

                 {/* Queue Status List */}
                 <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-500/20 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                       <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                         <span className="font-semibold text-slate-900 dark:text-white">A-41</span>
                       </div>
                       <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-md">Currently Serving</span>
                    </div>
                    <div className="flex items-center justify-between p-3 opacity-50">
                       <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                         <span className="font-semibold text-slate-900 dark:text-white">A-42 (You)</span>
                       </div>
                    </div>
                    <div className="flex items-center justify-between p-3 opacity-30">
                       <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                         <span className="font-semibold text-slate-900 dark:text-white">A-43</span>
                       </div>
                    </div>
                 </div>

                 {/* Fake Progress Bar */}
                 <div className="absolute bottom-10 left-6 right-6 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      initial={{ width: "20%" }}
                      animate={{ width: "80%" }}
                      transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                    />
                 </div>
              </div>
           </div>

           {/* Floating Map Card */}
           <motion.div 
             animate={{ y: [0, -15, 0] }}
             transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-20 -left-12 z-20 bg-white/80 dark:bg-slate-900/80 bg-opacity-95 p-4 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 flex flex-col gap-2 pointer-events-none"
           >
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <MapPin size={20} />
                 </div>
                 <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Nearby Queues</h4>
                    <p className="text-xs text-slate-500">3 places found</p>
                 </div>
              </div>
              <div className="w-full h-20 bg-slate-100 dark:bg-slate-800 rounded-lg mt-2 overflow-hidden relative">
                 <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/77.2090,28.6139,12,0/400x200?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJDSU5lLVlnIn0.123')] bg-center bg-cover opacity-50 grayscale" />
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-rose-500 rounded-full border-2 border-white shadow-lg animate-bounce" />
              </div>
           </motion.div>

           {/* Floating Alert Card */}
           <motion.div 
             animate={{ y: [0, 15, 0] }}
             transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
             className="absolute bottom-32 -right-16 z-20 bg-white/80 dark:bg-slate-900/80 bg-opacity-95 p-4 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-4 pointer-events-none"
           >
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/></svg>
              </div>
              <div>
                 <h4 className="font-bold text-slate-900 dark:text-white text-sm">It&apos;s your turn!</h4>
                 <p className="text-xs text-slate-500">Please proceed to Counter 3</p>
              </div>
           </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
