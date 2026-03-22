"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { useLiveMap, BusinessMapData } from "@/lib/useLiveMap";
import { Clock, Users, ArrowRight, Layers } from "lucide-react";
import Link from "next/link";
import L from "leaflet";

// Create custom icons for markers based on wait time
const createCustomIcon = (waitTime: number) => {
  let color = "#22c55e"; // Green for wait <= 15
  if (waitTime > 15 && waitTime <= 30) {
    color = "#eab308"; // Yellow for 15 < wait <= 30
  } else if (waitTime > 30) {
    color = "#ef4444"; // Red for wait > 30
  }

  // A simple SVG marker string
  const svgTemplate = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="marker-shadow">
      <path fill="${color}" stroke="#ffffff" stroke-width="2" d="M16 1C8.832 1 3 6.832 3 14c0 9.75 13 17 13 17s13-7.25 13-17c0-7.168-5.832-13-13-13zm0 17.5c-2.485 0-4.5-2.015-4.5-4.5s2.015-4.5 4.5-4.5 4.5 2.015 4.5 4.5-2.015 4.5-4.5 4.5z"/>
      <circle fill="#ffffff" cx="16" cy="14" r="3.5" />
    </svg>
  `;

  return new L.DivIcon({
    html: svgTemplate,
    className: "custom-leaflet-marker",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -32],
  });
};

function MapUpdater({ lastUpdated }: { lastUpdated: Date }) {
  const map = useMap();
  // Optional: Add some subtle map interactivity when data updates
  return null;
}

export default function LiveMap() {
  const { businesses, lastUpdated } = useLiveMap();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <Layers className="w-12 h-12 animate-bounce" />
          <p className="font-medium">Loading map tiles...</p>
        </div>
      </div>
    );
  }

  const center: [number, number] = [28.6139, 77.2090]; // New Delhi

  return (
    <div className="relative w-full h-[calc(100vh-5rem)] rounded-none md:rounded-3xl overflow-hidden shadow-2xl border-0 md:border border-white/20">
      
      {/* Search and Filter Overlays (UI only) */}
      <div className="absolute top-4 left-4 right-4 md:right-auto md:w-96 z-[1000] flex flex-col gap-3">
        <div className="glass-card p-3 flex items-center gap-3 bg-opacity-95 bg-white/80 dark:bg-slate-900/80">
           <input 
             type="text" 
             placeholder="Search hospitals, banks..." 
             className="w-full bg-transparent border-none focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
           />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {["All", "Hospitals", "Banks", "Restaurants"].map((type, i) => (
             <button key={i} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${i === 0 ? "bg-blue-600 text-white" : "glass bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-slate-700/90"}`}>
               {type}
             </button>
          ))}
        </div>
      </div>

      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        <MapUpdater lastUpdated={lastUpdated} />

        {businesses.map((business) => (
          <Marker 
            key={business.id} 
            position={business.location} 
            icon={createCustomIcon(business.avg_wait)}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[220px]">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-800 mb-1">{business.name}</h3>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {business.services.map((service, idx) => (
                    <span key={idx} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {service}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-orange-50 rounded-xl p-2 flex flex-col items-center justify-center border border-orange-100/50">
                    <Clock className="w-4 h-4 text-orange-600 mb-1" />
                    <span className="text-sm font-bold text-orange-700">{business.avg_wait}m</span>
                    <span className="text-[10px] text-orange-600/70 uppercase">Wait</span>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-2 flex flex-col items-center justify-center border border-blue-100/50">
                    <Users className="w-4 h-4 text-blue-600 mb-1" />
                    <span className="text-sm font-bold text-blue-700">{business.queue_length}</span>
                    <span className="text-[10px] text-blue-600/70 uppercase">People</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/customer/queue/${business.id}`} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-center text-sm font-medium py-2 rounded-xl transition-colors flex items-center justify-center gap-2">
                    Join
                  </Link>
                  <button className="flex-1 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 text-center text-sm font-medium py-2 rounded-xl transition-colors flex items-center justify-center gap-1 shadow-sm">
                    Directions <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Global styles for dark mode map tiles (invert) and popups */}
      <style dangerouslySetInnerHTML={{__html: `
        .dark .map-tiles { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }
        .leaflet-popup-content-wrapper { border-radius: 1.5rem; padding: 0.25rem; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); }
        .leaflet-popup-content { margin: 10px; }
        .leaflet-container { font-family: inherit; }
        .marker-shadow { filter: drop-shadow(0 4px 6px rgb(0 0 0 / 0.2)); }
      `}} />
    </div>
  );
}
