"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. High-intent Gate: Only show after they've joined a queue at least once
    const hasJoinedQueue = localStorage.getItem("has_joined_queue") === "true";
    const isDismissed = localStorage.getItem("pwa_install_dismissed") === "true";
    const isInstalled = localStorage.getItem("pwa_installed") === "true";

    if (!hasJoinedQueue || isDismissed || isInstalled) return;

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    // Custom trigger for when join happens in the same session
    window.addEventListener("trigger-pwa-install", () => {
        if (deferredPrompt) setIsVisible(true);
    });

    return () => {
        window.removeEventListener("beforeinstallprompt", handler);
        window.removeEventListener("trigger-pwa-install", () => {});
    };
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      track("pwa_installed");
      localStorage.setItem("pwa_installed", "true");
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa_install_dismissed", "true");
    setIsVisible(false);
    track("pwa_install_dismissed");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-zinc-900 border border-white/10 p-4 rounded-3xl shadow-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
            📱
          </div>
          <div>
            <h3 className="text-white font-bold text-sm tracking-tight">Install QueueLess</h3>
            <p className="text-zinc-500 text-[10px]">Get alerts even when your browser is closed</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDismiss}
            className="p-2 text-zinc-500 hover:text-white transition-colors"
          >
            ✕
          </button>
          <button
            onClick={handleInstall}
            className="px-4 py-2 bg-indigo-600 text-white font-black rounded-xl shadow-lg active:scale-95 transition-all text-[10px] uppercase tracking-widest"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
