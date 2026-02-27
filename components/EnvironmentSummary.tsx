'use client';

interface Plant {
  id: number;
  metrics: {
    temperature: number;
    humidity: number;
    acousticPattern: string;
  };
}

interface EnvironmentData {
  current: { temp: number; humidity: number };
  optimal: { temp: { min: number; max: number }; humidity: { min: number; max: number } };
  status: string;
}

export default function EnvironmentSummary({ plants }: { plants: Plant[] }) {
  const avgTemp = Math.round(plants.reduce((sum, p) => sum + p.metrics.temperature, 0) / plants.length);
  const avgHumidity = Math.round(plants.reduce((sum, p) => sum + p.metrics.humidity, 0) / plants.length);

  const envData: EnvironmentData = {
    current: { temp: avgTemp, humidity: avgHumidity },
    optimal: { 
      temp: { min: 20, max: 25 },
      humidity: { min: 50, max: 70 }
    },
    status: avgTemp >= 20 && avgTemp <= 25 && avgHumidity >= 50 && avgHumidity <= 70 ? 'Optimal' : 'Needs Adjustment'
  };

  const getTempStatus = (temp: number) => {
    if (temp < 18) return { label: 'Too Cold', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (temp > 28) return { label: 'Too Hot', color: 'text-red-600', bg: 'bg-red-50' };
    return { label: 'Good', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const getHumidityStatus = (humidity: number) => {
    if (humidity < 30) return { label: 'Too Dry', color: 'text-orange-600', bg: 'bg-orange-50' };
    if (humidity > 80) return { label: 'Too Wet', color: 'text-blue-600', bg: 'bg-blue-50' };
    return { label: 'Good', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const tempStatus = getTempStatus(avgTemp);
  const humidityStatus = getHumidityStatus(avgHumidity);

  return (
    <div id="environment" className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-8 shadow-md border border-amber-200">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Environmental Control</h2>

      {/* Overall Status */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Garden Environment Status</h3>
            <p className="text-gray-600 mt-1">{envData.status}</p>
          </div>
          <div className="text-4xl">
            {envData.status === 'Optimal' ? '✓' : '⚠'}
          </div>
        </div>
      </div>

      {/* Current vs Optimal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Temperature */}
        <div className={`rounded-lg p-6 shadow-sm ${tempStatus.bg}`}>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-bold text-gray-900">Temperature</h4>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${tempStatus.color}`}>
                {tempStatus.label}
              </span>
            </div>
            <div className="text-4xl font-bold text-gray-900">{avgTemp}°C</div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Current</span>
              <span className="font-semibold">{avgTemp}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Optimal Range</span>
              <span className="font-semibold">{envData.optimal.temp.min}-{envData.optimal.temp.max}°C</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full ${
                  avgTemp >= envData.optimal.temp.min && avgTemp <= envData.optimal.temp.max
                    ? 'bg-green-500'
                    : 'bg-red-500'
                }`}
                style={{
                  width: `${Math.min(100, (avgTemp / 30) * 100)}%`
                }}
              ></div>
            </div>
          </div>

          {avgTemp < envData.optimal.temp.min && (
            <div className="mt-4 p-3 bg-blue-100 rounded text-blue-900 text-sm">
              💡 Increase room temperature using heat lamps or better insulation
            </div>
          )}
          {avgTemp > envData.optimal.temp.max && (
            <div className="mt-4 p-3 bg-red-100 rounded text-red-900 text-sm">
              💡 Increase ventilation or use AC to lower temperature
            </div>
          )}
        </div>

        {/* Humidity */}
        <div className={`rounded-lg p-6 shadow-sm ${humidityStatus.bg}`}>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-bold text-gray-900">Humidity</h4>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${humidityStatus.color}`}>
                {humidityStatus.label}
              </span>
            </div>
            <div className="text-4xl font-bold text-gray-900">{avgHumidity}%</div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Current</span>
              <span className="font-semibold">{avgHumidity}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Optimal Range</span>
              <span className="font-semibold">{envData.optimal.humidity.min}-{envData.optimal.humidity.max}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full ${
                  avgHumidity >= envData.optimal.humidity.min && avgHumidity <= envData.optimal.humidity.max
                    ? 'bg-green-500'
                    : 'bg-red-500'
                }`}
                style={{
                  width: `${avgHumidity}%`
                }}
              ></div>
            </div>
          </div>

          {avgHumidity < envData.optimal.humidity.min && (
            <div className="mt-4 p-3 bg-orange-100 rounded text-orange-900 text-sm">
              💡 Use a humidifier or mist plants regularly to increase humidity
            </div>
          )}
          {avgHumidity > envData.optimal.humidity.max && (
            <div className="mt-4 p-3 bg-blue-100 rounded text-blue-900 text-sm">
              💡 Increase air circulation and reduce watering frequency
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h4 className="font-bold text-gray-900 mb-4">Environmental Recommendations</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span>Temperature is within optimal range - maintain current conditions</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span>Humidity levels are good - continue regular misting</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">→</span>
            <span>Consider adding more plants for better humidity balance</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
