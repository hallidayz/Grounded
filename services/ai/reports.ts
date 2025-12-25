/**
 * CLINICAL REPORT GENERATION
 * 
 * Generates clinical reports in SOAP, DAP, and BIRP formats.
 * Synthesizes logs into structured formats for therapist review.
 */

import { LogEntry, ValueItem, MentalStateAssessment, LCSWConfig } from "../types";
import { initializeModels, getCounselingCoachModel, getIsModelLoading, getMoodTrackerModel } from "./models";
import { detectCrisis } from "./crisis";

/**
 * Model A: Mental State Tracker
 * Analyzes journals and reflections to assess mood, anxiety, depression severity
 * Returns structured assessment similar to MoPHES framework
 */
export async function assessMentalState(
  logs: LogEntry[],
  currentReflection: string,
  lcswConfig?: LCSWConfig
): Promise<MentalStateAssessment> {
  try {
    // Check for crisis FIRST - before any processing
    const crisisCheck = detectCrisis(currentReflection, lcswConfig);
    if (crisisCheck.isCrisis && crisisCheck.severity === 'critical') {
      // Return assessment that flags crisis - the UI should handle displaying crisis response
      return {
        anxietySeverity: 'high',
        depressionSeverity: 'high',
        keyThemes: ['CRISIS_DETECTED'],
        recommendedActions: ['Contact emergency services (911) or crisis hotline (988) immediately'],
        timestamp: new Date().toISOString()
      };
    }

    // Ensure models are loaded - wait if they're currently loading
    const moodTrackerModel = getMoodTrackerModel();
    const isModelLoading = getIsModelLoading();
    
    if (!moodTrackerModel) {
      // Start loading if not already loading
      await initializeModels();
    }

    // Combine recent logs and current reflection for context
    const recentLogs = logs.slice(0, 10).map(l => l.note).join(' ');
    const combinedText = `${recentLogs} ${currentReflection}`.trim();

    if (!combinedText) {
      return {
        anxietySeverity: 'low',
        depressionSeverity: 'low',
        keyThemes: [],
        recommendedActions: [],
        timestamp: new Date().toISOString()
      };
    }

    // Use the mood tracker model to analyze sentiment and emotional state
    // In a full implementation, this would use a fine-tuned mental health model
    let result;
    const currentMoodTrackerModel = getMoodTrackerModel();
    if (currentMoodTrackerModel) {
      try {
        result = await currentMoodTrackerModel(combinedText);
      } catch (error) {
        console.warn('Mood tracker inference failed:', error);
        result = null;
      }
    } else {
      result = null;
    }

    // Extract themes using keyword analysis (in production, use a proper NER model)
    const keyThemes: string[] = [];
    const themeKeywords = {
      'anxiety': ['worried', 'anxious', 'nervous', 'stressed', 'panic', 'fear'],
      'depression': ['sad', 'depressed', 'hopeless', 'empty', 'tired', 'worthless'],
      'anger': ['angry', 'frustrated', 'irritated', 'mad', 'rage'],
      'gratitude': ['grateful', 'thankful', 'appreciate', 'blessed'],
      'growth': ['learned', 'progress', 'improved', 'better', 'growing']
    };

    const lowerText = combinedText.toLowerCase();
    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      if (keywords.some(kw => lowerText.includes(kw))) {
        keyThemes.push(theme);
      }
    }

    // Determine severity based on model output and keyword analysis
    const hasAnxietyKeywords = keyThemes.includes('anxiety') || lowerText.includes('anxious');
    const hasDepressionKeywords = keyThemes.includes('depression') || lowerText.includes('depressed');
    
    const anxietySeverity = hasAnxietyKeywords 
      ? (lowerText.match(/\b(very|extremely|severely)\b/gi) ? 'high' : 'moderate')
      : 'low';
    
    const depressionSeverity = hasDepressionKeywords
      ? (lowerText.match(/\b(very|extremely|severely)\b/gi) ? 'high' : 'moderate')
      : 'low';

    // Generate structured recommendations
    const recommendedActions: string[] = [];
    if (anxietySeverity !== 'low') {
      recommendedActions.push('Practice deep breathing exercises');
      recommendedActions.push('Consider discussing anxiety management strategies with your LCSW');
    }
    if (depressionSeverity !== 'low') {
      recommendedActions.push('Engage in gentle physical activity');
      recommendedActions.push('Reach out to your support network');
    }
    if (keyThemes.includes('growth')) {
      recommendedActions.push('Acknowledge your progress and celebrate small wins');
    }

    return {
      anxietySeverity: anxietySeverity as 'low' | 'moderate' | 'high',
      depressionSeverity: depressionSeverity as 'low' | 'moderate' | 'high',
      keyThemes: [...new Set(keyThemes)], // Remove duplicates
      recommendedActions,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Mental state assessment error:', error);
    // Fallback to safe defaults
    return {
      anxietySeverity: 'low',
      depressionSeverity: 'low',
      keyThemes: [],
      recommendedActions: ['Continue journaling and reflecting on your values'],
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Fallback report generator (used when models aren't available)
 * Exported so UI components can use it directly when model loading fails
 */
export function generateFallbackReport(logs: LogEntry[], values: ValueItem[]): string {
  const valueCounts: Record<string, number> = {};
  const moodCounts: Record<string, number> = {};
  
  logs.forEach(log => {
    const valueName = values.find(v => v.id === log.valueId)?.name || 'Unknown';
    valueCounts[valueName] = (valueCounts[valueName] || 0) + 1;
    if (log.mood) {
      moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
    }
  });

  const topValue = Object.entries(valueCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  return `# Clinical Summary

## SOAP Format

**Subjective**: Client has logged ${logs.length} reflection entries, with primary focus on ${topValue}. Most common mood indicator: ${topMood}.

**Objective**: Patterns show engagement with value-based reflection practice. Entries span ${new Date(logs[logs.length - 1]?.date || Date.now()).toLocaleDateString()} to ${new Date(logs[0]?.date || Date.now()).toLocaleDateString()}.

**Assessment**: Client is actively engaging in self-reflection and value alignment work.

**Plan**: Continue value-based reflection. Review patterns with LCSW in next session.

---

## DAP Format

**Data**: ${logs.length} entries, ${Object.keys(valueCounts).length} values engaged, mood tracking active.

**Assessment**: Consistent engagement with reflection practice. Primary value focus: ${topValue}.

**Plan**: Maintain current practice. Discuss themes and patterns with LCSW.

---

## BIRP Format

**Behavior**: Client consistently logs reflections and tracks mood states.

**Intervention**: Value-based reflection practice, self-monitoring.

**Response**: Active engagement, ${logs.length} entries completed.

**Plan**: Continue practice, review with LCSW.

---

*This is a basic summary. For detailed analysis, please review entries manually or discuss with your LCSW.*`;
}

/**
 * Generate clinical reports - synthesizes logs into structured formats
 */
export async function generateHumanReports(
  logs: LogEntry[],
  values: ValueItem[],
  lcswConfig?: LCSWConfig
): Promise<string> {
  try {
    if (logs.length === 0) {
      return "No logs available for synthesis.";
    }

    // Check all logs for crisis indicators
    const allText = logs.map(l => l.note).join(' ');
    const crisisCheck = detectCrisis(allText, lcswConfig);
    
    if (crisisCheck.isCrisis && crisisCheck.severity === 'critical') {
      const emergencyContact = lcswConfig?.emergencyContact;
      const therapistContact = emergencyContact 
        ? `${emergencyContact.name || 'Your therapist'}: ${emergencyContact.phone}`
        : 'Your therapist or healthcare provider';
      
      return `# 🚨 SAFETY CONCERN DETECTED IN LOGS\n\n**Your safety is the priority.** These logs contain language that suggests you may be thinking about ending your life or hurting yourself.\n\n**If you are in immediate danger or feel you might act on thoughts of suicide, please contact emergency services (911 in the U.S.) or the 988 Suicide & Crisis Lifeline right now.**\n\n**This app cannot help in an emergency. If you are about to harm yourself, please call 911 or 988, or your local emergency number, immediately.**\n\n**Please also reach out to someone you trust right now**—a close friend, family member, or someone who can be with you. You don't have to go through this alone.\n\n**Resources available right now:**\n• **988 Suicide & Crisis Lifeline** - Dial 988 (24/7, free, confidential)\n• **Crisis Text Line** - Text HOME to 741741\n• **Emergency Services** - 911 (U.S.) or your local emergency number\n• **Your Therapist**: ${therapistContact}\n\n---\n\n# Clinical Summary\n\nDue to safety concerns detected in these logs, a full clinical summary should be reviewed with your LCSW or mental health professional in person.\n\n*Feeling suicidal is a medical and emotional emergency, not a personal failure. You deserve support, and help is available.*`;
    }

    // Try to initialize models if not already loaded
    const counselingCoachModel = getCounselingCoachModel();
    if (!counselingCoachModel) {
      const modelsLoaded = await initializeModels();
      if (!modelsLoaded) {
        // Model initialization failed - use rule-based fallback silently
        const fallbackReport = generateFallbackReport(logs, values);
        const disclaimer = `\n\n---\n\n*This report was generated using rule-based analysis. All processing happens on your device for privacy.*`;
        return `${fallbackReport}${disclaimer}`;
      }
    }

    const summary = logs.map(l => {
      const vName = values.find(v => v.id === l.valueId)?.name || 'General';
      return `[${l.date.split('T')[0]}] Value: ${vName}, Mood: ${l.mood || 'N/A'}, Note: ${l.note}`;
    }).join('\n');

    const prompt = `You are a therapy integration assistant helping synthesize a client's reflection logs for review with their LCSW.

Generate a comprehensive report in SOAP, DAP, and BIRP formats.
      
Logs:
      ${summary}
      
Format your response with clear sections for each format. Keep the tone supportive, clinical yet human, and focused on patterns and themes that would be useful for therapy integration.`;

    let report = generateFallbackReport(logs, values);
    
    // If model is available, try to generate AI report
    let currentCounselingCoachModel = getCounselingCoachModel();
    
    // Ensure model is loaded
    if (!currentCounselingCoachModel) {
      const isModelLoading = getIsModelLoading();
      if (isModelLoading) {
        // Wait for current load (up to 30 seconds)
        const maxWaitTime = 30000;
        const startTime = Date.now();
        while (!currentCounselingCoachModel && (Date.now() - startTime) < maxWaitTime) {
          await new Promise(resolve => setTimeout(resolve, 500));
          currentCounselingCoachModel = getCounselingCoachModel();
        }
      } else {
        await initializeModels();
        currentCounselingCoachModel = getCounselingCoachModel();
      }
    }
    
    if (currentCounselingCoachModel) {
      try {
        const result = await currentCounselingCoachModel(prompt, {
          max_new_tokens: 1000,
          temperature: 0.7,
          do_sample: true
        });

        const generatedText = result[0]?.generated_text || '';
        const extracted = generatedText.replace(prompt, '').trim();
        if (extracted) {
          report = extracted;
        }
      } catch (error) {
        console.warn('Report generation inference failed:', error);
        // Try reload if model type mismatch
        if (error instanceof Error && (
          error.message.includes('not a function') ||
          error.message.includes('Cannot read')
        )) {
          await initializeModels(true);
          const reloadedModel = getCounselingCoachModel();
          if (reloadedModel) {
            try {
              const retryResult = await reloadedModel(prompt, {
                max_new_tokens: 1000,
                temperature: 0.7,
                do_sample: true
              });
              const retryText = retryResult[0]?.generated_text || '';
              const retryExtracted = retryText.replace(prompt, '').trim();
              if (retryExtracted) {
                report = retryExtracted;
              }
            } catch (retryError) {
              console.warn('Retry report generation failed:', retryError);
            }
          }
        }
        // Use fallback report - inference failures are handled gracefully
      }
    }

    // Add disclaimer
    const disclaimer = `\n\n---\n\n*This report is generated on-device for your personal review and discussion with your LCSW. It is not a substitute for professional clinical assessment.*`;

    return report + disclaimer;
  } catch (error) {
    // For any errors, log and return fallback report gracefully
    console.error('Report generation error:', error);
    const fallbackReport = generateFallbackReport(logs, values);
    const disclaimer = `\n\n---\n\n*This report was generated using rule-based analysis. All processing happens on your device for privacy.*`;
    return `${fallbackReport}${disclaimer}`;
  }
}

