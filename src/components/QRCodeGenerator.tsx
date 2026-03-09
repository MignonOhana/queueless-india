"use client";

import React, { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Printer, CheckCircle2, LayoutTemplate, MessageCircle } from "lucide-react";
import { useReactToPrint } from "react-to-print";

interface QRCodeGeneratorProps {
  business: {
    id: string;
    name: string;
  };
}

export default function QRCodeGenerator({ business }: QRCodeGeneratorProps) {
  const joinUrl = `https://queueless-india.vercel.app/join/${business.id}`;
  
  const [copied, setCopied] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<"A4" | "A5" | "Sticker">("A4");
  
  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${business.name} - Queue QR Code`,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch(err) {
      console.error(err);
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Skip the queue at ${business.name}! Scan or click: ${joinUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="w-full bg-slate-950 rounded-[2.5rem] border border-slate-800 p-8 md:p-12 shadow-2xl overflow-hidden flex flex-col xl:flex-row gap-12 font-sans relative">
       {/* Background Glow */}
       <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none"></div>

       {/* Left Controls */}
       <div className="xl:w-[400px] shrink-0 flex flex-col z-10">
          <h2 className="text-3xl font-black text-white mb-3">Print & Share</h2>
          <p className="text-slate-400 mb-8 leading-relaxed text-sm">Generate high-resolution QR codes to place at your front desk or entryway. Customers can simply scan to join the live waitlist.</p>

          <div className="flex flex-col gap-4 mb-8">
             <span className="text-xs font-bold uppercase tracking-wider text-slate-500">1. Select Print Format</span>
             
             {/* Format Selector Grid */}
             <div className="grid gap-3">
               {[
                 { id: "A4", title: "A4 Poster", desc: "Large wall sign" },
                 { id: "A5", title: "A5 Table Card", desc: "Foldable desk card" },
                 { id: "Sticker", title: "Circle Sticker", desc: "10cm window decal" }
               ].map(tmp => (
                 <button 
                   key={tmp.id}
                   onClick={() => setActiveTemplate(tmp.id as any)}
                   className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${activeTemplate === tmp.id ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'}`}
                 >
                   <div className={`p-3 rounded-xl shadow-inner ${activeTemplate === tmp.id ? 'bg-blue-900/30' : 'bg-slate-950'}`}>
                     <LayoutTemplate size={20} className={activeTemplate === tmp.id ? "text-blue-400" : "text-slate-500"} />
                   </div>
                   <div>
                     <h3 className="font-bold">{tmp.title}</h3>
                     <p className="text-xs opacity-70 mt-0.5">{tmp.desc}</p>
                   </div>
                   {activeTemplate === tmp.id && <CheckCircle2 size={18} className="ml-auto text-blue-500" />}
                 </button>
               ))}
             </div>
          </div>

          <div className="flex flex-col gap-4 mb-8">
             <span className="text-xs font-bold uppercase tracking-wider text-slate-500">2. Generate</span>
             <button 
               onClick={handlePrint}
               className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-white/10 active:scale-95"
             >
               <Printer size={18} /> Print {activeTemplate} Format
             </button>
          </div>

          <div className="flex flex-col gap-4 mt-auto">
             <span className="text-xs font-bold uppercase tracking-wider text-slate-500">3. Digital Sharing</span>
             <div className="flex gap-3">
                <button 
                  onClick={handleCopy}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700 text-sm"
                >
                  {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <button 
                  onClick={handleWhatsApp}
                  className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-emerald-500/20 text-sm"
                >
                  <MessageCircle size={16} /> WhatsApp
                </button>
             </div>
          </div>
       </div>

       {/* Right Preview */}
       <div className="flex-1 bg-slate-900/50 rounded-3xl border border-slate-800 p-4 md:p-8 flex flex-col items-center justify-center overflow-auto relative z-10 backdrop-blur-sm min-h-[600px]">
          
          <div className="mb-4 text-slate-500 text-sm font-medium flex items-center gap-2">
            <Printer size={16} /> Live Print Preview
          </div>

          {/* Scale wrapper to fit templates inside the dashboard view comfortably */}
          <div className="transform scale-[0.4] sm:scale-[0.5] md:scale-[0.5] lg:scale-[0.6] origin-top flex-1 w-full max-h-[800px]">
             
             {/* The actual printable ref target */}
             <div ref={printRef} className="w-max mx-auto shadow-2xl print:shadow-none bg-white">
                
                {/* A4 FORMAT */}
                {activeTemplate === "A4" && (
                  <div className="w-[794px] h-[1123px] bg-white flex flex-col items-center justify-center p-16 font-sans text-slate-900 border-[12px] border-slate-900 relative">
                     <div className="absolute top-12 left-12 w-24 h-24 bg-slate-900 text-white flex items-center justify-center font-black text-5xl rounded-2xl shadow-xl">Q</div>
                     <div className="flex-1 flex flex-col items-center justify-center w-full mt-12">
                       <h1 className="text-7xl font-black mb-6 text-center tracking-tight leading-tight max-w-[90%]">{business.name}</h1>
                       <p className="text-4xl font-semibold text-slate-500 mb-20 text-center tracking-tight">No waiting. Scan & Track.</p>
                       
                       <div className="bg-white p-10 rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.08)] border-4 border-slate-100 mb-20">
                         <QRCodeSVG 
                           value={joinUrl} 
                           size={450} 
                           level="H" 
                           includeMargin={true}
                           fgColor="#0f172a" 
                         />
                       </div>
                       
                       <h2 className="text-5xl font-bold mb-6 text-center leading-tight">कतार में शामिल होने के लिए स्कैन करें</h2>
                       <h3 className="text-4xl font-black text-slate-500 uppercase tracking-widest text-center mt-2">Scan to Join Queue</h3>
                     </div>
                     
                     <div className="absolute bottom-12 inset-x-16 border-t-4 border-slate-200 pt-8 flex justify-between items-center text-slate-400 font-bold text-2xl uppercase tracking-wider">
                       <span>Provided by QueueLess India</span>
                       <span>queueless-india.vercel.app</span>
                     </div>
                  </div>
                )}

                {/* A5 TABLE CARD FORMAT */}
                {activeTemplate === "A5" && (
                  <div className="w-[794px] h-[561px] bg-white flex flex-col font-sans text-slate-900 relative">
                     {/* Fold Line */}
                     <div className="absolute inset-x-0 top-1/2 border-t-[3px] border-dashed border-slate-300 z-10 flex items-center justify-center pointer-events-none">
                        <span className="bg-slate-100 text-slate-400 text-xs px-4 py-1 rounded-full font-bold uppercase tracking-widest mt-[-12px]">Fold Here</span>
                     </div>
                     
                     {/* Top Half (Folded Back, printed upside down) */}
                     <div className="h-1/2 flex flex-col items-center justify-center rotate-180 p-8 border-b border-slate-100 bg-slate-50/50">
                         <h1 className="text-4xl font-black mb-4 text-center">{business.name}</h1>
                         <h2 className="text-2xl font-bold mb-2">कतार में शामिल होने के लिए स्कैन करें</h2>
                         <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest">Scan to Join Queue</h3>
                     </div>
                     
                     {/* Bottom Half (Front facing) */}
                     <div className="h-1/2 flex items-center justify-center p-10 gap-10">
                       <div className="bg-white p-4 rounded-3xl shadow-xl border-2 border-slate-100 shrink-0">
                         <QRCodeSVG value={joinUrl} size={220} level="H" includeMargin={true} fgColor="#0f172a" />
                       </div>
                       <div className="flex flex-col flex-1">
                         <h1 className="text-5xl font-black mb-4 leading-tight">{business.name}</h1>
                         <h2 className="text-2xl font-bold mb-2 text-blue-600">कतार में शामिल होने के लिए स्कैन करें</h2>
                         <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest mb-8">Scan to Join Queue</h3>
                         <div className="mt-auto flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center font-black text-sm rounded-lg">Q</div>
                            <span className="text-sm font-bold text-slate-400 tracking-wider">POWERED BY QUEUELESS INDIA</span>
                         </div>
                       </div>
                     </div>
                  </div>
                )}

                {/* CIRCLE STICKER FORMAT */}
                {activeTemplate === "Sticker" && (
                  <div className="w-[450px] h-[450px] bg-white rounded-full flex flex-col items-center justify-center p-8 font-sans text-slate-900 border-[16px] border-slate-900 relative overflow-hidden">
                     {/* Curved top text visualization using simple spacing for now since actual curved text SVG is complex */}
                     <h1 className="text-3xl font-black mb-6 text-center uppercase tracking-widest max-w-[80%] leading-tight">{business.name}</h1>
                     
                     <div className="relative">
                       <QRCodeSVG value={joinUrl} size={240} level="H" includeMargin={false} fgColor="#0f172a" />
                       {/* Center logo overlay */}
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="w-14 h-14 bg-white rounded-xl shadow-lg flex items-center justify-center">
                            <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black text-xl">Q</div>
                         </div>
                       </div>
                     </div>
                     
                     <div className="mt-8 text-center flex flex-col items-center">
                       <p className="font-extrabold text-lg text-blue-600">कतार में शामिल रहें</p>
                       <p className="text-sm font-black text-slate-800 uppercase tracking-widest mt-1">Scan to Join</p>
                     </div>
                  </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
}
