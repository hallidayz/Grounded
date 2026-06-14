function classifyEnergyOld(input: string): 'low' | 'medium' | 'high' | 'panic' | 'mild' | null {
  const lower = input.toLowerCase();

  const panicIndicators = [
    'panic', 'freaking', "freak", "can't breathe", 'heart racing', 'losing it',
    'losing control', 'dying', 'spinning out', 'spinning', '失控', '疯狂',
    'hyperventilating', 'chest tight', 'can\'t get air', 'gonna pass out',
    'terrified', 'horror', 'emergency', '911', 'emergency room'
  ];

  const mildIndicators = [
    'anxious', 'anxiety', 'worried', 'worry', 'nervous', 'stressed', 'stress',
    'on edge', 'edgy', 'uneasy', 'uptight', 'tense', 'apprehensive',
    'butterflies', 'nervous stomach', 'future', 'what if'
  ];

  const lowIndicators = [
    'tired', 'exhausted', 'drained', 'empty', 'heavy', 'numb', 'nothing',
    'done', 'can\'t', 'no energy', 'so tired', 'drained', 'empty',
    'silence', 'quiet', 'just', 'meh', 'blah', 'low', 'zombie',
    'sleepy', 'wiped', 'beat', 'fried', 'spent', 'worn',
    'can\'t do', 'too much', 'over it', 'checked out', ' depleted'
  ];

  const highIndicators = [
    'chaos', 'crazy', 'overwhelm', 'overwhelmed', 'too much', 'everything', 'breaking',
    'crashing', 'falling apart', 'can\'t think', 'mind racing', 'spinning',
    'intense', 'out of control', 'bombarded', 'swamped', 'snowed under'
  ];

  for (const indicator of panicIndicators) {
    if (lower.includes(indicator)) return 'panic';
  }

  for (const indicator of mildIndicators) {
    if (lower.includes(indicator)) return 'mild';
  }

  for (const indicator of lowIndicators) {
    if (lower.includes(indicator)) return 'low';
  }

  for (const indicator of highIndicators) {
    if (lower.includes(indicator)) return 'high';
  }

  if (lower.includes('swirl') || lower.includes('racing') || lower.includes('busy') || lower.includes('mess')) {
    return 'medium';
  }

  return null;
}

const PANIC_REGEX = new RegExp([
    'panic', 'freaking', "freak", "can't breathe", 'heart racing', 'losing it',
    'losing control', 'dying', 'spinning out', 'spinning', '失控', '疯狂',
    'hyperventilating', 'chest tight', "can't get air", 'gonna pass out',
    'terrified', 'horror', 'emergency', '911', 'emergency room'
].map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');

const MILD_REGEX = new RegExp([
    'anxious', 'anxiety', 'worried', 'worry', 'nervous', 'stressed', 'stress',
    'on edge', 'edgy', 'uneasy', 'uptight', 'tense', 'apprehensive',
    'butterflies', 'nervous stomach', 'future', 'what if'
].map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');

const LOW_REGEX = new RegExp([
    'tired', 'exhausted', 'drained', 'empty', 'heavy', 'numb', 'nothing',
    'done', "can't", 'no energy', 'so tired', 'drained', 'empty',
    'silence', 'quiet', 'just', 'meh', 'blah', 'low', 'zombie',
    'sleepy', 'wiped', 'beat', 'fried', 'spent', 'worn',
    "can't do", 'too much', 'over it', 'checked out', ' depleted'
].map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');

const HIGH_REGEX = new RegExp([
    'chaos', 'crazy', 'overwhelm', 'overwhelmed', 'too much', 'everything', 'breaking',
    'crashing', 'falling apart', "can't think", 'mind racing', 'spinning',
    'intense', 'out of control', 'bombarded', 'swamped', 'snowed under'
].map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');

const MEDIUM_REGEX = /(swirl|racing|busy|mess)/i;

function classifyEnergyNew(input: string): 'low' | 'medium' | 'high' | 'panic' | 'mild' | null {
  if (PANIC_REGEX.test(input)) return 'panic';
  if (MILD_REGEX.test(input)) return 'mild';
  if (LOW_REGEX.test(input)) return 'low';
  if (HIGH_REGEX.test(input)) return 'high';
  if (MEDIUM_REGEX.test(input)) return 'medium';
  return null;
}

const inputs = [
  "I am feeling so panicked and freaking out right now, my heart racing",
  "I'm feeling very anxious and worried about the future",
  "I am exhausted, tired, feeling like a zombie and wiped out completely",
  "It's chaos, overwhelmed, too much everything falling apart crashing",
  "My mind is in a swirl racing busy mess",
  "Just a normal day, feeling okay, nothing much happening here",
  "Another string that does not match anything and just goes on and on and on and on and on and on and on and on",
  "Panic freak spinning out losing control",
  "Nervous stressed butterflies",
  "Sleepy beat fried spent worn",
  "Intense bombarded swamped snowed under",
  "racing",
];

// Verify correctness
for (const input of inputs) {
  const oldRes = classifyEnergyOld(input);
  const newRes = classifyEnergyNew(input);
  if (oldRes !== newRes) {
    console.error(`Mismatch for "${input}": old=${oldRes}, new=${newRes}`);
  }
}

const iterations = 500000;

console.time("classifyEnergyOld");
for (let i = 0; i < iterations; i++) {
  for (const input of inputs) {
    classifyEnergyOld(input);
  }
}
console.timeEnd("classifyEnergyOld");

console.time("classifyEnergyNew");
for (let i = 0; i < iterations; i++) {
  for (const input of inputs) {
    classifyEnergyNew(input);
  }
}
console.timeEnd("classifyEnergyNew");

const start1 = performance.now();
for (let i = 0; i < iterations; i++) {
  for (const input of inputs) {
    classifyEnergyOld(input);
  }
}
const end1 = performance.now();

const start2 = performance.now();
for (let i = 0; i < iterations; i++) {
  for (const input of inputs) {
    classifyEnergyNew(input);
  }
}
const end2 = performance.now();

console.log(`Old: ${(end1 - start1).toFixed(2)}ms`);
console.log(`New: ${(end2 - start2).toFixed(2)}ms`);
console.log(`Improvement: ${(((end1 - start1) - (end2 - start2)) / (end1 - start1) * 100).toFixed(2)}%`);
