"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, ChevronDown, ChevronLeft, Clock, Heart, ArrowRight, Activity, QrCode, TrendingUp, Zap, Ticket, ChevronRight, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { CURRENT_LOCATION, Business } from "@/lib/mockHomeData";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
import { useAuth } from "@/context/AuthContext";
import { haversineDistance } from "@/lib/geolocation";
import { DemoQueueCards } from "@/components/Home/DemoQueueCards";

// Dynamically import Leaflet map to avoid SSR errors
const LeafletMiniMap = dynamic(() => import("@/components/Map/LeafletMiniMap"), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-white/5 dark:bg-slate-800 animate-pulse rounded-2xl flex items-center justify-center font-bold text-zinc-500">Loading Map...</div> 
});

const CATEGORIES = [
  { id: "all", name: "All Queues", icon: "🌐" },
  { id: "Hospitals", name: "Hospitals", icon: "🏥" },
  { id: "Banks", name: "Banks", icon: "🏦" },
  { id: "Salons", name: "Salons", icon: "💇" },
  { id: "Government", name: "Government", icon: "🏛" },
  { id: "Restaurants", name: "Restaurants", icon: "🍽" },
  { id: "Events", name: "Events", icon: "🎟" },
  { id: "Airport Services", name: "Airport Services", icon: "✈" },
];

const CATEGORY_ICONS: Record<string, string> = {
  "Hospital": "🏥",
  "Hospitals": "🏥",
  "Bank": "🏦",
  "Banks": "🏦",
  "Temple": "🛕",
  "Government": "🏛",
  "Railway Station": "🚆",
  "Court": "⚖️",
  "Post Office": "📮",
  "Salon": "💇",
  "Salons": "💇",
  "Restaurant": "🍽",
  "Restaurants": "🍽",
  "default": "🏢"
};

const TOKEN_PREFIXES: Record<string, string> = {
  "Hospital": "H",
  "Hospitals": "H",
  "Bank": "B",
  "Government": "G",
  "Temple": "T",
  "Railway Station": "R",
  "Court": "C",
  "Post Office": "P",
  "default": "Q"
};

