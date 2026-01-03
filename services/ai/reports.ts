/**
 * CLINICAL REPORT GENERATION
 * 
 * Generates clinical reports in SOAP, DAP, and BIRP formats.
 * Synthesizes logs into structured formats for therapist review.
 */

import { LogEntry, ValueItem, MentalStateAssessment, LCSWConfig, Goal } from "../types";
import { initializeModels, getCounselingCoachModel, getIsModelLoading, getMoodTrackerModel } from "./models";
import { detectCrisis } from "./crisis";

/**
 * Helper to format analysis data for reports
 * Handles both JSON objects (new) and Markdown strings (old)
 * Cleans up formatting issues
 */
function formatAnalysisForReport(analysis: any): string {
  if (!analysis) return '';
  
  let content = analysis;
  
  // Try to parse if it's a JSON string
  if (typeof content === 'string') {
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
      try {
        content = JSON.parse(content);
      } catch (e) {
        // Not valid JSON, treat as string
      }
    }
  }
  
  // If it's an object (new format), format as structured text
  if (typeof content === 'object' && content !== null) {
    const { coreThemes, lcswLens, reflectiveInquiry, sessionPrep } = content;
    let text = '';
    
    if (coreThemes && Array.isArray(coreThemes) && coreThemes.length > 0) {
      text += `Core Themes: ${coreThemes.join(', ')}\n`;
    }
    
    if (lcswLens) {
      // Remove repetitive patterns - detect if the same phrase repeats multiple times
      let cleanedLens = lcswLens;
      
      // Detect repetitive patterns like "The LCSW Lens is a 'LCSW Lens'" repeating
      const repetitivePattern = /(The LCSW Lens is a ['"]LCSW Lens['"].*?)(?:\1){2,}/gi;
      if (repetitivePattern.test(cleanedLens)) {
        // Extract just the first occurrence
        const match = cleanedLens.match(/(The LCSW Lens is a ['"]LCSW Lens['"].*?)(?:\1)/i);
        if (match) {
          cleanedLens = match[1].trim();
        } else {
          // Fallback: remove obvious repetition
          cleanedLens = cleanedLens.split(/The LCSW Lens is a ['"]LCSW Lens['"]/i)[0] + 
                       cleanedLens.match(/The LCSW Lens is a ['"]LCSW Lens['"]([^T]*?)(?=The LCSW Lens|$)/i)?.[1] || '';
        }
      }
      
      // Additional cleanup: remove any remaining repetitive phrases
      const phrases = cleanedLens.split(/\.\s+/);
      const uniquePhrases: string[] = [];
      const seenPhrases = new Set<string>();
      
      for (const phrase of phrases) {
        const normalized = phrase.trim().toLowerCase();
        // Only add if we haven't seen a very similar phrase (allowing for minor variations)
        const isDuplicate = Array.from(seenPhrases).some(seen => {
          const similarity = normalized.length > 0 && seen.length > 0 
            ? (normalized.split(' ').filter(w => seen.includes(w)).length / Math.max(normalized.split(' ').length, seen.split(' ').length))
            : 0;
          return similarity > 0.8; // 80% similarity threshold
        });
        
        if (!isDuplicate && phrase.trim().length > 10) {
          uniquePhrases.push(phrase.trim());
          seenPhrases.add(normalized);
        }
      }
      
      cleanedLens = uniquePhrases.join('. ').trim();
      
      if (cleanedLens.length > 20) {
        text += `LCSW Lens: ${cleanedLens}\n`;
      }
    }
    
    if (reflectiveInquiry && Array.isArray(reflectiveInquiry) && reflectiveInquiry.length > 0) {
      text += `Inquiry: ${reflectiveInquiry.join(' ')}\n`;
    }
    
    if (sessionPrep) {
      text += `Session Prep: ${sessionPrep}\n`;
    }
    
    return text.trim();
  }
  
  // If it's a string (old Markdown format), clean it up
  if (typeof content === 'string') {
    // Fix common formatting corruptions (e.g. 'n-' instead of '\n-')
    return content
      .replace(/\\n/g, '\n') // Fix escaped newlines
      .replace(/([a-z0-9])n-/gi, '$1\n-') // Fix 'textn-' -> 'text\n-'
      .replace(/n##/g, '\n##') // Fix 'n##' -> '\n##'
      .replace(/nn##/g, '\n\n##'); // Fix 'nn##' -> '\n\n##'
  }
  
  return String(content);
}

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
    const recentLogs = logs.slice(0, 10).map(l => l.note).filter(Boolean).join(' ');
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
    let result;
    const currentMoodTrackerModel = getMoodTrackerModel();
    if (currentMoodTrackerModel) {
      try {
        console.log('🤖 Using on-device AI model for mood assessment...');
        const startTime = performance.now();
        result = await currentMoodTrackerModel(combinedText);
        const endTime = performance.now();
        console.log(`✅ On-device AI mood assessment complete (${Math.round(endTime - startTime)}ms)`, result);
      } catch (error) {
        console.error('❌ On-device AI mood tracker inference failed:', error);
        result = null;
      }
    } else {
      console.log('ℹ️ Mood tracker model not available, using keyword-based fallback');
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
export function generateFallbackReport(logs: LogEntry[], values: ValueItem[], goals?: Goal[]): string {
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

  // Organize logs by day for therapist review
  const logsByDay: Record<string, LogEntry[]> = {};
  logs.forEach(log => {
    const dayKey = log.date.split('T')[0];
    if (!logsByDay[dayKey]) {
      logsByDay[dayKey] = [];
    }
    logsByDay[dayKey].push(log);
  });

  // Build detailed entry summaries organized by day
  let detailedEntries = '';
  const days = Object.keys(logsByDay).sort().reverse().slice(0, 14); // Last 14 days
  
  days.forEach(day => {
    const dayLogs = logsByDay[day];
    const date = new Date(day).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    detailedEntries += `\n\n**${date}**\n`;
    
    dayLogs.forEach(log => {
      const value = values.find(v => v.id === log.valueId);
      detailedEntries += `\n*${value?.name || 'General'}*\n`;
      
      if (log.mood) detailedEntries += `Mood: ${log.mood} `;
      if (log.emotionalState) detailedEntries += `Emotional State: ${log.emotionalState} `;
      if (log.selectedFeeling) detailedEntries += `Feeling: ${log.selectedFeeling}`;
      detailedEntries += '\n';
      
      if (log.deepReflection) {
        detailedEntries += `\nDeep Reflection:\n${log.deepReflection}\n`;
      }
      
      if (log.goalText) {
        const isCompleted = log.type === 'goal-completion';
        detailedEntries += `\n${isCompleted ? '✅ COMPLETED ' : ''}Committed Action/Goal:\n${log.goalText}\n`;
      }
      
      if (log.reflectionAnalysis) {
        detailedEntries += `\nSuggested Next Steps:\n${formatAnalysisForReport(log.reflectionAnalysis)}\n`;
      }
    });
  });

  // Add goals summary if available
  if (goals && goals.length > 0) {
    const completedGoals = goals.filter(g => g.completed);
    const activeGoals = goals.filter(g => !g.completed);
    
    detailedEntries += '\n\n**Goals Summary**\n';
    if (completedGoals.length > 0) {
      detailedEntries += `\nCompleted Goals (${completedGoals.length}):\n`;
      completedGoals.forEach(goal => {
        const valueName = values.find(v => v.id === goal.valueId)?.name || 'General';
        detailedEntries += `  ✅ ${valueName}: ${goal.text}\n`;
      });
    }
    if (activeGoals.length > 0) {
      detailedEntries += `\nActive Goals (${activeGoals.length}):\n`;
      activeGoals.forEach(goal => {
        const valueName = values.find(v => v.id === goal.valueId)?.name || 'General';
        detailedEntries += `  📋 ${valueName}: ${goal.text} (${goal.frequency})\n`;
      });
    }
  }

  const dateRange = logs.length > 0
    ? `${new Date(logs[logs.length - 1]?.date || Date.now()).toLocaleDateString()} to ${new Date(logs[0]?.date || Date.now()).toLocaleDateString()}`
    : 'No date range';

  return `═══════════════════════════════════════════════════════════════
# SOAP FORMAT REPORT
═══════════════════════════════════════════════════════════════

## Mood Trends Analysis
Mood indicators show: ${topMood} as most common. Client has logged ${logs.length} reflection entries across ${Object.keys(valueCounts).length} values.

## Subjective
Client has logged ${logs.length} reflection entries, with primary focus on ${topValue}. Most common mood indicator: ${topMood}.${detailedEntries}

## Objective
Patterns show engagement with value-based reflection practice. Entries span ${dateRange}. Total entries: ${logs.length}, Values engaged: ${Object.keys(valueCounts).length}.

## Assessment
Client is actively engaging in self-reflection and value alignment work. Consistent practice observed with mood tracking and goal setting.

## Plan
Continue value-based reflection. Review patterns with LCSW in next session. Maintain current engagement level.

═══════════════════════════════════════════════════════════════
# DAP FORMAT REPORT
═══════════════════════════════════════════════════════════════

## Mood Trends Analysis
Mood indicators show: ${topMood} as most common. Client has logged ${logs.length} reflection entries across ${Object.keys(valueCounts).length} values.

## Data
${logs.length} entries, ${Object.keys(valueCounts).length} values engaged, mood tracking active. Date range: ${dateRange}.${detailedEntries}

## Assessment
Consistent engagement with reflection practice. Primary value focus: ${topValue}. Active mood monitoring and goal tracking observed.

## Plan
Maintain current practice. Discuss themes and patterns with LCSW. Continue value-based reflection work.

═══════════════════════════════════════════════════════════════
# BIRP FORMAT REPORT
═══════════════════════════════════════════════════════════════

## Mood Trends Analysis
Mood indicators show: ${topMood} as most common. Client has logged ${logs.length} reflection entries across ${Object.keys(valueCounts).length} values.

## Behavior
Client consistently logs reflections and tracks mood states. Engages with value-based practice regularly.${detailedEntries}

## Intervention
Value-based reflection practice, self-monitoring, mood tracking, goal setting and completion.

## Response
Active engagement, ${logs.length} entries completed. Consistent practice maintained. Positive engagement with therapeutic tools.

## Plan
Continue practice, review with LCSW. Maintain current engagement level. Monitor progress and adjust goals as needed.

═══════════════════════════════════════════════════════════════

*This is a basic summary. For detailed analysis, please review entries manually or discuss with your LCSW.*`;
}

/**
 * Generate clinical reports - synthesizes logs into structured formats
 */
export async function generateHumanReports(
  logs: LogEntry[],
  values: ValueItem[],
  lcswConfig?: LCSWConfig,
  goals?: Goal[] // Add goals parameter
): Promise<string> {
  try {
    if (logs.length === 0) {
      return "No logs available for synthesis.";
    }

    // Check all logs for crisis indicators
    const allText = logs.map(l => l.note).filter(Boolean).join(' ');
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
        const fallbackReport = generateFallbackReport(logs, values, goals);
        const disclaimer = `\n\n---\n\n*This report was generated using rule-based analysis. All processing happens on your device for privacy.*`;
        return `${fallbackReport}${disclaimer}`;
      }
    }

    // Calculate comprehensive mood trends
    const moodCounts: Record<string, number> = {};
    const emotionalStateCounts: Record<string, number> = {};
    const feelingCounts: Record<string, number> = {};
    
    logs.forEach(l => {
      // Track mood emoji
      if (l.mood) {
        moodCounts[l.mood] = (moodCounts[l.mood] || 0) + 1;
      }
      // Track emotional states
      if (l.emotionalState) {
        emotionalStateCounts[l.emotionalState] = (emotionalStateCounts[l.emotionalState] || 0) + 1;
      }
      // Track selected feelings
      if (l.selectedFeeling) {
        feelingCounts[l.selectedFeeling] = (feelingCounts[l.selectedFeeling] || 0) + 1;
      }
    });
    
    // Build comprehensive mood trends text
    let moodTrendText = 'Mood Indicators:\n';
    if (Object.keys(moodCounts).length > 0) {
      moodTrendText += Object.entries(moodCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([mood, count]) => `  ${mood}: ${count} entries`)
        .join('\n');
    }
    
    if (Object.keys(emotionalStateCounts).length > 0) {
      moodTrendText += '\n\nEmotional States:\n';
      moodTrendText += Object.entries(emotionalStateCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([state, count]) => `  ${state}: ${count} entries`)
        .join('\n');
    }
    
    if (Object.keys(feelingCounts).length > 0) {
      moodTrendText += '\n\nSelected Feelings:\n';
      moodTrendText += Object.entries(feelingCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10) // Top 10 feelings
        .map(([feeling, count]) => `  ${feeling}: ${count} entries`)
        .join('\n');
    }

    // Organize logs by day for therapist review
    const logsByDay: Record<string, LogEntry[]> = {};
    logs.forEach(l => {
      const dayKey = l.date.split('T')[0]; // YYYY-MM-DD
      if (!logsByDay[dayKey]) {
        logsByDay[dayKey] = [];
      }
      logsByDay[dayKey].push(l);
    });

    // Build summary organized by day
    const days = Object.keys(logsByDay).sort().reverse(); // Most recent first
    const summary = days.map(day => {
      const dayLogs = logsByDay[day];
      const date = new Date(day).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      
      let daySummary = `\n=== ${date} ===\n`;
      
      dayLogs.forEach(l => {
        const vName = values.find(v => v.id === l.valueId)?.name || 'General';
        daySummary += `\n[${l.date.split('T')[1]?.substring(0, 5) || 'Time unknown'}] Value: ${vName}`;
        
        // Mood and emotional state
        if (l.mood) daySummary += `, Mood: ${l.mood}`;
        if (l.emotionalState) daySummary += `, Emotional State: ${l.emotionalState}`;
        if (l.selectedFeeling) daySummary += `, Feeling: ${l.selectedFeeling}`;
        daySummary += '\n';
        
        // Deep reflection content
        if (l.deepReflection) {
          daySummary += `  Deep Reflection: ${l.deepReflection.substring(0, 500)}${l.deepReflection.length > 500 ? '...' : ''}\n`;
        }
        
        // Committed action/goal
        if (l.goalText) {
          daySummary += `  Committed Action/Goal: ${l.goalText}\n`;
        }
        
        // Check if this log represents a completed goal
        if (l.type === 'goal-completion' && l.goalText) {
          daySummary += `  ✅ GOAL COMPLETED: ${l.goalText}\n`;
        }
        
        // Suggested next steps (reflectionAnalysis)
        if (l.reflectionAnalysis) {
          const analysis = formatAnalysisForReport(l.reflectionAnalysis);
          daySummary += `  Suggested Next Steps: ${analysis.substring(0, 300)}${analysis.length > 300 ? '...' : ''}\n`;
        }
        
        // Note as fallback
        if (l.note && !l.deepReflection && l.type !== 'goal-completion') {
          daySummary += `  Note: ${l.note.substring(0, 200)}${l.note.length > 200 ? '...' : ''}\n`;
        }
      });
      
      return daySummary;
    }).join('\n');

    // Include completed goals summary
    let completedGoalsText = '';
    if (goals && goals.length > 0) {
      const completedGoals = goals.filter(g => g.completed);
      const activeGoals = goals.filter(g => !g.completed);
      
      if (completedGoals.length > 0) {
        completedGoalsText = '\n\nCompleted Goals:\n';
        completedGoals.forEach(goal => {
          const valueName = values.find(v => v.id === goal.valueId)?.name || 'General';
          completedGoalsText += `  ✅ [${valueName}] ${goal.text} (Completed ${new Date(goal.createdAt).toLocaleDateString()})\n`;
        });
      }
      
      if (activeGoals.length > 0) {
        completedGoalsText += '\nActive Goals:\n';
        activeGoals.forEach(goal => {
          const valueName = values.find(v => v.id === goal.valueId)?.name || 'General';
          completedGoalsText += `  📋 [${valueName}] ${goal.text} (${goal.frequency})\n`;
        });
      }
    }

    const prompt = `Generate a clinical report for therapist review. Format as THREE SEPARATE TEMPLATES: SOAP, DAP, and BIRP.

MOOD TRENDS DATA:
${moodTrendText}${completedGoalsText}

DAILY ACTIVITY LOGS (organized by date):
${summary}

OUTPUT FORMAT REQUIREMENTS:
Generate THREE separate, complete reports using these exact templates:

═══════════════════════════════════════════════════════════════
# SOAP FORMAT REPORT
═══════════════════════════════════════════════════════════════

## Mood Trends Analysis
[Analyze the mood trends data provided above - include patterns, shifts, and insights]

## Subjective
[Client's reported experiences, feelings, reflections organized by day. Include:
- Daily reflections and what they worked on
- Emotional states and feelings
- Goals committed to and completed
- Patterns over time]

## Objective
[Observable data and patterns:
- Number of entries, date range
- Mood indicators and emotional state patterns
- Goal completion rates
- Engagement patterns]

## Assessment
[Clinical interpretation:
- Themes and patterns identified
- Progress observed
- Areas of focus
- Connection to treatment goals]

## Plan
[Recommendations for continued work:
- Suggested focus areas
- Goals to maintain or adjust
- Therapeutic considerations]

═══════════════════════════════════════════════════════════════
# DAP FORMAT REPORT
═══════════════════════════════════════════════════════════════

## Mood Trends Analysis
[Analyze the mood trends data provided above - include patterns, shifts, and insights]

## Data
[Factual information from logs:
- Daily activities organized by date
- Reflections, goals, emotional states
- Completed goals and progress
- Engagement metrics]

## Assessment
[Clinical assessment:
- Patterns in mood and emotional states
- Progress toward goals
- Themes in reflections
- Strengths and areas for growth]

## Plan
[Next steps and recommendations:
- Continued focus areas
- Goal adjustments if needed
- Therapeutic interventions to consider]

═══════════════════════════════════════════════════════════════
# BIRP FORMAT REPORT
═══════════════════════════════════════════════════════════════

## Mood Trends Analysis
[Analyze the mood trends data provided above - include patterns, shifts, and insights]

## Behavior
[Observed behaviors and activities:
- Daily reflection practices
- Goal-setting and completion behaviors
- Engagement with values
- Self-monitoring activities]

## Intervention
[Therapeutic interventions and strategies:
- Value-based reflection practice
- Goal-setting and tracking
- Mood monitoring
- Self-advocacy activities]

## Response
[Client's response to interventions:
- Mood and emotional state changes
- Goal completion rates
- Engagement levels
- Progress indicators]

## Plan
[Future planning:
- Maintain current practices
- Adjust goals as needed
- Continue monitoring
- Therapeutic considerations]

═══════════════════════════════════════════════════════════════

CRITICAL: 
- Each format must be COMPLETE and STANDALONE
- Include mood trends analysis in EACH format
- Organize daily content clearly showing what client worked on each day
- Mark completed goals clearly with ✅
- Use clear headings and spacing for readability
- Tone: Supportive, clinical, human`;

    let report = generateFallbackReport(logs, values, goals);
    
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
        console.log('🤖 Using on-device AI model for report generation...');
        const startTime = performance.now();
        const result = await currentCounselingCoachModel(prompt, {
          max_new_tokens: 2000, // Increased for comprehensive three-format reports
          temperature: 0.3, // Lower temperature to reduce repetition
          do_sample: true,
          repetition_penalty: 1.3 // Penalize repetition
        });
        const endTime = performance.now();

        const generatedText = result[0]?.generated_text || '';
        console.log('🔍 Raw AI report response (first 500 chars):', generatedText.substring(0, 500));
        
        // Remove prompt from beginning if present
        let extracted = generatedText.replace(prompt, '').trim();
        
        // If extraction is too short, the prompt might still be there - try more aggressive removal
        if (extracted.length < 100) {
          extracted = generatedText.split(/Generate a comprehensive report|You are a therapy integration|OUTPUT FORMAT REQUIREMENTS|MOOD TRENDS DATA|DAILY ACTIVITY LOGS/i)[1] || generatedText;
          extracted = extracted.trim();
        }
        
        // Remove "OUTPUT FORMAT REQUIREMENTS" section if it leaked
        extracted = extracted.replace(/OUTPUT FORMAT REQUIREMENTS:[\s\S]*?═══════════════════════════════════════════════════════════════/i, '').trim();
        
        // Remove repetitive patterns from the report
        // Detect if the same sentence/phrase repeats CONSECUTIVELY or within a small window
        // We do NOT want to remove duplicates across different report formats (SOAP vs DAP vs BIRP)
        const sentences = extracted.split(/([.!?]\s+)/); // Keep delimiters to reconstruct
        const uniqueSentences: string[] = [];
        const recentSentences: string[] = []; // Window of recent sentences to check against
        const WINDOW_SIZE = 5; // Check last 5 sentences for loops
        
        for (let i = 0; i < sentences.length; i++) {
          const sentence = sentences[i];
          // Skip delimiters for check but keep them for reconstruction
          if (/[.!?]\s+/.test(sentence)) {
            if (uniqueSentences.length > 0) {
              uniqueSentences.push(sentence);
            }
            continue;
          }
          
          const normalized = sentence.trim().toLowerCase();
          if (normalized.length < 20) {
            uniqueSentences.push(sentence);
            continue;
          }

          // Check for high similarity with RECENT sentences only (to prevent loops but allow multi-format repetition)
          const isDuplicate = recentSentences.some(seen => {
            const words1 = normalized.split(/\s+/);
            const words2 = seen.split(/\s+/);
            const commonWords = words1.filter(w => words2.includes(w)).length;
            const similarity = commonWords / Math.max(words1.length, words2.length);
            return similarity > 0.85; // 85% word overlap = likely loop artifact
          });
          
          if (!isDuplicate) {
            uniqueSentences.push(sentence);
            recentSentences.push(normalized);
            if (recentSentences.length > WINDOW_SIZE) {
              recentSentences.shift();
            }
          }
        }
        
        extracted = uniqueSentences.join('').trim();
        
        // Additional cleanup: remove obvious repetitive patterns
        extracted = extracted.replace(/(The LCSW Lens is a ['"]LCSW Lens['"].*?)(?:\1){2,}/gi, (match, first) => first);
        // Remove "LCSW Lens is a 'LCSW Lens'" phrase specifically if it appears
        extracted = extracted.replace(/The LCSW Lens is a ['"]LCSW Lens['"]/gi, 'The LCSW Lens analysis indicates');
        
        // Ensure we have meaningful content - check for actual report sections
        const hasReportContent = extracted.includes('SOAP') || 
                                 extracted.includes('DAP') || 
                                 extracted.includes('BIRP') ||
                                 extracted.includes('Subjective') ||
                                 extracted.includes('Assessment') ||
                                 extracted.length > 200; // Allow shorter reports if they have structure
        
        if (extracted && extracted.length > 50 && hasReportContent) {
          report = extracted;
          console.log(`✅ On-device AI generated report (${Math.round(endTime - startTime)}ms)`);
        } else {
          console.warn('⚠️ AI model returned insufficient report content, using fallback');
          console.warn('Extracted length:', extracted.length, 'Has report content:', hasReportContent);
        }
      } catch (error) {
        console.error('❌ On-device AI report generation failed:', error);
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
                max_new_tokens: 2000, // Increased for comprehensive three-format reports
                temperature: 0.3, // Lower temperature to reduce repetition
                do_sample: true,
                repetition_penalty: 1.3 // Penalize repetition
              });
              const retryText = retryResult[0]?.generated_text || '';
              let retryExtracted = retryText.replace(prompt, '').trim();
              
              // Apply same repetition removal to retry
              const retrySentences = retryExtracted.split(/([.!?]\s+)/);
              const retryUniqueSentences: string[] = [];
              const retryRecentSentences: string[] = [];
              const WINDOW_SIZE = 5;
              
              for (let i = 0; i < retrySentences.length; i++) {
                const sentence = retrySentences[i];
                if (/[.!?]\s+/.test(sentence)) {
                  if (retryUniqueSentences.length > 0) {
                    retryUniqueSentences.push(sentence);
                  }
                  continue;
                }
                
                const normalized = sentence.trim().toLowerCase();
                if (normalized.length < 20) {
                  retryUniqueSentences.push(sentence);
                  continue;
                }

                const isDuplicate = retryRecentSentences.some(seen => {
                  const words1 = normalized.split(/\s+/);
                  const words2 = seen.split(/\s+/);
                  const commonWords = words1.filter(w => words2.includes(w)).length;
                  const similarity = commonWords / Math.max(words1.length, words2.length);
                  return similarity > 0.85;
                });
                
                if (!isDuplicate) {
                  retryUniqueSentences.push(sentence);
                  retryRecentSentences.push(normalized);
                  if (retryRecentSentences.length > WINDOW_SIZE) {
                    retryRecentSentences.shift();
                  }
                }
              }
              
              retryExtracted = retryUniqueSentences.join('').trim();
              retryExtracted = retryExtracted.replace(/(The LCSW Lens is a ['"]LCSW Lens['"].*?)(?:\1){2,}/gi, (match, first) => first);
              
              if (retryExtracted && retryExtracted.length > 50) {
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
      const fallbackReport = generateFallbackReport(logs, values, goals);
      const disclaimer = `\n\n---\n\n*This report was generated using rule-based analysis. All processing happens on your device for privacy.*`;
      return `${fallbackReport}${disclaimer}`;
  }
}

