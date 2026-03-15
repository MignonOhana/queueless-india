"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { QrCode, Smartphone, Bell } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: QrCode,
    title: "Business registers & gets QR",
    desc: "A clinic, salon, or bank signs up in 3 minutes. They instantly get a printable QR code to place at reception — no tech team needed.",
    accent: "#00F5A0",
    visual: (
      <div className="w-full flex items-center justify-center py-8">
        <div className="relative">
          <div className="w-32 h-32 border-2 border-[#00F5A0]/60 rounded-2xl p-3 grid grid-cols-3 gap-1 shadow-[0_0_50px_rgba(0,245,160,0.2)]">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="rounded-[3px]"
                style={{
                  backgroundColor: [0, 2, 6, 8, 4].includes(i)
                    ? "#00F5A0"
                    : i % 2 === 0
                    ? "#00F5A030"
                    : "transparent",
                }}
              />
            ))}
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#00F5A0] text-black text-xs font-black px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
            Scan to join
          </div>
        </div>
      </div>
    ),
  },
  {
    n: "02",
    icon: Smartphone,
    title: "Customer scans → gets token",
    desc: "Any customer scans the QR with their camera — no app download. In two taps they have a token number and live position in queue.",
    accent: "#818CF8",
    visual: (
      <div className="w-full flex items-center justify-center py-8">
        <div className="w-28 bg-slate-900 border border-slate-700 rounded-[2rem] p-3 shadow-2xl relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-2 bg-slate-800 rounded-full mt-2" />
          <div className="bg-[#0d0d14] rounded-[1.5rem] overflow-hidden p-4 mt-3">
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mb-2">Your Token</p>
            <p className="text-4xl font-black text-white mb-1">OPD-042</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[8px] text-emerald-400 font-bold">3 people ahead</p>
            </div>
            <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    n: "03",
    icon: Bell,
    title: "Gets notified → arrives on time",
    desc: "When their turn approaches, they get an SMS alert. They arrive exactly when needed — zero waiting, zero stress.",
    accent: "#FB923C",
    visual: (
      <div className="w-full flex items-center justify-center py-8">
        <div className="w-64 bg-white/5 border border-white/10 rounded-2xl p-4 bg-opacity-95">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: "#FB923C20" }}>
              🔔
            </div>
            <div>
              <p className="text-white font-bold text-sm">QueueLess Alert</p>
              <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">
                You're next! Token <strong>OPD-042</strong> at City Hospital. Please proceed to counter 2.
              </p>
              <p className="text-slate-500 text-[10px] mt-2">just now</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

function Step({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const Icon = step.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col"
    >
      {/* Step number and connector */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-black font-black text-lg flex-shrink-0 shadow-lg"
          style={{ backgroundColor: step.accent }}
        >
          <Icon size={24} />
        </div>
        {index < STEPS.length - 1 && (
          <div className="hidden lg:block flex-1 h-px bg-gradient-to-r from-white/20 to-transparent" />
        )}
      </div>

      {/* Visual mockup */}
      <div className="bg-white/5 border border-white/10 rounded-[2rem] mb-6 overflow-hidden">
        {step.visual}
      </div>

      {/* Text */}
      <div
        className="text-7xl font-black opacity-10 mb-2 leading-none"
        style={{ color: step.accent }}
      >
        {step.n}
      </div>
      <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{step.title}</h3>
      <p className="text-slate-400 leading-relaxed font-medium">{step.desc}</p>
    </motion.div>
  );
}

export default function HowItWorksSection() {
  const headRef = useRef<HTMLDivElement>(null);
  const isHeadInView = useInView(headRef, { once: true, margin: "-60px" });

  return (
    <section className="bg-[#0d0d14] py-28 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div ref={headRef} className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isHeadInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#00F5A0] font-black text-xs uppercase tracking-[0.25em] mb-5"
          >
            How It Works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isHeadInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black text-white tracking-tighter"
          >
            Setup to live in{" "}
            <span style={{ color: "#00F5A0" }}>3 minutes.</span>
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {STEPS.map((step, i) => (
            <Step key={step.n} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
