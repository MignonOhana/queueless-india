'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Visit Count Tracking
    const currentCount = parseInt(localStorage.getItem('visit_count') || '0');
    if (currentCount < 10) { // Limit sanity check
       localStorage.setItem('visit_count', (currentCount + 1).toString());
    }

    // 2. Dismissal Logic
    const isDismissed = localStorage.getItem('pwa_prompt_dismissed') === 'true';
    if (isDismissed) return;

    // 3. iOS Standalone detection
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    if (isStandalone) return;

    // iOS Detection
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    // 4. Custom Event listener for targeted triggers
    const handleTrigger = () => {
      const count = parseInt(localStorage.getItem('visit_count') || '0');
      if (count >= 2) {
        if (isIOSDevice) {
          setIsIOS(true);
          setShowPrompt(true);
        } else if (deferredPrompt) {
          setShowPrompt(true);
        }
      }
    };

    window.addEventListener('trigger-pwa-install', handleTrigger);

    // Standard beforeinstallprompt for Android/Chrome
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // We don't auto-show here anymore per user request (show after join)
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('trigger-pwa-install', handleTrigger);
    };
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const dismiss = () => {
    localStorage.setItem('pwa_prompt_dismissed', 'true');
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-4 right-4 z-[9999] md:left-auto md:right-6 md:w-96"
        >
          <div className="bg-zinc-900/90 bg-opacity-95 border border-white/10 p-5 rounded-2xl shadow-2xl relative overflow-hidden group">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <button 
              onClick={dismiss}
              className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                {isIOS ? <Smartphone size={24} /> : <Download size={24} />}
              </div>
              
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm mb-1">
                  Add QueueLess to your home screen for instant updates
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed mb-4">
                  {isIOS 
                    ? "Tap the Share icon below and then 'Add to Home Screen' for faster queue access."
                    : "Install our app for a faster experience and offline queue tracking."}
                </p>

                {!isIOS && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleInstall}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-lg transition-all active:scale-95"
                    >
                      Install Now
                    </button>
                    <button
                      onClick={dismiss}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-medium text-xs rounded-lg transition-all"
                    >
                      Maybe Later
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
