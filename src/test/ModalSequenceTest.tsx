import React, { useState } from 'react';
import EmotionModal from '../components/EmotionModal';

// 🧩 Mock dummy components for reflection → goal → AI → encouragement
const DummyModal: React.FC<{
  name: string;
  onNext: () => void;
  onClose?: () => void;
  data?: { primary?: string; sub?: string };
}> = ({ name, onNext, onClose, data }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
    <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-xl p-6 max-w-sm text-center">
      <h2 className="text-lg font-semibold mb-4 text-text-primary dark:text-white">
        Dummy {name} Modal
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        This simulates the {name} modal.
      </p>
      {data && (
        <div className="text-xs text-gray-500 dark:text-gray-500 mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded">
          <p>
            <strong>Emotion:</strong> {data.primary}
            {data.sub && ` → ${data.sub}`}
          </p>
        </div>
      )}
      <div className="flex gap-2 justify-center">
        <button
          onClick={onNext}
          className="px-4 py-2 bg-brand text-white rounded hover:bg-brand-dark transition"
        >
          Next
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Close
          </button>
        )}
      </div>
    </div>
  </div>
);

/**
 * 🚧 Modal Sequence Test Harness
 * 
 * Standalone test component to verify the EmotionModal sequence:
 * Emotion → Reflection → Goal → AI → Encouragement
 * 
 * This uses dummy modals and does NOT touch production data.
 * 
 * Usage:
 * 1. Add route: <Route path="/modal-test" element={<ModalSequenceTest />} />
 * 2. Visit: http://localhost:5173/modal-test
 * 3. Click "Start Modal Sequence" and step through each modal
 */
export default function ModalSequenceTest() {
  const [showEmotionModal, setShowEmotionModal] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [showGoal, setShowGoal] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<{
    primary: string;
    sub: string;
  }>({
    primary: '',
    sub: '',
  });

  const handleEmotionSelect = (primary: string, sub?: string) => {
    console.log('[TEST] Emotion selected:', { primary, sub });
    setSelectedEmotion({ primary, sub: sub || '' });
    setShowEmotionModal(false);
    // Small delay to show modal transition
    setTimeout(() => setShowReflection(true), 200);
  };

  const resetSequence = () => {
    setShowEmotionModal(false);
    setShowReflection(false);
    setShowGoal(false);
    setShowAI(false);
    setShowEncouragement(false);
    setSelectedEmotion({ primary: '', sub: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-semibold mb-3 text-text-primary dark:text-white">
            🚧 Modal Sequence Test Harness
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            This runs the <strong>Emotion → Reflection → Goal → AI → Encouragement</strong> flow
            using dummy modals. No production data is touched.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowEmotionModal(true)}
              className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition font-medium"
            >
              Start Modal Sequence
            </button>
            {(showEmotionModal ||
              showReflection ||
              showGoal ||
              showAI ||
              showEncouragement) && (
              <button
                onClick={resetSequence}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Status Display */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-3 text-text-primary dark:text-white">
            Test Status
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  showEmotionModal ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
              <span className="text-gray-700 dark:text-gray-300">
                Emotion Modal: {showEmotionModal ? 'Open' : 'Closed'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  showReflection ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
              <span className="text-gray-700 dark:text-gray-300">
                Reflection: {showReflection ? 'Open' : 'Closed'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  showGoal ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
              <span className="text-gray-700 dark:text-gray-300">
                Goal Setting: {showGoal ? 'Open' : 'Closed'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  showAI ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
              <span className="text-gray-700 dark:text-gray-300">
                AI Counseling: {showAI ? 'Open' : 'Closed'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  showEncouragement ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
              <span className="text-gray-700 dark:text-gray-300">
                Encouragement: {showEncouragement ? 'Open' : 'Closed'}
              </span>
            </div>
          </div>

          {/* Selected Emotion Display */}
          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Selected Emotion:
            </p>
            <p className="text-base text-text-primary dark:text-white">
              {selectedEmotion.primary ? (
                <>
                  <span className="font-medium">{selectedEmotion.primary}</span>
                  {selectedEmotion.sub && (
                    <>
                      {' → '}
                      <span className="font-medium">{selectedEmotion.sub}</span>
                    </>
                  )}
                </>
              ) : (
                <span className="text-gray-500 dark:text-gray-400 italic">none</span>
              )}
            </p>
          </div>
        </div>

        {/* Test Instructions */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
            📋 Test Instructions
          </h3>
          <ol className="text-xs text-blue-800 dark:text-blue-400 space-y-1 list-decimal list-inside">
            <li>Click "Start Modal Sequence" to open EmotionModal</li>
            <li>Select a primary emotion (e.g., "Drained", "Heavy")</li>
            <li>Select a sub-emotion from the feelings array (e.g., "tired", "empty")</li>
            <li>Verify the Reflection modal opens automatically</li>
            <li>Click "Next" to proceed through Goal → AI → Encouragement</li>
            <li>Check the "Selected Emotion" display updates correctly</li>
          </ol>
        </div>
      </div>

      {/* 1️⃣ Emotion Modal - Uses REAL EmotionModal component */}
      {showEmotionModal && (
        <EmotionModal
          isOpen={showEmotionModal}
          onClose={() => setShowEmotionModal(false)}
          onEmotionSelect={handleEmotionSelect}
        />
      )}

      {/* 2️⃣ Reflection */}
      {showReflection && (
        <DummyModal
          name="Reflection"
          data={selectedEmotion}
          onNext={() => {
            setShowReflection(false);
            setTimeout(() => setShowGoal(true), 200);
          }}
          onClose={() => setShowReflection(false)}
        />
      )}

      {/* 3️⃣ Goal */}
      {showGoal && (
        <DummyModal
          name="Goal Setting"
          data={selectedEmotion}
          onNext={() => {
            setShowGoal(false);
            setTimeout(() => setShowAI(true), 200);
          }}
          onClose={() => setShowGoal(false)}
        />
      )}

      {/* 4️⃣ AI Counseling */}
      {showAI && (
        <DummyModal
          name="AI Counseling Analysis"
          data={selectedEmotion}
          onNext={() => {
            setShowAI(false);
            setTimeout(() => setShowEncouragement(true), 200);
          }}
          onClose={() => setShowAI(false)}
        />
      )}

      {/* 5️⃣ Encouragement */}
      {showEncouragement && (
        <DummyModal
          name="Encouragement"
          data={selectedEmotion}
          onNext={() => setShowEncouragement(false)}
          onClose={() => setShowEncouragement(false)}
        />
      )}
    </div>
  );
}

