"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Search, Clock, ArrowRight, Activity, QrCode,
  TrendingUp, Zap, Ticket, ChevronRight, Star, Map, ChevronDown
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { CURRENT_LOCATION, Business } from "@/lib/mockHomeData";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
import { useAuth } from "@/context/AuthContext";
import { haversineDistance } from "@/lib/geolocation";
import { DemoQueueCards } from "@/components/Home/DemoQueueCards";

const LeafletMiniMap = dynamic(() => import("@/components/Map/LeafletMiniMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-white/5 animate-pulse rounded-2xl flex items-center justify-center font-bold text-zinc-500 text-sm">Loading Map...</div>
});

const CATEGORIES = [
  { id: "all", name: "All Queues", icon: "🌐" },
  { id: "Hospitals", name: "Hospitals", icon: "🏥" },
  { id: "Banks", name: "Banks", icon: "🏦" },
  { id: "Salons", name: "Salons", icon: "💇" },
  { id: "Government", name: "Government", icon: "🏛" },
  { id: "Restaurants", name: "Restaurants", icon: "🍽" },
  { id: "Events", name: "Events", icon: "🎟" },
];

const CATEGORY_ICONS: Record<string, string> = {
  "Hospital": "🏥", "Hospitals": "🏥",
  "Bank": "🏦", "Banks": "🏦",
  "Temple": "🛕", "Government": "🏛",
  "Railway Station": "🚆", "Court": "⚖️",
  "Post Office": "📮", "Salon": "💇", "Salons": "💇",
  "Restaurant": "🍽", "Restaurants": "🍽",
  "default": "🏢"
};

const TOKEN_PREFIXES: Record<string, string> = {
  "Hospital": "H", "Hospitals": "H",
  "Bank": "B", "Government": "G",
  "Temple": "T", "Railway Station": "R",
  "Court": "C", "Post Office": "P",
  "default": "Q"
};

// ─── Compact horizontal card (for scrollable rows) ─────────────────────────
function HCardSkeleton() {
  return (
    <div className="bg-white/5 rounded-2xl p-3.5 min-w-[200px] max-w-[200px] border border-white/5 flex gap-3 animate-pulse">
      <div className="w-14 h-14 rounded-xl bg-white/10 shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3 bg-white/10 rounded w-3/4" />
        <div className="h-2.5 bg-white/10 rounded w-1/2" />
        <div className="h-2.5 bg-white/10 rounded w-2/3" />
      </div>
    </div>
  );
}

