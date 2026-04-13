require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testFetch() {
  console.log("🛠️ Fetching existing department...");
  const { data, error } = await supabase.from('departments').select('*').limit(1);

  if (error) {
    console.error("❌ Error:", error);
  } else {
    console.log("✅ Data:", data);
  }
}
testFetch();
