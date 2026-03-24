"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, Play, CheckCircle, 
  UserX, ArrowUpCircle, SkipForward,
  Loader2, LogOut, Setting2,
  Bell, Power, Clock, User
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import GlassCard from "@/components/ui/GlassCard";

const supabase = createClient();

interface StaffSession {
  staff_id: string;
  staff_name: string;
  staff_role: string;
  business_id: string;
  business_name: string;
  department_id: string;
  dept_name: string;
}

interface Token {
  id: string;
  tokenNumber: string;
  customerName: string;
  customerPhone: string;
  status: 'WAITING' | 'SERVING' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
  estimatedWaitMins: number;
  isPriority: boolean;
  createdAt: string;
}

export default function StaffQueueDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<StaffSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [queueId, setQueueId] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [currentlyServing, setCurrentlyServing] = useState<Token | null>(null);
  const [isAccepting, setIsAccepting] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchQueueContext = useCallback(async (sess: StaffSession) => {
    try {
      // 1. Fetch Today's Queue for this department
      const { data: queue, error: qError } = await (supabase
        .from("queues") as any)
        .select("id, is_accepting_tokens, currently_serving_token_id")
        .eq("org_id", sess.business_id)
        .eq("department_id", sess.department_id)
        .eq("session_date", new Date().toISOString().split("T")[0])
        .single();

      if (qError) {
        // If no queue, maybe auto-activate? 
        // For now, let's assume business owner initialized it.
        throw qError;
      }

      setQueueId(queue.id);
      setIsAccepting(queue.is_accepting_tokens);

      // 2. Fetch Tokens
      const { data: tokenData, error: tError } = await (supabase
        .from("tokens") as any)
        .select("*")
        .eq("queue_id", queue.id)
        .in("status", ["WAITING", "SERVING"])
        .order("isPriority", { ascending: false })
        .order("createdAt", { ascending: true });

      if (tError) throw tError;

      const allTokens = tokenData || [];
      setTokens(allTokens.filter((t: Token) => t.status === "WAITING"));
      setCurrentlyServing(allTokens.find((t: Token) => t.status === "SERVING") || null);

    } catch (err: any) {
      console.error("Context fetch error:", err);
      toast.error("Queue not active for today. Contact manager.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("queueless_staff_session");
    if (!raw) {
      router.push("/staff-login");
      return;
    }
    const sess = JSON.parse(raw);
    setSession(sess);
    fetchQueueContext(sess);
  }, [router, fetchQueueContext]);

  // Real-time subscription
  useEffect(() => {
    if (!queueId) return;

    const channel = supabase
      .channel(`queue_${queueId}`)
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "tokens", 
          filter: `queue_id=eq.${queueId}` 
        },
        () => {
          if (session) fetchQueueContext(session);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queueId, session, fetchQueueContext]);

  const handleCallNext = async () => {
    if (!queueId || tokens.length === 0) return;
    setActionLoading("call");
    try {
      const nextToken = tokens[0];
      
      // 1. Mark current as completed if exists
      if (currentlyServing) {
        await (supabase
          .from("tokens") as any)
          .update({ status: "COMPLETED", servedAt: new Date().toISOString() })
          .eq("id", currentlyServing.id);
      }

      // 2. Mark next as SERVING
      await (supabase
        .from("tokens") as any)
        .update({ status: "SERVING" })
        .eq("id", nextToken.id);

      // 3. Update Queue Pointer via RPC
      const { error: rpcErr } = await (supabase as any).rpc("serve_next_queue_token", {
        p_queue_id: queueId,
        p_token_id: nextToken.id
      });

      if (rpcErr) throw rpcErr;

      toast.success(`Now serving ${nextToken.tokenNumber}`);
    } catch (err) {
      toast.error("Failed to call next token");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusUpdate = async (tokenId: string, status: string) => {
    setActionLoading(tokenId);
    try {
      const { error } = await (supabase
        .from("tokens") as any)
        .update({ status })
        .eq("id", tokenId);
      if (error) throw error;
      toast.success(`Token marked as ${status}`);
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePriority = async (tokenId: string, isPriority: boolean) => {
    try {
      await (supabase
        .from("tokens") as any)
        .update({ isPriority })
        .eq("id", tokenId);
      toast.success(isPriority ? "Moved to top" : "Priority removed");
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleSkip = async (tokenId: string) => {
    try {
      // Move to end by updating createdAt
      await (supabase
        .from("tokens") as any)
        .update({ createdAt: new Date().toISOString() })
        .eq("id", tokenId);
      toast.success("Moved to end of queue");
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const toggleAccepting = async () => {
    if (!queueId) return;
    try {
      const newVal = !isAccepting;
      const { error } = await (supabase
        .from("queues") as any)
        .update({ is_accepting_tokens: newVal })
        .eq("id", queueId);
      if (error) throw error;
      setIsAccepting(newVal);
      toast.success(newVal ? "Queue opened" : "Queue paused");
    } catch (err) {
      toast.error("Failed to update queue status");
    }
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white selection:bg-primary/30 selection:text-primary font-sans">
      {/* Header */}
      <nav className="sticky top-0 z-40 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-3xl">
              🏢
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-primary">{session.dept_name}</h2>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{session.business_name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-xs font-black">{session.staff_name}</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{session.staff_role}</span>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem("queueless_staff_session");
                router.push("/staff-login");
              }}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all group"
              title="Logout"
            >
              <LogOut size={18} className="text-rose-400 group-hover:text-white" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Controls */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
              isAccepting ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            }`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${isAccepting ? "bg-emerald-400" : "bg-rose-400"}`} />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">{isAccepting ? "Accepting Tokens" : "Queue Paused"}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
               <Users size={16} />
               <span className="text-[10px] font-black uppercase tracking-widest">{tokens.length} People Waiting</span>
            </div>
          </div>
          
          <button 
            onClick={toggleAccepting}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              isAccepting ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            }`}
          >
            <Power size={14} /> {isAccepting ? "Pause Queue" : "Resume Queue"}
          </button>
        </div>

        {/* Main Display */}
        <div className="grid md:grid-cols-5 gap-8">
          {/* Now Serving */}
          <GlassCard className="md:col-span-3 p-10 rounded-[3rem] border border-primary/20 bg-primary/[0.02] shadow-2xl shadow-primary/5 text-center flex flex-col justify-center">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">Now Serving</h3>
            
            <AnimatePresence mode="wait">
              {currentlyServing ? (
                <motion.div 
                  key={currentlyServing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <p className="text-8xl font-black tracking-tighter text-primary group">
                    {currentlyServing.tokenNumber}
                  </p>
                  <div className="space-y-1">
                    <p className="text-2xl font-black text-white">{currentlyServing.customerName}</p>
                    <p className="text-zinc-500 font-mono text-sm tracking-widest">{currentlyServing.customerPhone || "NO PHONE"}</p>
                  </div>

                  <div className="flex gap-4 pt-8">
                    <button 
                      onClick={() => handleStatusUpdate(currentlyServing.id, "COMPLETED")}
                      disabled={!!actionLoading}
                      className="flex-1 py-5 bg-emerald-500 text-black rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:brightness-110 transition-all flex items-center justify-center gap-2"
                    >
                      {actionLoading === currentlyServing.id ? <Loader2 className="animate-spin" /> : <><CheckCircle size={18} /> Done</>}
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(currentlyServing.id, "NO_SHOW")}
                      disabled={!!actionLoading}
                      className="flex-1 py-5 bg-white/5 border border-white/10 text-rose-400 hover:bg-rose-500/10 rounded-[2rem] font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                    >
                      <UserX size={18} /> No Show
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-8">
                  <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mx-auto text-zinc-800">
                    <Users size={64} />
                  </div>
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Waiting for next token...</p>
                  <button 
                    onClick={handleCallNext}
                    disabled={tokens.length === 0 || !!actionLoading}
                    className="w-full py-6 bg-primary text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {actionLoading === 'call' ? <Loader2 className="animate-spin" /> : <><Play size={20} fill="black" /> Call Next Person</>}
                  </button>
                </div>
              )}
            </AnimatePresence>
          </GlassCard>

          {/* Next Up List */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Waiting List</h3>
              <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-lg">{tokens.length}</span>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence initial={false}>
                {tokens.map((token, index) => (
                  <motion.div
                    key={token.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`p-5 rounded-3xl border transition-all flex items-center justify-between group ${
                      token.isPriority ? "bg-amber-500/5 border-amber-500/20" : "bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                        token.isPriority ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "bg-white/10 text-white"
                      }`}>
                        {token.tokenNumber}
                      </div>
                      <div>
                        <p className="font-bold text-sm tracking-tight">{token.customerName}</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                          {index === 0 ? "Next Up" : `${index} people ahead`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handlePriority(token.id, !token.isPriority)}
                        className={`p-2 rounded-xl transition-all ${token.isPriority ? "text-amber-500 bg-amber-500/10" : "text-zinc-500 hover:text-white"}`}
                        title="Toggle Priority"
                      >
                        <ArrowUpCircle size={18} />
                      </button>
                      <button 
                        onClick={() => handleSkip(token.id)}
                        className="p-2 text-zinc-500 hover:text-white transition-all"
                        title="Move to End"
                      >
                        <SkipForward size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {tokens.length === 0 && !currentlyServing && (
                <div className="py-12 text-center text-zinc-700 bg-white/[0.02] border border-dashed border-white/5 rounded-3xl">
                  <p className="text-[10px] font-black uppercase tracking-widest">Queue is Empty</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
