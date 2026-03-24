-- Migration: Add SECURITY DEFINER RPC for trusted server-side token insertions
-- This solves the RLS issue where guest/anon users cannot directly insert into tokens
-- because the INSERT policy `WITH CHECK (auth.uid()::text = "userId")` fails when userId is NULL.
--
-- The API route (which is a trusted server-side context) will call this RPC
-- via the service role client, ensuring the insert always succeeds while keeping RLS
-- ON for all direct table access.

CREATE OR REPLACE FUNCTION public.create_queue_token(
  p_org_id      TEXT,
  p_user_id     UUID,          -- NULL for guest users
  p_customer_name   TEXT,
  p_customer_phone  TEXT,
  p_token_number    TEXT,
  p_estimated_wait_mins INT,
  p_department_id   UUID DEFAULT NULL
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
    department_id
  )
  VALUES (
    p_org_id,
    p_user_id,
    p_customer_name,
    p_customer_phone,
    p_token_number,
    'WAITING',
    p_estimated_wait_mins,
    p_department_id
  )
  RETURNING *;
END;
$$;

-- Allow anyone to call the function (the API route is the trusted gatekeeper)
GRANT EXECUTE ON FUNCTION public.create_queue_token(TEXT, UUID, TEXT, TEXT, TEXT, INT, UUID) TO anon, authenticated;

