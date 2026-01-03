// src/hooks/useDashboard.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { db, FeelingLog, Reflection } from '../services/database'; // Now using Dexie.js db
import { runAIWorker } from '../services/aiService';

export function useDashboard() {
  // State variables for various dashboard elements (example)
  const [authState, setAuthState] = useState<string | null>(null); // Example for authentication state
  const [activeValueId, setActiveValueId] = useState<string | null>(null); // Example for active value
  const [goals, setGoals] = useState<any[]>([]); // Example for goals
  
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loadingReflections, setLoadingReflections] = useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingAiSummary, setLoadingAiSummary] = useState(false);

  // Use useCallback for functions that are passed down to child components or are dependencies of useEffect
  const loadReflections = useCallback(async () => {
    setLoadingReflections(true);
    try {
      // Use the new Dexie.js database methods
      const data = await db.reflections.orderBy('createdAt').reverse().toArray();
      setReflections(data);
    } catch (error) {
      console.error("Failed to load reflections:", error);
      setReflections([]);
    } finally {
      setLoadingReflections(false);
    }
  }, []); // Dependencies for this useCallback

  // Call loadReflections on component mount
  useEffect(() => {
    void loadReflections();
  }, [loadReflections]);

  // Example of memoizing derived data
  const latestReflection = useMemo(() => {
    return reflections.length > 0 ? reflections[0] : null;
  }, [reflections]);

  // Example for a function that interacts with AI (now via aiService.ts)
  const triggerReflectionAnalysis = useCallback(async (reflectionText: string) => {
    // ... existing logic to prepare prompt ...
    try {
      // Use the new AI Worker interface
      const aiResponse = await runAIWorker(`Analyze this reflection: ${reflectionText}`, 'text2text-generation', 'Xenova/LaMini-Flan-T5-77M');
      // ... process aiResponse ...
      return aiResponse;
    } catch (error) {
      console.error("AI analysis failed:", error);
      // ... handle fallback ...
      return "Rule-based analysis: Your reflection is valuable.";
    }
  }, []); // Dependencies for this useCallback (e.g., runAIWorker if it was a direct import)

  // ... (return existing dashboard state and functions)
  return {
    // ... existing returns
    reflections,
    loadingReflections,
    latestReflection,
    triggerReflectionAnalysis,
    authState,
    activeValueId,
    goals,
    setActiveValueId, // Example: function to set active value
  };
}

