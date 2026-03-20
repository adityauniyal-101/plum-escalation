'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Escalation, Priority, Status } from '@/lib/types';
import EscalationTable from '@/components/EscalationTable';
import Filters from '@/components/Filters';
import Link from 'next/link';

const ROWS_PER_PAGE = 50;

export default function EscalationsPage() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [filterPriority, setFilterPriority] = useState<Priority | null>(null);
  const [filterStatus, setFilterStatus] = useState<Status | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'date'>('score');
  const [currentPage, setCurrentPage] = useState(1);

  // Load escalations from localStorage ONCE
  useEffect(() => {
    const stored = localStorage.getItem('escalations');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log(`[Performance] Loaded ${parsed.length} escalations from localStorage`);
        setEscalations(parsed);
      } catch (error) {
        console.error('Failed to load escalations:', error);
      }
    }
  }, []);

  // MEMOIZED: Apply filters and sorting (expensive operation)
  const filteredEscalations = useMemo(() => {
    console.time('[Performance] Filter and sort');
    let filtered = escalations;

    // Apply priority filter
    if (filterPriority) {
      filtered = filtered.filter((e) => e.priority === filterPriority);
    }

    // Apply status filter
    if (filterStatus) {
      filtered = filtered.filter((e) => e.status === filterStatus);
    }

    // Apply search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.summary.toLowerCase().includes(lower) ||
          e.body.toLowerCase().includes(lower) ||
          e.sender?.toLowerCase().includes(lower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'score') {
        return b.escalation_score - a.escalation_score;
      } else {
        return new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime();
      }
    });

    console.timeEnd('[Performance] Filter and sort');
    console.log(`[Performance] ${filtered.length} escalations after filtering`);
    return filtered;
  }, [escalations, filterPriority, filterStatus, searchTerm, sortBy]);

  // MEMOIZED: Paginate results (only show 50 at a time)
  const paginatedEscalations = useMemo(() => {
    const startIdx = (currentPage - 1) * ROWS_PER_PAGE;
    const endIdx = startIdx + ROWS_PER_PAGE;
    return filteredEscalations.slice(startIdx, endIdx);
  }, [filteredEscalations, currentPage]);

  const totalPages = Math.ceil(filteredEscalations.length / ROWS_PER_PAGE);

  // Use useCallback to prevent creating new function on each render
  const handleUpdate = useCallback(
    (updated: Escalation) => {
      const newEscalations = escalations.map((e) => (e.id === updated.id ? updated : e));
      setEscalations(newEscalations);
      localStorage.setItem('escalations', JSON.stringify(newEscalations));
    },
    [escalations]
  );

  if (escalations.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Escalations</h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-900 text-lg font-semibold">No escalations loaded</p>
          <p className="text-blue-700 mt-2 text-sm">
            Go to the{' '}
            <Link href="/" className="font-semibold hover:text-blue-600 underline">
              dashboard
            </Link>{' '}
            to upload a CSV file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Escalations</h1>
        <div className="text-sm text-gray-600">
          Showing {paginatedEscalations.length} of {filteredEscalations.length} ({escalations.length} total)
        </div>
      </div>

      <Filters
        priority={filterPriority}
        status={filterStatus}
        searchTerm={searchTerm}
        onPriorityChange={setFilterPriority}
        onStatusChange={setFilterStatus}
        onSearchChange={setSearchTerm}
      />

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Sort by:
          <button
            onClick={() => setSortBy('score')}
            className={`ml-2 px-3 py-1 rounded ${
              sortBy === 'score'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Escalation Score
          </button>
          <button
            onClick={() => setSortBy('date')}
            className={`ml-2 px-3 py-1 rounded ${
              sortBy === 'date'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Date
          </button>
        </div>
      </div>

      <EscalationTable escalations={paginatedEscalations} onUpdate={handleUpdate} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            ← Previous
          </button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = currentPage > 3 ? currentPage - 2 + i : i + 1;
              if (page > totalPages) return null;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded ${
                    page === currentPage ? 'bg-blue-600 text-white' : 'border hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next →
          </button>

          <span className="text-sm text-gray-600 ml-4">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}
    </div>
  );
}
