-- Migration to optimize the queue schema for QueueLess India

-- 1. Create the `queues` table to track aggregate state
CREATE TABLE IF NOT EXISTS public.queues (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    org_id TEXT NOT NULL,
    counter_id TEXT NOT NULL, -- e.g. "opd"
    session_date DATE NOT NULL DEFAULT CURRENT_DATE, -- e.g. '2026-03-08'
    last_issued_number INT DEFAULT 0, -- Atomic counter for tokens
    currently_serving_token_id UUID, -- Pointer to active token
    total_waiting INT DEFAULT 0, -- Kept in sync via triggers or edge functions
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique constraint: Only one active queue per org/counter/date
ALTER TABLE public.queues 
ADD CONSTRAINT unique_active_queue 
UNIQUE (org_id, counter_id, session_date);

-- 2. Modify existing `tokens` (assuming it exists, otherwise define it)
-- Since the current Codebase relies on `tokens` we will add a `queue_id` reference
ALTER TABLE public.tokens 
ADD COLUMN IF NOT EXISTS queue_id UUID REFERENCES public.queues(id) ON DELETE CASCADE;

-- 3. Atomic RPC to increment and fetch the next token number
CREATE OR REPLACE FUNCTION increment_queue_counter(p_queue_id UUID)
RETURNS INT
LANGUAGE plpgsql
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

-- 4. RPC to decrement total waiting (e.g. when someone skips or cancels)
CREATE OR REPLACE FUNCTION decrement_queue_waiting(p_queue_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.queues
    SET total_waiting = GREATEST(0, total_waiting - 1),
        updated_at = NOW()
    WHERE id = p_queue_id;
END;
$$;

-- 5. RPC to serve next token (decrements waiting, sets active token pointer)
CREATE OR REPLACE FUNCTION serve_next_queue_token(p_queue_id UUID, p_token_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.queues
    SET total_waiting = GREATEST(0, total_waiting - 1),
        currently_serving_token_id = p_token_id,
        updated_at = NOW()
    WHERE id = p_queue_id;
END;
$$;

-- 6. Enable Realtime on the queues table
ALTER PUBLICATION supabase_realtime ADD TABLE public.queues;
