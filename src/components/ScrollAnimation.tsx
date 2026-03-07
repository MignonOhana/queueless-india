"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const TOTAL_FRAMES = 60; // Define total frames you plan to upload

export default function ScrollAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  // Helper function to format frame numbers like 001, 002
  const currentFrame = (index: number) =>
    `/frames/frame_${index.toString().padStart(3, "0")}.webp`;

  // Preload Images
  useEffect(() => {
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = currentFrame(i);

      img.onload = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) {
          setImages(loadedImages);
          setImagesLoaded(true);
        }
      };
      
      // Still push it to array so they stay in order
      loadedImages.push(img);
    }
    
    // Cleanup 
    return () => {
       ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  // Set up GSAP ScrollTrigger to scrub progress
  useEffect(() => {
    if (!imagesLoaded || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    // Set canvas dimensions
    canvas.width = 1920;
    canvas.height = 1080;

    // Draw first frame immediately
    renderFrame(images[0], context, canvas);

    // Create GSAP animation object representing progress
    const scrollObj = { frame: 0 };
    
    const trigger = gsap.to(scrollObj, {
      frame: TOTAL_FRAMES - 1, // Target final frame index
      snap: "frame", // Snap to whole numbers
      ease: "none",
      onUpdate: () => {
         // Re-render canvas on update
         setProgress(scrollObj.frame / (TOTAL_FRAMES - 1));
         renderFrame(images[Math.round(scrollObj.frame)], context, canvas);
      },
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=3000", // Height of scroll area (3000px creates slow smooth scroll)
        scrub: 0.5, // Smooth scrubbing taking 0.5s to catch up
        pin: true,
        anticipatePin: 1
      }
    });

    return () => {
       trigger.kill();
    };
  }, [imagesLoaded, images]);

  // Handle rendering frames to maintain aspect ratio
  const renderFrame = (img: HTMLImageElement, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (!img) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Scale image to 'cover' center
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const x = (canvas.width / 2) - (img.width / 2) * scale;
    const y = (canvas.height / 2) - (img.height / 2) * scale;
    
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
  };

  return (
    <section 
      id="scroll-animation-sequence" 
      ref={containerRef} 
      className="relative h-screen w-full bg-slate-100 dark:bg-[#050505] overflow-hidden flex items-center justify-center transition-colors duration-300"
    >
      
      {/* Loading State Overlay */}
      {!imagesLoaded && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-100 dark:bg-[#050505]">
            <div className="flex flex-col items-center">
               <div className="w-8 h-8 rounded-full border-4 border-indigo-500/20 border-t-indigo-600 animate-spin mb-4" />
               <p className="text-slate-500 font-medium text-sm animate-pulse tracking-widest uppercase">Initializing Animation Engine...</p>
            </div>
         </div>
      )}

      {/* Cinematic Canvas Container */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
         <canvas 
           ref={canvasRef} 
           className="w-full h-full object-cover origin-center opacity-80"
         />
         
         {/* Subtly darkened vignette overlay for cinematic feel */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
         {/* Gradient to smooth out bottom edges into next section */}
         <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
      </div>

      {/* Scroll Text Overlay Layers */}
      <div className="absolute inset-0 z-10 w-full max-w-7xl mx-auto px-6 grid md:grid-cols-2 pointer-events-none">
        
        {/* Left Side: Sticky Captions based on progress */}
        <div className="h-full flex flex-col justify-center relative">
           
           {/* Section 1 */}
           <CaptionBlock 
              progress={progress} 
              showRange={[0, 0.25]}
              title="Locate Nearby Queues"
              desc="Open the City Map and instantly find which locations are crowded and which are free to visit."
              step="01"
              color="indigo"
           />

           {/* Section 2 */}
           <CaptionBlock 
              progress={progress} 
              showRange={[0.26, 0.50]}
              title="Scan QR to Join"
              desc="Point your camera at the QR code and tap. Instantly join without downloading any heavy apps."
              step="02"
              color="purple"
           />

           {/* Section 3 */}
           <CaptionBlock 
              progress={progress} 
              showRange={[0.51, 0.75]}
              title="Live Queue Tracking"
              desc="Watch your progress drop in real time. We’ll show you exactly how many people are ahead of you."
              step="03"
              color="rose"
           />

           {/* Section 4 */}
           <CaptionBlock 
              progress={progress} 
              showRange={[0.76, 1.0]}
              title="Arrive Exactly on Time"
              desc="Receive an SMS alert or WhatsApp notification when it's your turn. Just walk straight in."
              step="04"
              color="emerald"
           />

        </div>
      </div>

    </section>
  );
}

// Helper component for displaying the sticky animated text blocks
function CaptionBlock({ 
  progress, 
  showRange, 
  title, 
  desc, 
  step, 
  color 
}: { 
  progress: number, 
  showRange: number[], 
  title: string, 
  desc: string, 
  step: string, 
  color: string 
}) {
   
   // Check if we are in range
   const isVisible = progress >= showRange[0] && progress <= showRange[1];

   return (
       <div 
         className={`absolute transition-all duration-700 ease-out flex flex-col items-start ${
           isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 blur-md"
         }`}
       >
         <div className={`text-${color}-500 font-bold tracking-widest text-sm mb-3 flex items-center gap-3`}>
            <span className={`w-10 h-px bg-${color}-500`} /> STEP {step}
         </div>
         <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight drop-shadow-xl">{title}</h2>
         <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 font-medium max-w-sm drop-shadow-lg leading-relaxed">{desc}</p>
       </div>
   )
}
