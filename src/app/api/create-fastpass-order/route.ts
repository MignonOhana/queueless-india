import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

export async function POST(req: NextRequest) {
  try {
    const { amount, businessId, businessName } = await req.json();

    if (!amount || !businessId) {
      return NextResponse.json({ error: 'Missing amount or businessId' }, { status: 400 });
    }

    // Platform fee: 2.5%
    const platformFee = Math.ceil(amount * 0.025);
    
    const options = {
      amount: amount * 100, // Razorpay expects paise
      currency: "INR",
      receipt: `fastpass_${businessId}_${Date.now()}`,
      notes: {
        businessId,
        businessName,
        platformFee: platformFee.toString()
      }
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error('Fast Pass Order Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
