import 'fake-indexeddb/auto';
import { v4 as uuidv4 } from 'uuid';
import Dexie from 'dexie';

// Define the DB exactly as in the app to avoid module resolution issues with experimental-strip-types
class EncryptedChatDatabase extends Dexie {
  sessions: any;

  constructor() {
    super('GroundedChatDB');

    this.version(1).stores({
      sessions: 'id, createdAt, dateString, *messages'
    });
  }
}

const db = new EncryptedChatDatabase();

// Setup mock DB
async function setupMockDB(numRecords: number) {
  await db.sessions.clear();
  const sessions = [];
  const start = Date.now();
  for (let i = 0; i < numRecords; i++) {
    const date = new Date(start - Math.random() * 1000 * 60 * 60 * 24 * 365);
    const dateString = date.toISOString().split('T')[0];
    sessions.push({
      id: uuidv4(),
      title: 'Mock Chat',
      messages: Array.from({ length: 50 }, (_, j) => ({
        role: j % 2 === 0 ? 'user' : 'assistant',
        content: 'x'.repeat(100), // make it somewhat large
        timestamp: date.getTime()
      })),
      createdAt: date.getTime(),
      updatedAt: date.getTime(),
      dateString,
      timeString: date.toTimeString().slice(0, 5)
    });
  }
  await db.sessions.bulkPut(sessions);
}

async function run() {
  await setupMockDB(1000); // 1000 sessions with 50 messages each

  const iterations = 5;
  let totalTimeOld = 0;

  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    // Old implementation
    const sessions = await db.sessions.toArray();
    const datesOld = [...new Set(sessions.map(s => s.dateString))].sort().reverse();
    const t1 = performance.now();
    totalTimeOld += (t1 - t0);
  }

  console.log(`Old implementation average time: ${totalTimeOld / iterations} ms`);

  let totalTimeNew = 0;
  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    // New implementation
    const datesNew = (await db.sessions.orderBy('dateString').uniqueKeys() as string[]).sort().reverse();
    const t1 = performance.now();
    totalTimeNew += (t1 - t0);
  }

  console.log(`New implementation average time: ${totalTimeNew / iterations} ms`);

  process.exit(0);
}

run().catch(console.error);
