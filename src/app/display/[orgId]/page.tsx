"use client";

import { useAdminQueue } from "@/lib/useAdminQueue";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Clock, Volume2 } from "lucide-react";
import SceneCanvas from "@/components/Spatial/SceneCanvas";
import dynamic from "next/dynamic";
const HolographicToken = dynamic(() => import("@/components/Spatial/HolographicToken"), { ssr: false });
import { use } from "react"; // For Next.js 15+ async params

export default function DisplayScreen({ params }: { params: Promise<{ orgId: string }> }) {
  // Unwrap the promise for params
  const { orgId } = use(params);
  const { queue, currentlyServing } = useAdminQueue(orgId);
  const [time, setTime] = useState("");

  // Clock for the TV display
  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Play an automated Voice Announcement when currentlyServing changes
  useEffect(() => {
    if (currentlyServing?.tokenNumber && typeof window !== "undefined") {
      try {
        // Fallback doorbell sequence
        const audio = new Audio("https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg"); // Fallback open audio
        audio.volume = 0.2;
        audio.play().catch(e => console.log("Audio play blocked", e));
        
        // Setup Speech Synthesis
        if ('speechSynthesis' in window) {
           setTimeout(() => {
             // To ensure clarity, we separate tokens like "OPD-021" into "O P D, zero two one"
             const rawToken = currentlyServing.tokenNumber;
             const letters = rawToken.split('-')[0].split('').join(' ');
             const numbers = rawToken.split('-')[1]?.split('').join(' ') || '';
             
             const announcementText = `Token number, ${letters}, ${numbers}, please proceed to ${currentlyServing.counterId || 'the main desk'}.`;
             
             const utterance = new SpeechSynthesisUtterance(announcementText);
             utterance.rate = 0.9; // Slightly slower for public address clarity
             utterance.pitch = 1.0;
             
             // Attempt to find an Indian English voice for local flavor
             const voices = window.speechSynthesis.getVoices();
             const indianVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('India'));
             if (indianVoice) utterance.voice = indianVoice;
             
             window.speechSynthesis.speak(utterance);
           }, 1500); // Wait 1.5s after the doorbell chime
        }
      } catch (e) {
        // ignore
      }
    }
  }, [currentlyServing?.tokenNumber, currentlyServing?.counterId]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans overflow-hidden">
      
      {/* Heavy Blue Glare Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[150px] rounded-full point-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 blur-[150px] rounded-full point-events-none" />

      {/* Top Header */}
      <header className="relative z-10 flex justify-between items-center p-8 lg:p-12 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-3xl shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            Q
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">City Hospital</h1>
            <p className="text-blue-400 font-semibold text-xl uppercase tracking-widest mt-1">Queue Display System</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-3xl font-bold bg-white/5 px-8 py-4 rounded-3xl border border-white/10">
          <Clock size={36} className="text-orange-400" />
          {time}
        </div>
      </header>

      {/* Main Content (Split Screen) */}
      <div className="flex-1 flex flex-col lg:flex-row p-8 lg:p-12 gap-8 lg:gap-12 relative z-10 h-full">
        
        {/* Left: NOW SERVING (Massive Focus) */}
        <div className="lg:w-7/12 flex flex-col">
          <h2 className="text-3xl font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-4">
            <span className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse" />
            Now Serving
          </h2>

          <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-[3rem] p-12 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
            {/* Glowing inner border */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentlyServing?.tokenNumber || 'none'}
                initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="text-center w-full"
              >
                {currentlyServing ? (
                  <>
                    <p className="text-blue-400 font-bold tracking-[0.3em] text-2xl uppercase mb-4">{currentlyServing.counterId || 'Main Counter'}</p>
                    
                    {/* Massive 3D Rotating TV Display Token */}
                    <div className="w-full h-[600px] -mt-10 overflow-visible z-20">
                      <SceneCanvas className="absolute inset-0 z-20 mix-blend-screen scale-[1.5]">
                         <HolographicToken 
                           tokenNumber={currentlyServing.tokenNumber} 
                           color="#fbbf24" // Amber glow
                           scale={1.2}
                           position={[0, -0.5, 0]}
                         />
                      </SceneCanvas>
                    </div>

                    <p className="text-4xl text-slate-300 font-semibold mt-0">Please proceed to counter</p>
                  </>
                ) : (
                  <h3 className="text-[6rem] font-bold text-slate-700">Waiting...</h3>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right: NEXT IN LINE (List) */}
        <div className="lg:w-5/12 flex flex-col">
          <h2 className="text-3xl font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">
            Next In Line
          </h2>

          <div className="bg-slate-900 border border-slate-800/80 rounded-[3rem] p-8 flex-1 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900 z-10 pointer-events-none" />
            
            <div className="flex flex-col gap-6">
              <AnimatePresence>
                {queue.slice(0, 5).map((item, idx) => (
                  <motion.div
                    key={item.id}
                    layout // This makes the items smoothly float up when one is removed
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={`flex items-center justify-between p-8 rounded-3xl border ${
                      idx === 0 
                      ? "bg-slate-800 border-slate-700 shadow-xl" 
                      : "bg-slate-800/40 border-slate-800/50"
                    }`}
                  >
                    <div>
                      <h4 className={`font-black tracking-tight ${idx === 0 ? "text-6xl text-white" : "text-5xl text-slate-300"}`}>
                        {item.tokenNumber}
                      </h4>
                      <p className={`font-semibold uppercase tracking-wider mt-2 ${idx === 0 ? "text-orange-400 text-xl" : "text-slate-500 text-lg"}`}>
                        {item.counterId}
                      </p>
                    </div>
                    {idx === 0 && (
                      <div className="hidden sm:flex items-center gap-2 text-orange-400 font-bold bg-orange-500/10 px-4 py-2 rounded-xl">
                        NEXT <ArrowRightIcon />
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {queue.length === 0 && (
                  <div className="text-center py-20 text-slate-600 text-2xl font-bold">
                    No one is currently waiting.
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function ArrowRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  );
}
