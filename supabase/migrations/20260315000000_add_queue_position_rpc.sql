-- RPC to get the current position of a token in the waiting queue
-- Position = count of WAITING tokens in the same queue created before this one + 1
CREATE OR REPLACE FUNCTION get_queue_position(p_token_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_queue_id UUID;
    v_created_at TIMESTAMP WITH TIME ZONE;
    v_pos INT;
BEGIN
    -- Get queue_id and createdAt for the target token
    -- Note: Handle both WAITING and SERVING status. 
    -- If SERVING, position should be 0 or 1 depending on UI needs.
    -- Here we return 1 for SERVING and 1 for first WAITING.
    
    SELECT queue_id, "createdAt" INTO v_queue_id, v_created_at
    FROM public.tokens
    WHERE id = p_token_id;

    IF v_queue_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Count tokens ahead in the same queue that are WAITING
    SELECT COUNT(*) INTO v_pos
    FROM public.tokens
    WHERE queue_id = v_queue_id
      AND status = 'WAITING'
      AND "createdAt" < v_created_at;

    RETURN v_pos + 1;
END;
$$;
