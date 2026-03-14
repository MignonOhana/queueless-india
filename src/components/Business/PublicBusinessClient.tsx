'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, MapPin, Clock, Share2, ShieldCheck, 
  ChevronDown, MessageCircle, Copy, QrCode, ArrowRight, Zap, Globe 
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { useGuestSession } from '@/hooks/useGuestSession';
import { haversineDistance as getDistance } from '@/lib/geolocation';
import { EmailOTPModal } from '@/components/auth/EmailOTPModal';
import FastPassCheckout from '@/components/FastPassCheckout';
import CustomerOnboarding from '@/components/Onboarding/CustomerOnboarding';
import confetti from 'canvas-confetti';
import { AlertCircle, LogIn, User as UserIcon, Activity as ActivityIcon } from 'lucide-react';

interface PublicBusinessClientProps {
  business: any;
  initialWaitingCount: number;
  initialReviews: any[];
}

export default function PublicBusinessClient({ business, initialWaitingCount, initialReviews }: PublicBusinessClientProps) {
  const router = useRouter();
  const { user, isAuthenticated, userRole } = useAuth();
  const { t } = useLanguage();
  const { guestVisit, isLoaded, isReturningGuest, guestName, guestPhone, saveGuestSession } = useGuestSession(business.id);

  const [waitingCount, setWaitingCount] = useState(initialWaitingCount);
  const [showHours, setShowHours] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  // Join Flow States
  const [isJoining, setIsJoining] = useState(false);
  const [joinMode, setJoinMode] = useState<'info' | 'choose' | 'guest' | 'account'>('info');
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [joinedToken, setJoinedToken] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [liveServingToken, setLiveServingToken] = useState<string | null>(null);

  // Prefill from auth or guest session
  useEffect(() => {
    if (!isLoaded) return;
    if (user) {
      setName(user.user_metadata?.full_name || "");
      const rawPhone = user.phone?.replace("+91", "") || "";
      if (rawPhone.length === 10) setPhone(rawPhone);
    } else if (isReturningGuest) {
      setName(guestName);
      setPhone(guestPhone);
    }
  }, [user, isLoaded, isReturningGuest, guestName, guestPhone]);

  // Fetch Live Serving Token
  useEffect(() => {
    const fetchServing = async () => {
      const { data } = await supabase.from("tokens")
        .select("tokenNumber")
        .eq("orgId", business.id)
        .eq("status", "SERVING")
        .order("updatedAt", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) setLiveServingToken(data.tokenNumber);
    };
    fetchServing();
  }, [business.id]);

  // --- REAL-TIME UPDATES ---
  useEffect(() => {
    if (!business?.id) return;

    const channel = supabase
      .channel(`public:tokens:${business.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tokens',
        filter: `orgId=eq.${business.id}`
      }, async () => {
        // Refetch total waiting on any change
        const { count } = await supabase
          .from('tokens')
          .select('*', { count: 'exact', head: true })
          .eq('orgId', business.id)
          .eq('status', 'WAITING')
          .gte('createdAt', new Date().toISOString().split('T')[0]);
        
        setWaitingCount(count || 0);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [business.id]);

  // Handle Geolocation for Fast Pass
  useEffect(() => {
    if (business?.latitude && business?.longitude) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const dist = getDistance(
            pos.coords.latitude, pos.coords.longitude,
            business.latitude, business.longitude
          );
          setDistance(dist);
        },
        (err) => console.warn("Location access denied", err)
      );
    }
  }, [business]);

  // Check for active token in localStorage on mount
  useEffect(() => {
    if (!isLoaded) return;
    const savedOrg = localStorage.getItem("active_org");
    const savedToken = localStorage.getItem("active_token");
    const savedTokenNumber = localStorage.getItem("active_token_number");
    
    if (savedOrg === business.id && savedToken) {
      setJoinedToken({
        tokenId: savedToken,
        tokenNumber: savedTokenNumber || "Refetching...",
        position: "?",
        estimatedWaitMins: "?",
        isGuest: !isAuthenticated
      });
    }
  }, [business.id, isLoaded, isAuthenticated]);

  const handleJoinQueue = async (asGuest: boolean) => {
    if (!name.trim()) { setPhoneError("Name is required"); return; }
    
    const normalizePhone = (p: string) => {
      let cleaned = p.replace(/\D/g, "");
      if (cleaned.startsWith("91") && cleaned.length === 12) {
        cleaned = cleaned.substring(2);
      } else if (cleaned.startsWith("0") && cleaned.length === 11) {
        cleaned = cleaned.substring(1);
      }
      return cleaned;
    };

    const digits = normalizePhone(phone);

    if (asGuest) {
      if (!/^[6-9]\d{9}$/.test(digits)) { 
        setPhoneError("Please enter a valid 10-digit Indian mobile number"); 
        return; 
      }
    }

    setIsJoining(true);
    try {
      const counterPrefix = business?.services?.[0]?.prefix || "Q";
      const userId = asGuest ? null : user?.id;
      const customerPhone = asGuest ? "+91" + digits : user?.phone || "+91" + digits;

      const response = await fetch("/api/queue/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          orgId: business.id, 
          counterPrefix, 
          userId, 
          customerName: name.trim(), 
          customerPhone 
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to join queue");
      
      // Persist guest session
      if (asGuest) {
        saveGuestSession({ 
          name: name.trim(), 
          phone: phone.replace(/\D/g, ""), 
          activeTokenId: data.id, 
          activeTokenNumber: data.tokenNumber 
        });

        // UX-1: WhatsApp-First flow trigger
        if (notifyWhatsApp && business?.phone) {
          const message = `Hi, my token number is ${data.tokenNumber}. Please let me know when it's my turn.`;
          window.open(`https://wa.me/${business.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
        }
      }

      setJoinedToken({ 
        tokenNumber: data.tokenNumber, 
        estimatedWaitMins: data.estimatedWaitMins, 
        position: waitingCount + 1, 
        isGuest: asGuest, 
        tokenId: data.id 
      });

      // Confetti logic
      const end = Date.now() + 3000;
      const frame = () => {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#00F5A0", "#00D4FF", "#7000FF"] });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#00F5A0", "#00D4FF", "#7000FF"] });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
      toast.success("Joined successfully!");
    } catch (e: any) {
      console.error("Join Error:", e);
      toast.error("Failed to join queue. Our servers are busy.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleShareWhatsApp = () => {
    const text = `Hey, check out ${business.name} on QueueLess! You can join their queue digitally and save time: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const isBusinessOpen = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const dayNamesShort = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const dayKey = dayNamesShort[dayOfWeek];

    // Check JSON hours first
    if (business.op_hours_json?.[dayKey]) {
      const shifts = business.op_hours_json[dayKey];
      if (shifts === null) return false;

      const currentTime = now.getHours() * 60 + now.getMinutes();
      return shifts.some((shift: { open: string; close: string }) => {
        const [sH, sM] = shift.open.split(":").map(Number);
        const [eH, eM] = shift.close.split(":").map(Number);
        return currentTime >= sH * 60 + sM && currentTime <= eH * 60 + eM;
      });
    }

    if (!business.settings?.businessHours) return true; // Fallback
    const day = now.toLocaleDateString("en-US", { weekday: "long" });
    const hours =
      business.settings.businessHours[day] ||
      business.settings.businessHours["default"];
    if (!hours || hours.closed) return false;

    const [start, end] = hours.slots?.[0] || ["09:00", "20:00"];
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [sH, sM] = start.split(":").map(Number);
    const [eH, eM] = end.split(":").map(Number);

    return currentTime >= sH * 60 + sM && currentTime <= eH * 60 + eM;
  };

  const avgWait = waitingCount * (business.avg_service_time || 5);
  const isOpen = isBusinessOpen();

  return (
    <div className="max-w-xl mx-auto pb-32">
       
       {/* HERO SECTION */}
       <div className="relative h-64 overflow-hidden rounded-b-[3rem]">
          {business.cover_image_url ? (
            <img src={business.cover_image_url} alt={business.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-background to-surface flex items-center justify-center">
              <Globe size={48} className="text-white/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          
          <Link href="/" className="absolute top-6 left-6 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white transition-colors">
             <ChevronDown className="rotate-90" size={20} />
          </Link>
       </div>

       <div className="px-6 -mt-12 relative z-10">
          <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-brand p-8 shadow-2xl">
             <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                   {business.category || "Business"}
                </span>
                {business.is_verified && (
                   <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-blue-400">
                      <ShieldCheck size={12} /> Verified
                   </span>
                )}
             </div>

             <h1 className="text-3xl font-black text-white tracking-tighter mb-2">{business.name}</h1>
             
             <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 text-amber-500">
                   <Star size={18} fill="currentColor" />
                   <span className="font-black">{business.avg_rating || "0.0"}</span>
                </div>
                <span className="text-zinc-500 text-sm">{business.total_reviews || "0"} reviews</span>
                <div className="h-4 w-px bg-white/10" />
                <a 
                   href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address || "")}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex items-center gap-1 text-zinc-400 text-sm hover:text-white transition-colors"
                >
                   <MapPin size={14} /> Open Maps
                </a>
             </div>

             <p className="text-zinc-400 text-sm leading-relaxed mb-8">
               {business.description || "The future of waiting is here. Join our digital queue and arrive only when you're called."}
             </p>

             {/* LIVE STATUS CARD */}
             <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 mb-8">
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t('liveStatus')}</span>
                   </div>
                   <span className={`text-[10px] font-black px-2 py-1 rounded-md ${isOpen ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'} uppercase tracking-widest`}>
                      {isOpen ? 'Open Now' : 'Closed'}
                   </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="text-center p-4 rounded-2xl bg-black/40">
                      <p className="text-2xl font-black text-white">0</p>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1">{t('position')}</p>
                   </div>
                   <div className="text-center p-4 rounded-2xl bg-black/40">
                      <p className="text-2xl font-black text-primary">~{avgWait}m</p>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1">{t('waitTime')}</p>
                   </div>
                </div>
             </div>

             {/* ACTIONS / JOIN FLOW */}
             <div className="mt-8">
                <AnimatePresence mode="wait">
                  {joinedToken ? (
                    <motion.div 
                      key="success" 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20"
                    >
                       <div className="bg-emerald-500 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-4">
                          Booking Confirmed
                       </div>
                       <h3 className="text-5xl font-black text-white mb-2 tracking-tighter">{joinedToken.tokenNumber}</h3>
                       <div className="flex justify-center gap-6 mb-6">
                          <div>
                             <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">{t('position')}</p>
                             <p className="text-xl font-black">#{joinedToken.position}</p>
                          </div>
                          <div className="w-px bg-white/10" />
                          <div>
                             <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">{t('waitTime')}</p>
                             <p className="text-xl font-black">{joinedToken.estimatedWaitMins}m</p>
                          </div>
                       </div>

                       {/* PWA Install Banner */}
                       <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-left">
                          <div className="flex-1 pr-4">
                             <p className="text-white font-bold text-xs uppercase tracking-tight">📱 Add to Home Screen</p>
                             <p className="text-zinc-400 text-[10px] mt-0.5">Stay updated even when your screen is off</p>
                          </div>
                          <button 
                             onClick={() => window.dispatchEvent(new Event('trigger-pwa-install'))}
                             className="px-4 py-2 bg-emerald-500 text-black font-black text-[10px] uppercase rounded-xl hover:bg-emerald-400 transition-colors"
                          >
                             Add Now
                          </button>
                       </div>

                       <button 
                         onClick={() => router.push(`/track/${joinedToken.tokenId}`)}
                         className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:brightness-110 active:scale-95 transition-all shadow-xl"
                       >
                          Track Progress <ArrowRight size={16} className="inline ml-1" />
                       </button>
                    </motion.div>
                  ) : joinMode === 'info' ? (
                    <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                       {userRole === "business_owner" ? (
                         <div className="w-full p-6 py-8 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 text-center">
                            <ShieldCheck size={32} className="mx-auto text-indigo-400 mb-3" />
                            <p className="text-white font-bold">Business Owner View</p>
                            <p className="text-zinc-500 text-xs mt-1">You are viewing this as a business owner. Queue joining is disabled for your role.</p>
                            <button 
                              onClick={() => router.push('/dashboard')}
                              className="mt-6 text-indigo-400 font-black uppercase tracking-widest text-[10px] hover:underline"
                            >
                              Go to My Dashboard
                            </button>
                         </div>
                       ) : (
                         <>
                           <button 
                             disabled={!isOpen}
                             onClick={() => setJoinMode(isAuthenticated ? 'account' : 'choose')}
                             className="btn-primary w-full py-5 text-sm"
                           >
                              {isOpen ? <>{t('joinQueue')} <ArrowRight size={18} /></> : "Closed for now"}
                           </button>

                           {business.settings?.fastPassEnabled && isOpen && (
                              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 py-3 rounded-2xl border border-primary/10">
                                 <Zap size={14} fill="currentColor" /> Skip the line for ₹{business.settings?.fastPassPrice || 49}
                              </div>
                           )}
                         </>
                       )}
                    </motion.div>
                  ) : joinMode === 'choose' ? (
                    <motion.div key="choose" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <button 
                          onClick={() => setJoinMode('guest')}
                          className="w-full flex items-start gap-4 p-5 rounded-3xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-all group"
                        >
                           <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              <Zap size={20} />
                           </div>
                           <div>
                              <p className="font-black text-white text-sm">Quick Join (Guest)</p>
                              <p className="text-zinc-500 text-xs mt-1">Join in seconds. No account needed.</p>
                           </div>
                        </button>
                        <button 
                          onClick={() => setIsAuthOpen(true)}
                          className="w-full flex items-start gap-4 p-5 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 text-left hover:bg-indigo-500/10 transition-all"
                        >
                           <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                              <LogIn size={20} />
                           </div>
                           <div>
                              <p className="font-black text-white text-sm">Join with Account</p>
                              <p className="text-zinc-500 text-xs mt-1">Get SMS alerts and track visits.</p>
                           </div>
                        </button>
                    </motion.div>
                  ) : joinMode === 'guest' ? (
                    <motion.div key="guest" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                       <div className="space-y-3">
                          <input 
                            type="text" 
                            placeholder={t('yourName') || "Your Name"} 
                            value={name} 
                            onChange={e => setName(e.target.value)}
                            className="input-dark w-full px-5 py-4"
                          />
                          <div className="flex bg-black/40 border border-border rounded-2xl overflow-hidden focus-within:border-primary transition-colors">
                             <span className="px-4 py-4 text-zinc-500 font-black">+91</span>
                             <input 
                               type="tel" 
                               placeholder={t('mobileNumber') || "Mobile Number"} 
                               value={phone} 
                               onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                               className="bg-transparent flex-1 py-4 pr-5 text-white font-bold outline-none"
                             />
                          </div>
                          {phoneError && <p className="text-red-500 text-[10px] font-black uppercase px-2">{phoneError}</p>}
                       </div>
                       
                       <div className="flex gap-2">
                          <button 
                            disabled={isJoining}
                            onClick={() => handleJoinQueue(true)}
                            className="btn-primary flex-1 py-4 text-xs"
                          >
                             {isJoining ? <ActivityIcon className="animate-spin mx-auto" /> : (t('join') || "Join Now")}
                          </button>
                          
                          {business.settings?.fastPassEnabled && (
                             <FastPassCheckout 
                                businessId={business.id}
                                businessName={business.name}
                                amount={business.settings?.fastPassPrice || 49}
                                tokenData={{
                                   orgId: business.id,
                                   counterPrefix: business.services?.[0]?.prefix || "Q",
                                   customerName: name,
                                   customerPhone: "+91" + phone
                                }}
                                onSuccess={(data) => {
                                   saveGuestSession({ 
                                      name, phone, 
                                      activeTokenId: data.tokenId, 
                                      activeTokenNumber: data.tokenNumber 
                                   });
                                   setJoinedToken({ 
                                      tokenNumber: data.tokenNumber, 
                                      position: 1, 
                                      estimatedWaitMins: 5, 
                                      isGuest: true, 
                                      tokenId: data.tokenId 
                                   });
                                }}
                                onError={(err) => toast.error(err)}
                                isLoading={isJoining}
                             />
                          )}
                       </div>
                    </motion.div>
                  ) : (
                    <motion.div key="account" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                       <div className="flex items-center gap-3 p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mb-6">
                          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-black">
                             {(user?.user_metadata?.full_name || "U")[0].toUpperCase()}
                          </div>
                          <div>
                             <p className="font-bold text-white text-sm">{user?.user_metadata?.full_name || "User"}</p>
                             <p className="text-indigo-400 text-[10px] font-black uppercase">Verified Account</p>
                          </div>
                       </div>
                       <button 
                         disabled={isJoining}
                         onClick={() => handleJoinQueue(false)}
                         className="btn-primary w-full py-5 text-sm"
                       >
                          {isJoining ? <ActivityIcon className="animate-spin mx-auto" /> : "Confirm & Join"}
                       </button>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </div>

          {/* HOURS SECTION */}
          <div className="mt-6">
             <button 
                onClick={() => setShowHours(!showHours)}
                className="w-full flex items-center justify-between p-6 bg-surface border border-border rounded-brand text-sm text-zinc-300 font-bold"
             >
                <div className="flex items-center gap-3">
                   <Clock size={16} className="text-emerald-500" />
                   Operating Hours
                </div>
                <ChevronDown className={`transition-transform duration-300 ${showHours ? 'rotate-180' : ''}`} size={16} />
             </button>
             
             <AnimatePresence>
                {showHours && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                     <div className="p-6 pt-2 space-y-3 bg-surface/50 rounded-b-brand border-x border-b border-border">
                        {[
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                          "Sunday",
                        ].map((day) => {
                          const dayKey = day.toLowerCase().slice(0, 3);
                          const jsonHours = business.op_hours_json?.[dayKey];

                          if (jsonHours !== undefined) {
                            return (
                              <div
                                key={day}
                                className="flex justify-between items-center text-xs font-medium"
                              >
                                <span className="text-zinc-500">{day}</span>
                                <span className="text-white">
                                  {jsonHours === null
                                    ? "Closed"
                                    : jsonHours
                                        .map((s: { open: string; close: string }) => `${s.open} - ${s.close}`)
                                        .join(", ")}
                                </span>
                              </div>
                            );
                          }

                          const hours = business.settings?.businessHours?.[day] || {
                            slots: [["09:00", "20:00"]],
                          };
                          return (
                            <div
                              key={day}
                              className="flex justify-between items-center text-xs font-medium"
                            >
                              <span className="text-zinc-500">{day}</span>
                              <span className="text-white">
                                {hours.closed
                                  ? "Closed"
                                  : `${hours.slots?.[0]?.[0]} - ${hours.slots?.[0]?.[1]}`}
                              </span>
                            </div>
                          );
                        })}
                     </div>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>

          {/* REVIEWS SECTION */}
          <div className="mt-8">
             <h3 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-600 mb-6 pl-2">Customer Feedback</h3>
             {initialReviews.length > 0 ? (
               <div className="space-y-4">
                  {initialReviews.map((review) => (
                    <motion.div 
                      key={review.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 rounded-brand bg-surface border border-border"
                    >
                       <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                             <Star key={i} size={12} fill={i < review.rating ? "var(--brand-primary)" : "transparent"} stroke={i < review.rating ? "var(--brand-primary)" : "#4b5563"} />
                          ))}
                       </div>
                       <p className="text-sm text-zinc-300 leading-relaxed italic mb-3">"{review.comment}"</p>
                       <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Verified Visit • 2 hours ago</p>
                    </motion.div>
                  ))}
               </div>
             ) : (
                <div className="p-8 text-center bg-surface border border-border rounded-brand">
                   <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">No reviews yet. Be the first!</p>
                </div>
             )}
          </div>

          {/* SHARE ROW */}
          <div className="mt-8 grid grid-cols-3 gap-4">
             <button 
                onClick={handleShareWhatsApp}
                className="flex flex-col items-center justify-center p-6 rounded-brand bg-surface border border-border text-emerald-500 hover:opacity-80 transition-all"
             >
                <MessageCircle size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest mt-2">WhatsApp</span>
             </button>
             <button 
                onClick={handleCopyLink}
                className="flex flex-col items-center justify-center p-6 rounded-brand bg-surface border border-border text-blue-400 hover:opacity-80 transition-all"
             >
                <Copy size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest mt-2">Copy Link</span>
             </button>
             <button 
                onClick={() => setShowQR(true)}
                className="flex flex-col items-center justify-center p-6 rounded-brand bg-surface border border-border text-white hover:opacity-80 transition-all"
             >
                <QrCode size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest mt-2">QR Code</span>
             </button>
          </div>
       </div>

       {/* DISTANCE WARNING MODAL */}
       <AnimatePresence>
          {distance !== null && distance > 5 && joinMode === 'guest' && !joinedToken && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-end p-6"
            >
               <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="w-full max-w-lg mx-auto bg-surface border border-border rounded-brand p-8">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 mx-auto">
                     <AlertCircle size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-white text-center mb-2">You're bit far!</h3>
                  <p className="text-zinc-500 text-center text-sm mb-8">
                     You are <span className="text-white font-bold">{distance.toFixed(1)}km</span> away. We recommend joining only if you can reach within the wait time.
                  </p>
                  <div className="flex gap-4">
                     <button onClick={() => setDistance(null)} className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold">Cancel</button>
                     <button onClick={() => setDistance(null)} className="flex-1 py-4 rounded-2xl bg-amber-500 text-black font-black">Continue</button>
                  </div>
               </motion.div>
            </motion.div>
          )}
       </AnimatePresence>

       {/* QR MODAL */}
       <AnimatePresence>
          {showQR && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
               onClick={() => setShowQR(false)}
            >
               <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-surface border border-border rounded-brand p-12 flex flex-col items-center text-center"
                  onClick={e => e.stopPropagation()}
               >
                  <div className="p-4 bg-white rounded-3xl mb-8">
                     <QRCodeSVG value={typeof window !== 'undefined' ? window.location.href : business.id} size={200} />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2 tracking-tight">Scan to Share</h3>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Share ${business.name} with friends</p>
               </motion.div>
            </motion.div>
          )}
       </AnimatePresence>

       {/* Email Auth Modal */}
       {isAuthOpen && (
         <EmailOTPModal 
           onClose={() => setIsAuthOpen(false)}
           onSuccess={() => {
             setIsAuthOpen(false);
             setJoinMode('account');
           }}
         />
       )}
       
       <CustomerOnboarding />
    </div>
  );
}
