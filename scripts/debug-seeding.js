require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const { data: profiles } = await supabase.from('user_profiles').select('id').limit(1);
  const systemOwnerId = profiles[0].id;
  
  const dept = { business_id: 'aiims-delhi', name: 'General Medicine', prefix: 'H', sort_order: 1 };
  
  console.log("Creating dept via RPC...");
  const { data: newId, error: rpcErr } = await supabase.rpc('create_department', {
         p_business_id: dept.business_id,
         p_name: dept.name,
         p_icon: '🏢',
         p_service_mins: 15,
         p_op_hours: '9:00 AM - 5:00 PM',
         p_max_capacity: 500
  });

  if (rpcErr) {
    console.error("❌ RPC Error:", rpcErr);
  } else {
    console.log("✅ Created ID:", newId);
    // Check if it exists now
    const { data } = await supabase.from('departments').select('*').eq('id', newId);
    console.log("Department in DB:", data);
  }
}

seed();
