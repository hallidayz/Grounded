import type { ConversationNode, ConversationState, EnergyLevel } from '../types';

export interface UserValues {
  values: string[];
  priority: string[];
}

let userValues: UserValues = { values: [], priority: [] };
let lowerUserValues: string[] = [];

export function setUserValues(values: UserValues) {
  userValues = values;
  lowerUserValues = values.values.map(v => v.toLowerCase());
}

export function getUserValues(): UserValues {
  return userValues;
}

function checkValuesInInput(input: string): string[] {
  const lowerInput = input.toLowerCase();
  
  return userValues.values.filter((_, index) =>
    lowerInput.includes(lowerUserValues[index])
  );
}

const PANIC_REGEX = /panic|freaking|freak|can't breathe|heart racing|losing it|losing control|dying|spinning out|spinning|失控|疯狂|hyperventilating|chest tight|can't get air|gonna pass out|terrified|horror|emergency|911|emergency room/i;

const MILD_REGEX = /anxious|anxiety|worried|worry|nervous|stressed|stress|on edge|edgy|uneasy|uptight|tense|apprehensive|butterflies|nervous stomach|future|what if/i;

const LOW_REGEX = /tired|exhausted|drained|empty|heavy|numb|nothing|done|can't|no energy|so tired|silence|quiet|just|meh|blah|low|zombie|sleepy|wiped|beat|fried|spent|worn|can't do|too much|over it|checked out| depleted/i;

const HIGH_REGEX = /chaos|crazy|overwhelm|overwhelmed|too much|everything|breaking|crashing|falling apart|can't think|mind racing|spinning|intense|out of control|bombarded|swamped|snowed under/i;

let engine: any = null;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

async function getEngine() {
  if (engine) return engine;
  
  if (isLoading && loadPromise) {
    await loadPromise;
    return engine;
  }
  
  isLoading = true;
  loadPromise = (async () => {
    try {
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
      
      const modelName = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC';
      
      engine = await CreateMLCEngine(
        modelName,
        {
          initProgressCallback: (progress: any) => {
            console.log('Model download progress:', progress.progress, progress.text);
          }
        }
      );
    } catch (error) {
      console.error('Failed to load AI engine:', error);
      engine = null;
      throw error;
    } finally {
      isLoading = false;
    }
  })();
  
  await loadPromise;
  return engine;
}

function classifyEnergy(input: string): 'low' | 'medium' | 'high' | 'panic' | 'mild' | null {
  if (PANIC_REGEX.test(input)) return 'panic';
  if (MILD_REGEX.test(input)) return 'mild';
  if (LOW_REGEX.test(input)) return 'low';
  if (HIGH_REGEX.test(input)) return 'high';
  
  const lower = input.toLowerCase();
  if (lower.includes('swirl') || lower.includes('racing') || lower.includes('busy') || lower.includes('mess')) {
    return 'medium';
  }
  
  return null;
}

