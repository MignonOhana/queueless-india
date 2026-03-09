"use client";

import { use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ArrowLeft, ArrowRight, MapPin, BellRing, PauseCircle, LogOut, Replace, Activity } from "lucide-react";
import { useCustomerQueue } from "@/lib/useCustomerQueue";
import { useLanguage } from "@/context/LanguageContext";
import PageTransition from "@/components/PageTransition";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getDistance, estimateTravelTime } from "@/lib/geolocation";

export default function TicketPage({
  params,
}: {
  params: Promise<{ orgId: string; tokenId: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const orgId = resolvedParams.orgId;
  const myToken = resolvedParams.tokenId;
  
  const queueData = useCustomerQueue(orgId, myToken);
  const { t } = useLanguage();

  const [showAlert, setShowAlert] = useState(false);
  const [isPriority, setIsPriority] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isLate, setIsLate] = useState(false);
  const [travelTimeMins, setTravelTimeMins] = useState<number | null>(null);
  const [isTimeToLeave, setIsTimeToLeave] = useState(false);

  const estimatedWait = queueData.estimatedWait || 15;
  const arrivalStart = Math.max(0, estimatedWait - 5);
  const arrivalEnd = estimatedWait + 5;

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setIsOffline(!window.navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (orgId && myToken) {
      localStorage.setItem("active_org", orgId);
      localStorage.setItem("active_token", myToken);
      if (localStorage.getItem("priority_token") === myToken) {
        setIsPriority(true);
      }
    }
  }, [orgId, myToken]);

  // Track user location and calculate travel time
  useEffect(() => {
    let watchId: number;
    
    const calculateTravel = async (userLat: number, userLng: number) => {
       const { data, error } = await supabase.from('businesses').select('latitude, longitude').eq('id', orgId).maybeSingle();
       if (!error && data && data.latitude && data.longitude) {
          const distanceKM = getDistance(userLat, userLng, Number(data.latitude), Number(data.longitude));
          const tTime = estimateTravelTime(distanceKM);
          setTravelTimeMins(tTime);
       }
    };

    if (navigator.geolocation && orgId) {
       // Watch position so if they start moving closer, travel time reduces
       watchId = navigator.geolocation.watchPosition(
          (pos) => calculateTravel(pos.coords.latitude, pos.coords.longitude),
          (err) => console.log("Geolocation tracking denied:", err),
          { enableHighAccuracy: true, maximumAge: 60000 } // Update every minute max
       );
    }
    
    return () => {
       if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [orgId]);

  // Simulate an alert when people ahead drops to 1 or 2
  useEffect(() => {
    if (queueData.peopleAhead <= 2 && queueData.peopleAhead > 0) {
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }

    // Mark as late if they are next (0 ahead) but haven't been called/served yet
    // In a real app, this would compare token createdAt + estimatedWait vs Date.now()
    if (queueData.peopleAhead === 0 && queueData.ticketStatus === "WAITING") {
       setIsLate(true);
    } else {
       setIsLate(false);
    }

    // Smart Leave Calculation (Tolerance 5 mins)
    if (travelTimeMins !== null && estimatedWait <= (travelTimeMins + 5)) {
       // Don't flag "leave now" if wait time is huge but travel time is also huge (edge case) or they are already at location
       if (estimatedWait > 0 && travelTimeMins > 2) {
          setIsTimeToLeave(true);
       } else {
          setIsTimeToLeave(false);
       }
    } else {
       setIsTimeToLeave(false);
    }

  }, [queueData.peopleAhead, queueData.ticketStatus, estimatedWait, travelTimeMins]);

  const handleCancelAndLeave = () => {
    localStorage.removeItem("active_org");
    localStorage.removeItem("active_token");
    localStorage.removeItem("priority_token");
    router.replace("/customer");
  };

  // Progress calculations
  // Assume average queue length start was peopleAhead + currentlyServed (dummy logic for progress ring)
  const initialQueueAssumed = 10;
  const progressPercent = Math.min(100, Math.max(5, 100 - (queueData.peopleAhead / initialQueueAssumed) * 100));
  const circumference = 2 * Math.PI * 120; // r=120
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <PageTransition className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] font-sans pb-24 transition-colors duration-300">
      
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link href="/customer" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
          <ArrowLeft size={20} />
        </Link>
        <div className="text-center">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white capitalize">{orgId.replace("-", " ")}</h1>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">General OPD</p>
        </div>
        <div className="w-10"></div>
      </header>

      <div className="max-w-md mx-auto px-6 py-8 space-y-6 relative">
        
        {/* Network Failure Banner */}
        <AnimatePresence>
          {isOffline && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-4 flex items-start gap-3 justify-center text-sm font-bold shadow-sm backdrop-blur-md"
            >
              <Activity size={18} className="animate-pulse shrink-0" />
              <span>Connection lost. Trying to reconnect to real-time sync...</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Smart Alerts Panel */}
        {showAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl p-4 text-white shadow-lg shadow-orange-500/20 flex items-start gap-4"
          >
            <div className="p-2 bg-white/20 rounded-full shrink-0 animate-bounce">
              <BellRing size={24} />
            </div>
            <div>
              <h4 className="font-bold text-lg leading-tight">Your turn is approaching!</h4>
              <p className="text-sm text-orange-100 mt-1">Please head towards Counter 3. You are next.</p>
            </div>
          </motion.div>
        )}

        {/* Smart Leave Alert */}
        <AnimatePresence>
          {isTimeToLeave && !isLate && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full bg-rose-600 rounded-2xl p-4 text-white shadow-xl shadow-rose-600/30 flex items-center justify-between border-2 border-rose-400 border-dashed"
            >
              <div>
                <h4 className="font-black text-lg tracking-tight flex items-center gap-2 uppercase">
                   <Activity className="animate-pulse" /> Leave Now
                </h4>
                <p className="text-sm text-rose-100 font-medium">Your travel time ({travelTimeMins}m) matches your wait time! Head to the location to avoid cancellation.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Queue Details Card with Progress Ring */}
        <div className="relative w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col items-center">
          
          <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r ${isPriority ? 'from-amber-400 to-orange-500' : 'from-indigo-500 to-purple-500'}`} />
          
          <div className="relative w-72 h-72 flex flex-col items-center justify-center mt-4 mb-4">
            {/* SVG Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 260 260">
              <circle 
                cx="130" cy="130" r="120" 
                className="stroke-slate-100 dark:stroke-slate-800" 
                strokeWidth="12" fill="none" 
              />
              <motion.circle 
                cx="130" cy="130" r="120" 
                className={isPriority ? "stroke-amber-500" : "stroke-indigo-500"}
                strokeWidth="12" fill="none" strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{ strokeDasharray: circumference }}
              />
            </svg>
            
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs mb-1">Your Token</p>
            <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter flex flex-col items-center gap-2">
              {myToken}
              {isPriority && (
                <span className="text-[10px] bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full uppercase tracking-widest font-black shadow-sm">
                  Fast Pass ✨
                </span>
              )}
            </h2>
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold">
                <Clock size={14} /> ETA: {isPriority ? '5' : estimatedWait} min
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Arrive within {arrivalStart}–{arrivalEnd} minutes
              </p>
            </div>
          </div>
          
          <div className="w-full grid grid-cols-2 gap-4 mt-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
               <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{queueData.peopleAhead}</div>
               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ahead of you</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
               <div className="text-3xl font-black text-indigo-500 mb-1">C-3</div>
               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Counter</div>
            </div>
          </div>
          
          {/* Smart Arrival Window Context */}
          <div className={`w-full mt-6 pt-4 border-t ${isLate ? 'border-rose-100 dark:border-rose-900/50' : 'border-slate-100 dark:border-slate-800'} flex items-start gap-3`}>
             <div className={`${isLate ? 'bg-rose-50 text-rose-500 dark:bg-rose-500/10' : 'bg-blue-50 text-blue-500 dark:bg-blue-500/10'} p-2 rounded-xl shrink-0 transition-colors`}>
               <MapPin size={18} strokeWidth={3} />
             </div>
             <div>
                <p className={`text-xs font-bold ${isLate ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                  {isLate ? "⚠️ You are late" : "Recommended Arrival"}
                </p>
                <p className={`text-[11px] leading-snug mt-0.5 ${isLate ? 'text-rose-500 dark:text-rose-400/80' : 'text-slate-500'}`}>
                  {isLate 
                    ? "Your token has been marked as late. Please proceed to the counter immediately to avoid cancellation."
                    : `Please arrive between ${arrivalStart} - ${arrivalEnd} minutes. You will be marked late if not present.`}
                </p>
             </div>
             
             {/* Queue Confidence Meter */}
             <div className="ml-auto flex flex-col items-end justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Confidence</span>
                <div className="flex gap-1">
                   <div className="w-2.5 h-1.5 bg-emerald-500 rounded-full"></div>
                   <div className="w-2.5 h-1.5 bg-emerald-500 rounded-full"></div>
                   <div className="w-2.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
             </div>
          </div>
        </div>

        {/* Customer Reassurance */}
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl p-4 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
           <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              You are #{queueData.peopleAhead + 1} in line. Relax — we will notify you just before it's your turn.
           </p>
        </div>

        {/* Queue Timeline */}
        <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
           <h3 className="font-bold text-slate-900 dark:text-white mb-6">Live Timeline</h3>
           <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
              
              {/* Item 1 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                 <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white dark:border-slate-900 bg-indigo-50 dark:bg-indigo-900 text-indigo-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_4px_rgba(99,102,241,0.2)]">
                   <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                 </div>
                 <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm ml-4 md:ml-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-lg text-slate-900 dark:text-white">{queueData.currentlyServing || "A-39"}</span>
                      <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded uppercase">Serving</span>
                    </div>
                 </div>
              </div>
              
              {/* Item 2 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                 <div className="flex items-center justify-center w-8 h-8 rounded-full border 4px border-slate-50 dark:border-slate-950 bg-slate-200 dark:bg-slate-700 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                 </div>
                 <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] ml-4 md:ml-0 flex items-center justify-between p-2">
                    <span className="font-bold text-slate-500 dark:text-slate-400">A-40</span>
                 </div>
              </div>

              {/* Item 3 (You) */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                 <div className="flex items-center justify-center w-8 h-8 rounded-full border 4px border-slate-50 dark:border-slate-950 bg-orange-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg shadow-orange-500/30">
                 </div>
                 <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] ml-4 md:ml-0 flex items-center justify-between p-2 opacity-50">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{myToken} (You)</span>
                 </div>
              </div>

           </div>
        </div>

        {/* Smart Queue Balancing Alert */}
        <AnimatePresence>
          {(queueData.estimatedWait || 15) > 30 && (
            <motion.div 
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-5 shadow-lg shadow-blue-500/20 mb-6 flex flex-col sm:flex-row shadow-inner overflow-hidden relative"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
               <div className="pr-4 border-b sm:border-b-0 sm:border-r border-white/20 mb-3 sm:mb-0 pb-3 sm:pb-0">
                  <span className="bg-white/20 text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2 inline-block">Smart Load Balancer</span>
                  <h4 className="text-white font-bold leading-tight">High wait detected</h4>
               </div>
               <div className="sm:pl-4 flex-1 flex flex-col justify-center">
                  <p className="text-sm text-blue-100 font-medium leading-relaxed mb-3 mt-2 sm:mt-0">
                     Transfer to <strong className="text-white">Sector 18 Branch</strong> (<MapPin size={12} className="inline mb-0.5"/> 2km away) and save <strong className="text-white">{(queueData.estimatedWait || 15) - 10} mins</strong>.
                  </p>
                  <button className="bg-white text-blue-600 font-bold text-sm py-2 px-4 rounded-xl shadow-sm hover:scale-[1.02] active:scale-95 transition-transform w-full sm:w-auto self-start flex items-center justify-center gap-2">
                     Transfer Now <ArrowRight size={14}/>
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Existing Wait Details */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-800 relative overflow-hidden mb-6 group">
           <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/77.2090,28.6139,15,0/600x300?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJDSU5lLVlnIn0.123')] bg-center bg-cover opacity-60 grayscale transition-all group-hover:scale-105 group-hover:grayscale-0" />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
           <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">Building Floor 2</h4>
                <p className="text-xs text-slate-300 flex items-center gap-1"><MapPin size={12}/> Navigate to Counter 3</p>
              </div>
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold transition-colors">
                Open Map
              </button>
           </div>
        </div>

        {/* Queue Controls */}
        <div className="grid grid-cols-3 gap-3">
           <button className="flex flex-col items-center justify-center gap-2 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm active:scale-95 transition-all">
             <PauseCircle size={20} className="text-slate-400" />
             <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Pause</span>
           </button>
           <button className="flex flex-col items-center justify-center gap-2 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm active:scale-95 transition-all">
             <Replace size={20} className="text-slate-400" />
             <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Transfer</span>
           </button>
           <button onClick={handleCancelAndLeave} className="flex flex-col items-center justify-center gap-2 bg-rose-50 dark:bg-rose-500/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/50 shadow-sm hover:bg-rose-100 dark:hover:bg-rose-500/20 active:scale-95 transition-all">
             <LogOut size={20} className="text-rose-500" />
             <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Leave</span>
           </button>
        </div>

      </div>
    </PageTransition>
  );
}
