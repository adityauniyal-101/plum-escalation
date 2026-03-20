'use client';

import { useEffect, useState, useMemo } from 'react';
import { Escalation } from '@/lib/types';

export default function AnalyticsPage() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dateRange, setDateRange] = useState('30days');

  useEffect(() => {
    const stored = localStorage.getItem('escalations');
    if (stored) {
      try {
        setEscalations(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load escalations:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  const analytics = useMemo(() => {
    if (escalations.length === 0) {
      return {
        totalEscalations: 0,
        avgResponseTime: 0,
        avgResolutionTime: 0,
        resolutionRate: 0,
        p1Count: 0,
        p2Count: 0,
        p3Count: 0,
        openCount: 0,
        inProgressCount: 0,
        resolvedCount: 0,
      };
    }

    const p1 = escalations.filter((e) => e.priority === 'P1');
    const p2 = escalations.filter((e) => e.priority === 'P2');
    const p3 = escalations.filter((e) => e.priority === 'P3');
    const resolved = escalations.filter((e) => e.status === 'resolved');
    const open = escalations.filter((e) => e.status === 'open');
    const inProgress = escalations.filter((e) => e.status === 'in-progress');

    return {
      totalEscalations: escalations.length,
      avgResponseTime:
        inProgress.length > 0
          ? (inProgress.reduce((sum, e) => sum + (e.tat_hours || 0), 0) / inProgress.length).toFixed(1)
          : 0,
      avgResolutionTime:
        resolved.length > 0
          ? (resolved.reduce((sum, e) => sum + (e.tat_hours || 0), 0) / resolved.length).toFixed(1)
          : 0,
      resolutionRate: escalations.length > 0 ? Math.round((resolved.length / escalations.length) * 100) : 0,
      p1Count: p1.length,
      p2Count: p2.length,
      p3Count: p3.length,
      openCount: open.length,
      inProgressCount: inProgress.length,
      resolvedCount: resolved.length,
    };
  }, [escalations]);

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Real-time escalation metrics and performance analysis</p>
      </div>

      {escalations.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <p className="text-blue-900 font-semibold">No data available</p>
          <p className="text-blue-700 text-sm mt-2">Upload a CSV file to see analytics</p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
              <p className="text-gray-600 text-sm font-medium mb-2">Total Escalations</p>
              <p className="text-4xl font-bold text-gray-900">{analytics.totalEscalations}</p>
              <p className="text-xs text-gray-500 mt-2">All time</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
              <p className="text-gray-600 text-sm font-medium mb-2">Avg Response Time</p>
              <p className="text-4xl font-bold text-gray-900">{analytics.avgResponseTime}h</p>
              <p className="text-xs text-gray-500 mt-2">In-progress items</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-600">
              <p className="text-gray-600 text-sm font-medium mb-2">Avg Resolution Time</p>
              <p className="text-4xl font-bold text-gray-900">{analytics.avgResolutionTime}h</p>
              <p className="text-xs text-gray-500 mt-2">Resolved items</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
              <p className="text-gray-600 text-sm font-medium mb-2">Resolution Rate</p>
              <p className="text-4xl font-bold text-gray-900">{analytics.resolutionRate}%</p>
              <p className="text-xs text-gray-500 mt-2">Of total escalations</p>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Priority Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">P1 - Critical</span>
                    <span className="text-2xl font-bold text-red-600">{analytics.p1Count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-red-600 h-3 rounded-full"
                      style={{
                        width: `${analytics.totalEscalations > 0 ? (analytics.p1Count / analytics.totalEscalations) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">P2 - High</span>
                    <span className="text-2xl font-bold text-yellow-600">{analytics.p2Count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-yellow-600 h-3 rounded-full"
                      style={{
                        width: `${analytics.totalEscalations > 0 ? (analytics.p2Count / analytics.totalEscalations) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">P3 - Normal</span>
                    <span className="text-2xl font-bold text-green-600">{analytics.p3Count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full"
                      style={{
                        width: `${analytics.totalEscalations > 0 ? (analytics.p3Count / analytics.totalEscalations) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Status Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">Open</span>
                    <span className="text-2xl font-bold text-gray-800">{analytics.openCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gray-800 h-3 rounded-full"
                      style={{
                        width: `${analytics.totalEscalations > 0 ? (analytics.openCount / analytics.totalEscalations) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">In Progress</span>
                    <span className="text-2xl font-bold text-blue-600">{analytics.inProgressCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{
                        width: `${analytics.totalEscalations > 0 ? (analytics.inProgressCount / analytics.totalEscalations) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">Resolved</span>
                    <span className="text-2xl font-bold text-green-600">{analytics.resolvedCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full"
                      style={{
                        width: `${analytics.totalEscalations > 0 ? (analytics.resolvedCount / analytics.totalEscalations) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Summary Statistics</h3>
            <div className="grid grid-cols-6 gap-4 text-center">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm font-medium">Total Items</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalEscalations}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm font-medium">Resolved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{analytics.resolvedCount}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{analytics.inProgressCount}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm font-medium">Open</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{analytics.openCount}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm font-medium">Critical (P1)</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{analytics.p1Count}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{analytics.resolutionRate}%</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
