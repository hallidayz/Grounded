import React, { useMemo, useState, useEffect } from 'react';
import { ValueItem, LogEntry, Goal, LCSWConfig } from '../types';
import { EMOTIONAL_STATES } from '../services/emotionalStates';
import EncourageSection from './EncourageSection';
import CrisisResourcesModal from './CrisisResourcesModal';
import CrisisAlertModal from './CrisisAlertModal';
import GoalsSection from './GoalsSection';
import ValueCard from './ValueCard';
import ReflectionForm from './ReflectionForm';
import { useDashboard } from '../hooks/useDashboard';
import { useEmotion } from '../contexts/EmotionContext';

/**
 * Dashboard Props
 */
interface DashboardProps {
  values: ValueItem[];
  logs: LogEntry[];
  goals: Goal[];
  lcswConfig?: LCSWConfig;
  onNavigate?: (screen: string) => void;
  onLog?: (entry: LogEntry) => void;
  onUpdateGoals?: (goals: Goal[]) => void;
  initialEmotion?: string;
  initialFeeling?: string;
  initialEncouragement?: string | null;
}

/**
 * Main Dashboard Component
 */
const Dashboard: React.FC<DashboardProps> = ({
  values,
  logs,
  goals,
  lcswConfig,
  onNavigate,
  onLog,
  onUpdateGoals,
  initialEmotion,
  initialFeeling,
  initialEncouragement,
}) => {
  // ✅ useDashboard using object‑arg pattern
  const dashboard = useDashboard({ 
    values, 
    goals, 
    logs, 
    lcswConfig,
    onLog: onLog || (() => {}),
    onUpdateGoals: onUpdateGoals || (() => {}),
  });
  
  // Carry over emotion, feeling, and encouragement from home screen
  useEffect(() => {
    if (initialEmotion) {
      dashboard.setEmotionalState(initialEmotion as any);
      if (initialFeeling) {
        dashboard.setSelectedFeeling(initialFeeling);
      }
    }
    if (initialEncouragement && dashboard.setEncouragementText) {
      // Set encouragement directly if provided from home screen
      dashboard.setEncouragementText(initialEncouragement);
    }
  }, [initialEmotion, initialFeeling, initialEncouragement, dashboard]);

  // Emotion context integration
  const { setPrimaryEmotion, setSubEmotion } = useEmotion();

  // Local UI state
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [selectedValue, setSelectedValue] = useState<ValueItem | null>(null);
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);

  // Persist and restore the selected value card
  useEffect(() => {
    if (dashboard.activeValueId) {
      localStorage.setItem('selectedValueId', dashboard.activeValueId.toString());
    }
  }, [dashboard.activeValueId]);

  useEffect(() => {
    const savedId = localStorage.getItem('selectedValueId');
    if (savedId) {
      dashboard.setActiveValueId(savedId);
    }
  }, []);

  // Debug: Log when reflection modal state changes
  useEffect(() => {
    console.log('[Dashboard] Reflection modal state changed:', {
      showReflectionModal,
      selectedValue: selectedValue?.name || null,
      valuesCount: values.length
    });
  }, [showReflectionModal, selectedValue, values.length]);



  /**
   * Value check‑in ("+") button handler
   * Opens reflection modal directly using the first emotion selection
   */
  const handleCheckInClick = (val: ValueItem) => {
    setSelectedValue(val);
    dashboard.setActiveValueId(val.id);
    // Open reflection modal directly - uses first emotion selection
    setShowReflectionModal(true);
  };

  const closeReflectionModal = () => {
    setShowReflectionModal(false);
    setSelectedValue(null);
    dashboard.setActiveValueId(null);
  };

  // Get reflection placeholder helper
  const getReflectionPlaceholder = (freq: string, subFeeling?: string | null) => {
    const base = `What does ${selectedValue?.name || 'this value'} mean to you right now?`;
    if (subFeeling) {
      return `${base} How does feeling ${subFeeling} relate to ${selectedValue?.name || 'this'}?`;
    }
    return base;
  };

  /**
   * EncourageSection action handler
   */
  const handleActionClick = (action: 'reflection' | 'values' | 'resources') => {
    if (action === 'resources') setShowResourcesModal(true);
    if (action === 'values') onNavigate?.('values');
  };

  return (
    <div className="dashboard-container px-4 pb-12">
      {/* Values List Section - with priority indicators */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {values.map((val, index) => (
          <div
            key={val.id}
            className="p-3 border rounded-md flex items-center justify-between shadow-sm hover:shadow transition relative"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex-shrink-0">
                #{index + 1}
              </span>
              <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{val.name}</span>
            </div>
            <button
              onClick={() => handleCheckInClick(val)}
              className="bg-brand hover:bg-brand-dark text-white rounded-full w-8 h-8 text-xl flex items-center justify-center leading-[1] flex-shrink-0"
              title="Check in"
            >
              +
            </button>
          </div>
        ))}
      </div>

      {/* EncourageSection removed - encouragement now shows in reflection modal */}

      <GoalsSection goals={goals} />

      {/* Reflection Modal for value check-ins */}
      {showReflectionModal && selectedValue && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            // Close modal when clicking backdrop
            if (e.target === e.currentTarget) {
              closeReflectionModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-6 w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-text-primary dark:text-white">
                Reflection: {selectedValue.name}
              </h2>
              <button
                aria-label="Close"
                onClick={closeReflectionModal}
                className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white text-xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Encouragement displayed above reflection form */}
            {dashboard.encouragementText && (
              <div className="mb-4 p-4 bg-brand/5 dark:bg-brand/10 rounded-xl border border-brand/20 dark:border-brand/30">
                <p className="text-text-primary dark:text-white text-sm italic">
                  "{dashboard.encouragementText}"
                </p>
              </div>
            )}
            {dashboard.encouragementLoading && (
              <div className="mb-4 p-4 bg-brand/5 dark:bg-brand/10 rounded-xl border border-brand/20 dark:border-brand/30">
                <p className="text-text-secondary dark:text-white/70 text-sm italic">
                  Generating encouragement...
                </p>
              </div>
            )}

            <ReflectionForm
              value={selectedValue}
              emotionalState={dashboard.emotionalState}
              selectedFeeling={dashboard.selectedFeeling}
              showFeelingsList={false}
              reflectionText={dashboard.reflectionText}
              goalText={dashboard.goalText}
              goalFreq={dashboard.goalFreq}
              reflectionAnalysis={dashboard.reflectionAnalysis}
              analyzingReflection={false}
              coachInsight={dashboard.coachInsight}
              valueMantra={dashboard.valueMantra}
              loading={dashboard.loading}
              aiGoalLoading={false}
              lcswConfig={lcswConfig}
              onEmotionalStateChange={dashboard.setEmotionalState}
              onShowFeelingsListToggle={() => {}}
              onSelectedFeelingChange={dashboard.setSelectedFeeling}
              onReflectionTextChange={dashboard.setReflectionText}
              onGoalTextChange={dashboard.setGoalText}
              onGoalFreqChange={dashboard.setGoalFreq}
              onSuggestGoal={() => {}}
              onCommit={() => {
                if (selectedValue) {
                  dashboard.handleCommit(selectedValue.id);
                  closeReflectionModal();
                }
              }}
              getReflectionPlaceholder={getReflectionPlaceholder}
              onTriggerReflectionAnalysis={() => {}}
            />
          </div>
        </div>
      )}

      {/* Crisis Resource & Alert Modals */}
      {showResourcesModal && (
        <CrisisResourcesModal onClose={() => setShowResourcesModal(false)} />
      )}

      {showCrisisAlert && (
        <CrisisAlertModal
          onClose={() => setShowCrisisAlert(false)}
          lcswConfig={lcswConfig}
        />
      )}
    </div>
  );
};

export default Dashboard;