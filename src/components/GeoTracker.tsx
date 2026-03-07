"use client";

import { useEffect, useState } from "react";
import { MapPin, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GeoTrackerProps {
  hubLat: number;
  hubLng: number;
  isActiveToken: boolean;
}

// Haversine formula to calculate distance in KM between two coordinates
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function GeoTracker({ hubLat, hubLng, isActiveToken }: GeoTrackerProps) {
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const MAX_RADIUS_KM = 1.5; // Trigger warning if user wanders 1.5km away

  useEffect(() => {
    // We only track actively if they hold a token
    if (!isActiveToken || !("geolocation" in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setPermissionGranted(true);
        const dist = getDistanceFromLatLonInKm(
          hubLat,
          hubLng,
          position.coords.latitude,
          position.coords.longitude
        );
        setDistanceKm(dist);
      },
      (error) => {
        console.log("Geo tracking denied or unavailable", error);
        setPermissionGranted(false);
      },
      { enableHighAccuracy: false, maximumAge: 30000, timeout: 27000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isActiveToken, hubLat, hubLng]);

  // If they are safely within bounds or haven't granted permission, render nothing
  const isOutOfBounds = distanceKm !== null && distanceKm > MAX_RADIUS_KM;

  return (
    <AnimatePresence>
      {isOutOfBounds && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[200]"
        >
          <div className="bg-rose-600 border border-rose-400 rounded-2xl shadow-2xl p-4 flex gap-4 items-start text-white">
            <div className="p-2 bg-rose-500 rounded-full shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1 flex items-center gap-2">
                <MapPin size={16} /> Distance Warning
              </h4>
              <p className="text-sm font-medium opacity-90">
                You appear to be {distanceKm?.toFixed(1)}km away from the center. Please head back to ensure you do not miss your token call.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
