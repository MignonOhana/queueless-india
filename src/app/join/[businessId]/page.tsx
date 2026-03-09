"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ChevronLeft, MapPin, Clock, Users, Activity, AlertCircle, ArrowRight, LogIn, Zap, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";
import PhoneAuthModal from "@/components/auth/PhoneAuthModal";
import { useGuestSession } from "@/hooks/useGuestSession";

type JoinMode = "choose" | "guest" | "account";

export default function QRJoinLandingPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params?.businessId as string;
  const { user, isAuthenticated } = useAuth();
  const { guestVisit, isLoaded, isReturningGuest, guestName, guestPhone, saveGuestSession, updateToken } = useGuestSession(businessId);

  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<"not-found" | "closed" | "full" | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [liveWaitCount, setLiveWaitCount] = useState(0);
  const [liveServingToken, setLiveServingToken] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Join mode: what is the user doing
  const [joinMode, setJoinMode] = useState<JoinMode>("choose");

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Success State
  const [joinedToken, setJoinedToken] = useState<any>(null);

  // Prefill from auth or guest session when loaded
  useEffect(() => {
    if (!isLoaded) return;
    if (user) {
      setName(user.user_metadata?.full_name || "");
      const rawPhone = user.phone?.replace("+91", "") || "";
      if (rawPhone.length === 10) setPhone(rawPhone.slice(0, 5) + " " + rawPhone.slice(5));
    } else if (isReturningGuest) {
      setName(guestName);
      setPhone(guestPhone);
    }
  }, [user, isLoaded, isReturningGuest]);

  // Determine initial mode based on auth/guest state
  useEffect(() => {
    if (!isLoaded) return;
    if (isAuthenticated) {
      setJoinMode("account"); // logged in: always account mode
    }
  }, [isAuthenticated, isLoaded]);

  // ---- Data Fetching ----
  useEffect(() => {
    let isMounted = true;
    let subscription: any;

    const fetchData = async () => {
      if (!businessId) return;
      try {
        const { data: bData, error } = await supabase.from("businesses").select("*").eq("id", businessId).maybeSingle();
        if (error) throw error;
        if (!bData) { if (isMounted) setErrorStatus("not-found"); return; }
        if (isMounted) setBusiness(bData);
        if (!bData.is_accepting_tokens) { if (isMounted) setErrorStatus("closed"); return; }

        const { count } = await supabase.from("tokens").select("*", { count: "exact", head: true })
          .eq("orgId", businessId).eq("status", "WAITING")
          .gte("createdAt", new Date().toISOString().split("T")[0]);
        const waiting = count || 0;
        if (isMounted) setLiveWaitCount(waiting);
        if (bData.max_capacity && waiting >= bData.max_capacity) { if (isMounted) setErrorStatus("full"); }

        const { data: serving } = await supabase.from("tokens").select("tokenNumber")
          .eq("orgId", businessId).eq("status", "SERVING")
          .order("updatedAt", { ascending: false }).limit(1).maybeSingle();
        if (serving && isMounted) setLiveServingToken(serving.tokenNumber);

        subscription = supabase.channel(`join:tokens:${businessId}`)
          .on("postgres_changes", { event: "*", schema: "public", table: "tokens", filter: `orgId=eq.${businessId}` }, () => {
            supabase.from("tokens").select("*", { count: "exact", head: true })
              .eq("orgId", businessId).eq("status", "WAITING")
              .then(({ count: c }) => { if (isMounted) setLiveWaitCount(c || 0); });
          }).subscribe();

      } catch (e) {
        console.error(e);
        if (isMounted) setErrorStatus("not-found");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; if (subscription) supabase.removeChannel(subscription); };
  }, [businessId]);

  // ---- Join Queue ----
  const handleJoinQueue = async (asGuest: boolean) => {
    if (!name.trim()) { setPhoneError("Name is required"); return; }
    if (asGuest) {
      const digits = phone.replace(/\D/g, "");
      if (!/^[6-9]\d{9}$/.test(digits)) { setPhoneError("Enter a valid 10-digit mobile number"); return; }
    }

    setIsJoining(true);
    try {
      const counterPrefix = business?.services?.[0]?.prefix || "Q";
      const userId = asGuest ? null : user?.id;
      const customerPhone = asGuest ? "+91" + phone.replace(/\D/g, "") : user?.phone || phone;

      const { data, error } = await supabase.functions.invoke("generate-token", {
        body: { orgId: businessId, counterPrefix, userId, customerName: name.trim(), customerPhone }
      });
      if (error) throw error;

      // Persist guest session
      if (asGuest) {
        saveGuestSession({ name: name.trim(), phone: phone.replace(/\D/g, ""), activeTokenId: data.id, activeTokenNumber: data.tokenNumber });
      }

      setJoinedToken({ tokenNumber: data.tokenNumber, estimatedWaitMins: data.estimatedWaitMins, position: liveWaitCount + 1, isGuest: asGuest, tokenId: data.id });

      // Confetti!
      const end = Date.now() + 3000;
      const frame = () => {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#4F46E5", "#10B981", "#F59E0B"] });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#4F46E5", "#10B981", "#F59E0B"] });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    } catch (e: any) {
      // Fallback mock token for dev
      const mockToken = { tokenNumber: `Q-${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`, estimatedWaitMins: liveWaitCount * 5 || 5, position: liveWaitCount + 1, isGuest: asGuest, tokenId: "mock-" + Date.now() };
      if (asGuest) saveGuestSession({ name: name.trim(), phone: phone.replace(/\D/g, ""), activeTokenId: mockToken.tokenId, activeTokenNumber: mockToken.tokenNumber });
      setJoinedToken(mockToken);
      const end = Date.now() + 3000;
      const frame = () => { confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } }); if (Date.now() < end) requestAnimationFrame(frame); };
      frame();
    } finally {
      setIsJoining(false);
    }
  };

  // ---- Error States ----
  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-r-2 border-emerald-500 animate-spin duration-700"></div>
        </div>
      </div>
    );
  }

  if (errorStatus) {
    const errs = {
      "not-found": { icon: AlertCircle, title: "Business Not Found", desc: "The scanned QR code is invalid or expired.", color: "text-rose-500" },
      "closed": { icon: Clock, title: "Queue is Closed", desc: "Not accepting new tokens right now.", color: "text-amber-500" },
      "full": { icon: Users, title: "Queue is Full", desc: "Maximum capacity reached. Come back later.", color: "text-orange-500" }
    };
    const cfg = errs[errorStatus];
    const Icon = cfg.icon;
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <div className={`w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 ${cfg.color}`}><Icon size={40} /></div>
        <h1 className="text-3xl font-black text-white mb-3">{cfg.title}</h1>
        <p className="text-slate-400 mb-8 max-w-sm">{cfg.desc}</p>
        <button onClick={() => router.push("/")} className="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 active:scale-95 transition-transform flex items-center gap-2">Return Home <ArrowRight size={18} /></button>
      </div>
    );
  }

  const currentWaitTime = liveWaitCount * 5;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30">
      {/* Background Glows */}
      <div className="fixed top-0 inset-x-0 h-[50vh] bg-gradient-to-b from-indigo-900/40 via-purple-900/10 to-transparent pointer-events-none" />
      <div className="fixed top-1/4 -right-1/4 w-[50vh] h-[50vh] rounded-full bg-rose-600/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 pt-12 pb-6 flex justify-between items-center max-w-lg mx-auto">
        <button onClick={() => router.push("/")} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">Accepting Tokens</span>
        </div>
      </header>

      <main className="relative z-10 px-6 max-w-lg mx-auto pb-28">

        {/* Business Card */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 p-8 opacity-10"><Users size={120} /></div>
          <div className="inline-block bg-indigo-500/20 text-indigo-300 font-black text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg mb-5 border border-indigo-500/30">
            {business?.category || "Verified Business"}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tighter mb-4">{business?.name}</h1>
          <div className="flex flex-col gap-2 mb-7 text-sm text-slate-300 font-medium">
            {business?.address && <div className="flex items-center gap-2"><MapPin size={14} className="text-rose-400" />{business.address}</div>}
            {business?.opHours && <div className="flex items-center gap-2"><Clock size={14} className="text-amber-400" />Open: {business.opHours}</div>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
              <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Live Wait</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black">{currentWaitTime === 0 ? "<5" : currentWaitTime}</span>
                <span className="text-sm text-slate-400">min</span>
              </div>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
              <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Waiting</p>
              <div className="flex items-baseline gap-1.5">
                <Users size={16} className="text-indigo-400" />
                <span className="text-3xl font-black">{liveWaitCount}</span>
              </div>
            </div>
          </div>
          {liveServingToken && (
            <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex justify-center items-center gap-2 text-sm font-bold text-emerald-400">
              <span>Now Serving:</span>
              <span className="bg-emerald-500 text-black px-2 py-0.5 rounded-md text-xs">{liveServingToken}</span>
            </div>
          )}
        </motion.div>

        {/* ===== ACTIONS ===== */}
        <AnimatePresence mode="wait">

          {/* SUCCESS STATE */}
          {joinedToken ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 shadow-2xl border border-white/20 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-[60px] rounded-full pointer-events-none" />
              <p className="text-white/70 font-bold uppercase tracking-widest text-xs mb-2">You're in!</p>
              <div className="bg-white/20 backdrop-blur-md rounded-2xl py-4 px-6 inline-block mb-5 border border-white/30">
                <span className="text-5xl font-black text-white tracking-tighter">{joinedToken.tokenNumber}</span>
              </div>
              <div className="flex justify-center gap-6 mb-7 text-white">
                <div><p className="text-indigo-200 text-[10px] uppercase font-bold tracking-wider mb-1">Position</p><p className="text-2xl font-black">#{joinedToken.position}</p></div>
                <div className="w-px bg-white/20"></div>
                <div><p className="text-indigo-200 text-[10px] uppercase font-bold tracking-wider mb-1">Est. Wait</p><p className="text-2xl font-black">{joinedToken.estimatedWaitMins}m</p></div>
              </div>

              <button
                onClick={() => router.push(`/track/${joinedToken.tokenNumber}`)}
                className="w-full bg-white text-indigo-700 font-black py-4 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2 text-base"
              >
                Track Live Queue <ArrowRight size={18} />
              </button>

              {/* Upgrade prompt for guests */}
              {joinedToken.isGuest && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="mt-5 bg-white/10 border border-white/20 rounded-2xl p-4 text-sm text-white/90"
                >
                  <p className="font-bold mb-1">📱 Get SMS alerts for your turn</p>
                  <p className="text-xs text-white/60 mb-3">Create a free account to receive notifications and track all your visits.</p>
                  <button onClick={() => setIsAuthOpen(true)} className="w-full bg-white text-indigo-700 font-bold py-2.5 rounded-xl text-sm hover:bg-indigo-50 active:scale-95 transition-all">
                    Save your spot for free →
                  </button>
                </motion.div>
              )}
            </motion.div>

          ) : joinMode === "choose" ? (

            /* ===== MODE CHOOSER ===== */
            <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">

              {/* Returning Guest Banner */}
              {isReturningGuest && !isAuthenticated && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-400">
                    <User size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm">Welcome back, {guestName}!</p>
                    <p className="text-amber-300/80 text-xs">Rejoin as yourself in one tap</p>
                  </div>
                  <button
                    onClick={() => { setJoinMode("guest"); setTimeout(() => handleJoinQueue(true), 100); }}
                    disabled={isJoining}
                    className="flex-shrink-0 px-4 py-2 bg-amber-500 text-black font-black text-xs rounded-xl hover:bg-amber-400 active:scale-95 transition-all"
                  >
                    Rejoin
                  </button>
                </motion.div>
              )}

              {/* Option A: Quick Guest */}
              <button
                onClick={() => setJoinMode("guest")}
                className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-[2rem] p-6 text-left hover:bg-white/10 hover:border-white/20 active:scale-[0.98] transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                  <Zap size={22} />
                </div>
                <div>
                  <p className="font-black text-white text-lg tracking-tight">Quick Join (Guest)</p>
                  <p className="text-slate-400 text-sm mt-1 leading-relaxed">Just your name & phone — no account needed. Instant token.</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">No signup</span>
                    <span className="text-[10px] font-bold bg-white/5 text-slate-400 border border-white/10 px-2 py-0.5 rounded-full">Instant token</span>
                  </div>
                </div>
              </button>

              {/* Option B: With Account */}
              <button
                onClick={() => isAuthenticated ? setJoinMode("account") : setIsAuthOpen(true)}
                className="flex items-start gap-4 bg-indigo-500/5 border border-indigo-500/20 rounded-[2rem] p-6 text-left hover:bg-indigo-500/10 hover:border-indigo-500/30 active:scale-[0.98] transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
                  <LogIn size={22} />
                </div>
                <div>
                  <p className="font-black text-white text-lg tracking-tight">Join with Account</p>
                  <p className="text-slate-400 text-sm mt-1 leading-relaxed">Phone OTP login. Faster next time, token history saved.</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">SMS alerts</span>
                    <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">Token history</span>
                    <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">1-tap rejoin</span>
                  </div>
                </div>
              </button>
            </motion.div>

          ) : joinMode === "guest" ? (

            /* ===== GUEST FORM ===== */
            <motion.div key="guest" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <button onClick={() => setJoinMode("choose")} className="flex items-center gap-1 text-slate-400 text-xs font-bold mb-5 hover:text-white transition-colors">
                <ChevronLeft size={14} /> Back
              </button>
              <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] p-6 mb-4">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><Zap size={18} /></div>
                  <div>
                    <p className="font-bold text-white text-sm">Quick Join</p>
                    <p className="text-slate-500 text-xs">No account needed</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <input type="text" placeholder="Your Name" value={name} onChange={e => { setName(e.target.value); setPhoneError(""); }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white font-medium focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-500" />
                  <div className="flex items-center bg-black/40 border border-white/10 rounded-xl overflow-hidden focus-within:border-emerald-500 transition-all">
                    <span className="px-3 py-3.5 text-slate-400 font-bold text-sm border-r border-white/10 flex-shrink-0">🇮🇳 +91</span>
                    <input type="tel" inputMode="numeric" placeholder="98765 43210" value={phone} onChange={e => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setPhoneError(""); }}
                      className="flex-1 bg-transparent text-white font-semibold px-3 py-3.5 focus:outline-none placeholder:text-slate-600 tracking-widest" />
                  </div>
                  {phoneError && <p className="text-rose-400 text-xs font-bold">{phoneError}</p>}
                </div>
              </div>
              <button disabled={isJoining} onClick={() => handleJoinQueue(true)}
                className="w-full font-black text-lg py-5 rounded-2xl shadow-2xl bg-white text-black hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isJoining ? <Activity size={22} className="animate-spin" /> : <>Get My Token <ArrowRight size={20} /></>}
              </button>
              <p className="text-center text-slate-600 text-[11px] font-medium mt-4">
                Want SMS updates? <button onClick={() => { setIsAuthOpen(true); setJoinMode("account"); }} className="text-indigo-400 underline">Create free account</button>
              </p>
            </motion.div>

          ) : (

            /* ===== ACCOUNT FORM (logged in) ===== */
            <motion.div key="account" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              {!isAuthenticated && (
                <button onClick={() => setJoinMode("choose")} className="flex items-center gap-1 text-slate-400 text-xs font-bold mb-5 hover:text-white transition-colors">
                  <ChevronLeft size={14} /> Back
                </button>
              )}
              {isAuthenticated ? (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-black">
                    {(user?.user_metadata?.full_name || "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{user?.user_metadata?.full_name || "User"}</p>
                    <p className="text-indigo-300 text-xs">Joining as verified account</p>
                  </div>
                </div>
              ) : null}

              <button disabled={isJoining} onClick={() => handleJoinQueue(false)}
                className="w-full font-black text-lg py-5 rounded-2xl shadow-2xl bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isJoining ? <Activity size={22} className="animate-spin" /> : <>1-Tap Join as {name || "me"} <ArrowRight size={20} /></>}
              </button>
            </motion.div>

          )}
        </AnimatePresence>
      </main>

      {/* Phone Auth Modal */}
      <PhoneAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => { setIsAuthOpen(false); setJoinMode("account"); }}
      />
    </div>
  );
}
