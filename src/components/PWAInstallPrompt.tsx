"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share, PlusSquare } from "lucide-react";

export default function PWAInstallPrompt() {
  const [isReady, setIsReady] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);

  useEffect(() => {
    // Only run on client
    setIsReady(true);

    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');

    if (isStandalone) return;

    // Check if user dismissed recently
    const dismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 1000 * 60 * 60 * 24 * 7) {
       // Hide for 7 days if dismissed
       return;
    }

    // 1. Android / Chrome Detection
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show our custom UI
      setShowAndroidPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 2. iOS Safari Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|chromium|crios|opr|opera|fxios|edgios/.test(userAgent);

    let timer: NodeJS.Timeout;
    if (isIOS && isSafari) {
      // Show iOS prompt after 3 seconds so it's not too aggressive
      timer = setTimeout(() => setShowIOSPrompt(true), 3000);
    }

    // 3. Custom native button trigger
    const handleCustomTrigger = () => {
      if (isIOS && isSafari) {
        setShowIOSPrompt(true);
      } else {
        setShowAndroidPrompt(true);
      }
    };
    window.addEventListener('show-pwa-prompt', handleCustomTrigger as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('show-pwa-prompt', handleCustomTrigger as EventListener);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const dismissPrompt = () => {
    setShowIOSPrompt(false);
    setShowAndroidPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the native prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    // Clear the deferredPrompt variable
    setDeferredPrompt(null);
    setShowAndroidPrompt(false);
  };

  if (!isReady) return null;

  return (
    <AnimatePresence>
      {/* Android Prompt */}
      {showAndroidPrompt && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 z-50 flex items-start gap-4"
        >
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
            <span className="font-extrabold text-xl">Q</span>
          </div>
          <div className="flex-1">
             <h3 className="font-bold text-slate-900 dark:text-white text-md mb-1">Install QueueLess App</h3>
             <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">Install our app to join queues faster and view live wait times offline.</p>
             <div className="flex gap-3">
                <button onClick={handleAndroidInstall} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-bold text-sm transition-colors">Install App</button>
             </div>
          </div>
          <button onClick={dismissPrompt} className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
             <X size={20} />
          </button>
        </motion.div>
      )}

      {/* iOS Safari Prompt Box */}
      {showIOSPrompt && (
        <motion.div 
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-200/50 dark:border-slate-800/50 z-50"
        >
          <button onClick={dismissPrompt} className="absolute top-3 right-3 p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={18} />
          </button>
          
           <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2 text-center">Get the QueueLess App</h3>
           <p className="text-slate-500 dark:text-slate-400 text-sm mb-5 text-center px-4">
             Track your active queues effortlessly without leaving Safari open.
           </p>

           <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex flex-col items-center justify-center text-center border border-slate-100 dark:border-slate-800">
             <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
               1. Tap the Share button <Share size={18} className="text-blue-500 shrink-0" />
             </p>
             <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
               2. Tap "Add to Home Screen" <PlusSquare size={18} className="text-slate-900 dark:text-white shrink-0" />
             </p>
           </div>
           
           <div className="w-4 h-4 bg-white/90 dark:bg-slate-900/90 border-b border-r border-slate-200/50 dark:border-slate-800/50 absolute -bottom-2 left-1/2 -translate-x-1/2 rotate-45" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
