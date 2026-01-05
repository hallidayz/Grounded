/**
 * COMPREHENSIVE CRISIS DETECTION CONFIGURATION
 * 
 * This file contains all crisis detection phrases and categories.
 * These are HARDCODED and NON-EDITABLE to ensure user safety.
 * 
 * Based on mental health best practices and crisis intervention guidelines.
 */

export type CrisisCategory = 
  | 'CRISIS_SUICIDAL_IDEATION_DIRECT'
  | 'CRISIS_SUICIDAL_IDEATION_INDIRECT'
  | 'CRISIS_PLANNING_OR_METHOD'
  | 'CRISIS_SELF_HARM'
  | 'RISK_SEVERE_HOPELESSNESS'
  | 'RISK_BEHAVIORAL_RED_FLAGS'
  | 'CRISIS_THIRD_PARTY_SUICIDE_RISK'
  | 'CRISIS_IMMINENT_DANGER';

export interface CrisisPhrase {
  phrase: string;
  category: CrisisCategory;
  severity: 'critical' | 'high' | 'moderate';
}

/**
 * 1. Direct suicide statements
 * CRITICAL - Immediate emergency response required
 */
const DIRECT_SUICIDE_PHRASES: CrisisPhrase[] = [
  { phrase: 'i want to die', category: 'CRISIS_SUICIDAL_IDEATION_DIRECT', severity: 'critical' },
  { phrase: 'i want to kill myself', category: 'CRISIS_SUICIDAL_IDEATION_DIRECT', severity: 'critical' },
  { phrase: 'i am going to kill myself', category: 'CRISIS_SUICIDAL_IDEATION_DIRECT', severity: 'critical' },
  { phrase: 'i\'m suicidal', category: 'CRISIS_SUICIDAL_IDEATION_DIRECT', severity: 'critical' },
  { phrase: 'i have suicidal thoughts', category: 'CRISIS_SUICIDAL_IDEATION_DIRECT', severity: 'critical' },
  { phrase: 'i\'ve been thinking about suicide', category: 'CRISIS_SUICIDAL_IDEATION_DIRECT', severity: 'critical' },
  { phrase: 'i am planning to end my life', category: 'CRISIS_SUICIDAL_IDEATION_DIRECT', severity: 'critical' },
  { phrase: 'i\'m going to end it all', category: 'CRISIS_SUICIDAL_IDEATION_DIRECT', severity: 'critical' },
  { phrase: 'i\'m going to end my life', category: 'CRISIS_SUICIDAL_IDEATION_DIRECT', severity: 'critical' },
  { phrase: 'i want to end it', category: 'CRISIS_SUICIDAL_IDEATION_DIRECT', severity: 'critical' },
  { phrase: 'i\'m done with life', category: 'CRISIS_SUICIDAL_IDEATION_DIRECT', severity: 'critical' },
  { phrase: 'i don\'t want to live anymore', category: 'CRISIS_SUICIDAL_IDEATION_DIRECT', severity: 'critical' },
  { phrase: 'life is not worth living', category: 'CRISIS_SUICIDAL_IDEATION_DIRECT', severity: 'critical' },
  { phrase: 'i\'m better off dead', category: 'CRISIS_SUICIDAL_IDEATION_DIRECT', severity: 'critical' },
  { phrase: 'everyone would be better off without me', category: 'CRISIS_SUICIDAL_IDEATION_DIRECT', severity: 'critical' },
  { phrase: 'i wish i hadn\'t been born', category: 'CRISIS_SUICIDAL_IDEATION_DIRECT', severity: 'critical' },
  { phrase: 'i wish i were dead', category: 'CRISIS_SUICIDAL_IDEATION_DIRECT', severity: 'critical' },
  { phrase: 'i wish i didn\'t exist', category: 'CRISIS_SUICIDAL_IDEATION_DIRECT', severity: 'critical' },
  { phrase: 'i\'m thinking about ending everything', category: 'CRISIS_SUICIDAL_IDEATION_DIRECT', severity: 'critical' },
  { phrase: 'i just want it all to stop permanently', category: 'CRISIS_SUICIDAL_IDEATION_DIRECT', severity: 'critical' },
  { phrase: 'i can\'t go on living like this', category: 'CRISIS_SUICIDAL_IDEATION_DIRECT', severity: 'critical' },
  { phrase: 'i have no reason to live', category: 'CRISIS_SUICIDAL_IDEATION_DIRECT', severity: 'critical' },
];

