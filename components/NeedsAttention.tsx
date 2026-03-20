import { Escalation } from '@/lib/types';
import { getPriorityColor, getStatusColor } from '@/lib/utils';

interface NeedsAttentionProps {
  escalations: Escalation[];
}

export default function NeedsAttention({ escalations }: NeedsAttentionProps) {
  const getTimeRemaining = (tat_hours?: number, created_at?: string) => {
    if (!tat_hours || !created_at) return 'N/A';
    const created = new Date(created_at);
    const now = new Date();
    const elapsed = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    const remaining = Math.max(0, tat_hours - elapsed);

    if (remaining === 0) return 'OVERDUE';
    if (remaining < 1) return '<1 hour';
    if (remaining < 24) return `${Math.ceil(remaining)} hours`;
    return `${Math.ceil(remaining / 24)} days`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border-t-4 border-red-600">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Escalations Needing Attention</h2>

      {escalations.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600 font-medium">No critical escalations</p>
          <p className="text-gray-500 text-sm mt-1">All P1 items are under control</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left px-4 py-3 font-bold text-gray-700">Account Name</th>
                <th className="text-left px-4 py-3 font-bold text-gray-700">Issue Summary</th>
                <th className="text-center px-4 py-3 font-bold text-gray-700">Priority</th>
                <th className="text-center px-4 py-3 font-bold text-gray-700">Status</th>
                <th className="text-right px-4 py-3 font-bold text-gray-700">TAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {escalations.map((esc) => (
                <tr key={esc.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-bold text-gray-900">{esc.sender_name || 'Unknown Account'}</div>
                    <div className="text-xs text-gray-500 mt-1 font-medium">{esc.sender || 'N/A'}</div>
                    <div className="text-xs text-gray-400 mt-1 capitalize font-medium">{esc.issue_type} Issue</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-gray-900 font-semibold">{esc.summary}</div>
                    <div className="text-xs text-gray-600 mt-2 font-medium">{esc.action_required}</div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(esc.priority)}`}>
                      {esc.priority}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(esc.status)}`}>
                      {esc.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="font-bold text-lg text-gray-900">{getTimeRemaining(esc.tat_hours, esc.created_at)}</div>
                    <div className={`text-xs font-semibold mt-1 ${getTimeRemaining(esc.tat_hours, esc.created_at) === 'OVERDUE' ? 'text-red-600' : 'text-orange-600'}`}>
                      {getTimeRemaining(esc.tat_hours, esc.created_at) === 'OVERDUE' ? '⚠️ OVERDUE' : '⏱️ PENDING'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
