import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIPrediction {
  bestTimeToVisit: string;
  currentWaitTime: number; // in mins
  predictedWaitNextHour: number; // in mins
  predictedPeakHours: string;
  confidence: string;
}

export function useAIPrediction(orgId: string, stats: { currentlyWaiting: number, totalToday: number }) {
  const [prediction, setPrediction] = useState<AIPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch/generate if we have an orgId
    if (!orgId) return;

    const generateOrFetchPrediction = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use a time-based key to cache predictions per hour
        const now = new Date();
        const dateKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}_H${now.getHours()}`;
        const predictionId = `${orgId}_${dateKey}`;

        // Try to fetch from Supabase first
        const { data: cachedPred, error: fetchErr } = await supabase
          .from('predictions')
          .select('*')
          .eq('id', predictionId)
          .single();
        
        if (cachedPred && !fetchErr) {
          setPrediction(cachedPred as AIPrediction);
        } else {
          // Fallback to generating new prediction if no cached version exists
          await generatePrediction(predictionId);
        }
      } catch (err) {
        console.error("Prediction error:", err);
        setError("Failed to load predictions.");
      } finally {
        setLoading(false);
      }
    };

    const generatePrediction = async (predictionId: string) => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        
        // If no API key is set, generate a mock prediction instead of failing
        if (!apiKey || apiKey === "mock_key") {
          const mockPrediction: AIPrediction = {
            bestTimeToVisit: "10:00 AM - 11:30 AM",
            currentWaitTime: stats.currentlyWaiting > 0 ? stats.currentlyWaiting * 4 : 5,
            predictedWaitNextHour: Math.floor(Math.random() * 20) + 15,
            predictedPeakHours: "5:00 PM - 7:00 PM",
            confidence: "High (Mocked Data)"
          };
          setPrediction(mockPrediction);
          
          // Still try to save to Supabase
          const { error: upsertErr } = await supabase.from('predictions').upsert({ id: predictionId, ...mockPrediction });
          if (upsertErr) console.warn("Failed to save mock prediction to DB", upsertErr);
          return;
        }

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
          Based on the following real-time data for organization ${orgId}:
          - Currently waiting: ${stats.currentlyWaiting} people
          - Total served today: ${stats.totalToday}
          - Current Time: ${new Date().toLocaleTimeString()}
          - Day of Week: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}
          
          Predict the crowd flow and return a JSON object with EXACTLY these keys:
          - "bestTimeToVisit" (string, e.g., "10:00 AM")
          - "currentWaitTime" (number, estimated minutes based on 4 mins per person)
          - "predictedWaitNextHour" (number, estimated minutes)
          - "predictedPeakHours" (string, e.g., "5:00 PM - 7:00 PM")
          - "confidence" (string, e.g., "85%")
          
          Return ONLY valid JSON without Markdown formatting.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Clean JSON text if markdown code blocks were included
        const cleanJson = responseText.replace(/```json\n|\n```/g, "").trim();
        const generatedData = JSON.parse(cleanJson) as AIPrediction;

        setPrediction(generatedData);
        
        // Store in Supabase
        const { error: upsertErr2 } = await supabase.from('predictions').upsert({ id: predictionId, ...generatedData });
        if (upsertErr2) console.error("Supabase save err:", upsertErr2);

      } catch (geminiError) {
        console.error("Gemini AI generation failed, using fallback:", geminiError);
        // Fallback payload if generation fails
        setPrediction({
          bestTimeToVisit: "Tomorrow morning",
          currentWaitTime: stats.currentlyWaiting * 4 || 10,
          predictedWaitNextHour: 25,
          predictedPeakHours: "Evening rush",
          confidence: "Low (Fallback)"
        });
      }
    };

    generateOrFetchPrediction();
    
  }, [orgId, stats.currentlyWaiting, stats.totalToday]);

  return { prediction, loading, error };
}
