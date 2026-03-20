'use client';

import { Priority, Status } from '@/lib/types';

interface FiltersProps {
  priority: Priority | null;
  status: Status | null;
  searchTerm: string;
  onPriorityChange: (priority: Priority | null) => void;
  onStatusChange: (status: Status | null) => void;
  onSearchChange: (term: string) => void;
}

export default function Filters({
  priority,
  status,
  searchTerm,
  onPriorityChange,
  onStatusChange,
  onSearchChange,
}: FiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Priority</label>
          <select
            value={priority || ''}
            onChange={(e) => onPriorityChange((e.target.value as Priority) || null)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Priorities</option>
            <option value="P1">P1 - Critical</option>
            <option value="P2">P2 - High</option>
            <option value="P3">P3 - Normal</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Status</label>
          <select
            value={status || ''}
            onChange={(e) => onStatusChange((e.target.value as Status) || null)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Search</label>
          <input
            type="text"
            placeholder="Search escalations..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {(priority || status || searchTerm) && (
        <div className="text-sm text-gray-600">
          <button
            onClick={() => {
              onPriorityChange(null);
              onStatusChange(null);
              onSearchChange('');
            }}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
