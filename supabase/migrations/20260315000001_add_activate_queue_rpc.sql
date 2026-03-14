-- Migration: Add activate_queue_for_today RPC
-- Created: 2026-03-15

CREATE OR REPLACE FUNCTION activate_queue_for_today(p_org_id TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_queue_id UUID;
BEGIN
    -- 1. Check if a queue already exists for this org today
    SELECT id INTO v_queue_id
    FROM public.queues
    WHERE org_id = p_org_id 
      AND session_date = CURRENT_DATE;

    IF v_queue_id IS NOT NULL THEN
        -- 2. If exists, ensure it's active and accepting tokens
        UPDATE public.queues
        SET is_active = true,
            is_accepting_tokens = true,
            updated_at = NOW()
        WHERE id = v_queue_id;
    ELSE
        -- 3. If not, create a new one
        -- Note: We assume counter_id is 'default' or similar if not specified, 
        -- but the businesses table might have a preferred prefix.
        -- For now, we'll use 'main' as default or look it up.
        INSERT INTO public.queues (org_id, counter_id, session_date, is_active, is_accepting_tokens)
        VALUES (p_org_id, 'main', CURRENT_DATE, true, true)
        RETURNING id INTO v_queue_id;
    END IF;

    -- 4. Mark the business as active in the businesses table
    UPDATE public.businesses
    SET claim_status = 'active'
    WHERE id = p_org_id;

    RETURN v_queue_id;
END;
$$;
