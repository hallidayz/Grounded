import React, { useMemo, useState, useEffect } from 'react';
import { ValueItem, LogEntry, Goal, LCSWConfig } from '../types';
import { EMOTIONAL_STATES, getEmotionalState } from '../services/emotionalStates';
import MoodTrendChart from './MoodTrendChart';
import EncourageSection from './EncourageSection';
import CrisisResourcesModal from './CrisisResourcesModal';
import CrisisAlertModal from './CrisisAlertModal';
import GoalsSection from './GoalsSection';
import ValueCard from './ValueCard';
import EmotionModal from './EmotionModal';
import ReflectionForm from './ReflectionForm';
import { useDashboard } from '../hooks/useDashboard';

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

  // Local UI state
  const [showEmotionModal, setShowEmotionModal] = useState(false);
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

  /**
   * Emotion button handler - opens EmotionModal for sub-emotion selection
   */
  const handleEmotionClick = () => {
    setShowEmotionModal(true);
  };

  /**
   * Handle emotion selection from EmotionModal
   */
  const handleEmotionSelect = async (primaryState: any, subState?: any) => {
    dashboard.setEmotionalState(primaryState.state);
    if (subState) {
      dashboard.setSelectedFeeling(subState.shortLabel);
    }
    // Automatically generate encouragement when emotion is selected
    await dashboard.handleEmotionalEncourage(primaryState.state);
    // After emotion selection, if we have values, open reflection form with first value
    if (values.length > 0) {
      setSelectedValue(values[0]);
      dashboard.setActiveValueId(values[0].id);
      setShowReflectionModal(true);
    }
    setShowEmotionModal(false);
  };

  /**
   * Value check‑in ("+") button handler
   */
  const handleCheckInClick = (val: ValueItem) => {
    setSelectedValue(val);
    dashboard.setActiveValueId(val.id);
    // Don't set emotional state to 'mixed' - let user select emotion if they want
    // If no emotion selected, it will remain null/empty
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

  /**
   * Build mood trend chart dataset
   */
  const moodData = useMemo(
    () =>
      logs.map((log) => ({
        date: new Date(log.date),
        emotion: getEmotionalState(log.emotion),
      })),
    [logs]
  );

  return (
    <div className="dashboard-container px-4 pb-12">
      {/* Emotion Section */}
      <h2 className="text-xl font-semibold mb-3">How are you feeling?</h2>
      <div className="flex flex-wrap gap-3 mb-6">
        {EMOTIONAL_STATES.map((emotion) => {
          // Only highlight if emotion was explicitly selected (has selectedFeeling or encouragementText indicates selection)
          const isSelected = dashboard.emotionalState === emotion.state && 
                            (dashboard.selectedFeeling || dashboard.encouragementText);
          return (
            <button
              key={emotion.id}
              onClick={handleEmotionClick}
              className={`px-4 py-2 rounded-md border text-sm capitalize transition-colors duration-150 ${
                isSelected
                  ? 'bg-blue-500 text-white border-blue-600'
                  : 'bg-white hover:bg-blue-100 border-gray-300 text-gray-700'
              }`}
            >
              {emotion.label}
            </button>
          );
        })}
      </div>

      {/* Mood Trends - moved above values */}
      <MoodTrendChart data={moodData} />

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

      {/* Emotion Modal for sub-emotion selection */}
      <EmotionModal
        isOpen={showEmotionModal}
        onClose={() => setShowEmotionModal(false)}
        onEmotionSelect={handleEmotionSelect}
        selectedEmotion={EMOTIONAL_STATES.find(e => e.state === dashboard.emotionalState) || null}
      />

      {/* Reflection Modal for value check-ins */}
      {showReflectionModal && selectedValue && (
        <EmotionModal onClose={closeReflectionModal}>
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
        </EmotionModal>
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