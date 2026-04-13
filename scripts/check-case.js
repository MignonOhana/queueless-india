require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("🔍 Fetching one department to check keys...");
  const { data, error } = await supabase.from('departments').select('*').limit(1);
  if (error) {
    console.error("❌ Error fetching departments:", error);
  } else if (data && data.length > 0) {
    console.log("Keys in departments table:", Object.keys(data[0]));
  } else {
    console.log("No departments found. Checking businesses instead...");
    const { data: bData } = await supabase.from('businesses').select('*').limit(1);
    console.log("Keys in businesses table:", Object.keys(bData[0]));
  }
}

check();
