-- BLOCK 1: Reviews table (post-service ratings)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID REFERENCES public.tokens(id),
  business_id TEXT REFERENCES public.businesses(id),
  user_id TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ON CONFLICT DO NOTHING; -- Ensure idempotency if re-run

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can create reviews') THEN
    CREATE POLICY "Anyone can create reviews" ON public.reviews FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can read reviews') THEN
    CREATE POLICY "Public can read reviews" ON public.reviews FOR SELECT USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_reviews_business ON public.reviews(business_id);

-- BLOCK 2: Subscriptions table (billing)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT REFERENCES public.businesses(id) UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free',
  razorpay_subscription_id TEXT,
  status TEXT DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owners view subscription') THEN
    CREATE POLICY "Owners view subscription" ON public.subscriptions
      FOR SELECT TO authenticated USING (
        business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
      );
  END IF;
END $$;

-- BLOCK 3: Fast Pass transactions
CREATE TABLE IF NOT EXISTS public.fastpass_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID REFERENCES public.tokens(id),
  business_id TEXT REFERENCES public.businesses(id),
  amount INTEGER NOT NULL,
  platform_fee INTEGER NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.fastpass_transactions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owners view transactions') THEN
    CREATE POLICY "Owners view transactions" ON public.fastpass_transactions
      FOR SELECT TO authenticated USING (
        business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
      );
  END IF;
END $$;

-- BLOCK 4: Staff members (multi-user per business)
CREATE TABLE IF NOT EXISTS public.staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT REFERENCES public.businesses(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT DEFAULT 'operator', -- 'owner' | 'operator' | 'viewer'
  name TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff view own record') THEN
    CREATE POLICY "Staff view own record" ON public.staff_members FOR SELECT TO authenticated USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owners manage staff') THEN
    CREATE POLICY "Owners manage staff" ON public.staff_members FOR ALL TO authenticated USING (
      business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    );
  END IF;
END $$;

-- BLOCK 5: Add plan column to businesses
ALTER TABLE public.businesses 
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- BLOCK 6: Auto-update avg_rating when review is added
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE businesses SET
    avg_rating = (SELECT AVG(rating) FROM reviews WHERE business_id = NEW.business_id),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE business_id = NEW.business_id)
  WHERE id = NEW.business_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_review_insert ON reviews;
CREATE TRIGGER after_review_insert
AFTER INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION update_business_rating();

-- BLOCK 7: Enable Realtime on all key tables
-- Note: In Supabase, you usually Manage this via the dashboard or specific SQL if replication is enabled.
-- This part is illustrative of the intent; usually done via "Enable Realtime" in dashboard.
ALTER PUBLICATION supabase_realtime ADD TABLE public.tokens;
ALTER PUBLICATION supabase_realtime ADD TABLE public.queues;
