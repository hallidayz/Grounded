import React, { useState, useRef, useEffect } from 'react';
import { EmotionalState, EMOTIONAL_STATES } from '../services/emotionalStates';

interface EmotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmotionSelect: (primaryState: any, subState?: any) => void;
  selectedEmotion?: EmotionalState | null;
}

const EmotionModal: React.FC<EmotionModalProps> = ({
  isOpen,
  onClose,
  onEmotionSelect,
  selectedEmotion,
}) => {
  const [primaryEmotion, setPrimaryEmotion] = useState<EmotionalState | null>(
    selectedEmotion || null
  );
  const [selectedSubEmotion, setSelectedSubEmotion] = useState<EmotionalState | null>(null);

  const [dragY, setDragY] = useState(0);
  const startY = useRef<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
  }, [isOpen]);

  const handleClose = () => {
    setDragY(0);
    startY.current = null;
    setPrimaryEmotion(null);
    setSelectedSubEmotion(null);
    onClose();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) startY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!startY.current) return;
    const diff = e.touches[0].clientY - startY.current;
    if (sheetRef.current && sheetRef.current.scrollTop > 0) return;
    if (diff > 0) {
      e.preventDefault();
      setDragY(diff);
    }
  };
  const handleTouchEnd = () => {
    if (dragY > 80) handleClose();
    else setDragY(0);
    startY.current = null;
  };

  const handlePrimarySelect = (emotion: EmotionalState) => {
    setPrimaryEmotion(emotion);
    setSelectedSubEmotion(null);
  };

  const handleSubSelect = (emotion: EmotionalState) => {
    setSelectedSubEmotion(emotion);
    // Find the full EmotionalStateConfig for the selected emotion
    const emotionConfig = EMOTIONAL_STATES.find(e => e.state === emotion);
    const primaryConfig = EMOTIONAL_STATES.find(e => e.state === primaryEmotion);
    if (emotionConfig && primaryConfig) {
      onEmotionSelect(primaryConfig, emotionConfig);
    }
    handleClose();
  };

  const handlePrimaryConfirm = () => {
    if (primaryEmotion) {
      const primaryConfig = EMOTIONAL_STATES.find(e => e.state === primaryEmotion);
      if (primaryConfig) {
        onEmotionSelect(primaryConfig);
      }
    }
    handleClose();
  };

  if (!isOpen) return null;

  // Get primary emotion config for display
  const primaryConfig = primaryEmotion ? EMOTIONAL_STATES.find(e => e.state === primaryEmotion) : null;

  return (
    <>
      <div
        role="presentation"
        onClick={handleClose}
        className={`fixed inset-0 bg-black/50 dark:bg-black/70 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        className={`absolute bottom-0 inset-x-0 z-50 w-full
          max-h-screen-dvh bg-white dark:bg-dark-bg-secondary
          rounded-t-2xl shadow-2xl overflow-y-auto pb-safe
          transition-transform duration-300 ease-out
          motion-safe:animate-sheet-up motion-reduce:transition-none`}
        style={{
          transform: `translateY(${isOpen ? dragY : 100}%)`,
          transition: dragY ? 'none' : undefined,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex justify-center pt-2 pb-3">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        <div className="px-5 pb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-text-primary dark:text-white">
              {primaryEmotion ? 'Select Sub‑Emotion' : 'How are you feeling?'}
            </h2>
            <button
              aria-label="Close"
              onClick={handleClose}
              className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white text-xl font-bold"
            >
              ×
            </button>
          </div>

          {!primaryEmotion && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {EMOTIONAL_STATES.map((emotion) => (
                <button
                  key={emotion.state}
                  onClick={() => handlePrimarySelect(emotion.state)}
                  style={{ touchAction: 'manipulation' }}
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

          {primaryEmotion && primaryConfig && (
            <>
              <h3 className="mb-2 text-sm text-text-secondary dark:text-white/70">
                Primary: {primaryConfig.shortLabel} {primaryConfig.emoji}
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {EMOTIONAL_STATES.filter(
                  (e) => e.state !== primaryEmotion // Show all emotions except the selected primary
                ).map((sub) => (
                  <button
                    key={sub.state}
                    onClick={() => handleSubSelect(sub.state)}
                    style={{ touchAction: 'manipulation' }}
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
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default EmotionModal;
