import React, { useState, useRef } from 'react';
import { EmotionalState, EMOTIONAL_STATES } from '../services/emotionalStates';

interface EmotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmotionSelect: (primaryState: EmotionalState, subState?: EmotionalState) => void;
  selectedEmotion?: EmotionalState | null;
}

const EmotionModal: React.FC<EmotionModalProps> = ({
  isOpen,
  onClose,
  onEmotionSelect,
  selectedEmotion,
}) => {
  const [primaryEmotion, setPrimaryEmotion] = useState<EmotionalState | null>(selectedEmotion || null);
  const [selectedSubEmotion, setSelectedSubEmotion] = useState<EmotionalState | null>(null);

  // gesture drag logic
  const [dragY, setDragY] = useState(0);
  const startY = useRef<number | null>(null);

  if (!isOpen) return null;

  const handlePrimarySelect = (emotion: EmotionalState) => {
    setPrimaryEmotion(emotion);
    setSelectedSubEmotion(null);
  };

  const handleSubSelect = (emotion: EmotionalState) => {
    setSelectedSubEmotion(emotion);
    onEmotionSelect(primaryEmotion!, emotion);
    handleClose();
  };

  const handlePrimaryConfirm = () => {
    if (primaryEmotion) {
      onEmotionSelect(primaryEmotion);
    }
    handleClose();
  };

  const handleClose = () => {
    setPrimaryEmotion(null);
    setSelectedSubEmotion(null);
    setDragY(0);
    onClose();
  };

  // touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (startY.current !== null) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;
      if (diff > 0) setDragY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (dragY > 100) handleClose();
    else setDragY(0);
    startY.current = null;
  };

  return (
    <>
      {/* darkened backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/50 dark:bg-black/70 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      ></div>

      {/* bottom sheet container */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 w-full max-h-[80vh] bg-white dark:bg-dark-bg-secondary rounded-t-2xl shadow-xl transition-transform ease-out duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          transform: `translateY(${isOpen ? dragY : 100}%)`,
          transition: dragY ? 'none' : 'transform 0.3s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* handle bar */}
        <div className="flex justify-center items-center pt-2 pb-3">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>

        <div className="px-5 pb-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-text-primary dark:text-white">
              {primaryEmotion ? 'Select Sub‑Emotion' : 'How are you feeling?'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white text-xl font-bold"
            >
              ×
            </button>
          </div>

          {/* primary emotions */}
          {!primaryEmotion && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {EMOTIONAL_STATES.map((emotion) => (
                <button
                  key={emotion.state}
                  onClick={() => handlePrimarySelect(emotion)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border shadow-sm transition ${
                    selectedEmotion?.state === emotion.state
                      ? 'bg-brand text-white border-brand'
                      : 'bg-gray-100 dark:bg-dark-bg-primary border-gray-200 dark:border-gray-700 text-text-primary dark:text-white'
                  }`}
                >
                  <span className="text-2xl">{emotion.emoji}</span>
                  <span className="text-xs mt-1">{emotion.shortLabel}</span>
                </button>
              ))}
            </div>
          )}

          {/* sub emotions */}
          {primaryEmotion && (
            <div>
              <h3 className="mb-2 text-sm text-text-secondary dark:text-white/70">
                Primary: {primaryEmotion.shortLabel} {primaryEmotion.emoji}
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {EMOTIONAL_STATES.filter(
                  (e) => e.category === primaryEmotion.category,
                ).map((sub) => (
                  <button
                    key={sub.state}
                    onClick={() => handleSubSelect(sub)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl shadow-sm border text-lg transition ${
                      selectedSubEmotion?.state === sub.state
                        ? 'bg-brand text-white border-brand'
                        : 'bg-gray-100 dark:bg-dark-bg-primary border-gray-200 dark:border-gray-700 text-text-primary dark:text-white'
                    }`}
                  >
                    <span className="text-2xl">{sub.emoji}</span>
                    <span className="text-xs mt-1">{sub.shortLabel}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handlePrimaryConfirm}
                className="mt-5 w-full py-2 text-white font-medium bg-brand rounded-lg hover:bg-brand-dark transition"
              >
                Skip Sub‑Emotion
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EmotionModal;