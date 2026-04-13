require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("🔍 Checking Businesses...");
  const { data, error } = await supabase.from('businesses').select('id, name').limit(10);
  if (error) console.error(error);
  else console.log(data);

  console.log("\n🔍 Checking Departments...");
  const { data: depts, error: deptErr } = await supabase.from('departments').select('id, business_id, name').limit(10);
  if (deptErr) console.error(deptErr);
  else console.log(depts);
}

check();
