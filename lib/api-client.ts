const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface SensorData {
  temperature: number;
  humidity: number;
  lightLevel?: number;
  soilMoisture?: number;
  phLevel?: number;
  ecLevel?: number;
}

export interface HealthPrediction {
  plant_id: number;
  health_score: number;
  status: 'healthy' | 'stressed' | 'critical';
  confidence: number;
  recommendations: string[];
  timestamp: string;
}

export interface AcousticAnalysis {
  acoustic_stress_level: number;
  stress_detected: boolean;
  confidence: number;
  frequency_analysis: Record<string, number>;
  recommendations: string[];
}

class EcoSoundAPI {
  /**
   * Predict plant health based on sensor data
   */
  async predictHealth(
    plantId: number,
    sensorData: SensorData
  ): Promise<HealthPrediction> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/predict-health`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plant_id: plantId,
          sensor_data: sensorData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[v0] Health prediction error:', error);
      throw error;
    }
  }

  /**
   * Analyze acoustic patterns from plant audio
   */
  async analyzeAcoustic(audioFile: File): Promise<AcousticAnalysis> {
    try {
      const formData = new FormData();
      formData.append('file', audioFile);

      const response = await fetch(`${API_BASE_URL}/api/analyze-acoustic`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[v0] Acoustic analysis error:', error);
      throw error;
    }
  }

  /**
   * Predict health for multiple plants in batch
   */
  async batchPredict(
    plants: Array<{
      plant_id: number;
      plant_name: string;
      sensor_data: SensorData;
    }>
  ): Promise<{ predictions: HealthPrediction[]; total: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/batch-predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plants),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[v0] Batch prediction error:', error);
      throw error;
    }
  }

  /**
   * Get model information
   */
  async getModelInfo(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/model-info`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[v0] Model info error:', error);
      throw error;
    }
  }

  /**
   * Check API health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      return response.ok;
    } catch (error) {
      console.error('[v0] Health check failed:', error);
      return false;
    }
  }
}

export const echoSoundAPI = new EcoSoundAPI();
