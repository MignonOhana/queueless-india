require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("🔍 Detailed Schema Check...");
  
  const { error: err1 } = await supabase.from('departments').select('service_mins').limit(1);
  if (err1) console.log("service_mins error:", err1.message, err1.code);
  else console.log("service_mins: EXISTS");

  const { error: err2 } = await supabase.from('departments').select('"serviceMins"').limit(1);
  if (err2) console.log('"serviceMins" error:', err2.message, err2.code);
  else console.log('"serviceMins": EXISTS');

  const { error: err3 } = await supabase.from('departments').select('sorting_order').limit(1); // checking a typo
  if (err3) console.log("sorting_order error:", err3.message);
}

check();
