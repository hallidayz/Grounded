
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
  emotionalState?: 'drained' | 'heavy' | 'overwhelmed' | 'mixed' | 'calm' | 'hopeful' | 'positive' | 'energized'; // 8 emotional states
  selectedFeeling?: string; // Specific feeling word selected
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

export type AIModelType = 'distilbert' | 'tinyllama';

export interface AppSettings {
  reminders: AppReminder;
  lcswConfig?: LCSWConfig;
  emailSchedule?: EmailSchedule;
  aiModel?: AIModelType; // Selected AI model (default: 'tinyllama' for healthcare/psychology)
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

// AI Response Types (JSON format for optimized on-device LLM)
export interface ReflectionAnalysisResponse {
  coreThemes: string[]; // 2-3 themes
  lcswLens: string; // Environment/internal state connections
  reflectiveInquiry: string[]; // 2 growth-oriented questions
  sessionPrep: string; // Key takeaway/priority topic
}

export interface GoalSuggestionResponse {
  description: string; // What they'll do
  whatThisHelpsWith: string; // Why it matters
  howToMeasureProgress: string[]; // 3 concrete steps
}

export interface EmotionalEncouragementResponse {
  message: string; // 30-60 words, 2-3 sentences
  acknowledgeFeeling?: string; // Specific feeling acknowledgment
  actionableStep?: string; // Optional small step
}

export interface CounselingGuidanceResponse {
  validation: string; // Validates their experience
  valueConnection: string; // Connects to their value
  actionableStep: string; // Small step before next session
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

export interface FeelingLog {
  id: string;
  timestamp: string; // ISO string
  emotionalState: 'drained' | 'heavy' | 'overwhelmed' | 'mixed' | 'calm' | 'hopeful' | 'positive' | 'energized';
  selectedFeeling: string | null;
  aiResponse: string; // The AI-generated encouragement or rule-based fallback
  isAIResponse: boolean; // true if from AI, false if rule-based fallback
  lowStateCount: number; // Count of consecutive low states for pattern tracking
}

export interface UserInteraction {
  id: string;
  timestamp: string; // ISO string
  type: 'feeling_selected' | 'sub_feeling_selected' | 'suggest_clicked' | 'reflection_started' | 'reflection_committed' | 'card_opened' | 'card_closed' | 'goal_created';
  sessionId: string;
  valueId?: string;
  emotionalState?: string;
  selectedFeeling?: string;
  metadata?: Record<string, any>;
}

export interface Session {
  id: string;
  userId: string;
  startTimestamp: string; // ISO string
  endTimestamp?: string; // ISO string
  valueId: string;
  initialEmotionalState?: string;
  finalEmotionalState?: string;
  selectedFeeling?: string;
  reflectionLength?: number; // Character count, not full text
  goalCreated: boolean;
  duration?: number; // in seconds
}
