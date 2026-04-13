require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("🛠️ Inserting minimal dept...");
  const { data: bData } = await supabase.from('businesses').select('id').limit(1);
  if (!bData || bData.length === 0) {
     console.error("No businesses found.");
     return;
  }
  const bizId = bData[0].id;

  const { data: newDept, error: insertErr } = await supabase.from('departments').insert({
    business_id: bizId,
    name: 'Minimal Test ' + Date.now()
  }).select().maybeSingle();

  if (insertErr) {
    console.error("❌ Insert Error:", insertErr);
  } else if (newDept) {
    console.log("✅ Success. Columns present:", Object.keys(newDept));
    await supabase.from('departments').delete().eq('id', newDept.id);
  } else {
    console.log("No data returned from insert.");
  }
}

check();
