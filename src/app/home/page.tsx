import { createClient } from "@/lib/supabase/server";
import HomeClient from "./HomeClient";
import { Business } from "@/lib/mockHomeData";

export const revalidate = 300; // ISR: rebuild at most every 5 minutes
export const dynamic = 'force-static'; // serve from CDN cache

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

import * as Sentry from "@sentry/nextjs";

export default async function HomePage() {
  const supabase = await createClient();
  
  // Fetch initial businesses on the server for ISR
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  let initialBusinesses: Business[] = [];

  if (!error && data) {
    // Basic mapping for initial static render
    initialBusinesses = data.map((b: any) => ({
      id: b.id,
      name: b.name,
      category: b.category,
      address: b.location,
      distance: 0, // Calculated on client
      waitTime: b.serviceMins || 15,
      queueLength: 0, // Updated on client
      image: b.image || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop",
      icon: CATEGORY_ICONS[b.category] || CATEGORY_ICONS["default"],
      coordinates: [Number(b.latitude), Number(b.longitude)] as [number, number],
      isFastest: b.fastPassEnabled,
      isPopular: true,
      isFavorite: false,
    }));
  }

  return <HomeClient initialBusinesses={initialBusinesses} />;
}
