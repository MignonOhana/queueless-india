"use client";

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useRouter } from 'next/navigation';
import { X, QrCode, Building2, Clock, Users, Activity, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Mock data for a scanned store
const mockStoreData = {
  id: "city-hospital",
  name: "City Hospital",
  location: "Andheri East, Mumbai",
  services: [
    { id: "opd", name: "OPD Consultation", waitTime: 15, load: "yellow", peopleWaiting: 12 },
    { id: "billing", name: "Billing & Discharge", waitTime: 5, load: "green", peopleWaiting: 2 },
    { id: "lab", name: "Laboratory", waitTime: 45, load: "red", peopleWaiting: 28 },
    { id: "pharmacy", name: "Pharmacy", waitTime: 10, load: "green", peopleWaiting: 4 }
  ]
};

export default function QRScanner() {
  const [mounted, setMounted] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!mounted || scannedData) return;

    if (scannerRef.current) return;

    const element = document.getElementById('qr-reader');
    if (!element) return;

    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
      false
    );

    scannerRef.current.render((decodedText) => {
      // Vibration haptics for mobile
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(200);
      }

      // Simulate instantly finding the store on any scan for demo purposes
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
      setScannedData(decodedText);
      // In a real app we would fetch the exact store details via the decodedText ID here.
    }, (err) => {
        // Just ignore errors while scanning
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error("Failed to clear scanner", e));
        scannerRef.current = null;
      }
    };
  }, [mounted, scannedData]);

  if (!mounted) return null;

  const handleJoinQueue = (serviceId: string) => {
    setIsJoining(true);
    // Simulate API Call delay
    setTimeout(() => {
      // Generate dummy token
      const token = `${serviceId.substring(0,1).toUpperCase()}-${Math.floor(Math.random() * 80) + 10}`;
      router.push(`/customer/queue/${mockStoreData.id}/${token}`);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col items-center justify-center font-sans overflow-hidden">
      
      {/* Background blur map */}
      <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/77.2090,28.6139,12,0/800x800?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJDSU5lLVlnIn0.123')] bg-cover bg-center opacity-20 blur-md pointer-events-none" />
      
      {!scannedData && (
        <Link href="/customer" className="absolute top-6 left-6 z-50 text-white bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-white/20 transition-all border border-white/10 shadow-lg">
          <X size={24} />
        </Link>
      )}
      
      <AnimatePresence mode="wait">
        {!scannedData ? (
          <motion.div 
            key="scanner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 w-full h-full flex flex-col items-center justify-center bg-black"
          >
            {/* The actual video feed container */}
            <div id="qr-reader" className="absolute inset-0 w-full h-full object-cover [&_video]:object-cover [&_video]:w-full [&_video]:h-full [&>div]:hidden [&_video]:!block">
               {/* html5-qrcode injects here automatically */}
            </div>

            {/* Custom Overlay Scanning Frame */}
            <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
               <div className="relative w-64 h-64 border-2 border-indigo-500 rounded-3xl grid place-items-center">
                  {/* Corner accents */}
                  <div className="absolute -top-[2px] -left-[2px] w-8 h-8 border-t-4 border-l-4 border-indigo-400 rounded-tl-3xl"></div>
                  <div className="absolute -top-[2px] -right-[2px] w-8 h-8 border-t-4 border-r-4 border-indigo-400 rounded-tr-3xl"></div>
                  <div className="absolute -bottom-[2px] -left-[2px] w-8 h-8 border-b-4 border-l-4 border-indigo-400 rounded-bl-3xl"></div>
                  <div className="absolute -bottom-[2px] -right-[2px] w-8 h-8 border-b-4 border-r-4 border-indigo-400 rounded-br-3xl"></div>
                  
                  {/* Scanning scanline animation */}
                  <motion.div 
                    animate={{ y: [0, 240, 0] }} 
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 inset-x-4 h-0.5 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)]"
                  />
               </div>
               
               <p className="text-white mt-10 font-bold tracking-widest uppercase text-sm bg-black/30 px-6 py-3 rounded-full backdrop-blur-xl border border-white/10 flex items-center gap-2">
                 <QrCode size={18} className="text-indigo-400" />
                 Scan to Join Queue
               </p>
            </div>
            
            {/* Developer Tool: Simulate Scan Button positioned at safe bottom */}
            <button 
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(200);
                setScannedData("demo-scan-123");
              }} 
              className="absolute bottom-32 z-30 px-6 py-4 rounded-xl bg-white/10 text-white font-bold backdrop-blur-xl border border-white/20 active:scale-95 transition-transform"
            >
              Simulate Scan For Demo
            </button>
          </motion.div>

        ) : (

          <motion.div 
            key="preview"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-0 inset-x-0 w-full h-[85vh] rounded-t-[2.5rem] md:h-auto md:max-w-md md:rounded-[2.5rem] md:static bg-slate-50 dark:bg-slate-900 overflow-hidden flex flex-col shadow-2xl z-50 border-t border-slate-200 dark:border-slate-800"
          >
             {/* Mobile bottom sheet drag handle */}
             <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-4 mb-2 md:hidden" />
             <div className="absolute top-4 right-4 z-50">
                <button onClick={() => setScannedData(null)} className="p-2 rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/40 transition-colors">
                  <X size={20} />
                </button>
             </div>

             <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 relative shrink-0">
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute -bottom-10 left-6 w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center text-indigo-600 border-4 border-slate-50 dark:border-slate-900 border-solid">
                  <Building2 size={36} />
                </div>
             </div>

             <div className="px-6 pt-14 pb-8 flex-1 overflow-y-auto">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{mockStoreData.name}</h2>
                <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mb-8"><MapPin size={14}/> {mockStoreData.location}</p>

                <h3 className="font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider text-xs">Select Service</h3>
                
                <div className="space-y-3">
                   {mockStoreData.services.map((svc) => (
                      <button 
                        key={svc.id}
                        onClick={() => handleJoinQueue(svc.id)}
                        disabled={isJoining}
                        className={`w-full text-left bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-400 transition-all flex items-center justify-between group active:scale-[0.98] ${isJoining ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                         <div>
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">{svc.name}</h4>
                            <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold">
                               <span className="flex items-center gap-1 text-slate-500"><Users size={12}/> {svc.peopleWaiting} waiting</span>
                               <span className="flex items-center gap-1 text-slate-500"><Clock size={12}/> {svc.waitTime}m wait</span>
                            </div>
                         </div>
                         
                         {/* Load Indicator Ring */}
                         <div className="flex items-center justify-center relative w-12 h-12">
                            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="16" className="stroke-slate-100 dark:stroke-slate-700" strokeWidth="4" fill="none" />
                              <circle 
                                cx="18" cy="18" r="16" 
                                className={
                                  svc.load === "green" ? "stroke-emerald-500" : 
                                  svc.load === "yellow" ? "stroke-amber-500" : "stroke-rose-500"
                                } 
                                strokeWidth="4" fill="none" strokeDasharray="100" strokeDashoffset={svc.load === "green" ? 75 : svc.load === "yellow" ? 40 : 15} strokeLinecap="round" />
                            </svg>
                            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-700 dark:text-slate-300">
                               {svc.load === "green" ? "LOW" : svc.load === "yellow" ? "MED" : "HIGH"}
                            </span>
                         </div>
                      </button>
                   ))}
                </div>
             </div>

             {/* Joining Overlay */}
             {isJoining && (
                <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                   <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                   <p className="font-bold text-slate-900 dark:text-white">Generating Token...</p>
                </div>
             )}

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
