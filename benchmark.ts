import { performance } from 'perf_hooks';

// Simulate the existing function
function classifyEnergyOld(input: string): string | null {
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

// Pre-compiled regexes
const panicRegex = /(panic|freaking|freak|can't breathe|heart racing|losing it|losing control|dying|spinning out|spinning|失控|疯狂|hyperventilating|chest tight|can't get air|gonna pass out|terrified|horror|emergency|911|emergency room)/i;
const mildRegex = /(anxious|anxiety|worried|worry|nervous|stressed|stress|on edge|edgy|uneasy|uptight|tense|apprehensive|butterflies|nervous stomach|future|what if)/i;
const lowRegex = /(tired|exhausted|drained|empty|heavy|numb|nothing|done|can't|no energy|so tired|drained|empty|silence|quiet|just|meh|blah|low|zombie|sleepy|wiped|beat|fried|spent|worn|can't do|too much|over it|checked out| depleted)/i;
const highRegex = /(chaos|crazy|overwhelm|overwhelmed|too much|everything|breaking|crashing|falling apart|can't think|mind racing|spinning|intense|out of control|bombarded|swamped|snowed under)/i;
const mediumRegex = /(swirl|racing|busy|mess)/i;

function classifyEnergyNew(input: string): string | null {
  if (panicRegex.test(input)) return 'panic';
  if (mildRegex.test(input)) return 'mild';
  if (lowRegex.test(input)) return 'low';
  if (highRegex.test(input)) return 'high';
  if (mediumRegex.test(input)) return 'medium';
  return null;
}

const inputs = [
  "I'm feeling totally fine today",
  "I am freaking out and my heart is racing",
  "Just a bit anxious about the future",
  "so tired and drained from work",
  "everything is chaos and overwhelmed",
  "my mind is a mess and busy",
];

const iterations = 1000000;

let start = performance.now();
for (let i = 0; i < iterations; i++) {
  for (const input of inputs) {
    classifyEnergyOld(input);
  }
}
const oldTime = performance.now() - start;

start = performance.now();
for (let i = 0; i < iterations; i++) {
  for (const input of inputs) {
    classifyEnergyNew(input);
  }
}
const newTime = performance.now() - start;

console.log(`Old implementation: ${oldTime.toFixed(2)} ms`);
console.log(`New implementation: ${newTime.toFixed(2)} ms`);
console.log(`Improvement: ${((oldTime - newTime) / oldTime * 100).toFixed(2)}%`);
