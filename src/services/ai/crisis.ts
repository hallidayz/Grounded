/**
 * CRISIS DETECTION & RESPONSE
 * 
 * Handles crisis detection and provides appropriate safety responses.
 * Uses comprehensive, hardcoded crisis phrase list (non-editable for safety).
 */

import { CrisisDetection, LCSWConfig } from "../types";
import { ALL_CRISIS_PHRASES, CrisisCategory } from "../crisisConfig";

/**
 * Crisis detection - scans text for safety phrases and crisis indicators
 * This runs BEFORE any AI processing to ensure safety
 * Uses comprehensive, hardcoded crisis phrase list (non-editable for safety)
 */
export function detectCrisis(text: string, lcswConfig?: LCSWConfig): CrisisDetection {
  const lowerText = text.toLowerCase();
  
  // Use comprehensive hardcoded crisis phrases (non-editable)
  // User-provided phrases in lcswConfig are IGNORED for safety
  const detectedPhrases: string[] = [];
  const detectedCategories: CrisisCategory[] = [];
  let maxSeverity: 'low' | 'moderate' | 'high' | 'critical' = 'low';

  // Scan text against all crisis phrases
  for (const crisisPhrase of ALL_CRISIS_PHRASES) {
    if (lowerText.includes(crisisPhrase.phrase)) {
      detectedPhrases.push(crisisPhrase.phrase);
      if (!detectedCategories.includes(crisisPhrase.category)) {
        detectedCategories.push(crisisPhrase.category);
      }
      
      // Determine maximum severity
      if (crisisPhrase.severity === 'critical') {
        maxSeverity = 'critical';
      } else if (crisisPhrase.severity === 'high' && maxSeverity !== 'critical') {
        maxSeverity = 'high';
      } else if (crisisPhrase.severity === 'moderate' && maxSeverity === 'low') {
        maxSeverity = 'moderate';
      }
    }
  }

  // Escalation logic: if moderate risk phrases are combined with any crisis phrase, escalate
  const hasModerateRisk = detectedCategories.some(cat => 
    cat === 'RISK_SEVERE_HOPELESSNESS' || cat === 'RISK_BEHAVIORAL_RED_FLAGS'
  );
  const hasCrisisCategory = detectedCategories.some(cat => 
    cat.startsWith('CRISIS_')
  );
  
  if (hasModerateRisk && hasCrisisCategory && maxSeverity === 'moderate') {
    maxSeverity = 'high';
  }

  const isCrisis = detectedPhrases.length > 0;
  
  // Determine recommended action based on severity and categories
  let recommendedAction: CrisisDetection['recommendedAction'] = 'continue';
  
  if (maxSeverity === 'critical') {
    recommendedAction = 'emergency';
  } else if (
    maxSeverity === 'high' || 
    detectedCategories.includes('CRISIS_SELF_HARM') ||
    detectedCategories.includes('CRISIS_THIRD_PARTY_SUICIDE_RISK')
  ) {
    recommendedAction = 'contact_lcsw';
  } else if (isCrisis) {
    recommendedAction = 'show_crisis_info';
  }

  return {
    isCrisis,
    severity: maxSeverity,
    detectedPhrases,
    recommendedAction,
    categories: detectedCategories
  };
}

/**
 * Get crisis response - provides safety information and resources
 * Uses clear, direct, non-judgmental language that avoids stigmatizing phrases
 * Always routes to real-world support (988/911) and trusted people
 */
