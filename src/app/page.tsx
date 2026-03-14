"use client";

import { useState, useEffect } from "react";
import { Clock, Download } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Navigation from "@/components/Navigation";

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
    <div className="min-h-screen bg-background font-sans overflow-x-hidden">
      {/* ── Navigation ── */}
      <Navigation />

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
