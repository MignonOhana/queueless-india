"use client";

import { use, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Clock, QrCode } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { QRCodeSVG } from 'qrcode.react';

// Reusable mock data if DB empty
const MOCK_DISPLAY = {
  name: "City Hospital",
  serving: "H-039",
  waiting: 8,
  estWait: 15,
  recent: ["H-038", "H-037", "H-036", "H-035"]
};

export default function TVDisplay({ params }: { params: Promise<{ orgId: string }> }) {
  const resolvedParams = use(params);
  const orgId = resolvedParams.orgId;
  const [data, setData] = useState(MOCK_DISPLAY);
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [highlight, setHighlight] = useState(false);

  // Link for the QR Code to scan (Points directly to Customer join UI)
  // For dev environment, we assume localhost:3000, in prod it will be window.location.origin
  const qrLink = typeof window !== "undefined" 
    ? `${window.location.origin}/customer/business/${orgId}`
    : `https://queueless.vercel.app/customer/business/${orgId}`;

  useEffect(() => {
    // Clock tick
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60000);

    // Initial Fetch
    const fetchRealData = async () => {
       const { data: qData, error } = await supabase.from('queues').select('*, businesses(name)').eq('id', orgId).maybeSingle();
       if (!error && qData) {
          setData({
             name: qData.businesses?.name || orgId,
             serving: qData.current_serving_token || "000",
             waiting: qData.total_waiting || 0,
             estWait: 15,
             recent: []
          });
       }
    };
    fetchRealData();

    // Supabase Real-Time Subscription
    const channel = supabase.channel(`public:queues:${orgId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'queues', filter: `id=eq.${orgId}` }, (payload) => {
         const newServing = payload.new.current_serving_token;
         
         setData(prev => {
            if (prev.serving !== newServing) {
              // Trigger highlight animation when new customer called
              setHighlight(true);
              setTimeout(() => setHighlight(false), 5000);
              
              const newRecent = [prev.serving, ...prev.recent].slice(0, 4);
              return { ...prev, serving: newServing, waiting: payload.new.total_waiting, recent: newRecent };
            }
            return { ...prev, waiting: payload.new.total_waiting };
         });
      })
      .subscribe();

    return () => {
       clearInterval(timer);
       supabase.removeChannel(channel);
    };
  }, [orgId]);

  return (
    <div className="h-screen w-screen bg-slate-950 font-sans text-white overflow-hidden flex flex-col selection:bg-indigo-500/30">
      
      {/* Top Header Bar */}
      <header className="h-24 bg-slate-900 border-b border-white/10 px-10 flex items-center justify-between shrink-0 shadow-lg">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
               <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
               <h1 className="text-3xl font-black tracking-tight">{data.name}</h1>
               <p className="text-slate-400 font-medium flex items-center gap-2">Live Queue <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" /></p>
            </div>
         </div>
         <div className="text-right">
            <div className="text-4xl font-extrabold tracking-tight font-mono">{time}</div>
            <div className="text-slate-400 font-bold uppercase tracking-widest text-sm text-right mt-1">QueueLess India</div>
         </div>
      </header>

      {/* Main Display Grid */}
      <main className="flex-1 grid grid-cols-12 gap-8 p-10 bg-[radial-gradient(ellipse_at_top,#1e1b4b_0%,transparent_70%)] relative">
         {/* Left Side: Current Serving */}
         <div className="col-span-8 flex flex-col gap-8">
            <motion.div 
               animate={{ 
                 scale: highlight ? [1, 1.05, 1] : 1,
                 borderColor: highlight ? ['rgba(255,255,255,0.1)', 'rgba(99,102,241,0.8)', 'rgba(255,255,255,0.1)'] : 'rgba(255,255,255,0.1)',
                 boxShadow: highlight ? ['none', '0 0 50px rgba(99,102,241,0.3)', 'none'] : 'none'
               }}
               transition={{ duration: 0.8 }}
               className="flex-1 bg-slate-900/80 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl flex flex-col items-center justify-center p-12 relative overflow-hidden"
            >
               {highlight && (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="absolute inset-0 bg-indigo-500/10 z-0 pointer-events-none"
                 />
               )}
               <p className="text-slate-400 font-bold text-3xl uppercase tracking-[0.2em] mb-4 z-10">Now Serving</p>
               <h2 className="text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-100 to-indigo-300 leading-none tracking-tighter z-10 font-mono drop-shadow-2xl">
                 {data.serving}
               </h2>
               {highlight && (
                 <p className="absolute bottom-12 font-bold text-2xl text-indigo-400 animate-pulse tracking-widest uppercase">Please approach counter 1</p>
               )}
            </motion.div>

            {/* Bottom Row inside left: Wait stats */}
            <div className="h-40 grid grid-cols-2 gap-8 shrink-0">
               <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2rem] border border-white/5 flex items-center justify-between px-10">
                  <div>
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-1">Waiting in line</p>
                     <p className="text-5xl font-black font-mono">{data.waiting} <span className="text-2xl text-slate-500">ppl</span></p>
                  </div>
                  <Activity size={48} className="text-emerald-500/20" />
               </div>
               <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2rem] border border-white/5 flex items-center justify-between px-10">
                  <div>
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-1">Est. Wait Time</p>
                     <p className="text-5xl font-black font-mono">{data.estWait} <span className="text-2xl text-slate-500">min</span></p>
                  </div>
                  <Clock size={48} className="text-amber-500/20" />
               </div>
            </div>
         </div>

         {/* Right Side: QR Code + Recent History */}
         <div className="col-span-4 flex flex-col gap-8">
            
            {/* The QR Code Scan Target */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center shadow-2xl shadow-indigo-500/20 border border-white/20 shrink-0 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 blur-[50px] rounded-full" />
               <QrCode size={40} className="text-white/80 mb-6" />
               <h3 className="text-2xl font-black mb-2 text-white drop-shadow-md">Skip the Waiting Room</h3>
               <p className="text-indigo-100 font-medium mb-8">Scan to join queue on your phone & wait anywhere.</p>
               
               <div className="bg-white p-6 rounded-3xl shadow-2xl hover:scale-105 transition-transform">
                  <QRCodeSVG value={qrLink} size={200} level="H" includeMargin={false} fgColor="#0F172A" />
               </div>
            </div>

            {/* Recently Called List */}
            <div className="flex-1 bg-slate-900/50 backdrop-blur-xl rounded-[3rem] border border-white/5 p-8 flex flex-col overflow-hidden relative">
               <p className="text-slate-400 font-bold text-lg uppercase tracking-widest mb-6">Recently Called</p>
               <div className="flex-1 flex flex-col gap-4">
                  <AnimatePresence>
                     {data.recent.map((token, i) => (
                        <motion.div 
                          key={token + i}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-slate-800/50 border border-white/5 rounded-2xl p-6 flex justify-between items-center"
                        >
                           <span className="text-3xl font-bold font-mono text-slate-300">{token}</span>
                           <span className="text-emerald-500 font-bold text-sm tracking-widest uppercase">Finished</span>
                        </motion.div>
                     ))}
                  </AnimatePresence>
                  {data.recent.length === 0 && (
                     <div className="flex-1 flex items-center justify-center text-slate-600 font-bold tracking-widest uppercase">
                        No recent customers
                     </div>
                  )}
               </div>
               {/* Fading bottom edge */}
               <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none rounded-b-[3rem]" />
            </div>

         </div>
      </main>
    </div>
  );
}
