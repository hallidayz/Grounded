import React, { useState } from 'react';
import { EMOTIONAL_STATES } from '../services/emotionalStates';

interface EmotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmotionSelect: (primary: string, sub?: string) => void;
  selectedEmotion?: any | null;
  preSelectedEmotion?: string | null; // Pre-selected emotion to open directly to sub-emotions
}

const EmotionModal: React.FC<EmotionModalProps> = ({
  isOpen,
  onClose,
  onEmotionSelect,
  selectedEmotion,
  preSelectedEmotion,
}) => {
  const [primaryEmotion, setPrimaryEmotion] = useState<string | null>(preSelectedEmotion || null);
  
  // Update primaryEmotion when preSelectedEmotion changes (e.g., when emotion button is clicked)
  React.useEffect(() => {
    if (preSelectedEmotion && isOpen) {
      setPrimaryEmotion(preSelectedEmotion);
    } else if (!isOpen) {
      // Reset when modal closes
      setPrimaryEmotion(null);
    }
  }, [preSelectedEmotion, isOpen]);

  if (!isOpen) return null;

  const handlePrimarySelect = (emotion: string) => setPrimaryEmotion(emotion);

  const handleSubSelect = (feeling: string) => {
    if (primaryEmotion) onEmotionSelect(primaryEmotion, feeling);
    onClose();
  };

  const handlePrimaryOnly = () => {
    if (primaryEmotion) onEmotionSelect(primaryEmotion);
    onClose();
  };

  const primaryConfig = EMOTIONAL_STATES.find((e) => e.state === primaryEmotion);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-6 w-[90%] max-w-md shadow-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {!primaryEmotion ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-text-primary dark:text-white">
                How are you feeling?
              </h2>
              <button
                aria-label="Close"
                onClick={onClose}
                className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {EMOTIONAL_STATES.map((emotion) => (
                <button
                  key={emotion.state}
                  onClick={() => handlePrimarySelect(emotion.state)}
                  className={`p-3 rounded-xl border shadow-sm transition flex flex-col items-center text-sm ${
                    selectedEmotion?.state === emotion.state
                      ? 'bg-brand text-white border-brand'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-brand hover:text-white text-text-primary dark:text-white'
                  }`}
                >
                  <span className="text-2xl">{emotion.emoji}</span>
                  <span className="mt-1">{emotion.shortLabel}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setPrimaryEmotion(null)}
              className="text-sm text-brand hover:underline mb-3"
            >
              ← Back
            </button>
            <h2 className="text-xl font-semibold text-center mb-3 text-text-primary dark:text-white">
              {primaryConfig?.emoji} {primaryConfig?.shortLabel}
            </h2>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {primaryConfig?.feelings.map((f) => (
                <button
                  key={f}
                  onClick={() => handleSubSelect(f)}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-brand hover:text-white capitalize text-text-primary dark:text-white transition"
                >
                  {f}
                </button>
              ))}
            </div>

            <button
              onClick={handlePrimaryOnly}
              className="w-full py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition"
            >
              Select {primaryConfig?.shortLabel}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EmotionModal;
