'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Zap, Bell, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    // Don't show if already running as installed PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    if (isStandalone) return

    // Don't show if permanently dismissed
    const dismissed = localStorage.getItem('pwa_install_dismissed')
    if (dismissed === 'permanent') return

    // Don't show if dismissed within last 3 days
    if (dismissed) {
      const threeDays = 3 * 24 * 60 * 60 * 1000
      if (Date.now() - Number(dismissed) < threeDays) return
    }

    // Don't show if already installed
    if (localStorage.getItem('pwa_installed') === 'true') return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show after 3 seconds so page feels settled
      setTimeout(() => setShowBanner(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      localStorage.setItem('pwa_installed', 'true')
      setShowBanner(false)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    setIsInstalling(true)
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        localStorage.setItem('pwa_installed', 'true')
        setShowBanner(false)
      }
    } catch (err) {
      console.error('PWA install error:', err)
    } finally {
      setIsInstalling(false)
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
    // Remember dismissal timestamp (will re-show after 3 days)
    localStorage.setItem('pwa_install_dismissed', String(Date.now()))
  }

  const handleNeverShow = () => {
    setShowBanner(false)
    localStorage.setItem('pwa_install_dismissed', 'permanent')
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 140, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 140, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          className="fixed bottom-0 left-0 right-0 z-[200] p-3 pb-5 md:bottom-6 md:left-auto md:right-6 md:max-w-[360px]"
        >
          <div className="relative bg-[#0f0f17] border border-white/10 rounded-[2rem] shadow-2xl shadow-black/60 overflow-hidden">
            {/* Animated gradient top bar */}
            <div className="h-1 w-full bg-gradient-to-r from-[#00F5A0] via-[#00cfff] to-[#00F5A0] bg-[length:200%_100%] animate-[gradientShift_3s_linear_infinite]" />

            {/* Glow blob */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#00F5A0]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all z-10"
              aria-label="Dismiss"
            >
              <X size={13} />
            </button>

            <div className="p-5 pr-12 relative z-10">
              {/* App identity */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00F5A0] to-[#00cfff] flex items-center justify-center shadow-xl shadow-[#00F5A0]/30 shrink-0">
                  <span className="text-black font-black text-2xl">Q</span>
                </div>
                <div>
                  <p className="font-black text-white leading-none mb-1">QueueLess India</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00F5A0] animate-pulse" />
                    <p className="text-[10px] font-bold text-[#00F5A0] uppercase tracking-widest">Free App</p>
                  </div>
                </div>
              </div>

              {/* Text */}
              <h3 className="text-white font-black text-lg leading-tight mb-1.5">
                Install for the best<br />experience 🚀
              </h3>
              <p className="text-zinc-400 text-xs font-medium mb-4 leading-relaxed">
                Faster loading, instant queue alerts, and works even when offline.
              </p>

              {/* Features */}
              <div className="flex gap-2 flex-wrap mb-5">
                {[
                  { icon: Zap, label: 'Instant Load' },
                  { icon: Bell, label: 'Queue Alerts' },
                  { icon: Smartphone, label: 'Offline Ready' },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#00F5A0]/5 border border-[#00F5A0]/20 rounded-full"
                  >
                    <Icon size={10} className="text-[#00F5A0]" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300">{label}</span>
                  </span>
                ))}
              </div>

              {/* Install CTA */}
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="w-full flex items-center justify-center gap-2.5 bg-[#00F5A0] text-black font-black py-4 rounded-2xl text-sm uppercase tracking-widest shadow-lg shadow-[#00F5A0]/30 hover:bg-[#00e090] active:scale-[0.97] transition-all disabled:opacity-60 mb-2"
              >
                <Download size={16} strokeWidth={3} />
                {isInstalling ? 'Installing...' : 'Add to Home Screen'}
              </button>

              {/* Never show again link */}
              <button
                onClick={handleNeverShow}
                className="w-full text-center text-zinc-600 text-[10px] font-bold hover:text-zinc-400 transition-colors py-1"
              >
                Don't show again
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
