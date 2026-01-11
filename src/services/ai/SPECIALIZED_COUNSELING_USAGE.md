# Specialized Counseling System Prompts - Usage Guide

## Philosophy

Generic AI advice (like "take a deep breath") is ineffective because it is too broad. To make AI useful for mental health, we use **System Prompts** to force the model into specialized "lanes" using psychological frameworks.

## How to Use

### 1. Start a New Session

Each counseling interaction should start with a fresh session using a specific system prompt.

```typescript
import { useSpecializedCounseling } from '../hooks/useSpecializedCounseling';
import { SystemPromptType } from '../services/ai/systemPrompts';

function MyComponent() {
  const { startSession, continueSession, session } = useSpecializedCounseling();

  const handleStart = async () => {
    const response = await startSession(
      'limiting-belief-reframer', // System prompt type
      'I believe I will never be successful', // User's initial message
      {
        location: 'at home',
        emotionalState: 'anxious',
      }
    );
    
    // Handle response (could be string or CrisisResponse)
    if (typeof response === 'object' && 'isCrisis' in response) {
      // Show crisis resources
    } else {
      // Display AI response
      console.log(response);
    }
  };
}
```

### 2. Continue the Session

Once a session is started, continue the conversation:

```typescript
const handleContinue = async () => {
  const response = await continueSession('I first felt this way in college');
  // Response continues the therapeutic framework
};
```

### 3. Available System Prompts

#### 1. Limiting Belief Reframer (CBT)
- **Type**: `'limiting-belief-reframer'`
- **Framework**: Cognitive Behavioral Therapy
- **Use Case**: Negative self-beliefs, cognitive distortions
- **Approach**: Evidence-gathering, origin tracing, balanced thought rewriting

#### 2. Inner Critic Translator (IFS)
- **Type**: `'inner-critic-translator'`
- **Framework**: Internal Family Systems
- **Use Case**: Harsh self-criticism, negative self-talk
- **Approach**: Identify protective intent, translate to functional language

#### 3. Impostor Syndrome Reframer
- **Type**: `'impostor-syndrome-reframer'`
- **Framework**: Performance Psychology / Growth Mindset
- **Use Case**: Feeling like a fraud, success attributed to luck
- **Approach**: Achievement inventory, competence evidence extraction

#### 4. Emotional Regulation Coach
- **Type**: `'emotional-regulation-coach'`
- **Framework**: Window of Tolerance
- **Use Case**: Overwhelmed, dysregulated, emotionally flooded
- **Approach**: Name emotion precisely, suggest context-appropriate grounding

#### 5. Loneliness Reframer
- **Type**: `'loneliness-reframer'`
- **Framework**: Social Wellness
- **Use Case**: Feeling lonely or isolated
- **Approach**: Differentiate solitude vs loneliness, connection inventory

#### 6. Gratitude Journal Coach
- **Type**: `'gratitude-journal-coach'`
- **Framework**: Positive Psychology / Three Good Things
- **Use Case**: Wanting deep gratitude practice
- **Approach**: Specificity techniques, body awareness, role identification

### 4. Automatic Recommendation

The system can recommend a prompt based on emotional state:

```typescript
const { recommendPrompt } = useSpecializedCounseling();

const recommended = recommendPrompt('overwhelmed', 'at work');
// Returns: 'emotional-regulation-coach'

if (recommended) {
  await startSession(recommended, userMessage, context);
}
```

### 5. Direct Service Usage

You can also use the service directly without the hook:

```typescript
import {
  startCounselingSession,
  getSystemPrompt,
  getAllSystemPrompts,
} from '../services/ai/specializedCounseling';

// Get all available prompts
const allPrompts = getAllSystemPrompts();

// Get specific prompt info
const promptInfo = getSystemPrompt('limiting-belief-reframer');
console.log(promptInfo.name); // "Limiting Belief Reframer"
console.log(promptInfo.framework); // "Cognitive Behavioral Therapy (CBT)"

// Start session
const response = await startCounselingSession(
  'limiting-belief-reframer',
  'I believe I am not good enough',
  { location: 'at home' }
);
```

## Key Principles

1. **Evidence-Based**: Prompts force the AI to ask for specific evidence, not give generic advice
2. **Structured**: Each prompt follows a psychological framework with clear steps
3. **Context-Aware**: Prompts adapt to user's location and situation
4. **Step-by-Step**: AI waits for user input before moving to next step
5. **No Generic Platitudes**: Prompts explicitly instruct against generic advice

## Integration with Existing Code

The specialized counseling system works alongside existing AI services:

- Crisis detection is automatically applied
- WebLLM (LaMini) is used for inference
- Responses are logged for safety monitoring
- Sessions can be saved to database for continuity

## Example: Full Session Flow

```typescript
const { startSession, continueSession, endSession, session } = useSpecializedCounseling();

// 1. User selects emotional state: "overwhelmed"
// 2. System recommends: 'emotional-regulation-coach'
// 3. Start session
const firstResponse = await startSession(
  'emotional-regulation-coach',
  'I feel completely overwhelmed right now',
  { location: 'at work', emotionalState: 'overwhelmed' }
);

// 4. AI asks: "Where are you right now? (at work, at home, in public)"
// 5. User responds
const secondResponse = await continueSession('I am at work in my office');

// 6. AI provides 3 context-specific grounding techniques
// 7. Continue conversation as needed
// 8. End session when done
endSession();
```
