import { getUserStats, trackCompletion, clearAllData } from '../src/services/settings.ts';
import assert from 'node:assert';

// Mock localStorage
const store = {};
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = val; },
  removeItem: (key) => { delete store[key]; }
};

console.log('Testing initial state...');
assert.deepStrictEqual(getUserStats(), {});

console.log('Testing trackCompletion...');
trackCompletion('session_a');
const stats1 = getUserStats();
assert.strictEqual(stats1['session_a'], 1);
assert.strictEqual(stats1.totalCompletions, 1);
assert.strictEqual(stats1.lastSession, 'session_a');
assert.ok(stats1.lastSessionTime);

console.log('Testing caching mechanism...');
// Modify local storage behind the cache's back
store['user_stats'] = JSON.stringify({ 'session_b': 100 });
const stats2 = getUserStats();
// Cache should return old data, not what we bypassed with!
assert.strictEqual(stats2['session_a'], 1);
assert.strictEqual(stats2['session_b'], undefined);

console.log('Testing clearAllData...');
clearAllData();
assert.strictEqual(store['user_stats'], undefined);

// Cache should be cleared
const stats3 = getUserStats();
assert.deepStrictEqual(stats3, {});
// Modify local storage behind the cache's back after clearing
store['user_stats'] = JSON.stringify({ 'session_b': 100 });
// Now it should fetch from store again
const stats4 = getUserStats();
assert.strictEqual(stats4['session_b'], 100);

console.log('All tests passed!');
