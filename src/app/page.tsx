"use client";

import { useState, useEffect } from "react";
import { Clock, Download } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Lazy-load the heavy sections
const HeroSection = dynamic(() => import("@/components/landing/HeroSection"), { ssr: false });
import ProblemSection from "@/components/landing/ProblemSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import LiveDemoSection from "@/components/landing/LiveDemoSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/landing/PricingSection";
import SocialProofSection from "@/components/landing/SocialProofSection";
import CTASection from "@/components/landing/CTASection";

export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);

  useEffect(() => {
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone
    );
    setIsMobile(/iphone|ipad|ipod|android/i.test(navigator.userAgent.toLowerCase()));
  }, []);

  const triggerInstall = () => {
    window.dispatchEvent(new Event("show-pwa-prompt"));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] font-sans overflow-x-hidden">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #00F5A0, #00D4FF)" }}
            >
              <Clock className="w-5 h-5 text-black" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              QueueLess <span style={{ color: "#00F5A0" }}>India</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/home"
              className="text-sm font-bold text-slate-400 hover:text-white transition-colors hidden sm:block"
            >
              Find a Queue
            </Link>
            <Link
              href="/customer/dashboard"
              className="text-sm font-bold text-[#00F5A0] hover:brightness-110 transition-colors hidden sm:block"
            >
              My Tokens
            </Link>
            {isMobile && !isStandalone && (
              <button
                onClick={triggerInstall}
                className="flex items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-white transition-colors hidden sm:flex"
              >
                <Download size={14} /> Install App
              </button>
            )}
            <Link
              href="/login"
              className="text-sm font-bold text-slate-400 hover:text-white transition-colors hidden sm:block"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-white text-black px-5 py-2.5 rounded-full font-bold text-sm hover:bg-slate-100 transition-all shadow-md active:scale-95"
            >
              For Businesses
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Sections ── */}
      <div className="pt-20">
        <HeroSection />
      </div>

      <ProblemSection />
      <HowItWorksSection />
      <LiveDemoSection />
      <FeaturesSection />
      <PricingSection />
      <SocialProofSection />
      <CTASection />
    </div>
  );
}
