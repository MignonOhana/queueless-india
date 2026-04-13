require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testAuth() {
  console.log("=== Testing Auth Clean ===");
  
  const { data: otpData, error: otpError } = await supabase.auth.signInWithOtp({
    email: 'check@example.com',
    options: {
      shouldCreateUser: true
    }
  });
  
  if (otpError) {
    console.error("❌ OTP Error Details:", JSON.stringify(otpError, null, 2));
    console.error("❌ Raw Error:", otpError);
  } else {
    console.log("✅ OTP Success:", otpData);
  }
  process.exit(0);
}

testAuth();
