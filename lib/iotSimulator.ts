// Real-time IoT sensor data simulator
// Generates realistic plant sensor data with temporal correlations

export interface SensorReading {
  plantId: number;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  lightIntensity: number;
  timestamp: Date;
  acousticData?: number[];
}

export interface PlantState {
  plantId: number;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  lightIntensity: number;
  lastWatered: Date;
  stressLevel: number;
}

// Initialize sensor state with realistic starting values
const plantStates: Map<number, PlantState> = new Map();

const optimalRanges = {
  temperature: { min: 18, max: 26, ideal: 22 },
  humidity: { min: 40, max: 70, ideal: 60 },
  soilMoisture: { min: 30, max: 80, ideal: 60 },
  lightIntensity: { min: 100, max: 800, ideal: 500 },
};

export function initializeSensorState(plantId: number, optimalTemp: number = 22) {
  plantStates.set(plantId, {
    plantId,
    temperature: optimalTemp + (Math.random() - 0.5) * 4,
    humidity: 60 + (Math.random() - 0.5) * 20,
    soilMoisture: 60 + (Math.random() - 0.5) * 30,
    lightIntensity: 500 + (Math.random() - 0.5) * 200,
    lastWatered: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    stressLevel: Math.random() * 0.3,
  });
}

export function generateSensorReading(plantId: number): SensorReading {
  // Initialize state if not exists
  if (!plantStates.has(plantId)) {
    initializeSensorState(plantId);
  }

  const state = plantStates.get(plantId)!;

  // Simulate environmental variations with Brownian motion
  const tempChange = (Math.random() - 0.5) * 0.5;
  const humidityChange = (Math.random() - 0.5) * 2;
  const moistureChange = (Math.random() - 0.5) * 3;
  const lightChange = (Math.random() - 0.5) * 50;

  // Apply changes with bounds
  state.temperature = Math.max(15, Math.min(35, state.temperature + tempChange));
  state.humidity = Math.max(20, Math.min(95, state.humidity + humidityChange));
  state.soilMoisture = Math.max(10, Math.min(100, state.soilMoisture + moistureChange));
  state.lightIntensity = Math.max(0, Math.min(1000, state.lightIntensity + lightChange));

  // Simulate water loss (evapotranspiration)
  const hoursSinceWatered = (Date.now() - state.lastWatered.getTime()) / (1000 * 60 * 60);
  state.soilMoisture = Math.max(10, state.soilMoisture - hoursSinceWatered * 0.15);

  // Calculate stress level based on deviation from optimal ranges
  const tempStress = Math.abs(state.temperature - optimalRanges.temperature.ideal) / 10;
  const humidityStress = Math.abs(state.humidity - optimalRanges.humidity.ideal) / 30;
  const moistureStress = Math.abs(state.soilMoisture - optimalRanges.soilMoisture.ideal) / 50;
  
  state.stressLevel = Math.min(1, (tempStress + humidityStress + moistureStress) / 3);

  // Generate acoustic patterns based on stress level (simulated frequencies)
  const acousticData = generateAcousticPattern(state.stressLevel);

  plantStates.set(plantId, state);

  return {
    plantId,
    temperature: Math.round(state.temperature * 10) / 10,
    humidity: Math.round(state.humidity * 10) / 10,
    soilMoisture: Math.round(state.soilMoisture * 10) / 10,
    lightIntensity: Math.round(state.lightIntensity),
    timestamp: new Date(),
    acousticData,
  };
}

// Generate simulated acoustic patterns based on plant stress
function generateAcousticPattern(stressLevel: number): number[] {
  const frequencies: number[] = [];
  
  // Healthy plants: dominated by lower frequencies (rustling, creaking)
  // Stressed plants: higher frequency noise (damage, distress signals)
  
  const healthyBase = [100, 150, 200, 250]; // Low frequency base
  const stressFreqs = [800, 1200, 1600, 2000]; // High frequency stress signals
  
  const numFreqs = 20;
  for (let i = 0; i < numFreqs; i++) {
    const t = i / numFreqs;
    const frequency = healthyBase[i % 4] * (1 - stressLevel) + stressFreqs[i % 4] * stressLevel;
    const amplitude = 1 - stressLevel * 0.3; // Stressed plants have noisier patterns
    
    frequencies.push(frequency + (Math.random() - 0.5) * 50 * stressLevel);
  }
  
  return frequencies;
}

export function waterPlant(plantId: number) {
  const state = plantStates.get(plantId);
  if (state) {
    state.soilMoisture = Math.min(90, state.soilMoisture + 40);
    state.lastWatered = new Date();
    plantStates.set(plantId, state);
  }
}

export function getPlantState(plantId: number): PlantState | undefined {
  return plantStates.get(plantId);
}

export function getAllPlantReadings(plantIds: number[]): SensorReading[] {
  return plantIds.map(id => generateSensorReading(id));
}

// Convert readings to health score (0-100)
export function calculateHealthScore(reading: SensorReading): number {
  const tempFit = 1 - Math.abs(reading.temperature - 22) / 15;
  const humidityFit = 1 - Math.abs(reading.humidity - 60) / 30;
  const moistureFit = 1 - Math.abs(reading.soilMoisture - 60) / 50;
  const lightFit = reading.lightIntensity > 100 ? 1 : reading.lightIntensity / 100;
  
  const avgFit = (tempFit + humidityFit + moistureFit + lightFit) / 4;
  return Math.max(10, Math.min(100, Math.round(avgFit * 100)));
}

// Predict stress based on acoustic patterns
export function predictAcousticStress(acousticData: number[]): number {
  if (!acousticData.length) return 0;
  
  const avgFrequency = acousticData.reduce((a, b) => a + b, 0) / acousticData.length;
  const frequencyVariance = acousticData.reduce((sum, f) => sum + Math.pow(f - avgFrequency, 2), 0) / acousticData.length;
  
  // High frequency means high stress
  const stressFromFreq = Math.min(1, avgFrequency / 1000);
  const stressFromVariance = Math.min(1, frequencyVariance / 500000);
  
  return (stressFromFreq + stressFromVariance) / 2;
}
