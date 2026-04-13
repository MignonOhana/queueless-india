require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("🛠️ Testing Department Creation...");
  
  // 1. Try snake_case version of p_service_mins first (just in case RPC was updated but seeding script was old)
  const { data: id, error } = await supabase.rpc('create_department', {
    p_business_id: 'aiims-delhi',
    p_name: 'Test Dept ' + Date.now(),
    p_description: 'Test description',
    p_icon: '🏢',
    p_service_mins: 15,
    p_op_hours: '9:00 AM - 5:00 PM',
    p_max_capacity: 500
  });

  if (error) {
    require('fs').writeFileSync('rpc_error.json', JSON.stringify(error, null, 2));
    console.error("❌ RPC Error saved to file.");
  } else {
    console.log("✅ Department Created! ID:", id);
  }
}

test();
