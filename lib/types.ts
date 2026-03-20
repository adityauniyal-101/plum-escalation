export type Priority = 'P1' | 'P2' | 'P3';
export type Status = 'open' | 'in-progress' | 'resolved';
export type IssueType = 'urgent' | 'delayed' | 'complaint' | 'follow-up' | 'other';

export interface RawEmail {
  subject: string;
  body: string;
  sent_at: string;
  sender?: string;
  sender_name?: string;
}

export interface Escalation {
  id: string;
  subject: string;
  body: string;
  sent_at: string;
  sender?: string;
  sender_name?: string;
  escalation_score: number;
  sentiment_score: number;
  keyword_score: number;
  delay_signal: number;
  priority: Priority;
  issue_type: IssueType;
  summary: string;
  action_required: string;
  status: Status;
  owner?: string;
  tat_hours?: number;
  created_at: string;
  resolved_at?: string;
}

export interface DashboardMetrics {
  total_escalations: number;
  p1_critical: number;
  unresolved: number;
  avg_resolution_time: number;
  breakdown: {
    [key in IssueType]: number;
  };
}
