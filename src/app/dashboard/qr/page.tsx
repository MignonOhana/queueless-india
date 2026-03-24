"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from 'next/dynamic';
const QRCodeSVG = dynamic(() => import('qrcode.react').then(m => ({ default: m.QRCodeSVG })), { ssr: false });
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  ChevronLeft, Download, Printer, 
  CheckCircle2, Loader2, LayoutDashboard,
  Globe, Info
} from "lucide-react";
import { toast } from "sonner";
import GlassCard from "@/components/ui/GlassCard";

export default function BusinessQRPage() {
  const supabase = createClient();
  const router = useRouter();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const qrRef = useRef<HTMLDivElement>(null);

  const baseUrl = "https://queueless-india.vercel.app";

  useEffect(() => {
    const fetchData = async () => {
      const adminOrgId = localStorage.getItem("admin_org");
      if (!adminOrgId) {
        router.push("/dashboard");
        return;
      }

      const { data, error } = await (supabase
        .from("businesses") as any)
        .select("*")
        .eq("id", adminOrgId)
        .single();
      
      if (error || !data) {
        toast.error("Business not found");
        router.push("/dashboard");
        return;
      }

      setBusiness(data);
      setLoading(false);
    };

    fetchData();
  }, [router, supabase]);

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 1024;
      canvas.height = 1024;
      ctx?.drawImage(img, 0, 0, 1024, 1024);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${business?.id || "business"}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success("Download started!");
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Generating Assets...</p>
      </div>
    );
  }

  const publicUrl = `${baseUrl}/b/${business.id}`;

  return (
    <div className="min-h-screen bg-background text-white flex flex-col font-sans selection:bg-primary/30">
      
      {/* 📋 PRINT STYLES */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: white !important;
            color: black !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 40px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header (No Print) */}
      <header className="no-print p-6 flex items-center justify-between border-b border-white/5 bg-background/50 bg-opacity-95 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/dashboard")}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
            aria-label="Back"
            title="Back"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-zinc-400">Marketing Toolkit</h1>
            <p className="text-xl font-black text-white tracking-tight">Business QR Code</p>
          </div>
        </div>
        <button 
          onClick={() => router.push("/dashboard")}
          className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          aria-label="Dashboard Hub"
          title="Dashboard Hub"
        >
          <LayoutDashboard size={20} />
        </button>
      </header>

      <main className="p-6 max-w-4xl mx-auto w-full flex flex-col lg:grid lg:grid-cols-2 gap-10 py-12">
        
        {/* Left: Preview & Actions */}
        <div className="space-y-8 no-print">
          <div className="space-y-4">
            <h2 className="text-3xl font-black tracking-tighter">Skip the queue,<br/><span className="text-primary">not the customers.</span></h2>
            <p className="text-zinc-500 font-medium leading-relaxed">
              Display this QR code at your entrance, billing counter, or waiting area. 
              Customers scan to join instantly—no app downloads or physical forms required.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={downloadQR}
              className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 active:scale-95"
            >
              <Download size={18} /> Download High-Res PNG
            </button>
            <button 
              onClick={handlePrint}
              className="w-full py-5 bg-zinc-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs border border-white/10 flex items-center justify-center gap-3 hover:bg-zinc-700 transition-all active:scale-95"
            >
              <Printer size={18} /> Print Service Poster
            </button>
          </div>

          <GlassCard className="p-6 rounded-[2rem] border-primary/20 bg-primary/5">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                 <Info size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-1">Public URL</p>
                <div className="flex items-center gap-2 group">
                  <code className="text-[10px] text-zinc-400 font-mono bg-black/40 px-2 py-1 rounded border border-white/5 truncate max-w-[200px]">
                    {publicUrl}
                  </code>
                  <a href={publicUrl} target="_blank" className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Open Public URL" title="Open Public URL">
                    <Globe size={14} />
                  </a>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right: Poster Preview */}
        <div className="flex items-center justify-center">
            <div className="print-container bg-white rounded-[3rem] p-12 text-black shadow-2xl shadow-black/50 border border-white/10 flex flex-col items-center justify-center w-full aspect-[1/1.414] max-w-[500px]">
                
                {/* Poster Content */}
                <div className="text-center mb-10 w-full">
                    <h3 className="text-sm font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">Welcome to</h3>
                    <h2 className="text-4xl font-black tracking-tight border-b-4 border-emerald-500 pb-2 inline-block max-w-full truncate px-4">{business.name}</h2>
                </div>

                <div 
                  ref={qrRef}
                  className="bg-zinc-50 p-6 rounded-[2.5rem] border-2 border-zinc-100 mb-10 shadow-inner"
                >
                    <QRCodeSVG 
                      value={publicUrl}
                      size={280}
                      level="H"
                      includeMargin={false}
                    />
                </div>

                <div className="text-center space-y-4">
                    <div className="space-y-1">
                      <p className="text-2xl font-black tracking-tight">Scan to Join the Queue</p>
                      <p className="text-xl font-bold text-emerald-600">कतार में शामिल होने के लिए स्कैन करें</p>
                    </div>
                    
                    <div className="pt-4 flex flex-col items-center">
                        <div className="px-4 py-2 bg-zinc-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                           <CheckCircle2 size={12} className="text-emerald-500" /> No App Required
                        </div>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-3">Powered by QueueLess India</p>
                    </div>
                </div>
            </div>
        </div>

      </main>
    </div>
  );
}
