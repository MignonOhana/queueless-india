"use client";

import { useState, useEffect } from "react";
import { 
  Users, CheckCircle2, UserX, Play, 
  ChevronRight, LogOut, Loader2, 
  Building2, User, Clock, AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useStaffQueue, StaffContext } from "@/lib/useStaffQueue";
import { toast } from "sonner";
import GlassCard from "@/components/ui/GlassCard";

export default function StaffDashboard() {
  const router = useRouter();
  const [context, setContext] = useState<StaffContext | null>(null);
  const { waitingTokens, currentlyServing, stats } = useStaffQueue(context);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ql_staff_context");
    if (!saved) {
      router.push("/staff/login");
      return;
    }
    try {
      setContext(JSON.parse(saved));
    } catch (e) {
      router.push("/staff/login");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("ql_staff_context");
    router.push("/staff/login");
  };

  const callNext = async () => {
    if (!context) return;
    setIsProcessing(true);
    try {
      const resp = await fetch("/api/queue/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: context.business_id, queueId: context.queue_id }),
      });
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error);
      toast.success(`Called ${result.nextToken?.tokenNumber || "next"}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to call next token");
    } finally {
      setIsProcessing(false);
    }
  };

  const updateTokenStatus = async (status: 'SERVED' | 'NO_SHOW') => {
    if (!context || !currentlyServing) return;
    setIsProcessing(true);
    try {
      const resp = await fetch("/api/queue/update-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tokenId: currentlyServing.id, 
          status, 
          queueId: context.queue_id 
        }),
      });
      if (!resp.ok) {
        const result = await resp.json();
        throw new Error(result.error);
      }
      toast.success(status === 'SERVED' ? "Token served!" : "Marked as no-show");
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!context) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white selection:bg-primary/30 selection:text-primary pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
              <Building2 size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-widest leading-none mb-1">{context.business_name}</h1>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{context.dept_name} &bull; {context.staff_name}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Control: Left Col */}
          <div className="lg:col-span-8 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Currently Serving</h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Engine</span>
                </div>
              </div>

              <GlassCard className="p-12 text-center relative overflow-hidden min-h-[400px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {currentlyServing ? (
                    <motion.div
                      key="active"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-10"
                    >
                      <div className="absolute top-0 right-0 p-8">
                         <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest">In Service</span>
                      </div>

                      <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Token Number</p>
                        <h3 className="text-8xl md:text-9xl font-black tracking-tighter text-white font-display uppercase">{currentlyServing.tokenNumber}</h3>
                        <div className="flex items-center justify-center gap-2 text-zinc-400">
                          <User size={16} />
                          <span className="text-xl font-bold">{currentlyServing.customerName}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                        <button 
                          onClick={() => updateTokenStatus('SERVED')}
                          disabled={isProcessing}
                          className="w-full sm:w-auto px-10 py-5 bg-primary text-black rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                          <CheckCircle2 size={20} /> Mark as Served
                        </button>
                        <button 
                          onClick={() => updateTokenStatus('NO_SHOW')}
                          disabled={isProcessing}
                          className="w-full sm:w-auto px-10 py-5 bg-white/5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all"
                        >
                          <UserX size={20} /> Customer No-Show
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-12 space-y-8"
                    >
                      <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto text-zinc-700">
                        <Clock size={40} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black">Ready to serve</h3>
                        <p className="text-sm text-zinc-500 font-medium">Call the next person from your queue.</p>
                      </div>
                      <button 
                        onClick={callNext}
                        disabled={isProcessing || waitingTokens.length === 0}
                        className="px-12 py-6 bg-primary text-black rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 mx-auto shadow-xl shadow-primary/20 hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                      >
                        <Play size={20} fill="currentColor" /> Call Next Customer
                      </button>
                      {waitingTokens.length === 0 && (
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">No customers waiting right now</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </section>

            {/* Stats Grid */}
            <section className="grid grid-cols-2 md:grid-cols-3 gap-6">
               <StatCard label="Waiting" value={stats.totalWaiting} color="text-primary" icon={<Users size={14}/>} />
               <StatCard label="Served Today" value={stats.servedToday} color="text-emerald-400" icon={<CheckCircle2 size={14}/>} />
               <StatCard label="Live Status" value="Active" color="text-emerald-400" icon={<Play size={14}/>} />
            </section>
          </div>

          {/* Up Next: Right Col */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <section className="flex-1 flex flex-col">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 px-1">Up Next</h2>
              <GlassCard className="flex-1 p-6 space-y-4 min-h-[500px]">
                <div className="space-y-3">
                  {waitingTokens.length > 0 ? (
                    waitingTokens.slice(0, 8).map((t, i) => (
                      <div key={t.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center font-mono font-black text-xs text-primary">{t.tokenNumber}</div>
                          <div>
                            <p className="text-sm font-bold text-white leading-none mb-1">{t.customerName}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{i === 0 ? "Next in line" : `Waiting ${i+1}`}</p>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-zinc-800 group-hover:text-primary transition-colors" />
                      </div>
                    ))
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-black/20 rounded-3xl border border-dashed border-white/5">
                       <AlertCircle size={20} className="text-zinc-800 mb-2" />
                       <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">The queue is empty</p>
                    </div>
                  )}
                </div>
                {waitingTokens.length > 8 && (
                  <button className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                    +{waitingTokens.length - 8} more in queue
                  </button>
                )}
              </GlassCard>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: string | number; color: string; icon: React.ReactNode }) {
  return (
    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-1">
      <div className={`flex items-center gap-2 ${color}`}>
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</span>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}
