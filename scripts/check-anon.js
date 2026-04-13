require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, anonKey);

async function check() {
  console.log("🔍 Checking Business with ANAL KEY...");
  const { data, error } = await supabase.from('businesses').select('id').eq('id', 'aiims-delhi').maybeSingle();
  if (error) console.log("Error:", error.message);
  else if (data) console.log("✅ Success! Business found with Anon Key.");
  else console.log("❌ Business NOT FOUND with Anon Key (RLS?)");
}

check();
