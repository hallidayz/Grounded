
import { GoogleGenAI } from "@google/genai";
import { LogEntry, ValueItem, GoalFrequency } from "../types";

/**
 * GEMINI AI SERVICE
 * This service leverages Google's GenAI for deep reflective support.
 */

// Empathetic, human-to-human encouragement
export const generateEncouragement = async (value: ValueItem, mood: string = '✨'): Promise<string> => {
  try {
    // Always initialize a new GoogleGenAI instance inside the function to use the latest API key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a warm, supportive partner in a user's self-growth journey. 
      The user is focusing on "${value.name}" (which they define as: ${value.description}). 
      Their current mood state is: ${mood}. 
      Write a single, deeply personal, and human sentence of validation. 
      Avoid clinical jargon or "cheerleading." Speak to the soul of the value.`,
    });
    return response.text?.trim() || "Your commitment to your values is your compass.";
  } catch (error) {
    console.error("Gemini Error in generateEncouragement:", error);
    throw error;
  }
};

// A short, punchy mantra for the user to carry
export const generateValueMantra = async (value: ValueItem): Promise<string> => {
  try {
    // Always initialize a new GoogleGenAI instance inside the function to use the latest API key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a 3-5 word mantra for the value of "${value.name}". It should be rhythmic and easy to remember. No hashtags or quotes.`,
    });
    return response.text?.trim() || `Honoring ${value.name} today.`;
  } catch (error) {
    console.error("Gemini Error in generateValueMantra:", error);
    throw error;
  }
};

// Using gemini-3-pro-preview for more thoughtful goal suggestion
export const suggestGoal = async (value: ValueItem, frequency: GoalFrequency, reflection: string = ''): Promise<string> => {
  try {
    // Always initialize a new GoogleGenAI instance inside the function to use the latest API key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Value: ${value.name}. Target Frequency: ${frequency}. User's recent reflection: "${reflection}". 
      Suggest a highly specific and achievable 'micro-win' goal that helps the user embody this value today.
      
      Format the response strictly in Markdown:
      ### Structured Aim
      - **Description**: [The micro-action]
      - **What this helps with**: [Brief psychological benefit]
      - **How do I measure progress**:
        1. [Milestone 1]
        2. [Milestone 2]
        3. [Milestone 3]`,
    });
    return response.text?.trim() || "Set a small, manageable goal that honors your values today.";
  } catch (error) {
    console.error("Gemini Error in suggestGoal:", error);
    throw error;
  }
};

// Using gemini-3-pro-preview for clinical synthesis of logs
export const generateHumanReports = async (logs: LogEntry[], values: ValueItem[]): Promise<string> => {
  try {
    const summary = logs.map(l => {
      const vName = values.find(v => v.id === l.valueId)?.name || 'General';
      return `[${l.date.split('T')[0]}] Value: ${vName}, Mood: ${l.mood}, Note: ${l.note}`;
    }).join('\n');

    // Always initialize a new GoogleGenAI instance inside the function to use the latest API key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are a professional therapist and synthesis engine analyzing a user's value-based reflection logs. 
      Synthesize these logs into a comprehensive report containing SOAP, DAP, and BIRP formats.
      
      Logs to analyze:
      ${summary}
      
      Ensure the tone is human-first, clinical yet insightful, and supportive. Use Markdown headers for formatting. Users are not therapists; they need to feel seen and understood as human beings.`,
    });
    return response.text?.trim() || "Synthesis unavailable. Please review your logs manually.";
  } catch (error) {
    console.error("Gemini Error in generateHumanReports:", error);
    throw error;
  }
};
