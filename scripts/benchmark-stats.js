import { getUserStats, trackCompletion } from '../src/services/settings.ts';

// Mock localStorage
const store = {
  user_stats: JSON.stringify({ "session1": 5, totalCompletions: 10 })
};
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = val; },
  removeItem: (key) => { delete store[key]; }
};

const ITERATIONS = 100000;

console.time('getUserStats baseline');
for (let i = 0; i < ITERATIONS; i++) {
  getUserStats();
}
console.timeEnd('getUserStats baseline');
