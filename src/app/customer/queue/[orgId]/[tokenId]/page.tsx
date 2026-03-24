"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, Share2, X, Clock, AlertCircle, 
  Star, CheckCircle2, Loader2, MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import GlassCard from "@/components/ui/GlassCard";
import { Token, Business, Queue } from "@/types/database";

export default function LiveTokenTracking() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const orgId = params?.orgId as string;
  const tokenId = params?.tokenId as string;

  const [token, setToken] = useState<Token | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [queue, setQueue] = useState<Queue | null>(null);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState<number | null>(null);
  const [servingTokenNumber, setServingTokenNumber] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Lazy load the chime if it exists
    audioRef.current = new Audio("/chime.mp3");
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch Token
      const { data: tData, error: tErr } = await (supabase
        .from("tokens")
        .select("*")
        .eq("id", tokenId)
        .single() as any);
      
      if (tErr || !tData) throw new Error("Token not found");
      setToken(tData);

      // 2. Fetch Position via RPC
      const { data: pos } = await (supabase as any).rpc("get_queue_position", { p_token_id: tokenId });
      const currentPos = (pos as any) && (pos as any).length > 0 ? ((pos as any)[0] as any).queue_position : null;
      setPosition(currentPos);

      // 3. Fetch Business
      const { data: bData } = await (supabase
        .from("businesses")
        .select("*")
        .eq("id", orgId)
        .single() as any);
      setBusiness(bData);

      // 4. Fetch Queue Status
      if (tData.queue_id) {
        const { data: qData } = await (supabase
          .from("queues")
          .select("*")
          .eq("id", tData.queue_id)
          .single() as any);
        setQueue(qData);

        // Get currently serving token number
        if (qData?.currently_serving) {
          const { data: sData } = await (supabase
            .from("tokens")
            .select("tokenNumber")
            .eq("id", qData.currently_serving)
            .single() as any);
          setServingTokenNumber(sData?.tokenNumber || "None");
        }
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Error loading tracking data");
    }
  };

  useEffect(() => {
    fetchData();

    // REALTIME SUBSCRIPTIONS
    const tokenChannel = supabase
      .channel(`token-updates-${tokenId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tokens", filter: `id=eq.${tokenId}` },
        (payload) => {
          const newToken = payload.new;
          const oldStatus = token?.status;
          setToken(newToken as Token);

          // Position trigger logic
          if (newToken.status === "SERVING" && oldStatus !== "SERVING") {
            triggerServingCelebration();
          } else if (newToken.status === "SERVED") {
            setShowReview(true);
          }
          
          // Re-fetch position on any token update
          fetchPosition();
        }
      )
      .subscribe();

    const queueChannel = supabase
      .channel(`queue-updates-${orgId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tokens", filter: `orgId=eq.${orgId}` },
        () => {
          fetchPosition();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "queues", filter: `org_id=eq.${orgId}` },
        (payload) => {
          setQueue(payload.new as Queue);
          // Update serving token number if changed
          if (payload.new.currently_serving) {
            updateServingNumber(payload.new.currently_serving);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tokenChannel);
      supabase.removeChannel(queueChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenId, orgId]);

  const fetchPosition = async () => {
    const { data: pos } = await (supabase as any).rpc("get_queue_position", { p_token_id: tokenId });
    const currentPos = (pos as any) && (pos as any).length > 0 ? ((pos as any)[0] as any).queue_position : null;
    if (currentPos === 1 && position !== 1) {
      triggerNextPulse();
    }
    setPosition(currentPos);
  };

  const updateServingNumber = async (sTokenId: string) => {
    const { data } = await (supabase
      .from("tokens")
      .select("tokenNumber")
      .eq("id", sTokenId)
      .single() as any);
    setServingTokenNumber(data?.tokenNumber || "None");
  };

  const triggerNextPulse = () => {
    toast("You're next! Please head to the counter.", {
      icon: "🎉",
      duration: 5000,
    });
    audioRef.current?.play().catch(() => {});
  };

  const triggerServingCelebration = async () => {
    const confetti = (await import('canvas-confetti')).default;
    const end = Date.now() + 3000;
    const colors = ["#00F5A0", "#00D4FF", "#7000FF"];

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  const handleLeaveQueue = async () => {
    try {
      const { error } = await (supabase
        .from("tokens") as any)
        .update({ status: "CANCELLED" })
        .eq("id", tokenId);
      
      if (error) throw error;
      
      // Cleanup locally
      localStorage.removeItem("active_token");
      localStorage.removeItem("active_org");
      
      toast.success("Left the queue");
      router.push("/customer/dashboard");
    } catch {
      toast.error("Failed to leave queue");
    }
  };

  const shareViaWhatsApp = () => {
    const businessName = business?.name || 'a business'
    const tokenNum = token?.tokenNumber || 'my token'
    const url = window.location.href
    const text = `🎫 I got ${tokenNum} at ${businessName}!\n\nTrack my queue live 👉 ${url}\n\nNo more waiting in line — join digitally with QueueLess India 🇮🇳`
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(waUrl, '_blank')
    // Track the share event
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).umami) (window as any).umami.track('token_shared', { platform: 'whatsapp' })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My Queue Token — ${token?.tokenNumber}`,
          text: `I'm ${token?.tokenNumber} at ${business?.name}. Track the queue:`,
          url: window.location.href,
        })
      } catch (err) {
        console.error("Error sharing", err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard!")
    }
  }

  const submitReview = async () => {
    if (rating === 0) return;
    setIsSubmittingReview(true);
    try {
      const { error } = await (supabase.from("reviews") as any).insert({
        business_id: orgId,
        user_id: token?.userId,
        rating,
        comment,
        token_id: tokenId,
      });
      if (error) throw error;
      toast.success("Thank you for your feedback!");
      router.push("/customer/dashboard");
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Connecting to Queue...</p>
      </div>
    );
  }

  const isServing = token?.status === "SERVING";
  const isOpen = queue?.is_active !== false;

  return (
    <div className="min-h-screen bg-background text-white flex flex-col font-sans selection:bg-primary/30">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 p-6 flex items-center justify-between bg-background/95 border-b border-white/5">
        <button 
          onClick={() => router.push("/customer/dashboard")}
          className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors"
          aria-label="Back to Customer Dashboard"
          title="Back to Customer Dashboard"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="text-center flex-1 pr-8">
          <h1 className="text-sm font-black tracking-tight leading-none uppercase text-zinc-400">{business?.name || "QueueLess India"}</h1>
          <p className="text-[10px] font-bold text-primary mt-1 flex items-center justify-center gap-1 uppercase tracking-widest">
            <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-primary' : 'bg-red-500'} animate-pulse`} />
            Queue is {isOpen ? 'Open' : 'Closed'}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-lg mx-auto p-6 pt-32 pb-40 flex flex-col gap-6 relative z-10">
        
        {/* Celebration State */}
        {isServing && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-8 rounded-[2.5rem] bg-primary text-black text-center shadow-[0_0_50px_rgba(0,245,160,0.3)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
            <div className="w-16 h-16 bg-black/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-3xl font-black tracking-tighter mb-2">It&apos;s your turn!</h2>
            <p className="text-sm font-bold opacity-70 leading-relaxed uppercase tracking-widest">Head to the counter at {business?.name} now.</p>
          </motion.div>
        )}

        {/* Token Card */}
        <GlassCard className={`p-8 rounded-[3rem] text-center transition-all duration-500 ${isServing ? 'opacity-50 blur-[2px]' : ''}`}>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">Your Token Number</p>
          <div className="py-8 px-6 bg-primary/10 border border-primary/20 rounded-[2rem] inline-block mb-8 relative group">
            <div className="absolute inset-0 bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-7xl font-black text-primary tracking-tighter relative z-10">{token?.tokenNumber}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Position</p>
              <p className="text-3xl font-black text-white">{position || "--"}<span className="text-sm text-zinc-500 ml-1">th</span></p>
            </div>
            <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Serving</p>
              <p className="text-xl font-black text-primary">{servingTokenNumber || "--"}</p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5">
             <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-zinc-400">Wait Progress</span>
                <span className="text-xs font-black text-primary">{position === 1 ? 'Next' : `~${(position || 0) * (business?.serviceMins || 5)}m left`}</span>
             </div>
             <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(5, 100 - ((position || 10) * 10))}%` }}
                  className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full shadow-[0_0_15px_rgba(0,245,160,0.5)]"
                />
             </div>
          </div>
        </GlassCard>

        {/* Additional Info */}
        <div className="grid grid-cols-1 gap-4">
          <GlassCard className="p-6 rounded-[2rem] flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Estimated Service</p>
              <p className="text-sm font-bold text-white">Approx. {token?.estimatedWaitMins} minutes</p>
            </div>
          </GlassCard>
        </div>

      </main>

      {/* Action Bar */}
      <footer className="fixed bottom-0 inset-x-0 p-6 z-50 bg-gradient-to-t from-background via-background/90 to-transparent">
        <div className="max-w-lg mx-auto flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={shareViaWhatsApp}
              className="p-5 rounded-2xl bg-green-600 border border-green-500/20 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs hover:bg-green-500 transition-colors shadow-lg shadow-green-900/20"
              title="Share via WhatsApp"
              aria-label="Share via WhatsApp"
            >
              <MessageCircle size={18} /> WhatsApp
            </button>
            <button 
              onClick={handleShare}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-colors"
              title="Share Tracking Link"
              aria-label="Share Tracking Link"
            >
              <Share2 size={18} /> Share
            </button>
          </div>
          <button 
            onClick={() => setShowLeaveConfirm(true)}
            className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] hover:bg-red-500/20 transition-colors opacity-50"
            title="Leave Queue"
            aria-label="Leave Queue"
          >
            <X size={14} /> Leave Queue
          </button>
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {showLeaveConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowLeaveConfirm(false)}
              className="absolute inset-0 bg-black/95" 
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-2xl font-black tracking-tighter mb-2">Leave Queue?</h3>
              <p className="text-zinc-400 text-sm font-medium mb-8 leading-relaxed">You will lose your position and need to join again later.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowLeaveConfirm(false)}
                  className="flex-1 py-4 font-black uppercase tracking-widest text-xs rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                >
                  Stay
                </button>
                <button 
                  onClick={handleLeaveQueue}
                  className="flex-1 py-4 font-black uppercase tracking-widest text-xs rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Leave
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showReview && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/95" />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative w-full max-w-sm bg-white rounded-[3rem] p-8 text-center text-black"
            >
              <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Star size={32} fill="currentColor" />
              </div>
              <h3 className="text-3xl font-black tracking-tighter mb-2">Rate your visit</h3>
              <p className="text-zinc-500 text-sm font-medium mb-8">How was your experience at {business?.name}?</p>
              
              <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    onClick={() => setRating(star)}
                    className={`p-1 transition-transform hover:scale-125 ${rating >= star ? 'text-primary' : 'text-zinc-200'}`}
                    aria-label={`${star} Stars`}
                  >
                    <Star size={32} fill={rating >= star ? 'currentColor' : 'none'} strokeWidth={3} />
                  </button>
                ))}
              </div>

              <textarea 
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full h-24 bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-primary transition-colors resize-none mb-6"
              />

              <button 
                disabled={rating === 0 || isSubmittingReview}
                onClick={submitReview}
                className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs disabled:opacity-30 disabled:grayscale transition-all"
              >
                {isSubmittingReview ? <Loader2 className="animate-spin mx-auto" /> : "Submit Review"}
              </button>
              <button 
                onClick={() => router.push("/customer/dashboard")}
                className="mt-4 text-xs font-black uppercase tracking-widest text-zinc-400 p-2"
              >
                Skip
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
