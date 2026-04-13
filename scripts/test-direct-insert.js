require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  console.log("🛠️ Fetching a valid business...");
  const { data, error } = await supabase.from('businesses').select('id').limit(1);
  console.log("Businesses:", data);

  if (data && data.length > 0) {
    const validBusId = data[0].id;
    console.log("🛠️ Inserting department with valid business id:", validBusId);
    const { data: deptData, error: deptError } = await supabase.from('departments').insert({
      id: require('crypto').randomUUID(),
      business_id: validBusId,
      name: 'Direct Insert Valid Biz',
      service_mins: 15
    }).select();
    
    if (deptError) {
      require('fs').writeFileSync('insert_error.json', JSON.stringify(deptError, null, 2));
      console.error("❌ Direct Insert Error saved to file.");
    } else {
      console.log("✅ Direct Insert Success:", deptData);
    }
  }
}

check();
