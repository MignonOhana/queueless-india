// @ts-nocheck: ignoring vendor types for edge runtime
import { serve } from 'std/http/server'
import { createClient } from 'supabase'

interface BookSlotPayload {
  orgId: string;
  counterId: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  bookingDate: string; // YYYY-MM-DD
  timeSlot: string;    // HH:MM:00
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
    const payload: BookSlotPayload = await req.json()
    const { orgId, counterId, userId, customerName, customerPhone, bookingDate, timeSlot } = payload

    if (!orgId || !customerName || !bookingDate || !timeSlot) {
         throw new Error("Missing required payload fields");
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service-role for admin checks
    )

    // 1. Fetch business details to validate operating hours
    const { data: _biz, error: bizErr } = await supabaseClient
      .from('businesses')
      .select('opHours')
      .eq('id', orgId)
      .single()

    if (bizErr) throw bizErr;

    // Optional: Parse opHours (e.g. "09:00 AM-10:00 PM") and validate timeSlot
    // Basic structural validation for timeSlot (HH:MM:SS)
    if (!/^\d{2}:\d{2}:\d{2}$/.test(timeSlot)) {
        throw new Error("Invalid timeSlot format. Expected HH:MM:SS");
    }

    // 2. Check Capacity (Max 5 bookings per counter/slot/date)
    const MAX_CAPACITY = 5;
    const { count, error: countErr } = await supabaseClient
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('counter_id', counterId)
      .eq('booking_date', bookingDate)
      .eq('time_slot', timeSlot)
      .neq('status', 'CANCELLED');

    if (countErr) throw countErr;

    if (count !== null && count >= MAX_CAPACITY) {
       return new Response(JSON.stringify({ error: "SLOT_FULL", message: "This time slot is fully booked." }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 409, // Conflict
       });
    }

    // 3. Insert the booking
    const { data: newBooking, error: insertErr } = await supabaseClient
      .from('bookings')
      .insert({
         org_id: orgId,
         counter_id: counterId,
         user_id: userId,
         customer_name: customerName,
         customer_phone: customerPhone || "",
         booking_date: bookingDate,
         time_slot: timeSlot,
         status: 'CONFIRMED' // Auto-confirming for now
      })
      .select()
      .single()

    if (insertErr) throw insertErr;

    return new Response(JSON.stringify(newBooking), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    const err = error as Error;
    return new Response(JSON.stringify({ error: "INTERNAL_ERROR", message: err.message }), {
       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       status: 400,
     })
  }
})
