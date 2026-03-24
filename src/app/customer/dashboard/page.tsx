import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Search, LogOut, User, ArrowRight, Activity, QrCode, LayoutDashboard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Database } from '@/types/database';

const supabase = createClient();
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/ui/GlassCard';
import TokenCard from '@/components/Customer/TokenCard';
import { getAllGuestSessions } from '@/hooks/useGuestSession';

type Token = Database['public']['Tables']['tokens']['Row'] & {
  businesses?: {
    name: string;
    category: string;
    serviceMins: number | null;
    avg_rating?: number | null;
  } | null;
};

export default function CustomerDashboard() {
  const { user, userRole, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTokens, setActiveTokens] = useState<Token[]>([]);
  const [historyTokens, setHistoryTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    // Only show loader if we don't have tokens already
    if (activeTokens.length === 0 && historyTokens.length === 0) setLoading(true);
    
    let active: Token[] = [];
    let history: Token[] = [];

    if (user) {
      const { data: act } = await supabase
        .from('tokens')
        .select('*, businesses(name, address, category, serviceMins)')
        .eq('userId', user.id)
        .in('status', ['WAITING', 'SERVING'])
        .order('createdAt', { ascending: false });

      const { data: hist } = await supabase
        .from('tokens')
        .select('*, businesses(name, avg_rating)')
        .eq('userId', user.id)
        .in('status', ['SERVED', 'CANCELLED'])
        .order('createdAt', { ascending: false })
        .limit(10);
        
      active = (act as any) || [];
      history = (hist as any) || [];
    } else {
      const guestSessions = getAllGuestSessions();
      const tokenIds = guestSessions.map(s => s.activeTokenId).filter(Boolean) as string[];
      if (tokenIds.length > 0) {
        const { data: act } = await supabase
          .from('tokens')
          .select('*, businesses(name, address, category, serviceMins)')
          .in('id', tokenIds)
          .in('status', ['WAITING', 'SERVING'])
          .order('createdAt', { ascending: false });

        const { data: hist } = await supabase
          .from('tokens')
          .select('*, businesses(name, avg_rating)')
          .in('id', tokenIds)
          .in('status', ['SERVED', 'CANCELLED'])
          .order('createdAt', { ascending: false });

        active = (act as any) || [];
        history = (hist as any) || [];
      }
    }

    setActiveTokens(active);
    setHistoryTokens(history);
    setLoading(false);
  }, [user, activeTokens.length, historyTokens.length]);

  useEffect(() => {
    if (authLoading) return;
    fetchData();

    let channel: any;

    if (user) {
      channel = supabase
        .channel(`customer_tokens_${user.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'tokens',
          filter: `userId=eq.${user.id}`
        }, (payload: any) => {
          const updatedToken = payload.new as Token;
          setActiveTokens(prev => prev.map(t => t.id === updatedToken.id ? { ...t, ...updatedToken } : t));
          // If status moved to SERVED or CANCELLED, refetch to update sections
          if (['SERVED', 'CANCELLED'].includes(updatedToken.status)) {
            fetchData();
          }
        })
        .subscribe();
    } else {
      // Guest realtime subscription
      const guestSessions = getAllGuestSessions();
      const tokenIds = guestSessions.map(s => s.activeTokenId).filter(Boolean) as string[];
      
      if (tokenIds.length > 0) {
        channel = supabase
          .channel(`guest_tokens_${tokenIds[0]}`) // Simple unique group
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'tokens',
            // No in filter support in realtime yet, using generic and then javascript filter
          }, (payload: any) => {
            const updatedToken = payload.new as Token;
            if (tokenIds.includes(updatedToken.id)) {
              setActiveTokens(prev => prev.map(t => t.id === updatedToken.id ? { ...t, ...updatedToken } : t));
              if (['SERVED', 'CANCELLED'].includes(updatedToken.status)) {
                fetchData();
              }
            }
          })
          .subscribe();
      }
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [user, authLoading, fetchData]);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/5 border-t-primary rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Loading your world...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white pb-32">
       
        {/* HEADER */}
        <header className="px-6 pt-12 pb-8 flex items-center justify-between sticky top-0 bg-background/80 bg-opacity-95 z-40 border-b border-white/5">
           <div>
             <h1 className="text-3xl font-black tracking-tighter">My Tokens</h1>
             <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
                Logged in as {user?.phone || 'Guest'}
             </p>
           </div>
           
           <div className="flex items-center gap-3">
              {/* Role Switcher for Business Owners */}
              {userRole === "business_owner" && (
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 hover:bg-indigo-500/20 transition-all"
                  title="Switch to Business Mode"
                >
                  <LayoutDashboard size={18} />
                </button>
              )}
              
              {!user ? (
                 <button 
                   onClick={() => router.push('/login')}
                   className="px-4 py-2 rounded-xl bg-primary/20 border border-primary/30 text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/30 transition-colors flex items-center gap-2"
                 >
                   Sign In to Sync
                 </button>
              ) : (
                <button 
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              )}
           </div>
        </header>

          <main className="px-6 flex-1 flex flex-col py-8">
            {!user && activeTokens.length === 0 && historyTokens.length === 0 && (
               <div className="mb-6 bg-primary/5 border border-primary/20 p-4 rounded-2xl flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                     <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm mb-1">You are currently a Guest</h3>
                    <p className="text-zinc-400 text-xs leading-relaxed mb-3">
                       Sign in to securely sync your tokens across all devices and skip the lines faster.
                    </p>
                    <button 
                       onClick={() => router.push('/login')}
                       className="text-primary text-xs font-black uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1"
                    >
                       Create Free Account <ArrowRight size={14} />
                    </button>
                  </div>
               </div>
            )}

            {activeTokens.length === 0 && historyTokens.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center py-12"
              >
                 <div className="w-32 h-32 bg-primary/10 rounded-[3rem] flex items-center justify-center mb-8 border border-primary/20 relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                    <Ticket size={64} className="text-primary relative z-10" />
                 </div>
                 <h2 className="text-3xl font-black mb-4 tracking-tight leading-tight">You haven&apos;t joined<br/>any queues yet</h2>
                 <p className="text-zinc-500 text-sm font-medium mb-10 max-w-[280px] leading-relaxed">
                    Find a nearby hospital, bank, or temple and skip the wait with a digital token.
                 </p>
                 <div className="grid grid-cols-2 gap-3 w-full max-w-[340px]">
                    <button 
                      onClick={() => router.push('/home')}
                      className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-primary hover:bg-primary/20 transition-colors"
                    >
                       <Search size={24} />
                       <span className="text-xs font-black uppercase tracking-widest">Find Queue</span>
                    </button>
                    <button 
                      onClick={() => router.push('/customer/scanner')}
                      className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                    >
                       <QrCode size={24} className="text-emerald-400" />
                       <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Scan QR</span>
                    </button>
                    <button 
                      onClick={() => {
                        localStorage.setItem("ql_filter_category", "Hospital");
                        router.push('/home');
                      }}
                      className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-start gap-3 hover:bg-white/10 transition-colors col-span-2"
                    >
                       <span className="text-2xl">🏥</span>
                       <span className="text-sm font-bold text-zinc-300">Hospitals & Clinics</span>
                    </button>
                    <button 
                      onClick={() => {
                        localStorage.setItem("ql_filter_category", "Bank");
                        router.push('/home');
                      }}
                      className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-start gap-3 hover:bg-white/10 transition-colors col-span-2"
                    >
                       <span className="text-2xl">🏦</span>
                       <span className="text-sm font-bold text-zinc-300">Banks & Post Offices</span>
                    </button>
                 </div>
              </motion.div>
            ) : (
              <div className="space-y-8">
                 {/* ACTIVE TOKENS SECTION */}
                 <section>
                    <div className="flex items-center justify-between mb-4 px-2">
                       <h2 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                         <Activity size={12} /> Active Queues
                       </h2>
                       <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-md font-black">
                          {activeTokens.length} LIVE
                       </span>
                    </div>

                    <div className="space-y-4">
                       {activeTokens.length > 0 ? (
                         activeTokens.map(token => (
                           <TokenCard 
                            key={token.id} 
                            token={token} 
                            onClick={() => router.push(`/customer/queue/${token.orgId}/${token.id}`)}
                           />
                         ))
                       ) : (
                          <GlassCard className="py-12 flex flex-col items-center text-center opacity-50 border-dashed">
                             <Ticket size={48} className="text-zinc-700 mb-4" />
                             <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">No active tokens</p>
                             <Link href="/home" className="mt-4 text-primary text-[10px] font-black uppercase tracking-widest hover:underline">
                                Find a business to join &rarr;
                             </Link>
                          </GlassCard>
                       )}
                    </div>
                 </section>

                 {/* QUICK DISCOVERY (only if active tokens exist) */}
                 {activeTokens.length > 0 && (
                   <section className="bg-gradient-to-br from-primary/10 to-transparent p-8 rounded-brand border border-primary/10">
                     <h3 className="text-xl font-black tracking-tighter mb-2">Need something else?</h3>
                     <p className="text-zinc-500 text-sm font-medium mb-6 leading-relaxed">Join a new queue near you and save time today.</p>
                     <Link 
                         href="/home"
                         className="btn-primary"
                     >
                         Discovery <Search size={14} />
                     </Link>
                   </section>
                 )}

                 {/* HISTORY SECTION */}
                 {historyTokens.length > 0 && (
                   <section>
                     <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 px-2">Recent History</h2>
                     <div className="space-y-3">
                         {historyTokens.map(token => (
                            <TokenCard 
                              key={token.id} 
                              token={token} 
                              isHistory 
                              onClick={() => router.push(`/customer/queue/${token.orgId}/${token.id}`)}
                            />
                         ))}
                     </div>
                   </section>
                 )}
              </div>
            )}
         </main>
    </div>
  );
}
