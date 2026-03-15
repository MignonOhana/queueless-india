"use client";

import { useState, useCallback, useEffect } from "react";
import { GoogleMap, useJsApiLoader, OverlayView } from "@react-google-maps/api";
import { MapPin, Navigation, Clock, Users, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

interface BusinessMarker {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  queue_id: string | null;
  currentlyServing: string;
  queueLength: number;
  estimatedWait: number; // in mins
}

interface QueueMapProps {
  onLocationFound?: (lat: number, lng: number) => void;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

// Default center: Delhi Gate
const defaultCenter = {
  lat: 28.6402,
  lng: 77.2405,
};

// Custom map styling for a cleaner SaaS look (Hiding annoying default POIs)
const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
  gestureHandling: "greedy",
  styles: [
     {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
     },
     {
        featureType: "transit",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
     }
  ]
};

export default function QueueMap({ onLocationFound }: QueueMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(defaultCenter);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [businesses, setBusinesses] = useState<BusinessMarker[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessMarker | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  // 1. Fetch User Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(loc);
          setUserLocation(loc);
          setIsLoadingLocation(false);
          if(onLocationFound) onLocationFound(loc.lat, loc.lng);
        },
        (error) => {
          console.warn("Geolocation denied or failed. Using fallback.", error);
          setIsLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
       setIsLoadingLocation(false);
    }
  }, [onLocationFound]);

  // 2. Fetch Businesses & Live Queues
  const fetchMapData = async () => {
     // Start by getting all businesses that have coordinates
     const { data: bData, error: bErr } = await supabase
       .from('businesses')
       .select('id, name, category, latitude, longitude')
       .not('latitude', 'is', null);

     if (bErr || !bData) return;

     // Fetch all active queues for today to attach realtime stats
     const today = new Date().toISOString().split('T')[0];
     const { data: qData, error: qErr } = await supabase
       .from('queues')
       .select('id, org_id, counter_id, currently_serving, total_waiting, is_accepting_tokens')
       .eq('session_date', today);
       
     if (qErr) return;

     // Merge data
     const merged: BusinessMarker[] = bData.map(biz => {
        // Find the matching queue (Usually the primary one, e.g. OPD or TKN)
        const queue = qData?.find(q => q.org_id === biz.id) || null;
        
        // Mock estimate calculations (In prod, this should come from AI table or queue pacing)
        const waiting = queue?.total_waiting || 0;
        const estimate = waiting * 5; // 5 min per person dummy algorithm

        return {
           id: biz.id,
           name: biz.name,
           category: biz.category,
           latitude: Number(biz.latitude),
           longitude: Number(biz.longitude),
           queue_id: queue?.id || null,
           currentlyServing: queue?.currently_serving || "None",
           queueLength: waiting,
           estimatedWait: estimate
        }
     });

     setBusinesses(merged);
  };

  useEffect(() => {
     fetchMapData();

     // 3. Realtime Subscription to Queues table to instantly change marker colors
     const channel = supabase.channel('realtime_map')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queues' }, () => {
         // Simply refetch the map data to update all pins on the screen when any change happens
         fetchMapData();
      }).subscribe();

     return () => {
         supabase.removeChannel(channel);
     };
  }, []);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  const recenter = () => {
    if(map && userLocation) {
      map.panTo(userLocation);
      map.setZoom(14);
    }
  };

  // Helper to determine dot color
  const getMarkerColor = (waitMins: number) => {
    if (waitMins < 10) return "bg-emerald-500 border-emerald-300 shadow-emerald-500/50"; // Green
    if (waitMins <= 25) return "bg-amber-400 border-amber-200 shadow-amber-400/50"; // Yellow
    return "bg-rose-500 border-rose-300 shadow-rose-500/50"; // Red
  };

  if (!isLoaded) return <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-sm font-bold">Loading Maps Engine...</div>;

  return (
    <div className="relative w-full h-full font-sans">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
        onClick={() => setSelectedBusiness(null)} // Dismiss info window on map click
      >
        
        {/* User Location Pulse Marker */}
        {userLocation && (
          <OverlayView
             position={userLocation}
             mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
             getPixelPositionOffset={(width, height) => ({ x: -(width / 2), y: -(height / 2) })}
          >
             <div className="relative w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md z-10">
                <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75" />
             </div>
          </OverlayView>
        )}

        {/* Business Markers utilizing advanced custom HTML overlays for dynamic styling instead of static images */}
        {businesses.map((biz) => (
          <OverlayView
            key={biz.id}
            position={{ lat: biz.latitude, lng: biz.longitude }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            getPixelPositionOffset={(width, height) => ({ x: -(width / 2), y: -height })}
          >
             <button 
               onClick={() => {
                  setSelectedBusiness(biz);
                  map?.panTo({ lat: biz.latitude, lng: biz.longitude });
                  // Slightly offset the zoom so the popup doesn't cover the pin
                  map?.panBy(0, -100); 
               }}
               className={`relative -top-2 flex flex-col items-center group transition-transform ${selectedBusiness?.id === biz.id ? 'scale-125 z-50' : 'hover:scale-110 z-20'}`}
             >
                {/* The Pin Head */}
                <div className={`w-8 h-8 rounded-full border-2 text-white flex items-center justify-center shadow-lg transition-colors ${getMarkerColor(biz.estimatedWait)}`}>
                   <span className="text-[10px] font-black">{biz.estimatedWait}m</span>
                </div>
                {/* The Pin Needle */}
                <div className={`w-1 h-3 -mt-1 rounded-b-full shadow-sm transition-colors ${getMarkerColor(biz.estimatedWait).split(' ')[0]}`} />
             </button>
          </OverlayView>
        ))}
      </GoogleMap>

      {/* Recenter Button Overlay */}
      <button 
        onClick={recenter}
        disabled={!userLocation}
        className="absolute top-4 right-4 w-12 h-12 bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-white active:scale-95 transition disabled:opacity-50"
      >
         <Navigation size={22} className={isLoadingLocation ? "animate-spin text-indigo-500" : (userLocation ? "text-indigo-500" : "")} />
      </button>

      {/* Floating Info Window / Bottom Sheet for Selected Marker */}
      <AnimatePresence>
        {selectedBusiness && (
          <motion.div 
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="absolute bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-96 bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-2xl border border-slate-200 dark:border-slate-800 pointer-events-auto"
          >
            <button 
              onClick={() => setSelectedBusiness(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
            >
               <X size={16} />
            </button>
            
            <div className="flex gap-4">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 ${
                 selectedBusiness.estimatedWait < 10 ? 'bg-emerald-500' : 
                 selectedBusiness.estimatedWait <= 25 ? 'bg-amber-400' : 'bg-rose-500'
               }`}>
                  <div className="text-center">
                     <span className="block text-xl font-black leading-none">{selectedBusiness.estimatedWait}</span>
                     <span className="block text-[8px] uppercase tracking-widest font-bold opacity-80 mt-0.5">Mins</span>
                  </div>
               </div>
               <div className="pt-1">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight pr-6 truncate">{selectedBusiness.name}</h3>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">{selectedBusiness.category}</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 mb-5">
               <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex items-center gap-3 border border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                     <Users size={16} />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-slate-500 uppercase">In line</p>
                     <p className="font-black text-slate-900 dark:text-white">{selectedBusiness.queueLength}</p>
                  </div>
               </div>
               <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex items-center gap-3 border border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                     <MapPin size={16} />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-slate-500 uppercase">Serving</p>
                     <p className="font-black text-slate-900 dark:text-white">{selectedBusiness.currentlyServing}</p>
                  </div>
               </div>
            </div>

            <div className="flex gap-3">
               <Link href={`/b/${selectedBusiness.id}`} className="flex-1 text-center py-3.5 rounded-2xl font-bold text-sm bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                  View Profile
               </Link>
               <Link href={`/b/${selectedBusiness.id}`} className="flex-[1.5] text-center py-3.5 rounded-2xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition flex items-center justify-center gap-2">
                  Join Queue <ArrowRight size={16} />
               </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
