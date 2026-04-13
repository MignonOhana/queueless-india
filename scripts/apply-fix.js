require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function apply() {
  const sqlFile = path.join(__dirname, '../supabase/migrations/20260410000000_fix_departments_schema.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');
  
  console.log("🚀 Applying Schema Fix...");
  // Note: We cannot run raw multi-statement SQL easily via the client without an RPC that executes SQL.
  // But we can try to run it as a set of separate commands if we parse it, 
  // OR we just hope that the RPCs can be updated via the client if there's an 'exec_sql' RPC.
  // Many Supabase setups have an 'exec_sql' RPC for migrations.
  
  const { error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    if (error.message.includes('function "exec_sql" does not exist')) {
        console.error("❌ 'exec_sql' RPC not found. I will try to run commands individually.");
        // Try to update RPCs at least
        console.log("Attempting to update get_business_with_departments RPC only...");
        const updateRpcSql = `
CREATE OR REPLACE FUNCTION public.get_business_with_departments(p_business_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_business JSONB;
    v_departments JSONB;
BEGIN
    SELECT row_to_json(b)::jsonb INTO v_business FROM public.businesses b WHERE b.id = p_business_id;
    SELECT json_agg(dept_data)::jsonb INTO v_departments
    FROM (
        SELECT d.*,
            (SELECT total_waiting FROM public.queues q WHERE q.department_id = d.id AND q.org_id = d.business_id AND q.session_date = CURRENT_DATE LIMIT 1) as waiting_count,
            (SELECT count(*) FROM public.staff_members s WHERE s.department_id = d.id AND s.business_id = d.business_id) as staff_count
        FROM public.departments d
        WHERE d.business_id = p_business_id
        ORDER BY d.created_at ASC
    ) dept_data;
    RETURN jsonb_build_object('business', v_business, 'departments', COALESCE(v_departments, '[]'::jsonb));
END;
$$;`;
        const { error: rpcErr } = await supabase.rpc('exec_sql', { sql: updateRpcSql });
        if (rpcErr) console.error("❌ Still failed:", rpcErr.message);
    } else {
        console.error("❌ Error:", error.message);
    }
  } else {
    console.log("✅ Fix applied successfully!");
  }
}

apply();
