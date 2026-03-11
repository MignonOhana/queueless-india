// @ts-nocheck: ignoring vendor types for edge runtime
import { serve } from "std/http/server"
import { createClient } from 'supabase'
import { GoogleGenerativeAI } from '@google/generative-ai'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orgId, stats } = await req.json()

    if (!orgId || !stats) {
      throw new Error('Missing orgId or stats payload')
    }

    // Initialize Supabase Client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // predictions.id = businesses.id (slug)
    const predictionId = orgId

    const { data: cachedPred, error: fetchErr } = await supabaseClient
      .from('predictions')
      .select('*')
      .eq('id', predictionId)
      .single()

    if (cachedPred && !fetchErr) {
       // Return cache hit
       return new Response(JSON.stringify(cachedPred), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 200,
       })
    }

    // 2. Generate new prediction if no cache
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    
    // Mock Fallback if no API key is set in Supabase Secrets yet
    if (!apiKey) {
      const mockPrediction = {
        bestTimeToVisit: "10:00 AM - 11:30 AM",
        currentWaitTime: stats.currentlyWaiting > 0 ? stats.currentlyWaiting * 4 : 5,
        predictedWaitNextHour: Math.floor(Math.random() * 20) + 15,
        predictedPeakHours: "5:00 PM - 7:00 PM",
        confidence: "High (Mocked Data server-side)"
      };
      
      await supabaseClient.from('predictions').upsert({ id: predictionId, ...mockPrediction });
      
      return new Response(JSON.stringify(mockPrediction), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Initialize Gemini securely on the server
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `
      Based on the following real-time data for organization ${orgId}:
      - Currently waiting: ${stats.currentlyWaiting} people
      - Total served today: ${stats.totalToday}
      - Current Time: ${new Date().toLocaleTimeString()}
      - Day of Week: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}
      
      Predict crowd flow and return a JSON object with EXACTLY these keys:
      - "bestTimeToVisit" (string, e.g., "10:00 AM")
      - "currentWaitTime" (number, estimated minutes)
      - "predictedWaitNextHour" (number, estimated minutes)
      - "predictedPeakHours" (string, e.g., "5:00 PM - 7:00 PM")
      - "confidence" (string, e.g., "85%")
      - "strategies" (array of 3 strings, e.g., ["Tuesday 10-11AM is consistently your busiest hour", "Consider opening a second counter on weekday mornings", ...])
      
      Insights should be data-driven, highlighting busy hours, wait time issues, and staffing suggestions.
      Return ONLY valid JSON without Markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean JSON text if markdown code blocks were included
    const cleanJson = responseText.replace(/```json\n|\n```/g, "").trim();
    const generatedData = JSON.parse(cleanJson);

    // 3. Save to Supabase cache
    await supabaseClient.from('predictions').upsert({ id: predictionId, ...generatedData });

    return new Response(JSON.stringify(generatedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
     const err = error as Error;
     return new Response(JSON.stringify({ error: err.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
  }
})
