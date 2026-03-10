-- Migration: Add Fast Pass Logs Table
-- Created: 2026-03-10

CREATE TABLE IF NOT EXISTS public.fastpass_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT REFERENCES public.businesses(id),
  token_id UUID,
  amount NUMERIC NOT NULL,
  payment_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.fastpass_logs ENABLE ROW LEVEL SECURITY;

-- Owners can view their own fastpass revenue
CREATE POLICY "Owners view their fastpass logs" ON public.fastpass_logs
  FOR SELECT TO authenticated USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );
