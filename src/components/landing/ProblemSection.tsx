"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const PAIN_POINTS = [
  {
    emoji: "🏥",
    category: "Hospital",
    headline: "OPD queues at 5am just to get a number",
    detail: "Patients arrive before dawn, stand for hours, and still miss their slot.",
    color: "from-rose-500/20 to-rose-900/5",
    border: "border-rose-500/20",
    badge: "bg-rose-500/10 text-rose-400",
  },
  {
    emoji: "🏦",
    category: "Bank",
    headline: "Lunch break gone waiting for a counter",
    detail: "Token 47, serving 12. The display hasn't moved in 30 minutes.",
    color: "from-amber-500/20 to-amber-900/5",
    border: "border-amber-500/20",
    badge: "bg-amber-500/10 text-amber-400",
  },
  {
    emoji: "💇",
    category: "Salon",
    headline: "Walk-ins turned away. No idea when to come back",
    detail: "No appointment system, no estimated wait — just gamble and hope.",
    color: "from-purple-500/20 to-purple-900/5",
    border: "border-purple-500/20",
    badge: "bg-purple-500/10 text-purple-400",
  },
  {
    emoji: "🏛️",
    category: "Govt Office",
    headline: "Take a number. Come back tomorrow.",
    detail: "Aadhaar, PAN, ration card — every window closes before you reach it.",
    color: "from-blue-500/20 to-blue-900/5",
    border: "border-blue-500/20",
    badge: "bg-blue-500/10 text-blue-400",
  },
];

function PainCard({ item, index }: { item: typeof PAIN_POINTS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className={`relative bg-gradient-to-br ${item.color} border ${item.border} rounded-[2rem] p-7 flex flex-col gap-4 group hover:scale-[1.02] transition-transform duration-300 overflow-hidden`}
    >
      <div className="absolute -bottom-6 -right-6 text-[7rem] opacity-5 select-none">{item.emoji}</div>
      <span className={`self-start px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${item.badge}`}>
        {item.category}
      </span>
      <p className="text-3xl leading-tight font-black text-white">
        {item.emoji} {item.headline}
      </p>
      <p className="text-slate-400 font-medium text-sm leading-relaxed">{item.detail}</p>
    </motion.div>
  );
}

export default function ProblemSection() {
  const headRef = useRef<HTMLDivElement>(null);
  const isHeadInView = useInView(headRef, { once: true, margin: "-60px" });

  return (
    <section className="bg-[#0A0A0F] py-28 px-6 relative overflow-hidden">
      {/* Subtle grid bg */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div ref={headRef} className="text-center mb-20 max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isHeadInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#00F5A0] font-black text-xs uppercase tracking-[0.25em] mb-5"
          >
            The Problem
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isHeadInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tighter"
          >
            Indians waste{" "}
            <span
              className="text-transparent"
              style={{ WebkitTextStroke: "2px #00F5A0" }}
            >
              4.7 billion hours
            </span>{" "}
            in queues every year.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isHeadInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-lg mt-6 leading-relaxed"
          >
            That's 536,000 years of collective human life — gone standing in a line.
            The problem isn't people, it's the system.
          </motion.p>
        </div>

        {/* Pain point cards */}
        <div className="grid sm:grid-cols-2 gap-5">
          {PAIN_POINTS.map((item, i) => (
            <PainCard key={item.category} item={item} index={i} />
          ))}
        </div>

        {/* Bottom callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-slate-500 text-sm font-medium">
            Every minute waiting is productivity lost. Every turned-away customer is revenue lost.
          </p>
          <p className="text-[#00F5A0] font-black text-lg mt-2">
            There's a better way. →
          </p>
        </motion.div>
      </div>
    </section>
  );
}
