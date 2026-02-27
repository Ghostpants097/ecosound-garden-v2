'use client';

import Image from 'next/image';

interface Plant {
  id: number;
  name: string;
  emoji: string;
  status: 'healthy' | 'stressed' | 'critical';
  healthScore: number;
  image: string;
  metrics: {
    temperature: number;
    humidity: number;
    acousticPattern: string;
  };
}

interface PlantDetailModalProps {
  plant: Plant | null;
  onClose: () => void;
}

const careTips: { [key: string]: { tips: string[]; watering: string; light: string } } = {
  'Monstera Deliciosa': {
    tips: [
      'Allow soil to dry between waterings',
      'Loves bright, indirect light',
      'Easy to propagate from cuttings',
      'Can grow quite large indoors'
    ],
    watering: 'Every 1-2 weeks',
    light: 'Bright, indirect light'
  },
  'Peace Lily': {
    tips: [
      'Prefers consistently moist soil',
      'Tolerates low light conditions',
      'Will wilt when thirsty as a signal',
      'Great air purifier'
    ],
    watering: 'Keep soil moist',
    light: 'Low to medium light'
  },
  'Snake Plant': {
    tips: [
      'Drought tolerant - let soil dry completely',
      'Prefers bright, indirect light',
      'Very low maintenance',
      'Toxic to pets if ingested'
    ],
    watering: 'Every 2-3 weeks',
    light: 'Bright, indirect light'
  },
  'Pothos': {
    tips: [
      'Allow soil to dry between waterings',
      'Can climb or trail depending on support',
      'Very forgiving and easy to grow',
      'Popular for beginners'
    ],
    watering: 'Every 1-2 weeks',
    light: 'Medium to bright, indirect light'
  },
  'Boston Fern': {
    tips: [
      'Keep soil consistently moist',
      'Prefers humidity and indirect light',
      'Mist regularly to maintain humidity',
      'Avoid cold drafts'
    ],
    watering: 'Keep soil moist',
    light: 'Bright, indirect light'
  },
  'Spider Plant': {
    tips: [
      'Very adaptable and forgiving',
      'Prefers evenly moist soil',
      'Produces "baby" plantlets naturally',
      'Great for hanging baskets'
    ],
    watering: 'Keep soil moist',
    light: 'Bright, indirect light'
  },
  'Fiddle Leaf Fig': {
    tips: [
      'Needs bright, indirect light',
      'Let soil dry between waterings',
      'Slow to adjust to new environments',
      'Can become tall and impressive'
    ],
    watering: 'Every 1-2 weeks',
    light: 'Bright, indirect light'
  },
  'Rubber Plant': {
    tips: [
      'Prefers bright, indirect light',
      'Water when soil feels dry',
      'Glossy leaves benefit from occasional wiping',
      'Can grow quite large'
    ],
    watering: 'Every 1-2 weeks',
    light: 'Bright, indirect light'
  },
  'Philodendron': {
    tips: [
      'Low maintenance and adaptable',
      'Allow soil to dry between waterings',
      'Can climb with proper support',
      'Easy to propagate'
    ],
    watering: 'Every 1-2 weeks',
    light: 'Medium to bright, indirect light'
  },
  'ZZ Plant': {
    tips: [
      'Very drought tolerant',
      'Tolerates low light conditions',
      'Slow growing but rewarding',
      'Excellent for offices'
    ],
    watering: 'Every 2-3 weeks',
    light: 'Low to medium light'
  }
};

export default function PlantDetailModal({ plant, onClose }: PlantDetailModalProps) {
  if (!plant) return null;

  const care = careTips[plant.name] || {
    tips: ['No specific care tips available'],
    watering: 'Water regularly',
    light: 'Indirect light'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'stressed': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-green-700 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{plant.emoji} {plant.name}</h2>
          <button onClick={onClose} className="text-2xl hover:opacity-70">✕</button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <Image
                src={plant.image}
                alt={plant.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-semibold">Status:</span>
                <span className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(plant.status)}`}>
                  {plant.status.charAt(0).toUpperCase() + plant.status.slice(1)}
                </span>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Health Score</p>
                <p className="text-3xl font-bold text-green-600">{plant.healthScore}%</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Temperature</p>
                  <p className="text-lg font-bold text-blue-600">{plant.metrics.temperature}°C</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Humidity</p>
                  <p className="text-lg font-bold text-purple-600">{plant.metrics.humidity}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Care Tips */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Plant Care Guide</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 font-semibold mb-1">Watering Schedule</p>
                <p className="text-lg font-bold text-green-700">{care.watering}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 font-semibold mb-1">Light Requirements</p>
                <p className="text-lg font-bold text-yellow-700">{care.light}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 font-semibold mb-3">Care Tips</p>
              <ul className="space-y-2">
                {care.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
