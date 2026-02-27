
'use client';

import { useState, useEffect } from 'react';
import { generateSensorReading, calculateHealthScore, SensorReading } from '@/lib/iotSimulator';

interface Plant {
  id: number;
  name: string;
  emoji: string;
}

export default function RealTimeSensorDashboard({ plants }: { plants: Plant[] }) {
  const [sensorReadings, setSensorReadings] = useState<Map<number, SensorReading>>(new Map());
  const [isLiveMode, setIsLiveMode] = useState(false);

  // Simulate real-time sensor updates
  useEffect(() => {
    if (!isLiveMode) return;

    const interval = setInterval(() => {
      setSensorReadings(prev => {
        const updated = new Map(prev);
        plants.forEach(plant => {
          const reading = generateSensorReading(plant.id);
          updated.set(plant.id, reading);
        });
        return updated;
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isLiveMode, plants]);

  const getReading = (plantId: number): SensorReading | undefined => {
    return sensorReadings.get(plantId);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8 shadow-md border border-purple-200">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Real-Time Sensor Data</h2>
        <button
          onClick={() => setIsLiveMode(!isLiveMode)}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            isLiveMode
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isLiveMode ? 'Stop Live' : 'Start Live'}
        </button>
      </div>

      {isLiveMode && (
        <p className="text-sm text-gray-600 mb-6 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          Receiving real-time updates every 5 seconds
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plants.map(plant => {
          const reading = getReading(plant.id);
          const healthScore = reading ? calculateHealthScore(reading) : null;

          if (!reading) {
            return (
              <div key={plant.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{plant.emoji} {plant.name}</h3>
                  <span className="text-xs text-gray-400">No data</span>
                </div>
                <button
                  onClick={() => {
                    const reading = generateSensorReading(plant.id);
                    setSensorReadings(prev => {
                      const updated = new Map(prev);
                      updated.set(plant.id, reading);
                      return updated;
                    });
                  }}
                  className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-all text-sm"
                >
                  Generate Reading
                </button>
              </div>
            );
          }

          return (
            <div key={plant.id} className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{plant.emoji} {plant.name}</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  healthScore >= 80 ? 'bg-green-100 text-green-800' :
                  healthScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {healthScore}% Health
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Temperature</span>
                  <span className="font-semibold text-gray-900">{reading.temperature}°C</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Humidity</span>
                  <span className="font-semibold text-gray-900">{reading.humidity}%</span>
                </div>

                {reading.soilMoisture !== null && (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Soil Moisture</span>
                    <span className="font-semibold text-gray-900">{reading.soilMoisture}%</span>
                  </div>
                )}

                {reading.lightIntensity !== null && (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Light Intensity</span>
                    <span className="font-semibold text-gray-900">{reading.lightIntensity} lux</span>
                  </div>
                )}

                <div className="text-xs text-gray-500 mt-4">
                  Last update: {new Date(reading.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-3">How to Use Real Sensor Data:</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li>1. Connect IoT devices (DHT22, soil moisture sensors, etc.)</li>
          <li>2. Send POST requests to <code className="bg-white px-2 py-1 rounded">/api/sensors/ingest</code></li>
          <li>3. Data will be stored and displayed in real-time</li>
          <li>4. Use example: <code className="bg-white px-2 py-1 rounded text-xs">curl -X POST http://localhost:3000/api/sensors/ingest -H "Content-Type: application/json" -d '{"{"}plantId: 1, temperature: 22.5, humidity: 65{"}"}'</code></li>
        </ul>
      </div>
    </div>
  );
}
