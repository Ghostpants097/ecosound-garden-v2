'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

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

const COLORS = ['#22c55e', '#eab308', '#ef4444'];

export default function UnifiedDashboard({ plants }: { plants: Plant[] }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'care'>('overview');

  const healthyCount = plants.filter(p => p.status === 'healthy').length;
  const stressedCount = plants.filter(p => p.status === 'stressed').length;
  const criticalCount = plants.filter(p => p.status === 'critical').length;
  const avgHealth = Math.round(plants.reduce((sum, p) => sum + p.healthScore, 0) / plants.length);

  // Health trends simulation (7 days)
  const trendData = Array.from({ length: 7 }, (_, i) => ({
    day: `Day ${i + 1}`,
    averageHealth: Math.max(50, avgHealth - Math.random() * 10),
    minHealth: Math.max(20, avgHealth - Math.random() * 20),
    maxHealth: Math.min(100, avgHealth + Math.random() * 10),
  }));

  // Status distribution
  const statusData = [
    { name: 'Healthy', value: healthyCount },
    { name: 'Stressed', value: stressedCount },
    { name: 'Critical', value: criticalCount },
  ];

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 shadow-md border border-green-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Garden Overview</h2>
        <div className="flex gap-2">
          {(['overview', 'trends', 'care'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
              <div className="text-sm text-gray-600 mb-2">Healthy Plants</div>
              <div className="text-4xl font-bold text-green-600">{healthyCount}</div>
              <p className="text-xs text-gray-500 mt-2">{Math.round((healthyCount/plants.length)*100)}% of total</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-yellow-500">
              <div className="text-sm text-gray-600 mb-2">Stressed Plants</div>
              <div className="text-4xl font-bold text-yellow-600">{stressedCount}</div>
              <p className="text-xs text-gray-500 mt-2">Need attention</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-red-500">
              <div className="text-sm text-gray-600 mb-2">Critical Plants</div>
              <div className="text-4xl font-bold text-red-600">{criticalCount}</div>
              <p className="text-xs text-gray-500 mt-2">Urgent action needed</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
              <div className="text-sm text-gray-600 mb-2">Avg Health Score</div>
              <div className="text-4xl font-bold text-blue-600">{avgHealth}%</div>
              <p className="text-xs text-gray-500 mt-2">Garden average</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Plant Status Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Health Scores Bar Chart */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Individual Plant Health</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={plants}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="healthScore" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Health Score Trends (7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="averageHealth" stroke="#22c55e" strokeWidth={2} name="Average Health" />
                <Line type="monotone" dataKey="maxHealth" stroke="#3b82f6" strokeWidth={2} name="Highest Score" />
                <Line type="monotone" dataKey="minHealth" stroke="#ef4444" strokeWidth={2} name="Lowest Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="font-semibold text-green-900 mb-2">Improving</h4>
              <p className="text-sm text-green-700">+2 plants improving this week</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h4 className="font-semibold text-yellow-900 mb-2">Stable</h4>
              <p className="text-sm text-yellow-700">+{plants.length - 2} plants stable</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h4 className="font-semibold text-red-900 mb-2">Declining</h4>
              <p className="text-sm text-red-700">Monitor for issues</p>
            </div>
          </div>
        </div>
      )}

      {/* Care Tab */}
      {activeTab === 'care' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h4 className="font-semibold text-gray-900 mb-4">Daily Care Tasks</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  Water stressed plants
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  Check humidity levels
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  Monitor temperatures
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  Check soil moisture
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h4 className="font-semibold text-gray-900 mb-4">Environment Status</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Temperature</span>
                  <span className="font-semibold">{Math.round(plants.reduce((sum, p) => sum + p.metrics.temperature, 0) / plants.length)}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Humidity</span>
                  <span className="font-semibold">{Math.round(plants.reduce((sum, p) => sum + p.metrics.humidity, 0) / plants.length)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Optimal Range</span>
                  <span className="font-semibold">20-25°C, 50-70%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h4 className="font-semibold text-gray-900 mb-4">Urgent Actions</h4>
              <ul className="space-y-2 text-sm">
                {plants.filter(p => p.status !== 'healthy').map(plant => (
                  <li key={plant.id} className="text-red-700 font-medium">
                    {plant.emoji} {plant.name} - {plant.status.toUpperCase()}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
