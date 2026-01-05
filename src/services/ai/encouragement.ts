import { ValueItem, LCSWConfig, ReflectionAnalysisResponse, CounselingGuidanceResponse } from '../types';
import { generateText } from '../aiService';
import { getSelectedModel } from './models';
import { CrisisResponse } from '../safetyService';

// Helper to get user's name (placeholder for now, will connect to user context)
const getUserName = () => {
  try {
    const userStr = localStorage.getItem('user_data');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.name || user.username || 'Friend';
    }
  } catch (e) {
    // ignore
  }
  return 'Friend';
};

export async function analyzeReflection(
  activeValue: ValueItem,
  reflection: string,
  emotionalState: string,
  selectedFeeling: string | null,
  lcswConfig?: LCSWConfig
): Promise<ReflectionAnalysisResponse | CrisisResponse> {
  // Use text-generation model
  const modelName = getSelectedModel() || 'Xenova/LaMini-Flan-T5-77M';
  const userName = getUserName();
  
  const prompt = `
    You are a compassionate, licensed clinical social worker (LCSW).
    User: ${userName}
    Value: ${activeValue.name}
    Emotion: ${selectedFeeling ? `${emotionalState} (${selectedFeeling})` : emotionalState}
    Reflection: "${reflection}"

    Analyze this reflection through the lens of their value and emotion.
    Address ${userName} directly.
    
    Return ONLY a JSON object with:
    1. "coreThemes": [Array of 2-3 brief themes]
    2. "lcswLens": "One compassionate sentence connecting their feeling to their value."
    3. "reflectiveInquiry": [Array of 2 growth questions]
    4. "sessionPrep": "One sentence summary for therapy."
  `;

  try {
    const response = await generateText(prompt, modelName);
    
    // Check if response is a CrisisResponse object
    if (typeof response === 'object' && 'isCrisis' in response) {
      return response as CrisisResponse;
    }

    // It's a string, proceed with parsing
    const textResponse = response as string;

    // Parse JSON from response (handling potential non-JSON prefix/suffix)
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid JSON response');
  } catch (error) {
    console.error('AI Analysis failed, using fallback:', error);
    // Fallback logic...
    return {
      coreThemes: ['Self-reflection', 'Emotional awareness', 'Value alignment'],
      lcswLens: `It sounds like you're exploring how your feeling of ${selectedFeeling || emotionalState} relates to ${activeValue.name}.`,
      reflectiveInquiry: [
        `How does ${activeValue.name} support you when you feel ${selectedFeeling || emotionalState}?`,
        'What is one small way to honor this value today?'
      ],
      sessionPrep: `Discussing the intersection of ${activeValue.name} and ${selectedFeeling || emotionalState}.`
    };
  }
}

export async function generateFocusLens(
  activeValue: ValueItem,
  mantra: string,
  emotionalState: string,
  selectedFeeling: string | null
): Promise<string> {
  const modelName = getSelectedModel() || 'Xenova/LaMini-Flan-T5-77M';
  const userName = getUserName();
  
  const prompt = `
    User: ${userName}
    Role: Supportive Coach
    Value: ${activeValue.name}
    Mantra: ${mantra}
    Feeling: ${selectedFeeling || emotionalState}
    
    Give ${userName} a one-sentence "Focus Lens" that validates their feeling while pointing to their value.
    Use "you".
  `;
  
  try {
    const response = await generateText(prompt, modelName);
    // Crisis response handling for simple text generation?
    // Usually focus lens is generated from limited context, but user input is involved?
    // Focus lens inputs: mantra (string), selectedFeeling (string). 
    // It doesn't take free text input from user (except maybe mantra if custom?).
    // The prompt includes mantra. If mantra contains crisis words...
    // But generateText returns string | CrisisResponse now.
    
    if (typeof response === 'object' && 'isCrisis' in response) {
      // If crisis detected in focus lens inputs (unlikely but possible), fallback
      return `Let your value of ${activeValue.name} guide you through this feeling.`;
    }
    
    return response as string;
  } catch (error) {
    return `Let your value of ${activeValue.name} guide you through this feeling.`;
  }
}

