-- Migration: Add Subscriptions Table for Razorpay
-- Created: 2026-03-09

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT REFERENCES public.businesses(id),
  plan TEXT NOT NULL DEFAULT 'free', -- 'free' | 'growth' | 'enterprise'
  razorpay_subscription_id TEXT,
  razorpay_customer_id TEXT,
  status TEXT DEFAULT 'active', -- 'active' | 'cancelled' | 'past_due'
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Owners view their subscription
CREATE POLICY "Owners view their subscription" ON public.subscriptions
  FOR SELECT TO authenticated USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- Add plan column to businesses if it doesn't exist
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';
