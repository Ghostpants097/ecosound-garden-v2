import { getStats } from '@/lib/data';

interface Plant {
  id: number;
  name: string;
  status: 'healthy' | 'stressed' | 'critical';
  healthScore: number;
}

export default function StatsGrid({ plants }: { plants: Plant[] }) {
  const stats = getStats(plants);

  const statCards = [
    {
      value: stats.healthy,
      label: 'Healthy Plants',
      color: 'border-green-500',
      bgColor: 'bg-green-50'
    },
    {
      value: stats.stressed,
      label: 'Plants Under Stress',
      color: 'border-yellow-500',
      bgColor: 'bg-yellow-50'
    },
    {
      value: stats.critical,
      label: 'Critical Condition',
      color: 'border-red-500',
      bgColor: 'bg-red-50'
    },
    {
      value: stats.dataHours,
      label: 'Hours of Data',
      color: 'border-blue-500',
      bgColor: 'bg-blue-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8 bg-gray-50">
      {statCards.map((card, idx) => (
        <div
          key={idx}
          className={`${card.bgColor} p-6 rounded-xl border-l-4 ${card.color} shadow-sm`}
        >
          <h3 className="text-4xl font-bold text-gray-900 mb-2">{card.value}</h3>
          <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
            {card.label}
          </p>
        </div>
      ))}
    </div>
  );
}
