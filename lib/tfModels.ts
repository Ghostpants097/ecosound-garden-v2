// TensorFlow.js loaded from CDN
// Declare types for TensorFlow
declare global {
  var tf: any;
}

// Load models from public directory
const HEALTH_MODEL_URL = '/models/plant-health-model/model.json';
const ACOUSTIC_MODEL_URL = '/models/acoustic-stress-model/model.json';

let healthModel: any = null;
let acousticModel: any = null;
let tfLoaded = false;

// Load TensorFlow.js from CDN
async function loadTensorFlow(): Promise<void> {
  if (tfLoaded) return;
  
  try {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.11.0/dist/tf.min.js';
    script.async = true;
    script.onload = () => {
      tfLoaded = true;
      console.log('[v0] TensorFlow.js loaded from CDN');
    };
    script.onerror = () => {
      console.log('[v0] Failed to load TensorFlow.js from CDN, using fallback');
      tfLoaded = false;
    };
    document.head.appendChild(script);
    
    // Wait for TensorFlow to load
    await new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (window.tf) {
          clearInterval(checkInterval);
          resolve(null);
        }
      }, 100);
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(null);
      }, 10000);
    });
  } catch (err) {
    console.log('[v0] Error loading TensorFlow.js:', err);
  }
}

interface PlantHealthInput {
  healthScore: number;
  temperature: number;
  humidity: number;
}

interface PredictionResult {
  predictedHealth: number;
  confidence: number;
  trend: 'improving' | 'stable' | 'declining';
}

interface AcousticResult {
  stressLevel: number;
  classification: 'healthy' | 'moderate_stress' | 'high_stress';
  confidence: number;
}

export async function initializeModels(): Promise<void> {
  try {
    console.log('[v0] Initializing TensorFlow.js models...');
    
    // Ensure TensorFlow is loaded
    if (!window.tf) {
      await loadTensorFlow();
    }
    
    // Load health prediction model
    try {
      if (window.tf) {
        healthModel = await window.tf.loadLayersModel(HEALTH_MODEL_URL);
        console.log('[v0] Health model loaded successfully');
      } else {
        console.log('[v0] TensorFlow not available, using fallback');
      }
    } catch (e) {
      console.log('[v0] Health model not found, using fallback predictions');
    }
    
    // Load acoustic stress model
    try {
      if (window.tf) {
        acousticModel = await window.tf.loadLayersModel(ACOUSTIC_MODEL_URL);
        console.log('[v0] Acoustic model loaded successfully');
      } else {
        console.log('[v0] TensorFlow not available, using fallback');
      }
    } catch (e) {
      console.log('[v0] Acoustic model not found, using fallback predictions');
    }
  } catch (error) {
    console.error('[v0] Error initializing models:', error);
  }
}

export function predictPlantHealth(input: PlantHealthInput): PredictionResult {
  try {
    let predictedHealth = input.healthScore;
    let confidence = 0.7;
    
    if (healthModel && window.tf) {
      try {
        // Normalize inputs
        const normalizedInput = window.tf.tensor2d([[
          input.healthScore / 100,
          input.temperature / 30,
          input.humidity / 100
        ]]);
        
        const prediction = healthModel.predict(normalizedInput) as any;
        const values = prediction.dataSync();
        
        predictedHealth = Math.round(values[0] * 100);
        confidence = values[1] || 0.75;
        
        prediction.dispose();
        normalizedInput.dispose();
      } catch (e) {
        console.log('[v0] Model prediction failed, using fallback');
      }
    } else {
      // Fallback: Simple domain-based prediction
      const tempScore = 100 - Math.abs(input.temperature - 23) * 5;
      const humidityScore = 100 - Math.abs(input.humidity - 60) * 1.5;
      predictedHealth = Math.round(
        input.healthScore * 0.5 + tempScore * 0.25 + humidityScore * 0.25
      );
      confidence = 0.65;
    }
    
    // Determine trend
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (predictedHealth > input.healthScore + 5) {
      trend = 'improving';
    } else if (predictedHealth < input.healthScore - 5) {
      trend = 'declining';
    }
    
    return {
      predictedHealth: Math.max(0, Math.min(100, predictedHealth)),
      confidence: Math.round(confidence * 100) / 100,
      trend
    };
  } catch (error) {
    console.error('[v0] Error predicting health:', error);
    return {
      predictedHealth: input.healthScore,
      confidence: 0.5,
      trend: 'stable'
    };
  }
}

export function analyzeAcousticPattern(
  audioFeatures: number[],
  plantHealthScore: number
): AcousticResult {
  try {
    if (!audioFeatures || audioFeatures.length === 0) {
      return {
        stressLevel: 0.5,
        classification: 'healthy',
        confidence: 0.5
      };
    }
    
    let stressLevel = 0.5;
    let confidence = 0.65;
    
    if (acousticModel && window.tf) {
      try {
        // Normalize input features
        const features = window.tf.tensor2d([audioFeatures]);
        
        const prediction = acousticModel.predict(features) as any;
        const values = prediction.dataSync();
        
        stressLevel = Math.min(1.0, Math.max(0, values[0]));
        confidence = values[1] || 0.65;
        
        prediction.dispose();
        features.dispose();
      } catch (e) {
        console.log('[v0] Acoustic prediction failed, using fallback');
      }
    } else {
      // Fallback: Calculate variance-based stress
      const mean = audioFeatures.reduce((a, b) => a + b) / audioFeatures.length;
      const variance = audioFeatures.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / audioFeatures.length;
      stressLevel = Math.min(1.0, Math.sqrt(variance) / (mean + 0.001));
      
      // Factor in plant health
      const healthFactor = 1 - (plantHealthScore / 100);
      stressLevel = stressLevel * 0.7 + healthFactor * 0.3;
      
      confidence = 0.6 + (0.2 * (1 - Math.abs(stressLevel - 0.5)));
    }
    
    // Classify stress level
    let classification: 'healthy' | 'moderate_stress' | 'high_stress' = 'healthy';
    if (stressLevel > 0.7) {
      classification = 'high_stress';
    } else if (stressLevel > 0.4) {
      classification = 'moderate_stress';
    }
    
    return {
      stressLevel: Math.round(stressLevel * 1000) / 1000,
      classification,
      confidence: Math.round(confidence * 100) / 100
    };
  } catch (error) {
    console.error('[v0] Error analyzing acoustic pattern:', error);
    return {
      stressLevel: 0.5,
      classification: 'healthy',
      confidence: 0.5
    };
  }
}

export function disposeModels(): void {
  if (healthModel) {
    healthModel.dispose();
    healthModel = null;
  }
  if (acousticModel) {
    acousticModel.dispose();
    acousticModel = null;
  }
}
