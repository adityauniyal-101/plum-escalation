'use client';

import { useState, useEffect, useMemo } from 'react';
import { Escalation, DashboardMetrics } from '@/lib/types';
import { calculateMetrics, getTopEscalations, ensurePriority } from '@/lib/utils';
import { mockEscalations } from '@/lib/mockData';
import UploadCSV from '@/components/UploadCSV';
import StatusCards from '@/components/StatusCards';
import NeedsAttention from '@/components/NeedsAttention';
import PerformanceCards from '@/components/PerformanceCards';
import EscalationBreakdown from '@/components/EscalationBreakdown';

export default function Dashboard() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [priorityFilter, setPriorityFilter] = useState<string>('All Priorities');

  useEffect(() => {
    const stored = localStorage.getItem('escalations');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // CRITICAL: Ensure ALL escalations have valid priorities
        const withPriorities = parsed.map((e: Escalation) => ensurePriority(e));
        setEscalations(withPriorities);
      } catch (error) {
        console.error('Failed to load escalations:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  const handleUpload = (newEscalations: Escalation[]) => {
    setEscalations(newEscalations);
    localStorage.setItem('escalations', JSON.stringify(newEscalations));
    setLastUpdated(new Date());
  };

  const handleLoadMockData = () => {
    // CRITICAL: Ensure mock data has priorities
    const mockWithPriorities = mockEscalations.map(e => ensurePriority(e));
    setEscalations(mockWithPriorities);
    localStorage.setItem('escalations', JSON.stringify(mockWithPriorities));
    setLastUpdated(new Date());
  };

  const filteredByDate = useMemo(() => {
    return escalations.filter((e) => {
      const date = new Date(e.sent_at);
      return date >= dateRange.start && date <= dateRange.end;
    });
  }, [escalations, dateRange]);

  const filteredData = useMemo(() => {
    if (priorityFilter === 'All Priorities') return filteredByDate;
    return filteredByDate.filter((e) => e.priority === priorityFilter);
  }, [filteredByDate, priorityFilter]);

  const metrics = useMemo(() => {
    return calculateMetrics(filteredData);
  }, [filteredData]);

  const getMinutesAgo = () => {
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes === 0) return 'just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  if (!isLoaded) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {escalations.length === 0 ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center mb-6">
            <p className="text-blue-900 text-lg font-bold">Welcome to Escalation Monitor</p>
            <p className="text-blue-700 mt-2 text-sm">Get started by uploading data or exploring with sample data</p>
          </div>

          {/* Demo Button */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 text-center mb-6">
            <p className="text-purple-900 text-sm font-semibold mb-3">Want to see how it works?</p>
            <button
              onClick={handleLoadMockData}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors shadow-md"
            >
              ✨ Explore with Sample Data
            </button>
            <p className="text-purple-700 text-xs mt-3">Load realistic escalation examples to explore all features</p>
          </div>

          <div className="border-t-2 border-gray-200 pt-6">
            <p className="text-gray-700 text-sm font-semibold mb-4 text-center">Or upload your own data</p>
            <UploadCSV onUpload={handleUpload} />
          </div>
        </div>
      ) : (
        <>
          {/* Top Section */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 text-sm mt-1">Real-time escalation monitoring and insights</p>
              </div>
              <div className="flex items-center gap-3">
                <UploadCSV onUpload={handleUpload} />
                <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-semibold transition">
                  ⬇️ Download Data
                </button>
                {mockEscalations.length > 0 && (
                  <button
                    onClick={handleLoadMockData}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition text-sm"
                    title="Reload sample data"
                  >
                    ✨ Sample Data
                  </button>
                )}
              </div>
            </div>

            {/* Filters Section */}
            <div className="flex justify-between items-center bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-6">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-2">Date Range</label>
                  <input
                    type="text"
                    value={`${dateRange.start.toLocaleDateString()} – ${dateRange.end.toLocaleDateString()}`}
                    readOnly
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-900 cursor-pointer font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-2">Priority Filter</label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 font-medium"
                  >
                    <option>All Priorities</option>
                    <option>P1</option>
                    <option>P2</option>
                    <option>P3</option>
                  </select>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{filteredData.length}</p>
                <p className="text-sm text-gray-600 font-semibold">Escalations Found</p>
                <p className="text-xs text-gray-500 mt-1">✓ Updated {getMinutesAgo()}</p>
              </div>
            </div>
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar - Status Cards */}
            <div className="col-span-2">
              <StatusCards escalations={filteredData} />
            </div>

            {/* Center - Main Content */}
            <div className="col-span-7 space-y-6">
              <NeedsAttention escalations={getTopEscalations(filteredData, 7)} />
              <EscalationBreakdown metrics={metrics} />
            </div>

            {/* Right Panel - Performance Metrics */}
            <div className="col-span-3">
              <PerformanceCards escalations={filteredData} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
