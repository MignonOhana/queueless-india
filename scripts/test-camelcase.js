require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testCamelCase() {
  console.log("🛠️ Testing camelCase payload...");
  const { data, error } = await supabase.from('departments').insert({
    businessId: 'aiims-delhi',
    name: 'Camel Test',
    serviceMins: 15
  }).select();

  console.log("Error:", error);
}

testCamelCase();
