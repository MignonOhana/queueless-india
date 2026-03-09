"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

function CountUp({ end, suffix = "", duration = 2.5 }: { end: number; suffix?: string; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = end / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setValue(end);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {value.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

const STATS = [
  { label: "Businesses Active", end: 2400, suffix: "+" },
  { label: "Daily Tokens Issued", end: 48000, suffix: "+" },
  { label: "Avg Minutes Saved", end: 18, suffix: " min" },
];

const TESTIMONIALS = [
  {
    quote:
      "Since installing QueueLess, our OPD waiting room is never chaotic. Patients wait at home and walk in exactly on time. Game-changer for a 300-bed hospital.",
    name: "Dr. Priya Menon",
    role: "Medical Superintendent",
    biz: "City General Hospital, Pune",
    initials: "PM",
    color: "from-rose-500 to-orange-500",
  },
  {
    quote:
      "Our stylists are fully booked every day now. Walk-ins scan the QR, see the wait time, and either join or come back later. No more frustrated customers.",
    name: "Rohan Desai",
    role: "Founder",
    biz: "StyleCraft Salon, Mumbai",
    initials: "RD",
    color: "from-purple-500 to-indigo-500",
  },
  {
    quote:
      "We serve 500 customers a day. QueueLess reduced our peak hour chaos by 70%. The TV display is brilliant — customers know exactly where they stand.",
    name: "Suresh Nair",
    role: "Branch Manager",
    biz: "Indian Bank, Chennai",
    initials: "SN",
    color: "from-sky-500 to-emerald-500",
  },
];

const BIZ_TYPES = [
  { emoji: "🏥", label: "Hospitals" },
  { emoji: "💇", label: "Salons" },
  { emoji: "🏦", label: "Banks" },
  { emoji: "🏛️", label: "Govt Offices" },
  { emoji: "🧑‍⚕️", label: "Clinics" },
  { emoji: "🏋️", label: "Gyms" },
];

export default function SocialProofSection() {
  const headRef = useRef<HTMLDivElement>(null);
  const isHeadInView = useInView(headRef, { once: true, margin: "-60px" });

  return (
    <section className="bg-[#0d0d14] py-28 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div ref={headRef} className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isHeadInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#00F5A0] font-black text-xs uppercase tracking-[0.25em] mb-5"
          >
            Trusted Across India
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isHeadInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black text-white tracking-tighter"
          >
            Numbers that speak.
          </motion.h2>
        </div>

        {/* Animated counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-white/5 border border-white/8 rounded-[2rem] p-8 text-center"
            >
              <p
                className="text-5xl font-black mb-2"
                style={{ color: "#00F5A0" }}
              >
                <CountUp end={stat.end} suffix={stat.suffix} />
              </p>
              <p className="text-slate-400 font-bold text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-white/[0.03] border border-white/8 rounded-[2rem] p-7 flex flex-col gap-5"
            >
              <div className="text-slate-300 text-sm leading-relaxed font-medium flex-1">
                <span className="text-2xl text-slate-600 leading-none mr-1">"</span>
                {t.quote}
                <span className="text-2xl text-slate-600 leading-none ml-1">"</span>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/8">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-black text-sm flex-shrink-0`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{t.name}</p>
                  <p className="text-slate-500 text-xs">{t.role} · {t.biz}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Business type logos */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap justify-center gap-3"
        >
          <p className="w-full text-center text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">
            Used across industries
          </p>
          {BIZ_TYPES.map((b) => (
            <div
              key={b.label}
              className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-full px-4 py-2 text-sm text-slate-300 font-medium"
            >
              <span>{b.emoji}</span> {b.label}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
