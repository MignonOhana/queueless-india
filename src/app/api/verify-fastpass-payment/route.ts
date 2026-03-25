import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { Database } from '@/types/database.types';

type PublicToken = Pick<Database['public']['Tables']['tokens']['Row'], 'id' | 'tokenNumber' | 'estimatedWaitMins'>;

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = createServiceRoleClient<Database>();
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

    // 2. Create Priority Token Logic
    // Using direct RPC calls (same as /api/queue/join) for reliability
    
    // First, find the active queue
    const todayDate = new Date().toISOString().split('T')[0];
    let queueQuery = supabaseAdmin
      .from('queues')
      .select('id')
      .eq('org_id', tokenData.orgId);
    
    if (tokenData.departmentId) {
      queueQuery = queueQuery.eq('department_id', tokenData.departmentId);
    } else {
      queueQuery = queueQuery.is('department_id', null);
    }

    const { data: queueData, error: queueErr } = await queueQuery.single();
    if (queueErr || !queueData) throw new Error("No active queue found");

    // Atomic increment
    const { data: nextNumber, error: incrementErr } = await supabaseAdmin
      .rpc('increment_queue_counter', { p_queue_id: queueData.id });

    if (incrementErr || !nextNumber) throw new Error("Queue full");

    const counterPrefix = tokenData.counterPrefix || 'Q';
    const paddedNumber = String(nextNumber).padStart(3, '0');
    const tokenStr = `${counterPrefix}-${paddedNumber}`;

    // Create token row
    const { data: tokenRows, error: insertErr } = await supabaseAdmin
      .rpc('create_queue_token', {
        p_org_id: tokenData.orgId,
        p_user_id: tokenData.userId || null,
        p_customer_name: tokenData.customerName,
        p_customer_phone: tokenData.customerPhone || '',
        p_token_number: tokenStr,
        p_estimated_wait_mins: 0, // Priority gets instant or near-instant service
        p_department_id: tokenData.departmentId || null,
        p_is_priority: true,
        p_payment_id: razorpay_payment_id
      });

    if (insertErr || !tokenRows || tokenRows.length === 0) throw insertErr || new Error("Insert failed");

    const token = tokenRows[0];

    // 3. Log Fast Pass Transaction
    await supabaseAdmin.from('fastpass_logs').insert({
      business_id: tokenData.orgId,
      token_id: token.id,
      amount: tokenData.amount,
      customer_phone: tokenData.customerPhone || ''
    });

    return NextResponse.json({
      success: true,
      tokenId: token.id,
      tokenNumber: token.tokenNumber,
      estimatedWaitMins: token.estimatedWaitMins
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Fast Pass Verification Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
