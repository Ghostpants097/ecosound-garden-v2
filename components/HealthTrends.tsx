'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Plant {
  id: number;
  name: string;
  healthScore: number;
}

export default function HealthTrends({ plants }: { plants: Plant[] }) {
  // Generate simulated historical data
  const generateHistoricalData = () => {
    const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
    return days.map((day, idx) => {
      const data: any = { day };
      plants.forEach(plant => {
        const variation = Math.sin(idx * 0.5 + plant.id) * 10;
        data[plant.name] = Math.max(20, Math.min(100, plant.healthScore - 5 + variation + idx * 2));
      });
      return data;
    });
  };

  const historicalData = generateHistoricalData();

  // Colors for each plant
  const colors = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4', '#14b8a6', '#6366f1'];

  return (
    <div className="bg-white rounded-xl p-8 shadow-md">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Plant Health Trends (7-Day)</h3>

      {/* Line Chart */}
      <div className="mb-8 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis domain={[0, 100]} label={{ value: 'Health Score (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => `${Math.round(value as number)}%`} />
            <Legend />
            {plants.map((plant, idx) => (
              <Line
                key={plant.id}
                type="monotone"
                dataKey={plant.name}
                stroke={colors[idx % colors.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Plant Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plants.map((plant, idx) => {
          const historicalScores = historicalData.map(d => d[plant.name]);
          const avgScore = Math.round(historicalScores.reduce((a, b) => a + b, 0) / historicalScores.length);
          const trend = historicalScores[6] - historicalScores[0];
          const isImproving = trend > 0;

          return (
            <div key={plant.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border-l-4" style={{ borderColor: colors[idx % colors.length] }}>
              <h4 className="font-semibold text-gray-900 mb-2">{plant.name}</h4>
              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-600">Avg Score</p>
                  <p className="text-2xl font-bold text-gray-900">{avgScore}%</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${isImproving ? 'text-green-600' : 'text-red-600'}`}>
                    {isImproving ? '↑' : '↓'} {Math.abs(Math.round(trend))}%
                  </p>
                  <p className="text-xs text-gray-600">7-day trend</p>
                </div>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    avgScore >= 80 ? 'bg-green-500' :
                    avgScore >= 60 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${avgScore}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