export async function suggestGoal(
  activeValue: ValueItem,
  frequency: string,
  reflection: string,
  guidance: CounselingGuidanceResponse | null,
  lcswConfig?: LCSWConfig,
  emotionalState?: string,
  selectedFeeling?: string | null,
  analysis?: ReflectionAnalysisResponse | null
): Promise<string> {
  const modelName = getSelectedModel() || 'Xenova/LaMini-Flan-T5-77M';
  const userName = getUserName();
  
  const prompt = `
    User: ${userName}
    Role: Behavioral Therapist
    Value: ${activeValue.name}
    Freq: ${frequency}
    Feeling: ${selectedFeeling || emotionalState || 'neutral'}
    Reflection: "${reflection}"

    Suggest ONE small, concrete SMART goal for ${userName} to do ${frequency}.
    Start with a verb. Under 15 words.
  `;

  try {
    const response = await generateText(prompt, modelName);
    
    if (typeof response === 'object' && 'isCrisis' in response) {
       // Crisis detected in goal suggestion (which uses reflection text)
       // We should probably NOT return a goal but maybe a safety message?
       // Or simpler: just return a safe fallback goal.
       // The crisis modal should have been triggered by analyzeReflection already.
       return `Prioritize your safety and well-being today.`;
    }

    return response as string;
  } catch (error) {
    return `Practice ${activeValue.name} for 5 minutes.`;
  }
}

export async function generateEncouragement(value: ValueItem): Promise<string> {
  const modelName = getSelectedModel() || 'Xenova/LaMini-Flan-T5-77M';
  const userName = getUserName();
  
  const prompt = `
    User: ${userName}
    Value: ${value.name}
    
    Give ${userName} a brief, encouraging message about ${value.name}.
    Be supportive and personal. Use "you". Under 50 words.
  `;
  
  try {
    const response = await generateText(prompt, modelName);
    if (typeof response === 'object' && 'isCrisis' in response) {
      return `Remember that ${value.name} is important to you.`;
    }
    return response as string;
  } catch (error) {
    return `Remember that ${value.name} is important to you.`;
  }
}

export async function generateEmotionalEncouragement(
  emotion: string,
  subEmotion?: string | null
): Promise<string> {
  const modelName = getSelectedModel() || 'Xenova/LaMini-Flan-T5-77M';
  const userName = getUserName();
  
  const prompt = `
    User: ${userName}
    Emotion: ${subEmotion ? `${emotion} (${subEmotion})` : emotion}
    
    Give ${userName} a brief, encouraging message about feeling ${emotion}.
    Be supportive and validating. Use "you". Under 50 words.
  `;
  
  try {
    const response = await generateText(prompt, modelName);
    if (typeof response === 'object' && 'isCrisis' in response) {
      return `Your feelings are valid. Take care of yourself.`;
    }
    return response as string;
  } catch (error) {
    return `Your feelings are valid. Take care of yourself.`;
  }
}

export async function generateValueMantra(value: ValueItem): Promise<string> {
  const modelName = getSelectedModel() || 'Xenova/LaMini-Flan-T5-77M';
  const userName = getUserName();
  
  const prompt = `
    User: ${userName}
    Value: ${value.name}
    
    Create a short, inspiring mantra (1-2 sentences) about ${value.name} for ${userName}.
    Use "you". Be personal and motivating.
  `;
  
  try {
    const response = await generateText(prompt, modelName);
    if (typeof response === 'object' && 'isCrisis' in response) {
      return `${value.name} guides you forward.`;
    }
    return response as string;
  } catch (error) {
    return `${value.name} guides you forward.`;
  }
}

export async function generateCounselingGuidance(
  value: ValueItem,
  emotionalState: string,
  reflection: string,
  selectedFeeling?: string | null,
  lcswConfig?: LCSWConfig
): Promise<CounselingGuidanceResponse> {
  const modelName = getSelectedModel() || 'Xenova/LaMini-Flan-T5-77M';
  const userName = getUserName();
  
  const prompt = `
    You are a licensed clinical social worker (LCSW).
    User: ${userName}
    Value: ${value.name}
    Emotion: ${selectedFeeling ? `${emotionalState} (${selectedFeeling})` : emotionalState}
    Reflection: "${reflection}"
    
    Provide therapeutic guidance connecting their emotion and reflection to their value.
    Return ONLY a JSON object with:
    1. "insight": "One compassionate insight"
    2. "guidance": "One actionable guidance statement"
    3. "questions": ["Question 1", "Question 2"]
  `;
  
  try {
    const response = await generateText(prompt, modelName);
    if (typeof response === 'object' && 'isCrisis' in response) {
      return {
        insight: `It sounds like you're going through a difficult time.`,
        guidance: `Please reach out to a mental health professional for support.`,
        questions: [
          `How can you prioritize your safety right now?`,
          `Who can you reach out to for support?`
        ]
      };
    }
    
    const textResponse = response as string;
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid JSON response');
  } catch (error) {
    return {
      insight: `Your reflection on ${value.name} shows self-awareness.`,
      guidance: `Consider how this value can support you through this feeling.`,
      questions: [
        `How does ${value.name} relate to your current emotion?`,
        `What is one small way to honor this value today?`
      ]
    };
  }
}

