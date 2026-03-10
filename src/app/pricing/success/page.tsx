'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function SubscriptionSuccessPage() {
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00F5A0', '#38BDF8', '#FF6B35']
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#00F5A0]/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg bg-white/5 border border-white/10 backdrop-blur-xl rounded-[3rem] p-12 text-center shadow-2xl"
      >
        <div className="w-24 h-24 bg-[#00F5A0]/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#00F5A0]/30">
          <ShieldCheck size={48} className="text-[#00F5A0]" />
        </div>

        <h1 className="text-4xl font-black mb-4 tracking-tight leading-tight">Welcome to Growth!</h1>
        <p className="text-zinc-400 font-medium mb-10 leading-relaxed">
          Your subscription has been activated. You now have unlimited tokens, AI predictions, and advanced analytics at your fingertips.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-10 text-left">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
             <div className="flex items-center gap-2 text-[#00F5A0] mb-1">
               <Zap size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest">Unlimited</span>
             </div>
             <p className="text-xs font-bold text-white">Daily Tokens</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
             <div className="flex items-center gap-2 text-blue-400 mb-1">
               <CheckCircle2 size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest">Premium</span>
             </div>
             <p className="text-xs font-bold text-white">AI Insights</p>
          </div>
        </div>

        <Link 
          href="/dashboard"
          className="group w-full bg-[#00F5A0] text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#00D189] transition-all shadow-xl shadow-[#00F5A0]/20 active:scale-95"
        >
          Go to Dashboard <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>

      <p className="mt-8 text-zinc-600 text-xs font-bold uppercase tracking-widest">
        Powered by QueueLess India Billing
      </p>
    </div>
  );
}
