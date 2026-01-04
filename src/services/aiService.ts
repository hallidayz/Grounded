// src/services/aiService.ts
import { LogEntry } from '../types';

interface AIWorkerResponse {
  id: string;
  output?: any;
  error?: string;
}

// Request Types
interface EncouragementRequest {
  emotion: string;
}

interface AssessmentRequest {
  userId: string;
  emotion: string;
  subEmotion: string;
  reflection: string;
}

interface GoalRequest {
  userId: string;
  assessment: string;
  moodTrends: any[]; // Define specific trend type if available
}

interface ReportRequest {
  userId: string;
  userEntries: LogEntry[];
  treatmentProtocols?: string[];
}

// Response Types
export interface AIEncouragementResponse {
  message: string;
  type: 'encouragement';
  timestamp: string;
}

export interface AIAssessmentResponse {
  assessment: string;
  emotion: string;
  subEmotion: string;
  reflection: string;
  timestamp: string;
}

export interface AIGoalResponse {
  goal: string;
  assessmentId: string; // Linking ID
  timestamp: string;
  status: 'pending';
}

export interface AIReportResponse {
  report: string;
  userId: string;
  timestamp: string;
  emailAddresses: string[];
  treatmentProtocols: string[];
}


let globalWorker: Worker | null = null;
const pendingRequests = new Map<string, { resolve: Function, reject: Function }>();

// Simple in-memory cache for common responses (TTL 5 mins)
const responseCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getWorker(): Worker {
  if (!globalWorker) {
    globalWorker = new Worker(new URL('../workers/aiWorker.ts', import.meta.url), { type: 'module' });
    
    globalWorker.onmessage = (e) => {
      const { id, output, error } = e.data as AIWorkerResponse;
      const request = pendingRequests.get(id);
      
      if (request) {
        if (error) request.reject(new Error(error));
        else request.resolve(output);
        pendingRequests.delete(id);
      }
    };
    
    globalWorker.onerror = (err) => {
      console.error('Global AI Worker Error:', err);
    };
  }
  return globalWorker;
}

// Import the new safety service
import { checkForCrisisKeywords, CrisisResponse } from './safetyService';

// ... (keep existing code for AIWorkerResponse, globalWorker, pendingRequests, getWorker) ...

export function runAIWorker(
  inputText: string, 
  task: string = 'text2text-generation', 
  modelName?: string, 
  generationConfig?: any
): Promise<any | CrisisResponse> {
  
  // --- SAFETY INTERCEPTOR ---
  // Check for crisis keywords FIRST.
  const crisisResponse = checkForCrisisKeywords(inputText);
  if (crisisResponse) {
    // If a crisis is detected, DO NOT proceed to the AI worker.
    // Immediately return the hardcoded safety response.
    console.warn('Crisis keyword detected. Bypassing AI and returning safety response.');
    return Promise.resolve(crisisResponse); 
  }
  // --- END OF SAFETY INTERCEPTOR ---

  // Check cache first
  const cacheKey = `${task}-${modelName}-${inputText}-${JSON.stringify(generationConfig)}`;
  const cached = responseCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    console.log('[AIService] Returning cached response');
    return Promise.resolve(cached.data);
  }

  const id = crypto.randomUUID();
  const worker = getWorker();
  
  return new Promise((resolve, reject) => {
    pendingRequests.set(id, { 
      resolve: (data: any) => {
        // Cache successful response
        responseCache.set(cacheKey, { data, timestamp: Date.now() });
        resolve(data);
      }, 
      reject 
    });
    worker.postMessage({ id, text: inputText, task, modelName, generationConfig });
  });
}

// 1. Emotion Selection AI (Initial Encouragement)
export async function getEmotionEncouragement(emotion: string): Promise<AIEncouragementResponse> {
  const prompt = `You are a compassionate counselor. Respond to someone feeling ${emotion}. Be supportive but brief (under 50 words). Use encouraging, non-judgmental language. Address them directly using 'you'.`;
  
  const output = await runAIWorker(prompt, 'text2text-generation', 'Xenova/LaMini-Flan-T5-77M', {
    max_new_tokens: 60 // ~50 words
  });

  return {
    message: output,
    type: 'encouragement',
    timestamp: new Date().toISOString()
  };
}

// 2. Comprehensive Assessment AI (Counselor Role)
export async function getComprehensiveAssessment(userId: string, emotion: string, subEmotion: string, reflection: string): Promise<AIAssessmentResponse> {
  const prompt = `Counselor's Assessment:
  Emotion: ${emotion}
  Sub-emotion: ${subEmotion}
  Reflection: '${reflection}'
  
  Provide insight about their awareness, acknowledge their feelings, and offer gentle guidance. Be specific to their situation. Limit to 80 words. Address them directly as 'you'.`;

  const output = await runAIWorker(prompt, 'text2text-generation', 'Xenova/LaMini-Flan-T5-77M', {
    max_new_tokens: 120 // ~80-100 words
  });

  return {
    assessment: output,
    emotion,
    subEmotion,
    reflection,
    timestamp: new Date().toISOString()
  };
}

// 3. Self-Advocacy Goal Recommendation
export async function getGoalRecommendation(userId: string, assessment: string, moodTrends: any[]): Promise<AIGoalResponse> {
  // Simplify trends for prompt
  const trendsSummary = moodTrends.slice(0, 3).map(t => `${t.state} (${t.percentage}%)`).join(', ');
  
  const prompt = `Based on this assessment: '${assessment}' and their recent mood trends: [${trendsSummary}], suggest one specific, achievable goal focusing on their wellbeing. Make it actionable and time-bound. Max 60 words.`;

  const output = await runAIWorker(prompt, 'text2text-generation', 'Xenova/LaMini-Flan-T5-77M', {
    max_new_tokens: 80 // ~60 words
  });

  return {
    goal: output,
    assessmentId: 'temp-id', // Needs to be linked after saving assessment
    timestamp: new Date().toISOString(),
    status: 'pending'
  };
}

// 4. Reporting & Email Aggregation
export async function getReportSummary(userId: string, userEntries: LogEntry[], treatmentProtocols: string[] = ['CBT']): Promise<AIReportResponse> {
  // Format entries for prompt (limit to last 5 to save context window)
  const entriesText = userEntries.slice(0, 5).map(e => `- ${e.date.split('T')[0]}: ${e.emotionalState} - ${e.note}`).join('\n');
  const protocolsText = treatmentProtocols.join(', ');

  const prompt = `Create a professional counseling summary for these recent entries:
${entriesText}

Treatment protocols: ${protocolsText}.
Format for counselor review. Be concise yet comprehensive. Focus on themes and progress.`;

  const output = await runAIWorker(prompt, 'text2text-generation', 'Xenova/LaMini-Flan-T5-77M', {
    max_new_tokens: 300 // ~200 words
  });

  return {
    report: output,
    userId,
    timestamp: new Date().toISOString(),
    emailAddresses: [], // To be filled by caller
    treatmentProtocols
  };
}

// Re-export generateText for backward compatibility if needed by other components
export async function generateText(prompt: string, modelName: string): Promise<string | CrisisResponse> {
    return runAIWorker(prompt, 'text2text-generation', modelName);
}
