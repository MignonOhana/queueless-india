"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ChevronLeft, MapPin, Clock, Users, Activity, Phone, Star, AlertCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";

export default function QRJoinLandingPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params?.businessId as string;
  const { user, loginAsCustomer } = useAuth();

  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<"not-found" | "closed" | "full" | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [liveWaitCount, setLiveWaitCount] = useState(0);
  const [liveServingToken, setLiveServingToken] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState(user?.user_metadata?.full_name || "");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Success State
  const [joinedToken, setJoinedToken] = useState<any>(null);

  // Auto-format Indian Phone Number
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 10 && !val.startsWith('91')) return; // Limit pure digits to 10 if no country code
    
    if (val.length === 12 && val.startsWith('91')) {
       val = '+' + val;
    } else if (val.length === 10) {
       val = '+91 ' + val;
    } else if (val.length > 0) {
       val = '+91 ' + val; // Preview formatter
    }
    
    setPhone(val);
    if (phoneError) setPhoneError("");
  };

  useEffect(() => {
    let isMounted = true;
    let subscription: any;

    const fetchBusinessConfig = async () => {
      if (!businessId) return;

      try {
        const { data: bData, error } = await supabase
          .from("businesses")
          .select("*")
          .eq("id", businessId)
          .maybeSingle();

        if (error) throw error;
        if (!bData) {
          if (isMounted) setErrorStatus("not-found");
          return;
        }

        if (isMounted) setBusiness(bData);

        if (!bData.is_accepting_tokens) {
          if (isMounted) setErrorStatus("closed");
          return;
        }

        // Fetch Live Stats
        const { count, error: countErr } = await supabase
          .from("tokens")
          .select("*", { count: "exact", head: true })
          .eq("orgId", businessId)
          .eq("status", "WAITING")
          .gte("createdAt", new Date().toISOString().split("T")[0]);

        const currentWaiting = count || 0;
        if (isMounted) setLiveWaitCount(currentWaiting);

        if (bData.max_capacity && currentWaiting >= bData.max_capacity) {
          if (isMounted) setErrorStatus("full");
        }

        // Fetch Currently Serving (for preview)
        const { data: servingData } = await supabase
          .from("tokens")
          .select("tokenNumber")
          .eq("orgId", businessId)
          .eq("status", "SERVING")
          .order("updatedAt", { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (servingData && isMounted) {
           setLiveServingToken(servingData.tokenNumber);
        }

        // Subscribe to real-time changes
        subscription = supabase
          .channel(`public:tokens:orgId=${businessId}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tokens', filter: `orgId=eq.${businessId}` }, () => {
             // Re-fetch count dynamically on any queue change
             supabase.from("tokens")
               .select("*", { count: "exact", head: true })
               .eq("orgId", businessId)
               .eq("status", "WAITING")
               .then(({count}) => {
                  if (isMounted) setLiveWaitCount(count || 0);
               });
          })
          .subscribe();

      } catch (err) {
        console.error("Error fetching business:", err);
        if (isMounted) setErrorStatus("not-found");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBusinessConfig();

    return () => {
      isMounted = false;
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [businessId]);


  const handleJoinQueue = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Validation
    if (!user) {
       if (!name.trim()) return setPhoneError("Name is required");
       const cleanPhone = phone.replace(/\D/g, '');
       if (cleanPhone.length !== 12 || !cleanPhone.startsWith('91')) {
          return setPhoneError("Valid 10-digit Indian phone required");
       }
    }

    setIsJoining(true);

    try {
      // If user isn't logged in, log them in via OTP or Anon
      let activeUserId = user?.id;
      if (!user) {
         // This is a simplified flow: in a real app, an OTP step happens here.
         // For the demo landing page, we proceed via a mock anonymous ID if auth fails/skipped
         activeUserId = "guest-" + Date.now(); 
      }

      const serviceId = business.services[0].id;
      const counterPrefix = business.services[0].prefix;

      // Call Edge Function
      const { data, error } = await supabase.functions.invoke('generate-token', {
        body: { 
          orgId: businessId, 
          counterPrefix, 
          userId: activeUserId, 
          customerName: name || user?.user_metadata?.full_name || "Guest", 
          customerPhone: phone 
        }
      });

      if (error) throw error;

      // SUCCESS!
      setJoinedToken({
        tokenNumber: data.tokenNumber,
        estimatedWaitMins: data.estimatedWaitMins,
        position: liveWaitCount + 1
      });
      
      // Fire Confetti!
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#4F46E5', '#10B981', '#F59E0B']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#4F46E5', '#10B981', '#F59E0B']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to join queue. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
         <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-r-2 border-emerald-500 animate-spin duration-700"></div>
            <div className="absolute inset-4 rounded-full border-b-2 border-amber-500 animate-spin duration-1000"></div>
         </div>
      </div>
    );
  }

  // --- ERROR STATES ---
  if (errorStatus) {
    const errorConfigs = {
      "not-found": { icon: AlertCircle, title: "Business Not Found", desc: "The scanned QR code is invalid or expired.", color: "text-rose-500" },
      "closed": { icon: Clock, title: "Queue is Closed", desc: "This business is not accepting new tokens right now.", color: "text-amber-500" },
      "full": { icon: Users, title: "Queue is Full", desc: "The waitlist has reached maximum capacity. Please come back later.", color: "text-orange-500" }
    };
    const cfg = errorConfigs[errorStatus];
    const Icon = cfg.icon;

    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
         <div className={`w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-2xl ${cfg.color}`}>
            <Icon size={40} />
         </div>
         <h1 className="text-3xl font-black text-white mb-3 tracking-tight">{cfg.title}</h1>
         <p className="text-slate-400 font-medium mb-8 max-w-sm leading-relaxed">{cfg.desc}</p>
         <button onClick={() => router.push("/")} className="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 active:scale-95 transition-transform flex items-center gap-2">
            Return Home <ArrowRight size={18} />
         </button>
      </div>
    );
  }

  // Calculate generic wait time (mock ~5 mins per person)
  const currentWaitTime = liveWaitCount * 5;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30">
      
      {/* Background Ambient Glow */}
      <div className="fixed top-0 inset-x-0 h-[50vh] bg-gradient-to-b from-indigo-900/40 via-purple-900/10 to-transparent pointer-events-none" />
      <div className="fixed top-1/4 -right-1/4 w-[50vh] h-[50vh] rounded-full bg-rose-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed top-1/4 -left-1/4 w-[50vh] h-[50vh] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 pt-12 pb-6 flex justify-between items-center">
         <button onClick={() => router.push("/")} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} className="text-white" />
         </button>
         <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">Accepting Tokens</span>
         </div>
      </header>

      <main className="relative z-10 px-6 max-w-lg mx-auto pb-24">
         
         {/* Business Card */}
         <motion.div 
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
         >
            <div className="absolute top-0 right-0 p-8 opacity-20"><Users size={120} /></div>
            
            <div className="inline-block bg-indigo-500/20 text-indigo-300 font-black text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg mb-6 border border-indigo-500/30">
               {business.category || 'Verified Business'}
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tighter mb-4 drop-shadow-sm">
               {business.name}
            </h1>
            
            <div className="flex flex-col gap-3 mb-8">
               <div className="flex items-center gap-2 text-slate-300 font-medium text-sm">
                 <MapPin size={16} className="text-rose-400" />
                 <span>{business.address}</span>
               </div>
               <div className="flex items-center gap-2 text-slate-300 font-medium text-sm">
                 <Clock size={16} className="text-amber-400" />
                 <span>Open Today: {business.opHours}</span>
               </div>
            </div>

            {/* Live Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-center">
                  <p className="text-slate-400 font-semibold text-xs uppercase tracking-wider mb-1">Live Wait</p>
                  <div className="flex items-baseline gap-1">
                     <span className="text-3xl font-black text-white">{currentWaitTime === 0 ? '<5' : currentWaitTime}</span>
                     <span className="text-sm font-medium text-slate-400">min</span>
                  </div>
               </div>
               <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-center">
                  <p className="text-slate-400 font-semibold text-xs uppercase tracking-wider mb-1">In Line</p>
                  <div className="flex items-baseline gap-1.5">
                     <Users size={18} className="text-indigo-400" />
                     <span className="text-3xl font-black text-white">{liveWaitCount}</span>
                  </div>
               </div>
            </div>
            
            {liveServingToken && (
               <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex justify-center items-center gap-2 text-sm font-bold text-emerald-400">
                  <span>Currently Serving:</span>
                  <span className="bg-emerald-500 text-black px-2 py-0.5 rounded-md text-xs">{liveServingToken}</span>
               </div>
            )}
         </motion.div>


         {/* ACTIONS SECTION */}
         <div className="mt-8">
            <AnimatePresence mode="wait">
               
               {/* SUCCESS STATE */}
               {joinedToken ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 shadow-2xl border border-white/20 text-center relative overflow-hidden"
                  >
                     <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full pointer-events-none"></div>
                     
                     <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-inner transform -rotate-6">
                        <Star className="fill-indigo-600 text-indigo-600" size={32} />
                     </div>
                     
                     <h3 className="text-white/80 font-bold uppercase tracking-widest text-xs mb-2">You are in queue!</h3>
                     <div className="bg-white/20 backdrop-blur-md rounded-2xl py-4 px-6 inline-block mb-6 border border-white/30">
                        <span className="text-5xl font-black text-white tracking-tighter shadow-sm">
                           {joinedToken.tokenNumber}
                        </span>
                     </div>
                     
                     <div className="flex justify-center gap-6 mb-8 text-white">
                        <div>
                           <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Position</p>
                           <p className="text-2xl font-black">#{joinedToken.position}</p>
                        </div>
                        <div className="w-px bg-white/20"></div>
                        <div>
                           <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Est. Wait</p>
                           <p className="text-2xl font-black">{joinedToken.estimatedWaitMins}m</p>
                        </div>
                     </div>

                     <button 
                       onClick={() => router.push(`/customer/queue/${businessId}/${joinedToken.tokenNumber}`)}
                       className="w-full bg-white text-indigo-700 font-black py-5 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2 text-lg"
                     >
                       Track Live Status <ArrowRight size={20} />
                     </button>
                  </motion.div>

               ) : (
                  
                  /* JOIN FORM */
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                     {!user && (
                        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] p-6 mb-6">
                           <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                              Join without signing in
                           </h3>
                           
                           <form onSubmit={handleJoinQueue} className="space-y-4">
                              <div>
                                 <input 
                                   type="text" 
                                   placeholder="Full Name" 
                                   value={name}
                                   onChange={e => setName(e.target.value)}
                                   className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white font-medium focus:outline-none focus:border-indigo-500 focus:bg-white/5 transition-all placeholder:text-slate-500"
                                   required
                                 />
                              </div>
                              <div>
                                 <input 
                                   type="tel" 
                                   placeholder="Mobile Number (+91)" 
                                   value={phone}
                                   onChange={handlePhoneChange}
                                   className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white font-medium focus:outline-none focus:border-indigo-500 focus:bg-white/5 transition-all placeholder:text-slate-500"
                                   required
                                 />
                                 {phoneError && <p className="text-rose-400 text-xs font-bold mt-2 ml-1">{phoneError}</p>}
                                 <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-2 ml-1">For SMS wait-time alerts</p>
                              </div>
                           </form>
                        </div>
                     )}

                     <button 
                       disabled={isJoining}
                       onClick={handleJoinQueue}
                       className={`w-full font-black text-lg py-5 rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-2 ${
                          isJoining 
                            ? 'bg-white/20 text-white/50 cursor-not-allowed hidden-border' 
                            : 'bg-white text-black hover:scale-[1.02] active:scale-95'
                       }`}
                     >
                       {isJoining ? (
                         <Activity size={24} className="animate-spin text-white" />
                       ) : user ? (
                         <>1-Tap Join as {user.user_metadata?.full_name || 'User'} <ArrowRight size={20}/></>
                       ) : (
                         <>Secure Spot in Line <ArrowRight size={20}/></>
                       )}
                     </button>
                     
                     {!user && (
                       <p className="text-center text-slate-500 text-xs font-semibold mt-6">
                         By joining, you agree to the <a href="#" className="text-indigo-400 underline">Terms of Service</a>
                       </p>
                     )}
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

      </main>
    </div>
  );
}