/**
 * 2. Indirect or coded suicidal ideation
 * HIGH - Crisis response required
 */
const INDIRECT_SUICIDE_PHRASES: CrisisPhrase[] = [
  { phrase: 'i can\'t go on', category: 'CRISIS_SUICIDAL_IDEATION_INDIRECT', severity: 'high' },
  { phrase: 'i can\'t do this anymore', category: 'CRISIS_SUICIDAL_IDEATION_INDIRECT', severity: 'high' },
  { phrase: 'i\'m at the end of my rope', category: 'CRISIS_SUICIDAL_IDEATION_INDIRECT', severity: 'high' },
  { phrase: 'i feel trapped', category: 'CRISIS_SUICIDAL_IDEATION_INDIRECT', severity: 'high' },
  { phrase: 'there\'s no way out', category: 'CRISIS_SUICIDAL_IDEATION_INDIRECT', severity: 'high' },
  { phrase: 'i\'m done', category: 'CRISIS_SUICIDAL_IDEATION_INDIRECT', severity: 'high' },
  { phrase: 'i\'m finished', category: 'CRISIS_SUICIDAL_IDEATION_INDIRECT', severity: 'high' },
  { phrase: 'i\'m so tired of this life', category: 'CRISIS_SUICIDAL_IDEATION_INDIRECT', severity: 'high' },
  { phrase: 'i just want to disappear', category: 'CRISIS_SUICIDAL_IDEATION_INDIRECT', severity: 'high' },
  { phrase: 'i just want to go to sleep and not wake up', category: 'CRISIS_SUICIDAL_IDEATION_INDIRECT', severity: 'high' },
  { phrase: 'i don\'t want to be here anymore', category: 'CRISIS_SUICIDAL_IDEATION_INDIRECT', severity: 'high' },
  { phrase: 'i don\'t see a future for myself', category: 'CRISIS_SUICIDAL_IDEATION_INDIRECT', severity: 'high' },
  { phrase: 'nothing will ever get better', category: 'CRISIS_SUICIDAL_IDEATION_INDIRECT', severity: 'high' },
  { phrase: 'there\'s no point in trying anymore', category: 'CRISIS_SUICIDAL_IDEATION_INDIRECT', severity: 'high' },
  { phrase: 'i have nothing to live for', category: 'CRISIS_SUICIDAL_IDEATION_INDIRECT', severity: 'high' },
  { phrase: 'i\'m such a burden', category: 'CRISIS_SUICIDAL_IDEATION_INDIRECT', severity: 'high' },
  { phrase: 'people would be better off without me', category: 'CRISIS_SUICIDAL_IDEATION_INDIRECT', severity: 'high' },
  { phrase: 'the world would be better if i were gone', category: 'CRISIS_SUICIDAL_IDEATION_INDIRECT', severity: 'high' },
  { phrase: 'soon this will all be over', category: 'CRISIS_SUICIDAL_IDEATION_INDIRECT', severity: 'high' },
  { phrase: 'if i see you again', category: 'CRISIS_SUICIDAL_IDEATION_INDIRECT', severity: 'high' },
  { phrase: 'i won\'t be around much longer', category: 'CRISIS_SUICIDAL_IDEATION_INDIRECT', severity: 'high' },
  { phrase: 'you won\'t have to worry about me soon', category: 'CRISIS_SUICIDAL_IDEATION_INDIRECT', severity: 'high' },
];

/**
 * 3. Mentioning specific methods or preparation
 * CRITICAL - Immediate emergency response required
 */
