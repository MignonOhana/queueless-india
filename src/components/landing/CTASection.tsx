"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";

export default function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSubmitted(true);
  };

  return (
    <>
      {/* ─── CTA Section ─── */}
      <section className="bg-[#0A0A0F] py-28 px-6 border-t border-white/5 relative overflow-hidden">
        {/* Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] blur-[120px] opacity-20 pointer-events-none rounded-full"
          style={{ backgroundColor: "#00F5A0" }}
        />

        <div ref={ref} className="max-w-3xl mx-auto text-center relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#00F5A0] font-black text-xs uppercase tracking-[0.25em] mb-5"
          >
            Get Started
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-tight mb-6"
          >
            Ready to go{" "}
            <span
              className="text-transparent"
              style={{ WebkitTextStroke: "2px #00F5A0" }}
            >
              QueueLess?
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-lg mb-10 leading-relaxed"
          >
            Setup in 5 minutes. No credit card. Cancel anytime.
          </motion.p>

          {!submitted ? (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6"
            >
              <input
                type="email"
                placeholder="your@business.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="flex-1 bg-white/5 border border-white/20 text-white placeholder:text-slate-500 rounded-full px-6 py-4 focus:outline-none focus:border-[#00F5A0] transition-all font-medium text-sm"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-black text-black text-sm transition-all hover:scale-105 active:scale-95 flex-shrink-0 shadow-[0_0_30px_rgba(0,245,160,0.3)]"
                style={{ background: "linear-gradient(135deg, #00F5A0, #00D4FF)" }}
              >
                Start Free <ArrowRight size={16} />
              </button>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 text-[#00F5A0] font-bold text-lg mb-6"
            >
              <CheckCircle2 size={24} /> We'll be in touch! Check your inbox.
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-6 text-slate-500 text-sm font-medium"
          >
            {["No credit card required", "Free forever plan", "2,400+ businesses trust us"].map(item => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#00F5A0]" /> {item}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10"
          >
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-white border border-white/20 px-8 py-4 rounded-full font-bold hover:bg-white/5 transition-all"
            >
              Register Your Business Now <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-[#050508] border-t border-white/5 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#00F5A0" }}>
                  <Clock className="w-4 h-4 text-black" strokeWidth={3} />
                </div>
                <span className="font-extrabold text-xl text-white tracking-tight">
                  QueueLess <span style={{ color: "#00F5A0" }}>India</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                AI-powered virtual queuing for every business in Bharat. Built to eliminate the 4.7 billion hours wasted in queues.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="text-white font-bold text-sm mb-4">Product</p>
              <ul className="space-y-3 text-slate-400 text-sm">
                {["Features", "Pricing", "Live Demo", "QR Codes", "TV Display"].map(item => (
                  <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-white font-bold text-sm mb-4">Company</p>
              <ul className="space-y-3 text-slate-400 text-sm">
                {[
                  { label: "Home", href: "/" },
                  { label: "Find a Queue", href: "/home" },
                  { label: "Contact", href: "/contact" },
                  { label: "Business Login", href: "/login" },
                  { label: "Privacy Policy", href: "/policies" },
                  { label: "Terms of Service", href: "/policies" },
                ].map(({ label, href }) => (
                  <li key={label}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-sm">© 2026 QueueLess India. All rights reserved.</p>
            <p className="text-slate-600 text-sm flex items-center gap-1.5">
              Made with ❤️ for Bharat 🇮🇳
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
