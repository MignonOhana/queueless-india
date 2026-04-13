"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, Play, CheckCircle, 
  UserX, ArrowUpCircle, SkipForward,
  Loader2, LogOut,
  Power
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
  customerPhone: string | null;
  status: 'WAITING' | 'SERVING' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
  estimatedWaitMins: number;
  isPriority: boolean;
  createdAt: string;
  paymentId: string | null;
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
      const { data: queue, error: qError } = await ((supabase as any)
        .from("queues")
        .select("id, is_accepting_tokens, currently_serving_token_id")
        .eq("org_id", sess.business_id)
        .eq("department_id", sess.department_id)
        .eq("session_date", new Date().toISOString().split("T")[0])
        .single() as any);

      if (qError) {
        throw qError;
      }

      setQueueId(queue.id);
      setIsAccepting(queue.is_accepting_tokens);

      // 2. Fetch Tokens
      const { data: tokenData, error: tError } = await ((supabase as any)
        .from("tokens")
        .select("*")
        .eq("queue_id", queue.id)
        .in("status", ["WAITING", "SERVING"])
        .order("isPriority", { ascending: false })
        .order("createdAt", { ascending: true }) as any);

      if (tError) throw tError;

      const allTokens = (tokenData || []) as any as Token[];
      setTokens(allTokens.filter((t) => t.status === "WAITING"));
      setCurrentlyServing(allTokens.find((t) => t.status === "SERVING") || null);

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
      router.push("/staff/login");
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
        await ((supabase as any)
          .from("tokens")
          .update({ status: "COMPLETED", servedAt: new Date().toISOString() })
          .eq("id", currentlyServing.id));
      }

      // 2. Mark next as SERVING
      await ((supabase as any)
        .from("tokens")
        .update({ status: "SERVING" })
        .eq("id", nextToken.id));

      // 3. Update Queue Pointer via RPC
      const { error: rpcErr } = await (supabase as any).rpc("serve_next_queue_token", {
        p_queue_id: queueId,
        p_token_id: nextToken.id
      });

      if (rpcErr) throw rpcErr;
      toast.success(`Calling ${nextToken.tokenNumber}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to call next");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAction = async (action: "complete" | "no-show") => {
    if (!currentlyServing || !queueId) return;
    setActionLoading(action);
    try {
      // Update token status
      await ((supabase as any)
        .from("tokens")
        .update({ status: action === "complete" ? "COMPLETED" : "NO_SHOW", servedAt: new Date().toISOString() })
        .eq("id", currentlyServing.id));

      // Update queue stats via RPC
      const { error: rpcErr } = await (supabase as any).rpc("complete_queue_token", {
        p_queue_id: queueId,
        p_token_id: currentlyServing.id
      });

      if (rpcErr) throw rpcErr;
      toast.success(action === "complete" ? "Token Completed" : "Marked as No-Show");
      setCurrentlyServing(null);
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleAccepting = async () => {
    if (!queueId) return;
    try {
      const { error } = await ((supabase as any)
        .from("queues")
        .update({ is_accepting_tokens: !isAccepting })
        .eq("id", queueId));

      if (error) throw error;
      setIsAccepting(!isAccepting);
      toast.success(isAccepting ? "Queue Closed" : "Queue Opened");
    } catch (err) {
      toast.error("Toggle failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("queueless_staff_session");
    router.push("/staff/login");
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white selection:bg-primary/30 selection:text-primary">
      {/* Header */}
      <nav className="sticky top-0 z-40 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-black font-black">QL</div>
            <div>
              <h1 className="font-display font-black tracking-tighter text-lg leading-tight">{session.business_name}</h1>
              <p className="text-[10px] text-primary font-black uppercase tracking-widest">{session.dept_name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <p className="text-xs font-bold text-white uppercase tracking-wider">{session.staff_name}</p>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.1em]">{session.staff_role}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-3 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-500/5 transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Currently Serving */}
          <div className="lg:col-span-7 space-y-8">
            <section className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Currently Serving</h2>
                <button 
                  onClick={toggleAccepting}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    isAccepting ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                  }`}
                >
                  <Power size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {isAccepting ? "Accepting" : "Closed"}
                  </span>
                </button>
              </div>

              {currentlyServing ? (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                  <GlassCard className="p-12 border-2 border-primary/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 transition-all group-hover:bg-primary/20" />
                    
                    <div className="relative text-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-2">Token Number</p>
                      <h3 className="text-8xl font-black tracking-tighter text-white mb-8">{currentlyServing.tokenNumber}</h3>
                      
                      <div className="space-y-1 mb-12">
                        <p className="text-2xl font-bold text-white">{currentlyServing.customerName}</p>
                        <p className="text-zinc-500 font-mono tracking-wider">{currentlyServing.customerPhone || "Guest Customer"}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                          onClick={() => handleAction("complete")}
                          disabled={!!actionLoading}
                          className="px-10 py-5 bg-primary text-black rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                        >
                          {actionLoading === "complete" ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle size={20} /> Complete</>}
                        </button>
                        <button 
                          onClick={() => handleAction("no-show")}
                          disabled={!!actionLoading}
                          className="px-10 py-5 bg-white/5 text-white border border-white/10 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 active:scale-95 transition-all disabled:opacity-50"
                        >
                          {actionLoading === "no-show" ? <Loader2 className="animate-spin" size={20} /> : <><UserX size={20} /> No Show</>}
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ) : (
                <GlassCard className="p-20 border border-dashed border-white/10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-zinc-600 mb-6">
                    <Play size={32} />
                  </div>
                  <h3 className="text-xl font-black text-zinc-500 mb-4 uppercase tracking-widest">No Active Token</h3>
                  <button 
                    onClick={handleCallNext}
                    disabled={tokens.length === 0 || !!actionLoading}
                    className="px-10 py-5 bg-primary text-black rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                  >
                    {actionLoading === "call" ? <Loader2 className="animate-spin" size={20} /> : <><ArrowUpCircle size={20} /> Call Next Token</>}
                  </button>
                  {tokens.length === 0 && <p className="mt-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Wait-list is empty</p>}
                </GlassCard>
              )}
            </section>
          </div>

          {/* Right Column: Wait-list */}
          <div className="lg:col-span-5 space-y-8">
             <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Upcoming Wait-list ({tokens.length})</h2>
                  {tokens.length > 0 && (
                    <div className="flex items-center gap-2 text-primary">
                      <Clock size={14} className="animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Live Updates</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  <AnimatePresence>
                    {tokens.map((token, idx) => (
                      <motion.div 
                        key={token.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <GlassCard className={`p-6 border border-white/10 flex items-center justify-between group hover:border-primary/30 transition-all ${token.isPriority ? 'ring-1 ring-amber-500/30' : ''}`}>
                          <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-all ${
                              token.isPriority ? 'bg-amber-500 text-black' : 'bg-white/5 text-white'
                            }`}>
                              {token.tokenNumber}
                            </div>
                            <div>
                              <p className="font-bold text-white flex items-center gap-2">
                                {token.customerName}
                                {token.isPriority && <span className="text-[8px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">FastPass</span>}
                              </p>
                              <p className="text-xs text-zinc-500 font-medium">Est. {token.estimatedWaitMins} mins wait</p>
                            </div>
                          </div>
                          
                          {idx === 0 && !currentlyServing && (
                            <button 
                              onClick={handleCallNext}
                              className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-black"
                            >
                              <Play size={16} fill="currentColor" />
                            </button>
                          )}
                        </GlassCard>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {tokens.length === 0 && (
                     <div className="py-20 text-center text-zinc-500 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/5">
                        <Users size={32} className="mx-auto mb-4 opacity-10" />
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-30">No one is waiting</p>
                     </div>
                  )}
                </div>
             </section>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--primary);
        }
      `}</style>
    </div>
  );
}

// Helper components
function Clock({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
