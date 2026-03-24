-- Migration: Harden FastPass & Analytics Functions
-- 1. Add payment_id to tokens table for tracking
ALTER TABLE public.tokens ADD COLUMN IF NOT EXISTS "paymentId" TEXT;

-- 2. Enhance create_queue_token RPC with missing fields
-- First, drop the old one to change the signature
DROP FUNCTION IF EXISTS public.create_queue_token(TEXT, UUID, TEXT, TEXT, TEXT, INT);

CREATE OR REPLACE FUNCTION public.create_queue_token(
  p_org_id      TEXT,
  p_user_id     UUID,
  p_customer_name   TEXT,
  p_customer_phone  TEXT,
  p_token_number    TEXT,
  p_estimated_wait_mins INT,
  p_department_id   UUID DEFAULT NULL,
  p_is_priority     BOOLEAN DEFAULT FALSE,
  p_payment_id      TEXT DEFAULT NULL
)
RETURNS SETOF tokens
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO tokens (
    "orgId",
    "userId",
    "customerName",
    "customerPhone",
    "tokenNumber",
    status,
    "estimatedWaitMins",
    "department_id",
    "isPriority",
    "paymentId"
  )
  VALUES (
    p_org_id,
    p_user_id,
    p_customer_name,
    p_customer_phone,
    p_token_number,
    'WAITING',
    p_estimated_wait_mins,
    p_department_id,
    p_is_priority,
    p_payment_id
  )
  RETURNING *;
END;
$$;

-- Grant access to the new function
GRANT EXECUTE ON FUNCTION public.create_queue_token(TEXT, UUID, TEXT, TEXT, TEXT, INT, UUID, BOOLEAN, TEXT) TO anon, authenticated;

-- 3. Correct RPC parameter names for Analytics to match frontend
-- Hourly Distribution
CREATE OR REPLACE FUNCTION get_hourly_distribution(p_org_id TEXT, p_date DATE)
RETURNS TABLE (hour_val INT, token_count INT) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(HOUR FROM "createdAt")::INT as hour_val,
    COUNT(*)::INT as token_count
  FROM public.tokens
  WHERE "orgId" = p_org_id
    AND "createdAt"::DATE = p_date
  GROUP BY hour_val
  ORDER BY hour_val;
END;
$$;

-- Wait Time Trend
CREATE OR REPLACE FUNCTION get_wait_time_trend(p_org_id TEXT, p_days INT)
RETURNS TABLE (date_val DATE, avg_wait INT) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    "createdAt"::DATE as date_val,
    AVG(EXTRACT(EPOCH FROM ("servedAt" - "createdAt")) / 60)::INT as avg_wait
  FROM public.tokens
  WHERE "orgId" = p_org_id
    AND status = 'SERVED'
    AND "createdAt" >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY date_val
  ORDER BY date_val;
END;
$$;