function HCard({ biz, queueStates }: { biz: Business; queueStates: Record<string, number> }) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/b/${biz.id}`)}
      className="bg-zinc-900 rounded-2xl p-3.5 min-w-[200px] max-w-[200px] border border-white/8 flex gap-3 active:scale-95 transition-transform cursor-pointer"
    >
      {/* Image / Icon */}
      <div className="w-14 h-14 rounded-xl overflow-hidden relative shrink-0 bg-zinc-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={biz.image} alt={biz.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center text-2xl drop-shadow">{biz.icon}</div>
      </div>
      {/* Info */}
      <div className="flex flex-col justify-center min-w-0">
        <h4 className="font-bold text-white text-sm truncate leading-tight">{biz.name}</h4>
        <p className="text-zinc-500 text-[11px] truncate mt-0.5">{biz.address}</p>
        <div className="flex items-center gap-1 mt-1.5 text-emerald-400 text-[11px] font-bold">
          <Clock size={11} /> {biz.waitTime} min
          {biz.avg_rating && biz.avg_rating > 0 && (
            <span className="ml-auto flex items-center gap-0.5 text-amber-400">
              <Star size={10} fill="currentColor" /> {biz.avg_rating}
            </span>
          )}
        </div>
        {/* Mini capacity bar */}
        <div className="mt-1.5 w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              (queueStates[biz.id] || 0) < 10 ? "bg-emerald-500" :
              (queueStates[biz.id] || 0) < 25 ? "bg-amber-500" : "bg-rose-500"
            }`}
            style={{ width: `${Math.min(100, ((queueStates[biz.id] || 0) / (biz.max_capacity || 50)) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Full vertical card (for "Popular" grid) ───────────────────────────────
function VCard({ biz, queueStates }: { biz: Business; queueStates: Record<string, number> }) {
  const router = useRouter();
  const occupancy = (queueStates[biz.id] || 0) / (biz.max_capacity || 50);
  const busy = biz.queueLength > 5;
  const empty = biz.queueLength === 0;

  return (
    <div
      onClick={() => router.push(`/b/${biz.id}`)}
      className="bg-zinc-900 rounded-2xl overflow-hidden border border-white/8 active:scale-[0.98] transition-transform cursor-pointer"
    >
      {/* Banner image */}
      <div className="relative h-32 w-full bg-zinc-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={biz.image} alt={biz.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        {/* Top-right distance */}
        <div className="absolute top-2.5 right-2.5 bg-black/70 px-2 py-0.5 rounded-lg text-[10px] font-black text-zinc-300 uppercase tracking-wider">
          {biz.distance > 0 ? `${biz.distance.toFixed(1)} km` : "Nearby"}
        </div>
        {/* Bottom-left status badge */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
          <span className="text-xl drop-shadow">{biz.icon}</span>
          {busy ? (
            <span className="bg-rose-500/90 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">Busy</span>
          ) : empty ? (
            <span className="bg-emerald-500/90 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">Open</span>
          ) : (
            <span className="bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-md">{biz.category}</span>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <h3 className="font-bold text-white text-sm leading-tight truncate">{biz.name}</h3>
            <p className="text-zinc-500 text-[11px] truncate mt-0.5">{biz.address}</p>
          </div>
          <div className="shrink-0">
            {biz.avg_rating && biz.avg_rating > 0 ? (
              <div className="flex items-center gap-0.5 text-amber-400 font-bold text-xs">
                <Star size={11} fill="currentColor" /> {biz.avg_rating}
              </div>
            ) : (
              <span className="bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded text-[10px] font-black uppercase">New</span>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-2 text-[11px] mb-3">
          <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2.5 py-1.5 rounded-lg font-bold">
            <Clock size={12} /> {biz.waitTime} min
          </div>
          <div className="flex items-center gap-1 bg-white/5 text-zinc-400 px-2.5 py-1.5 rounded-lg font-bold ml-auto">
            <Activity size={12} />
            Token {(TOKEN_PREFIXES[biz.category] || "Q")}-{queueStates[biz.id] || 1}
          </div>
        </div>

        {/* Capacity bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-zinc-600 mb-1 font-bold uppercase tracking-wide">
            <span>Queue Load</span>
            <span>{biz.queueLength} waiting</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                occupancy < 0.4 ? "bg-emerald-500" : occupancy < 0.7 ? "bg-amber-500" : "bg-rose-500"
              }`}
              style={{ width: `${Math.min(100, occupancy * 100)}%` }}
            />
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={(e) => { e.stopPropagation(); }}
          className="w-full bg-[#00F5A0] text-black font-black text-xs py-2.5 rounded-xl uppercase tracking-widest active:scale-95 transition-transform"
        >
          Join Queue →
        </button>
      </div>
    </div>
  );
}

