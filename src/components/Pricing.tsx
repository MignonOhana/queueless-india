"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";

export default function Pricing() {
  const plans = [
    {
      name: "FREE",
      desc: "Best for small shops testing the system.",
      price: "0",
      features: [
        "Up to 50 tokens per day",
        "Basic queue dashboard",
        "QR code generator",
        "Basic analytics"
      ],
      cta: "Start Free",
      highlight: false
    },
    {
      name: "SMALL BUSINESS",
      desc: "Best for clinics and salons.",
      price: "999",
      features: [
        "Unlimited tokens",
        "SMS alerts",
        "Multi-counter queues",
        "Queue analytics",
        "Priority tokens",
        "Customer history"
      ],
      cta: "Start 14-Day Trial",
      highlight: true
    },
    {
      name: "ENTERPRISE",
      desc: "Best for hospitals, banks, and government offices.",
      price: "Custom",
      features: [
        "Unlimited locations",
        "AI crowd prediction",
        "City queue map integration",
        "Advanced analytics",
        "Dedicated support",
        "Custom integrations"
      ],
      cta: "Contact Sales",
      highlight: false
    }
  ];

  return (
    <section className="py-24 bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase mb-3">
            Pricing
          </h2>
          <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
            Simple, honest pricing.
          </h3>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Start for free. Upgrade when your business grows and you need more power.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {plans.map((plan, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className={`relative p-8 rounded-[2rem] border transition-all duration-300 ${
                plan.highlight 
                  ? "bg-slate-900 dark:bg-slate-800 border-slate-800 dark:border-slate-700 shadow-2xl shadow-indigo-500/10 md:-translate-y-4" 
                  : "bg-white dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50 shadow-sm"
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                 <h4 className={`text-sm font-bold tracking-widest uppercase mb-2 ${plan.highlight ? "text-indigo-400" : "text-slate-500 dark:text-slate-400"}`}>
                   {plan.name}
                 </h4>
                 <div className="flex items-baseline gap-2 mb-4">
                   {plan.price !== "Custom" && <span className={`text-2xl font-bold ${plan.highlight ? "text-white" : "text-slate-900 dark:text-white"}`}>₹</span>}
                   <span className={`text-5xl font-black tracking-tight ${plan.highlight ? "text-white" : "text-slate-900 dark:text-white"}`}>
                     {plan.price}
                   </span>
                   {plan.price !== "Custom" && <span className={plan.highlight ? "text-slate-400 font-medium" : "text-slate-500 font-medium"}>/mo</span>}
                 </div>
                 <p className={`text-sm ${plan.highlight ? "text-slate-300" : "text-slate-600 dark:text-slate-400"}`}>
                    {plan.desc}
                 </p>
              </div>

              <button className={`w-full py-3.5 rounded-xl font-bold transition-all mb-8 ${
                plan.highlight 
                  ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25" 
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white"
              }`}>
                {plan.cta}
              </button>

              <div className="space-y-4">
                 <p className={`text-sm font-semibold uppercase tracking-wider ${plan.highlight ? "text-white" : "text-slate-900 dark:text-white"}`}>Includes:</p>
                 {plan.features.map((feature, fIdx) => (
                   <div key={fIdx} className="flex items-start gap-3">
                     <Check size={18} className={`shrink-0 mt-0.5 ${plan.highlight ? "text-indigo-400" : "text-indigo-500"}`} />
                     <span className={`text-sm ${plan.highlight ? "text-slate-300" : "text-slate-600 dark:text-slate-300"}`}>{feature}</span>
                   </div>
                 ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