const RecentlyVisitedBanner = ({ businesses, queueStates }: { businesses: Business[], queueStates: Record<string, number> }) => {
  const router = useRouter();
  const [lastBiz, setLastBiz] = useState<Business | null>(null);
  const [activeToken, setActiveToken] = useState<string | null>(null);

  useEffect(() => {
    const lastId = localStorage.getItem("last_visited_business_id");
    const savedToken = localStorage.getItem("active_token_number");
    const savedOrg = localStorage.getItem("active_org");

    if (lastId) {
      const biz = businesses.find(b => b.id === lastId);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (biz) setLastBiz(biz);
    }
    
    if (savedToken && savedOrg === lastId) {
      setActiveToken(savedToken);
    }
  }, [businesses]);

  if (!lastBiz) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto px-4 mt-4"
    >
      <div 
        onClick={() => router.push(`/b/${lastBiz.id}`)}
        className="bg-white border border-primary/20 shadow-lg shadow-primary/5 rounded-2xl p-4 flex items-center justify-between cursor-pointer group hover:border-primary transition-all"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl shrink-0">
            {lastBiz.icon}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-slate-900 text-sm truncate">Welcome back → {lastBiz.name}</h4>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
              Now serving: #{(queueStates[lastBiz.id] || 100) - lastBiz.queueLength} 
              {activeToken && <span className="text-[#0B6EFE] ml-2">| Your token: #{activeToken}</span>}
            </p>
          </div>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/customer/dashboard`);
          }}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:brightness-110 shrink-0"
        >
          Resume
        </button>
      </div>
    </motion.div>
  );
};

export default function HomeClient({ initialBusinesses = [] }: { initialBusinesses?: Business[] }) {
  const router = useRouter();
  const { user, userRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activeTokenMap, setActiveTokenMap] = useState<any>(null); // To store active queue if joined
  const [liveBusinesses, setLiveBusinesses] = useState<Business[]>(initialBusinesses);
  const [trendingBusinesses, setTrendingBusinesses] = useState<Business[]>(initialBusinesses.slice(0, 5));
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null);
  const [locationName, setLocationName] = useState("Detecting location...");
  const [isLocating, setIsLocating] = useState(true);
  const [queueStates, setQueueStates] = useState<Record<string, number>>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pulseItems, setPulseItems] = useState<any[]>([]);
  const [visitCount, setVisitCount] = useState<number>(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check local storage for an active queue token
    const savedOrg = localStorage.getItem("active_org");
    const savedToken = localStorage.getItem("active_token");
    if (savedOrg && savedToken) {
      setActiveTokenMap({ orgId: savedOrg, tokenId: savedToken });
    }

    // Fetch visit count for onboarding via RPC
    const fetchVisitCount = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await supabase.rpc('get_my_profile').maybeSingle() as { data: any; error: any };
        
      if (profile) {
        setVisitCount(profile.visit_count || 0);
        // Show if first-time user (visit_count 0 or 1)
        if ((profile.visit_count || 0) <= 1) {
          setShowOnboarding(true);
        }
      }
    };

    if (user) {
      fetchVisitCount();
    }
    
    // Reverse Geocoding via Nominatim
    const fetchCityName = async (lat: number, lng: number) => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await response.json();
        const city = data.address.city || data.address.town || data.address.village || data.address.suburb || "Current Location";
        setLocationName(city);
      } catch (err) {
        console.error("Reverse geocoding failed", err);
        setLocationName("Current Location");
      } finally {
        setIsLocating(false);
      }
    };

    // Fetch live organically created businesses from Supabase MVP DB
    const fetchLiveBusinesses = async (userLat?: number, userLng?: number) => {
      const { data, error } = await (supabase
        .from("businesses") as any)
        .select("*")
        .not("latitude", "is", null)
        .not("longitude", "is", null);
        
      if (!error && data) {
        // Fetch Predictions
        const { data: predData } = await (supabase.from('predictions').select('id, bestTimeToVisit') as any);
        const predMap: Record<string, string> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        predData?.forEach((p: any) => { predMap[p.id] = p.bestTimeToVisit; });

        // Fetch Queue info
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: queueData } = await (supabase.from("queues") as any).select("org_id, last_issued_number, total_waiting, max_capacity");
        const qMap: Record<string, number> = {};
        const qLenMap: Record<string, number> = {};
        const qCapMap: Record<string, number> = {};
        if (queueData) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (queueData as any[]).forEach((q: any) => {
            qMap[q.org_id] = q.last_issued_number;
            qLenMap[q.org_id] = q.total_waiting;
            qCapMap[q.org_id] = q.max_capacity;
          });
          setQueueStates(qMap);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedData: Business[] = data.map((b: any) => {
          let calcDist = 0;
          if (userLat && userLng) {
             calcDist = haversineDistance(userLat, userLng, Number(b.latitude), Number(b.longitude));
          }

          return {
            id: b.id,
            name: b.name,
            category: b.category,
            address: b.location,
            distance: calcDist, 
            waitTime: b.serviceMins || 15, 
            queueLength: qLenMap[b.id] || 0,
            image: b.image || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop", 
            icon: CATEGORY_ICONS[b.category] || CATEGORY_ICONS["default"],
            coordinates: [Number(b.latitude), Number(b.longitude)] as [number, number], 
            isFastest: b.fastPassEnabled,
            isPopular: true,
            isFavorite: false,
            max_capacity: qCapMap[b.id] || 50,
            bestTimeToVisit: predMap[b.id],
            avg_rating: b.avg_rating,
            total_reviews: b.total_reviews
          };
        });
        
        setLiveBusinesses(mappedData);

        // Fetch Trending
        const { data: trendData } = await (supabase
          .from("businesses") as any)
          .select("*")
          .order('total_reviews', { ascending: false })
          .limit(5);

        if (trendData) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const trendMapped = trendData.map((b: any) => {
            let calcDist = 0;
            if (userLat && userLng && b.latitude && b.longitude) {
               calcDist = haversineDistance(userLat, userLng, Number(b.latitude), Number(b.longitude));
            }
            return {
              id: b.id,
              name: b.name,
              category: b.category,
              address: b.location,
              distance: calcDist, 
              waitTime: b.serviceMins || 15, 
              queueLength: qLenMap[b.id] || 0,
              image: b.image || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop", 
              icon: CATEGORY_ICONS[b.category] || CATEGORY_ICONS["default"],
              coordinates: [Number(b.latitude) || 28.6139, Number(b.longitude) || 77.2090] as [number, number], 
              isFastest: b.fastPassEnabled,
              isPopular: true,
              isFavorite: false,
              max_capacity: qCapMap[b.id] || 50,
              bestTimeToVisit: predMap[b.id],
              avg_rating: b.avg_rating,
              total_reviews: b.total_reviews
            };
          });
          setTrendingBusinesses(trendMapped);
        }
      }
    };
    
    // Geolocation Handling
    const handleFallbackLocation = () => {
      const savedCoords = localStorage.getItem("user_city_coords");
      let lat = 28.6139;
      let lng = 77.2090;
      
      if (savedCoords) {
        try {
          const parsed = JSON.parse(savedCoords);
          lat = parsed.lat;
          lng = parsed.lng;
        } catch (e) {
          console.error("Error parsing saved coords", e);
        }
      }
      
      setUserLoc({ lat, lng });
      fetchLiveBusinesses(lat, lng);
      fetchCityName(lat, lng);
    };

    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(
          (pos) => {
             const { latitude, longitude } = pos.coords;
             setUserLoc({ lat: latitude, lng: longitude });
             fetchLiveBusinesses(latitude, longitude);
             fetchCityName(latitude, longitude);
          },
          (posError) => {
             console.warn("Location denied, falling back", posError);
             handleFallbackLocation();
          },
          { enableHighAccuracy: true, timeout: 5000 }
       );
    } else {
       handleFallbackLocation();
    }
    // Live Pulse Logic via RPC
    const fetchPulseData = async () => {
      try {
        const { data, error } = await supabase.rpc('get_live_pulse_data');
        if (error) {
          console.error("Pulse data fetch failed:", error);
          return;
        }
        
        if (data) {
          // If it's the stats object, transform into displayable pulse items
          if (!Array.isArray(data) && typeof data === 'object') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const stats = data as any;
            const transformedItems = [
              { 
                type: 'LIVE', 
                name: 'Network Status', 
                label: `${stats.active_queues || 0} active queues across India`,
                org_id: 'system'
              },
              { 
                type: 'ALERT', 
                name: 'Tokens Today', 
                label: `${stats.tokens_today || 0} customers saved time today`,
                org_id: 'system'
              }
            ];
            
            if (stats.busiest_business) {
              transformedItems.push({
                type: 'FALLBACK',
                name: 'High Demand',
                label: `${stats.busiest_business} is busy now`,
                org_id: 'system'
              });
            }
            
            setPulseItems(transformedItems);
          } else if (Array.isArray(data)) {
            setPulseItems(data);
          }
        }
      } catch (err) {
        console.error("Error in pulse data logic:", err);
      }
    };

    fetchPulseData();

    // Realtime Subscriptions
    const tokenSub = supabase
      .channel('public:tokens')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tokens' }, async (payload) => {
        // Fetch new pulse data or manually prepend
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: biz } = await (supabase.from('businesses').select('name, category').eq('id', payload.new.orgId).single() as any);
        if (biz) {
          const newItem = {
            type: 'LIVE',
            org_id: payload.new.orgId,
            name: biz.name,
            category: biz.category,
            count: 1,
            label: 'Someone just joined the queue'
          };
          setPulseItems(prev => [newItem, ...prev.slice(0, 7)]);
        }
      })
      .subscribe();

    const queueSub = supabase
      .channel('public:queues')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'queues' }, (payload) => {
        const oldWaiting = payload.old.total_waiting;
        const newWaiting = payload.new.total_waiting;
        
        // Wait time dropped alert
        if (oldWaiting - newWaiting > 5) {
           setPulseItems(prev => [{
             type: 'ALERT',
             label: '⚡ Wait time dropped significantly!',
             name: 'Nearby Queue'
           }, ...prev.slice(0, 7)]);
        }

        // FastPass Alert (Low slots)
        if (newWaiting > 20) { // Busy alert
           setPulseItems(prev => [{
             type: 'ALERT',
             label: '🔥 Busy: Join now to save your spot',
             name: 'Fast Track'
           }, ...prev.slice(0, 7)]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(tokenSub);
      supabase.removeChannel(queueSub);
    };
  }, [user]);

  const handleDismissOnboarding = async () => {
    if (!user) return;
    setShowOnboarding(false);
    
    // Increment visit_count in DB
    await (supabase
      .from('user_profiles') as any)
      .update({ visit_count: (visitCount || 0) + 1 })
      .eq('id', user.id);
  };

  // Filter Data
  const filteredBusinesses = useMemo(() => {
    return liveBusinesses.filter(b => {
      const matchCategory = activeCategory === "all" || b.category === activeCategory;
      const matchSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    }).sort((a, b) => a.distance - b.distance); // Sort geographically nearest first
  }, [liveBusinesses, searchQuery, activeCategory]);

  const fastestQueues = useMemo(() => {
    return [...liveBusinesses]
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 6);
  }, [liveBusinesses]);

  const popularQueues = useMemo(() => {
    return [...liveBusinesses]
      .sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0))
      .slice(0, 6);
  }, [liveBusinesses]);

  const favoriteQueues = useMemo(() => {
    // Check localStorage for favorited or recently visited businesses
    const lastId = typeof window !== 'undefined' ? localStorage.getItem("last_visited_business_id") : null;
    return liveBusinesses.filter(b => b.id === lastId);
  }, [liveBusinesses]);

  // Reusable Queue Card Component
  const QueueCard = ({ biz, layout = "vertical" }: { biz: Business, layout?: "vertical" | "horizontal" }) => {
    if (layout === "horizontal") {
      return (
        <div 
          onClick={() => router.push(`/b/${biz.id}`)}
          className="bg-surface rounded-2xl p-4 min-w-[260px] max-w-[260px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-border flex gap-4 active:scale-95 transition-transform cursor-pointer hover:shadow-lg"
        >
          <div className="w-16 h-16 rounded-xl bg-slate-50 border border-white/10 overflow-hidden shrink-0 relative">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src={biz.image} alt={biz.name} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-black/10 flex items-center justify-center text-2xl drop-shadow-md">{biz.icon}</div>
          </div>
          <div className="flex flex-col justify-center flex-1 min-w-0">
             <h4 className="font-bold text-zinc-200 text-sm truncate">{biz.name}</h4>
             <p className="text-zinc-500 text-xs mb-1 truncate">{biz.address} • {biz.distance}km</p>
             <div className="flex items-center gap-1 text-xs font-bold text-[#22C55E]">
                <Clock size={12} /> {biz.waitTime} min wait
             </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        onClick={() => router.push(`/b/${biz.id}`)}
        className="bg-surface rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-border active:scale-95 transition-transform cursor-pointer hover:shadow-xl group"
      >
        <div className="relative h-32 w-full rounded-xl overflow-hidden mb-4 bg-white/5">
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src={biz.image} alt={biz.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
           <div className="absolute top-2 right-2 bg-black/60 bg-opacity-95 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider text-zinc-200">
             {biz.distance} km
           </div>
           <div className="absolute bottom-2 left-2 flex items-center gap-2">
             <span className="text-2xl drop-shadow-md">{biz.icon}</span>
             {biz.queueLength > 5 ? (
                <span className="text-white font-bold text-[10px] tracking-widest uppercase bg-rose-500/80 px-2 py-0.5 rounded-md bg-opacity-95 shadow-sm border border-rose-400">Busy</span>
             ) : biz.queueLength === 0 ? (
                <span className="text-emerald-900 font-bold text-[10px] tracking-widest uppercase bg-emerald-400/90 px-2 py-0.5 rounded-md bg-opacity-95 shadow-sm border border-emerald-300">Open Now</span>
             ) : (
                <span className="text-white font-bold text-sm tracking-wide bg-black/30 px-2 py-0.5 rounded-md bg-opacity-95 border border-white/20 shadow-sm">{biz.category}</span>
             )}
           </div>
        </div>
        <div className="flex justify-between items-start mb-2">
           <div className="flex-1 min-w-0 pr-2">
              <h3 className="font-bold text-slate-900 text-base leading-tight truncate">{biz.name}</h3>
              <p className="text-zinc-500 text-xs mt-0.5 truncate">{biz.address}</p>
           </div>
           <div className="flex flex-col items-end gap-1 shrink-0">
             {biz.avg_rating && biz.avg_rating > 0 ? (
               <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs">
                 <Star size={12} fill="currentColor" /> {biz.avg_rating}
               </div>
             ) : (
               <span className="bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded text-[10px] font-black uppercase">New</span>
             )}
             {biz.isFavorite && <Heart size={16} className="fill-[#00F5A0] text-[#0B6EFE]" />}
           </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
           <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 bg-[#22C55E]/10 text-[#22C55E] px-2.5 py-1 rounded-lg text-xs font-bold w-fit">
                 <Clock size={14} /> {biz.waitTime} min wait
              </div>
              {biz.bestTimeToVisit && (
                 <div className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
                    ⏰ Best: {biz.bestTimeToVisit.split('(')[0].trim()}
                 </div>
              )}
           </div>
           <div className="text-right">
              <div className="text-xs font-semibold text-zinc-500 bg-white/5 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Activity size={14} className="text-zinc-500" />
                Token {(TOKEN_PREFIXES[biz.category] || TOKEN_PREFIXES["default"])}-{queueStates[biz.id] || 100}
              </div>
              <p className="text-[10px] font-bold text-zinc-500 mt-1 uppercase tracking-tight">
                Now serving: #{(queueStates[biz.id] || 100) - biz.queueLength}
              </p>
           </div>
        </div>

        {/* Capacity Bar */}
        <div className="mt-4">
           <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
              <span>Queue Load</span>
              <span>{queueStates[biz.id] || 100}/{biz.max_capacity || 50} slots used</span>
           </div>
           <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, ((queueStates[biz.id] || 100) / (biz.max_capacity || 50)) * 100)}%` }}
                className={`h-full rounded-full ${
                  ((queueStates[biz.id] || 100) / (biz.max_capacity || 50)) < 0.4 ? 'bg-emerald-500' :
                  ((queueStates[biz.id] || 100) / (biz.max_capacity || 50)) < 0.7 ? 'bg-amber-500' :
                  'bg-rose-500'
                }`}
              />
           </div>
        </div>
        
        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-2">
           <button 
             onClick={(e) => {
               e.stopPropagation();
               router.push(`/b/${biz.id}`);
             }}
             className="bg-primary/10 text-primary font-bold text-sm py-2 rounded-xl hover:bg-primary hover:text-black transition-colors"
           >
             View Details
           </button>
           {userRole !== "business_owner" && (
             <button 
               onClick={(e) => {
                 e.stopPropagation();
                 router.push(`/b/${biz.id}`);
               }}
               className="bg-blue-600 text-white font-bold text-sm py-2 rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-600/90 transition-colors"
             >
               Join Now
             </button>
           )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background pb-28 font-sans selection:bg-primary/30 selection:text-primary">
      
      {/* SECTION 1 - LOCATION HEADER */ }
      <header className="sticky top-0 z-40 bg-background/95 px-4 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-4 border-b border-white/10">
         <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Link href="/" className="w-10 h-10 shrink-0 bg-white/5 rounded-full flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-primary transition-colors">
                 <ChevronLeft size={20} />
               </Link>
               <div>
                  <div className="flex items-center gap-1 text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">
                    <MapPin size={12} className="text-amber-500" /> Current Location
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-white font-extrabold text-lg flex items-center">{locationName}</h2>
                    <ChevronDown size={18} className={`text-primary ${isLocating ? 'animate-bounce' : ''}`} />
                  </div>
               </div>
            </div>
            {/* User Profile Hook */}
            <Link 
               href={user ? (userRole === "business_owner" ? "/dashboard" : "/customer/profile") : "/login"}
               className="w-10 h-10 rounded-full bg-white/5 border border-white/10 overflow-hidden shadow-inner hover:ring-2 hover:ring-primary transition-all"
            >
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={`https://ui-avatars.com/api/?name=${user?.id || 'User'}&background=00F5A0&color=0A0A0F`} alt="User" />
            </Link>
         </div>

         {user && (
            <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className="max-w-2xl mx-auto mt-4"
            >
               <Link 
                  href="/customer/dashboard"
                  className="w-full flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-xl group hover:bg-primary/20 transition-all"
               >
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-black">
                        <Ticket size={16} />
                     </div>
                     <span className="text-xs font-black text-primary uppercase tracking-widest">Active Tokens Found</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase">
                     Dashboard <ChevronRight size={14} />
                  </div>
               </Link>
            </motion.div>
         )}

         {/* SECTION 2 - GLOBAL SEARCH BAR */}
         <div className="max-w-2xl mx-auto mt-4 px-1 space-y-4">
            <div className="flex gap-3">
               <div className="relative group flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <Search className="w-5 h-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input 
                     type="text" 
                     placeholder="Search hospitals, banks, salons, events..." 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-[1.2rem] text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium shadow-[0_2px_15px_rgba(0,0,0,0.1)]"
                  />
               </div>
               <button 
                  onClick={() => router.push('/customer/scanner')}
                  className="w-14 h-14 bg-white/5 border border-white/10 rounded-[1.2rem] flex items-center justify-center text-zinc-400 hover:text-primary hover:border-primary transition-all shadow-sm shrink-0"
                  title="Scan Store QR"
               >
                  <QrCode size={24} />
               </button>
            </div>

            {/* CATEGORY FILTER PILLS */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
              {CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`snap-start whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border ${
                    activeCategory === category.id 
                    ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20' 
                    : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg">{category.icon}</span> {category.name}
                </button>
              ))}
            </div>
         </div>
      </header>

      <RecentlyVisitedBanner businesses={liveBusinesses} queueStates={queueStates} />

      <AnimatePresence>
        {showOnboarding && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="max-w-2xl mx-auto px-4 mt-4 overflow-hidden"
          >
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-start gap-4 shadow-lg shadow-primary/5">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-xl shrink-0">
                👋
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-sm">Welcome to QueueLess!</h4>
                <p className="text-[11px] font-medium text-zinc-400 mt-0.5 leading-tight">
                  Tap any business below to join their queue — no more standing in line.
                </p>
                <button 
                  onClick={handleDismissOnboarding}
                  className="mt-3 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-10">
         
         <section className="bg-gradient-to-br from-indigo-900 via-slate-900 to-black rounded-[2rem] p-5 shadow-[0_8px_30px_rgba(30,27,75,0.2)] relative overflow-hidden border border-white/10 z-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/100 rounded-full blur-[80px] opacity-20 pointer-events-none -z-10" />
            <div className="flex items-center justify-between mb-4 relative z-10">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                  <h2 className="text-white font-bold text-sm tracking-widest uppercase">Live Queue Pulse</h2>
               </div>
            </div>
            
            <div className="relative z-10 h-14 overflow-hidden mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)">
               <motion.div
                 animate={{ y: pulseItems.length > 1 ? [0, -56 * (pulseItems.length - 1)] : 0 }}
                 transition={{ 
                   repeat: Infinity, 
                   duration: Math.max(10, pulseItems.length * 3), 
                   ease: "linear" 
                 }}
                 className="flex flex-col gap-4"
                 whileHover={{ animationPlayState: 'paused' }}
               >
                  {pulseItems.map((item, idx) => (
                    <div key={`${item.org_id}-${idx}`} className="flex items-start gap-3 h-10">
                       <div className={`p-2 rounded-lg shrink-0 shadow-inner ${
                         item.type === 'ALERT' ? 'bg-emerald-500/20 text-emerald-400' :
                         item.type === 'FALLBACK' ? 'bg-amber-500/20 text-amber-400' :
                         'bg-indigo-500/100/20 text-indigo-400'
                       }`}>
                          {item.type === 'ALERT' ? <Zap size={16} /> : 
                           item.type === 'FALLBACK' ? <TrendingUp size={16} /> : 
                           <Activity size={16} />}
                       </div>
                       <div>
                          <p className="font-bold text-white text-sm truncate max-w-[200px]">{item.name}</p>
                          <p className={`text-xs font-medium ${
                            item.type === 'ALERT' ? 'text-emerald-200' :
                            item.type === 'FALLBACK' ? 'text-amber-200' :
                            'text-indigo-200'
                          }`}>{item.label}</p>
                       </div>
                    </div>
                  ))}
                  {/* Seamless loop clone */}
                  {pulseItems.length > 0 && (
                    <div className="flex items-start gap-3 h-10">
                       <div className={`p-2 rounded-lg shrink-0 shadow-inner ${
                         pulseItems[0].type === 'ALERT' ? 'bg-emerald-500/20 text-emerald-400' :
                         'bg-indigo-500/100/20 text-indigo-400'
                       }`}>
                          <Activity size={16} />
                       </div>
                       <div>
                          <p className="font-bold text-white text-sm">{pulseItems[0].name}</p>
                          <p className="text-xs text-indigo-200 font-medium">{pulseItems[0].label}</p>
                       </div>
                    </div>
                  )}
               </motion.div>
            </div>
         </section>

         {/* INTERACTIVE DEMO SECTION */}
         <DemoQueueCards />

         {/* SECTION 9 - ACTIVE QUEUE CARD (Sticky behavior implied by being top of feed) */}
         {activeTokenMap && (
            <motion.div 
               initial={{ opacity: 0, y: -20, height: 0 }}
               animate={{ opacity: 1, y: 0, height: "auto" }}
               className="bg-slate-900 text-white rounded-[1.5rem] p-5 shadow-2xl relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500 rounded-full blur-[80px] opacity-30" />
               <div className="relative z-10 flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                     <div className="p-1.5 bg-white/20 rounded-lg"><Activity size={18} /></div>
                     <span className="font-bold tracking-widest text-[10px] uppercase text-amber-500">Your Active Token</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="px-2 py-1 bg-white/10 rounded-md text-xs font-bold text-white">Active</span>
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         localStorage.removeItem("active_org");
                         localStorage.removeItem("active_token");
                         setActiveTokenMap(null);
                       }}
                       className="p-1 bg-white/10 hover:bg-white/20 rounded-md text-white/70 hover:text-white transition-colors flex items-center justify-center shrink-0"
                       title="Dismiss Test Token"
                     >
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                     </button>
                  </div>
               </div>
               <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-1">City Hospital</h3>
                  <div className="flex items-center justify-between mt-4">
                     <div>
                        <p className="text-zinc-500 text-xs font-semibold mb-1">Token Number</p>
                        <p className="text-3xl font-black text-[#F59E0B]">H-042</p>
                     </div>
                     <div className="text-right">
                        <p className="text-zinc-500 text-xs font-semibold mb-1">Status</p>
                        <p className="text-lg font-bold">5 Ahead</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => router.push(`/customer/queue/${activeTokenMap.orgId}/${activeTokenMap.tokenId}`)}
                    className="w-full mt-6 bg-white text-slate-900 font-bold py-3 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                  >
                     View Queue Status <ArrowRight size={16} />
                  </button>
               </div>
            </motion.div>
         )}

         {/* CATEGORY CHIPS REMOVED - NOW AT TOP OF FEED */}

         {/* Search Filter Warning if empty */}
         {/* Search Filter Warning if empty */}
         {filteredBusinesses.length === 0 && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="text-center py-16 bg-white/5 border border-white/10 rounded-[2rem] mx-2"
            >
               <div className="mx-auto w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-500 mb-6 shadow-inner border border-white/5">
                  <Search size={28} />
               </div>
               <h3 className="text-xl font-black text-white tracking-tight mb-2">No queues found</h3>
               <p className="text-zinc-500 text-sm font-medium mb-8 max-w-[260px] mx-auto">
                 {searchQuery 
                   ? `We couldn't find any results for "${searchQuery}".` 
                   : `There are currently no active queues in the ${CATEGORIES.find(c => c.id === activeCategory)?.name || 'selected'} category.`}
               </p>
               
               {(searchQuery || activeCategory !== 'all') && (
                 <button 
                   onClick={() => {
                     setSearchQuery("");
                     setActiveCategory("all");
                   }}
                   className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-colors"
                 >
                   Clear Filters
                 </button>
               )}
            </motion.div>
         )}

         {/* FEED CONTENT - Only show rows if not explicitly searching */}
         {searchQuery.length === 0 && activeCategory === "all" ? (
            <>
               {/* SECTION 8 - FAVORITE BUSINESSES / TRENDING fallback */}
               <section>
                  <div className="flex items-center justify-between mb-4">
                     <h2 className="text-lg font-black text-white flex items-center gap-2">
                       {user && favoriteQueues.length > 0 ? "⭐ Your Favorites" : "🔥 Trending Near You"}
                     </h2>
                  </div>
                  <div className="-mx-4 px-4 overflow-x-auto no-scrollbar pb-4">
                     <div className="flex gap-4 w-max">
                        {user && favoriteQueues.length > 0 
                          ? favoriteQueues.map(biz => <QueueCard key={biz.id} biz={biz} layout="horizontal" />)
                          : trendingBusinesses.map(biz => <QueueCard key={`trend-${biz.id}`} biz={biz} layout="horizontal" />)
                        }
                     </div>
                  </div>
               </section>

               {/* SECTION 5 - FASTEST QUEUES */}
               <section>
                  <div className="flex items-center justify-between mb-4 mt-2">
                     <h2 className="text-lg font-black text-white flex items-center gap-2">⚡ Fastest Service Nearby</h2>
                  </div>
                  <div className="-mx-4 px-4 overflow-x-auto no-scrollbar pb-4">
                     <div className="flex gap-4 w-max">
                        {fastestQueues.map(biz => <QueueCard key={`fast-${biz.id}`} biz={biz} layout="horizontal" />)}
                     </div>
                  </div>
               </section>

               {/* SECTION 7 - MAP PREVIEW */}
               <section className="bg-surface rounded-3xl p-5 border border-border shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-80 relative overflow-hidden group cursor-pointer block">
                  <div className="absolute top-5 left-5 right-5 z-10 flex justify-between items-start pointer-events-none">
                     <h2 className="text-lg font-black text-white bg-[#0A0A0F]/90 bg-opacity-95 px-4 py-2 rounded-xl shadow-lg">City Map View</h2>
                  </div>
                  <LeafletMiniMap center={userLoc ? [userLoc.lat, userLoc.lng] : CURRENT_LOCATION.coordinates} markers={liveBusinesses.slice(0, 10).map(b => ({ id: b.id, name: b.name, position: b.coordinates, waitTime: b.waitTime }))} />
                  
                  {/* Fake View Map overlay */}
                  <div 
                     onClick={() => router.push('/map')}
                     className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background via-background/80 to-transparent flex items-end justify-center pb-6 z-10"
                  >
                     <button className="bg-primary text-black px-6 py-3 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2 hover:-translate-y-1 transition-transform">
                        Explore Full Map <ArrowRight size={16} />
                     </button>
                  </div>
               </section>

               {/* SECTION 6 - POPULAR QUEUES */}
               <section>
                  <div className="flex items-center justify-between mb-4">
                     <h2 className="text-lg font-black text-white flex items-center gap-2">🔥 Popular Right Now</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {popularQueues.map(biz => <QueueCard key={`pop-${biz.id}`} biz={biz} />)}
                  </div>
               </section>
            </>
         ) : null}

         {/* SECTION 4 - STANDARD NEARBY QUEUES FEED */}
         {(searchQuery.length > 0 || activeCategory !== "all") && (
            <section>
               <h2 className="text-lg font-black text-white mb-4 px-1">{filteredBusinesses.length} Queues nearby</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredBusinesses.map(biz => <QueueCard key={biz.id} biz={biz} />)}
               </div>
            </section>
         )}

      </main>

    </div>
  );
}
