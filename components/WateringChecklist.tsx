'use client';

import { useState } from 'react';

interface Plant {
  id: number;
  name: string;
  emoji: string;
  status: 'healthy' | 'stressed' | 'critical';
  healthScore: number;
  metrics: {
    humidity: number;
  };
}

interface ChecklistItem {
  plantId: number;
  completed: boolean;
  lastWatered?: string;
}

export default function WateringChecklist({ plants }: { plants: Plant[] }) {
  const [checklist, setChecklist] = useState<{ [key: number]: ChecklistItem }>({});

  const togglePlant = (plantId: number) => {
    setChecklist(prev => ({
      ...prev,
      [plantId]: {
        plantId,
        completed: !prev[plantId]?.completed,
        lastWatered: !prev[plantId]?.completed ? new Date().toLocaleDateString() : prev[plantId]?.lastWatered
      }
    }));
  };

  const wateringNeeds = plants.map(plant => ({
    ...plant,
    needsWater: plant.metrics.humidity < 50,
    isCompleted: checklist[plant.id]?.completed || false
  })).sort((a, b) => {
    if (a.needsWater !== b.needsWater) return b.needsWater ? 1 : -1;
    return a.name.localeCompare(b.name);
  });

  const completedCount = wateringNeeds.filter(p => p.isCompleted).length;
  const urgentCount = wateringNeeds.filter(p => p.needsWater && !p.isCompleted).length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Daily Watering Checklist</h2>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all" 
              style={{ width: `${wateringNeeds.length > 0 ? (completedCount / wateringNeeds.length) * 100 : 0}%` }}
            />
          </div>
        </div>
        <span className="text-lg font-semibold text-gray-700">
          {completedCount}/{wateringNeeds.length} Complete
        </span>
      </div>

      {urgentCount > 0 && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <p className="text-yellow-800 font-semibold">
            {urgentCount} plant{urgentCount > 1 ? 's' : ''} need{urgentCount > 1 ? '' : 's'} water urgently
          </p>
        </div>
      )}

      <div className="space-y-3">
        {wateringNeeds.map(plant => (
          <div
            key={plant.id}
            onClick={() => togglePlant(plant.id)}
            className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all ${
              plant.isCompleted
                ? 'bg-gray-100 opacity-60'
                : plant.needsWater
                  ? 'bg-yellow-50 border-2 border-yellow-300'
                  : 'bg-blue-50 border-2 border-blue-300'
            }`}
          >
            <input
              type="checkbox"
              checked={plant.isCompleted}
              onChange={() => {}}
              className="w-6 h-6 text-green-600 rounded cursor-pointer"
            />
            <span className="text-2xl">{plant.emoji}</span>
            <div className="flex-1">
              <p className={`font-semibold ${plant.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {plant.name}
              </p>
              <p className="text-sm text-gray-600">
                Humidity: {plant.metrics.humidity}% 
                {plant.needsWater && ' - Needs water urgently'}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              plant.needsWater 
                ? 'bg-red-100 text-red-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {plant.needsWater ? 'Urgent' : 'Good'}
            </div>
          </div>
        ))}
      </div>

      {completedCount === wateringNeeds.length && wateringNeeds.length > 0 && (
        <div className="mt-6 bg-green-50 border-l-4 border-green-400 p-4 rounded">
          <p className="text-green-800 font-semibold">All done! Your plants are watered.</p>
        </div>
      )}
    </div>
  );
}
