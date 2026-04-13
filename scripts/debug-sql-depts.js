require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("🔍 Checking Departments Columns...");
  const { data: depts, error: deptErr } = await supabase.from('departments').select('*').limit(1);
  if (deptErr) console.error("❌ Dept Select Error:", deptErr);
  else if (depts && depts.length > 0) console.log("Keys in first department row:", Object.keys(depts[0]));
  else console.log("No departments found.");
}

check();
