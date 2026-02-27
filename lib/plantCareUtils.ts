// Plant care database with watering schedules and environment preferences
export const plantCareDatabase: {
  [key: string]: {
    waterFrequencyDays: number;
    tempRange: [number, number];
    humidityRange: [number, number];
    lightRequirement: string;
    careNotes: string[];
  };
} = {
  'monstera-deliciosa': {
    waterFrequencyDays: 7,
    tempRange: [20, 27],
    humidityRange: [60, 80],
    lightRequirement: 'Bright indirect light',
    careNotes: ['Allow soil to dry between waterings', 'Wipe leaves monthly', 'Rotate monthly for even growth']
  },
  'peace-lily': {
    waterFrequencyDays: 5,
    tempRange: [18, 24],
    humidityRange: [50, 80],
    lightRequirement: 'Low to medium light',
    careNotes: ['Prefers moist soil', 'Droops when thirsty as a sign', 'Thrives in humid environments']
  },
  'snake-plant': {
    waterFrequencyDays: 21,
    tempRange: [16, 27],
    humidityRange: [30, 60],
    lightRequirement: 'Low to bright light',
    careNotes: ['Very drought tolerant', 'Water sparingly in winter', 'Can survive neglect']
  },
  'pothos': {
    waterFrequencyDays: 5,
    tempRange: [18, 29],
    humidityRange: [40, 70],
    lightRequirement: 'Low to bright indirect light',
    careNotes: ['Tolerates low light', 'Allow soil to dry slightly', 'Great for beginners']
  },
  'boston-fern': {
    waterFrequencyDays: 3,
    tempRange: [15, 22],
    humidityRange: [70, 90],
    lightRequirement: 'Bright indirect light',
    careNotes: ['Loves humidity', 'Keep soil consistently moist', 'Mist daily for best results']
  },
  'spider-plant': {
    waterFrequencyDays: 7,
    tempRange: [16, 24],
    humidityRange: [40, 60],
    lightRequirement: 'Bright, indirect light',
    careNotes: ['Very adaptable', 'Produces plantlets', 'Easy to propagate']
  },
  'fiddle-leaf-fig': {
    waterFrequencyDays: 10,
    tempRange: [18, 26],
    humidityRange: [40, 60],
    lightRequirement: 'Bright indirect light',
    careNotes: ['Sensitive to light changes', 'Dislikes being moved', 'Feed in growing season']
  },
  'rubber-plant': {
    waterFrequencyDays: 7,
    tempRange: [18, 27],
    humidityRange: [40, 70],
    lightRequirement: 'Bright indirect light',
    careNotes: ['Clean leaves regularly', 'Allow soil to dry between waterings', 'Grows fast with good light']
  },
  'philodendron': {
    waterFrequencyDays: 5,
    tempRange: [18, 27],
    humidityRange: [40, 70],
    lightRequirement: 'Low to bright indirect light',
    careNotes: ['Easy to grow', 'Climbs if given support', 'Tolerates low light']
  },
  'zz-plant': {
    waterFrequencyDays: 14,
    tempRange: [18, 27],
    humidityRange: [40, 60],
    lightRequirement: 'Low to bright light',
    careNotes: ['Very low maintenance', 'Toxic to pets', 'Glossy leaves indicate good health']
  }
};

interface Plant {
  id: number;
  name: string;
  emoji: string;
  status: 'healthy' | 'stressed' | 'critical';
  healthScore: number;
  image: string;
  musicUrl: string;
  metrics: {
    temperature: number;
    humidity: number;
    acousticPattern: string;
  };
}

