-- Migration: Add departments and staff_members schema
-- Description: Core tables and functions for multi-department business management.

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '🏢',
    is_active BOOLEAN DEFAULT true,
    "serviceMins" INTEGER DEFAULT 15,
    "opHours" TEXT,
    "max_capacity" INTEGER DEFAULT 100,
    "sort_order" INTEGER DEFAULT 0,
    "prefix" TEXT, -- e.g. "OPD", "LAB"
    "waiting_count" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- 2. Staff Members Table
CREATE TABLE IF NOT EXISTS public.staff_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    role TEXT DEFAULT 'operator', -- operator, viewer, owner
    name TEXT NOT NULL,
    phone TEXT,
    access_code TEXT UNIQUE, -- 6-character code
    pin TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    invited_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DO $$ 
BEGIN
  -- Departments
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read departments') THEN
    CREATE POLICY "Public read departments" ON public.departments FOR SELECT USING (true);
  END IF;
  
  -- Staff Members
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff members viewable by business owner') THEN
    CREATE POLICY "Staff members viewable by business owner" ON public.staff_members
      FOR SELECT TO authenticated USING (
        business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
      );
  END IF;
END $$;

-- 4. RPC: create_department
-- This handles creating both the department AND the associated queue record.
CREATE OR REPLACE FUNCTION public.create_department(
    p_business_id TEXT,
    p_name TEXT,
    p_description TEXT DEFAULT NULL,
    p_icon TEXT DEFAULT '🏢',
    p_service_mins INTEGER DEFAULT 15,
    p_op_hours TEXT DEFAULT NULL,
    p_max_capacity INTEGER DEFAULT 100
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_dept_id UUID;
BEGIN
    -- 1. Create department
    INSERT INTO public.departments (
        business_id, name, description, icon, "serviceMins", "opHours", "max_capacity"
    )
    VALUES (
        p_business_id, p_name, p_description, p_icon, p_service_mins, p_op_hours, p_max_capacity
    )
    RETURNING id INTO v_dept_id;

    -- 2. Create associated queue for today
    INSERT INTO public.queues (
        org_id, counter_id, session_date, department_id, is_active, max_capacity
    )
    VALUES (
        p_business_id, LOWER(REPLACE(p_name, ' ', '_')), CURRENT_DATE, v_dept_id, true, p_max_capacity
    )
    ON CONFLICT (org_id, counter_id, session_date) DO NOTHING;

    RETURN v_dept_id;
END;
$$;

-- 5. RPC: staff_login_by_code
CREATE OR REPLACE FUNCTION public.staff_login_by_code(p_code TEXT)
RETURNS TABLE (
    id UUID,
    business_id TEXT,
    business_name TEXT,
    department_id UUID,
    dept_name TEXT,
    staff_name TEXT,
    role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.business_id,
        b.name as business_name,
        s.department_id,
        d.name as dept_name,
        s.name as staff_name,
        s.role
    FROM public.staff_members s
    JOIN public.businesses b ON s.business_id = b.id
    LEFT JOIN public.departments d ON s.department_id = d.id
    WHERE s.access_code = UPPER(p_code)
      AND s.is_active = true;
END;
$$;
