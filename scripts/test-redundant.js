require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  console.log("🛠️ Testing redundant payload bypass...");
  const { data: bData } = await supabase.from('businesses').select('id').limit(1);
  if (bData && bData.length > 0) {
    const validBusId = bData[0].id;
    const payload = {
      business_id: validBusId,
      businessId: validBusId,
      name: 'Double Param Test',
      serviceMins: 15,
      service_mins: 15
    };
    console.log("Sending:", payload);
    const { data, error } = await supabase.from('departments').insert(payload).select();
    console.log("Error:", error);
  }
}
check();
