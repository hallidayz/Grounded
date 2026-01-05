import React, { useMemo, useState, useEffect } from 'react';
import { ValueItem, LogEntry, Goal, LCSWConfig } from '../types';
import { EMOTIONAL_STATES, getEmotionalState } from '../services/emotionalStates';
import MoodTrendChart from './MoodTrendChart';
import EncourageSection from './EncourageSection';
import CrisisResourcesModal from './CrisisResourcesModal';
import CrisisAlertModal from './CrisisAlertModal';
import GoalsSection from './GoalsSection';
import ValueCard from './ValueCard';
import useDashboard from '../hooks/useDashboard';
import useEmotion from '../hooks/useEmotion';

interface DashboardProps {
  values: ValueItem[];
  logs: LogEntry[];
  goals: Goal[];
  lcswConfig?: LCSWConfig;
  onNavigate?: (screen: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  values,
  logs,
  goals,
  lcswConfig,
  onNavigate,
}) => {
  const dashboard = useDashboard(values, logs, goals);
  const { emotionalState, setEmotionalState } = useEmotion();
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);

  // ✅ Restore and persist selected Value ID
  useEffect(() => {
    const savedId = localStorage.getItem('selectedValueId');
    if (savedId) {
      dashboard.setActiveValueId(Number(savedId));
    }
  }, []);

  useEffect(() => {
    if (dashboard.activeValueId) {
      localStorage.setItem('selectedValueId', dashboard.activeValueId.toString());
    }
  }, [dashboard.activeValueId]);

  // ✅ Restore proper action handling
  const handleActionClick = (action: 'reflection' | 'values' | 'resources') => {
    if (action === 'resources') setShowResourcesModal(true);
    if (action === 'values') onNavigate?.('values');
  };

  const handleOpenFirstValue = () => {
    if (values && values.length > 0) {
      dashboard.setActiveValueId(values[0].id);
    }
  };

  const moodData = useMemo(
    () => logs.map((log) => ({
      date: new Date(log.date),
      emotion: getEmotionalState(log.emotion),
    })),
    [logs]
  );

  return (
    <div className="dashboard-container">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

      {/* ✅ Restored List of Values */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {values.map((val: ValueItem) => (
          <ValueCard
            key={val.id}
            value={val}
            isActive={dashboard.activeValueId === val.id}
            onClick={() => dashboard.setActiveValueId(val.id)}
          />
        ))}
      </div>

      {/* Mood Trends */}
      <MoodTrendChart data={moodData} />

      {/* Encouragement Section (existing) */}
      <EncourageSection
        emotion={emotionalState}
        goals={goals}
        onActionClick={handleActionClick}
      />

      {/* Goal Progress */}
      <GoalsSection goals={goals} onSelectValue={handleOpenFirstValue} />

      {/* Crisis Modals */}
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