// Get plant care recommendations
export function getPlantCareRecommendations(plant: Plant): {
  watering: string;
  environment: string;
  urgent: string | null;
} {
  const plantKey = plant.name.toLowerCase().replace(/\s+/g, '-');
  const care = plantCareDatabase[plantKey];

  if (!care) {
    return {
      watering: 'Check plant-specific care guides',
      environment: 'Monitor metrics regularly',
      urgent: null
    };
  }

  let urgent: string | null = null;

  // Check for critical issues
  if (plant.status === 'critical') {
    if (plant.metrics.temperature < care.tempRange[0]) {
      urgent = 'Temperature too low - move to warmer location immediately';
    } else if (plant.metrics.temperature > care.tempRange[1]) {
      urgent = 'Temperature too high - move away from heat source immediately';
    } else if (plant.metrics.humidity < care.humidityRange[0]) {
      urgent = 'Humidity too low - mist plant or increase humidity immediately';
    } else if (plant.metrics.humidity > care.humidityRange[1]) {
      urgent = 'Humidity too high - improve air circulation immediately';
    }
  }

  // Watering recommendation
  let watering = `Water every ${care.waterFrequencyDays} days`;
  if (plant.metrics.humidity > care.humidityRange[1]) {
    watering += ' (reduce frequency - humidity is high)';
  } else if (plant.metrics.humidity < care.humidityRange[0]) {
    watering += ' (keep soil evenly moist due to low humidity)';
  }

  // Environment recommendation
  let environment = '';
  if (plant.metrics.temperature < care.tempRange[0]) {
    environment += `Temperature ${plant.metrics.temperature}°C is too low (ideal: ${care.tempRange[0]}-${care.tempRange[1]}°C). `;
  } else if (plant.metrics.temperature > care.tempRange[1]) {
    environment += `Temperature ${plant.metrics.temperature}°C is too high (ideal: ${care.tempRange[0]}-${care.tempRange[1]}°C). `;
  }

  if (plant.metrics.humidity < care.humidityRange[0]) {
    environment += `Humidity ${plant.metrics.humidity}% is too low (ideal: ${care.humidityRange[0]}-${care.humidityRange[1]}%). Mist or use humidifier. `;
  } else if (plant.metrics.humidity > care.humidityRange[1]) {
    environment += `Humidity ${plant.metrics.humidity}% is high. Improve air circulation. `;
  }

  if (!environment) {
    environment = `Environment is ideal. Keep temperature between ${care.tempRange[0]}-${care.tempRange[1]}°C and humidity between ${care.humidityRange[0]}-${care.humidityRange[1]}%.`;
  }

  return { watering, environment, urgent };
}

// Predict future health based on current metrics
export function predictPlantHealth(plant: Plant): {
  prediction: 'improving' | 'stable' | 'declining';
  confidence: number;
  message: string;
} {
  const plantKey = plant.name.toLowerCase().replace(/\s+/g, '-');
  const care = plantCareDatabase[plantKey];

  if (!care) {
    return {
      prediction: 'stable',
      confidence: 0,
      message: 'Unable to predict health'
    };
  }

  let score = 0;
  let issues = 0;

  // Temperature score
  if (plant.metrics.temperature >= care.tempRange[0] && plant.metrics.temperature <= care.tempRange[1]) {
    score += 25;
  } else if (Math.abs(plant.metrics.temperature - (care.tempRange[0] + care.tempRange[1]) / 2) < 3) {
    score += 15;
  } else {
    issues++;
  }

  // Humidity score
  if (plant.metrics.humidity >= care.humidityRange[0] && plant.metrics.humidity <= care.humidityRange[1]) {
    score += 25;
  } else if (Math.abs(plant.metrics.humidity - (care.humidityRange[0] + care.humidityRange[1]) / 2) < 10) {
    score += 15;
  } else {
    issues++;
  }

  // Health score indicators
  if (plant.healthScore >= 80) {
    score += 25;
  } else if (plant.healthScore >= 60) {
    score += 15;
  } else {
    issues++;
  }

  // Acoustic pattern indicates stress
  if (plant.metrics.acousticPattern === 'Normal') {
    score += 25;
  } else if (plant.metrics.acousticPattern === 'Slight Anomaly') {
    score += 10;
    issues++;
  } else {
    issues++;
  }

  let prediction: 'improving' | 'stable' | 'declining' = 'stable';
  let confidence = Math.min(100, score);

  if (issues === 0) {
    prediction = 'improving';
    confidence = 95;
  } else if (issues >= 2) {
    prediction = 'declining';
    confidence = 85 + issues * 5;
  }

  const messages: { [key: string]: string } = {
    improving: 'Plant metrics are optimal. Health is likely to improve.',
    stable: 'Plant is stable. Continue current care routine.',
    declining: 'Plant is showing stress signs. Adjust environment and care.'
  };

  return {
    prediction,
    confidence: Math.min(100, confidence),
    message: messages[prediction]
  };
}
