require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("🔍 Checking Departments Table Schema...");
  const { data, error } = await supabase.rpc('get_business_with_departments', { p_business_id: 'aiims-delhi' });
  // If RPC fails, let's look at the actual columns
  const { data: cols, error: colErr } = await supabase.rpc('inspect_table_columns', { p_table_name: 'departments' });
  // Wait, I don't have inspect_table_columns RPC.
  // I'll try to use a raw query if possible, but I can't.
  
  // Try to select ONE column that I know exists
  const { data: testId, error: errId } = await supabase.from('departments').select('id').limit(1);
  console.log("Check ID:", errId ? "FAIL" : "OK");
  
  // Try to select serviceMins
  const { error: err1 } = await supabase.from('departments').select('serviceMins').limit(1);
  console.log("Check serviceMins (unquoted):", err1 ? "FAIL" : "OK", err1?.message);

  // Try to select "serviceMins"
  const { error: err2 } = await supabase.from('departments').select('"serviceMins"').limit(1);
  console.log('Check "serviceMins" (quoted):', err2 ? "FAIL" : "OK", err2?.message);
}

check();
