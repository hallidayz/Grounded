import { ValueItem, LCSWConfig, ReflectionAnalysisResponse, CounselingGuidanceResponse } from '../../types';
import { generateText } from '../aiService';
import { getSelectedModel } from './models';

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
): Promise<ReflectionAnalysisResponse> {
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
    // Parse JSON from response (handling potential non-JSON prefix/suffix)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
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
    return await generateText(prompt, modelName);
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
    return await generateText(prompt, modelName);
  } catch (error) {
    return `Practice ${activeValue.name} for 5 minutes.`;
  }
}
