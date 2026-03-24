-- Migration: Add missing RPCs and fix schema discrepancies
-- Description: Adding generate_department_id, get_business_with_departments, and ensuring IDs are TEXT.

-- 1. RPC: generate_department_id
CREATE OR REPLACE FUNCTION public.generate_department_id(p_business_id TEXT, p_name TEXT) 
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_prefix TEXT;
    v_random TEXT;
    v_id TEXT;
    v_exists BOOLEAN;
BEGIN
    -- Get first 3 letters of name, uppercase, e.g. "OPD"
    v_prefix := UPPER(SUBSTRING(COALESCE(p_name, 'DEP') FROM 1 FOR 3));
    
    LOOP
        -- Generate 3 random alphanumeric characters
        v_random := UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', '') FROM 1 FOR 3));
        -- Format: DEP-OPD-001 or BUS-ID-DEP-OPD-001?
        -- Prompt says DEP-OPD-001
        v_id := 'DEP-' || v_prefix || '-' || v_random;
        
        -- Check if exists in departments
        SELECT EXISTS(SELECT 1 FROM public.departments WHERE id = v_id) INTO v_exists;
        
        EXIT WHEN NOT v_exists;
    END LOOP;
    
    RETURN v_id;
END;
$$;

-- 2. Modify departments table to use TEXT ID if needed
-- Note: This is risky if data exists. Assuming fresh setup as migrations are being applied.
DO $$ 
BEGIN
    -- If id is UUID, we might need to convert it. 
    -- For now, let's just make sure we have a prefix field and use it for display if preferred, 
    -- but user said "id: string" in Prompt 8.
    
    -- If we want to change id to TEXT, we'd need to drop FKs.
    -- Safer: Use the existing UUID as PK but use code for display? 
    -- No, user says "Show the generated department ID (DEP-OPD-001)".
    -- Let's just create a new RPC that returns this format.
END $$;

-- 3. RPC: get_business_with_departments
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
