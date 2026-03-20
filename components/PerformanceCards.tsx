import { Escalation } from '@/lib/types';
import { useMemo } from 'react';

interface PerformanceCardsProps {
  escalations: Escalation[];
}

export default function PerformanceCards({ escalations }: PerformanceCardsProps) {
  const metrics = useMemo(() => {
    const resolved = escalations.filter((e) => e.status === 'resolved');
    const inProgress = escalations.filter((e) => e.status === 'in-progress');

    // Average response time (TAT for in-progress)
    const avgResponseTime =
      inProgress.length > 0
        ? inProgress.reduce((sum, e) => sum + (e.tat_hours || 0), 0) / inProgress.length
        : 0;

    // Average resolution time
    const avgResolutionTime =
      resolved.length > 0
        ? resolved.reduce((sum, e) => sum + (e.tat_hours || 0), 0) / resolved.length
        : 0;

    // Resolution rate
    const resolutionRate =
      escalations.length > 0
        ? Math.round((resolved.length / escalations.length) * 100)
        : 0;

    return {
      avgResponseTime: avgResponseTime.toFixed(1),
      avgResolutionTime: avgResolutionTime.toFixed(1),
      resolutionRate,
      trend: {
        response: 8,
        resolution: 16,
        rate: 11,
      },
    };
  }, [escalations]);

  const cards = [
    {
      title: 'Avg Response Time',
      value: `${metrics.avgResponseTime} h`,
      trend: metrics.trend.response,
      trendUp: true,
    },
    {
      title: 'Avg Resolution Time',
      value: `${metrics.avgResolutionTime} h`,
      trend: metrics.trend.resolution,
      trendUp: false,
    },
    {
      title: 'Resolution Rate',
      value: `${metrics.resolutionRate}%`,
      trend: metrics.trend.rate,
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-4">
      {cards.map((card) => (
        <div key={card.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">{card.title}</p>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            <div className={`flex items-center gap-1 text-sm font-semibold ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
              <span>{card.trendUp ? '↑' : '↓'} {card.trend}%</span>
              <div
                className={`w-2 h-2 rounded-full ${card.trendUp ? 'bg-green-600' : 'bg-red-600'}`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
