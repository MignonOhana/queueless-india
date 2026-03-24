require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFastPass() {
    console.log("🚀 Testing FastPass & Analytics...");

    const payload = {
        orgId: 'tirupati-ttd-tirupati',
        counterPrefix: 'F',
        userId: null,
        customerName: 'FastPass Tester',
        customerPhone: '+919999999999',
        isPriority: true,
        paymentId: 'pay_test_12345'
    };

    try {
        console.log("Testing create_queue_token RPC directly...");
        const { data, error } = await supabase.rpc('create_queue_token', {
            p_org_id: payload.orgId,
            p_user_id: payload.userId,
            p_customer_name: payload.customerName,
            p_customer_phone: payload.customerPhone,
            p_token_number: 'F-001',
            p_estimated_wait_mins: 0,
            p_department_id: null,
            p_is_priority: true,
            p_payment_id: payload.paymentId
        });

        if (error) {
            console.error("❌ RPC Error:", error);
            return;
        }

        const token = data[0];
        console.log("✅ Token Created Successfully via RPC!", token.tokenNumber);

        // 2. Analytics RPC
        console.log("\n📊 Testing Analytics RPC (get_hourly_distribution)...");
        const { data: analytics, error: analyticsError } = await supabase.rpc('get_hourly_distribution', {
            p_org_id: 'tirupati-ttd-tirupati',
            p_date: new Date().toISOString().split('T')[0]
        });

        if (analyticsError) {
            console.error("❌ Analytics RPC Error:", analyticsError);
        } else {
            console.log("✅ Analytics RPC Success! Data Rows:", analytics?.length || 0);
        }

    } catch (err) {
        console.error("❌ Unexpected Error:", err);
    }
}

testFastPass();
