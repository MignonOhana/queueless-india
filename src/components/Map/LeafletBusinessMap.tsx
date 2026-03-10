'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapBusiness } from '@/app/map/MapClient';

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

function getWaitColor(estimatedWait: number): string {
  if (estimatedWait < 15) return '#10B981'; // green
  if (estimatedWait <= 30) return '#FBBF24'; // yellow
  return '#EF4444'; // red
}

interface Props {
  businesses: MapBusiness[];
  center: [number, number];
  zoom: number;
  onSelect: (biz: MapBusiness) => void;
}

export default function LeafletBusinessMap({ businesses, center, zoom, onSelect }: Props) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="w-full h-full"
      style={{ background: '#0a0a0a' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <MapUpdater center={center} zoom={zoom} />

      {businesses.map((biz) => {
        // Only render if we have coordinates
        if (!biz.lat || !biz.lng) return null;
        const color = getWaitColor(biz.estimatedWait);

        return (
          <CircleMarker
            key={biz.id}
            center={[biz.lat, biz.lng]}
            radius={10}
            fillColor={color}
            fillOpacity={0.8}
            color={color}
            weight={2}
            eventHandlers={{
              click: () => onSelect(biz),
            }}
          >
            <Popup>
              <div className="text-sm font-sans">
                <strong>{biz.name}</strong>
                <br />
                <span className="text-gray-500">{biz.location}</span>
                <br />
                <span style={{ color }}>~{biz.estimatedWait} min wait</span>
                {' · '}
                {biz.totalWaiting} in queue
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
