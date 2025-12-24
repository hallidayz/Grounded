
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
}

export type GoalFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface GoalUpdate {
  id: string;
  timestamp: string;
  note: string;
  mood?: '🌱' | '🔥' | '✨' | '🧗'; // Growing, On Fire, Magic, Climbing
}

export interface AppReminder {
  enabled: boolean;
  time: string; // HH:mm format
  recurringHourly?: boolean; // New: Repeat every hour during daylight
  lastNotifiedDay?: string; // YYYY-MM-DD to avoid duplicate notifications for daily
  lastNotifiedHour?: number; // Last hour notified to avoid multiple triggers in same hour
}

export interface AppSettings {
  reminders: AppReminder;
  lcswConfig?: LCSWConfig;
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
}
