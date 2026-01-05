
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
  selfAdvocacy?: string; // The AI-generated self-advocacy goal
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

export type AIModelType = 'distilbert' | 'lamini';

export interface AppSettings {
  reminders: AppReminder;
  lcswConfig?: LCSWConfig;
  emailSchedule?: EmailSchedule;
  aiModel?: AIModelType; // Selected AI model (default: 'lamini' for healthcare/psychology)
}

export interface EmailSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:mm format
  dayOfWeek?: number; // 0-6 for weekly (0 = Sunday)
  dayOfMonth?: number; // 1-31 for monthly
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
  inferenceAnalysis?: string; // Inference analysis for the Self-Advocacy Aim
  lcsmInferences?: {
    encouragement: string; // First LCSM inference for encouragement
    guidance: string; // Second LCSM inference for guidance
  };
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
    email?: string; // Added email
    notes?: string;
  };
  // Custom homework/worksheets
  customPrompts?: string[];
  // Whether AI should provide structured recommendations
  allowStructuredRecommendations: boolean;
}

export interface Goal {
  id: string;
  valueId: string; // Keep for backward compatibility or link to value
  userId?: string; // Added FK
  assessmentId?: string; // Link to AI assessment
  text: string;
  frequency: GoalFrequency;
  completed: boolean;
  createdAt: string;
  updates: GoalUpdate[];
  status?: 'pending' | 'active' | 'completed' | 'archived'; // Enhanced status
}

export interface Assessment {
  id: string;
  userId: string;
  emotion: string;
  subEmotion: string;
  reflection: string;
  assessment: string;
  timestamp: string;
}

export interface CounselorReport {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  emailAddresses: string[];
  treatmentProtocols: string[];
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
  timestamp: string; // ISO datetime
  emotion: string; // emotionalState (renamed for consistency)
  subEmotion: string | null; // selectedFeeling (renamed for consistency)
  jsonIn?: string; // JSON string of input to AI
  jsonOut?: string; // JSON string of AI response
  focusLens?: string; // AI-generated focus lens text
  reflection?: string; // User's deep reflection text
  selfAdvocacy?: string; // Self-advocacy aim/goal text
  frequency?: GoalFrequency; // 'daily' | 'weekly' | 'monthly'
  frequency?: GoalFrequency; // 'daily' | 'weekly' | 'monthly'
  jsonAssessment?: string; // JSON string of reflection analysis
  // Legacy fields for backward compatibility
  emotionalState?: 'drained' | 'heavy' | 'overwhelmed' | 'mixed' | 'calm' | 'hopeful' | 'positive' | 'energized';
  selectedFeeling?: string | null;
  aiResponse?: string; // The AI-generated encouragement or rule-based fallback
  isAIResponse?: boolean; // true if from AI, false if rule-based fallback
  lowStateCount?: number; // Count of consecutive low states for pattern tracking
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

export interface RuleBasedUsageLog {
  id: string;
  timestamp: string; // ISO datetime
  operationType: 'encouragement' | 'focusLens' | 'reflectionAnalysis' | 'goalSuggestion';
  emotionalState?: string;
  subEmotion?: string | null;
  valueId?: string;
  valueCategory?: string;
  frequency?: GoalFrequency;
  fallbackKey: string; // Which fallback table entry was used
  fallbackResponse: string; // JSON string of response used
  context: {
    timeOfDay?: string;
    recentJournalText?: string;
    userPatterns?: any;
  };
  aiUnavailableReason?: 'notLoaded' | 'loading' | 'error' | 'timeout';
  userId: string;
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
