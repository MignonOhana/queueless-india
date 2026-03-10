import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      tokenData 
    } = await req.json();

    // 1. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // 2. Create Priority Token
    // We invoke the generate-token edge function but with isPriority: true
    // Or directly insert if permissions allow, but usually generate-token handles numbering logic
    const { data: token, error: tokenError } = await supabaseAdmin.functions.invoke("generate-token", {
      body: { 
        ...tokenData, 
        isPriority: true,
        paymentId: razorpay_payment_id
      }
    });

    if (tokenError) throw tokenError;

    // 3. Log Fast Pass Transaction
    await supabaseAdmin.from('fastpass_logs').insert({
      business_id: tokenData.orgId,
      token_id: token.id,
      amount: tokenData.amount,
      payment_id: razorpay_payment_id
    });

    return NextResponse.json({
      success: true,
      tokenId: token.id,
      tokenNumber: token.tokenNumber
    });

  } catch (error: any) {
    console.error('Fast Pass Verification Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
