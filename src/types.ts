export type EnergyLevel = '10s' | '2min' | '5min';
export type MoodType = 'heavy' | 'neutral' | 'light' | 'uncertain';

export interface Moment {
  id: string;
  energy: EnergyLevel;
  mood?: MoodType;
  note?: string;
  timestamp: Date;
}

export interface AppSettings {
  reminders?: {
    enabled?: boolean;
    frequency?: 'daily' | 'weekly';
    time?: string;
  };
}

export interface EnergyOption {
  energy: EnergyLevel;
  label: string;
  icon: string;
  duration: string;
  description: string;
}

export interface CrisisResource {
  name: string;
  action: string;
  description: string;
}

export type ConversationNode = 
  | 'welcome'
  | 'low_energy_offer'
  | 'low_energy_yes'
  | 'low_energy_no'
  | 'low_energy_grounding'
  | 'low_energy_complete'
  | 'medium_swirl_offer'
  | 'medium_swirl_response'
  | 'medium_swirl_grounding'
  | 'medium_swirl_complete'
  | 'high_chaos_offer'
  | 'high_chaos_grounding'
  | 'high_chaos_visualization'
  | 'high_chaos_tiny_steps'
  | 'high_chaos_crisis'
  | 'high_chaos_complete'
  | 'panic_offer'
  | 'panic_yes'
  | 'panic_no'
  | 'panic_breath'
  | 'panic_escalate'
  | 'panic_complete'
  | 'mild_offer'
  | 'mild_specific'
  | 'mild_general'
  | 'mild_anchor'
  | 'mild_complete'
  | 'crisis_resources'
  | 'session_complete';

export interface ConversationState {
  node: ConversationNode;
  energy: EnergyLevel;
  depth: number;
  lastUserInput?: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}
