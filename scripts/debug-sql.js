require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("🔍 Checking Businesses Columns...");
  const { data, error } = await supabase.rpc('get_business_with_departments', { p_business_id: 'aiims-delhi' });
  if (error) {
    console.error("❌ RPC Error:", error);
    // If RPC fails, try generic select
    const { data: cols, error: colErr } = await supabase.from('businesses').select('*').limit(1);
    if (colErr) console.error("❌ Select Error:", colErr);
    else console.log("Keys in first business row:", Object.keys(cols[0]));
  } else {
    console.log("✅ RPC worked unexpectedly?");
  }
}

check();
