'use client';

import { useState, useEffect } from 'react';
import { getPlantCareRecommendations, predictPlantHealth } from '@/lib/plantCareUtils';

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

export default function PlantCareDashboard({ plants }: { plants: Plant[] }) {
  // Count plant statuses - ensure same calculation server and client
  let urgentCount = 0;
  let healthyCount = 0;
  
  plants.forEach(p => {
    if (p.status === 'critical' || p.status === 'stressed') {
      urgentCount++;
    } else if (p.status === 'healthy') {
      healthyCount++;
    }
  });

  const urgentPlants = plants.filter(p => p.status === 'critical' || p.status === 'stressed');
  const healthyPlants = plants.filter(p => p.status === 'healthy');

  // Calculate care metrics with explicit values to avoid hydration mismatch
  const totalCareItems = (urgentCount * 3) + healthyCount;
  const completedToday = Math.ceil((totalCareItems * 65) / 100);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-8 shadow-md border border-green-200">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Plant Care Dashboard</h2>

      {/* Care Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
          <div className="text-sm text-gray-600 mb-2">Total Plants</div>
          <div className="text-4xl font-bold text-green-600">{plants.length}</div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-red-500">
          <div className="text-sm text-gray-600 mb-2">Urgent Care</div>
          <div className="text-4xl font-bold text-red-600">{urgentPlants.length}</div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-yellow-500">
          <div className="text-sm text-gray-600 mb-2">Avg Health Score</div>
          <div className="text-4xl font-bold text-yellow-600">
            {Math.round(plants.reduce((sum, p) => sum + p.healthScore, 0) / plants.length)}%
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
          <div className="text-sm text-gray-600 mb-2">Care Tasks Today</div>
          <div className="text-4xl font-bold text-blue-600">{completedToday}/{totalCareItems}</div>
        </div>
      </div>

      {/* Urgent Plant Care */}
      {urgentPlants.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-red-700 mb-4">Urgent Plant Care</h3>
          <div className="space-y-4">
            {urgentPlants.map(plant => {
              const care = getPlantCareRecommendations(plant);
              const prediction = predictPlantHealth(plant);

              return (
                <div key={plant.id} className="bg-white rounded-lg p-6 border-l-4 border-red-500 shadow-md">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{plant.emoji} {plant.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Health Score: <span className="font-bold text-red-600">{plant.healthScore}%</span>
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      plant.status === 'critical' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {plant.status}
                    </span>
                  </div>

                  {care.urgent && (
                    <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-4">
                      <p className="text-red-800 font-semibold">⚠️ {care.urgent}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-2">Watering</h5>
                      <p className="text-gray-700">{care.watering}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-2">Environment</h5>
                      <p className="text-gray-700">{care.environment}</p>
                    </div>
                  </div>

                  <div className="mt-4 bg-blue-50 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-2">Health Prediction</h5>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">{prediction.message}</span>
                      <div className="text-right">
                        <span className={`text-sm font-bold ${
                          prediction.prediction === 'improving' ? 'text-green-600' :
                          prediction.prediction === 'declining' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {prediction.prediction.toUpperCase()}
                        </span>
                        <p className="text-xs text-gray-500">{prediction.confidence}% confidence</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Maintenance Tips for Healthy Plants */}
      {healthyPlants.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-green-700 mb-4">Maintenance Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthyPlants.slice(0, 4).map(plant => {
              const care = getPlantCareRecommendations(plant);

              return (
                <div key={plant.id} className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
                  <h4 className="font-semibold text-gray-900 mb-2">{plant.emoji} {plant.name}</h4>
                  <p className="text-sm text-gray-700 mb-2"><strong>Watering:</strong> {care.watering}</p>
                  <p className="text-sm text-gray-700">
                    <strong>Temperature:</strong> {plant.metrics.temperature}°C
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
