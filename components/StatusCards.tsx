import { Escalation } from '@/lib/types';
import { useMemo } from 'react';

interface StatusCardsProps {
  escalations: Escalation[];
}

export default function StatusCards({ escalations }: StatusCardsProps) {
  const counts = useMemo(() => {
    return {
      opened: escalations.filter((e) => e.status === 'open').length,
      inProgress: escalations.filter((e) => e.status === 'in-progress').length,
      resolved: escalations.filter((e) => e.status === 'resolved').length,
    };
  }, [escalations]);

  const total = counts.opened + counts.inProgress + counts.resolved;

  const statuses = [
    {
      label: 'Opened',
      count: counts.opened,
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-900',
      dotColor: 'bg-gray-800',
      borderColor: 'border-gray-300',
      progressColor: 'bg-gray-800',
    },
    {
      label: 'In Progress',
      count: counts.inProgress,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-900',
      dotColor: 'bg-blue-600',
      borderColor: 'border-blue-300',
      progressColor: 'bg-blue-600',
    },
    {
      label: 'Resolved',
      count: counts.resolved,
      bgColor: 'bg-green-50',
      textColor: 'text-green-900',
      dotColor: 'bg-green-600',
      borderColor: 'border-green-300',
      progressColor: 'bg-green-600',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Escalation Status</h3>
            <p className="text-xs text-gray-600 mt-1">Current distribution across statuses</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600 text-lg font-bold transition">+</button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="p-4 space-y-3">
        {statuses.map((status) => {
          const percentage = total > 0 ? (status.count / total) * 100 : 0;
          return (
            <div key={status.label} className={`p-4 rounded-lg border-2 ${status.borderColor} ${status.bgColor} transition-all hover:shadow-md`}>
              {/* Status Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${status.dotColor}`} />
                  <span className={`font-bold text-sm ${status.textColor}`}>{status.label}</span>
                </div>
                <span className={`text-2xl font-bold ${status.textColor} flex-shrink-0`}>{status.count}</span>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${status.progressColor} transition-all duration-300 rounded-full`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Percentage */}
              <p className={`text-xs font-semibold mt-2 ${status.textColor}`}>{Math.round(percentage)}% of total</p>
            </div>
          );
        })}
      </div>

      {/* Footer Summary */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-gray-700">Total Escalations</span>
          <span className="text-lg font-bold text-gray-900">{total}</span>
        </div>
      </div>
    </div>
  );
}
