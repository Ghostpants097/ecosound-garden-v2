'use client';

import { useState } from 'react';

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

export default function PlantComparison({ plants }: { plants: Plant[] }) {
  const [selected, setSelected] = useState<number[]>([plants[0]?.id, plants[1]?.id].filter(Boolean));

  const selectedPlants = plants.filter(p => selected.includes(p.id));

  return (
    <div id="comparison" className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Plant Comparison</h2>

      {/* Plant Selection */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Select Plants to Compare</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {plants.map(plant => (
            <button
              key={plant.id}
              onClick={() => {
                if (selected.includes(plant.id)) {
                  setSelected(selected.filter(id => id !== plant.id));
                } else if (selected.length < 4) {
                  setSelected([...selected, plant.id]);
                }
              }}
              className={`p-3 rounded-lg border-2 transition-all ${
                selected.includes(plant.id)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{plant.emoji}</div>
              <div className="text-sm font-medium">{plant.name.split(' ')[0]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      {selectedPlants.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="p-4 text-left font-semibold text-gray-900">Metric</th>
                {selectedPlants.map(plant => (
                  <th key={plant.id} className="p-4 text-center font-semibold text-gray-900">
                    {plant.emoji} {plant.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-4 font-semibold text-gray-900">Health Score</td>
                {selectedPlants.map(plant => (
                  <td key={plant.id} className="p-4 text-center">
                    <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-900 font-bold">
                      {plant.healthScore}%
                    </div>
                  </td>
                ))}
              </tr>

              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-4 font-semibold text-gray-900">Status</td>
                {selectedPlants.map(plant => (
                  <td key={plant.id} className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      plant.status === 'healthy'
                        ? 'bg-green-100 text-green-800'
                        : plant.status === 'stressed'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {plant.status.toUpperCase()}
                    </span>
                  </td>
                ))}
              </tr>

              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-4 font-semibold text-gray-900">Temperature</td>
                {selectedPlants.map(plant => (
                  <td key={plant.id} className="p-4 text-center text-gray-700">
                    {plant.metrics.temperature}°C
                  </td>
                ))}
              </tr>

              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-4 font-semibold text-gray-900">Humidity</td>
                {selectedPlants.map(plant => (
                  <td key={plant.id} className="p-4 text-center text-gray-700">
                    {plant.metrics.humidity}%
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="p-4 font-semibold text-gray-900">Acoustic Pattern</td>
                {selectedPlants.map(plant => (
                  <td key={plant.id} className="p-4 text-center text-gray-700">
                    {plant.metrics.acousticPattern}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {selectedPlants.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Select at least one plant to compare</p>
        </div>
      )}
    </div>
  );
}
