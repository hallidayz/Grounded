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

  // ✅ use local state — no more useEmotion()
  const [emotionalState, setEmotionalState] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<ValueItem | null>(null);
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);

  // ⏳ Persist selected value
  useEffect(() => {
    if (dashboard.activeValueId) {
      localStorage.setItem(
        'selectedValueId',
        dashboard.activeValueId.toString()
      );
    }
  }, [dashboard.activeValueId]);

  useEffect(() => {
    const savedId = localStorage.getItem('selectedValueId');
    if (savedId) {
      dashboard.setActiveValueId(Number(savedId));
    }
  }, []);

  const handleEmotionClick = (emotionId: string) => {
    setSelectedEmotion(emotionId);
    setSelectedValue(null);
    setShowModal(true);
  };

  const handleCheckInClick = (val: ValueItem) => {
    setSelectedValue(val);
    setSelectedEmotion(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEmotion(null);
    setSelectedValue(null);
  };

  const handleActionClick = (action: 'reflection' | 'values' | 'resources') => {
    if (action === 'resources') setShowResourcesModal(true);
    if (action === 'values') onNavigate?.('values');
  };

  const moodData = useMemo(
    () =>
      logs.map((log) => ({
        date: new Date(log.date),
        emotion: getEmotionalState(log.emotion),
      })),
    [logs]
  );

  return (
    <div className="dashboard-container p-4">
      {/* Emotion section */}
      <h2 className="text-xl font-semibold mb-3">How are you feeling?</h2>
      <div className="flex flex-wrap gap-3 mb-6">
        {EMOTIONAL_STATES.map((emotion) => (
          <button
            key={emotion.id}
            onClick={() => handleEmotionClick(emotion.id)}
            className={`px-4 py-2 rounded-md border text-sm capitalize ${
              emotionalState === emotion.id
                ? 'bg-blue-500 text-white'
                : 'bg-white hover:bg-blue-100'
            }`}
          >
            {emotion.label}
          </button>
        ))}
      </div>

      {/* Values list section */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {values.map((val) => (
          <div
            key={val.id}
            className="p-3 border rounded-md flex items-center justify-between"
          >
            <span className="font-medium text-gray-800">{val.name}</span>
            <button
              onClick={() => handleCheckInClick(val)}
              className="bg-green-500 hover:bg-green-600 text-white rounded-full w-8 h-8 text-xl"
              title="Check in"
            >
              +
            </button>
          </div>
        ))}
      </div>

      {/* Keep existing components for familiarity */}
      <MoodTrendChart data={moodData} />

      <EncourageSection
        emotion={emotionalState}
        goals={goals}
        onActionClick={handleActionClick}
      />

      <GoalsSection goals={goals} />

      {/* Modals */}
      {showModal && (
        <EmotionModal onClose={closeModal}>
          <ReflectionForm
            emotion={selectedEmotion}
            value={selectedValue}
            onClose={closeModal}
          />
        </EmotionModal>
      )}

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