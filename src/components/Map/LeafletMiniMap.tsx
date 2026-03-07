"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface LeafletMiniMapProps {
  center: [number, number];
  markers?: Array<{
    id: string;
    position: [number, number];
    name: string;
    waitTime: number;
  }>;
}

export default function LeafletMiniMap({ center, markers = [] }: LeafletMiniMapProps) {
  // Custom marker icon using the accent orange color requested
  const customIcon = new L.DivIcon({
    className: "custom-div-icon",
    html: `<div style="background-color: #F59E0B; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden z-0 isolate border border-slate-200 shadow-inner">
      <MapContainer 
        center={center} 
        zoom={12} 
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater center={center} />
        
        {markers.map((marker) => (
          <Marker 
            key={marker.id} 
            position={marker.position}
            icon={customIcon}
          >
            <Popup className="rounded-xl">
              <div className="font-bold text-slate-800">{marker.name}</div>
              <div className="text-emerald-600 text-xs font-bold">{marker.waitTime} mins wait</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
