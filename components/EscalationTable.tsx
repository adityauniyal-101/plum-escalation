'use client';

import { Escalation, Priority, Status } from '@/lib/types';
import { getPriorityColor, getStatusColor } from '@/lib/utils';
import { useState, memo, useCallback } from 'react';

interface EscalationTableProps {
  escalations: Escalation[];
  onUpdate: (escalation: Escalation) => void;
}

// Memoized row component to prevent re-renders
interface RowProps {
  escalation: Escalation;
  isExpanded: boolean;
  isEditing: boolean;
  onToggleExpand: (id: string) => void;
  onToggleEdit: (id: string) => void;
  onStatusChange: (escalation: Escalation, status: Status) => void;
  onOwnerChange: (escalation: Escalation, owner: string) => void;
}

const TableRow = memo(function TableRow({
  escalation,
  isExpanded,
  isEditing,
  onToggleExpand,
  onToggleEdit,
  onStatusChange,
  onOwnerChange,
}: RowProps) {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-4 py-3 text-sm">
        <div className="font-bold text-gray-900 truncate">{escalation.sender_name || 'Unknown'}</div>
        <div className="text-xs text-gray-500 truncate mt-1">{escalation.sender || 'N/A'}</div>
      </td>
      <td
        className="px-4 py-3 text-gray-700 cursor-pointer hover:text-blue-600 text-sm"
        onClick={() => onToggleExpand(escalation.id)}
      >
        <div className="truncate">{escalation.summary}</div>
        {isExpanded && (
          <div className="mt-2 text-xs text-gray-600 whitespace-normal bg-gray-50 p-2 rounded max-h-40 overflow-y-auto">
            <p className="font-semibold mb-1">Full Details:</p>
            <p>{escalation.body}</p>
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <span className={`px-3 py-2 rounded-lg text-sm font-bold inline-block min-w-[60px] text-center ${getPriorityColor(escalation.priority)}`}>
          {escalation.priority || 'N/A'}
        </span>
      </td>
      <td className="px-4 py-3">
        {isEditing ? (
          <select
            value={escalation.status}
            onChange={(e) => {
              onStatusChange(escalation, e.target.value as Status);
              onToggleEdit(escalation.id);
            }}
            onBlur={() => onToggleEdit(escalation.id)}
            autoFocus
            className="px-2 py-1 border border-gray-300 rounded text-xs"
          >
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        ) : (
          <span
            className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${getStatusColor(escalation.status)}`}
            onClick={() => onToggleEdit(escalation.id)}
          >
            {escalation.status}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <input
          type="text"
          placeholder="Assign owner"
          value={escalation.owner || ''}
          onChange={(e) => onOwnerChange(escalation, e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </td>
      <td className="px-4 py-3 text-gray-700 text-sm">{escalation.tat_hours}h</td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          {escalation.status !== 'resolved' && (
            <button
              onClick={() => onStatusChange(escalation, 'resolved')}
              className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded font-semibold"
            >
              Resolve
            </button>
          )}
          <button
            onClick={() => onToggleExpand(escalation.id)}
            className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded font-semibold"
          >
            {isExpanded ? 'Hide' : 'View'}
          </button>
        </div>
      </td>
    </tr>
  );
});

export default function EscalationTable({ escalations, onUpdate }: EscalationTableProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleEdit = useCallback((id: string) => {
    setEditingId((prev) => (prev === id ? null : id));
  }, []);

  const handleStatusChange = useCallback(
    (escalation: Escalation, status: Status) => {
      const updated = { ...escalation, status };
      if (status === 'resolved') {
        updated.resolved_at = new Date().toISOString();
      }
      onUpdate(updated);
    },
    [onUpdate]
  );

  const handleOwnerChange = useCallback(
    (escalation: Escalation, owner: string) => {
      onUpdate({ ...escalation, owner });
    },
    [onUpdate]
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Sender</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Summary</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Priority</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Owner</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">TAT</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {escalations.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No escalations to display
                </td>
              </tr>
            ) : (
              escalations.map((escalation) => (
                <TableRow
                  key={escalation.id}
                  escalation={escalation}
                  isExpanded={expandedIds.has(escalation.id)}
                  isEditing={editingId === escalation.id}
                  onToggleExpand={toggleExpand}
                  onToggleEdit={toggleEdit}
                  onStatusChange={handleStatusChange}
                  onOwnerChange={handleOwnerChange}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
