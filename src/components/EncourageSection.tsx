import React from 'react';
import { EmotionalState, getEmotionalState } from '../services/emotionalStates';
import { LCSWConfig } from '../types';
import EmotionSelector from './EmotionSelector';
import AIResponseBubble from './AIResponseBubble';
import SkeletonCard from './SkeletonCard';
import StatusIndicator from './StatusIndicator';

interface EncourageSectionProps {
  encouragementText: string | null;
  encouragementLoading: boolean;
  lastEncouragedState: string | null;
  selectedFeeling: string | null;
  lowStateCount: number;
  lcswConfig?: LCSWConfig;
  values: Array<{ id: string }>;
  onSelectEmotion: (state: EmotionalState) => void;
  onActionClick: (action: 'reflection' | 'values' | 'resources') => void;
  onResetEncouragement: () => void;
  onOpenFirstValue: () => void;
  dashboardActiveValueId: string | null; // ADDED PROPS
}

const EncourageSection: React.FC<EncourageSectionProps> = ({
  encouragementText,
  encouragementLoading,
  lastEncouragedState,
  selectedFeeling,
  lowStateCount,
  lcswConfig,
  values,
  onSelectEmotion,
  onActionClick,
  onResetEncouragement,
  onOpenFirstValue,
  dashboardActiveValueId // ADDED PROPS
}) => {
  // Get emoji from emotional state config
  const stateConfig = lastEncouragedState ? getEmotionalState(lastEncouragedState as EmotionalState) : null;
  const feelingEmoji = stateConfig?.emoji || '💙';

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-xl sm:rounded-2xl border border-border-soft dark:border-dark-border shadow-sm p-4 sm:p-5">
      {/* Render EmotionSelector only when no value card is active */}
      {dashboardActiveValueId === null ? (
        <EmotionSelector
          onSelect={onSelectEmotion}
          selected={lastEncouragedState as EmotionalState | undefined}
          disabled={encouragementLoading}
        />
      ) : null}

      {/* Display AI encouragement message */}
      {encouragementText && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs sm:text-sm font-black text-text-primary/50 dark:text-white/50 uppercase tracking-widest">Encouragement</span>
            <StatusIndicator
              status={
                encouragementLoading
                  ? 'processing'
                  : encouragementText
                  ? 'complete'
                  : 'not-done'
              }
              size="sm"
            />
          </div>
          <AIResponseBubble
            message={encouragementText}
            emotion={lastEncouragedState || undefined}
            feeling={selectedFeeling || undefined}
            feelingEmoji={feelingEmoji}
            onActionClick={(action) => {
              if (action === 'reflection') {
                onOpenFirstValue();
              } else {
                onActionClick(action);
              }
            }}
          />

          {/* Safety net message for repeated low states */}
          {lowStateCount >= 3 && (lastEncouragedState === 'drained' || lastEncouragedState === 'heavy' || lastEncouragedState === 'overwhelmed') && (
            <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-200 font-medium">
                💙 <strong>Consider reaching out:</strong> You've been feeling low several times. Your therapist ({lcswConfig?.emergencyContact?.phone || 'contact them'}), a trusted friend, or the 988 Crisis & Suicide Lifeline can provide support. You don't have to go through this alone.
              </p>
            </div>
          )}

          <button
            onClick={onResetEncouragement}
            className="w-full py-2 text-sm text-text-secondary dark:text-white/70 hover:text-text-primary dark:hover:text-white transition-colors"
          >
            Choose a different feeling
          </button>
        </div>
      )}

      {encouragementLoading && (
        <div className="space-y-3">
          <SkeletonCard lines={2} showHeader={true} />
        </div>
      )}
    </div>
  );
};

export default EncourageSection;