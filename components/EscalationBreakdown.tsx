import { DashboardMetrics } from '@/lib/types';

interface EscalationBreakdownProps {
  metrics: DashboardMetrics;
}

export default function EscalationBreakdown({ metrics }: EscalationBreakdownProps) {
  const breakdownData = Object.entries(metrics.breakdown).map(([type, count]) => {
    const percentage = metrics.total_escalations > 0
      ? Math.round((count / metrics.total_escalations) * 100)
      : 0;

    return {
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
      percentage,
    };
  });

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Escalation Breakdown</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-3 py-3 font-semibold text-gray-700">Issue Type</th>
                <th className="text-center px-3 py-3 font-semibold text-gray-700">Count</th>
                <th className="text-right px-3 py-3 font-semibold text-gray-700">% of Escalations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {breakdownData.map((row) => (
                <tr key={row.type} className="hover:bg-gray-50">
                  <td className="px-3 py-4 text-gray-900 font-medium">{row.type}</td>
                  <td className="px-3 py-4 text-center text-gray-900 font-semibold">{row.count}</td>
                  <td className="px-3 py-4 text-right text-green-600 font-semibold">{row.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Issue Type</h3>

        <div className="space-y-4">
          {breakdownData.map((row) => (
            <div key={row.type}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{row.type}</span>
                <span className="text-sm font-semibold text-gray-900">{row.count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getColorForType(row.type)}`}
                  style={{ width: `${row.percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{row.percentage}% of total</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getColorForType(type: string): string {
  const colors: { [key: string]: string } = {
    'Delay': 'bg-blue-600',
    'Claim Issue': 'bg-purple-600',
    'Support': 'bg-orange-600',
    'Technical': 'bg-red-600',
    'Follow-up': 'bg-green-600',
    'Urgent': 'bg-pink-600',
    'Complaint': 'bg-yellow-600',
    'Other': 'bg-gray-600',
  };
  return colors[type] || 'bg-gray-600';
}
