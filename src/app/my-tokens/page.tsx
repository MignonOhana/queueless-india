"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Ticket, Clock, Building2, CheckCircle, Loader } from "lucide-react";

type TabType = "active" | "past";

interface TokenRecord {
  id: string;
  tokenNumber: string;
  orgId: string;
  status: string;
  createdAt: string;
  estimatedWaitMins: number;
  businessName?: string;
}

export default function MyTokensPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [activeTokens, setActiveTokens] = useState<TokenRecord[]>([]);
  const [pastTokens, setPastTokens] = useState<TokenRecord[]>([]);
  const [fetchingTokens, setFetchingTokens] = useState(true);

  useEffect(() => {
    if (loading) return;
    
    const handleSync = () => {
      if (isAuthenticated) {
        fetchTokens();
      } else {
        fetchGuestTokens();
      }
    };

    handleSync();
    
    window.addEventListener('online', handleSync);
    return () => window.removeEventListener('online', handleSync);
  }, [user, isAuthenticated, loading]);

  const fetchGuestTokens = () => {
    setFetchingTokens(true);
    try {
      const guestSession = localStorage.getItem('queueless_guest_session');
      if (guestSession) {
        const session = JSON.parse(guestSession);
        if (session.activeTokenId) {
          const guestToken: TokenRecord = {
            id: session.activeTokenId,
            tokenNumber: session.activeTokenNumber,
            orgId: session.orgId || 'unknown',
            status: 'WAITING',
            createdAt: new Date().toISOString(),
            estimatedWaitMins: 5,
            businessName: session.businessName || 'Your Queue'
          };
          setActiveTokens([guestToken]);
        }
      }
    } catch (e) {
      console.error("Guest fetch error", e);
    } finally {
      setFetchingTokens(false);
    }
  };

  const fetchTokens = async () => {
    if (!user) return;
    setFetchingTokens(true);
    try {
      // Try cache first if offline
      if (!navigator.onLine) {
        const cached = localStorage.getItem(`tokens_cache_${user.id}`);
        if (cached) {
          const { active, past } = JSON.parse(cached);
          setActiveTokens(active);
          setPastTokens(past);
          setFetchingTokens(false);
          return;
        }
      }

      const { data: tokens, error } = await supabase
        .from("tokens")
        .select("*")
        .eq("userId", user.id)
        .order("createdAt", { ascending: false })
        .limit(50);

      if (error) throw error;

      const enriched: TokenRecord[] = await Promise.all(
        (tokens || []).map(async (t: any) => {
          const { data: biz } = await supabase
            .from("businesses")
            .select("name")
            .eq("id", t.orgId)
            .maybeSingle();
          return { ...t, businessName: biz?.name || t.orgId };
        })
      );

      const active = enriched.filter(t => ["WAITING", "SERVING"].includes(t.status));
      const past = enriched.filter(t => ["SERVED", "CANCELLED"].includes(t.status));
      
      setActiveTokens(active);
      setPastTokens(past);

      // Cache for offline
      localStorage.setItem(`tokens_cache_${user.id}`, JSON.stringify({ active, past }));
    } catch (err) {
      console.error("Error fetching tokens:", err);
    } finally {
      setFetchingTokens(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
    WAITING: { label: "Waiting", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400 animate-pulse" },
    SERVING: { label: "Serving Now", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400 animate-pulse" },
    SERVED: { label: "Completed", color: "text-slate-400 bg-white/5 border-white/10", dot: "bg-slate-500" },
    CANCELLED: { label: "Cancelled", color: "text-rose-400 bg-rose-500/10 border-rose-500/20", dot: "bg-rose-500" },
  };

  const TokenCard = ({ token }: { token: TokenRecord }) => {
    const cfg = statusConfig[token.status] || statusConfig.WAITING;
    const isActive = ["WAITING", "SERVING"].includes(token.status);
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => isActive && router.push(`/track/${token.tokenNumber}`)}
        className={`bg-[#111118] border border-white/5 rounded-2xl p-5 flex items-center gap-4 transition-all ${isActive ? "hover:border-[#00F5A0]/30 hover:bg-[#111118]/80 cursor-pointer active:scale-[0.98]" : ""}`}
      >
        {/* Token Icon */}
        <div className="w-12 h-12 rounded-xl bg-[#00F5A0]/10 border border-[#00F5A0]/20 flex flex-col items-center justify-center flex-shrink-0">
          <span className="text-[9px] font-black text-[#00F5A0] uppercase tracking-wide leading-none">{token.tokenNumber.split("-")[0]}</span>
          <span className="text-lg font-black text-white leading-tight">{token.tokenNumber.split("-")[1] || token.tokenNumber}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm truncate">{token.businessName}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
              {cfg.label}
            </div>
          </div>
          <p className="text-slate-500 text-[11px] font-medium mt-1 flex items-center gap-1">
            <Clock size={10} /> {formatDate(token.createdAt)}
          </p>
        </div>

        {/* Arrow or Checkmark */}
        {isActive ? (
          <div className="text-indigo-400 flex-shrink-0">
            <ChevronLeft size={18} className="rotate-180" />
          </div>
        ) : token.status === "SERVED" ? (
          <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
        ) : null}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-sans">
      {/* Background */}
      <div className="fixed top-0 inset-x-0 h-[40vh] bg-gradient-to-b from-[#00F5A0]/10 via-transparent to-transparent pointer-events-none" />

      <main className="relative z-10 max-w-lg mx-auto px-5 pt-12 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white">My Tokens</h1>
            <p className="text-slate-400 text-sm font-medium">Your queue history</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#111118] border border-white/5 rounded-2xl p-1.5 mb-8">
          {(["active", "past"] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === tab ? "bg-[#00F5A0] text-[#0A0A0F] shadow-lg shadow-[#00F5A0]/20" : "text-slate-400 hover:text-white"}`}
            >
              {tab === "active" ? `Active${activeTokens.length > 0 ? ` (${activeTokens.length})` : ""}` : "Past"}
            </button>
          ))}
        </div>

        {/* Content */}
        {fetchingTokens ? (
          <div className="flex justify-center py-20">
            <Loader size={28} className="animate-spin text-indigo-400" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "active" && (
              <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {activeTokens.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Ticket size={28} className="text-slate-600" />
                    </div>
                    <p className="text-slate-400 font-medium">No active tokens</p>
                    <p className="text-slate-600 text-sm mt-1">Join a queue at a nearby business!</p>
                    <button
                      onClick={() => router.push("/home")}
                      className="mt-6 px-6 py-3 bg-indigo-600 text-white font-bold rounded-full text-sm hover:bg-indigo-500 transition-colors"
                    >
                      Browse Businesses
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {activeTokens.map(t => <TokenCard key={t.id} token={t} />)}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "past" && (
              <motion.div key="past" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {pastTokens.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Building2 size={28} className="text-slate-600" />
                    </div>
                    <p className="text-slate-400 font-medium">No past visits yet</p>
                    <p className="text-slate-600 text-sm mt-1">Your completed tokens will appear here</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {pastTokens.slice(0, 20).map(t => <TokenCard key={t.id} token={t} />)}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
