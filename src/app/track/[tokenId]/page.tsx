"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, Maximize2, Minimize2, Bell, BellOff, MapPin, Clock, Phone, X, Star, Share2, AlertCircle, Navigation, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";
import { EmailOTPModal } from "@/components/auth/EmailOTPModal";
import { useGuestSession } from "@/hooks/useGuestSession";
import { requestNotificationPermission, sendTokenAlert } from "@/lib/notifications";
import QRCode from 'react-qr-code';

export default function TokenTrackingPage() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const tokenId = params?.tokenId as string;
  const { user } = useAuth();

  const [token, setToken] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<"not-found" | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  
  // Realtime States
  const [peopleAhead, setPeopleAhead] = useState<number>(0);
  const [etaMins, setEtaMins] = useState<number>(0);
  const [status, setStatus] = useState<string>("WAITING");
  
  // UI States
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showReview, setShowReview] = useState(false);
  
  // Review State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Time formatting
  const [currentTime, setCurrentTime] = useState(new Date());

  // Confetti trigger tracking
  const hasFiredConfetti = useRef(false);

  // Guest mode state
  const [isGuestUpgradeOpen, setIsGuestUpgradeOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  // Determine if user is a guest by checking if token has no userId
  const isGuestMode = !isAuthenticated && !!token && !token.userId;

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);
    
    // Load from cache if offline
    if (!navigator.onLine) {
      const cached = localStorage.getItem(`token_cache_${tokenId}`);
      if (cached) {
        const { token: ct, business: cb, timestamp } = JSON.parse(cached);
        setToken(ct);
        setBusiness(cb);
        setStatus(ct.status);
        setPeopleAhead(ct.position || 0);
        setLastUpdated(timestamp);
        setLoading(false);
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [tokenId]);

  // --- Clock Tick for ETA updates ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000); // 30s
    return () => clearInterval(timer);
  }, []);


  // --- Data Fetch & Supabase Subscriptions ---
  useEffect(() => {
    let isMounted = true;
    let tokenSub: any;
    let queueSub: any;

    const fetchTokenData = async () => {
      if (!tokenId) return;

      try {
        // 1. Fetch Token
        const { data: tData, error: tErr } = await supabase
          .from("tokens")
          .select("*")
          .eq("tokenNumber", tokenId) // assuming tokenId is the tokenNumber like OPD-001 based on URL structure /track/[tokenId]
          .maybeSingle();

        if (tErr) throw tErr;
        if (!tData) {
          if (isMounted) setErrorStatus("not-found");
          return;
        }

        // 2. Fetch Business
        const { data: bData, error: bErr } = await supabase
          .from("businesses")
          .select("*")
          .eq("id", tData.orgId)
          .maybeSingle();

        if (bData && isMounted) setBusiness(bData);

        if (isMounted) {
           setToken(tData);
           setStatus(tData.status);
           setEtaMins(tData.estimatedWaitMins || 0);
           
           // Persist for offline
           localStorage.setItem(`token_cache_${tokenId}`, JSON.stringify({
             token: tData,
             business: bData,
             timestamp: Date.now()
           }));
           setLastUpdated(Date.now());
           localStorage.setItem('queueless_joined_once', 'true');
        }

        // 3. Calculate initial position (people ahead)
        if (tData.status === "WAITING") {
           const { count } = await supabase
             .from("tokens")
             .select("*", { count: "exact", head: true })
             .eq("orgId", tData.orgId)
             .eq("counterId", tData.counterId)
             .eq("status", "WAITING")
             .lt("createdAt", tData.createdAt); // Those who joined before this token
             
           if (isMounted) setPeopleAhead(count || 0);
        }

        // --- REALTIME SUBSCRIPTIONS ---

        // Sub 1: Monitor this specific token for status changes (e.g. WAITING -> SERVING)
        tokenSub = supabase.channel(`public:tokens:id=${tData.id}`)
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tokens', filter: `id=eq.${tData.id}` }, (payload) => {
             const newStatus = payload.new.status;
             if (isMounted) {
                setStatus(newStatus);
                setToken(payload.new);
                setEtaMins(payload.new.estimatedWaitMins || 0);
                
                // Persist for offline
                localStorage.setItem(`token_cache_${tokenId}`, JSON.stringify({
                  token: payload.new,
                  business: bData,
                  timestamp: Date.now()
                }));
                setLastUpdated(Date.now());
                
                if (newStatus === "SERVING" && !hasFiredConfetti.current) {
                   fireTurnConfetti();
                   hasFiredConfetti.current = true;
                   if (notifyEnabled) {
                     triggerTurnNotification();
                     sendTokenAlert(0, bData?.name);
                   }
                } else if (newStatus === "SERVED") {
                   setShowReview(true);
                }
             }
          }).subscribe();

        // Sub 2: Monitor queue ahead for position recalculations
        queueSub = supabase.channel(`public:tokens:orgId=${tData.orgId}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tokens', filter: `orgId=eq.${tData.orgId}` }, async () => {
             // Recalculate position whenever the queue for this business changes
             if (tData.status === "WAITING") {
                const { count } = await supabase
                  .from("tokens")
                  .select("*", { count: "exact", head: true })
                  .eq("orgId", tData.orgId)
                  .eq("counterId", tData.counterId)
                  .eq("status", "WAITING")
                  .lt("createdAt", tData.createdAt);
                  
                if (isMounted) {
                   const countAhead = count || 0;
                   setPeopleAhead(countAhead);
                   if (countAhead === 2 && notifyEnabled) {
                      triggerApproachingNotification();
                      sendTokenAlert(2, bData?.name);
                   }
                }
             }
          }).subscribe();

      } catch (err) {
        console.error("Error fetching token tracking info:", err);
        if (isMounted) setErrorStatus("not-found");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTokenData();

    return () => {
      isMounted = false;
      if (tokenSub) supabase.removeChannel(tokenSub);
      if (queueSub) supabase.removeChannel(queueSub);
    };
  }, [tokenId]);


  // --- Notifications & Effects ---
  const fireTurnConfetti = () => {
     const duration = 5000;
     const end = Date.now() + duration;
     const frame = () => {
       confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#4F46E5', '#10B981', '#F59E0B'] });
       confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#4F46E5', '#10B981', '#F59E0B'] });
       if (Date.now() < end) requestAnimationFrame(frame);
     };
     frame();
  };

   const toggleNotifications = async () => {
      if (!notifyEnabled) {
         const granted = await requestNotificationPermission();
         if (granted) {
            setNotifyEnabled(true);
            new Notification("QueueLess India", { body: "Notifications enabled! We'll alert you when it's your turn." });
         } else {
            alert("Please enable notifications in your browser settings.");
         }
      } else {
         setNotifyEnabled(false);
      }
   };

  const triggerApproachingNotification = () => {
     if (Notification.permission === "granted") {
        new Notification("You're almost up!", { body: `There are only 2 people ahead of you at ${business?.name}.` });
     }
  };

  const triggerTurnNotification = () => {
     if (Notification.permission === "granted") {
        new Notification("It's your turn!", { body: `Please proceed to the counter at ${business?.name} now.` });
     }
  };

  // --- Actions ---
  const handleCancelQueue = async () => {
    try {
      if (!token) return;
      await supabase.from("tokens").update({ status: "CANCELLED" }).eq("id", token.id);
      router.push("/");
    } catch (e) {
      console.error(e);
      alert("Failed to leave queue.");
    }
  };

  const submitReview = async () => {
     setIsSubmittingReview(true);
     try {
        await supabase.from("reviews").insert({
           business_id: business?.id,
           user_id: user?.id,
           rating,
           comment: reviewComment,
           token_id: token.id
        });
        alert("Thanks for your feedback!");
        router.push("/");
     } catch (e) {
        console.error(e);
        alert("Thanks for your feedback!");
        router.push("/");
     } finally {
        setIsSubmittingReview(false);
     }
  };

  // --- Formatting Helpers ---
  const expectedTime = new Date(currentTime.getTime() + (etaMins * 60000));
  const expectedTimeStr = expectedTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  // --- Render ---
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
         <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-r-2 border-primary animate-spin duration-700 opacity-50"></div>
         </div>
      </div>
    );
  }

  if (errorStatus === "not-found") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
         <h1 className="text-3xl font-black text-white mb-3 tracking-tight">Token Not Found</h1>
         <p className="text-slate-400 font-medium mb-8 max-w-sm leading-relaxed">This token is invalid or has expired.</p>
         <button onClick={() => router.push("/")} className="btn-primary px-8 py-4">
            Return Home
         </button>
      </div>
    );
  }

  // --- State Variables ---
  const isServing = status === "SERVING";
  const isServed = status === "SERVED";
  const isCancelled = status === "CANCELLED";
  
  // Progress calc (mocking total queue context for UI logic)
  const totalQueueSizeStart = token.position || (peopleAhead + 1); // Mock initial size
  const progressPercent = Math.max(5, Math.min(100, 100 - ((peopleAhead / totalQueueSizeStart) * 100)));

  return (
    <div className={`min-h-screen font-sans transition-colors duration-1000 ${
       isServing ? 'bg-primary/5' : 
       isServed ? 'bg-indigo-950/20' : 
       isCancelled ? 'bg-slate-900/50' : 
       'bg-background text-white'
    }`}>
      
      {/* Background Layer */}
      {isServing && <div className="fixed inset-0 bg-primary/10 blur-[150px] pointer-events-none animate-pulse" />}
      {isServed && <div className="fixed inset-0 bg-indigo-600/10 blur-[150px] pointer-events-none" />}
      {!isServing && !isServed && !isCancelled && (
        <>
           <div className="fixed top-0 inset-x-0 h-[40vh] bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
           <div className="fixed -bottom-1/4 -right-1/4 w-[50vh] h-[50vh] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        </>
      )}

      {/* Full Screen Mode Wrapper */}
      <motion.div 
         layout
         className={`relative z-10 flex flex-col mx-auto ${isFullScreen ? 'min-h-screen p-4 justify-center items-center' : 'max-w-md w-full px-5 py-8 min-h-screen'}`}
      >
         
         {/* HEADER BAR (hidden in fullscreen) */}
         <AnimatePresence>
            {!isFullScreen && (
              <motion.header 
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="flex flex-col gap-4 mb-8"
              >
                {/* Offline Banner */}
                <AnimatePresence>
                  {isOffline && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl p-4 flex flex-col items-center gap-1 justify-center text-xs font-bold shadow-sm backdrop-blur-md"
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle size={14} className="animate-pulse" />
                        <span>You're offline — viewing cached data</span>
                      </div>
                      {lastUpdated && (
                        <span className="opacity-60 font-medium">
                          Last updated: {new Date(lastUpdated).toLocaleTimeString()}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between items-center w-full">
                  <button onClick={() => router.push("/")} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md hover:bg-white/10 transition-colors">
                     <ChevronLeft size={20} className="text-white" />
                  </button>
                  <div className="flex gap-2 text-sm font-bold opacity-80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 bg-white/5">
                     QueueLess Live
                  </div>
                  <button onClick={() => setIsFullScreen(true)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md hover:bg-white/10 transition-colors tooltip" aria-label="Show to staff">
                     <Maximize2 size={16} className="text-white" />
                  </button>
                </div>
              </motion.header>
            )}
         </AnimatePresence>

         {/* --- MAIN TRACKING CARD --- */}
         <motion.div 
           layout
           className={`relative border border-border backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-500 ${
              isFullScreen ? 'w-full max-w-lg aspect-square flex flex-col items-center justify-center rounded-brand bg-surface/80' : 
              isServing ? 'rounded-brand bg-emerald-500/10 p-8 text-center' :
              isServed ? 'rounded-brand bg-indigo-500/10 p-8 text-center' :
              isCancelled ? 'rounded-brand bg-rose-500/10 p-8 text-center opacity-80' :
              'rounded-brand bg-surface p-8'
           }`}
         >
            {/* Status Badge */}
            <motion.div layout className="flex justify-center mb-6">
               <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border flex items-center gap-2 ${
                  isServing ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]' :
                  isServed ? 'bg-indigo-500 text-white border-indigo-400' :
                  isCancelled ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                  peopleAhead <= 2 ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.3)] animate-pulse' :
                  'bg-white/10 text-white border-white/20'
               }`}>
                  {isServing && <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>}
                  {isServing ? "IT'S YOUR TURN" : isServed ? "COMPLETED" : isCancelled ? "CANCELLED" : peopleAhead <= 2 ? "YOU'RE ALMOST NEXT" : "WAITING"}
               </div>
            </motion.div>

            {/* Token Number */}
            <motion.h2 
              layout
              className={`font-black tracking-tighter text-center leading-none ${
                 isFullScreen ? 'text-[6rem] sm:text-[8rem] text-white drop-shadow-2xl mb-8' : 
                 isServing ? 'text-6xl sm:text-7xl text-primary mb-6' : 
                 'text-6xl sm:text-7xl text-white mb-8'
              }`}
            >
               {token?.tokenNumber}
            </motion.h2>

            {/* Business Info / Serving Message */}
            <motion.div layout className="text-center">
               {isServing ? (
                 <p className="text-xl sm:text-2xl font-medium text-emerald-100 mb-4 px-4 leading-relaxed">
                   Please proceed to the counter at <strong className="text-white">{business?.name}</strong> immediately.
                 </p>
               ) : isServed ? (
                 <p className="text-xl font-medium text-indigo-100 mb-4 px-4 leading-relaxed">
                   Thank you for choosing <strong className="text-white">{business?.name}</strong>.
                 </p>
               ) : isCancelled ? (
                 <p className="text-rose-200">This token has been cancelled.</p>
               ) : (
                 <div className="flex flex-col items-center gap-2 mb-8">
                   <p className="text-lg font-bold text-white/90">{business?.name}</p>
                   {token?.counterId !== 'opd' && (
                     <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-white/70">
                       Queue: {String(token?.counterId).toUpperCase()}
                     </span>
                   )}
                 </div>
               )}
            </motion.div>

            {/* Full Screen Close Button */}
            {isFullScreen && (
               <button onClick={() => setIsFullScreen(false)} className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                  <Minimize2 size={24} />
               </button>
            )}

            {/* --- LIVE STATS (Waiting State Only) --- */}
            {!isFullScreen && !isServing && !isServed && !isCancelled && (
               <motion.div layout initial={{opacity:0}} animate={{opacity:1}} className="mt-4 pt-6 border-t border-white/10">
                  
                  {/* Visual Queue Position */}
                  <div className="mb-8">
                     <div className="flex justify-between items-end mb-3">
                        <p className="text-sm font-bold text-slate-300">Queue Position</p>
                        <p className="text-xl font-black text-white">{peopleAhead} <span className="text-xs font-medium text-slate-400">ahead</span></p>
                     </div>
                     
                      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="absolute top-0 left-0 h-full bg-primary rounded-full shadow-[0_0_10px_rgba(0,245,160,0.5)]"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                     <div className="flex justify-between mt-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        <span>Start</span>
                        <span>Counter</span>
                     </div>
                  </div>

                  {/* Smart ETA */}
                  <div className="bg-black/30 rounded-2xl p-5 border border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                           <Clock size={20} />
                        </div>
                        <div>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Estimated Wait</p>
                           <p className="text-xl font-black text-white">{etaMins} mins</p>
                        </div>
                     </div>
                     <div className="text-right border-l border-white/10 pl-4">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Expected Time</p>
                        <p className="text-lg font-bold text-slate-200">{expectedTimeStr}</p>
                     </div>
                  </div>

               </motion.div>
            )}

         </motion.div>

         {/* --- ACTIONS AND NOTIFICATIONS (Hidden in fullscreen) --- */}
         <AnimatePresence>
            {!isFullScreen && !isServed && !isCancelled && (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                 className="mt-6 flex flex-col gap-4"
               >
                  {/* Guest Upgrade Banner */}
                  {isGuestMode && (
                     <motion.button
                       onClick={() => setIsGuestUpgradeOpen(true)}
                       initial={{ opacity: 0, y: 8 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="w-full p-4 rounded-[1.5rem] border border-amber-500/30 bg-amber-500/10 flex items-center gap-3 text-left hover:bg-amber-500/15 active:scale-[0.98] transition-all"
                     >
                        <span className="text-xl flex-shrink-0">📱</span>
                        <div className="flex-1">
                           <p className="text-amber-200 font-bold text-sm">Create a free account</p>
                           <p className="text-amber-400/70 text-xs">Get SMS alerts when it is your turn</p>
                        </div>
                        <span className="text-amber-400 text-xs font-black flex-shrink-0">Free →</span>
                     </motion.button>
                  )}

                  {/* Smart Notifications Toggle */}
                  <button 
                    onClick={toggleNotifications}
                    className={`p-4 rounded-[1.5rem] border backdrop-blur-md flex items-center justify-between transition-all ${
                       notifyEnabled ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notifyEnabled ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-white/10 text-slate-400'}`}>
                           {notifyEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                        </div>
                        <div className="text-left">
                           <p className={`font-bold text-sm ${notifyEnabled ? 'text-indigo-200' : 'text-slate-200'}`}>Smart Alerts</p>
                           <p className={`text-xs ${notifyEnabled ? 'text-indigo-400/80' : 'text-slate-500'}`}>{notifyEnabled ? 'We will email you when next' : 'Tap to receive push notifications'}</p>
                        </div>
                     </div>
                     <div className={`w-12 h-6 rounded-full p-1 transition-colors ${notifyEnabled ? 'bg-indigo-500' : 'bg-white/10'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notifyEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                     </div>
                  </button>

                   {/* QR Code */}
                   <div className="flex justify-center">
                     <div className="bg-white p-4 rounded-2xl border border-white/10 shadow-lg">
                       <QRCode value={typeof window !== 'undefined' ? window.location.href : ''} size={100} bgColor="#ffffff" fgColor="#000000" />
                       <p className="text-[10px] text-center text-slate-500 mt-2 font-bold uppercase tracking-widest">Show at counter</p>
                     </div>
                   </div>


                    <div className="grid grid-cols-2 gap-3">
                       {/* WhatsApp Message Business */}
                       {business?.whatsapp_enabled && business?.phone && (
                         <a
                           href={`https://wa.me/${business.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                             `Hi, my token number is ${token?.tokenNumber}. Please let me know when it's my turn.`
                           )}`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="col-span-2 bg-emerald-500 text-white rounded-[1.5rem] p-4 flex items-center justify-center gap-3 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                         >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.39-4.412 9.883-9.886 9.883m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            <span className="font-bold">Message Business on WhatsApp</span>
                         </a>
                       )}
                       
                       {/* WhatsApp Share */}
                       <button
                         onClick={() => {
                           const text = `My queue token at ${business?.name}: ${token?.tokenNumber}. Track here: ${window.location.href}`;
                           window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                         }}
                         className="bg-emerald-500/10 border border-emerald-500/20 rounded-[1.5rem] p-4 flex flex-col items-center justify-center gap-2 hover:bg-emerald-500/20 transition-colors"
                       >
                          <Share2 size={20} className="text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-400">Share Link</span>
                       </button>
                      {/* Directions */}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((business?.name || '') + ' ' + (business?.location || ''))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-500/10 border border-blue-500/20 rounded-[1.5rem] p-4 flex flex-col items-center justify-center gap-2 hover:bg-blue-500/20 transition-colors"
                      >
                         <Navigation size={20} className="text-blue-400" />
                         <span className="text-xs font-bold text-blue-400">Directions</span>
                      </a>
                     {/* Call Business */}
                     <a href={`tel:${business?.phone || '0000000000'}`} className="bg-white/5 border border-white/10 rounded-[1.5rem] p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                        <Phone size={20} className="text-slate-300" />
                        <span className="text-xs font-bold text-slate-300">Call</span>
                     </a>
                     {/* Leave Queue */}
                     <button onClick={() => setShowCancelConfirm(true)} className="bg-rose-500/10 border border-rose-500/20 rounded-[1.5rem] p-4 flex flex-col items-center justify-center gap-2 hover:bg-rose-500/20 transition-colors">
                        <X size={20} className="text-rose-400" />
                        <span className="text-xs font-bold text-rose-400">Leave</span>
                     </button>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

      </motion.div>


      {/* --- RATINGS MODAL (Appears on Served) --- */}
      <AnimatePresence>
         {showReview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div initial={{opacity:0}} animate={{opacity:1}} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
               <motion.div 
                 initial={{ scale: 0.9, y: 20, opacity: 0 }}
                 animate={{ scale: 1, y: 0, opacity: 1 }}
                 className="relative z-10 w-full max-w-sm bg-white rounded-[2rem] p-8 text-center text-slate-900 shadow-2xl"
               >
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Star size={32} className="fill-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-black mb-2 tracking-tight">How was it?</h3>
                  <p className="text-sm font-medium text-slate-500 mb-8">Your feedback helps {business?.name} improve their service.</p>
                  
                  <div className="flex justify-center gap-2 mb-8">
                     {[1,2,3,4,5].map(star => (
                        <button 
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 transition-transform hover:scale-110 focus:outline-none"
                        >
                           <Star size={36} className={`transition-colors ${(hoverRating || rating) >= star ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} />
                        </button>
                     ))}
                  </div>

                  <textarea 
                    placeholder="Add an optional comment..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 mb-6 resize-none h-24 placeholder:text-slate-400"
                  />
                  
                  <button 
                    disabled={rating === 0 || isSubmittingReview}
                    onClick={submitReview}
                    className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
                  >
                     {isSubmittingReview ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Submit Review"}
                  </button>
                  <button onClick={() => router.push("/")} className="w-full mt-4 text-xs font-bold text-slate-400 p-2 hover:text-slate-600">
                     Skip
                  </button>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* --- CANCEL CONFIRMATION MODAL --- */}
      <AnimatePresence>
         {showCancelConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div initial={{opacity:0}} animate={{opacity:1}} onClick={() => setShowCancelConfirm(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
               <motion.div 
                 initial={{ scale: 0.95, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 0.95, opacity: 0 }}
                 className="relative z-10 w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-2xl"
               >
                  <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                     <AlertCircle size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Leave the queue?</h3>
                  <p className="text-sm text-slate-400 mb-6">You will lose your position. This action cannot be undone.</p>
                  
                  <div className="flex gap-3 text-sm font-bold">
                     <button onClick={() => setShowCancelConfirm(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl transition-colors">
                        Stay Waitng
                     </button>
                     <button onClick={handleCancelQueue} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl transition-colors">
                        Yes, Leave
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* Guest Upgrade Modal */}
      {isGuestUpgradeOpen && (
        <EmailOTPModal 
          onClose={() => setIsGuestUpgradeOpen(false)}
          onSuccess={() => { setIsGuestUpgradeOpen(false); /* The page will re-render with auth state */ }}
        />
      )}

    </div>
  );
}
