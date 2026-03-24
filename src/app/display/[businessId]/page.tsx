'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';

export default function DisplayBoard() {
  const params = useParams();
  const businessId = params?.businessId as string;
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
    if (!businessId) return;

    const fetchData = async () => {
      // Fetch business info
      const { data: biz } = await (supabase
        .from('businesses') as any)
        .select('*')
        .eq('id', businessId)
        .maybeSingle();
      if (biz) setBusiness(biz);

      // Fetch currently serving
      const { data: servingToken } = await (supabase
        .from('tokens') as any)
        .select('*')
        .eq('orgId', businessId)
        .eq('status', 'SERVING')
        .maybeSingle();
      setServing(servingToken);

      // Fetch next 5 waiting
      const { data: waiting } = await (supabase
        .from('tokens') as any)
        .select('*')
        .eq('orgId', businessId)
        .eq('status', 'WAITING')
        .order('createdAt', { ascending: true })
        .limit(5);
      setNextUp(waiting || []);
      setTotalWaiting(waiting?.length || 0);

      // Fetch served today count
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count: servedCount } = await (supabase
        .from('tokens') as any)
        .select('*', { count: 'exact', head: true })
        .eq('orgId', businessId)
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
        filter: `orgId=eq.${businessId}`,
      }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [businessId]);

  const isBusinessOpen = () => {
    if (!business) return false;
    const now = new Date();
    const dayOfWeek = now.getDay();
    const dayNamesShort = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const dayKey = dayNamesShort[dayOfWeek];

    if (business.op_hours_json?.[dayKey]) {
      const shifts = business.op_hours_json[dayKey];
      if (shifts === null) return false;

      const currentTime = now.getHours() * 60 + now.getMinutes();
      return shifts.some((shift: { open: string; close: string }) => {
        const [sH, sM] = shift.open.split(":").map(Number);
        const [eH, eM] = shift.close.split(":").map(Number);
        return currentTime >= sH * 60 + sM && currentTime <= eH * 60 + eM;
      });
    }
    return true; 
  };

  const getTomorrowOpening = () => {
    if (!business?.op_hours_json) return null;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayNamesShort = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const dayKey = dayNamesShort[tomorrow.getDay()];
    const shifts = business.op_hours_json[dayKey];
    if (!shifts || shifts.length === 0) return "Monday 09:00 AM"; // Default fallback
    return `${dayKey.charAt(0).toUpperCase() + dayKey.slice(1)} ${shifts[0].open}`;
  };

  const isOpen = isBusinessOpen();
  const isEmpty = !serving && nextUp.length === 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 flex items-center justify-between shadow-2xl relative z-10">
        <div className="flex items-center gap-6">
          {business?.logo_url ? (
            <img src={business.logo_url} alt={business.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-lg" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border-2 border-white/10">
              <span className="text-2xl font-black">Q</span>
            </div>
          )}
          <div>
            <h1 className="text-3xl font-black tracking-tight leading-none mb-1">{business?.name || 'QueueLess'}</h1>
            <p className="text-white/70 text-sm font-medium">{business?.location}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black tabular-nums tracking-tight">
            {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}
          </p>
          <p className="text-white/60 text-xs uppercase tracking-widest font-bold">
            {time.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {isEmpty ? (
            <motion.div 
              key="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden"
            >
               {/* Background Glows */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -z-10" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[80px] -z-10 animate-pulse" />

               <div className="text-center relative z-10">
                  <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(99,102,241,0.1)]">
                     <motion.div
                       animate={{ 
                         scale: [1, 1.1, 1],
                         rotate: [0, 5, -5, 0]
                       }}
                       transition={{ duration: 4, repeat: Infinity }}
                     >
                       <svg className="w-12 h-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                     </motion.div>
                  </div>

                  <h2 className="text-6xl font-black text-white mb-4 tracking-tighter">Queue is Empty</h2>
                  <p className="text-2xl text-slate-500 font-medium max-w-lg mx-auto mb-10">
                    No active tokens at the moment. Your turn will be called immediately upon joining.
                  </p>

                  <div className="flex items-center justify-center gap-4">
                     <span className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] border ${isOpen ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {isOpen ? "Now Open" : "Queue Closed"}
                     </span>
                     {!isOpen && (
                       <span className="text-slate-500 text-xs font-black uppercase tracking-widest">
                         Opening {getTomorrowOpening()}
                       </span>
                     )}
                  </div>
               </div>

               <div className="absolute bottom-12 text-center w-full">
                  <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.5em]">Scan to join via QR Code</p>
               </div>
            </motion.div>
          ) : (
            <motion.div 
              key="main-display"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col lg:flex-row"
            >
              {/* Currently Serving - Big */}
              <div className="flex-1 flex items-center justify-center p-12 bg-gradient-to-br from-indigo-950/20 via-transparent to-transparent">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={serving?.tokenNumber || 'none'}
                    initial={{ y: 50, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -50, opacity: 0, scale: 0.9 }}
                    className="text-center"
                  >
                    <p className="text-[12px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                      Current Token
                    </p>
                    <div className="relative">
                      <p className="text-[16rem] font-black leading-none tracking-tighter text-white drop-shadow-2xl">
                        {serving?.tokenNumber || '---'}
                      </p>
                      <div className="absolute -inset-12 bg-indigo-500/5 rounded-full blur-[100px] -z-10" />
                    </div>
                    {serving?.customerName && (
                      <p className="text-3xl text-slate-400 mt-6 font-bold tracking-tight">{serving.customerName}</p>
                    )}
                    {serving && (
                      <div className="mt-8 inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-lg">
                        <span className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]" />
                        <span className="text-emerald-400 font-black text-base uppercase tracking-widest">Please proceed to counter</span>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Next Up Panel */}
              <div className="lg:w-[450px] bg-white/[0.02] border-l border-white/5 p-10 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-500">
                    Coming Up Next
                  </h2>
                  <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{nextUp.length} Waiting</span>
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <AnimatePresence>
                    {nextUp.map((token, i) => (
                      <motion.div
                        key={token.id}
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex items-center justify-between p-6 rounded-[2rem] transition-all ${
                          i === 0
                            ? 'bg-indigo-600 text-white shadow-[0_20px_40px_rgba(79,70,229,0.2)]'
                            : 'bg-white/[0.03] border border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-6">
                          <span className={`text-4xl font-black ${i === 0 ? 'text-white' : 'text-indigo-400'}`}>
                            {token.tokenNumber}
                          </span>
                          <div>
                            <p className={`text-sm font-bold ${i === 0 ? 'text-white/80' : 'text-slate-500'}`}>
                              {token.customerName}
                            </p>
                            {i === 0 && <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mt-0.5">Ready to serve</p>}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Queue Stats Overlay */}
                <div className="mt-10 grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-6 text-center shadow-lg">
                    <p className="text-4xl font-black text-emerald-400">{servedToday}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">Served Total</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 text-center shadow-lg">
                    <p className="text-4xl font-black text-white">~{nextUp.length * (business?.serviceMins || 5)}m</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">Est. Wait</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="bg-white/5 border-t border-white/5 px-8 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
           <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">Live Feed Active</span>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest border-r border-white/10 pr-4">Powered by QueueLess India</span>
           <span className="text-[10px] text-indigo-500/50 font-black uppercase tracking-widest">queueless.in</span>
        </div>
      </footer>
    </div>
  );
}
