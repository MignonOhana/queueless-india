"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  QrCode, 
  Camera, 
  AlertCircle, 
  Search, 
  CheckCircle2, 
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import jsQR from 'jsqr';
import { toast } from 'sonner';

type ScannerState = 'idle' | 'requesting' | 'scanning' | 'success' | 'denied' | 'error';

export default function QRScanner() {
  const router = useRouter();
  
  // Refs for media
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // State
  const [state, setState] = useState<ScannerState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scannedBusiness, setScannedBusiness] = useState<string | null>(null);
  const [lastScanTime, setLastScanTime] = useState(0);

  // Cleanup helper
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Request camera access
  const startCamera = async () => {
    setState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS Safari
        videoRef.current.play();
        setState('scanning');
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setState('denied');
      } else {
        setState('error');
        setErrorMessage(err.message || "Failed to access camera");
      }
    }
  };

  // Processing loop
  const scanFrame = useCallback(() => {
    if (state !== 'scanning' || !videoRef.current || !canvasRef.current) return;

    const now = Date.now();
    // Scan every 300ms
    if (now - lastScanTime >= 300) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d', { willReadFrequently: true });

      if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
        // Set canvas size to match video aspect ratio for decoding
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          processDecodedData(code.data);
        }
      }
      setLastScanTime(now);
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  }, [state, lastScanTime]);

  // Handle detected data
  const processDecodedData = (data: string) => {
    // Check if it matches: queueless-india.vercel.app/b/[businessId]
    // Or just a plain businessId (e.g. city-hospital)
    let businessId = '';
    
    // Pattern helper
    const urlPattern = /queueless-india\.vercel\.app\/b\/([^/?#\s]+)/i;
    const match = data.match(urlPattern);

    if (match) {
      businessId = match[1];
    } else if (data && !data.includes('/') && !data.includes(' ')) {
      // Treat as a direct slug if it's reasonably formatted
      businessId = data;
    }

    if (businessId) {
      // Success!
      stopCamera();
      setState('success');
      setScannedBusiness(businessId);
      
      // Navigate after a short success pause
      setTimeout(() => {
        router.push(`/b/${businessId}`);
      }, 1500);
    } else {
      // Unrecognized
      toast.error("Not a QueueLess QR code", {
        id: "qr-recognition-error",
        duration: 2000
      });
    }
  };

  useEffect(() => {
    if (state === 'scanning') {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [state, scanFrame]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0F] text-white font-sans overflow-hidden">
      
      {/* HEADER */}
      <div className="absolute top-0 inset-x-0 z-50 p-6 flex items-center justify-between bg-gradient-to-b from-[#0A0A0F] to-transparent">
        <Link href="/home" className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Scan QR Code</h1>
        <div className="w-12 h-12" /> {/* Spacer */}
      </div>

      <main className="h-full flex flex-col items-center justify-center p-6">
        
        <AnimatePresence mode="wait">
          {state === 'idle' || state === 'requesting' ? (
            <motion.div 
              key="permission"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center max-w-sm space-y-8"
            >
              <div className="w-24 h-24 bg-[#00F5A0]/10 rounded-[2.5rem] flex items-center justify-center mx-auto border border-[#00F5A0]/20 text-[#00F5A0]">
                <Camera size={48} />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight mb-3">Join Instantly</h2>
                <p className="text-zinc-500 font-medium leading-relaxed">
                  Scan a business QR code to skip the wait and join their virtual queue in one tap.
                </p>
              </div>
              <button 
                onClick={startCamera}
                disabled={state === 'requesting'}
                className="w-full py-5 bg-[#00F5A0] text-[#0A0A0F] rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-[#00F5A0]/10 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {state === 'requesting' ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Requesting...
                  </>
                ) : (
                  <>
                    Allow Camera Access
                    <CheckCircle2 size={18} />
                  </>
                )}
              </button>
            </motion.div>
          ) : state === 'scanning' ? (
            <motion.div 
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-10 w-full h-full flex flex-col items-center justify-center pt-24"
            >
              <video 
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />

              {/* Hiddan canvas for processing */}
              <canvas ref={canvasRef} className="hidden" />

              {/* SCAN OVERLAY */}
              <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-black/40" />
                
                {/* Clear viewport for scanning */}
                <div className="relative w-72 h-72">
                  <div className="absolute inset-0 shadow-[0_0_0_9999px_rgba(10,10,15,0.6)]" />
                  
                  {/* Corner brackets */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[#00F5A0] rounded-tl-3xl shadow-[0_0_15px_rgba(0,245,160,0.3)]" />
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[#00F5A0] rounded-tr-3xl shadow-[0_0_15px_rgba(0,245,160,0.3)]" />
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[#00F5A0] rounded-bl-3xl shadow-[0_0_15px_rgba(0,245,160,0.3)]" />
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[#00F5A0] rounded-br-3xl shadow-[0_0_15px_rgba(0,245,160,0.3)]" />
                  
                  {/* Scanline */}
                  <motion.div 
                    animate={{ y: [0, 280, 0] }} 
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-[#00F5A0] to-transparent shadow-[0_0_20px_rgba(0,245,160,0.8)]"
                  />
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <QrCode size={48} className="text-[#00F5A0]" />
                  </div>
                </div>

                <div className="mt-12 text-center space-y-2">
                  <p className="font-black uppercase tracking-[0.2em] text-[#00F5A0] text-xs">Align QR Code</p>
                  <p className="text-zinc-400 text-sm font-medium">Scanning for businesses...</p>
                </div>
              </div>
            </motion.div>
          ) : state === 'success' ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-24 h-24 bg-[#00F5A0] rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-[#00F5A0]/20">
                <CheckCircle2 size={48} className="text-[#0A0A0F]" />
              </div>
              <div>
                <p className="text-[#00F5A0] font-black uppercase tracking-widest text-xs mb-2">QR Recognized</p>
                <h2 className="text-3xl font-black tracking-tight mb-2">Finding Store...</h2>
                <p className="text-zinc-500 font-medium">Redirecting you to the business page</p>
              </div>
              <div className="flex justify-center">
                <Loader2 size={32} className="animate-spin text-zinc-700" />
              </div>
            </motion.div>
          ) : state === 'denied' ? (
            <motion.div 
              key="denied"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center max-w-sm space-y-6"
            >
              <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto text-rose-500">
                <AlertCircle size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight mb-3 text-white">Permission Denied</h2>
                <p className="text-zinc-500 font-medium text-sm leading-relaxed">
                  We need camera access to scan QR codes. Please enable camera permission in your browser settings and refresh the page.
                </p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-left">
                <p className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-widest">How to enable:</p>
                <ol className="text-xs text-zinc-500 space-y-2 list-decimal list-inside">
                  <li>Tap the lock or settings icon in your browser bar</li>
                  <li>Find "Camera" and set to "Allow"</li>
                  <li>Reload this page</li>
                </ol>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center max-w-sm space-y-6"
            >
              <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto text-rose-500">
                <AlertCircle size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight mb-2 text-white">Oops! Something went wrong</h2>
                <p className="text-zinc-500 font-medium text-sm">
                  {errorMessage || "We couldn't access your camera. Make sure no other app is using it."}
                </p>
              </div>
              <button 
                onClick={startCamera}
                className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all text-sm"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTTOM FALLBACK */}
        {(state !== 'success' && state !== 'scanning') && (
          <div className="absolute bottom-12 inset-x-6">
            <Link 
              href="/map" 
              className="w-full py-5 rounded-[2rem] border border-white/10 flex items-center justify-center gap-3 text-zinc-400 hover:text-white hover:bg-white/5 transition-all group"
            >
              <span className="font-bold text-sm">Use Manual Search Instead</span>
              <Search size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}

      </main>

      {/* FOOTER INDICATOR */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-1 bg-zinc-800 rounded-full" />
    </div>
  );
}