const METHOD_PHRASES: CrisisPhrase[] = [
  { phrase: 'i\'m going to jump', category: 'CRISIS_PLANNING_OR_METHOD', severity: 'critical' },
  { phrase: 'jump off a bridge', category: 'CRISIS_PLANNING_OR_METHOD', severity: 'critical' },
  { phrase: 'jump in front of a train', category: 'CRISIS_PLANNING_OR_METHOD', severity: 'critical' },
  { phrase: 'i\'m going to take all my pills', category: 'CRISIS_PLANNING_OR_METHOD', severity: 'critical' },
  { phrase: 'i\'m going to overdose', category: 'CRISIS_PLANNING_OR_METHOD', severity: 'critical' },
  { phrase: 'use gun on myself', category: 'CRISIS_PLANNING_OR_METHOD', severity: 'critical' },
  { phrase: 'use knife on myself', category: 'CRISIS_PLANNING_OR_METHOD', severity: 'critical' },
  { phrase: 'use razor on myself', category: 'CRISIS_PLANNING_OR_METHOD', severity: 'critical' },
  { phrase: 'i\'m going to hang myself', category: 'CRISIS_PLANNING_OR_METHOD', severity: 'critical' },
  { phrase: 'i\'m going to drown myself', category: 'CRISIS_PLANNING_OR_METHOD', severity: 'critical' },
  { phrase: 'researching painless ways to die', category: 'CRISIS_PLANNING_OR_METHOD', severity: 'critical' },
  { phrase: 'looking up how to kill myself', category: 'CRISIS_PLANNING_OR_METHOD', severity: 'critical' },
  { phrase: 'how many pills it takes to overdose', category: 'CRISIS_PLANNING_OR_METHOD', severity: 'critical' },
  { phrase: 'most effective suicide methods', category: 'CRISIS_PLANNING_OR_METHOD', severity: 'critical' },
  { phrase: 'bought a gun for myself', category: 'CRISIS_PLANNING_OR_METHOD', severity: 'critical' },
  { phrase: 'bought a rope', category: 'CRISIS_PLANNING_OR_METHOD', severity: 'critical' },
  { phrase: 'saving my meds for when i\'m ready', category: 'CRISIS_PLANNING_OR_METHOD', severity: 'critical' },
  { phrase: 'wrote my suicide note', category: 'CRISIS_PLANNING_OR_METHOD', severity: 'critical' },
  { phrase: 'picked the day i\'m going to do it', category: 'CRISIS_PLANNING_OR_METHOD', severity: 'critical' },
  { phrase: 'i know exactly how i\'m going to end my life', category: 'CRISIS_PLANNING_OR_METHOD', severity: 'critical' },
  { phrase: 'i have everything ready to end it', category: 'CRISIS_PLANNING_OR_METHOD', severity: 'critical' },
  { phrase: 'tried to overdose before', category: 'CRISIS_PLANNING_OR_METHOD', severity: 'critical' },
  { phrase: 'tried to cut before', category: 'CRISIS_PLANNING_OR_METHOD', severity: 'critical' },
  { phrase: 'tried to jump before', category: 'CRISIS_PLANNING_OR_METHOD', severity: 'critical' },
  { phrase: 'tried to hang myself before', category: 'CRISIS_PLANNING_OR_METHOD', severity: 'critical' },
  { phrase: 'last time i tried to kill myself', category: 'CRISIS_PLANNING_OR_METHOD', severity: 'critical' },
];

/**
 * 4. Self-harm without explicit suicide
 * HIGH - Crisis response required
 */
