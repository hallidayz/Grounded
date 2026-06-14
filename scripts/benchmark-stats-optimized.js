// Mock localStorage
const store = {
  user_stats: JSON.stringify({ "session1": 5, totalCompletions: 10 })
};
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = val; },
  removeItem: (key) => { delete store[key]; }
};

let cachedStats = null;

function getUserStatsOptimized() {
  if (cachedStats) {
    return cachedStats;
  }
  try {
    const statsStr = localStorage.getItem('user_stats');
    if (statsStr) {
      cachedStats = JSON.parse(statsStr);
      return cachedStats;
    }
    return {};
  } catch {
    return {};
  }
}

function trackCompletionOptimized(sessionKey) {
  try {
    const statsStr = localStorage.getItem('user_stats');
    const stats = statsStr ? JSON.parse(statsStr) : {};

    // Increment completion count for this session
    stats[sessionKey] = (stats[sessionKey] || 0) + 1;
    stats.totalCompletions = (stats.totalCompletions || 0) + 1;
    stats.lastSession = sessionKey;
    stats.lastSessionTime = new Date().toISOString();

    localStorage.setItem('user_stats', JSON.stringify(stats));
    cachedStats = stats;
  } catch (error) {
    console.warn('[Settings] Failed to track session completion:', error);
  }
}

const ITERATIONS = 100000;

console.time('getUserStats optimized');
for (let i = 0; i < ITERATIONS; i++) {
  getUserStatsOptimized();
}
console.timeEnd('getUserStats optimized');
