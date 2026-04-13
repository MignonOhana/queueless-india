require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAdminAuth() {
  console.log("=== Testing Admin Auth ===");
  
  // 1. Test OTP
  console.log("\\nTesting Email OTP with Service Role Client for check@example.com...");
  const { data: otpData, error: otpError } = await supabase.auth.signInWithOtp({
    email: 'check@example.com',
    options: {
      shouldCreateUser: true
    }
  });
  
  if (otpError) {
    console.error("❌ OTP Error:", otpError.message);
  } else {
    console.log("✅ OTP Success:", otpData);
  }
  process.exit(0);
}

testAdminAuth();
