'use client';

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

interface ExportButtonProps {
  plants: Plant[];
}

export default function ExportButton({ plants }: ExportButtonProps) {
  const handleExportCSV = () => {
    const headers = ['Plant ID', 'Name', 'Status', 'Health Score (%)', 'Temperature (°C)', 'Humidity (%)', 'Acoustic Pattern'];
    
    const rows = plants.map(plant => [
      plant.id,
      plant.name,
      plant.status,
      plant.healthScore,
      Math.round(plant.metrics.temperature * 10) / 10,
      Math.round(plant.metrics.humidity),
      plant.metrics.acousticPattern
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `plant-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleExportJSON = () => {
    const dataToExport = {
      exportDate: new Date().toISOString(),
      totalPlants: plants.length,
      plants: plants.map(p => ({
        ...p,
        temperature: Math.round(p.metrics.temperature * 10) / 10,
        humidity: Math.round(p.metrics.humidity)
      }))
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `plant-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-md">
      <h3 className="text-lg font-bold text-gray-900 mb-3">Export Data</h3>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleExportCSV}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          Download CSV
        </button>
        <button
          onClick={handleExportJSON}
          className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
        >
          Download JSON
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">Export your plant data for backup or analysis</p>
    </div>
  );
}
