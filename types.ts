
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
