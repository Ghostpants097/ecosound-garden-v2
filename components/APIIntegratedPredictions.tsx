import React, { useState, useEffect } from 'react';
import { echoSoundAPI } from '@/lib/api-client';

interface Plant {
  id: number;
  name: string;
  emoji: string;
  healthScore: number;
  metrics: {
    temperature: number;
    humidity: number;
    acousticPattern: string;
  };
}

export default function APIIntegratedPredictions({ plants }: { plants: Plant[] }) {
  const [predictions, setPredictions] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState(false);

  useEffect(() => {
    const initializeAPIPredictions = async () => {
      try {
        // Check API health
        console.log('[v0] Checking API connection...');
        const isConnected = await echoSoundAPI.healthCheck();
        setApiConnected(isConnected);

        if (isConnected) {
          console.log('[v0] API connected, fetching predictions...');
          
          // Prepare batch prediction data
          const batchData = plants.map(plant => ({
            plant_id: plant.id,
            plant_name: plant.name,
            sensor_data: {
              temperature: plant.metrics.temperature,
              humidity: plant.metrics.humidity,
              lightLevel: 500,
              soilMoisture: 50,
              phLevel: 6.5,
              ecLevel: 1.2
            }
          }));

          // Get batch predictions from API
          const response = await echoSoundAPI.batchPredict(batchData);
          
          const newPredictions: any = {};
          response.predictions.forEach((pred: any) => {
            newPredictions[pred.plant_id] = pred;
          });
          
          setPredictions(newPredictions);
          console.log('[v0] Received predictions from API');
        } else {
          setError('API server not available. Please ensure the FastAPI backend is running.');
          console.log('[v0] API not connected, please start the backend server');
        }
      } catch (err) {
        console.error('[v0] API initialization error:', err);
        setError(`Failed to connect to API: ${err}`);
      } finally {
        setLoading(false);
      }
    };

    initializeAPIPredictions();
  }, [plants]);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-8 shadow-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Connecting to ML API...</p>
        </div>
      </div>
    );
  }

  if (error && !apiConnected) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-8 shadow-md border border-red-300">
        <h2 className="text-2xl font-bold text-red-900 mb-4">API Connection Error</h2>
        <p className="text-red-800 mb-4">{error}</p>
        <div className="bg-red-100 p-4 rounded-lg mb-4 text-sm text-red-900">
          <p className="font-semibold mb-2">To start the API backend:</p>
          <code className="block bg-white p-2 rounded border border-red-300 mb-2">
            cd backend && python main.py
          </code>
          <p>The API should be available at <code className="bg-white px-2">http://localhost:8000</code></p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-8 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Real-Time ML Predictions (API-Powered)</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${apiConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`text-sm font-semibold ${apiConnected ? 'text-green-600' : 'text-red-600'}`}>
            {apiConnected ? 'API Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plants.map(plant => {
          const pred = predictions[plant.id];
          if (!pred) return null;

          return (
            <div key={plant.id} className="bg-white rounded-lg p-6 shadow-md border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{plant.emoji} {plant.name}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  pred.status === 'healthy' ? 'bg-green-100 text-green-800' :
                  pred.status === 'stressed' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {pred.status}
                </span>
              </div>

              <div className="space-y-3">
                {/* Health Score */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-semibold">API Health Score</span>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-blue-600">{pred.health_score}%</span>
                    <span className="text-xs text-gray-500">({pred.confidence}% confidence)</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      pred.status === 'healthy' ? 'bg-green-500' :
                      pred.status === 'stressed' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${pred.health_score}%` }}
                  />
                </div>

                {/* Sensor Data */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                  <div className="text-sm">
                    <p className="text-gray-500">Temperature</p>
                    <p className="font-semibold">{plant.metrics.temperature}°C</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-500">Humidity</p>
                    <p className="font-semibold">{plant.metrics.humidity}%</p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {pred.recommendations && pred.recommendations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">API Recommendations:</h4>
                  <ul className="space-y-1">
                    {pred.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* API Status Panel */}
      <div className="mt-8 bg-white rounded-lg p-4 border border-gray-300">
        <h3 className="font-semibold text-gray-900 mb-3">API Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Total Predictions</p>
            <p className="text-2xl font-bold text-blue-600">{Object.keys(predictions).length}/{plants.length}</p>
          </div>
          <div>
            <p className="text-gray-500">Average Health</p>
            <p className="text-2xl font-bold text-green-600">
              {predictions && Object.keys(predictions).length > 0
                ? Math.round(Object.values(predictions).reduce((sum: any, p: any) => sum + p.health_score, 0) / Object.keys(predictions).length)
                : 0}%
            </p>
          </div>
          <div>
            <p className="text-gray-500">API Endpoint</p>
            <p className="text-sm font-mono text-gray-700">localhost:8000</p>
          </div>
        </div>
      </div>
    </div>
  );
}