const SELF_HARM_PHRASES: CrisisPhrase[] = [
  { phrase: 'i\'ve been cutting myself', category: 'CRISIS_SELF_HARM', severity: 'high' },
  { phrase: 'i cut myself to cope', category: 'CRISIS_SELF_HARM', severity: 'high' },
  { phrase: 'i hurt myself on purpose', category: 'CRISIS_SELF_HARM', severity: 'high' },
  { phrase: 'scratching myself until i bleed', category: 'CRISIS_SELF_HARM', severity: 'high' },
  { phrase: 'i\'ve been burning myself', category: 'CRISIS_SELF_HARM', severity: 'high' },
  { phrase: 'i punch myself', category: 'CRISIS_SELF_HARM', severity: 'high' },
  { phrase: 'i hit my head', category: 'CRISIS_SELF_HARM', severity: 'high' },
  { phrase: 'i pull out my hair when i\'m upset', category: 'CRISIS_SELF_HARM', severity: 'high' },
  { phrase: 'i starve myself on purpose', category: 'CRISIS_SELF_HARM', severity: 'high' },
  { phrase: 'i binge and then make myself throw up', category: 'CRISIS_SELF_HARM', severity: 'high' },
  { phrase: 'i want to hurt myself', category: 'CRISIS_SELF_HARM', severity: 'high' },
  { phrase: 'i\'m scared i might hurt myself', category: 'CRISIS_SELF_HARM', severity: 'high' },
  { phrase: 'i can\'t stop hurting myself', category: 'CRISIS_SELF_HARM', severity: 'high' },
  { phrase: 'i like seeing myself bleed', category: 'CRISIS_SELF_HARM', severity: 'high' },
  { phrase: 'i deserve to be hurt', category: 'CRISIS_SELF_HARM', severity: 'high' },
  { phrase: 'i\'m thinking about cutting again', category: 'CRISIS_SELF_HARM', severity: 'high' },
  { phrase: 'i have the blade ready', category: 'CRISIS_SELF_HARM', severity: 'high' },
  { phrase: 'i have the knife ready', category: 'CRISIS_SELF_HARM', severity: 'high' },
  { phrase: 'i have the razor ready', category: 'CRISIS_SELF_HARM', severity: 'high' },
];

/**
 * 5. Severe hopelessness, worthlessness, and burden language
 * MODERATE - Escalate if combined with other crisis phrases
 */
const HOPELESSNESS_PHRASES: CrisisPhrase[] = [
  { phrase: 'i feel hopeless', category: 'RISK_SEVERE_HOPELESSNESS', severity: 'moderate' },
  { phrase: 'nothing will ever change', category: 'RISK_SEVERE_HOPELESSNESS', severity: 'moderate' },
  { phrase: 'i feel completely alone', category: 'RISK_SEVERE_HOPELESSNESS', severity: 'moderate' },
  { phrase: 'i feel empty all the time', category: 'RISK_SEVERE_HOPELESSNESS', severity: 'moderate' },
  { phrase: 'i\'m useless', category: 'RISK_SEVERE_HOPELESSNESS', severity: 'moderate' },
  { phrase: 'i\'m worthless', category: 'RISK_SEVERE_HOPELESSNESS', severity: 'moderate' },
  { phrase: 'i\'m a failure at everything', category: 'RISK_SEVERE_HOPELESSNESS', severity: 'moderate' },
  { phrase: 'i hate myself', category: 'RISK_SEVERE_HOPELESSNESS', severity: 'moderate' },
  { phrase: 'i\'m disgusting', category: 'RISK_SEVERE_HOPELESSNESS', severity: 'moderate' },
  { phrase: 'i\'m a burden to everyone', category: 'RISK_SEVERE_HOPELESSNESS', severity: 'moderate' },
  { phrase: 'everyone hates me', category: 'RISK_SEVERE_HOPELESSNESS', severity: 'moderate' },
  { phrase: 'nobody cares if i live or die', category: 'RISK_SEVERE_HOPELESSNESS', severity: 'moderate' },
  { phrase: 'no one would miss me', category: 'RISK_SEVERE_HOPELESSNESS', severity: 'moderate' },
  { phrase: 'i don\'t matter', category: 'RISK_SEVERE_HOPELESSNESS', severity: 'moderate' },
  { phrase: 'i have no purpose', category: 'RISK_SEVERE_HOPELESSNESS', severity: 'moderate' },
  { phrase: 'i\'m broken beyond repair', category: 'RISK_SEVERE_HOPELESSNESS', severity: 'moderate' },
];

