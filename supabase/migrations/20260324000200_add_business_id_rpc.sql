-- Migration: Add generate_business_id RPC
-- Description: Generates a unique, readable business ID based on location prefix.

CREATE OR REPLACE FUNCTION public.generate_business_id(p_location TEXT)
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
    -- Get first 3 letters of location, uppercase
    v_prefix := UPPER(SUBSTRING(COALESCE(p_location, 'QL') FROM 1 FOR 3));
    
    LOOP
        -- Generate 4 random alphanumeric characters
        v_random := UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', '') FROM 1 FOR 4));
        v_id := v_prefix || '-' || v_random;
        
        -- Check if exists
        SELECT EXISTS(SELECT 1 FROM public.businesses WHERE id = v_id) INTO v_exists;
        
        EXIT WHEN NOT v_exists;
    END LOOP;
    
    RETURN v_id;
END;
$$;
