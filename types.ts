
export interface ValueItem {
  id: string;
  name: string;
  description: string;
  category: string;
}

export type LogType = 'standard' | 'goal-update' | 'goal-completion';

export interface LogEntry {
  id: string;
  date: string; // ISO string
  valueId: string;
  livedIt: boolean;
  note: string;
  mood?: '🌱' | '🔥' | '✨' | '🧗';
  type?: LogType;
  goalText?: string;
  deepReflection?: string; // The user's deep reflection text
  reflectionAnalysis?: string; // The AI-generated analysis
}

export type GoalFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface GoalUpdate {
  id: string;
  timestamp: string;
  note: string;
  mood?: '🌱' | '🔥' | '✨' | '🧗'; // Growing, On Fire, Magic, Climbing
}

export type ReminderFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly';

export interface AppReminder {
  enabled: boolean;
  frequency: ReminderFrequency; // Hourly, Daily, Weekly, Monthly
  time: string; // HH:mm format (for daily/weekly/monthly)
  dayOfWeek?: number; // 0-6 for weekly (0 = Sunday)
  dayOfMonth?: number; // 1-31 for monthly
  useDeviceCalendar?: boolean; // Use device calendar for scheduling
  calendarEventId?: string; // Store event ID for calendar updates/deletions
  useNtfyPush?: boolean; // Use ntfy.sh for push notifications
  ntfyTopic?: string; // ntfy.sh topic name (user's private topic)
  ntfyServer?: string; // Custom ntfy server URL (defaults to https://ntfy.sh)
  lastNotifiedDay?: string; // YYYY-MM-DD to avoid duplicate notifications
  lastNotifiedHour?: number; // Last hour notified to avoid multiple triggers in same hour
  lastNotifiedWeek?: string; // YYYY-MM-DD for weekly
  lastNotifiedMonth?: string; // YYYY-MM-DD for monthly
}

export interface AppSettings {
  reminders: AppReminder;
  lcswConfig?: LCSWConfig;
  emailSchedule?: EmailSchedule;
}

export interface EmailSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:mm format
  recipientEmails: string[];
  lastSent?: string;
  sendGoalCompletions: boolean;
  sendReports: boolean;
}

export interface LCSWConfig {
  // Treatment protocols the LCSW uses
  protocols: ('CBT' | 'DBT' | 'ACT' | 'EMDR' | 'Other')[];
  // Safety phrases that trigger crisis routing
  crisisPhrases: string[];
  // Emergency contact information
  emergencyContact?: {
    name: string;
    phone: string;
    notes?: string;
  };
  // Custom homework/worksheets
  customPrompts?: string[];
  // Whether AI should provide structured recommendations
  allowStructuredRecommendations: boolean;
}

export interface Goal {
  id: string;
  valueId: string;
  text: string;
  frequency: GoalFrequency;
  completed: boolean;
  createdAt: string;
  updates: GoalUpdate[];
}

export enum ReportFormat {
  SOAP = 'SOAP',
  DAP = 'DAP',
  BIRP = 'BIRP',
}

export interface AIAdvice {
  text: string;
  type: 'encouragement' | 'action' | 'analysis';
}

export interface MentalStateAssessment {
  anxietySeverity: 'low' | 'moderate' | 'high';
  depressionSeverity: 'low' | 'moderate' | 'high';
  keyThemes: string[];
  recommendedActions: string[];
  timestamp: string;
}

export interface CrisisDetection {
  isCrisis: boolean;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  detectedPhrases: string[];
  recommendedAction: 'continue' | 'show_crisis_info' | 'contact_lcsw' | 'emergency';
  categories?: string[]; // Crisis categories detected
}