/**
 * 6. Drastic behavior or context flags
 * MODERATE - Escalate if combined with crisis phrases
 */
const BEHAVIORAL_RED_FLAGS: CrisisPhrase[] = [
  { phrase: 'i\'ve been giving away my stuff', category: 'RISK_BEHAVIORAL_RED_FLAGS', severity: 'moderate' },
  { phrase: 'i\'m saying goodbye to people', category: 'RISK_BEHAVIORAL_RED_FLAGS', severity: 'moderate' },
  { phrase: 'i\'ve been writing letters to everyone', category: 'RISK_BEHAVIORAL_RED_FLAGS', severity: 'moderate' },
  { phrase: 'making sure everything is in order for when i\'m gone', category: 'RISK_BEHAVIORAL_RED_FLAGS', severity: 'moderate' },
  { phrase: 'i quit my job and don\'t care what happens', category: 'RISK_BEHAVIORAL_RED_FLAGS', severity: 'moderate' },
  { phrase: 'i\'ve been isolating from everyone', category: 'RISK_BEHAVIORAL_RED_FLAGS', severity: 'moderate' },
  { phrase: 'i don\'t talk to my friends or family anymore', category: 'RISK_BEHAVIORAL_RED_FLAGS', severity: 'moderate' },
  { phrase: 'i stay in my room all day', category: 'RISK_BEHAVIORAL_RED_FLAGS', severity: 'moderate' },
  { phrase: 'i started drinking a lot more', category: 'RISK_BEHAVIORAL_RED_FLAGS', severity: 'moderate' },
  { phrase: 'i\'m using drugs to escape', category: 'RISK_BEHAVIORAL_RED_FLAGS', severity: 'moderate' },
  { phrase: 'i\'ve been driving recklessly on purpose', category: 'RISK_BEHAVIORAL_RED_FLAGS', severity: 'moderate' },
  { phrase: 'i don\'t care if i get hurt anymore', category: 'RISK_BEHAVIORAL_RED_FLAGS', severity: 'moderate' },
];

/**
 * 7. Third-person / concern-for-others language
 * HIGH - Crisis response for the person being described
 */
const THIRD_PARTY_PHRASES: CrisisPhrase[] = [
  { phrase: 'my friend wants to kill themselves', category: 'CRISIS_THIRD_PARTY_SUICIDE_RISK', severity: 'high' },
  { phrase: 'my friend is talking about suicide', category: 'CRISIS_THIRD_PARTY_SUICIDE_RISK', severity: 'high' },
  { phrase: 'my friend said they want to die', category: 'CRISIS_THIRD_PARTY_SUICIDE_RISK', severity: 'high' },
  { phrase: 'someone i know is going to end their life', category: 'CRISIS_THIRD_PARTY_SUICIDE_RISK', severity: 'high' },
  { phrase: 'my child keeps saying they wish they were dead', category: 'CRISIS_THIRD_PARTY_SUICIDE_RISK', severity: 'high' },
  { phrase: 'my partner said the world would be better without them', category: 'CRISIS_THIRD_PARTY_SUICIDE_RISK', severity: 'high' },
  { phrase: 'a friend told me they are going to overdose', category: 'CRISIS_THIRD_PARTY_SUICIDE_RISK', severity: 'high' },
  { phrase: 'someone i know is cutting themself', category: 'CRISIS_THIRD_PARTY_SUICIDE_RISK', severity: 'high' },
  { phrase: 'my friend is talking about how they would do it', category: 'CRISIS_THIRD_PARTY_SUICIDE_RISK', severity: 'high' },
  { phrase: 'my friend wrote a suicide note', category: 'CRISIS_THIRD_PARTY_SUICIDE_RISK', severity: 'high' },
  { phrase: 'i\'m scared my friend will hurt themselves', category: 'CRISIS_THIRD_PARTY_SUICIDE_RISK', severity: 'high' },
];

/**
 * 8. Escalation / urgency phrases
 * CRITICAL - Immediate emergency response required
 */