// ─── Section header ────────────────────────────────────────────────────────
function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-3 px-1">
      <h2 className="text-white font-black text-base">{title}</h2>
      {href && (
        <Link href={href} className="text-[#00F5A0] text-xs font-black uppercase tracking-widest flex items-center gap-1">
          All <ChevronRight size={12} />
        </Link>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function HomeClient({ initialBusinesses = [] }: { initialBusinesses?: Business[] }) {
  const router = useRouter();
  const { user, userRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTokenMap, setActiveTokenMap] = useState<any>(null);
  const [liveBusinesses, setLiveBusinesses] = useState<Business[]>(initialBusinesses);
  const [trendingBusinesses, setTrendingBusinesses] = useState<Business[]>(initialBusinesses.slice(0, 6));
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState("Detecting...");
  const [isLocating, setIsLocating] = useState(true);
  const [queueStates, setQueueStates] = useState<Record<string, number>>({});
  const [pulseItems, setPulseItems] = useState<any[]>([]);
  const [dataLoaded, setDataLoaded] = useState(initialBusinesses.length > 0);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const savedOrg = localStorage.getItem("active_org");
    const savedToken = localStorage.getItem("active_token");
    if (savedOrg && savedToken) setActiveTokenMap({ orgId: savedOrg, tokenId: savedToken });

    // ── Reverse geocode ────────────────────────────────────────────────
    const fetchCityName = async (lat: number, lng: number) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const d = await res.json();
        setLocationName(d.address.city || d.address.town || d.address.village || d.address.suburb || "Your Area");
      } catch { setLocationName("Your Area"); }
      finally { setIsLocating(false); }
    };

    // ── Fetch businesses + queues ──────────────────────────────────────
    const fetchLiveBusinesses = async (userLat?: number, userLng?: number) => {
      const { data, error } = await (supabase.from("businesses") as any).select("*").not("latitude", "is", null).not("longitude", "is", null);
      if (error || !data) { setDataLoaded(true); return; }

      const { data: queueData } = await (supabase.from("queues") as any).select("org_id, last_issued_number, total_waiting, max_capacity");
      const qMap: Record<string, number> = {};
      const qLenMap: Record<string, number> = {};
      const qCapMap: Record<string, number> = {};
      (queueData || []).forEach((q: any) => {
        qMap[q.org_id] = q.last_issued_number;
        qLenMap[q.org_id] = q.total_waiting;
        qCapMap[q.org_id] = q.max_capacity;
      });
      setQueueStates(qMap);

      const mapped: Business[] = data.map((b: any) => ({
        id: b.id, name: b.name, category: b.category, address: b.location,
        distance: userLat && userLng ? haversineDistance(userLat, userLng, Number(b.latitude), Number(b.longitude)) : 0,
        waitTime: b.serviceMins || 15,
        queueLength: qLenMap[b.id] || 0,
        image: b.image || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop",
        icon: CATEGORY_ICONS[b.category] || CATEGORY_ICONS["default"],
        coordinates: [Number(b.latitude), Number(b.longitude)] as [number, number],
        isFastest: b.fastPassEnabled, isPopular: true, isFavorite: false,
        max_capacity: qCapMap[b.id] || 50,
        avg_rating: b.avg_rating, total_reviews: b.total_reviews
      }));

      setLiveBusinesses(mapped);
      setTrendingBusinesses([...mapped].sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0)).slice(0, 6));
      setDataLoaded(true);
    };

    // ── Pulse ──────────────────────────────────────────────────────────
    const fetchPulse = async () => {
      try {
        const { data } = await supabase.rpc('get_live_pulse_data');
        if (data && !Array.isArray(data)) {
          const s = data as any;
          setPulseItems([
            { type: 'LIVE', name: 'Network Status', label: `${s.active_queues || 0} active queues across India` },
            { type: 'ALERT', name: 'Tokens Today', label: `${s.tokens_today || 0} customers saved time today` },
            ...(s.busiest_business ? [{ type: 'FALLBACK', name: 'High Demand', label: `${s.busiest_business} is busy now` }] : [])
          ]);
        } else if (Array.isArray(data)) setPulseItems(data);
      } catch { /* silent */ }
    };

    // ── Geolocation ────────────────────────────────────────────────────
    const fallback = () => {
      const saved = localStorage.getItem("user_city_coords");
      let lat = 28.6139, lng = 77.2090;
      try { if (saved) { const p = JSON.parse(saved); lat = p.lat; lng = p.lng; } } catch { /**/ }
      setUserLoc({ lat, lng });
      fetchLiveBusinesses(lat, lng);
      fetchCityName(lat, lng);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude: lat, longitude: lng } }) => {
          setUserLoc({ lat, lng });
          fetchLiveBusinesses(lat, lng);
          fetchCityName(lat, lng);
        },
        () => fallback(),
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else fallback();

    fetchPulse();

    // ── Realtime ───────────────────────────────────────────────────────
    const tokenSub = supabase.channel('public:tokens')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tokens' }, async (payload) => {
        const { data: biz } = await (supabase.from('businesses').select('name, category').eq('id', payload.new.orgId).single() as any);
        if (biz) setPulseItems(prev => [{ type: 'LIVE', org_id: payload.new.orgId, name: biz.name, label: 'Someone just joined the queue' }, ...prev.slice(0, 7)]);
      }).subscribe();

    return () => { supabase.removeChannel(tokenSub); };
  }, [user]);

  const filteredBusinesses = useMemo(() =>
    liveBusinesses.filter(b => {
      const cat = activeCategory === "all" || b.category === activeCategory;
      const q = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.category.toLowerCase().includes(searchQuery.toLowerCase());
      return cat && q;
    }).sort((a, b) => a.distance - b.distance),
    [liveBusinesses, searchQuery, activeCategory]
  );

  const nearbyQueues = useMemo(() =>
    [...liveBusinesses].sort((a, b) => a.distance - b.distance).slice(0, 6),
    [liveBusinesses]
  );

  const isFiltering = searchQuery.length > 0 || activeCategory !== "all";

  return (
    <div className="min-h-screen bg-[#0A0A0F] pb-28 overflow-x-hidden">

      {/* ── STICKY HEADER ── */}
      <header className="sticky top-0 z-40 bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-white/5 px-4 pt-3 pb-3">
        {/* Row 1: Location + Avatar */}
        <div className="flex items-center justify-between mb-3">
          <button className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <MapPin size={15} className="text-amber-400" />
            </div>
            <div className="text-left">
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider leading-none">Current Location</p>
              <div className="flex items-center gap-1 mt-0.5">
                <p className="text-white font-black text-sm leading-none">{locationName}</p>
                <ChevronDown size={12} className={`text-[#00F5A0] ${isLocating ? "animate-bounce" : ""}`} />
              </div>
            </div>
          </button>

          <Link
            href={user ? (userRole === "business_owner" ? "/dashboard" : "/customer/profile") : "/login"}
            className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/10 hover:ring-[#00F5A0]/50 transition-all"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://ui-avatars.com/api/?name=${user?.id || "U"}&background=00F5A0&color=0A0A0F`} alt="Profile" className="w-full h-full" />
          </Link>
        </div>

        {/* Row 2: Search + QR */}
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search hospitals, banks, salons..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-white/8 rounded-xl text-white placeholder-zinc-600 text-sm font-medium focus:outline-none focus:border-[#00F5A0]/50 transition-all"
            />
          </div>
          <button
            onClick={() => router.push('/customer/scanner')}
            className="w-10 h-10 bg-zinc-900 border border-white/8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-[#00F5A0] transition-colors shrink-0"
            title="Scan QR"
          >
            <QrCode size={18} />
          </button>
        </div>

        {/* Row 3: Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x -mx-4 px-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`snap-start whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border shrink-0 ${
                activeCategory === cat.id
                  ? "bg-[#00F5A0] text-black border-[#00F5A0] shadow-lg shadow-[#00F5A0]/20"
                  : "bg-zinc-900 text-zinc-400 border-white/8"
              }`}
            >
              <span className="text-base leading-none">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {/* ── ACTIVE TOKEN BANNER ── */}
      <AnimatePresence>
        {activeTokenMap && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mx-4 mt-3 overflow-hidden"
          >
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Ticket size={18} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Active Token</p>
                  <p className="text-white font-bold text-sm">You're in a queue!</p>
                </div>
              </div>
              <button
                onClick={() => router.push(`/customer/queue/${activeTokenMap.orgId}/${activeTokenMap.tokenId}`)}
                className="bg-amber-500 text-black font-black text-xs px-4 py-2.5 rounded-xl uppercase tracking-widest"
              >
                Track →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <main className="px-4 py-4 space-y-6">

        {/* ── LIVE PULSE ── */}
        {pulseItems.length > 0 && (
          <section className="bg-gradient-to-br from-indigo-950 via-zinc-900 to-zinc-900 rounded-2xl p-4 border border-indigo-500/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-3 relative">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              <h2 className="text-white font-bold text-xs tracking-widest uppercase">Live Queue Pulse</h2>
            </div>
            <div className="h-10 overflow-hidden relative">
              <motion.div
                animate={{ y: pulseItems.length > 1 ? [0, -(40 + 16) * (pulseItems.length - 1)] : 0 }}
                transition={{ repeat: Infinity, duration: Math.max(10, pulseItems.length * 3), ease: "linear" }}
                className="flex flex-col gap-4"
              >
                {pulseItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 h-10">
                    <div className={`p-1.5 rounded-lg shrink-0 ${
                      item.type === 'ALERT' ? 'bg-emerald-500/20 text-emerald-400' :
                      item.type === 'FALLBACK' ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'
                    }`}>
                      {item.type === 'ALERT' ? <Zap size={14} /> : item.type === 'FALLBACK' ? <TrendingUp size={14} /> : <Activity size={14} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs font-bold truncate">{item.name}</p>
                      <p className="text-zinc-400 text-[11px] truncate">{item.label}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* ── DEMO QUEUE CARDS ── */}
        <DemoQueueCards />

        {/* ── FILTERING RESULTS ── */}
        {isFiltering && (
          <section>
            <SectionHeader title={`${filteredBusinesses.length} queues found`} />
            {filteredBusinesses.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900 rounded-2xl border border-white/5">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-zinc-500" />
                </div>
                <h3 className="text-white font-black text-base mb-2">No queues found</h3>
                <p className="text-zinc-500 text-sm mb-4 max-w-[220px] mx-auto">
                  {searchQuery ? `No results for "${searchQuery}"` : "No queues in this category"}
                </p>
                <button
                  onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                  className="px-5 py-2.5 bg-[#00F5A0]/10 text-[#00F5A0] text-xs font-black uppercase tracking-widest rounded-xl border border-[#00F5A0]/20"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredBusinesses.map(biz => <VCard key={biz.id} biz={biz} queueStates={queueStates} />)}
              </div>
            )}
          </section>
        )}

        {/* ── DEFAULT FEED (not filtering) ── */}
        {!isFiltering && (
          <>
            {/* Trending horizontal scroll */}
            <section>
              <SectionHeader title="🔥 Trending Near You" />
              {!dataLoaded ? (
                <div className="flex gap-3 -mx-4 px-4 overflow-x-auto pb-2">
                  {[1, 2, 3].map(i => <HCardSkeleton key={i} />)}
                </div>
              ) : trendingBusinesses.length > 0 ? (
                <div className="flex gap-3 -mx-4 px-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
                  {trendingBusinesses.map(biz => (
                    <div key={`trend-${biz.id}`} className="snap-start">
                      <HCard biz={biz} queueStates={queueStates} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-600 text-sm font-medium py-4 text-center">No businesses listed yet</p>
              )}
            </section>

            {/* Nearby scroll */}
            <section>
              <SectionHeader title="⚡ Fastest Nearby" />
              {!dataLoaded ? (
                <div className="flex gap-3 -mx-4 px-4 overflow-x-auto pb-2">
                  {[1, 2, 3].map(i => <HCardSkeleton key={i} />)}
                </div>
              ) : (
                <div className="flex gap-3 -mx-4 px-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
                  {nearbyQueues.map(biz => (
                    <div key={`near-${biz.id}`} className="snap-start">
                      <HCard biz={biz} queueStates={queueStates} />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Map teaser */}
            <section
              className="relative rounded-2xl overflow-hidden border border-white/8 cursor-pointer"
              style={{ height: 160 }}
              onClick={() => setShowMap(v => !v)}
            >
              {showMap ? (
                <div style={{ height: 160 }}>
                  <LeafletMiniMap
                    center={userLoc ? [userLoc.lat, userLoc.lng] : CURRENT_LOCATION.coordinates}
                    markers={liveBusinesses.slice(0, 10).map(b => ({ id: b.id, name: b.name, position: b.coordinates, waitTime: b.waitTime }))}
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-950/80 to-zinc-900 flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#00F5A0]/10 border border-[#00F5A0]/20 flex items-center justify-center">
                    <Map size={24} className="text-[#00F5A0]" />
                  </div>
                  <p className="text-white font-black text-sm">Tap to see City Map</p>
                  <p className="text-zinc-500 text-xs">View all queues on a live map</p>
                </div>
              )}
              <div className="absolute bottom-3 right-3 z-10">
                <button
                  onClick={(e) => { e.stopPropagation(); router.push('/map'); }}
                  className="bg-[#00F5A0] text-black px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-1.5 shadow-lg"
                >
                  Full Map <ArrowRight size={12} />
                </button>
              </div>
            </section>

            {/* Popular grid */}
            <section>
              <SectionHeader title="🏆 Popular Right Now" />
              {!dataLoaded ? (
                <div className="grid grid-cols-1 gap-4">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 animate-pulse">
                      <div className="h-32 bg-white/5" />
                      <div className="p-4 space-y-3">
                        <div className="h-3 bg-white/5 rounded w-2/3" />
                        <div className="h-2.5 bg-white/5 rounded w-1/2" />
                        <div className="h-8 bg-white/5 rounded-xl mt-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {trendingBusinesses.slice(0, 4).map(biz => (
                    <VCard key={`pop-${biz.id}`} biz={biz} queueStates={queueStates} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
