-- 1. Hourly Distribution Analysis
CREATE OR REPLACE FUNCTION get_hourly_distribution(org_id_param TEXT, date_param DATE)
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
  WHERE "orgId" = org_id_param
    AND "createdAt"::DATE = date_param
  GROUP BY hour_val
  ORDER BY hour_val;
END;
$$;

-- 2. Daily Stats (Last N Days)
CREATE OR REPLACE FUNCTION get_daily_stats(org_id_param TEXT, days_param INT)
RETURNS TABLE (
  day_label DATE, 
  total_served INT, 
  avg_wait_mins INT,
  fastpass_rev INT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t."createdAt"::DATE as day_label,
    COUNT(*)::INT FILTER (WHERE t.status = 'SERVED') as total_served,
    AVG(EXTRACT(EPOCH FROM (t."servedAt" - t."createdAt")) / 60)::INT as avg_wait_mins,
    COALESCE(SUM(fl.amount), 0)::INT as fastpass_rev
  FROM public.tokens t
  LEFT JOIN public.fastpass_logs fl ON t.id = fl.token_id
  WHERE t."orgId" = org_id_param
    AND t."createdAt" >= NOW() - (days_param || ' days')::INTERVAL
  GROUP BY day_label
  ORDER BY day_label DESC;
END;
$$;

-- 3. Wait Time Trend
CREATE OR REPLACE FUNCTION get_wait_time_trend(org_id_param TEXT, days_param INT)
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
  WHERE "orgId" = org_id_param
    AND status = 'SERVED'
    AND "createdAt" >= NOW() - (days_param || ' days')::INTERVAL
  GROUP BY date_val
  ORDER BY date_val;
END;
$$;
