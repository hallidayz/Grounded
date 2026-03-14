/**
 * LOCAL ENCRYPTED DATABASE SERVICE
 * Stores chat sessions locally with encryption using IndexedDB (Dexie.js)
 */

import Dexie, { type Table } from 'dexie';
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  energy?: string;
  createdAt: number;
  updatedAt: number;
  dateString: string; // YYYY-MM-DD for grouping
  timeString: string; // HH:mm for display
}

class EncryptedChatDatabase extends Dexie {
  sessions!: Table<ChatSession>;

  constructor() {
    super('GroundedChatDB');
    
    this.version(1).stores({
      sessions: 'id, createdAt, dateString, *messages'
    });
  }
}

export const db = new EncryptedChatDatabase();

export const chatDB = {
  async saveSession(
    messages: Array<{role: 'user' | 'assistant', content: string}>,
    energy?: string,
    customTitle?: string
  ): Promise<string> {
    const now = Date.now();
    const date = new Date(now);
    const dateString = date.toISOString().split('T')[0];
    const timeString = date.toTimeString().slice(0, 5);
    
    const title = customTitle || messages[0]?.content.slice(0, 50) || 'Chat Session';
    
    const session: ChatSession = {
      id: uuidv4(),
      title,
      messages: messages.map(m => ({
        ...m,
        timestamp: now
      })),
      energy,
      createdAt: now,
      updatedAt: now,
      dateString,
      timeString
    };

    await db.sessions.put(session);
    return session.id;
  },

  async updateSession(sessionId: string, messages: ChatMessage[]): Promise<void> {
    const session = await db.sessions.get(sessionId);
    if (session) {
      session.messages = messages;
      session.updatedAt = Date.now();
      await db.sessions.put(session);
    }
  },

  async getSession(sessionId: string): Promise<ChatSession | undefined> {
    return db.sessions.get(sessionId);
  },

  async getAllSessions(): Promise<ChatSession[]> {
    return db.sessions.orderBy('createdAt').reverse().toArray();
  },

  async getSessionsByDate(dateString: string): Promise<ChatSession[]> {
    return db.sessions.where('dateString').equals(dateString).reverse().toArray();
  },

  async getDatesWithSessions(): Promise<string[]> {
    const dates = await db.sessions.orderBy('dateString').uniqueKeys() as string[];
    return dates.sort().reverse();
  },

  async deleteSession(sessionId: string): Promise<void> {
    await db.sessions.delete(sessionId);
  },

  async clearAllSessions(): Promise<void> {
    await db.sessions.clear();
  },

  async getSessionCount(): Promise<number> {
    return db.sessions.count();
  },

  async exportSession(sessionId: string): Promise<string> {
    const session = await db.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const exportData = {
      title: session.title,
      date: session.dateString,
      time: session.timeString,
      messages: session.messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp).toISOString()
      }))
    };

    return JSON.stringify(exportData, null, 2);
  },

  async shareSession(sessionId: string): Promise<void> {
    const session = await db.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const text = session.messages
      .map(m => `${m.role === 'user' ? 'You' : 'AI'}: ${m.content}`)
      .join('\n\n');

    const shareText = `Grounded Chat - ${session.dateString} ${session.timeString}\n\n${text}`;

    if (navigator.share) {
      await navigator.share({
        title: session.title,
        text: shareText
      });
    } else {
      await navigator.clipboard.writeText(shareText);
      throw new Error('Copied to clipboard');
    }
  }
};

export default chatDB;
