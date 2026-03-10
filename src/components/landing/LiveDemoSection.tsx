"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { Activity, ArrowRight, Users } from "lucide-react";

const DEMO_ORG_ID = "demo-city-hospital";

const INITIAL_QUEUE = [
  { tokenNumber: "H-039", name: "Priya S.", status: "SERVING", since: "2 min ago" },
  { tokenNumber: "H-040", name: "Ramesh K.", status: "WAITING", since: "12 min" },
  { tokenNumber: "H-041", name: "Ananya M.", status: "WAITING", since: "6 min" },
];

export default function LiveDemoSection() {
  const headRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(headRef, { once: true, margin: "-60px" });

  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [isJoining, setIsJoining] = useState(false);
  const [joinedToken, setJoinedToken] = useState<string | null>(null);
  const [visitorName, setVisitorName] = useState("Visitor");

  useEffect(() => {
    const names = ["Rahul", "Pooja", "Aditya", "Sneha", "Kiran", "Divya", "Arjun"];
    setVisitorName(names[Math.floor(Math.random() * names.length)]);
  }, []);

  const handleJoinDemo = async () => {
    setIsJoining(true);
    try {
      // Try Supabase edge function first, fallback to mock
      const { data, error } = await supabase.functions.invoke("generate-token", {
        body: {
          orgId: DEMO_ORG_ID,
          counterPrefix: "H",
          userId: null,
          customerName: visitorName + " (Demo)",
          customerPhone: "+919999000000",
        },
      });

      let tokenNum: string;
      if (error || !data?.tokenNumber) {
        // Mock fallback
        tokenNum = `H-${String(Math.floor(Math.random() * 900) + 100)}`;
      } else {
        tokenNum = data.tokenNumber;
      }

      setJoinedToken(tokenNum);
      setQueue((prev) => [
        ...prev,
        { tokenNumber: tokenNum, name: visitorName + " (You)", status: "WAITING", since: "just now" },
      ]);
    } catch {
      const tokenNum = `H-${String(Math.floor(Math.random() * 900) + 100)}`;
      setJoinedToken(tokenNum);
      setQueue((prev) => [
        ...prev,
        { tokenNumber: tokenNum, name: visitorName + " (You)", status: "WAITING", since: "just now" },
      ]);
    } finally {
      setIsJoining(false);
    }
  };

  const handleReset = () => {
    setQueue(INITIAL_QUEUE);
    setJoinedToken(null);
  };

  return (
    <section className="bg-[#0d0d14] py-28 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div ref={headRef} className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#00F5A0] font-black text-xs uppercase tracking-[0.25em] mb-5"
          >
            Live Demo
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black text-white tracking-tighter"
          >
            Don't take our word for it.{" "}
            <span style={{ color: "#00F5A0" }}>Try it now.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 mt-4 text-lg"
          >
            This is a real queue. Click join and watch yourself appear.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Business info + live queue */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="bg-[#111118] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            {/* Business header */}
            <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/10 border-b border-white/10 p-6">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Demo Business</p>
                  <h3 className="text-2xl font-black text-white">City Hospital 🏥</h3>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-xs font-bold">Open</span>
                </div>
              </div>
              <div className="flex gap-4 mt-3 text-sm text-slate-300">
                <span className="flex items-center gap-1.5"><Users size={14} className="text-indigo-400" />{queue.length} waiting</span>
                <span className="flex items-center gap-1.5"><Activity size={14} className="text-amber-400" />~15 min wait</span>
              </div>
            </div>

            {/* Queue list */}
            <div className="p-6 space-y-3">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Live Queue</p>
              {queue.map((item, i) => (
                <motion.div
                  key={item.tokenNumber}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    item.name.includes("(You)")
                      ? "border-[#00F5A0]/30 bg-[#00F5A0]/5"
                      : item.status === "SERVING"
                      ? "border-amber-500/20 bg-amber-500/5"
                      : "border-white/5 bg-white/2"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                        item.status === "SERVING"
                          ? "bg-amber-500 text-black"
                          : item.name.includes("(You)")
                          ? "bg-[#00F5A0]/20 text-[#00F5A0]"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      {item.tokenNumber.split("-")[1]}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{item.name}</p>
                      <p className="text-slate-500 text-xs">{item.since}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      item.status === "SERVING"
                        ? "bg-amber-500/20 text-amber-400"
                        : item.name.includes("(You)")
                        ? "bg-[#00F5A0]/10 text-[#00F5A0]"
                        : "bg-white/5 text-slate-500"
                    }`}
                  >
                    {item.status === "SERVING" ? "Now Serving" : `#${i + 1} in queue`}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Join prompt */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col gap-6"
          >
            {!joinedToken ? (
              <>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight mb-3">
                    Hi, <span style={{ color: "#00F5A0" }}>{visitorName}!</span> 👋
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    City Hospital's OPD queue has <strong className="text-white">{queue.length} people</strong> waiting.
                    Click below to join as a demo visitor and see yourself appear in the live queue above — instantly.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="flex justify-between text-sm mb-4">
                    <span className="text-slate-400 font-medium">Est. wait time</span>
                    <span className="text-white font-bold">~{queue.length * 5} minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-medium">Your position</span>
                    <span className="text-white font-bold">#{queue.filter(q => q.status === "WAITING").length + 1}</span>
                  </div>
                </div>

                <button
                  onClick={handleJoinDemo}
                  disabled={isJoining}
                  className="flex items-center justify-center gap-2 w-full py-5 rounded-2xl font-black text-lg text-black transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 shadow-[0_0_40px_rgba(0,245,160,0.3)]"
                  style={{ background: "linear-gradient(135deg, #00F5A0, #00D4FF)" }}
                >
                  {isJoining ? (
                    <Activity size={22} className="animate-spin" />
                  ) : (
                    <>Join Demo Queue <ArrowRight size={20} /></>
                  )}
                </button>
                <p className="text-center text-slate-500 text-xs">No account needed. This is a real live demo.</p>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-[#00F5A0]/10 to-transparent border border-[#00F5A0]/20 rounded-[2rem] p-8 text-center"
              >
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">You're in the queue!</p>
                <p className="text-6xl font-black text-white mb-1">{joinedToken}</p>
                <p style={{ color: "#00F5A0" }} className="font-bold mb-6">
                  #{queue.filter(q => q.status === "WAITING").length} in line
                </p>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  In a real scenario, you'd get an SMS when it's almost your turn. For now, look at the queue on the left — you're in there! 👈
                </p>
                <button
                  onClick={handleReset}
                  className="text-slate-400 text-sm underline underline-offset-2 hover:text-white transition-colors"
                >
                  Reset demo
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
