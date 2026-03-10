'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

export default function DisplayBoard({ params }: { params: { businessId: string } }) {
  const supabase = createClient();
  const [business, setBusiness] = useState<any>(null);
  const [serving, setServing] = useState<any>(null);
  const [nextUp, setNextUp] = useState<any[]>([]);
  const [servedToday, setServedToday] = useState(0);
  const [totalWaiting, setTotalWaiting] = useState(0);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!params.businessId) return;

    const fetchData = async () => {
      // Fetch business info
      const { data: biz } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', params.businessId)
        .maybeSingle();
      if (biz) setBusiness(biz);

      // Fetch currently serving
      const { data: servingToken } = await supabase
        .from('tokens')
        .select('*')
        .eq('orgId', params.businessId)
        .eq('status', 'SERVING')
        .maybeSingle();
      setServing(servingToken);

      // Fetch next 5 waiting
      const { data: waiting } = await supabase
        .from('tokens')
        .select('*')
        .eq('orgId', params.businessId)
        .eq('status', 'WAITING')
        .order('createdAt', { ascending: true })
        .limit(5);
      setNextUp(waiting || []);
      setTotalWaiting(waiting?.length || 0);

      // Fetch served today count
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count: servedCount } = await supabase
        .from('tokens')
        .select('*', { count: 'exact', head: true })
        .eq('orgId', params.businessId)
        .eq('status', 'SERVED')
        .gte('servedAt', todayStart.toISOString());
      setServedToday(servedCount || 0);
    };

    fetchData();

    // Realtime subscription
    const channel = supabase
      .channel(`display-${params.businessId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tokens',
        filter: `orgId=eq.${params.businessId}`,
      }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [params.businessId]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">{business?.name || 'QueueLess'}</h1>
          <p className="text-white/70 text-sm">{business?.location}</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black tabular-nums">
            {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Kolkata' })}
          </p>
          <p className="text-white/60 text-xs uppercase tracking-widest">
            {time.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0">
        {/* Currently Serving - Big */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-emerald-950/30 to-transparent">
          <AnimatePresence mode="wait">
            <motion.div
              key={serving?.tokenNumber || 'none'}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-4">
                Now Serving
              </p>
              <div className="relative">
                <p className="text-[12rem] font-black leading-none tracking-tighter text-white">
                  {serving?.tokenNumber || '---'}
                </p>
                <div className="absolute -inset-8 bg-emerald-500/5 rounded-3xl blur-3xl -z-10" />
              </div>
              {serving?.customerName && (
                <p className="text-2xl text-slate-400 mt-4 font-medium">{serving.customerName}</p>
              )}
              {serving && (
                <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-400 font-bold text-sm uppercase tracking-widest">Please proceed to counter</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next Up Panel */}
        <div className="lg:w-96 bg-white/[0.02] border-l border-white/5 p-8">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">
            Next Up
          </h2>
          <div className="space-y-3">
            {nextUp.length === 0 && (
              <p className="text-slate-600 text-center py-8">No one waiting</p>
            )}
            {nextUp.map((token, i) => (
              <motion.div
                key={token.id}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center justify-between p-4 rounded-2xl ${
                  i === 0
                    ? 'bg-indigo-500/10 border border-indigo-500/20'
                    : 'bg-white/[0.02] border border-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-3xl font-black ${i === 0 ? 'text-indigo-400' : 'text-slate-500'}`}>
                    {token.tokenNumber}
                  </span>
                  <span className="text-sm text-slate-500">{token.customerName}</span>
                </div>
                {i === 0 && (
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Next</span>
                )}
              </motion.div>
            ))}
          </div>

          {/* Queue Stats */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-emerald-400">{servedToday}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Served Today</p>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-blue-400">{nextUp.length}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Waiting</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-white">~{nextUp.length * (business?.serviceMins || 5)}m</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Est. Wait</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/[0.02] border-t border-white/5 px-8 py-3 flex items-center justify-between">
        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Powered by QueueLess India</span>
        <span className="text-[10px] text-slate-600 font-bold">queueless.in</span>
      </footer>
    </div>
  );
}
