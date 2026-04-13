require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const DEMO_BUSINESSES = [
  {
    id: "aiims-delhi",
    name: "AIIMS Delhi",
    category: "hospitals",
    description: "All India Institute of Medical Sciences, New Delhi",
    location: "Ansari Nagar, New Delhi",
    is_verified: true,
    plan: "growth",
    avg_rating: 4.8,
    total_reviews: 1240,
    whatsapp_enabled: true,
    fastPassEnabled: true,
    fastPassPrice: 49,
    serviceMins: 15,
    opHours: "9:00 AM - 5:00 PM"
  },
  {
    id: "sbi-main-branch-delhi",
    name: "SBI Main Branch",
    category: "banks",
    description: "State Bank of India - Main Branch, Delhi",
    location: "Sansad Marg, New Delhi",
    is_verified: true,
    plan: "free",
    avg_rating: 4.2,
    total_reviews: 850,
    whatsapp_enabled: false,
    fastPassEnabled: false,
    serviceMins: 10,
    opHours: "10:00 AM - 4:00 PM"
  },
  {
    id: "siddhivinayak-temple-mumbai",
    name: "Siddhivinayak Temple",
    category: "events",
    description: "Shree Siddhivinayak Ganapati Temple, Mumbai",
    location: "Prabhadevi, Mumbai",
    is_verified: true,
    plan: "enterprise",
    avg_rating: 4.9,
    total_reviews: 50000,
    whatsapp_enabled: true,
    fastPassEnabled: true,
    fastPassPrice: 100,
    serviceMins: 5,
    opHours: "5:00 AM - 10:00 PM"
  }
];

const DEPARTMENTS = [
  { business_id: 'aiims-delhi', name: 'General Medicine', prefix: 'H', sort_order: 1 },
  { business_id: 'aiims-delhi', name: 'Cardiology', prefix: 'C', sort_order: 2 },
  { business_id: 'sbi-main-branch-delhi', name: 'Cash Counter', prefix: 'B', sort_order: 1 },
  { business_id: 'sbi-main-branch-delhi', name: 'Account Opening', prefix: 'A', sort_order: 2 },
  { business_id: 'siddhivinayak-temple-mumbai', name: 'General Darshan', prefix: 'T', sort_order: 1 },
  { business_id: 'siddhivinayak-temple-mumbai', name: 'VIP Pass', prefix: 'V', sort_order: 2 },
];

async function seed() {
  console.log("🌱 Seeding Demo Businesses...");

  const { data: profiles } = await supabase.from('user_profiles').select('id').limit(1);
  if (!profiles || profiles.length === 0) {
    console.error("❌ No users found.");
    return;
  }
  const systemOwnerId = profiles[0].id;

  for (const biz of DEMO_BUSINESSES) {
    console.log(`- Upserting ${biz.name}...`);
    const { error } = await supabase
      .from('businesses')
      .upsert({ 
        ...biz, 
        owner_id: systemOwnerId,
        updated_at: new Date().toISOString(),
        claim_status: 'claimed'
      }, { onConflict: 'id' });
    
    if (error) console.error(`  ❌ Error: ${error.message}`);
  }

  console.log("🏙️ Seeding Demo Departments (Direct Insert Mode)...");
  for (const dept of DEPARTMENTS) {
    console.log(`- Inserting Dept ${dept.name} for ${dept.business_id}...`);
    
    const { data: existing } = await supabase
      .from('departments')
      .select('id')
      .eq('business_id', dept.business_id)
      .eq('name', dept.name)
      .maybeSingle();

    if (!existing) {
       // Manual Insert with minimal columns to avoid "column missing" errors
       const { data: newDept, error: insertErr } = await supabase.from('departments').insert({
         id: require('uuid').v4(),
         business_id: dept.business_id,
         name: dept.name
       }).select().maybeSingle();

       if (insertErr) {
         console.error(`  ❌ Insert Error: ${insertErr.message}`);
       } else {
         console.log(`  ✅ Created: ${newDept.id}`);
       }
    } else {
       console.log(`  ✅ Exists`);
    }
  }

  console.log("✅ Seeding complete!");
}

seed();
