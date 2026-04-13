require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSchema() {
  console.log("🛠️ Testing Information Schema...");
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .limit(1);

  if (error) {
    console.error("❌ departments Fetch Error:", error);
  } else {
    console.log("✅ departments columns:", data.length > 0 ? Object.keys(data[0]) : "No rows to infer columns from natively through select *");
  }
}

testSchema();
