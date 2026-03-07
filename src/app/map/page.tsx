"use client";

import dynamic from "next/dynamic";

// Dynamically import the MapClient to prevent SSR issues with WebGL / mapbox-gl / react-map-gl
const MapClient = dynamic(() => import("./MapClient"), { 
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-400 font-bold tracking-widest uppercase">Loading City Map...</p>
    </div>
  )
});

export default function MapPage() {
  return <MapClient />;
}
