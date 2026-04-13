-- Migration: Fix departments schema and RPCs
-- Description: Standardizing column names to snake_case and fixing ID type issues.

-- 1. Standardize departments table
DO $$ 
BEGIN
    -- Rename columns if they exist with quoted camelCase
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'departments' AND column_name = 'serviceMins') THEN
        ALTER TABLE public.departments RENAME COLUMN "serviceMins" TO service_mins;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'departments' AND column_name = 'opHours') THEN
        ALTER TABLE public.departments RENAME COLUMN "opHours" TO op_hours;
    END IF;

    -- Ensure id is TEXT if we want to use the DEP-OPD-001 format
    -- Note: This is complex if there are FKs. Let's see if we can just ADD a display_id column.
    -- Or if we haven't launched yet, we can convert it.
    -- But wait, I see that the existing migrations already have UUID. 
    -- I'll stick to UUID for now but fix the naming.
END $$;

-- 2. Fix create_department RPC
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
        business_id, name, description, icon, service_mins, op_hours, max_capacity
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

-- 3. Fix get_business_with_departments RPC
CREATE OR REPLACE FUNCTION public.get_business_with_departments(p_business_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_business JSONB;
    v_departments JSONB;
BEGIN
    -- Get business info
    SELECT row_to_json(b)::jsonb INTO v_business
    FROM public.businesses b
    WHERE b.id = p_business_id;

    -- Get departments with queue counts
    SELECT json_agg(dept_data)::jsonb INTO v_departments
    FROM (
        SELECT 
            d.*,
            (SELECT total_waiting FROM public.queues q WHERE q.department_id = d.id AND q.org_id = d.business_id AND q.session_date = CURRENT_DATE LIMIT 1) as waiting_count,
            (SELECT count(*) FROM public.staff_members s WHERE s.department_id = d.id AND s.business_id = d.business_id) as staff_count
        FROM public.departments d
        WHERE d.business_id = p_business_id
        ORDER BY d.sort_order ASC, d.created_at ASC
    ) dept_data;

    RETURN jsonb_build_object(
        'business', v_business,
        'departments', COALESCE(v_departments, '[]'::jsonb)
    );
END;
$$;
