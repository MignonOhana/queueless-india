require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function check() {
  console.log("🔍 Final Server-Side Verification...");
  
  // 1. Check Business
  const { data: biz, error: bizErr } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', 'aiims-delhi')
    .maybeSingle();
    
  if (bizErr) console.log("Business Error:", bizErr.message);
  else if (biz) console.log("✅ Business Found:", biz.name);
  else console.log("❌ Business NOT FOUND even with Service Role (Seeding issue?)");

  // 2. Check Departments
  const { data: depts, error: deptErr } = await supabase
    .from('departments')
    .select('id, business_id, name')
    .eq('business_id', 'aiims-delhi');
    
  if (deptErr) console.log("Dept Error:", deptErr.message);
  else if (depts && depts.length > 0) console.log("✅ Departments Found:", depts.length);
  else console.log("❌ No Departments Found.");
}

check();
