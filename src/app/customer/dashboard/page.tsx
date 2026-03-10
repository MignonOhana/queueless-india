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
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/5 border-t-[#00F5A0] rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Loading your world...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-32">
       
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

       <main className="px-6 space-y-8">
          
          {/* ACTIVE TOKENS SECTION */}
          <section>
             <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-[#00F5A0] flex items-center gap-2">
                  <Activity size={12} /> Active Queues
                </h2>
                <span className="bg-[#00F5A0]/10 text-[#00F5A0] text-[10px] px-2 py-0.5 rounded-md font-black">
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
                      onClick={() => router.push(`/track/${token.id}`)}
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
                                <h3 className="text-xl font-black tracking-tight mb-2 group-hover:text-[#00F5A0] transition-colors">
                                   {token.businesses?.name}
                                </h3>
                                <div className="flex items-center gap-3 text-zinc-400 text-xs font-bold">
                                   <p className="flex items-center gap-1"><Ticket size={14} className="text-[#00F5A0]" /> {token.tokenNumber}</p>
                                   <p className="flex items-center gap-1"><Clock size={14} /> {token.status}</p>
                                </div>
                             </div>
                             <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:bg-[#00F5A0] group-hover:text-black transition-all">
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
                      <Link href="/home" className="mt-4 text-[#00F5A0] text-[10px] font-black uppercase tracking-widest hover:underline">
                         Find a business to join &rarr;
                      </Link>
                   </GlassCard>
                )}
             </div>
          </section>

          {/* QUICK DISCOVERY */}
          <section className="bg-gradient-to-br from-[#00F5A0]/10 to-transparent p-8 rounded-[2.5rem] border border-[#00F5A0]/10">
             <h3 className="text-xl font-black tracking-tighter mb-2">Need something else?</h3>
             <p className="text-zinc-500 text-sm font-medium mb-6 leading-relaxed">Join a new queue near you and save time today.</p>
             <Link 
                href="/home"
                className="inline-flex items-center gap-2 bg-[#00F5A0] text-black px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[0_0_30px_rgba(0,245,160,0.2)] hover:brightness-110 active:scale-95 transition-all"
             >
                Discovery <Search size={14} />
             </Link>
          </section>

          {/* HISTORY SECTION */}
          <section>
             <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 px-2">Recent History</h2>
             <div className="space-y-3">
                {historyTokens.map(token => (
                  <div 
                    key={token.id}
                    className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-between"
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
                {historyTokens.length === 0 && (
                  <p className="text-center py-8 text-xs font-bold text-zinc-700 uppercase tracking-widest">History will appear here</p>
                )}
             </div>
          </section>

       </main>

       {/* FLOATING ACTION BOTTOM BAR */}
       <nav className="fixed bottom-8 inset-x-6 z-50">
          <div className="max-w-md mx-auto h-20 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] flex items-center justify-around px-2 shadow-2xl shadow-black/40">
             <Link href="/home" className="flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors">
                <Search size={20} />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Explore</span>
             </Link>
             <Link href="/customer/dashboard" className="flex flex-col items-center gap-1 text-[#00F5A0]">
                <Ticket size={20} />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Tokens</span>
             </Link>
             <Link href="/customer/scanner" className="w-12 h-12 rounded-full bg-[#00F5A0] flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,245,160,0.4)] active:scale-90 transition-transform -translate-y-2">
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
