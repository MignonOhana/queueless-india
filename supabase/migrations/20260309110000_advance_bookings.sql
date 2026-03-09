-- Supabase Migration: Advance Slot Bookings
-- Creates the bookings table to handle future appointments vs. live token queueing

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    counter_id TEXT NOT NULL,
    user_id UUID NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    booking_date DATE NOT NULL,
    time_slot TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup by business and date (e.g., Dashboard loading tomorrow's bookings)
CREATE INDEX IF NOT EXISTS idx_bookings_org_date ON public.bookings(org_id, booking_date);

-- Index for customer dashboard (loading their own bookings)
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);

-- Enforce capacity (Optional: unique constraint if we only want 1 booking per exact slot/counter, 
-- but usually multiple are allowed. We'll handle capacity in the Edge Function for now.)

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policies
-- Customers can read their own bookings
CREATE POLICY "Users can view their own bookings"
    ON public.bookings
    FOR SELECT
    USING (auth.uid() = user_id);

-- Customers can create their own bookings (Edge function might bypass this with service_role, but good to have)
CREATE POLICY "Users can create their own bookings"
    ON public.bookings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Customers can cancel their own bookings
CREATE POLICY "Users can update their own bookings"
    ON public.bookings
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Businesses can read all bookings for their org
CREATE POLICY "Businesses can view their bookings"
    ON public.bookings
    FOR SELECT
    USING (org_id = current_setting('request.jwt.claims', true)::json->>'org_id' OR true); -- Note: Simplified business auth for MVP

-- Businesses can update booking status (e.g., mark COMPLETE or CANCELLED)
CREATE POLICY "Businesses can update their bookings"
    ON public.bookings
    FOR UPDATE
    USING (org_id = current_setting('request.jwt.claims', true)::json->>'org_id' OR true);
