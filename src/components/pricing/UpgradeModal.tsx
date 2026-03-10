'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, Zap, Building, Crown, X, ArrowRight } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: { monthly: number; yearly: number };
  description: string;
  features: string[];
  recommended?: boolean;
}

const PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    description: 'Perfect for small shops and pilot projects.',
    features: ['50 Daily Tokens', '1 Queue Counter', 'Basic Tracking', 'Community Support'],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: { monthly: 999, yearly: 799 },
    description: 'Ideal for busy clinics, clinics, and retail stores.',
    features: ['Unlimited Tokens', '5 Queue Counters', 'SMS Notifications', 'AI Predictions', 'Standard Analytics'],
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: { monthly: 4999, yearly: 3999 },
    description: 'Custom solutions for hospitals and large chains.',
    features: ['Unlimited Counters', 'Custom Branding', 'Advanced BI Analytics', 'SLA Support', 'API Access'],
  },
];

export default function UpgradeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return;
    if (planId === 'enterprise') {
      window.location.href = 'mailto:sales@queueless.in?subject=Enterprise Plan Inquiry';
      return;
    }
    
    // Trigger API to create Razorpay subscription
    try {
      const resp = await fetch('/api/create-subscription', {
        method: 'POST',
        body: JSON.stringify({ planId: `${planId}_${billingCycle}` }),
      });
      const data = await resp.json();
      if (data.short_url) {
        window.location.href = data.short_url;
      }
    } catch (e) {
      console.error(e);
      alert('Failed to initialize upgrade. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="relative w-full max-w-5xl bg-zinc-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            <button onClick={onClose} className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors z-10">
              <X size={24} />
            </button>

            {/* Left side: Why Upgrade */}
            <div className="md:w-1/3 bg-indigo-600/10 p-10 border-r border-white/5 hidden md:block">
              <h2 className="text-3xl font-black text-white mb-6 tracking-tight leading-tight">
                Unlock Maximum Throughput
              </h2>
              <p className="text-zinc-400 text-sm mb-8">
                Join 5,000+ Indian businesses reducing wait times by 65%. 
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: Zap, title: "Zero Limits", desc: "No caps on daily tokens" },
                  { icon: Crown, title: "Premium Branding", desc: "Your logo on every token" },
                  { icon: Building, title: "Chain Support", desc: "Manage 100+ branches" },
                ].map((f, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                      <f.icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{f.title}</p>
                      <p className="text-xs text-zinc-500">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side: Plans */}
            <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[90vh]">
              <div className="flex flex-col items-center mb-10">
                <div className="bg-zinc-800 p-1 rounded-2xl flex gap-1 mb-8 border border-white/5">
                  <button 
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white'}`}
                  >
                    Monthly
                  </button>
                  <button 
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-6 py-2 rounded-xl text-xs font-bold transition-all relative ${billingCycle === 'yearly' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white'}`}
                  >
                    Yearly
                    <span className="absolute -top-3 -right-2 bg-emerald-500 text-black text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-xl">
                      Save 20%
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {PLANS.map((plan) => (
                  <div 
                    key={plan.id}
                    className={`relative p-6 rounded-3xl border transition-all flex flex-col ${
                      plan.recommended 
                        ? 'bg-zinc-800/50 border-indigo-500/50 shadow-indigo-500/10' 
                        : 'bg-zinc-900 border-white/5 hover:border-white/10'
                    }`}
                  >
                    {plan.recommended && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-black uppercase px-4 py-1 rounded-full shadow-lg">
                        Best Value
                      </span>
                    )}

                    <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-black text-white">
                        ₹{billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly}
                      </span>
                      <span className="text-zinc-500 text-xs font-bold">/mo</span>
                    </div>
                    <p className="text-zinc-500 text-xs mb-6 h-10">{plan.description}</p>

                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-3 text-xs font-medium text-zinc-300">
                          <Check size={14} className="text-emerald-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      className={`w-full py-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                        plan.id === 'free' 
                          ? 'bg-zinc-800 text-zinc-500 cursor-default opacity-50' 
                          : plan.recommended 
                            ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-500/20 active:scale-95'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'
                      }`}
                    >
                      {plan.id === 'free' ? 'Current Plan' : plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade Now'}
                      {plan.id !== 'free' && <ArrowRight size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
