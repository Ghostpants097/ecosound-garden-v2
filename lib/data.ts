export const plantData = [
  {
    id: 1,
    name: 'Monstera Deliciosa',
    emoji: '🌿',
    status: 'healthy' as const,
    healthScore: 92,
    image: '/plants/monstera-cctv.jpg',
    musicUrl: 'plant-sound:monstera',
    metrics: {
      temperature: 24,
      humidity: 65,
      acousticPattern: 'Normal'
    }
  },
  {
    id: 2,
    name: 'Peace Lily',
    emoji: '🌱',
    status: 'stressed' as const,
    healthScore: 67,
    image: '/plants/peace-lily-cctv.jpg',
    musicUrl: 'plant-sound:peace-lily',
    metrics: {
      temperature: 22,
      humidity: 45,
      acousticPattern: 'Anomaly'
    }
  },
  {
    id: 3,
    name: 'Snake Plant',
    emoji: '🌿',
    status: 'critical' as const,
    healthScore: 34,
    image: '/plants/snake-plant-cctv.jpg',
    musicUrl: 'plant-sound:snake-plant',
    metrics: {
      temperature: 28,
      humidity: 30,
      acousticPattern: 'High Stress'
    }
  },
  {
    id: 4,
    name: 'Pothos',
    emoji: '🌿',
    status: 'healthy' as const,
    healthScore: 88,
    image: '/plants/pothos-cctv.jpg',
    musicUrl: 'plant-sound:pothos',
    metrics: {
      temperature: 23,
      humidity: 60,
      acousticPattern: 'Normal'
    }
  },
  {
    id: 5,
    name: 'Boston Fern',
    emoji: '🌱',
    status: 'healthy' as const,
    healthScore: 85,
    image: '/plants/boston-fern-cctv.jpg',
    musicUrl: 'plant-sound:boston-fern',
    metrics: {
      temperature: 21,
      humidity: 70,
      acousticPattern: 'Normal'
    }
  },
  {
    id: 6,
    name: 'Spider Plant',
    emoji: '🌿',
    status: 'healthy' as const,
    healthScore: 90,
    image: '/plants/spider-plant-cctv.jpg',
    musicUrl: 'plant-sound:spider-plant',
    metrics: {
      temperature: 22,
      humidity: 55,
      acousticPattern: 'Normal'
    }
  },
  {
    id: 7,
    name: 'Fiddle Leaf Fig',
    emoji: '🌳',
    status: 'healthy' as const,
    healthScore: 89,
    image: '/plants/fiddle-leaf-fig-cctv.jpg',
    musicUrl: 'plant-sound:fiddle-leaf-fig',
    metrics: {
      temperature: 25,
      humidity: 60,
      acousticPattern: 'Normal'
    }
  },
  {
    id: 8,
    name: 'Rubber Plant',
    emoji: '🌿',
    status: 'healthy' as const,
    healthScore: 91,
    image: '/plants/rubber-plant-cctv.jpg',
    musicUrl: 'plant-sound:rubber-plant',
    metrics: {
      temperature: 23,
      humidity: 50,
      acousticPattern: 'Normal'
    }
  },
  {
    id: 9,
    name: 'Philodendron',
    emoji: '🌱',
    status: 'stressed' as const,
    healthScore: 72,
    image: '/plants/philodendron-cctv.jpg',
    musicUrl: 'plant-sound:philodendron',
    metrics: {
      temperature: 24,
      humidity: 55,
      acousticPattern: 'Slight Anomaly'
    }
  },
  {
    id: 10,
    name: 'ZZ Plant',
    emoji: '🌿',
    status: 'healthy' as const,
    healthScore: 87,
    image: '/plants/zz-plant-cctv.jpg',
    musicUrl: 'plant-sound:zz-plant',
    metrics: {
      temperature: 22,
      humidity: 45,
      acousticPattern: 'Normal'
    }
  },
];

export const acousticChartData = {
  timeLabels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
  stressLevels: [0.23, 0.31, 0.45, 0.62, 0.58, 0.44, 0.28],
  noiseLevels: [0.15, 0.18, 0.25, 0.40, 0.35, 0.22, 0.16]
};

export const alertsData = [
  {
    id: 1,
    type: 'warning' as const,
    icon: '⚠️',
    title: 'Water Stress Detected',
    message: 'Peace Lily showing acoustic anomalies indicating drought stress. Recommend immediate watering.'
  },
  {
    id: 2,
    type: 'info' as const,
    icon: '💡',
    title: 'ML Model Update',
    message: 'Plant health prediction accuracy improved to 89.3% with latest environmental data integration.'
  },
  {
    id: 3,
    type: 'warning' as const,
    icon: '🌡️',
    title: 'Temperature Alert',
    message: 'Snake Plant experiencing heat stress. Environmental conditions exceed optimal range.'
  },
];

export const getStats = (plants: typeof plantData) => {
  return {
    healthy: plants.filter(p => p.status === 'healthy').length,
    stressed: plants.filter(p => p.status === 'stressed').length,
    critical: plants.filter(p => p.status === 'critical').length,
    dataHours: 847
  };
};
