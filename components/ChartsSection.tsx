'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { acousticChartData } from '@/lib/data';

interface Plant {
  id: number;
  name: string;
  healthScore: number;
}

export default function ChartsSection({ plants }: { plants: Plant[] }) {
  const averageHealthScore = Math.round(
    plants.reduce((sum, p) => sum + p.healthScore, 0) / plants.length
  );

  const chartData = acousticChartData.timeLabels.map((time, idx) => ({
    time,
    stressLevel: acousticChartData.stressLevels[idx],
    noiseLevel: acousticChartData.noiseLevels[idx]
  }));

  const healthColor = averageHealthScore >= 80
    ? '#22c55e'
    : averageHealthScore >= 60
      ? '#eab308'
      : '#ef4444';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-2xl font-bold text-green-700 mb-6">Real-time Acoustic Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="stressLevel" 
              stroke="#4a7c59" 
              strokeWidth={2}
              name="Acoustic Stress Level"
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="noiseLevel" 
              stroke="#ffc107" 
              strokeWidth={2}
              name="Environmental Noise"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-2xl font-bold text-green-700 mb-6">Overall Health</h3>
        <div className="flex flex-col items-center justify-center h-80">
          <div className="relative w-48 h-48">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 200 200"
            >
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="20"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke={healthColor}
                strokeWidth="20"
                strokeDasharray={`${(averageHealthScore / 100) * 565} 565`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-green-700">
                {averageHealthScore}%
              </span>
              <span className="text-sm text-gray-500 mt-2">Health Score</span>
            </div>
          </div>
          <p className="text-center text-gray-600 mt-4 text-sm">
            Average plant health across {plants.length} plants
          </p>
        </div>
      </div>
    </div>
  );
}
