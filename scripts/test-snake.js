require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("🔍 Checking Departments Table Schema...");
  const { error: err1 } = await supabase.from('departments').select('service_mins').limit(1);
  console.log("Check service_mins:", err1 ? "FAIL" : "OK", err1?.message);

  const { error: err2 } = await supabase.from('departments').select('servicemins').limit(1);
  console.log("Check servicemins:", err2 ? "FAIL" : "OK", err2?.message);

  const { error: err3 } = await supabase.from('departments').select('id').limit(1);
  console.log("Check id:", err3 ? "FAIL" : "OK", err3?.message);
}

check();
