/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula.
 *
 * @param lat1 Latitude of point 1 in decimal degrees
 * @param lon1 Longitude of point 1 in decimal degrees
 * @param lat2 Latitude of point 2 in decimal degrees
 * @param lon2 Longitude of point 2 in decimal degrees
 * @returns The distance in kilometers
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  
  // Convert decimal degrees to radians
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const rLat1 = toRad(lat1);
  const rLat2 = toRad(lat2);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(rLat1) * Math.cos(rLat2); 
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const distance = R * c;
  
  // Format to 1 decimal place (e.g. 2.4 km)
  return Math.round(distance * 10) / 10;
}

/**
 * Calculates estimated travel time in minutes assuming average Indian city traffic.
 * Uses a heuristic of ~15 km/h average city speed, scaling up slightly for longer distances.
 * 
 * @param distanceInKm The distance in kilometers
 * @returns Estimated travel time in minutes
 */
export function estimateTravelTime(distanceInKm: number): number {
  if (distanceInKm < 0.5) return 5; // Walking distance baseline
  if (distanceInKm < 2) return Math.round(distanceInKm * 10); // Very local traffic (e.g. e-rickshaw)
  
  // Average city traffic (~15-20 km/h) = ~3 to 4 mins per km + base connection time
  return Math.round(5 + (distanceInKm * 3.5));
}

function toRad(value: number): number {
  return value * Math.PI / 180;
}
