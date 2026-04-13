require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("🛠️ Inserting dummy dept...");
  const { data: newDept, error: insertErr } = await supabase.from('departments').insert({
    business_id: 'aiims-delhi',
    name: 'Test Dept'
  }).select().single();

  if (insertErr) {
    console.error("❌ Insert Error:", insertErr);
  } else {
    console.log("✅ Insert Success. Keys in row:", Object.keys(newDept));
    // Now cleanup
    await supabase.from('departments').delete().eq('id', newDept.id);
  }
}

check();
