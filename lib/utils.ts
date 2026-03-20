import { Escalation, DashboardMetrics, IssueType, Priority } from './types';

/**
 * CRITICAL: Ensures an escalation ALWAYS has a valid priority.
 * This is the root fix for missing priorities - used everywhere escalations are loaded.
 */
export function ensurePriority(escalation: Escalation): Escalation {
  // If priority is missing, null, undefined, or empty string - calculate it
  if (!escalation.priority) {
    const calculated = calculatePriorityFromScores(
      escalation.escalation_score,
      escalation.issue_type
    );
    return {
      ...escalation,
      priority: calculated,
    };
  }
  return escalation;
}

/**
 * Calculates priority based on escalation score and issue type.
 * Used by ensurePriority() to fill in missing priorities.
 */
function calculatePriorityFromScores(score: number, issueType: IssueType): Priority {
  if (issueType === 'urgent') {
    if (score >= 60) return 'P1';
    if (score >= 40) return 'P2';
    return 'P3';
  }

  if (issueType === 'delayed' || issueType === 'follow-up') {
    if (score >= 70) return 'P1';
    if (score >= 45) return 'P2';
    return 'P3';
  }

  if (issueType === 'complaint') {
    if (score >= 65) return 'P1';
    if (score >= 40) return 'P2';
    return 'P3';
  }

  if (score > 75) return 'P1';
  if (score >= 50) return 'P2';
  return 'P3';
}

export function calculateMetrics(escalations: Escalation[]): DashboardMetrics {
  const metrics: DashboardMetrics = {
    total_escalations: escalations.length,
    p1_critical: escalations.filter((e) => e.priority === 'P1').length,
    unresolved: escalations.filter((e) => e.status !== 'resolved').length,
    avg_resolution_time: 0,
    breakdown: {
      urgent: 0,
      delayed: 0,
      complaint: 0,
      'follow-up': 0,
      other: 0,
    },
  };

  // Count issue types
  escalations.forEach((e) => {
    metrics.breakdown[e.issue_type]++;
  });

  // Calculate average resolution time
  const resolved = escalations.filter((e) => e.status === 'resolved' && e.resolved_at);
  if (resolved.length > 0) {
    const totalTime = resolved.reduce((sum, e) => {
      if (!e.resolved_at) return sum;
      const resolvedTime = new Date(e.resolved_at).getTime();
      const createdTime = new Date(e.created_at).getTime();
      return sum + (resolvedTime - createdTime);
    }, 0);
    metrics.avg_resolution_time = Math.round(totalTime / resolved.length / (1000 * 60 * 60)); // in hours
  }

  return metrics;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'P1':
      return 'bg-p1 text-white';
    case 'P2':
      return 'bg-p2 text-white';
    case 'P3':
      return 'bg-p3 text-white';
    default:
      return 'bg-gray-300 text-gray-900';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'open':
      return 'bg-red-100 text-red-800';
    case 'in-progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'resolved':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getTopEscalations(escalations: Escalation[], count: number = 5): Escalation[] {
  return escalations
    .filter((e) => e.priority === 'P1')
    .sort((a, b) => {
      if (a.status === b.status) {
        return b.escalation_score - a.escalation_score;
      }
      // Open/in-progress first, then resolved
      return a.status === 'resolved' ? 1 : -1;
    })
    .slice(0, count);
}
