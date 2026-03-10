'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, CheckCircle2, ArrowRight, Sparkles, Users, Bell, Play } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface BusinessOnboardingProps {
  businessName: string;
  businessId: string;
}

export default function BusinessOnboarding({ businessName, businessId }: BusinessOnboardingProps) {
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [tooltipStep, setTooltipStep] = useState(0); // 0 means not showing tooltips yet
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const [origin, setOrigin] = useState('');
  
  useEffect(() => {
    setOrigin(window.location.origin);
    const isCompleted = localStorage.getItem('queueless_onboarded_owner');
    if (!isCompleted) {
      setShowModal(true);
    }
  }, []);

  const updateTooltipPos = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTooltipPos({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      });
    }
  };

  const handleModalNext = () => {
    if (modalStep < 3) {
      setModalStep(modalStep + 1);
    } else {
      setShowModal(false);
      setTooltipStep(1);
      setTimeout(() => updateTooltipPos('serve-next-btn'), 100);
    }
  };

  const handleTooltipNext = () => {
    if (tooltipStep === 1) {
      setTooltipStep(2);
      updateTooltipPos('token-count-stats');
    } else if (tooltipStep === 2) {
      setTooltipStep(3);
      updateTooltipPos('qr-header-icon');
    } else {
      setTooltipStep(0);
      localStorage.setItem('queueless_onboarded_owner', 'true');
    }
  };

  // Re-calculate position on resize or scroll
  useEffect(() => {
    if (tooltipStep === 0) return;
    const ids = ['', 'serve-next-btn', 'token-count-stats', 'qr-header-icon'];
    const handleUpdate = () => updateTooltipPos(ids[tooltipStep]);
    
    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate);
    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate);
    };
  }, [tooltipStep]);

  return (
    <>
      {/* --- MODAL FLOW --- */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0A0A0F]/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-xl bg-[#111118] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
            >
              {/* Decorative Glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#00F5A0]/10 rounded-full blur-[80px]" />

              <div className="relative z-10">
                {modalStep === 1 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <div className="w-20 h-20 bg-[#00F5A0]/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-[#00F5A0]">
                       <Sparkles size={40} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Welcome to QueueLess 👋</h2>
                    <p className="text-slate-400 mb-10 leading-relaxed text-lg">
                      Tired of crowded lobbies and restless customers? QueueLess helps you manage waitlists digitally, giving your customers freedom and you total control.
                    </p>
                    {/* Animated illustration placeholder */}
                    <div className="flex justify-center gap-4 mb-12">
                       <div className="flex -space-x-3">
                         {[1,2,3,4].map(i => (
                           <div key={i} className="w-12 h-12 rounded-full bg-slate-800 border-2 border-[#111118] flex items-center justify-center text-[10px] font-bold text-slate-500">#{i}</div>
                         ))}
                       </div>
                       <div className="text-[#00F5A0] py-3">→</div>
                       <CheckCircle2 className="text-[#00F5A0] w-12 h-12" />
                    </div>
                    <button 
                      onClick={handleModalNext}
                      className="w-full py-5 bg-[#00F5A0] text-[#0A0A0F] font-black rounded-2xl shadow-xl shadow-[#00F5A0]/20 hover:scale-[1.02] active:scale-95 transition-all text-lg flex items-center justify-center gap-2"
                    >
                      Let's set up your business <ArrowRight size={20} />
                    </button>
                  </motion.div>
                )}

                {modalStep === 2 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <div className="mb-8">
                       <p className="text-[#00F5A0] text-xs font-black uppercase tracking-widest mb-2">Step 2: Customer Join Point</p>
                       <h2 className="text-3xl font-black text-white tracking-tight">Your Queue is Ready</h2>
                    </div>
                    
                    <div className="bg-white p-6 rounded-[2rem] inline-block mb-8 shadow-2xl">
                       <QRCodeSVG 
                         value={`${origin || 'https://queueless-india.vercel.app'}/b/${businessId}`} 
                         size={180} 
                         level="H"
                         fgColor="#0A0A0F"
                       />
                    </div>
                    
                    <div className="text-left bg-white/5 border border-white/10 rounded-2xl p-6 mb-10">
                       <p className="text-white font-bold mb-2 flex items-center gap-2">
                         <QrCode size={18} className="text-[#00F5A0]" />
                         {businessName}
                       </p>
                       <p className="text-slate-400 text-sm leading-relaxed">
                         Customers simply scan this QR code to join your queue. No apps to download, no friction. Just instant access.
                       </p>
                    </div>

                    <button 
                      onClick={handleModalNext}
                      className="w-full py-5 bg-[#00F5A0] text-[#0A0A0F] font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-all text-lg flex items-center justify-center gap-2"
                    >
                      Got it, show me the dashboard <ArrowRight size={20} />
                    </button>
                  </motion.div>
                )}

                {modalStep === 3 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="text-center mb-10">
                       <h2 className="text-3xl font-black text-white tracking-tight">How to Serve Customers</h2>
                       <p className="text-slate-400 mt-2 font-medium">Serving is as easy as 1-2-3</p>
                    </div>

                    <div className="space-y-6 mb-12">
                       <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-black shrink-0">1</div>
                          <div>
                             <p className="text-white font-bold">Click 'Serve Next'</p>
                             <p className="text-slate-500 text-sm">When you're ready for the next person.</p>
                          </div>
                       </div>
                       <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#00F5A0]/10 border border-[#00F5A0]/20 flex items-center justify-center text-[#00F5A0] font-black shrink-0">2</div>
                          <div>
                             <p className="text-white font-bold">Customer Gets Notified</p>
                             <p className="text-slate-500 text-sm">They receive a live notification to approach.</p>
                          </div>
                       </div>
                       <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-black shrink-0">3</div>
                          <div>
                             <p className="text-white font-bold">Mark Done</p>
                             <p className="text-slate-500 text-sm">Clear them from the queue and move to the next.</p>
                          </div>
                       </div>
                    </div>

                    <button 
                      onClick={handleModalNext}
                      className="w-full py-5 bg-[#00F5A0] text-[#0A0A0F] font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-all text-lg flex items-center justify-center gap-2"
                    >
                      Start Serving! 🚀
                    </button>
                  </motion.div>
                )}

                {/* Dots */}
                <div className="flex justify-center gap-2 mt-8">
                   {[1,2,3].map(i => (
                     <div key={i} className={`w-2 h-2 rounded-full transition-all ${modalStep === i ? 'w-6 bg-[#00F5A0]' : 'bg-slate-700'}`} />
                   ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- SPOTLIGHT TOOLTIPS --- */}
      <AnimatePresence>
        {tooltipStep > 0 && (
          <div className="fixed inset-0 z-[110] pointer-events-none">
            {/* Background Overlay with Hole (Optional, using simpler focus ring) */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            
            {/* Focus Ring */}
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                top: tooltipPos.top - 8,
                left: tooltipPos.left - 8,
                width: tooltipPos.width + 16,
                height: tooltipPos.height + 16,
              }}
              className="absolute border-2 border-[#00F5A0] rounded-2xl shadow-[0_0_20px_rgba(0,245,160,0.5)] z-[120]"
            >
               <div className="absolute inset-0 border-2 border-[#00F5A0] rounded-2xl animate-ping opacity-30" />
            </motion.div>

            {/* Tooltip Content */}
            <motion.div
              layout
              key={tooltipStep}
              className="absolute z-[130] w-64 pointer-events-auto"
              style={{
                top: tooltipPos.top + tooltipPos.height + 24,
                left: Math.min(Math.max(tooltipPos.left + (tooltipPos.width / 2) - 128, 20), window.innerWidth - 280),
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
               <div className="bg-[#111118] border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#00F5A0]/5 rounded-full blur-xl" />
                  
                  {tooltipStep === 1 && (
                    <>
                      <p className="text-white font-bold text-sm mb-2">Serve Next Customer</p>
                      <p className="text-slate-400 text-xs leading-relaxed mb-4">
                        Click here when you are ready for the next customer. They'll be notified immediately.
                      </p>
                    </>
                  )}
                  {tooltipStep === 2 && (
                    <>
                      <p className="text-white font-bold text-sm mb-2">Real-time Waitlist</p>
                      <p className="text-slate-400 text-xs leading-relaxed mb-4">
                        This shows how many tokens are currently waiting to be served.
                      </p>
                    </>
                  )}
                  {tooltipStep === 3 && (
                    <>
                      <p className="text-white font-bold text-sm mb-2">Share Your QR</p>
                      <p className="text-slate-400 text-xs leading-relaxed mb-4">
                        Access and print your unique QR code to place at your entrance or front desk.
                      </p>
                    </>
                  )}

                  <button 
                    onClick={handleTooltipNext}
                    className="w-full py-2.5 bg-[#00F5A0] text-[#0A0A0F] font-black text-[10px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-1 hover:brightness-110"
                  >
                    Got it <CheckCircle2 size={12} />
                  </button>
               </div>
               
               {/* Arrow pointing up */}
               <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#111118] border-t border-l border-white/10 rotate-45" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
