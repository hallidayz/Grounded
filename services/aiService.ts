/**
 * AI SERVICE - MAIN EXPORT
 * 
 * This file re-exports all AI functionality from the modular structure.
 * Maintains backward compatibility with existing imports.
 * 
 * The AI service has been split into:
 * - ai/models.ts - Model loading and management
 * - ai/crisis.ts - Crisis detection and response
 * - ai/reports.ts - Clinical report generation
 * - ai/encouragement.ts - Encouragement and guidance generation
 */

// Re-export model functions
export {
  clearModels,
  initializeModels,
  preloadModels,
  areModelsLoaded,
  getModelStatus,
  getCompatibilityReport,
  // Model selection functions
  getSelectedModel,
  setSelectedModel,
  getModelConfig,
  getAllModelConfigs,
  // Internal helper functions (for advanced use cases)
  getMoodTrackerModel,
  getCounselingCoachModel,
  getIsModelLoading,
  isTextGenerationModel
} from './ai/models';

// Re-export compatibility functions
export {
  checkBrowserCompatibility,
  getCompatibilitySummary
} from './ai/browserCompatibility';

// Re-export crisis functions
export {
  detectCrisis,
  getCrisisResponse
} from './ai/crisis';

// Re-export report functions
export {
  assessMentalState,
  generateHumanReports,
  generateFallbackReport
} from './ai/reports';

// Re-export encouragement functions
export {
  generateEncouragement,
  generateEmotionalEncouragement,
  generateCounselingGuidance,
  generateValueMantra,
  suggestGoal,
  analyzeReflection
} from './ai/encouragement';