function routeToNode(
  userInput: string,
  currentNode: ConversationNode,
  energy: EnergyLevel,
  quickReply?: string
): ConversationNode {
  const input = quickReply || userInput;
  const lower = input.toLowerCase();
  
  if (currentNode === 'welcome') {
    const energyLevel = classifyEnergy(input);
    if (energyLevel === 'low') return 'low_energy_offer';
    if (energyLevel === 'high') return 'high_chaos_offer';
    if (energyLevel === 'panic') return 'panic_offer';
    if (energyLevel === 'mild') return 'mild_offer';
    return 'medium_swirl_offer';
  }
  
  if (currentNode === 'low_energy_offer') {
    if (lower.includes('yes') || lower.includes('sure') || lower.includes('ok') || lower.includes('guide')) {
      return 'low_energy_yes';
    }
    return 'low_energy_no';
  }
  
  if (currentNode === 'low_energy_no') {
    if (lower.includes('ready') || lower.includes('blue') || lower.includes('color')) {
      return 'low_energy_grounding';
    }
    return 'low_energy_grounding';
  }
  
  if (currentNode === 'low_energy_grounding') {
    return 'low_energy_complete';
  }
  
  if (currentNode === 'medium_swirl_offer') {
    return 'medium_swirl_response';
  }
  
  if (currentNode === 'medium_swirl_response') {
    return 'medium_swirl_grounding';
  }
  
  if (currentNode === 'medium_swirl_grounding') {
    return 'medium_swirl_complete';
  }
  
  if (currentNode === 'high_chaos_offer') {
    if (lower.includes('can\'t') || lower.includes('focus')) {
      return 'high_chaos_grounding';
    }
    return 'high_chaos_grounding';
  }
  
  if (currentNode === 'high_chaos_grounding') {
    if (lower.includes('timer') || lower.includes('pro') || lower.includes('help') || lower.includes('hotline')) {
      return 'high_chaos_crisis';
    }
    if (lower.includes('water') || lower.includes('walk') || lower.includes('rest') || lower.includes('journal')) {
      return 'high_chaos_tiny_steps';
    }
    return 'high_chaos_visualization';
  }
  
  if (currentNode === 'high_chaos_visualization') {
    return 'high_chaos_tiny_steps';
  }
  
  if (currentNode === 'high_chaos_tiny_steps') {
    return 'high_chaos_complete';
  }
  
  if (currentNode === 'high_chaos_crisis') {
    return 'high_chaos_complete';
  }
  
  if (currentNode === 'panic_offer') {
    if (lower.includes('yes') || lower.includes('sure')) {
      return 'panic_yes';
    }
    return 'panic_no';
  }
  
  if (currentNode === 'panic_yes') {
    return 'panic_breath';
  }
  
  if (currentNode === 'panic_no') {
    if (lower.includes('988') || lower.includes('timer') || lower.includes('help')) {
      return 'panic_escalate';
    }
    return 'panic_no';
  }
  
  if (currentNode === 'panic_breath') {
    return 'panic_complete';
  }
  
  if (currentNode === 'panic_escalate') {
    return 'panic_complete';
  }
  
  if (currentNode === 'mild_offer') {
    if (lower.includes(' ') && !lower.includes('everything') && !lower.includes('nothing')) {
      return 'mild_specific';
    }
    return 'mild_general';
  }
  
  if (currentNode === 'mild_specific') {
    return 'mild_anchor';
  }
  
  if (currentNode === 'mild_general') {
    return 'mild_complete';
  }
  
  if (currentNode === 'mild_anchor') {
    return 'mild_complete';
  }
  
  return currentNode;
}

export async function continueConversation(
  state: ConversationState,
  userInput: string,
  quickReply?: string
): Promise<{ message: string; state: ConversationState; quickReplies?: string[] }> {
  try {
    const chatEngine = await getEngine();
    
    const nextNode = routeToNode(userInput, state.node, state.energy, quickReply);
    
    const matchedValues = checkValuesInInput(userInput);
    const valuesSection = matchedValues.length > 0 
      ? `\n\n## Detected Values in User's Input\n${matchedValues.join(', ')}\n\nIf appropriate, gently connect your suggestion to what matters to them.`
      : '';

    const systemPrompt = `You are a warm, practical support companion. The user just completed a breathing exercise and shared what's on their mind.

## User's Input
"${userInput}"

## Energy Level
${state.energy}

## Context
- The user selected a "${state.energy}" session
- They took time to breathe first
- They want support with what's above${valuesSection}

## What Good Help Looks Like

When someone shares what's hard, you help them:
1. Feel understood first — they need to feel seen before they can move
2. Find one clear, doable thing — not a list, just one next step
3. Remember they're capable — even when they don't feel it

## Your Voice
- Warm and steady, like a good friend who gets it
- Practical, not preachy
- Short enough to read, long enough to help
- You use "you" and "your" to make it personal

## What To Offer

Depending on what they're dealing with, suggest ONE of these (or something similar):
- "What if you started tomorrow with just X?"
- "One thing that might help right now is..."
- "For the rest of today, try..."
- "A small win you could have today is..."
- "When you're ready, one step toward X could be..."

## Examples of Good Responses

User: "I'm overwhelmed with work"
Good response: "That sounds like a lot to carry. One thing that might help right now is writing down just the top 3 things — then letting the rest wait until tomorrow."

User: "I can't stop worrying about my family"
Good response: "That's heavy to carry. What if you reached out to just one person today, even a short text? Connection can ease the worry."

## What NOT To Do
- Don't give long lists
- Don't say "take it one day at a time" — it's not helpful
- Don't minimize their struggle
- Don't lecture or be preachy

## Important
- Reference what they shared — show you heard them
- Match your response to their energy level (10s = short, 2min/5min = more space)
- If they mention self-harm or suicide, gently mention 988 (US crisis line)

${state.energy === '10s' ? 'Keep your response SHORT — under 15 words.' : ''}`;

    const contextMessages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: `The user shared: "${userInput}"\n\nEnergy level: ${state.energy}\n\nWhat would be a helpful, warm response?` },
    ];
    
    const response = await chatEngine.chat.completions.create({
      messages: contextMessages,
      max_tokens: 120,
      temperature: 0.8,
    });
    
    const aiMessage = response.choices[0]?.message?.content || '';
    
    return {
      message: aiMessage,
      state: {
        node: nextNode,
        energy: state.energy,
        depth: state.depth + 1,
        lastUserInput: userInput,
      },
    };
  } catch (error) {
    console.error('AI conversation failed:', error);
    return getFallbackResponse(state, userInput, quickReply);
  }
}

