-- Migration: Add OTP Rate Limiting RPC
-- Description: Prevents brute force attacks on OTP verification by tracking attempts per email.

CREATE TABLE IF NOT EXISTS public.otp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    attempted_at TIMESTAMPTZ DEFAULT now(),
    is_success BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_otp_logs_email_at ON public.otp_logs (email, attempted_at DESC);

-- Function: check_otp_rate_limit
-- Returns true if allowed, false if ratelimited
CREATE OR REPLACE FUNCTION public.check_otp_rate_limit(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Allow max 5 attempts per 10 minutes
    SELECT count(*)
    INTO v_count
    FROM public.otp_logs
    WHERE email = p_email
    AND attempted_at > now() - interval '10 minutes';

    IF v_count >= 5 THEN
        RETURN FALSE;
    END IF;

    -- Log the attempt (successful or not will be updated by the caller if needed)
    INSERT INTO public.otp_logs (email) VALUES (p_email);
    
    RETURN TRUE;
END;
$$;
