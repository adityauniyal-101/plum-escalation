import { DashboardMetrics } from '@/lib/types';

interface DashboardCardsProps {
  metrics: DashboardMetrics;
}

export default function DashboardCards({ metrics }: DashboardCardsProps) {
  const cards = [
    {
      title: 'Total Escalations',
      value: metrics.total_escalations,
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-900',
    },
    {
      title: 'P1 Critical',
      value: metrics.p1_critical,
      color: 'bg-red-50 border-red-200',
      textColor: 'text-red-900',
      highlight: true,
    },
    {
      title: 'Unresolved',
      value: metrics.unresolved,
      color: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-900',
    },
    {
      title: 'Avg Resolution',
      value: `${metrics.avg_resolution_time}h`,
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-900',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`${card.color} border-l-4 rounded-lg p-6 ${card.highlight ? 'ring-2 ring-red-300' : ''}`}
        >
          <p className="text-sm text-gray-600 font-medium">{card.title}</p>
          <p className={`text-3xl font-bold mt-2 ${card.textColor}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
