import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = createServiceRoleClient();
    const { businessId, planId, customerData } = await req.json();

    if (!businessId || !planId) {
      return NextResponse.json({ error: 'Missing businessId or planId' }, { status: 400 });
    }

    // 1. Create/Retrieve Razorpay Customer (optional but recommended)
    // For simplicity, we'll create a subscription directly with plan_id
    
    // 2. Create Razorpay Subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId, // e.g., 'plan_growth_monthly'
      customer_notify: 1,
      total_count: 12, // For a year, or use 0 for indefinite
      notes: {
        business_id: businessId
      }
    });

    // 3. Save pending subscription info to Supabase
    const { error: dbError } = await (supabaseAdmin
      .from('subscriptions') as any)
      .insert({
        business_id: businessId,
        plan: planId.includes('growth') ? 'growth' : 'enterprise',
        razorpay_subscription_id: subscription.id,
        status: 'pending'
      });

    if (dbError) throw dbError;

    return NextResponse.json({
      subscriptionId: subscription.id,
      short_url: subscription.short_url,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Razorpay Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
