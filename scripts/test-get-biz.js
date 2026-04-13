require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
  console.log("🛠️ Testing Get Business RPC...");
  const { data, error } = await supabase.rpc('get_business_with_departments', {
    p_business_id: 'aiims-delhi'
  });

  if (error) {
    console.error("❌ Fetch RPC Error:", error.message);
  } else {
    console.log("✅ Fetch Success! Found departments:", data?.departments?.length || 0);
  }
}

testFetch();
