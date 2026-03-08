-- Phase 30: Supabase Row Level Security (RLS) Policies

-- 1. Enable RLS on all tables
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counters ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'predictions') THEN
        ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Track business ownership for RLS resolution
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- --------------------------------------------------------
-- ANONYMOUS / PUBLIC POLICIES
-- --------------------------------------------------------
-- Anonymous users can read public queue discovery data
CREATE POLICY "Public read access for businesses" ON public.businesses FOR SELECT USING (true);
CREATE POLICY "Public read access for queues" ON public.queues FOR SELECT USING (true);
CREATE POLICY "Public read access for counters" ON public.counters FOR SELECT USING (true);

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'predictions') THEN
        CREATE POLICY "Public read access for predictions" ON public.predictions FOR SELECT USING (true);
    END IF;
END $$;


-- --------------------------------------------------------
-- CUSTOMER POLICIES
-- --------------------------------------------------------
-- Customers can create tokens when joining a queue
CREATE POLICY "Customers can create their own tokens" ON public.tokens
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = "userId");

-- Customers can read their own token status
CREATE POLICY "Customers can read their own tokens" ON public.tokens
  FOR SELECT TO authenticated
  USING (auth.uid()::text = "userId");


-- --------------------------------------------------------
-- BUSINESS POLICIES
-- --------------------------------------------------------
-- Businesses can update their own row (business listing)
CREATE POLICY "Businesses can update their own row" ON public.businesses
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());

-- Businesses can manage queues belonging to their business
CREATE POLICY "Businesses manage their queues" ON public.queues
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = queues.org_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- Businesses can call next token / edit tokens for their queue
CREATE POLICY "Businesses manage their tokens" ON public.tokens
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = tokens."orgId"
      AND businesses.owner_id = auth.uid()
    )
  );

-- Businesses can configure their counters
CREATE POLICY "Businesses manage their counters" ON public.counters
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = counters."orgId"
      AND businesses.owner_id = auth.uid()
    )
  );


-- --------------------------------------------------------
-- CONSTRAINTS & ATOMICITY
-- --------------------------------------------------------
-- A user cannot hold multiple active tokens in the same queue
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_token_per_user 
ON public.tokens ("userId", queue_id) 
WHERE status IN ('WAITING', 'SERVING');

-- Ensure token generation remains atomic through existing Postgres RPC
-- Adding SECURITY DEFINER allows the RPC to run with elevated privileges
-- so a Customer can increment the counter without needing direct UPDATE access on queues table
CREATE OR REPLACE FUNCTION increment_queue_counter(p_queue_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    next_num INT;
BEGIN
    UPDATE public.queues
    SET last_issued_number = last_issued_number + 1,
        total_waiting = total_waiting + 1,
        updated_at = NOW()
    WHERE id = p_queue_id
    RETURNING last_issued_number INTO next_num;

    RETURN next_num;
END;
$$;
