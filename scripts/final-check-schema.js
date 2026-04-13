require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { error: err1 } = await supabase.from('departments').select('service_mins').limit(1);
  console.log("Check service_mins:", err1 ? "MISSING" : "EXISTS");

  const { error: err2 } = await supabase.from('departments').select('"serviceMins"').limit(1);
  console.log('Check "serviceMins":', err2 ? "MISSING" : "EXISTS");
}

check();
