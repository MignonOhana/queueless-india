import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'MOCK_SECRET';

    // Verify signature
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest === razorpay_signature || secret === 'MOCK_SECRET') {
      // Valid signature (or Mocking it out)
      // Here usually you'd update your DB (Supabase/Firebase) to finalize the token
      
      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Invalid signature'
      }, { status: 400 });
    }

  } catch (error) {
    console.error("Payment Verification Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
