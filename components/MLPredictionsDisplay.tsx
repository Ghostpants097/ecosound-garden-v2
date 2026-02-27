'use client';

import { useMLPredictions } from '@/hooks/useMLPredictions';
import { Plant } from '@/lib/apiClient';

interface Props {
  plants: Plant[];
}

export default function MLPredictionsDisplay({ plants }: Props) {
  const { predictions, loading, error, apiAvailable } = useMLPredictions(plants);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-8 shadow-md border border-indigo-200">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900">ML Health Predictions</h2>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${apiAvailable ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <span className="text-sm font-semibold text-gray-600">
            {apiAvailable ? 'Backend API' : 'Browser Models'}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            <strong>Notice:</strong> {error}. Using fallback predictions.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {predictions.map(pred => {
          const plant = plants.find(p => p.id === pred.plantId);
          if (!plant) return null;

          const trendColor =
            pred.trend === 'improving'
              ? 'text-green-600'
              : pred.trend === 'declining'
                ? 'text-red-600'
                : 'text-yellow-600';

          const trendIcon =
            pred.trend === 'improving'
              ? '📈'
              : pred.trend === 'declining'
                ? '📉'
                : '→';

          return (
            <div
              key={pred.plantId}
              className="bg-white rounded-lg p-6 shadow-md border-l-4 border-indigo-500 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {plant.emoji} {plant.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Current: {plant.healthScore}%
                  </p>
                </div>
                <span className="text-2xl">{trendIcon}</span>
              </div>

              {/* Predicted Health */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">Predicted Health</span>
                  <span className="text-sm text-gray-600">{pred.predictedHealth}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      pred.predictedHealth >= 80
                        ? 'bg-green-500'
                        : pred.predictedHealth >= 50
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${pred.predictedHealth}%` }}
                  ></div>
                </div>
              </div>

              {/* Trend */}
              <div className="mb-4 flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Trend:</span>
                <span className={`text-sm font-bold capitalize ${trendColor}`}>
                  {pred.trend}
                </span>
              </div>

              {/* Confidence */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-gray-700 uppercase">
                    Confidence
                  </span>
                  <span className="text-xs text-gray-600">
                    {Math.round(pred.confidence * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-indigo-500"
                    style={{ width: `${pred.confidence * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Acoustic Stress (if available) */}
              {pred.acousticStress !== undefined && (
                <div className="mb-4 bg-indigo-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-indigo-700 mb-1">Acoustic Stress</p>
                  <p className="text-sm text-indigo-600">
                    {(pred.acousticStress * 100).toFixed(1)}%
                  </p>
                </div>
              )}

              {/* Recommendations */}
              {pred.recommendations.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-blue-700 mb-2">Recommendations</p>
                  <ul className="text-xs text-blue-600 space-y-1">
                    {pred.recommendations.slice(0, 2).map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-indigo-50 rounded-lg p-4 border border-indigo-200">
        <p className="text-xs text-indigo-700">
          <strong>ML Predictions:</strong> This dashboard uses machine learning models to predict
          plant health based on environmental metrics. Predictions update automatically every 5
          minutes.
          {apiAvailable
            ? ' Running on backend API for production-grade predictions.'
            : ' Currently using TensorFlow.js browser models as fallback.'}
        </p>
      </div>
    </div>
  );
}
