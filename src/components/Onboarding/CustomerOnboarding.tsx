'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Zap, MapPin, ArrowRight, MessageCircle, Navigation, Info } from 'lucide-react';

export default function CustomerOnboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const isCompleted = localStorage.getItem('queueless_onboarded_customer');
    if (!isCompleted) {
      // Delay it slightly for better UX
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('queueless_onboarded_customer', 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 left-6 right-6 z-[100] max-w-sm mx-auto pointer-events-auto"
        >
          <div className="bg-[#111118]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#00F5A0]/5 rounded-full blur-2xl" />

            <button 
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-[#00F5A0]/10 border border-[#00F5A0]/20 flex items-center justify-center text-[#00F5A0]">
                    {step === 1 && <Zap size={20} />}
                    {step === 2 && <MessageCircle size={20} />}
                    {step === 3 && <Navigation size={20} />}
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#00F5A0]">Quick Guide • Step {step}</p>
              </div>

              <div className="min-h-[80px]">
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <h3 className="text-white font-bold mb-1">Join Instantly</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Tap <span className="text-white font-bold">"Get Token"</span> to join the queue instantly — no app needed!
                    </p>
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <h3 className="text-white font-bold mb-1">WhatsApp Alerts</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      We'll send you a WhatsApp message when it's almost your turn.
                    </p>
                  </motion.div>
                )}
                {step === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <h3 className="text-white font-bold mb-1">Live Tracking</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Track your position live on this screen. Refresh anytime to see real-time updates.
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between">
                {/* Dots */}
                <div className="flex gap-1.5">
                   {[1,2,3].map(i => (
                     <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${step === i ? 'w-4 bg-[#00F5A0]' : 'bg-slate-700'}`} />
                   ))}
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleDismiss}
                    className="text-xs font-bold text-slate-500 hover:text-white"
                  >
                    Skip
                  </button>
                  <button 
                    onClick={handleNext}
                    className="bg-[#00F5A0] text-[#0A0A0F] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center gap-1"
                  >
                    {step === 3 ? "Got it ✓" : "Next"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
