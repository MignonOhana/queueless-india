-- Migration: Add user_profiles table and profile helpers
-- Description: Core table for user metadata and role management.

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    email TEXT,
    role TEXT DEFAULT 'customer',
    avatar_url TEXT,
    is_business_owner BOOLEAN DEFAULT false,
    primary_business_id TEXT, -- References businesses(id)
    onboarding_completed_at TIMESTAMPTZ,
    profile_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Additional fields from types
    visit_count INTEGER DEFAULT 0,
    city TEXT,
    preferred_language TEXT DEFAULT 'en',
    notification_preference TEXT DEFAULT 'all',
    date_of_birth DATE,
    gender TEXT,
    pincode TEXT,
    state TEXT,
    bio TEXT,
    aadhaar_last4 TEXT,
    pan_last4 TEXT,
    kyc_status TEXT DEFAULT 'pending',
    kyc_submitted_at TIMESTAMPTZ,
    kyc_verified_at TIMESTAMPTZ
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own profile') THEN
    CREATE POLICY "Users can view their own profile" ON public.user_profiles
      FOR SELECT TO authenticated USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own profile') THEN
    CREATE POLICY "Users can update their own profile" ON public.user_profiles
      FOR UPDATE TO authenticated USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role can manage all profiles') THEN
    CREATE POLICY "Service role can manage all profiles" ON public.user_profiles
      FOR ALL TO service_role USING (true);
  END IF;
END $$;

-- RPC: get_my_profile
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS SETOF public.user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.user_profiles
    WHERE id = auth.uid();
END;
$$;
