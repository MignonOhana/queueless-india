import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    const { orgId, serviceId, userId, amount, type } = await request.json();

    // ----------------------------------------------------------------------
    // RAZORPAY / MOCK CHECKOUT ENGINE
    // ----------------------------------------------------------------------
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret) {
      // Execute genuine Razorpay Sandbox/Live Order
      const rzp = new Razorpay({
        key_id: keyId || 'rzp_test_placeholder',
        key_secret: keySecret || 'placeholder_secret',
      });

      const options = {
        amount: Math.round(amount * 100), // convert INR to paise
        currency: "INR",
        receipt: `rcpt_${orgId}_${Date.now().toString().substring(6)}`
      };

      const order = await rzp.orders.create(options);
      
      return NextResponse.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        isMock: false
      });
    }

    // --- FALLBACK MOCK CHECKOUT (No Keys Provided) ---
    // Simulate network delay for realistic feel
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate a fake payment/checkout session ID
    const mockSessionId = `chk_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return NextResponse.json({
      success: true,
      sessionId: mockSessionId,
      orderId: `order_mock_${Date.now()}`,
      url: `/customer/payment-success?session_id=${mockSessionId}&org=${orgId}&service=${serviceId}&type=${type}`,
      message: "Mock checkout session created successfully.",
      isMock: true
    });

  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
