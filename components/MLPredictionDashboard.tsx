import React, { useState, useEffect } from 'react';
import { PlantHealthTFJS, AcousticStressTFJS } from '@/lib/tfjs-plant-model';

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

export default function MLPredictionDashboard({ plants }: { plants: Plant[] }) {
  const [healthModel, setHealthModel] = useState<PlantHealthTFJS | null>(null);
  const [acousticModel, setAcousticModel] = useState<AcousticStressTFJS | null>(null);
  const [predictions, setPredictions] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeModels = async () => {
      try {
        console.log('[v0] Initializing ML models...');
        
        const health = new PlantHealthTFJS();
        const acoustic = new AcousticStressTFJS();
        
        await health.initialize();
        await acoustic.initialize();
        
        setHealthModel(health);
        setAcousticModel(acoustic);
        
        // Run predictions
        const newPredictions: any = {};
        plants.forEach(plant => {
          const pred = health.predictHealth({
            temperature: plant.metrics.temperature,
            humidity: plant.metrics.humidity,
            lightLevel: 500,
            soilMoisture: 50,
            phLevel: 6.5,
            ecLevel: 1.2
          });
          
          newPredictions[plant.id] = pred;
        });
        
        setPredictions(newPredictions);
        setLoading(false);
      } catch (error) {
        console.error('[v0] Model initialization error:', error);
        setLoading(false);
      }
    };
    
    initializeModels();
  }, [plants]);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8 shadow-md">
        <p className="text-center text-gray-600">Initializing ML models...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8 shadow-md">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">ML-Powered Health Predictions</h2>
      
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
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">ML Health Score</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-purple-600">{pred.healthScore}%</span>
                    <span className="text-xs text-gray-500">({pred.confidence}% confidence)</span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      pred.status === 'healthy' ? 'bg-green-500' :
                      pred.status === 'stressed' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${pred.healthScore}%` }}
                  />
                </div>
              </div>
              
              {pred.recommendations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">AI Recommendations:</h4>
                  <ul className="space-y-1">
                    {pred.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-700">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
