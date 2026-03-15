"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Maximize, X } from "lucide-react";

interface CameraScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export default function CameraScanner({ onScanSuccess, onClose }: CameraScannerProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Standardize IDs for html5-qrcode
    const qrcodeRegionId = "qr-reader";

    // Initialize the scanner with a sleek modern UI overlay style
    const html5QrcodeScanner = new Html5QrcodeScanner(
      qrcodeRegionId,
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
      /* verbose= */ false
    );

    html5QrcodeScanner.render(
      (decodedText) => {
        // Trigger generic device vibration on successful scan if supported
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
        
        // Cleanup the camera stream immediately
        html5QrcodeScanner.clear().catch(console.error);
        
        // Pass the result to the parent queue router
        onScanSuccess(decodedText);
      },
      (errorMessage) => {
        // We ignore generic per-frame read errors as they are noisy.
        // We only care if the camera initialization itself fails.
        if (errorMessage.includes("NotAllowedError") || errorMessage.includes("Permission denied")) {
           setError("Camera permission denied. Please allow camera access to scan.");
        }
      }
    );

    return () => {
      // Ensure we clear the camera stream when the component unmounts
      html5QrcodeScanner.clear().catch(e => console.error("Failed to clear html5-qrcode scanner", e));
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 bg-opacity-95 flex flex-col items-center justify-center animate-in fade-in duration-300">
      
      {/* Top action bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 text-white">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Maximize size={20} className="text-orange-500" /> Frame QR Code
        </h2>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/10"
        >
          <X size={20} />
        </button>
      </div>

      {/* Camera feed container */}
      <div className="w-full max-w-sm px-6">
        <div className="bg-slate-900 border-2 border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl relative">
          
          {error ? (
            <div className="aspect-square flex flex-col justify-center items-center text-center p-8 text-rose-400 bg-rose-500/10">
              <span className="font-bold mb-2">Access Denied</span>
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <>
              {/* html5-qrcode injects its DOM here */}
              <div id="qr-reader" className="w-full relative [&_video]:object-cover" />
              
              {/* Overlay targeting frame */}
              <div className="absolute inset-x-8 inset-y-8 border-2 border-white/30 rounded-2xl pointer-events-none flex items-center justify-center">
                 <div className="w-full h-[2px] bg-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
              </div>
            </>
          )}

        </div>
        
        <p className="text-center text-slate-400 font-medium text-sm mt-8">
          Position the camera over the store's QR code to instantly join the virtual queue.
        </p>
      </div>
    </div>
  );
}
