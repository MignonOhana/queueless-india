'use client';

import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import StatusBadge from './StatusBadge';

interface TokenCardProps {
  tokenNumber: string;
  businessName: string;
  counterName?: string;
  date: string;
  status: any;
  trackUrl: string;
}

export default function TokenCard({ 
  tokenNumber, 
  businessName, 
  counterName = 'General', 
  date, 
  status,
  trackUrl
}: TokenCardProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative w-full max-w-sm mx-auto bg-[#0D0D15] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
    >
      {/* Upper Part */}
      <div className="p-8 pb-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Business</p>
            <h3 className="text-xl font-bold text-white mb-1">{businessName}</h3>
            <p className="text-xs text-zinc-400">{date}</p>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="flex items-center justify-between gap-8">
            <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Token Number</p>
                <h2 className="text-7xl font-serif italic font-black text-[#00F5A0] tracking-tighter">
                    {tokenNumber}
                </h2>
            </div>
            <div className="shrink-0 bg-white p-2 rounded-2xl shadow-xl">
               <div className="w-20 s-20 opacity-90">
                 <QRCodeSVG value={trackUrl} size={80} level="H" />
               </div>
            </div>
        </div>
      </div>

      {/* Perforation */}
      <div className="relative h-4 flex items-center mb-4">
        <div className="absolute left-0 -translate-x-1/2 w-6 h-6 bg-[#0A0A0F] rounded-full border border-white/10" />
        <div className="flex-1 border-t-2 border-dashed border-white/10 mx-4" />
        <div className="absolute right-0 translate-x-1/2 w-6 h-6 bg-[#0A0A0F] rounded-full border border-white/10" />
      </div>

      {/* Lower Part */}
      <div className="px-8 pb-8 pt-2 flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Counter</p>
          <p className="text-sm font-bold text-white uppercase">{counterName}</p>
        </div>
        <div className="text-right">
            <p className="text-[10px] font-zinc-500 uppercase font-black mb-1">Scan to Track</p>
            <p className="text-[10px] text-zinc-400 font-mono">{trackUrl.split('/').pop()}</p>
        </div>
      </div>

      {/* Decorative Brand Text */}
      <div className="absolute top-1/2 -right-8 -translate-y-1/2 rotate-90 text-[40px] font-black text-white/[0.02] pointer-events-none uppercase">
        QueueLess
      </div>
    </motion.div>
  );
}
