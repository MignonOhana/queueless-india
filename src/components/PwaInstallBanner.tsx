"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { useAuth } from "@/context/AuthContext";

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // 1. Visit Count Logic
    const visitCount = parseInt(localStorage.getItem("visit_count") || "0");
    localStorage.setItem("visit_count", (visitCount + 1).toString());

    // 2. Dismiss logic
    const isDismissed = localStorage.getItem("pwa_dismissed") === "true";

    // 3. Capture install prompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Only show to customers with >= 2 visits who haven't dismissed it
      if (
        visitCount + 1 >= 2 && 
        !isDismissed && 
        user?.role === "customer"
      ) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [user]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      track("pwa_installed");
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa_dismissed", "true");
    setIsVisible(false);
    track("pwa_install_dismissed");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-indigo-600/95 backdrop-blur-md border border-white/20 p-4 rounded-3xl shadow-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-inner">
            🎫
          </div>
          <div>
            <h3 className="text-white font-bold leading-tight">Install QueueLess</h3>
            <p className="text-indigo-100 text-xs">Skip queues faster from your home screen</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDismiss}
            className="p-2 text-indigo-200 hover:text-white transition-colors"
          >
            Later
          </button>
          <button
            onClick={handleInstall}
            className="px-4 py-2 bg-white text-indigo-600 font-bold rounded-xl shadow-lg active:scale-95 transition-all text-sm"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
