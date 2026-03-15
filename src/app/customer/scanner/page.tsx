"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  QrCode, 
  Camera, 
  AlertCircle, 
  Search, 
  CheckCircle2, 
  Loader2,
  ArrowLeft,
  ScanLine
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

type ScannerState = 'idle' | 'requesting' | 'scanning' | 'success' | 'denied' | 'error';

export default function QRScanner() {
  const router = useRouter();
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // State
  const [state, setState] = useState<ScannerState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scannedBusinessName, setScannedBusinessName] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (scanningTimeoutRef.current) {
      clearTimeout(scanningTimeoutRef.current);
      scanningTimeoutRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log("Track stopped:", track.label);
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const handleScanSuccess = async (businessId: string) => {
    stopCamera();
    setState('success');
    
    // Attempt to fetch business name for success UI
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('name')
        .eq('id', businessId)
        .maybeSingle();
      
      if (data) {
        setScannedBusinessName(data.name);
      }
    } catch (err) {
      console.error("Error fetching business info:", err);
    }
    
    // Navigate after a delay
    setTimeout(() => {
      router.push(`/b/${businessId}`);
    }, 2000);
  };

  const processFrame = useCallback(async () => {
    if (state !== 'scanning' || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const jsQR = (await import('jsqr')).default;
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          const data = code.data;
          console.log("QR Detected:", data);
          
          let businessId = '';
          const urlMatch = data.match(/queueless-india\.vercel\.app\/b\/([^/?#\s]+)/i);
          
          if (urlMatch) {
            businessId = urlMatch[1];
          } else if (data && !data.includes('/') && !data.includes(' ') && data.length > 2) {
            // Treat as direct slug
            businessId = data;
          }

          if (businessId) {
            handleScanSuccess(businessId);
            return; // Stop the loop
          } else {
            toast.error("Not a QueueLess QR code", {
              id: "qr-recognition-error",
              duration: 2000
            });
          }
        }
      }
    }

    // Continue scanning every 300ms
    scanningTimeoutRef.current = setTimeout(processFrame, 300);
  }, [state]);

  const startCamera = async () => {
    setState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        
        // Wait for video to be ready before starting detection loop
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            setState('scanning');
          });
        };
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

  useEffect(() => {
    if (state === 'scanning') {
      processFrame();
    }
    return () => {
      if (scanningTimeoutRef.current) clearTimeout(scanningTimeoutRef.current);
    };
  }, [state, processFrame]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0F] text-white font-sans overflow-hidden flex flex-col">
      
      {/* HEADER */}
      <div className="absolute top-0 inset-x-0 z-[60] p-6 flex items-center justify-between bg-gradient-to-b from-[#0A0A0F]/80 to-transparent bg-opacity-95">
        <Link href="/home" className="p-3 bg-white/5 bg-opacity-95 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
          <ArrowLeft size={24} />
        </Link>
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Business Scanner</span>
        <div className="w-12 h-12" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        
        <AnimatePresence mode="wait">
          {(state === 'idle' || state === 'requesting') && (
            <motion.div 
              key="permission"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center max-w-sm space-y-8"
            >
              <div className="relative mx-auto">
                <div className="w-24 h-24 bg-[#00F5A0]/10 rounded-3xl flex items-center justify-center mx-auto border border-[#00F5A0]/20 text-[#00F5A0]">
                  <Camera size={48} strokeWidth={1.5} />
                </div>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-[#00F5A0]/20 rounded-3xl blur-2xl"
                />
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-black tracking-tight">Camera Access</h2>
                <p className="text-zinc-400 font-medium leading-relaxed">
                  Scan a business QR code to instantly join their virtual queue and track your position live.
                </p>
              </div>

              <button 
                onClick={startCamera}
                disabled={state === 'requesting'}
                className="w-full py-5 bg-[#00F5A0] text-[#0A0A0F] rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#00F5A0]/20 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {state === 'requesting' ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    initializing...
                  </>
                ) : (
                  <>
                    Allow Camera
                    <CheckCircle2 size={18} />
                  </>
                )}
              </button>
            </motion.div>
          )}

          {state === 'scanning' && (
            <motion.div 
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-10 w-full h-full"
            >
              <video 
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />

              <canvas ref={canvasRef} className="hidden" />

              {/* OVERLAY */}
              <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center">
                <div className="absolute inset-0 border-[60px] border-black/40 md:border-[100px]" />
                
                <div className="relative w-[75vw] h-[75vw] max-w-[300px] max-h-[300px]">
                  {/* Corners */}
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-[#00F5A0] rounded-tl-2xl shadow-[0_0_15px_rgba(0,245,160,0.5)]" />
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-[#00F5A0] rounded-tr-2xl shadow-[0_0_15px_rgba(0,245,160,0.5)]" />
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-[#00F5A0] rounded-bl-2xl shadow-[0_0_15px_rgba(0,245,160,0.5)]" />
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-[#00F5A0] rounded-br-2xl shadow-[0_0_15px_rgba(0,245,160,0.5)]" />
                  
                  {/* Scanline */}
                  <motion.div 
                    animate={{ top: ['0%', '100%', '0%'] }} 
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00F5A0] to-transparent shadow-[0_0_12px_rgba(0,245,160,0.8)] z-30"
                  />

                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <QrCode size={100} className="text-white" strokeWidth={1} />
                  </div>
                </div>

                <div className="mt-12 text-center">
                  <div className="bg-[#0A0A0F]/60 bg-opacity-95 px-6 py-3 rounded-full border border-white/5 inline-flex items-center gap-2">
                    <ScanLine size={16} className="text-[#00F5A0] animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00F5A0]">Align QR Code</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {state === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              <div className="relative mx-auto w-24 h-24">
                <div className="w-full h-full bg-[#00F5A0] rounded-full flex items-center justify-center shadow-2xl shadow-[#00F5A0]/20">
                  <CheckCircle2 size={48} className="text-[#0A0A0F]" />
                </div>
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 bg-[#00F5A0] rounded-full"
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-[#00F5A0] font-black uppercase tracking-widest text-[10px]">QR Recognized</p>
                <h2 className="text-3xl font-black tracking-tight">{scannedBusinessName || "Success!"}</h2>
                <div className="flex items-center justify-center gap-3 text-zinc-500 font-medium">
                  <Loader2 size={16} className="animate-spin" />
                  Joining queue...
                </div>
              </div>
            </motion.div>
          )}

          {state === 'denied' && (
            <motion.div 
              key="denied"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-sm space-y-6"
            >
              <div className="w-20 h-20 bg-rose-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-rose-500 border border-rose-500/20">
                <AlertCircle size={40} />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-black tracking-tight">Access Blocked</h2>
                <p className="text-zinc-500 font-medium text-sm leading-relaxed px-4">
                  Camera permission is required to scan QR codes. Please enable it in your browser settings.
                </p>
              </div>
              <div className="p-5 bg-white/5 border border-white/10 rounded-2xl text-left space-y-4">
                <div>
                  <p className="text-[10px] font-black text-[#00F5A0] uppercase tracking-widest mb-2">How to fix:</p>
                  <ul className="text-xs text-zinc-400 space-y-3">
                    <li className="flex gap-3">
                      <span className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center shrink-0">1</span>
                      <span>Tap the <b>Lock icon</b> 🔒 in your address bar</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center shrink-0">2</span>
                      <span>Switch <b>Camera</b> toggle to <b>On</b></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center shrink-0">3</span>
                      <span>Refresh this page to start scanning</span>
                    </li>
                  </ul>
                </div>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all text-sm"
              >
                Refresh Page
              </button>
            </motion.div>
          )}

          {state === 'error' && (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center max-w-sm space-y-6"
            >
              <div className="w-20 h-20 bg-rose-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-rose-500">
                <AlertCircle size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight">Connection Failed</h2>
                <p className="text-zinc-500 font-medium text-sm">
                  {errorMessage || "We couldn't access your camera. Make sure no other app is using it."}
                </p>
              </div>
              <button 
                onClick={startCamera}
                className="px-8 py-4 bg-[#00F5A0] text-[#0A0A0F] rounded-xl font-black uppercase tracking-widest text-[10px]"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* FOOTER FALLBACK */}
      <div className="p-6 relative z-[60]">
        <Link 
          href="/map" 
          className="w-full py-4 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-center gap-3 text-zinc-500 hover:text-white hover:bg-white/5 transition-all group"
        >
          <span className="font-bold text-sm">Use Manual Search Instead</span>
          <ArrowLeft size={18} className="rotate-180 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* INDICATOR */}
      <div className="pb-4 flex justify-center">
        <div className="w-16 h-1 bg-zinc-800 rounded-full" />
      </div>
    </div>
  );
}
