require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('businesses').select('*').limit(1);
  console.log('Error:', error);
  console.log('Businesses count:', data?.length);
  if (data && data.length > 0) {
    const biz = data[0];
    console.log('First Business ID:', biz.id);
    
    // Now simulate what b/[id] does
    const { data: bData, error: bErr } = await supabase.from('businesses').select('*').eq('id', biz.id).single();
    console.log('Single fetch error:', bErr);
    console.log('Single fetch result:', bData ? 'Success' : 'Fail');
  }
}

test();
