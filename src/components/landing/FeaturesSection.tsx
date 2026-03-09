"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { QrCode, Brain, Tv, Zap, BarChart2, Bell, Map, Trophy } from "lucide-react";

const FEATURES = [
  {
    icon: QrCode,
    emoji: "📱",
    title: "QR Code Join",
    desc: "Scan to join — no app download, no signup required. Works on any phone.",
    span: "col-span-1",
    accent: "#00F5A0",
    bg: "from-emerald-500/10 to-transparent",
  },
  {
    icon: Brain,
    emoji: "🤖",
    title: "AI Wait Predictions",
    desc: "Gemini AI learns your traffic patterns to tell customers the best time to visit — before they leave home.",
    span: "col-span-1 sm:col-span-2",
    accent: "#818CF8",
    bg: "from-indigo-500/10 to-transparent",
  },
  {
    icon: Tv,
    emoji: "📺",
    title: "TV Display Mode",
    desc: "Cast a beautiful live queue board to any smart TV in your lobby. Zero setup.",
    span: "col-span-1",
    accent: "#38BDF8",
    bg: "from-sky-500/10 to-transparent",
  },
  {
    icon: Zap,
    emoji: "⚡",
    title: "Fast Pass",
    desc: "Offer premium skip-the-line slots via Razorpay. New revenue stream for your business.",
    span: "col-span-1",
    accent: "#FBBF24",
    bg: "from-amber-500/10 to-transparent",
  },
  {
    icon: BarChart2,
    emoji: "📊",
    title: "Analytics Dashboard",
    desc: "Traffic patterns, peak hours, revenue graphs. Know your business deeply.",
    span: "col-span-1 sm:col-span-2",
    accent: "#F472B6",
    bg: "from-pink-500/10 to-transparent",
  },
  {
    icon: Bell,
    emoji: "🔔",
    title: "Smart SMS Alerts",
    desc: "Customers get notified when they're 2 people away. Reduce no-shows by 40%.",
    span: "col-span-1",
    accent: "#FB923C",
    bg: "from-orange-500/10 to-transparent",
  },
  {
    icon: Map,
    emoji: "🗺️",
    title: "Discovery Map",
    desc: "Customers find your business on a live heatmap showing real-time wait times nearby.",
    span: "col-span-1",
    accent: "#34D399",
    bg: "from-emerald-500/10 to-transparent",
  },
  {
    icon: Trophy,
    emoji: "🏆",
    title: "Business Leaderboard",
    desc: "Gamified ratings by wait time and satisfaction. Stand out in your city.",
    span: "col-span-1",
    accent: "#C084FC",
    bg: "from-purple-500/10 to-transparent",
  },
];

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`bg-gradient-to-br ${feature.bg} border border-white/8 rounded-[2rem] p-7 flex flex-col gap-4 cursor-default group ${feature.span} relative overflow-hidden`}
      style={{ borderColor: `${feature.accent}18` }}
    >
      <div
        className="absolute top-0 right-0 w-32 h-32 opacity-[0.05] blur-2xl rounded-full pointer-events-none"
        style={{ backgroundColor: feature.accent }}
      />
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-lg"
        style={{ backgroundColor: `${feature.accent}20`, color: feature.accent }}
      >
        <Icon size={22} />
      </div>
      <div>
        <h3 className="text-white font-black text-lg mb-1.5 tracking-tight">
          {feature.emoji} {feature.title}
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed font-medium">{feature.desc}</p>
      </div>
      <div
        className="mt-auto text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1"
        style={{ color: feature.accent }}
      >
        Learn more →
      </div>
    </motion.div>
  );
}

export default function FeaturesSection() {
  const headRef = useRef<HTMLDivElement>(null);
  const isHeadInView = useInView(headRef, { once: true, margin: "-60px" });

  return (
    <section className="bg-[#0A0A0F] py-28 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div ref={headRef} className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isHeadInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#00F5A0] font-black text-xs uppercase tracking-[0.25em] mb-5"
          >
            Everything You Need
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isHeadInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black text-white tracking-tighter"
          >
            Built for scale.{" "}
            <span style={{ color: "#00F5A0" }}>Designed for humans.</span>
          </motion.h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
