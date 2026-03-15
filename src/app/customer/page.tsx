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
import GeoTracker from "@/components/GeoTracker";
import PageTransition from "@/components/PageTransition";

import { QrCode, Sparkles } from "lucide-react";

import Link from "next/link";
import FastAuth from "@/components/FastAuth";
import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function CustomerAppContent() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const savedOrg = localStorage.getItem("active_org");
    const savedToken = localStorage.getItem("active_token");
    if (savedOrg && savedToken) {
      router.push(`/customer/queue/${savedOrg}/${savedToken}`);
    } else {
      setIsChecking(false); // Stop checking and show Auth UI
    }
  }, [router]);

  const handleAuthSuccess = (userId: string) => {
     // After fast auth, route to their personalized dashboard
     router.push(`/customer/dashboard`);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black font-sans flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="font-bold tracking-widest uppercase text-slate-500 text-sm">Verifying Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-8 left-8">
        <button onClick={() => router.push('/')} className="w-10 h-10 bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center text-slate-900 dark:text-white hover:scale-105 transition-transform">
          <ArrowLeft size={20} />
        </button>
      </div>
      <div className="w-full max-w-md">
         <FastAuth onSuccess={handleAuthSuccess} />
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
