"use client";

import dynamic from "next/dynamic";
const QRCodeSVG = dynamic(() => import('qrcode.react').then(m => ({ default: m.QRCodeSVG })), { ssr: false });
import { X } from "lucide-react";

interface QRCodeModalProps {
  orgId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCodeModal({ orgId, isOpen, onClose }: QRCodeModalProps) {
  if (!isOpen) return null;

  // Assume the deployed URL or local testing URL as the base
  const host = typeof window !== "undefined" ? window.location.origin : "";
  const joinUrl = `${host}/customer?org=${orgId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/95">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-auto shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"
        >
          <X size={20} />
        </button>
        
        <div className="text-center mb-6 mt-2">
          <h2 className="text-2xl font-bold text-slate-800">Queue QR Code</h2>
          <p className="text-sm text-slate-500 mt-1">Print and place this at your entrance.</p>
        </div>

        <div className="bg-white p-4 rounded-xl border-2 border-slate-100 flex justify-center mb-6">
          <QRCodeSVG 
            value={joinUrl} 
            size={220}
            level="H"
            includeMargin={true}
            imageSettings={{
              src: "/icon-192x192.png", // Next-PWA icon
              height: 40,
              width: 40,
              excavate: true,
            }}
          />
        </div>

        <button 
          onClick={() => window.print()}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Print Code
        </button>
      </div>
    </div>
  );
}
