// @ts-nocheck
import { serve } from 'std/http/server'

interface WhatsAppPayload {
  phone: string;
  template: string;
  params: string[];
  businessId: string;
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
    const { phone, template, params, businessId } = await req.json() as WhatsAppPayload

    if (!phone || !template) {
      throw new Error("Missing phone or template")
    }

    const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
    const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')

    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      throw new Error("WhatsApp configuration missing in environment variables")
    }

    // Clean phone number: remove any non-digit characters, ensure it starts with +91 or similar
    // User requested E.164: +91XXXXXXXXXX
    const cleanPhone = phone.replace(/\D/g, '')
    const finalPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`

    console.log(`Sending WhatsApp (${template}) to ${finalPhone} for business ${businessId}`)

    const response = await fetch(
      `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: finalPhone,
          type: 'template',
          template: {
            name: template,
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: params.map(p => ({ type: 'text', text: String(p) }))
              }
            ]
          }
        }),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      console.error("Meta API Error:", result)
      return new Response(JSON.stringify({ error: result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status,
      })
    }

    return new Response(JSON.stringify({ success: true, messageId: result.messages?.[0]?.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("WhatsApp Function Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
