'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Plant {
  id: number;
  name: string;
  status: 'healthy' | 'stressed' | 'critical';
  healthScore: number;
  metrics: {
    temperature: number;
    humidity: number;
    acousticPattern: string;
  };
}

export default function AnalyticsDashboard({ plants }: { plants: Plant[] }) {
  const stats = {
    totalPlants: plants.length,
    healthy: plants.filter(p => p.status === 'healthy').length,
    stressed: plants.filter(p => p.status === 'stressed').length,
    critical: plants.filter(p => p.status === 'critical').length,
    avgHealth: Math.round(plants.reduce((sum, p) => sum + p.healthScore, 0) / plants.length),
    avgTemp: Math.round((plants.reduce((sum, p) => sum + p.metrics.temperature, 0) / plants.length) * 10) / 10,
    avgHumidity: Math.round(plants.reduce((sum, p) => sum + p.metrics.humidity, 0) / plants.length),
  };

  const statusDistribution = [
    { name: 'Healthy', value: stats.healthy, fill: '#22c55e' },
    { name: 'Stressed', value: stats.stressed, fill: '#eab308' },
    { name: 'Critical', value: stats.critical, fill: '#ef4444' },
  ];

  const healthScores = plants.map(p => ({
    name: p.name.substring(0, 10),
    health: p.healthScore,
    status: p.status
  })).sort((a, b) => b.health - a.health);

  const environmentData = [
    { category: 'Temperature', value: stats.avgTemp, unit: '°C' },
    { category: 'Humidity', value: stats.avgHumidity, unit: '%' },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Garden Analytics</h2>
        
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <p className="text-gray-600 text-sm font-medium">Total Plants</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalPlants}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <p className="text-gray-600 text-sm font-medium">Healthy</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.healthy}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
            <p className="text-gray-600 text-sm font-medium">Stressed</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.stressed}</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
            <p className="text-gray-600 text-sm font-medium">Critical</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.critical}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
            <p className="text-gray-600 text-sm font-medium">Avg Health</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{stats.avgHealth}%</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Status Distribution Pie Chart */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Plant Health Scores Bar Chart */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Plant Health Scores</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={healthScores}
                margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="health" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Environment Stats */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Environment Averages</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {environmentData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-gray-600 font-medium">{item.category}</p>
                  <div className="bg-white rounded-lg p-3 mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-emerald-600">{item.value}</span>
                    <span className="text-gray-500">{item.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Distribution Summary */}
        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Garden Health Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Healthy Plants</span>
              <div className="flex items-center gap-2">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(stats.healthy / stats.totalPlants) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {Math.round((stats.healthy / stats.totalPlants) * 100)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Stressed Plants</span>
              <div className="flex items-center gap-2">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${(stats.stressed / stats.totalPlants) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {Math.round((stats.stressed / stats.totalPlants) * 100)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Critical Plants</span>
              <div className="flex items-center gap-2">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${(stats.critical / stats.totalPlants) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {Math.round((stats.critical / stats.totalPlants) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
