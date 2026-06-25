export const QUEUE_NAMES = {
  NOTIFICATIONS: 'notifications',
  EMAIL: 'email',
  SMS: 'sms',
  AUDIT: 'audit',
  REPORTS: 'reports',
  TRANSCRIPTS: 'transcripts',
  PAYROLL: 'payroll',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
