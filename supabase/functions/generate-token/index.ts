// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Interface for strongly typed inputs
interface GenerateTokenPayload {
  orgId: string;
  counterPrefix: string; // e.g., 'OPD'
  userId: string;
  customerName: string;
  customerPhone: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: GenerateTokenPayload = await req.json()
    const { orgId, counterPrefix, userId, customerName, customerPhone } = payload

    if (!orgId || !counterPrefix || !customerName) {
         throw new Error("Missing required payload fields");
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 1. Find or create the active queue session for TODAY
    // Usually, admin creates it, but we handle the fallback
    let { data: queue, error: qErr } = await supabaseClient
      .from('queues')
      .select('id, last_issued_number, total_waiting')
      .eq('org_id', orgId)
      .eq('counter_id', counterPrefix.toLowerCase())
      .eq('session_date', new Date().toISOString().split('T')[0])
      .single()

    if (qErr && qErr.code === 'PGRST116') {
       // If no queue row exists for today, create it
       const { data: newQ, error: createQErr } = await supabaseClient
         .from('queues')
         .insert({ org_id: orgId, counter_id: counterPrefix.toLowerCase(), session_date: new Date().toISOString().split('T')[0] })
         .select()
         .single()
         
       if(createQErr) throw createQErr;
       queue = newQ;
    } else if (qErr) {
       throw qErr;
    }

    // 2. Atomically increment the sequence counter via RPC
    const { data: currentNumber, error: rpcErr } = await supabaseClient
       .rpc('increment_queue_counter', { p_queue_id: queue.id })

    if (rpcErr) throw rpcErr;

    // 3. Formulate Token String and Estimated Wait
    const paddedNumber = String(currentNumber).padStart(3, '0')
    const tokenStr = `${counterPrefix}-${paddedNumber}`
    
    // Calculate simple estimate (5 mins per waiting person)
    // NOTE: In production, total_waiting from the queue row is much faster than running COUNT()
    const estimatedWaitMins = (queue.total_waiting || 0) * 5 

    // 4. Insert the token document
    const { data: tokenDoc, error: insertErr } = await supabaseClient
      .from('tokens')
      .insert({
        orgId: orgId,
        counterId: counterPrefix.toLowerCase(),
        queue_id: queue.id,
        userId: userId,
        customerName: customerName,
        customerPhone: customerPhone || "",
        tokenNumber: tokenStr,
        status: "WAITING",
        estimatedWaitMins: estimatedWaitMins,
      })
      .select()
      .single()

    if (insertErr) throw insertErr;

    return new Response(JSON.stringify(tokenDoc), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
     // Handle Capacity Constraints gracefully
     if (error.message && error.message.includes("Queue is full")) {
       return new Response(JSON.stringify({ error: "QUEUE_FULL", message: "This queue is currently at maximum capacity. Please try again later." }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 429, // Too Many Requests
       });
     }
     
     if (error.message && error.message.includes("not accepting new customers")) {
       return new Response(JSON.stringify({ error: "QUEUE_CLOSED", message: "This queue is currently closed and not accepting new tokens." }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 403, // Forbidden
       });
     }

     return new Response(JSON.stringify({ error: "INTERNAL_ERROR", message: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
  }
})