function getFallbackResponse(
  state: ConversationState,
  userInput: string,
  quickReply?: string
): { message: string; state: ConversationState } {
  const node = routeToNode(userInput, state.node, state.energy, quickReply);
  
  const fallbackMessages: Record<ConversationNode, string> = {
    welcome: "Pause. What's moving through you? Take your time...",
    low_energy_offer: "That's heavy to carry. You're safe here. Want 1 slow breath with me?",
    low_energy_yes: "Good. Hand on heart? In... 4... hold 4... out 8... What's 1 thing you see nearby?",
    low_energy_no: "That's okay. Here's quiet space. Tap when ready, or name 1 color you see.",
    low_energy_grounding: "Notice that. Now — 4 more things you can see?",
    low_energy_complete: "You're doing this. Rest here as long as you need. I'm with you.",
    medium_swirl_offer: "Sounds swirling — I see you. Name 1 thing you can touch right now?",
    medium_swirl_response: "Feel its texture. Good anchor. What's 1 sound nearby?",
    medium_swirl_grounding: "That grounding. 3 things you can feel? Then 2 you smell? 1 you taste?",
    medium_swirl_complete: "Thoughts passing like clouds. You're here, steady. What feels steady right now?",
    high_chaos_offer: "You're holding so much — here's space to set it down. Safe with me. Hand on heart?",
    high_chaos_grounding: "That's okay, just breathe. What's 1 safe thing under your feet?",
    high_chaos_visualization: "Grounded there. Chaos doesn't own you. Picture a calm place — what do you see?",
    high_chaos_tiny_steps: "This feels big. Name 1 tiny step? Water? Walk? Journal?",
    high_chaos_crisis: "Want hotlines nearby? You're not alone.",
    high_chaos_complete: "You showed up for yourself. That's everything.",
    panic_offer: "I see the panic — you're safe right here with me. Hand on heart. Feet on floor. Can you press your feet down?",
    panic_yes: "Perfect anchor. 1 thing you feel under your fingers?",
    panic_no: "That's alright. You're held here. Notice air on your face? Just the air. In... out...",
    panic_breath: "Good. 1 slow breath with me? In 3... hold 3... out 6. You're pulling through. Name 1 color you see.",
    panic_escalate: "Want a 988 timer or stay in this breath space with me?",
    panic_complete: "You made it through that wave. I'm still here.",
    mild_offer: "I feel that edge with you. What's the main worry showing up right now?",
    mild_specific: "That sounds heavy to carry. Can you name 1 thing that's certain right now?",
    mild_general: "The hum of anxiety. Normal to feel that. What's 1 small thing feeling steady under all this?",
    mild_anchor: "Good anchor. Let that worry float next to it. Notice which feels more solid?",
    mild_complete: "You're being with it instead of fighting it. That's real progress.",
    crisis_resources: "Here are some resources nearby...",
    session_complete: "Thank you for being here. You've done hard work. Rest well.",
  };
  
  return {
    message: fallbackMessages[node] || "I'm here with you. Take your time.",
    state: {
      node,
      energy: state.energy,
      depth: state.depth + 1,
      lastUserInput: userInput,
    },
  };
}

export async function generateWelcomeMessage(): Promise<string> {
  return "Pause. What's moving through you?";
}

export function isAILoading(): boolean {
  return isLoading;
}

export function getAILoadStatus(): { loaded: boolean; loading: boolean } {
  return {
    loaded: engine !== null,
    loading: isLoading,
  };
}

export interface RealityCheckAISuggestion {
  questions: string[];
  exampleEvidenceFor: string[];
  exampleEvidenceAgainst: string[];
}

export interface RealityCheckVerdict {
  balancedThoughts: string[];
  encouragement: string;
}

/**
 * Get AI suggestions for Reality Check technique
 * Provides reflective questions and example evidence (labeled as examples)
 */
