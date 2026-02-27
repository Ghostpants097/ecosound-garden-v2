'use client';

interface Alert {
  id: number;
  type: 'warning' | 'info';
  icon: string;
  title: string;
  message: string;
}

export default function AlertsSection({ alerts }: { alerts: Alert[] }) {
  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-l-4 border-yellow-500';
      case 'info':
        return 'bg-blue-50 border-l-4 border-blue-500';
      default:
        return 'bg-gray-50 border-l-4 border-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Alerts & Recommendations</h3>
      <div className="space-y-4">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`flex items-start gap-4 p-4 rounded-lg ${getAlertStyles(alert.type)}`}
          >
            <div className="text-2xl flex-shrink-0">{alert.icon}</div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{alert.title}</h4>
              <p className="text-gray-700 text-sm mt-1">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
