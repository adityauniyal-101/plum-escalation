import { RawEmail, Escalation, Priority, IssueType } from './types';

const KEYWORDS = {
  urgent: ['urgent', 'asap', 'critical', 'immediately'],
  escalation: ['escalation', 'escalate', 'executive', 'director', 'vp'],
  issue: ['issue', 'problem', 'bug', 'error', 'broken', 'crash', 'fail'],
  complaint: ['complaint', 'unhappy', 'unsatisfied', 'poor', 'bad', 'terrible'],
  delay: ['delay', 'delayed', 'late', 'slow', 'waiting'],
  unresolved: ['not resolved', 'still', 'still waiting', 'no response', 'ignored'],
  stuck: ['stuck', 'blocked', 'cannot', 'unable'],
};

const NEGATIVE_WORDS = [
  'angry',
  'frustrated',
  'disappointed',
  'fail',
  'failed',
  'failure',
  'error',
  'problem',
  'issue',
  'broken',
  'crash',
  'hate',
  'bad',
  'terrible',
  'awful',
  'horrible',
  'useless',
  'waste',
];

function calculateKeywordScore(text: string): number {
  const lowerText = text.toLowerCase();
  let score = 0;

  // Score each keyword category
  for (const [category, keywords] of Object.entries(KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        score += 30;
        break; // Only count once per category
      }
    }
  }

  return Math.min(score, 100);
}

function calculateSentimentScore(text: string): number {
  const lowerText = text.toLowerCase();
  let negativeCount = 0;

  for (const word of NEGATIVE_WORDS) {
    if (lowerText.includes(word)) {
      negativeCount++;
    }
  }

  return Math.min(negativeCount * 5, 40);
}

function calculateDelaySignal(text: string): number {
  const lowerText = text.toLowerCase();
  const delayPhrases = ['still waiting', 'no response', 'not been addressed', 'pending', 'delayed'];

  for (const phrase of delayPhrases) {
    if (lowerText.includes(phrase)) {
      return 20;
    }
  }

  return 0;
}

function calculateFollowUpSignal(text: string): number {
  const lowerText = text.toLowerCase();
  const followUpPhrases = ['follow up', 'again', 'reminder', 're:', 'fwd:'];

  for (const phrase of followUpPhrases) {
    if (lowerText.includes(phrase)) {
      return 10;
    }
  }

  return 0;
}

function determineIssueType(text: string): IssueType {
  const lowerText = text.toLowerCase();

  if (KEYWORDS.urgent.some((k) => lowerText.includes(k))) return 'urgent';
  if (KEYWORDS.delay.some((k) => lowerText.includes(k)) || KEYWORDS.unresolved.some((k) => lowerText.includes(k)))
    return 'delayed';
  if (KEYWORDS.complaint.some((k) => lowerText.includes(k))) return 'complaint';
  if (lowerText.includes('follow up') || lowerText.includes('re:') || lowerText.includes('reminder'))
    return 'follow-up';

  return 'other';
}

function calculatePriority(score: number, issueType: IssueType): Priority {
  // Urgent issues get higher priority
  if (issueType === 'urgent') {
    if (score >= 60) return 'P1';
    if (score >= 40) return 'P2';
    return 'P3';
  }

  // Delayed/Follow-up issues
  if (issueType === 'delayed' || issueType === 'follow-up') {
    if (score >= 70) return 'P1';
    if (score >= 45) return 'P2';
    return 'P3';
  }

  // Complaints
  if (issueType === 'complaint') {
    if (score >= 65) return 'P1';
    if (score >= 40) return 'P2';
    return 'P3';
  }

  // Other issues - standard thresholds
  if (score > 75) return 'P1';
  if (score >= 50) return 'P2';
  return 'P3';
}

function generateSummary(subject: string, issueType: IssueType, body: string): string {
  const maxLength = 100;
  let summary = subject;

  if (!summary || summary.length === 0) {
    // Create summary from body if no subject
    summary = body.split('\n')[0];
  }

  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength - 3) + '...';
  }

  return summary;
}

function generateActionRequired(issueType: IssueType, priority: Priority): string {
  const actions: { [key in IssueType]: { [key in Priority]: string } } = {
    urgent: {
      P1: 'Respond immediately - escalate to management',
      P2: 'Address within 1 hour',
      P3: 'Address within 4 hours',
    },
    delayed: {
      P1: 'Investigate delay immediately and provide update',
      P2: 'Provide status update within 1 hour',
      P3: 'Provide status update within 4 hours',
    },
    complaint: {
      P1: 'Immediate escalation to director + plan remediation',
      P2: 'Assign owner and create resolution plan',
      P3: 'Document and address in next cycle',
    },
    'follow-up': {
      P1: 'Prior issue remains critical - urgent escalation',
      P2: 'Assign and prioritize resolution',
      P3: 'Address as part of backlog',
    },
    other: {
      P1: 'Route to appropriate team',
      P2: 'Log and track resolution',
      P3: 'Standard handling',
    },
  };

  return actions[issueType][priority];
}

export function processEmail(email: RawEmail, index: number): Escalation {
  const fullText = `${email.subject} ${email.body}`;

  const keyword_score = calculateKeywordScore(fullText);
  const sentiment_score = calculateSentimentScore(fullText);
  const delay_signal = calculateDelaySignal(fullText);
  const followup_signal = calculateFollowUpSignal(fullText);

  const issue_type = determineIssueType(fullText);
  const escalation_score = Math.min(keyword_score + sentiment_score + delay_signal + followup_signal, 100);
  const priority = calculatePriority(escalation_score, issue_type);
  const summary = generateSummary(email.subject, issue_type, email.body);
  const action_required = generateActionRequired(issue_type, priority);

  return {
    id: `ESC-${Date.now()}-${index}`,
    subject: email.subject,
    body: email.body,
    sent_at: email.sent_at,
    sender: email.sender || 'Unknown',
    sender_name: email.sender_name || 'Unknown',
    escalation_score: Math.round(escalation_score),
    sentiment_score: Math.round(sentiment_score),
    keyword_score: Math.round(keyword_score),
    delay_signal,
    priority,
    issue_type,
    summary,
    action_required,
    status: 'open',
    created_at: new Date().toISOString(),
    tat_hours: priority === 'P1' ? 1 : priority === 'P2' ? 4 : 24,
  };
}
