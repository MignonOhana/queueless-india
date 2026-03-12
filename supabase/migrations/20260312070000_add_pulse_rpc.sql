-- Migration: Add Live Pulse RPC
-- Created: 2026-03-12

CREATE OR REPLACE FUNCTION get_live_pulse_data()
RETURNS TABLE (
  type TEXT,
  org_id TEXT,
  name TEXT,
  category TEXT,
  count BIGINT,
  label TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Try to get tokens joined in the last 30 minutes
    RETURN QUERY
    WITH recent_activity AS (
        SELECT 
            t."orgId", 
            b.name as b_name, 
            b.category as b_category, 
            COUNT(*) as joined_count
        FROM public.tokens t
        JOIN public.businesses b ON b.id = t."orgId"  
        WHERE t."createdAt" > NOW() - INTERVAL '30 minutes'
        GROUP BY t."orgId", b.name, b.category
        ORDER BY joined_count DESC
        LIMIT 8
    )
    SELECT 
        'LIVE'::TEXT as type,
        "orgId" as org_id,
        b_name as name,
        b_category as category,
        joined_count as count,
        CASE 
            WHEN joined_count > 1 THEN joined_count || ' people joined in the last 30 mins'
            ELSE 'Someone just joined the queue'
        END as label
    FROM recent_activity;

    -- 2. Fallback: If no recent activity, get yesterday's peak hub activity
    IF NOT FOUND THEN
        RETURN QUERY
        WITH peak_activity AS (
            SELECT 
                ds.business_id,
                b.name as b_name,
                b.category as b_category,
                ds.total_tokens_issued as token_count
            FROM public.daily_stats ds
            JOIN public.businesses b ON b.id = ds.business_id
            WHERE ds.stat_date = (CURRENT_DATE - INTERVAL '1 day')::DATE
            ORDER BY ds.total_tokens_issued DESC
            LIMIT 5
        )
        SELECT 
            'FALLBACK'::TEXT as type,
            business_id as org_id,
            b_name as name,
            b_category as category,
            token_count::BIGINT as count,
            'Yesterday''s peak activity'::TEXT as label
        FROM peak_activity;
    END IF;

    -- 3. Last Resort: Generic high volume stores if no stats yet
    IF NOT FOUND THEN
       RETURN QUERY
       SELECT 
          'STATIC'::TEXT as type,
          id as org_id,
          name,
          category,
          10::BIGINT as count,
          'Steady activity reported'::TEXT as label
       FROM public.businesses
       WHERE total_reviews > 5
       LIMIT 3;
    END IF;
END;
$$;