const IMMINENT_DANGER_PHRASES: CrisisPhrase[] = [
  { phrase: 'i\'m going to do it now', category: 'CRISIS_IMMINENT_DANGER', severity: 'critical' },
  { phrase: 'i\'m going to do it tonight', category: 'CRISIS_IMMINENT_DANGER', severity: 'critical' },
  { phrase: 'i can\'t stop myself', category: 'CRISIS_IMMINENT_DANGER', severity: 'critical' },
  { phrase: 'i don\'t think i can stay safe', category: 'CRISIS_IMMINENT_DANGER', severity: 'critical' },
  { phrase: 'i\'m alone and i\'m scared of what i might do', category: 'CRISIS_IMMINENT_DANGER', severity: 'critical' },
  { phrase: 'i already took the pills', category: 'CRISIS_IMMINENT_DANGER', severity: 'critical' },
  { phrase: 'i already cut myself and it won\'t stop bleeding', category: 'CRISIS_IMMINENT_DANGER', severity: 'critical' },
  { phrase: 'i\'m bleeding a lot', category: 'CRISIS_IMMINENT_DANGER', severity: 'critical' },
  { phrase: 'i swallowed a lot of pills', category: 'CRISIS_IMMINENT_DANGER', severity: 'critical' },
  { phrase: 'i just tried to hang myself', category: 'CRISIS_IMMINENT_DANGER', severity: 'critical' },
  { phrase: 'i just tried to kill myself', category: 'CRISIS_IMMINENT_DANGER', severity: 'critical' },
  { phrase: 'i\'m sitting here with a gun', category: 'CRISIS_IMMINENT_DANGER', severity: 'critical' },
  { phrase: 'i\'m sitting here with a knife', category: 'CRISIS_IMMINENT_DANGER', severity: 'critical' },
  { phrase: 'i\'m sitting here with pills', category: 'CRISIS_IMMINENT_DANGER', severity: 'critical' },
  { phrase: 'i\'m sitting here with a rope', category: 'CRISIS_IMMINENT_DANGER', severity: 'critical' },
  { phrase: 'i\'m in the car ready to drive off the bridge', category: 'CRISIS_IMMINENT_DANGER', severity: 'critical' },
];

/**
 * All crisis phrases combined
 * This is the master list used for detection
 */
export const ALL_CRISIS_PHRASES: CrisisPhrase[] = [
  ...DIRECT_SUICIDE_PHRASES,
  ...INDIRECT_SUICIDE_PHRASES,
  ...METHOD_PHRASES,
  ...SELF_HARM_PHRASES,
  ...HOPELESSNESS_PHRASES,
  ...BEHAVIORAL_RED_FLAGS,
  ...THIRD_PARTY_PHRASES,
  ...IMMINENT_DANGER_PHRASES,
];

/**
 * Get all phrases for a specific category
 */
export function getPhrasesByCategory(category: CrisisCategory): CrisisPhrase[] {
  return ALL_CRISIS_PHRASES.filter(p => p.category === category);
}

/**
 * Get all phrases by severity
 */
export function getPhrasesBySeverity(severity: 'critical' | 'high' | 'moderate'): CrisisPhrase[] {
  return ALL_CRISIS_PHRASES.filter(p => p.severity === severity);
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: CrisisCategory): string {
  const names: Record<CrisisCategory, string> = {
    'CRISIS_SUICIDAL_IDEATION_DIRECT': 'Direct Suicide Statements',
    'CRISIS_SUICIDAL_IDEATION_INDIRECT': 'Indirect Suicide Statements',
    'CRISIS_PLANNING_OR_METHOD': 'Suicide Planning or Methods',
    'CRISIS_SELF_HARM': 'Self-Harm',
    'RISK_SEVERE_HOPELESSNESS': 'Severe Hopelessness',
    'RISK_BEHAVIORAL_RED_FLAGS': 'Behavioral Warning Signs',
    'CRISIS_THIRD_PARTY_SUICIDE_RISK': 'Concern for Others',
    'CRISIS_IMMINENT_DANGER': 'Immediate Danger',
  };
  return names[category] || category;
}

