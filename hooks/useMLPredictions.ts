import { useState, useEffect, useCallback } from 'react';
import { apiClient, HealthPredictionResponse, Plant } from '@/lib/apiClient';
import { predictPlantHealth, analyzeAcousticPattern } from '@/lib/tfModels';

export interface MLPrediction {
  plantId: number;
  predictedHealth: number;
  trend: 'improving' | 'stable' | 'declining';
  confidence: number;
  recommendations: string[];
  acousticStress?: number;
}

interface UseMLPredictionsReturn {
  predictions: MLPrediction[];
  loading: boolean;
  error: string | null;
  apiAvailable: boolean;
  refetch: () => Promise<void>;
}

export function useMLPredictions(plants: Plant[]): UseMLPredictionsReturn {
  const [predictions, setPredictions] = useState<MLPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiAvailable, setApiAvailable] = useState(false);

  const fetchPredictions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check API availability
      const healthCheck = await apiClient.healthCheck();
      const isApiUp = healthCheck.status === 'healthy';
      setApiAvailable(isApiUp);

      if (isApiUp) {
        // Use backend API predictions
        console.log('[v0] Using backend API for predictions');
        const backendPredictions = await apiClient.predictHealth(plants);
        
        const mlPredictions: MLPrediction[] = backendPredictions.map(pred => ({
          plantId: pred.plant_id,
          predictedHealth: pred.predicted_health,
          trend: pred.prediction_trend,
          confidence: pred.confidence,
          recommendations: pred.recommendations,
        }));

        setPredictions(mlPredictions);
      } else {
        // Fall back to TensorFlow.js browser models
        console.log('[v0] API unavailable, using TensorFlow.js models');
        const browserPredictions = plants.map(plant => {
          const healthPred = predictPlantHealth({
            healthScore: plant.healthScore,
            temperature: plant.metrics.temperature,
            humidity: plant.metrics.humidity,
          });

          // Simulate acoustic analysis with random features
          const mockAudioFeatures = Array(13)
            .fill(0)
            .map(() => Math.random());
          const acousticPred = analyzeAcousticPattern(
            mockAudioFeatures,
            plant.healthScore
          );

          return {
            plantId: plant.id,
            predictedHealth: healthPred.predictedHealth,
            trend: healthPred.trend,
            confidence: healthPred.confidence,
            recommendations: [
              `Acoustic stress level: ${(acousticPred.stressLevel * 100).toFixed(1)}%`,
              'Monitor plant daily for changes',
            ],
            acousticStress: acousticPred.stressLevel,
          };
        });

        setPredictions(browserPredictions);
      }
    } catch (err) {
      console.error('[v0] Error fetching predictions:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Provide fallback predictions
      const fallback = plants.map(plant => ({
        plantId: plant.id,
        predictedHealth: plant.healthScore,
        trend: 'stable' as const,
        confidence: 0.5,
        recommendations: ['Using fallback predictions'],
      }));
      setPredictions(fallback);
    } finally {
      setLoading(false);
    }
  }, [plants]);

  useEffect(() => {
    fetchPredictions();

    // Refresh predictions every 5 minutes
    const interval = setInterval(fetchPredictions, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchPredictions]);

  return {
    predictions,
    loading,
    error,
    apiAvailable,
    refetch: fetchPredictions,
  };
}
