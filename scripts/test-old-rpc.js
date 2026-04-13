require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testOldSignature() {
  console.log("🛠️ Testing legacy function signature...");
  
  const { data, error } = await supabase.rpc('create_department', {
    businessid: 'aiims-delhi',
    name: 'Old Signature Test',
    description: 'If this works, it means the old function was never deleted.',
    icon: '🏢',
    serviceMins: 15,
    opHours: '9:00 AM - 5:00 PM',
    maxcapacity: 100
  });

  if (error) {
    console.error("❌ Legacy RPC Error:", error);
  } else {
    console.log("✅ Legacy RPC SUCCESS! Found ID:", data);
  }
}

testOldSignature();
