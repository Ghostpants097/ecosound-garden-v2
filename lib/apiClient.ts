const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PlantMetrics {
  temperature: number;
  humidity: number;
  acousticPattern: string;
}

export interface Plant {
  id: number;
  name: string;
  emoji: string;
  status: 'healthy' | 'stressed' | 'critical';
  healthScore: number;
  image: string;
  musicUrl: string;
  metrics: PlantMetrics;
}

export interface HealthPredictionResponse {
  plant_id: number;
  predicted_health: number;
  prediction_trend: 'improving' | 'stable' | 'declining';
  confidence: number;
  recommendations: string[];
}

export interface AcousticAnalysisResponse {
  plant_id: number;
  stress_level: number;
  audio_classification: string;
  confidence: number;
}

export interface ModelStatus {
  health_model: {
    name: string;
    accuracy: number;
    deployed: boolean;
    last_updated: string;
  };
  acoustic_model: {
    name: string;
    accuracy: number;
    deployed: boolean;
    last_updated: string;
  };
}

class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async healthCheck(): Promise<{ status: string; service: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Health check failed');
      return await response.json();
    } catch (error) {
      console.error('[v0] API health check failed:', error);
      return { status: 'unavailable', service: 'EcoSound Garden API' };
    }
  }

  async predictHealth(plants: Plant[]): Promise<HealthPredictionResponse[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/predict/health`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plants }),
      });

      if (!response.ok) {
        throw new Error(`Health prediction failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[v0] Error predicting health:', error);
      // Return fallback predictions if API is unavailable
      return plants.map(plant => ({
        plant_id: plant.id,
        predicted_health: plant.healthScore,
        prediction_trend: 'stable' as const,
        confidence: 0.5,
        recommendations: ['API unavailable - using fallback predictions'],
      }));
    }
  }

  async analyzeAcoustic(
    plantId: number,
    audioFeatures: number[]
  ): Promise<AcousticAnalysisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/predict/acoustic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plant_id: plantId,
          audio_features: audioFeatures,
        }),
      });

      if (!response.ok) {
        throw new Error(`Acoustic analysis failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[v0] Error analyzing acoustic:', error);
      return {
        plant_id: plantId,
        stress_level: 0.5,
        audio_classification: 'unknown',
        confidence: 0.5,
      };
    }
  }

  async getModelStatus(): Promise<ModelStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/models/status`, {
        method: 'GET',
      });

      if (!response.ok) throw new Error('Failed to get model status');
      return await response.json();
    } catch (error) {
      console.error('[v0] Error getting model status:', error);
      return {
        health_model: {
          name: 'Unknown',
          accuracy: 0,
          deployed: false,
          last_updated: '',
        },
        acoustic_model: {
          name: 'Unknown',
          accuracy: 0,
          deployed: false,
          last_updated: '',
        },
      };
    }
  }

  async uploadAcousticData(
    plantId: number,
    file: File
  ): Promise<{ message: string; filename: string; size: number }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('plant_id', plantId.toString());

      const response = await fetch(`${this.baseUrl}/api/dataset/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload acoustic data');
      return await response.json();
    } catch (error) {
      console.error('[v0] Error uploading acoustic data:', error);
      throw error;
    }
  }
}

export const apiClient = new APIClient();
