import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    const { payload } = event;

    console.log('Razorpay Webhook Event:', event.event);

    switch (event.event) {
      case 'subscription.activated':
      case 'subscription.charged': {
        const sub = payload.subscription.entity;
        const businessId = sub.notes.business_id;
        const planId = sub.plan_id;
        const planType = planId.includes('growth') ? 'growth' : 'enterprise';

        // Update Subscriptions Table
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'active',
            current_period_end: new Date(sub.current_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('razorpay_subscription_id', sub.id);

        // Update Business Plan
        await supabaseAdmin
          .from('businesses')
          .update({ plan: planType })
          .eq('id', businessId);
        
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.halted': {
        const sub = payload.subscription.entity;
        const businessId = sub.notes.business_id;

        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('razorpay_subscription_id', sub.id);

        await supabaseAdmin
          .from('businesses')
          .update({ plan: 'free' })
          .eq('id', businessId);
        
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
