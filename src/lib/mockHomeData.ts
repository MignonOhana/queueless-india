export interface Business {
  id: string;
  name: string;
  category: string;
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
  max_capacity?: number;
  bestTimeToVisit?: string;
  avg_rating?: number;
  total_reviews?: number;
}

export const CURRENT_LOCATION = {
  name: "Connaught Place, Delhi",
  coordinates: [28.6304, 77.2177] as [number, number]
};

// Comprehensive Mock Data spanning multiple categories and locations
export const MOCK_BUSINESSES: Business[] = [];