export async function getRealityCheckSuggestions(
  thought: string,
  evidenceFor: string[],
  evidenceAgainst: string[]
): Promise<RealityCheckAISuggestion> {
  try {
    const chatEngine = await getEngine();
    
    const systemPrompt = `You are a gentle CBT co-counsel helping someone examine a thought.

The user has the thought: "${thought}"
They have provided this evidence FOR the thought: ${evidenceFor.length > 0 ? evidenceFor.join(', ') : 'None yet'}
They have provided this evidence AGAINST the thought: ${evidenceAgainst.length > 0 ? evidenceAgainst.join(', ') : 'None yet'}

Your job is to:
1. Suggest 2-3 questions that might help the user notice additional real-world evidence, without giving them the answers.
2. Propose 1-2 possible examples of evidence FOR and 1-2 possible examples of evidence AGAINST that a typical person might consider, clearly labeled as 'examples, not facts about you'.

Keep the tone validating, brief, and beginner-friendly. Avoid telling the user what to believe; focus on curiosity.

Format your response as JSON:
{
  "questions": ["question 1", "question 2", "question 3"],
  "exampleEvidenceFor": ["example 1", "example 2"],
  "exampleEvidenceAgainst": ["example 1", "example 2"]
}`;

    const contextMessages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: `Generate suggestions for examining the thought: "${thought}"` },
    ];
    
    const response = await chatEngine.chat.completions.create({
      messages: contextMessages,
      max_tokens: 200,
      temperature: 0.7,
    });
    
    const aiMessage = response.choices[0]?.message?.content || '';
    
    // Try to parse JSON response
    try {
      const parsed = JSON.parse(aiMessage);
      return {
        questions: parsed.questions || [],
        exampleEvidenceFor: parsed.exampleEvidenceFor || [],
        exampleEvidenceAgainst: parsed.exampleEvidenceAgainst || [],
      };
    } catch {
      // Fallback: extract from text
      return {
        questions: [
          'What happened in the last week that supports this thought?',
          'What happened that doesn\'t fit this story?',
        ],
        exampleEvidenceFor: ['Example: A recent setback'],
        exampleEvidenceAgainst: ['Example: A time things went differently'],
      };
    }
  } catch (error) {
    console.error('Reality Check AI suggestions failed:', error);
    // Return helpful fallback
    return {
      questions: [
        'What happened in the last week that supports this thought?',
        'What happened that doesn\'t fit this story at all?',
        'What would someone who cares about you notice?',
      ],
      exampleEvidenceFor: ['Example: A recent challenge'],
      exampleEvidenceAgainst: ['Example: A time things worked out'],
    };
  }
}

/**
 * Get AI-generated balanced thoughts for the verdict step
 */
export async function getRealityCheckVerdict(
  thought: string,
  evidenceFor: string[],
  evidenceAgainst: string[]
): Promise<RealityCheckVerdict> {
  try {
    const chatEngine = await getEngine();
    
    const systemPrompt = `You are a gentle CBT co-counsel helping someone find a balanced perspective.

The user's original thought: "${thought}"
Evidence FOR: ${evidenceFor.join(', ') || 'None'}
Evidence AGAINST: ${evidenceAgainst.join(', ') || 'None'}

Your job is to:
1. Propose 1-2 candidate balanced thoughts that acknowledge both sides, clearly labeled as "example wordings you can edit."
2. Provide a gentle, non-competitive encouragement message.

Keep it validating, brief, and beginner-friendly. The balanced thoughts should feel more accurate than the original, not dismissive.

Format your response as JSON:
{
  "balancedThoughts": ["balanced thought 1", "balanced thought 2"],
  "encouragement": "encouraging message"
}`;

    const contextMessages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: `Generate a balanced perspective for: "${thought}"` },
    ];
    
    const response = await chatEngine.chat.completions.create({
      messages: contextMessages,
      max_tokens: 150,
      temperature: 0.7,
    });
    
    const aiMessage = response.choices[0]?.message?.content || '';
    
    try {
      const parsed = JSON.parse(aiMessage);
      return {
        balancedThoughts: parsed.balancedThoughts || [],
        encouragement: parsed.encouragement || 'You just practiced examining a thought instead of automatically believing it. That\'s a big skill.',
      };
    } catch {
      return {
        balancedThoughts: [
          `Example: While ${thought.toLowerCase()}, there's also evidence that suggests a more balanced view.`,
        ],
        encouragement: 'You just practiced examining a thought instead of automatically believing it. That\'s a big skill.',
      };
    }
  } catch (error) {
    console.error('Reality Check verdict failed:', error);
    return {
      balancedThoughts: [
        `Example: While ${thought.toLowerCase()}, there's also evidence that suggests a more balanced view.`,
      ],
      encouragement: 'You just practiced examining a thought instead of automatically believing it. That\'s a big skill.',
    };
  }
}
