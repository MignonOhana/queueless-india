export interface Business {
  id: string;
  name: string;
  category: "Hospitals" | "Banks" | "Salons" | "Government" | "Restaurants" | "Events" | "Airport Services";
  icon: string;
  distance: number; // km
  waitTime: number; // mins
  queueLength: number;
  address: string;
  isFastest?: boolean;
  isPopular?: boolean;
  isFavorite?: boolean;
  coordinates: [number, number]; // [lat, lng]
  image: string; // URL placeholder
}

export const CURRENT_LOCATION = {
  name: "Connaught Place, Delhi",
  coordinates: [28.6304, 77.2177] as [number, number]
};

// Abstracted helper to generate variance
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomImage = (category: string) => `https://source.unsplash.com/400x300/?${category.toLowerCase()},india`;

// Comprehensive Mock Data spanning multiple categories and locations
export const MOCK_BUSINESSES: Business[] = [
  // Delhi Medical
  { id: "aiims-delhi", name: "AIIMS Delhi", category: "Hospitals", icon: "🏥", distance: 4.2, waitTime: 45, queueLength: 82, address: "Ansari Nagar", isPopular: true, coordinates: [28.5659, 77.2089], image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400&h=300" },
  { id: "max-panchsheel", name: "Max Super Specialty", category: "Hospitals", icon: "🏥", distance: 8.5, waitTime: 12, queueLength: 4, address: "Panchsheel Park", isFastest: true, coordinates: [28.5422, 77.2095], image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=400&h=300" },
  { id: "apollo-pharmacy", name: "Apollo Pharmacy", category: "Hospitals", icon: "💊", distance: 0.8, waitTime: 5, queueLength: 2, address: "Connaught Place", isFastest: true, isFavorite: true, coordinates: [28.6310, 77.2160], image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=400&h=300" },
  
  // Banks
  { id: "sbi-cp", name: "SBI Main Branch", category: "Banks", icon: "🏦", distance: 0.5, waitTime: 35, queueLength: 18, address: "Sansad Marg", isPopular: true, coordinates: [28.6258, 77.2104], image: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&q=80&w=400&h=300" },
  { id: "axis-cp", name: "Axis Bank", category: "Banks", icon: "🏦", distance: 0.6, waitTime: 6, queueLength: 1, address: "Barakhamba Road", isFastest: true, coordinates: [28.6300, 77.2250], image: "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?auto=format&fit=crop&q=80&w=400&h=300" },
  { id: "hdfc-gk1", name: "HDFC Bank", category: "Banks", icon: "🏦", distance: 12.1, waitTime: 15, queueLength: 5, address: "GK-1 Part 1", coordinates: [28.5469, 77.2403], image: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&q=80&w=400&h=300" },
  
  // Salons
  { id: "urban-salon-cp", name: "Urban Company Salon", category: "Salons", icon: "💇", distance: 1.1, waitTime: 8, queueLength: 3, address: "Janpath", isFastest: true, isFavorite: true, coordinates: [28.6247, 77.2183], image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400&h=300" },
  { id: "geetanjali-cp", name: "Geetanjali Salon", category: "Salons", icon: "💇", distance: 0.9, waitTime: 25, queueLength: 6, address: "Inner Circle, CP", coordinates: [28.6322, 77.2185], image: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&q=80&w=400&h=300" },
  
  // Govt Offices
  { id: "passport-seva", name: "Passport Seva Kendra", category: "Government", icon: "🛂", distance: 9.3, waitTime: 145, queueLength: 310, address: "Bhikaji Cama Place", isPopular: true, coordinates: [28.5684, 77.1855], image: "https://images.unsplash.com/photo-1555899434-94d1368aa7af?auto=format&fit=crop&q=80&w=400&h=300" },
  { id: "rto-delhi", name: "RTO Office", category: "Government", icon: "🚗", distance: 6.5, waitTime: 85, queueLength: 112, address: "Sarai Kale Khan", isPopular: true, coordinates: [28.5912, 77.2625], image: "https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&q=80&w=400&h=300" },
  { id: "aadhar-center", name: "Aadhar Enrollment Center", category: "Government", icon: "🇮🇳", distance: 2.3, waitTime: 55, queueLength: 42, address: "Gole Market", coordinates: [28.6330, 77.2001], image: "https://images.unsplash.com/photo-1531536643697-393bf40d995c?auto=format&fit=crop&q=80&w=400&h=300" },

  // Restaurants
  { id: "haldirams-cp", name: "Haldiram's", category: "Restaurants", icon: "🍽", distance: 0.2, waitTime: 20, queueLength: 15, address: "L Block, CP", isPopular: true, coordinates: [28.6328, 77.2137], image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=400&h=300" },
  { id: "starbucks-cp", name: "Starbucks Reserve", category: "Restaurants", icon: "☕", distance: 0.4, waitTime: 5, queueLength: 2, address: "N Block, CP", isFastest: true, coordinates: [28.6309, 77.2215], image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400&h=300" },
  { id: "saravana-bhavan", name: "Saravana Bhavan", category: "Restaurants", icon: "🍽", distance: 0.7, waitTime: 45, queueLength: 35, address: "Janpath", isPopular: true, isFavorite: true, coordinates: [28.6256, 77.2185], image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=400&h=300" },

  // Generative Fill to 50
  ...Array.from({ length: 36 }).map((_, i) => ({
     id: `gen-queue-${i}`,
     name: `Partner Service ${i}`,
     category: ["Hospitals", "Banks", "Salons", "Government", "Restaurants", "Events", "Airport Services"][randomInt(0, 6)] as any,
     icon: ["🏥", "🏦", "💇", "🏛", "🍽", "🎟", "✈"][randomInt(0, 6)],
     distance: Number((Math.random() * 15 + 0.5).toFixed(1)),
     waitTime: randomInt(2, 120),
     queueLength: randomInt(1, 50),
     address: "Greater Metro Area",
     coordinates: [28.6 + (Math.random() - 0.5)*0.2, 77.2 + (Math.random() - 0.5)*0.2] as [number, number],
     image: `https://images.unsplash.com/photo-${1500000000000 + randomInt(1000, 9999)}?auto=format&fit=crop&q=80&w=400&h=300&rnd=${i}`
  }))
];
