import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

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
    if (!orgId) return;

    const generateOrFetchPrediction = async () => {
      setLoading(true);
      setError(null);
      try {
        // predictions.id = businesses.id (slug)
        const predictionId = orgId;

        // 1. Try to fetch from Supabase first
        const { data: cachedPred, error: fetchErr } = await (supabase
          .from('predictions') as any)
          .select('*')
          .eq('id', predictionId)
          .maybeSingle();
        
        if (cachedPred && !fetchErr) {
          setPrediction(cachedPred as unknown as AIPrediction);
        } else {
          // 2. Call secure Edge Function if no cached version exists
          const { data: generatedData, error: edgeErr } = await supabase.functions.invoke('predict-queue', {
            body: { orgId, stats }
          });

          if (edgeErr) throw edgeErr;
          
          setPrediction(generatedData as AIPrediction);
        }
      } catch (err) {
        console.error("Prediction error:", err);
        setError("Failed to load predictions.");
        
        // Fallback
        setPrediction({
          bestTimeToVisit: "10:00 AM - 11:30 AM",
          currentWaitTime: stats.currentlyWaiting > 0 ? stats.currentlyWaiting * 4 : 5,
          predictedWaitNextHour: Math.floor(Math.random() * 20) + 15,
          predictedPeakHours: "5:00 PM - 7:00 PM",
          confidence: "High (Mocked Fallback)"
        });
      } finally {
        setLoading(false);
      }
    };

    generateOrFetchPrediction();
    
  }, [orgId, stats.currentlyWaiting, stats.totalToday]);

  return { prediction, loading, error };
}
