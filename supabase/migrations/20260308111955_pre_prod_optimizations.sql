-- Phase 32: Pre-Production Optimizations (Indexes & Limits)

-- 1. Performance Indexes for high-traffic queries
CREATE INDEX IF NOT EXISTS idx_tokens_queue_id ON public.tokens(queue_id);
CREATE INDEX IF NOT EXISTS idx_tokens_status ON public.tokens(status);
CREATE INDEX IF NOT EXISTS idx_queues_org_id ON public.queues(org_id);
CREATE INDEX IF NOT EXISTS idx_tokens_org_id ON public.tokens("orgId");
CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON public.tokens("userId");

-- 2. Queue Capacity Limits
ALTER TABLE public.queues ADD COLUMN IF NOT EXISTS max_capacity INT DEFAULT 50;
ALTER TABLE public.queues ADD COLUMN IF NOT EXISTS is_accepting_tokens BOOLEAN DEFAULT true;

-- 3. Enforce limits directly in the Postgres RPC to guarantee atomicity and prevent race conditions
CREATE OR REPLACE FUNCTION increment_queue_counter(p_queue_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    next_num INT;
    v_total_waiting INT;
    v_max_capacity INT;
    v_is_accepting BOOLEAN;
BEGIN
    -- Read current queue state and lock the row for update
    SELECT total_waiting, max_capacity, is_accepting_tokens
    INTO v_total_waiting, v_max_capacity, v_is_accepting
    FROM public.queues
    WHERE id = p_queue_id
    FOR UPDATE;

    -- Pre-checks for limits
    IF NOT v_is_accepting THEN
        RAISE EXCEPTION 'This queue is currently not accepting new customers.';
    END IF;

    IF v_total_waiting >= v_max_capacity THEN
        RAISE EXCEPTION 'Queue is full. Capacity reached.';
    END IF;

    -- Determine new number and update
    UPDATE public.queues
    SET last_issued_number = last_issued_number + 1,
        total_waiting = total_waiting + 1,
        updated_at = NOW()
    WHERE id = p_queue_id
    RETURNING last_issued_number INTO next_num;

    RETURN next_num;
END;
$$;
