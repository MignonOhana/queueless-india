"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, ArrowLeft, HeartPulse, Pill, Activity, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { joinQueue } from "@/lib/queueService";
import { useCustomerQueue } from "@/lib/useCustomerQueue";
import { useLanguage, Language } from "@/context/LanguageContext";
import { generateQueuePredictionStatement } from "@/lib/ai-queue-engine";
import FloatChatWidget from "@/components/AIChat";
import CameraScanner from "@/components/QR/CameraScanner";
import GeoTracker from "@/components/GeoTracker";
import PageTransition from "@/components/PageTransition";

import { QrCode, Sparkles } from "lucide-react";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function CustomerAppContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showScanner, setShowScanner] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const savedOrg = localStorage.getItem("active_org");
    const savedToken = localStorage.getItem("active_token");
    if (savedOrg && savedToken) {
      router.push(`/customer/queue/${savedOrg}/${savedToken}`);
    } else {
      router.push(`/home`);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="font-bold tracking-widest uppercase text-slate-500 text-sm">Loading QueueLess...</p>
      </div>
    </div>
  );
}

export default function CustomerApp() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">Loading queue info...</div>}>
      <CustomerAppContent />
    </Suspense>
  );
}
