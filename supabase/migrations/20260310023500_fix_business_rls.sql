-- Migration: Fix RLS for Business Registration
-- Description: Allow authenticated users to insert their own business records.

-- Allow authenticated users to create a business record
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create their own business' AND tablename = 'businesses') THEN
    CREATE POLICY "Users can create their own business" ON public.businesses
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = owner_id);
  END IF;
END $$;

-- Ensure businesses can also delete their own record if needed
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Businesses can delete their own row' AND tablename = 'businesses') THEN
    CREATE POLICY "Businesses can delete their own row" ON public.businesses
      FOR DELETE TO authenticated
      USING (owner_id = auth.uid());
  END IF;
END $$;
