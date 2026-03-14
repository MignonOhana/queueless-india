'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, Clock, History, Search, ChevronRight, 
  MapPin, LogOut, User, Bell, Star, ArrowRight, Activity, QrCode
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/ui/GlassCard';
import CountUp from '@/components/ui/CountUp';
import LiveIndicator from '@/components/ui/LiveIndicator';

export default function CustomerDashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [activeTokens, setActiveTokens] = useState<any[]>([]);
  const [historyTokens, setHistoryTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/customer');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      
      // Fetch Active Tokens
      const { data: active } = await supabase
        .from('tokens')
        .select('*, businesses(name, address, category)')
        .eq('userId', user.id)
        .in('status', ['WAITING', 'SERVING'])
        .order('createdAt', { ascending: false });

      // Fetch History
      const { data: history } = await supabase
        .from('tokens')
        .select('*, businesses(name, avg_rating)')
        .eq('userId', user.id)
        .in('status', ['SERVED', 'CANCELLED'])
        .order('createdAt', { ascending: false })
        .limit(10);

      setActiveTokens(active || []);
      setHistoryTokens(history || []);
      setLoading(false);
    };

    fetchData();

    // Realtime subscription for status changes
    const channel = supabase
      .channel(`customer_tokens_${user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tokens',
        filter: `userId=eq.${user.id}`
      }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, router]);

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
       <header className="px-6 pt-12 pb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tighter">My Tokens</h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
               Logged in as {user?.phone || 'Guest'}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <LogOut size={18} />
          </button>
       </header>

        <main className="px-6 flex-1 flex flex-col">
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
                <h2 className="text-3xl font-black mb-4 tracking-tight leading-tight">You haven't joined<br/>any queues yet</h2>
                <p className="text-zinc-500 text-sm font-medium mb-10 max-w-[280px] leading-relaxed">
                   Find a nearby hospital, bank, or temple and skip the wait with a digital token.
                </p>
                <div className="space-y-4 w-full max-w-xs">
                   <button 
                     onClick={() => router.push('/home')}
                     className="w-full btn-primary py-5 flex items-center justify-center gap-3 text-sm"
                   >
                      <Search size={18} /> Find a Queue Near Me
                   </button>
                   <button 
                     onClick={() => router.push('/customer/scanner')}
                     className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                   >
                      <QrCode size={18} /> Scan QR Code
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
                          <motion.div 
                            key={token.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => router.push(`/customer/queue/${token.orgId}/${token.id}`)}
                            className="cursor-pointer"
                          >
                             <GlassCard className="relative overflow-hidden group">
                                {token.status === 'SERVING' && (
                                   <div className="absolute top-0 right-0 px-4 py-1 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg animate-pulse">
                                      Now Serving
                                   </div>
                                )}
                                
                                <div className="flex items-start justify-between">
                                   <div>
                                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">
                                         {token.businesses?.category || 'Service'}
                                      </span>
                                      <h3 className="text-xl font-black tracking-tight mb-2 group-hover:text-primary transition-colors">
                                         {token.businesses?.name}
                                      </h3>
                                      <div className="flex items-center gap-3 text-zinc-400 text-xs font-bold">
                                         <p className="flex items-center gap-1"><Ticket size={14} className="text-primary" /> {token.tokenNumber}</p>
                                         <p className="flex items-center gap-1"><Clock size={14} /> {token.status}</p>
                                      </div>
                                   </div>
                                   <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:bg-primary group-hover:text-black transition-all">
                                      <ChevronRight size={20} />
                                   </div>
                                </div>
                             </GlassCard>
                          </motion.div>
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
                           <div 
                             key={token.id}
                             onClick={() => router.push(`/customer/queue/${token.orgId}/${token.id}`)}
                             className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                           >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${token.status === 'SERVED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                  <History size={18} />
                                </div>
                                <div>
                                  <h4 className="font-black text-sm">{token.businesses?.name}</h4>
                                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">
                                      {token.status} • {new Date(token.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                  </p>
                                </div>
                            </div>
                            <Link 
                                href={`/b/${token.orgId}`}
                                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white"
                            >
                                Rate
                            </Link>
                          </div>
                        ))}
                    </div>
                  </section>
                )}
             </div>
           )}
        </main>

       {/* FLOATING ACTION BOTTOM BAR */}
       <nav className="fixed bottom-8 inset-x-6 z-50">
          <div className="max-w-md mx-auto h-20 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] flex items-center justify-around px-2 shadow-2xl shadow-black/40">
             <Link href="/home" className="flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors">
                <Search size={20} />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Explore</span>
             </Link>
             <Link href="/customer/dashboard" className="flex flex-col items-center gap-1 text-primary">
                <Ticket size={20} />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Tokens</span>
             </Link>
             <Link href="/customer/scanner" className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,245,160,0.4)] active:scale-90 transition-transform -translate-y-2">
                <QrCode size={24} />
             </Link>
             <Link href="/customer/profile" className="flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors">
                <User size={20} />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Profile</span>
             </Link>
             <Link href="/customer/alerts" className="flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors">
                <Bell size={20} />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Alerts</span>
             </Link>
          </div>
       </nav>
    </div>
  );
}
