require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("🛠️ Inserting dept with manual UUID...");
  const { data: bData } = await supabase.from('businesses').select('id').limit(1);
  const bizId = bData[0].id;

  const { data: newDept, error: insertErr } = await supabase.from('departments').insert({
    id: 'a33f41eb-6799-4c8d-8ad1-66774e44432b', // manual UUID
    business_id: bizId,
    name: 'Manual ID Test ' + Date.now()
  }).select().maybeSingle();

  if (insertErr) {
    console.error("❌ Insert Error:", insertErr.message);
  } else if (newDept) {
    console.log("✅ Success. Columns present:", Object.keys(newDept));
    await supabase.from('departments').delete().eq('id', newDept.id);
  }
}

check();
