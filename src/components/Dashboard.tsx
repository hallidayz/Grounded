import React, { useMemo, useState, useEffect } from 'react';
import { ValueItem, LogEntry, Goal, LCSWConfig } from '../types';
import { EMOTIONAL_STATES, getEmotionalState } from '../services/emotionalStates';
import MoodTrendChart from './MoodTrendChart';
import EncourageSection from './EncourageSection';
import ValueCard from './ValueCard';
import GoalsSection from './GoalsSection';
import CrisisResourcesModal from './CrisisResourcesModal';
import CrisisAlertModal from './CrisisAlertModal';
import { useDashboard } from '../hooks/useDashboard';
import { useEmotion } from '../contexts/EmotionContext';
import EmotionModal from './EmotionModal';

const Dashboard = ({ values, onLog, goals, onUpdateGoals, logs, lcswConfig, onNavigate, onReset, initialValueId }: any) => {
  const dashboard = useDashboard(values, goals, logs, lcswConfig, onLog, onUpdateGoals);
  const [showResourcesModal, setShowResourcesModal] = useState(false);

  const { emotionState, setPrimaryEmotion, setSubEmotion, clearEmotions } = useEmotion();
  const [showEmotionModal, setShowEmotionModal] = useState(false);

  const handleModalEmotionSelect = (primary: any, sub?: any) => {
    dashboard.setEmotionalState(primary.state);
    if (sub) dashboard.setSelectedFeeling(sub.shortLabel);
    setPrimaryEmotion(primary.state, 'dashboard');
    if (sub?.shortLabel) setSubEmotion(sub.shortLabel);
    setShowEmotionModal(false);
  };

  const handleOpenFirstValue = () => {
    if (values.length > 0) {
      dashboard.setActiveValueId(values[0].id);
    }
  };

  const handleActionClick = (action: 'reflection' | 'values' | 'resources') => {
    if (action === 'resources') setShowResourcesModal(true);
    if (action === 'values') onNavigate?.('values');
  };

  const topValue = values[0];

  return (
    <div className="space-y-6 pb-20 animate-fade-in">

      {/* Greeting simplified */}
      <h1 className="text-2xl font-bold text-text-primary dark:text-white">Dashboard</h1>

      {/* Encourage Section */}
      <EncourageSection
        encouragementText={dashboard.encouragementText}
        encouragementLoading={dashboard.encouragementLoading}
        lastEncouragedState={dashboard.lastEncouragedState}
        selectedFeeling={dashboard.selectedFeeling}
        lowStateCount={dashboard.lowStateCount}
        lcswConfig={lcswConfig}
        values={values}
        onSelectEmotion={() => setShowEmotionModal(true)}
        onActionClick={handleActionClick}
        onResetEncouragement={() => {
          dashboard.resetEncouragement();
          clearEmotions();
        }}
        onOpenFirstValue={handleOpenFirstValue}
      />

      {/* Unified Emotion Modal */}
      <EmotionModal
        isOpen={showEmotionModal}
        onClose={() => setShowEmotionModal(false)}
        onEmotionSelect={handleModalEmotionSelect}
        selectedEmotion={
          EMOTIONAL_STATES.find((e) => e.state === dashboard.emotionalState) || null
        }
      />

      {/* Rest of your file unchanged – goals, values, chart, modals, etc. */}
      <GoalsSection goals={goals} values={values} onCompleteGoal={dashboard.handleCompleteGoal} />

      {showResourcesModal && (
        <CrisisResourcesModal onClose={() => setShowResourcesModal(false)} lcswConfig={lcswConfig} />
      )}
      {dashboard.crisisAlert && (
        <CrisisAlertModal data={dashboard.crisisAlert} onClose={() => dashboard.setCrisisAlert(null)} />
      )}
    </div>
  );
};

export default React.memo(Dashboard);