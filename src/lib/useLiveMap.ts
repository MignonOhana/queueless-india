import { useState, useEffect, useRef } from 'react';

export type ServiceCategory = 'Hospital' | 'Bank' | 'Salon' | 'Restaurant' | 'Government Office';

export interface BusinessMapData {
  id: string;
  name: string;
  location: [number, number]; // [lat, lng]
  category: ServiceCategory;
  services: string[];
  queue_length: number;
  avg_wait: number; // in minutes
  heat_score: number; // dynamically calculated
}

// Generate a large mock dataset centered around New Delhi [28.6139, 77.2090]
// Spread them out for a better heatmap effect
const INITIAL_BUSINESSES: BusinessMapData[] = [
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `hosp_${i}`,
    name: `City Hospital Center ${i + 1}`,
    location: [28.6139 + (Math.random() - 0.5) * 0.1, 77.2090 + (Math.random() - 0.5) * 0.1] as [number, number],
    category: 'Hospital' as ServiceCategory,
    services: ['OPD', 'Emergency', 'Pharmacy'],
    queue_length: Math.floor(Math.random() * 40) + 5,
    avg_wait: 0,
    heat_score: 0,
  })),
  ...Array.from({ length: 20 }).map((_, i) => ({
    id: `bank_${i}`,
    name: `State Bank Branch ${i + 1}`,
    location: [28.6139 + (Math.random() - 0.5) * 0.1, 77.2090 + (Math.random() - 0.5) * 0.1] as [number, number],
    category: 'Bank' as ServiceCategory,
    services: ['Deposits', 'Loans', 'Enquiry'],
    queue_length: Math.floor(Math.random() * 20) + 2,
    avg_wait: 0,
    heat_score: 0,
  })),
  ...Array.from({ length: 30 }).map((_, i) => ({
    id: `rest_${i}`,
    name: `Local Restaurant ${i + 1}`,
    location: [28.6139 + (Math.random() - 0.5) * 0.12, 77.2090 + (Math.random() - 0.5) * 0.12] as [number, number],
    category: 'Restaurant' as ServiceCategory,
    services: ['Dine-in', 'Takeaway'],
    queue_length: Math.floor(Math.random() * 15),
    avg_wait: 0,
    heat_score: 0,
  })),
  ...Array.from({ length: 10 }).map((_, i) => ({
    id: `gov_${i}`,
    name: `Gov Office ${i + 1}`,
    location: [28.6139 + (Math.random() - 0.5) * 0.08, 77.2090 + (Math.random() - 0.5) * 0.08] as [number, number],
    category: 'Government Office' as ServiceCategory,
    services: ['Registrations', 'IDs'],
    queue_length: Math.floor(Math.random() * 60) + 10,
    avg_wait: 0,
    heat_score: 0,
  })),
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `salon_${i}`,
    name: `Premium Salon ${i + 1}`,
    location: [28.6139 + (Math.random() - 0.5) * 0.15, 77.2090 + (Math.random() - 0.5) * 0.15] as [number, number],
    category: 'Salon' as ServiceCategory,
    services: ['Haircut', 'Spa'],
    queue_length: Math.floor(Math.random() * 5),
    avg_wait: 0,
    heat_score: 0,
  })),
].map(business => {
  // Pre-calculate initial wait times and heat scores
  let multiplier = 5; // Default 5 mins per person
  if (business.category === 'Hospital' || business.category === 'Government Office') multiplier = 10;
  if (business.category === 'Bank') multiplier = 3;
  if (business.category === 'Salon') multiplier = 15;

  const wait = business.queue_length * multiplier;
  return {
    ...business,
    avg_wait: wait > 0 ? wait : Math.floor(Math.random() * 10), // minimum wait if 0
    heat_score: business.queue_length * (wait || 10)
  };
});

export function useLiveMap() {
  const [businesses, setBusinesses] = useState<BusinessMapData[]>(INITIAL_BUSINESSES);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Throttle state updates for the heatmap performance
  const rafRef = useRef<number>(null);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      // Use requestAnimationFrame to avoid blocking the main thread during large array mapping
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        setBusinesses(prev => 
          prev.map(business => {
            // Apply slight random fluctuation (simulate real time queue joining/leaving)
            const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
            const newLength = Math.max(0, business.queue_length + change);
            
            let multiplier = 5;
            if (business.category === 'Hospital' || business.category === 'Government Office') multiplier = 10;
            if (business.category === 'Bank') multiplier = 3;
            if (business.category === 'Salon') multiplier = 15;
            
            const newWait = newLength * multiplier;
            const finalWait = newWait > 0 ? newWait : Math.floor(Math.random() * 10);
            
            return {
              ...business,
              queue_length: newLength,
              avg_wait: finalWait,
              heat_score: newLength * finalWait // Update heat score for visual density map
            };
          })
        );
        setLastUpdated(new Date());
      });
    }, 5000); // Poll every 5 seconds for simulated realtime

    return () => {
      clearInterval(updateInterval);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { businesses, lastUpdated };
}
