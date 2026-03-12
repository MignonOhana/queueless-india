"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Ticket, Activity, ArrowRight, X, LogIn } from "lucide-react";
import Link from "next/link";

interface DemoCard {
  id: string;
  name: string;
  category: string;
  icon: string;
  tokenPrefix: string;
  initialWaiting: number;
  initialServing: number;
  estWait: string;
  capacityPerc: number;
}

const DEMO_DATA: DemoCard[] = [
  {
    id: "demo-hosp",
    name: "AIIMS OPD — General Medicine",
    category: "Hospital",
    icon: "🏥",
    tokenPrefix: "H",
    initialWaiting: 23,
    initialServing: 24,
    estWait: "~46 mins",
    capacityPerc: 72,
  },
  {
    id: "demo-bank",
    name: "SBI Main Branch — Cash Counter",
    category: "Bank",
    icon: "🏦",
    tokenPrefix: "B",
    initialWaiting: 6,
    initialServing: 6,
    estWait: "~18 mins",
    capacityPerc: 35,
  },
  {
    id: "demo-temple",
    name: "Siddhivinayak Temple — Darshan Queue",
    category: "Temple",
    icon: "🛕",
    tokenPrefix: "T",
    initialWaiting: 87,
    initialServing: 116,
    estWait: "~2 hrs 10 mins",
    capacityPerc: 95,
  },
];

export function DemoQueueCards() {
  const [counts, setCounts] = useState(
    DEMO_DATA.map((d) => ({
      id: d.id,
      waiting: d.initialWaiting,
      serving: d.initialServing,
    }))
  );
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounts((prev) =>
        prev.map((c) => {
          if (c.waiting > 0) {
            return {
              ...c,
              serving: c.serving + 1,
              waiting: c.waiting - 1,
            };
          }
          return c;
        })
      );
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const getCapacityColor = (perc: number) => {
    if (perc < 50) return "bg-emerald-500";
    if (perc <= 80) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-black text-white tracking-tight">
          See It Live — <span className="text-[#00F5A0]">No Sign Up Needed</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DEMO_DATA.map((demo, idx) => {
          const liveData = counts[idx];
          const capColor = getCapacityColor(demo.capacityPerc);

          return (
            <motion.div
              key={demo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#111118] rounded-3xl p-5 border border-white/10 relative overflow-hidden group"
            >
              {/* Pulsing Live Badge */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </div>

              <div className="mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl mb-3 border border-white/5">
                  {demo.icon}
                </div>
                <h3 className="text-base font-white text-white leading-tight mb-1">
                  {demo.name}
                </h3>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                  {demo.category}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                    Token #
                  </p>
                  <p className="text-2xl font-black text-white">
                    {demo.tokenPrefix}-{String(liveData.serving + liveData.waiting).padStart(3, "0")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                    Serving Now
                  </p>
                  <p className="text-2xl font-black text-[#00F5A0]">
                    {demo.tokenPrefix}-{String(liveData.serving).padStart(3, "0")}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Clock size={12} /> {demo.estWait} wait
                  </div>
                  <div className="text-zinc-400">
                    {liveData.waiting} in queue
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase">
                    <span>Queue Load</span>
                    <span>{demo.capacityPerc}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${capColor} transition-all duration-1000`}
                      style={{ width: `${demo.capacityPerc}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setShowModal(true)}
                  className="w-full bg-[#00F5A0] text-black font-black text-xs uppercase tracking-widest py-3.5 rounded-2xl shadow-[0_0_20px_rgba(0,245,160,0.1)] hover:shadow-[0_0_30px_rgba(0,245,160,0.2)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  Join This Queue <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Demo Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-[#111118] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative z-10 text-center"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="w-16 h-16 bg-[#00F5A0]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#00F5A0]/20 text-[#00F5A0]">
                <Activity size={32} />
              </div>

              <h3 className="text-2xl font-black text-white tracking-tight mb-3">
                Demo Experience
              </h3>
              <p className="text-zinc-400 font-medium mb-8 leading-relaxed">
                This is a live simulation. To join a real queue and get your token, please sign in to your account.
              </p>

              <div className="space-y-3">
                <Link
                  href="/login"
                  className="w-full bg-[#00F5A0] text-black font-black text-sm uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                >
                  <LogIn size={18} /> Sign In Now
                </Link>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full text-zinc-500 font-bold text-xs uppercase tracking-widest mt-4 hover:text-white transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
