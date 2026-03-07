import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { orgId, serviceId, userId, amount, type } = await request.json();

    // ----------------------------------------------------------------------
    // MOCK CHECKOUT ENGINE
    // In production, this would call Stripe.checkout.sessions.create() 
    // or Razorpay.orders.create()
    // ----------------------------------------------------------------------

    // Simulate network delay for realistic feel
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate a fake payment/checkout session ID
    const mockSessionId = `chk_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return NextResponse.json({
      success: true,
      sessionId: mockSessionId,
      url: `/customer/payment-success?session_id=${mockSessionId}&org=${orgId}&service=${serviceId}&type=${type}`,
      message: "Mock checkout session created successfully."
    });

  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
