"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Check, X, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    name: "Community",
    priceM: 0,
    priceY: 0,
    sub: "Perfect for small shops",
    cta: "Start Free Forever",
    ctaHref: "/login",
    color: "border-white/10",
    features: [
      { label: "1 counter", ok: true },
      { label: "50 tokens/day", ok: true },
      { label: "QR Code Join", ok: true },
      { label: "Basic dashboard", ok: true },
      { label: "TV Display Mode", ok: true },
      { label: "AI Predictions", ok: false },
      { label: "SMS Alerts", ok: false },
      { label: "Fast Pass revenue", ok: false },
      { label: "Analytics exports", ok: false },
    ],
  },
  {
    name: "Growth",
    priceM: 999,
    priceY: 799,
    sub: "Best for clinics & salons",
    cta: "Start 14-day Free Trial",
    ctaHref: "/login?plan=growth",
    color: "border-[#00F5A0]/30",
    badge: "Most Popular",
    features: [
      { label: "5 counters", ok: true },
      { label: "Unlimited tokens/day", ok: true },
      { label: "QR Code Join", ok: true },
      { label: "Advanced dashboard", ok: true },
      { label: "TV Display Mode", ok: true },
      { label: "AI Wait Predictions", ok: true },
      { label: "SMS Alerts (Twilio)", ok: true },
      { label: "Fast Pass revenue (2%)", ok: true },
      { label: "Analytics + CSV export", ok: true },
    ],
  },
  {
    name: "Enterprise",
    priceM: null,
    priceY: null,
    sub: "For hospitals & govt offices",
    cta: "Contact Sales",
    ctaHref: "/contact",
    color: "border-white/10",
    features: [
      { label: "Unlimited counters", ok: true },
      { label: "Unlimited tokens", ok: true },
      { label: "Multi-branch support", ok: true },
      { label: "White-label branding", ok: true },
      { label: "REST API access", ok: true },
      { label: "Dedicated SLA", ok: true },
      { label: "Priority support 24/7", ok: true },
      { label: "Custom integrations", ok: true },
      { label: "On-premise option", ok: true },
    ],
  },
];

export default function PricingSection() {
  const headRef = useRef<HTMLDivElement>(null);
  const isHeadInView = useInView(headRef, { once: true, margin: "-60px" });
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="bg-[#0A0A0F] py-28 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div ref={headRef} className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isHeadInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#00F5A0] font-black text-xs uppercase tracking-[0.25em] mb-5"
          >
            Pricing
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isHeadInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-6"
          >
            Simple pricing for{" "}
            <span style={{ color: "#00F5A0" }}>every business size.</span>
          </motion.h2>

          {/* Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isHeadInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full p-1.5"
          >
            <button
              onClick={() => setIsYearly(false)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                !isYearly ? "bg-white text-black" : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                isYearly ? "text-black" : "text-slate-400 hover:text-white"
              }`}
              style={isYearly ? { backgroundColor: "#00F5A0" } : {}}
            >
              Yearly
              <span className="text-[10px] font-black bg-black/20 px-1.5 py-0.5 rounded-full">
                2 months free
              </span>
            </button>
          </motion.div>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative border ${plan.color} rounded-[2rem] p-8 flex flex-col ${
                plan.badge ? "bg-gradient-to-b from-[#00F5A0]/5 to-transparent" : "bg-white/[0.02]"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span
                    className="text-black text-xs font-black px-4 py-1 rounded-full"
                    style={{ backgroundColor: "#00F5A0" }}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className="text-slate-400 text-sm font-bold mb-1">{plan.sub}</p>
                <h3 className="text-2xl font-black text-white mb-3">{plan.name}</h3>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isYearly ? "y" : "m"}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {plan.priceM === null ? (
                      <p className="text-4xl font-black text-white">Custom</p>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-white">
                          ₹{isYearly ? plan.priceY : plan.priceM}
                        </span>
                        {plan.priceM > 0 && (
                          <span className="text-slate-500 font-medium">/month</span>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex items-center gap-2.5 text-sm">
                    {f.ok ? (
                      <Check size={16} className="flex-shrink-0" style={{ color: "#00F5A0" }} />
                    ) : (
                      <X size={16} className="text-slate-600 flex-shrink-0" />
                    )}
                    <span className={f.ok ? "text-slate-200 font-medium" : "text-slate-600"}>{f.label}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={`w-full py-4 rounded-xl font-black text-center flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 ${
                  plan.badge
                    ? "text-black"
                    : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                }`}
                style={plan.badge ? { backgroundColor: "#00F5A0" } : {}}
              >
                {plan.cta}
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-slate-500 text-sm mt-8">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}
