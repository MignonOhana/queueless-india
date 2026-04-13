require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { count, error } = await supabase.from('departments').select('*', { count: 'exact', head: true });
  console.log("Total departments:", count);
  if (error) console.error(error);
  
  const { data: depts } = await supabase.from('departments').select('*').limit(1);
  if (depts && depts.length > 0) {
    console.log("Keys in departments:", Object.keys(depts[0]));
  }
}

check();
