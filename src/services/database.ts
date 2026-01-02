import Dexie, { Table } from 'dexie';

// Define interfaces for all your data types
export interface User {
  id?: number;
  email: string;
  name?: string;
  createdAt: Date;
  // Add other user properties as needed
}

export interface AppData {
  key: string;
  value: any;
}

export interface ResetToken {
  id?: number;
  userId: number;
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface FeelingLog {
  id?: number;
  userId: number;
  emotionalState: string;
  selectedFeeling: string;
  timestamp: Date;
  jsonIn?: any;
  jsonOut?: any;
  focusLens?: string;
  reflection?: string;
  selfAdvocacy?: string;
  frequency?: string; // Example: daily, weekly
  jsonAssessment?: any;
  isAIResponse?: boolean;
  // Add other properties as they exist in your current FeelingLog
}

export interface Reflection {
  id?: number;
  mood: string;
  values: string[];
  createdAt: Date;
  // Add other reflection properties
}

export interface Metadata {
  key: string;
  value: any;
}

export interface RuleBasedUsageLog {
  id?: number;
  timestamp: Date;
  feature: string;
  fallbackReason: string;
  input: any;
  output: any;
}

export class AppDatabase extends Dexie {
  users!: Table<User, number>;
  appData!: Table<AppData, string>;
  resetTokens!: Table<ResetToken, number>;
  feelingLogs!: Table<FeelingLog, number>;
  reflections!: Table<Reflection, number>; // Assuming reflections are separate or part of feelingLogs
  metadata!: Table<Metadata, string>;
  ruleBasedUsageLogs!: Table<RuleBasedUsageLog, number>;


  constructor() {
    super('GroundedDB');
    this.version(1).stores({ // Start with version 1
      users: '++id, email',
      appData: '&key', // '&' makes key unique
      resetTokens: '++id, userId',
      feelingLogs: '++id, userId, timestamp',
      reflections: '++id, mood, createdAt', // Example, adjust if reflections are part of feelingLogs
      metadata: '&key', // For general app metadata
      ruleBasedUsageLogs: '++id, timestamp',
    });

    // Example of a future migration to version 2
    this.version(2).stores({
      // Add new stores or modify existing ones for version 2
      // For example, if you add a 'goals' store:
      // goals: '++id, userId, valueId, text, createdAt',
    }).upgrade(async (tx) => {
      // Data migration logic for upgrading from version 1 to 2
      // For example, if you added a 'tags' field to reflections:
      // await tx.table('reflections').toCollection().modify(reflection => reflection.tags = []);
    });
  }

  // Add helper methods for common operations
  async addFeelingLog(log: FeelingLog) {
    return this.feelingLogs.add(log);
  }

  async getFeelingLogs(userId: number) {
    return this.feelingLogs.where('userId').equals(userId).toArray();
  }

  // ... other helper methods for users, appData, etc.
}

export const db = new AppDatabase();