export function getCrisisResponse(crisis: CrisisDetection, lcswConfig?: LCSWConfig): string {
  const emergencyContact = lcswConfig?.emergencyContact;
  const therapistContact = emergencyContact 
    ? `${emergencyContact.name || 'Your therapist'}: ${emergencyContact.phone}`
    : 'Your therapist or healthcare provider';

  // CRITICAL/EMERGENCY - Immediate danger or active planning
  if (crisis.severity === 'critical' || crisis.recommendedAction === 'emergency') {
    // Check if it's imminent danger category
    const isImminent = crisis.categories?.includes('CRISIS_IMMINENT_DANGER') || 
                      crisis.categories?.includes('CRISIS_PLANNING_OR_METHOD');
    
    if (isImminent) {
      return `🚨 **IMMEDIATE SAFETY CONCERN**\n\n**Your safety is the most important thing right now.**\n\n**If you are in immediate danger or feel you might act on thoughts of ending your life, please contact emergency services (911 in the U.S.) or the 988 Suicide & Crisis Lifeline right now.**\n\n**This app cannot help in an emergency. If you are about to harm yourself or someone else, please call 911 or 988, or your local emergency number, immediately.**\n\n**Please also reach out to someone you trust right now**—a close friend, family member, or someone who can be with you or check in on you. You don't have to go through this alone.\n\n**Resources available right now:**\n• **988 Suicide & Crisis Lifeline** - Dial 988 (24/7, free, confidential)\n• **Crisis Text Line** - Text HOME to 741741\n• **Emergency Services** - 911 (U.S.) or your local emergency number\n• **Your Therapist**: ${therapistContact}\n\n**If you have started to carry out a plan to end your life, stop using this app and contact 911, 988, or your local crisis service for urgent help.**\n\n*Feeling suicidal is a medical and emotional emergency, not a personal failure. You deserve support, and help is available.*`;
    }
    
    // Direct suicide ideation or planning
    return `🚨 **SAFETY CHECK**\n\n**It sounds like you may be thinking about ending your life or hurting yourself.**\n\n**Are you having thoughts of suicide right now?**\n\n**If you are thinking about suicide or have a plan, your safety is the priority. Please contact emergency services (911 in the U.S.) or the 988 Suicide & Crisis Lifeline right now.**\n\n**This app cannot help in an emergency. If you are about to harm yourself, please call 911 or 988, or your local emergency number, immediately.**\n\n**Please also reach out to someone you trust right now**—a close friend, family member, or someone who can be with you. You don't have to go through this alone.\n\n**Resources available right now:**\n• **988 Suicide & Crisis Lifeline** - Dial 988 (24/7, free, confidential)\n• **Crisis Text Line** - Text HOME to 741741\n• **Emergency Services** - 911 (U.S.) or your local emergency number\n• **Your Therapist**: ${therapistContact}\n\n*You are not alone in feeling this way, and it is OK to talk about suicide. Reaching out for help can make a difference. Many people have thoughts of suicide when pain feels overwhelming. Talking with a trained crisis counselor or mental health professional can help you stay safe.*`;
  }

  // HIGH - Self-harm, indirect ideation, or third-party concern
  if (crisis.severity === 'high' || crisis.recommendedAction === 'contact_lcsw') {
    const isSelfHarm = crisis.categories?.includes('CRISIS_SELF_HARM');
    const isThirdParty = crisis.categories?.includes('CRISIS_THIRD_PARTY_SUICIDE_RISK');
    
    if (isSelfHarm) {
      return `⚠️ **SUPPORT NEEDED**\n\n**Thank you for sharing this. It sounds like you may be hurting yourself or thinking about self-harm.**\n\n**What has helped you stay safe so far when you've had thoughts of suicide or self-harm?**\n\n**Your safety matters. Please reach out for help:**\n\n1. **Contact your therapist as soon as possible**: ${therapistContact}\n2. **988 Suicide & Crisis Lifeline** - Dial 988 (24/7, free, confidential)\n3. **Crisis Text Line** - Text HOME to 741741\n4. **Reach out to someone you trust**—a close friend, family member, or someone who can support you right now\n\n**This app is not a crisis or emergency service and cannot keep you safe in an emergency. For urgent help, contact 988, 911, or your local crisis line.**\n\n**If you feel you might act on thoughts of self-harm, please contact a crisis line, emergency services, or your local equivalent immediately.**\n\n*Feeling suicidal is a medical and emotional emergency, not a personal failure. You deserve support, and help is available.*`;
    }
    
    if (isThirdParty) {
      return `⚠️ **CONCERN FOR SOMEONE ELSE**\n\n**It sounds like you're concerned about someone else who may be thinking about suicide or self-harm.**\n\n**If someone you know is in immediate danger, please contact emergency services (911) or a crisis line right away.**\n\n**Resources to help:**\n• **988 Suicide & Crisis Lifeline** - Dial 988 (24/7, free, confidential)\n• **Crisis Text Line** - Text HOME to 741741\n• **Emergency Services** - 911 (U.S.) or your local emergency number\n• **Your Therapist**: ${therapistContact}\n\n**You can also encourage the person to reach out to a trusted friend, family member, or mental health professional.**\n\n*This app is not a crisis or emergency service. For urgent situations, contact local emergency services or crisis lines.*`;
    }
    
    // Indirect ideation or high risk
    return `⚠️ **SUPPORT AVAILABLE**\n\n**It sounds like you're going through a very difficult time right now.**\n\n**Who in your life (family, friends, professionals) could you contact today to talk about how you're feeling?**\n\n**Please reach out for help:**\n\n1. **Contact your therapist as soon as possible**: ${therapistContact}\n2. **988 Suicide & Crisis Lifeline** - Dial 988 (24/7, free, confidential)\n3. **Crisis Text Line** - Text HOME to 741741\n4. **Reach out to a trusted person**—a close friend, family member, or someone you trust—and let them know you need support right now\n\n**This app is not a crisis or emergency service and cannot keep you safe in an emergency. For urgent help, contact 988, 911, or your local crisis line.**\n\n**If you are thinking about suicide or self-harm, this app cannot keep you safe. Please call a crisis hotline or emergency services immediately.**\n\n*You are not alone in feeling this way. Reaching out for help can make a difference. Would you consider creating or updating a safety plan with a mental health professional or crisis counselor?*`;
  }

  // MODERATE - Hopelessness or behavioral red flags
  return `**SUPPORT AVAILABLE**\n\n**It sounds like you're going through a difficult time. Thank you for sharing this.**\n\n**Please know that support is available:**\n\n1. **Discuss this with your therapist** in your next session: ${therapistContact}\n2. **988 Suicide & Crisis Lifeline** - Dial 988 if you need to talk to someone (24/7, free, confidential)\n3. **Crisis Text Line** - Text HOME to 741741\n4. **Consider reaching out to a trusted person**—a friend, family member, or someone you trust—and sharing what you're experiencing\n\n**If you are thinking about suicide or self-harm, or feel you might act on harmful thoughts, please stop using the app and reach out to a trusted person or crisis service now.**\n\n**This app cannot help in emergencies. If you are in crisis or considering self-harm, call your local emergency number or a crisis hotline now.**\n\n*This app is not a substitute for professional therapy or crisis support. I can offer general information, but only trained people and local services can provide the immediate help you deserve when you feel suicidal.*`;
}

