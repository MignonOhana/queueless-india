-- Migration: Add missing columns to businesses and staff RPCs
-- Description: Finalizing schema for onboarding and staff management.

-- 1. Alter businesses table
ALTER TABLE public.businesses 
  ADD COLUMN IF NOT EXISTS claim_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_accepting_tokens BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS op_hours_json JSONB,
  ADD COLUMN IF NOT EXISTS settings JSONB,
  ADD COLUMN IF NOT EXISTS avg_service_time INTEGER DEFAULT 15;

-- 2. RPC: generate_staff_access_code
CREATE OR REPLACE FUNCTION public.generate_staff_access_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_code TEXT;
    v_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate a 6-character random alphanumeric code
        v_code := UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', '') FROM 1 FOR 6));
        
        -- Check if exists in staff_members
        SELECT EXISTS(SELECT 1 FROM public.staff_members WHERE access_code = v_code) INTO v_exists;
        
        EXIT WHEN NOT v_exists;
    END LOOP;
    
    RETURN v_code;
END;
$$;

-- 3. RPC: add_staff_member
CREATE OR REPLACE FUNCTION public.add_staff_member(
    p_business_id TEXT,
    p_department_id UUID,
    p_name TEXT,
    p_phone TEXT DEFAULT NULL,
    p_role TEXT DEFAULT 'operator'
)
RETURNS SETOF public.staff_members
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_code TEXT;
BEGIN
    -- 1. Generate unique access code
    v_code := public.generate_staff_access_code();

    -- 2. Insert staff member
    RETURN QUERY
    INSERT INTO public.staff_members (
        business_id, department_id, name, phone, role, access_code, is_active
    )
    VALUES (
        p_business_id, p_department_id, p_name, p_phone, p_role, v_code, true
    )
    RETURNING *;
END;
$$;
