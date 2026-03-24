"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Play, Pause, X,
  ChevronRight, Loader2, RefreshCw,
  LayoutDashboard
} from "lucide-react";
import CountUp from "@/components/ui/CountUp";
import { toast } from "sonner";
import GlassCard from "@/components/ui/GlassCard";
import { useRouter } from "next/navigation";

import { Business, Queue, Token } from "@/types/database";

export default function BusinessQueueManagement() {
  const supabase = createClient();
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [queue, setQueue] = useState<Queue | null>(null);
  const [waitingTokens, setWaitingTokens] = useState<Token[]>([]);
  const [servingToken, setServingToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchQueueData = async () => {
    try {
      // 1. Get logged in business (using admin_org from localStorage for now or checking owner_id)
      const adminOrgId = localStorage.getItem("admin_org");
      if (!adminOrgId) {
        router.push("/dashboard");
        return;
      }

      const { data: bData } = await (supabase
        .from("businesses")
        .select("*")
        .eq("id", adminOrgId)
        .single() as any);
      setBusiness(bData);

      // 2. Get today's queue
      const today = new Date().toISOString().split("T")[0];
      const { data: qData } = await (supabase
        .from("queues")
        .select("*")
        .eq("org_id", adminOrgId)
        .eq("session_date", today)
        .eq("is_active", true)
        .maybeSingle() as any);
      
      setQueue(qData);

      if (qData) {
        // 3. Get waiting tokens
        const { data: wTokens } = await (supabase
          .from("tokens")
          .select("*")
          .eq("orgId", adminOrgId)
          .eq("status", "WAITING")
          .order("createdAt", { ascending: true })
          .limit(5) as any);
        setWaitingTokens(wTokens || []);

        // 4. Get currently serving token
        if (qData.currently_serving) {
          const { data: sToken } = await (supabase
            .from("tokens")
            .select("*")
            .eq("id", qData.currently_serving as string)
            .single() as any);
          setServingToken(sToken as Token);
        } else {
          setServingToken(null);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load queue data");
    }
  };

  useEffect(() => {
    fetchQueueData();

    // REALTIME SUBSCRIPTIONS
    const adminOrgId = localStorage.getItem("admin_org");
    if (!adminOrgId) return;

    const channel = supabase
      .channel(`queue-staff-${adminOrgId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tokens", filter: `orgId=eq.${adminOrgId}` },
        () => fetchQueueData()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "queues", filter: `org_id=eq.${adminOrgId}` },
        () => fetchQueueData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCallNext = async () => {
    setActionLoading(true);
    try {
      if (!business?.id) throw new Error("Business not found");
      const response = await fetch("/api/queue/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: business.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      toast.success(data.nextToken ? `Called ${data.nextToken.tokenNumber}` : "All tokens served!");
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const togglePause = async () => {
    if (!queue?.id) return;
    const newState = !queue?.is_accepting_tokens;
    try {
      const { error } = await (supabase
        .from("queues") as any)
        .update({ is_accepting_tokens: newState })
        .eq("id", queue.id);
      if (error) throw error;
      toast.success(newState ? "Queue Resumed" : "Queue Paused");
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  const handleCloseQueue = async () => {
    if (!confirm("Are you sure? This will cancel all remaining waiting tokens!")) return;
    try {
      // 1. Close queue
      if (queue?.id) {
        await (supabase.from("queues") as any).update({ is_active: false }).eq("id", queue.id);
      }
      
      // 2. Cancel waiting tokens
      if (business?.id) {
        await (supabase
          .from("tokens") as any)
          .update({ status: "CANCELLED" })
          .eq("orgId", business.id)
          .eq("status", "WAITING");
      }

      toast.success("Queue closed for today");
      fetchQueueData();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  const activateQueue = async () => {
    if (!business?.id) return;
    setActionLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).rpc("activate_queue_for_today", {
        p_org_id: business.id
      });
      if (error) throw error;
      toast.success("Queue Activated!");
      fetchQueueData();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D14] flex flex-col items-center justify-center p-6 text-white font-sans">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Initializing Terminal...</p>
      </div>
    );
  }

  if (!queue) {
    return (
      <div className="min-h-screen bg-[#0D0D14] text-white flex flex-col items-center justify-center p-6 gap-8">
        <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center border border-white/10">
          <X size={48} className="text-zinc-600" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black tracking-tighter mb-2">No Active Queue</h2>
          <p className="text-zinc-500 text-sm max-w-xs font-medium">Everything is quiet today. Ready to start accepting tokens?</p>
        </div>
        <button 
          onClick={activateQueue}
          disabled={actionLoading}
          className="w-full max-w-xs py-5 bg-emerald-500 text-black font-black uppercase tracking-widest text-sm rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
          title="Activate Queue for Today"
          aria-label="Activate Queue for Today"
        >
          {actionLoading ? <Loader2 className="animate-spin" /> : <><Play size={20} fill="currentColor" /> Activate for Today</>}
        </button>
        <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-zinc-500 font-bold uppercase tracking-widest text-[10px]"
            title="Back to Hub"
            aria-label="Back to Hub"
        >
            <LayoutDashboard size={14} /> Back to Hub
        </button>
      </div>
    );
  }

  const isPaused = !queue.is_accepting_tokens;

  return (
    <div className="min-h-screen bg-[#0D0D14] text-white flex flex-col font-sans p-6 safe-top overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {business?.name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
             <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isPaused ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                {isPaused ? 'PAUSED' : 'OPEN'}
             </span>
             <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest leading-none">• Staff View</span>
          </div>
        </div>
        <button 
          onClick={() => router.push('/dashboard')}
          className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          aria-label="Back to Dashboard"
          title="Back to Dashboard"
        >
          <LayoutDashboard size={20} />
        </button>
      </header>

      {/* Hero: Now Serving */}
      <main className="flex-1 flex flex-col gap-6 max-w-2xl mx-auto w-full">
        
        <GlassCard className="p-10 rounded-[3rem] text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none group-hover:bg-primary/10 transition-colors" />
          <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">Currently Serving</p>
          <div className="py-12 px-8 bg-black/40 border border-white/5 rounded-[2.5rem] inline-block w-full mb-8 relative">
            <AnimatePresence mode="wait">
              <motion.span 
                key={servingToken?.tokenNumber || "EMPTY"}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="text-8xl sm:text-9xl font-black text-primary tracking-tighter"
              >
                {servingToken?.tokenNumber || "----"}
              </motion.span>
            </AnimatePresence>
            <p className="text-[10px] font-black text-zinc-600 mt-4 uppercase tracking-[0.2em]">{servingToken?.customerName || "Waiting..."}</p>
          </div>

          <div className="flex items-center justify-center gap-12 mb-10">
            <div className="text-center">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Waiting</p>
              <p className="text-3xl font-black"><CountUp end={queue?.total_waiting ?? 0} /></p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Est. Time</p>
              <p className="text-3xl font-black">~{(queue?.total_waiting ?? 0) * (business?.serviceMins || 5)}<span className="text-xs text-zinc-500 ml-1 font-bold">m</span></p>
            </div>
          </div>

          <button 
            onClick={handleCallNext}
            disabled={actionLoading}
            className="w-full h-24 mb-2 bg-[#00F5A0] text-black rounded-[2rem] flex items-center justify-center gap-4 font-black uppercase tracking-[0.2em] text-lg shadow-[0_20px_50px_rgba(0,245,160,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
            title="Call Next Token"
            aria-label="Call Next Token"
          >
            {actionLoading ? <Loader2 className="animate-spin w-8 h-8" /> : (
              <>
                <ChevronRight size={32} />
                Call Next Token
              </>
            )}
          </button>
        </GlassCard>

        {/* Next in Line */}
        <section>
          <div className="flex items-center justify-between mb-4 px-4">
             <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Users size={12} /> Next in Line
             </h3>
             <RefreshCw size={12} className="text-zinc-600 animate-pulse" />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 px-2 scrollbar-none">
             {waitingTokens.length > 0 ? waitingTokens.map((t, idx) => (
                <div key={t.id} className="min-w-[120px] p-5 rounded-3xl bg-white/[0.03] border border-white/5 text-center">
                   <p className="text-xs font-black text-zinc-600 mb-1">#{idx + 1}</p>
                   <p className="text-xl font-black text-white">{t.tokenNumber}</p>
                </div>
             )) : (
                <div className="w-full p-8 rounded-3xl border border-dashed border-white/5 text-center">
                   <p className="text-xs font-bold text-zinc-700 uppercase">Waiting List is Empty</p>
                </div>
             )}
          </div>
        </section>

        {/* Footer Actions */}
        <footer className="grid grid-cols-2 gap-4 mt-auto pt-6">
          <button 
            onClick={togglePause}
            className={`flex-1 py-5 rounded-[2rem] border flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] transition-all
              ${isPaused 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
              }`}
            title={isPaused ? "Resume Queue" : "Pause Queue"}
            aria-label={isPaused ? "Resume Queue" : "Pause Queue"}
          >
            {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
            {isPaused ? 'Resume Queue' : 'Pause Queue'}
          </button>
          <button 
            onClick={handleCloseQueue}
            className="flex-1 py-5 rounded-[2rem] bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] hover:bg-red-500/20"
            title="Close Queue"
            aria-label="Close Queue"
          >
            <X size={20} />
            Close Queue
          </button>
        </footer>

      </main>
    </div>
  );
}
