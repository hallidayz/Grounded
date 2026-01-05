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
}) => {
  // ✅ useDashboard using object‑arg pattern
  const dashboard = useDashboard({ values, goals, logs, lcswConfig });

  // Local UI state
  const [emotionalState, setEmotionalState] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
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
   * Emotion button handler
   */
  const handleEmotionClick = (emotionId: string) => {
    setSelectedEmotion(emotionId);
    setEmotionalState(emotionId);
    setSelectedValue(null);
    setShowModal(true);
  };

  /**
   * Value check‑in (“+”) button handler
   */
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
        {EMOTIONAL_STATES.map((emotion) => (
          <button
            key={emotion.id}
            onClick={() => handleEmotionClick(emotion.id)}
            className={`px-4 py-2 rounded-md border text-sm capitalize transition-colors duration-150 ${
              emotionalState === emotion.id
                ? 'bg-blue-500 text-white border-blue-600'
                : 'bg-white hover:bg-blue-100 border-gray-300 text-gray-700'
            }`}
          >
            {emotion.label}
          </button>
        ))}
      </div>

      {/* Values List Section */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {values.map((val) => (
          <div
            key={val.id}
            className="p-3 border rounded-md flex items-center justify-between shadow-sm hover:shadow transition"
          >
            <span className="font-medium text-gray-800">{val.name}</span>
            <button
              onClick={() => handleCheckInClick(val)}
              className="bg-green-500 hover:bg-green-600 text-white rounded-full w-8 h-8 text-xl flex items-center justify-center leading-[1]"
              title="Check in"
            >
              +
            </button>
          </div>
        ))}
      </div>

      {/* Mood/Encouragement/Goals */}
      <MoodTrendChart data={moodData} />

      <EncourageSection
        emotion={selectedEmotion}
        goals={goals}
        onActionClick={handleActionClick}
      />

      <GoalsSection goals={goals} />

      {/* Shared Modal for Emotion + Value reflections */}
      {showModal && (
        <EmotionModal onClose={closeModal}>
          <ReflectionForm
            emotion={selectedEmotion}
            value={selectedValue}
            onClose={closeModal}
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