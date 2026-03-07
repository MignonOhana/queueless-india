"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet.heat";
import { BusinessMapData } from "@/lib/useLiveMap";
import { Clock, Users, ArrowRight, Layers } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Gradient config: Blue -> Green -> Yellow -> Orange -> Red
const HEATMAP_GRADIENT = {
  0.1: "blue",
  0.3: "cyan",
  0.5: "lime",
  0.7: "yellow",
  0.9: "orange",
  1.0: "red"
};

// HeatLayer Wrapper Component
function HeatLayerRenderer({ businesses }: { businesses: BusinessMapData[] }) {
  const map = useMap();
  const heatLayerRef = useRef<L.HeatLayer | null>(null);

  useEffect(() => {
    // Map businesses into HeatLatLng [lat, lng, intensity]
    // We normalize heat_score so max intensity sits around 1.0. Assuming max heat ~ 600 (40 queues * 15 min wait)
    const heatData: L.HeatLatLngTuple[] = businesses.map(b => {
      const normalizedIntensity = Math.min(b.heat_score / 600, 1.0);
      return [b.location[0], b.location[1], normalizedIntensity];
    });

    if (!heatLayerRef.current) {
      // First render
      heatLayerRef.current = (L as any).heatLayer(heatData, {
        radius: 40,
        blur: 35,
        maxZoom: 15,
        max: 1.0,
        gradient: HEATMAP_GRADIENT
      }).addTo(map);
    } else {
      // Update data seamlessly
      heatLayerRef.current.setLatLngs(heatData);
    }

    return () => {
      // Cleanup happens only when unmounting the whole component
    };
  }, [businesses, map]);

  return null;
}

// Custom Marker Standard View
const createCustomIcon = (waitTime: number) => {
  let color = "#22c55e";
  if (waitTime > 15 && waitTime <= 30) color = "#eab308";
  else if (waitTime > 30) color = "#ef4444";

  const svgTemplate = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="marker-shadow transition-transform duration-500 hover:scale-110">
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

interface HeatmapProps {
  businesses: BusinessMapData[];
  mode: "heatmap" | "markers";
}

export default function LiveHeatmap({ businesses, mode }: HeatmapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-slate-100 dark:bg-slate-900 animate-pulse">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <Layers className="w-12 h-12 animate-bounce" />
          <p className="font-medium">Loading vector tiles...</p>
        </div>
      </div>
    );
  }

  const center: [number, number] = [28.6139, 77.2090]; // New Delhi Center

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-900">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          className="heatmap-tiles transition-opacity duration-1000"
          opacity={0.9}
        />

        {mode === "heatmap" ? (
          <HeatLayerRenderer businesses={businesses} />
        ) : (
          businesses.map((business) => (
            <Marker 
              key={business.id} 
              position={business.location} 
              icon={createCustomIcon(business.avg_wait)}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[220px]">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-800 mb-1">{business.name}</h3>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {business.category}
                    </span>
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
                    <Link href={`/customer/queue/${business.id}`} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center text-sm font-bold py-2 rounded-xl transition-colors">
                      Join
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))
        )}
      </MapContainer>

      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-popup-content-wrapper { border-radius: 1.5rem; padding: 0.25rem; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); }
        .leaflet-popup-content { margin: 10px; }
        .leaflet-container { font-family: inherit; background: #0f172a; }
        .marker-shadow { filter: drop-shadow(0 4px 6px rgb(0 0 0 / 0.2)); }
        
        /* Smooth fade in for heatmap canvas */
        .leaflet-heatmap-layer { animation: fadeIn 1s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}} />
    </div>
  );
}
