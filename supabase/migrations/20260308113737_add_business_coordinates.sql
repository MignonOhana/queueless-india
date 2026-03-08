-- Phase 33: Add Business Coordinates for Google Maps Integration

-- 1. Add latitude and longitude to the businesses table
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- 2. Add an index for spatial queries (useful for future query performance)
CREATE INDEX IF NOT EXISTS idx_businesses_location ON public.businesses(latitude, longitude);

-- 3. Populate existing dummy data with coordinates near Delhi/Mumbai for testing
UPDATE public.businesses 
SET latitude = 28.6139 + (random() * 0.1 - 0.05),
    longitude = 77.2090 + (random() * 0.1 - 0.05)
WHERE latitude IS NULL AND category != 'hospital';

-- Set Hospitals to Mumbai (for previous dummy data coverage)
UPDATE public.businesses 
SET latitude = 19.0760 + (random() * 0.1 - 0.05),
    longitude = 72.8777 + (random() * 0.1 - 0.05)
WHERE latitude IS NULL AND category = 'hospital';
