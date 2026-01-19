/**
 * Energy Entry Screen
 *
 * First screen users see - energy-based entry points.
 * No login required. Immediate access to grounding tools.
 *
 * Energy levels:
 * - 10 seconds: Quick breath reset
 * - 2 minutes: Breath + mood check-in
 * - 5 minutes: Body scan + reflection
 */

import React, { useState, useCallback } from 'react';
import GroundingTool from './GroundingTool';
import EmotionSelection from './EmotionSelection';
import CrisisResourcesModal from './CrisisResourcesModal';
import { COPY, getValidationCopy, getCompletionMessage } from '../utils/copyLibrary';
import { logger } from '../utils/logger';

type EnergyLevel = '10s' | '2min' | '5min';

interface EnergyEntryProps {
  onSaveMoment?: (moment: { energy: EnergyLevel; mood?: string; note?: string }) => void;
}

interface SavedMoment {
  energy: EnergyLevel;
  timestamp: Date;
  mood?: string;
}

const EnergyEntry: React.FC<EnergyEntryProps> = ({ onSaveMoment }) => {
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel | null>(null);
  const [showCrisis, setShowCrisis] = useState(false);
  const [showGrounding, setShowGrounding] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [savedMoments, setSavedMoments] = useState<SavedMoment[]>([]);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const handleEnergySelect = useCallback((energy: EnergyLevel) => {
    logger.info('[EnergyEntry] User selected energy level:', energy);
    setSelectedEnergy(energy);

    if (energy === '10s') {
      setShowGrounding(true);
    } else {
      setShowCheckIn(true);
    }
  }, []);

  const handleGroundingComplete = useCallback((action: 'coach' | 'better' | 'more-help') => {
    logger.info('[EnergyEntry] Grounding complete with action:', action);
    setShowGrounding(false);

    if (selectedEnergy) {
      const message = getCompletionMessage(selectedEnergy);
      setValidationMessage(message);

      const newMoment: SavedMoment = {
        energy: selectedEnergy,
        timestamp: new Date(),
      };
      setSavedMoments(prev => [...prev, newMoment]);
      onSaveMoment?.({ energy: selectedEnergy });

      // Clear message after delay
      setTimeout(() => {
        setValidationMessage(null);
        setSelectedEnergy(null);
      }, 3000);
    }
  }, [selectedEnergy, onSaveMoment]);

  const handleCheckInComplete = useCallback((emotion: string, feeling: string) => {
    logger.info('[EnergyEntry] Check-in complete:', { emotion, feeling });
    setShowCheckIn(false);

    if (selectedEnergy) {
      const message = getValidationCopy(emotion);
      setValidationMessage(message);

      const newMoment: SavedMoment = {
        energy: selectedEnergy,
        timestamp: new Date(),
        mood: emotion,
      };
      setSavedMoments(prev => [...prev, newMoment]);
      onSaveMoment?.({ energy: selectedEnergy, mood: emotion });

      // Clear message after delay
      setTimeout(() => {
        setValidationMessage(null);
        setSelectedEnergy(null);
      }, 4000);
    }
  }, [selectedEnergy, onSaveMoment]);

  return (
    <div className="min-h-screen bg-bg-primary dark:bg-dark-bg-primary">
      {/* Header */}
      <header className="p-6 text-center">
        <h1 className="text-3xl font-black text-text-primary dark:text-white mb-2">
          Grounded
        </h1>
        <p className="text-sm text-text-secondary dark:text-white/70 max-w-md mx-auto">
          {COPY.energyEntry.privacyNote}
        </p>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-32">
        {/* Energy Question */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-text-primary dark:text-white text-center mb-6">
            {COPY.energyEntry.title}
          </h2>

          {/* Energy Options */}
          <div className="space-y-4">
            {COPY.energyEntry.options.map((option) => (
              <button
                key={option.energy}
                onClick={() => handleEnergySelect(option.energy)}
                className={`w-full p-5 rounded-xl border-2 transition-all duration-200 text-left ${option.color}`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{option.icon}</span>
                  <div className="flex-1">
                    <div className="font-bold text-text-primary dark:text-white text-lg">
                      {option.label}
                    </div>
                    <div className="text-sm text-text-secondary dark:text-white/60">
                      {option.description}
                    </div>
                  </div>
                  <span className="text-2xl text-text-secondary dark:text-white/40">→</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Validation Message */}
        {validationMessage && (
          <section className="mb-8 animate-fade-in">
            <div className="p-4 bg-brand/10 dark:bg-brand/20 border border-brand/30 dark:border-brand/30 rounded-xl">
              <p className="text-text-primary dark:text-white text-center italic">
                "{validationMessage}"
              </p>
            </div>
          </section>
        )}

        {/* Saved Moments Summary */}
        {savedMoments.length > 0 && !validationMessage && (
          <section className="mt-8 p-4 bg-brand/5 dark:bg-brand/10 rounded-xl">
            <p className="text-sm text-text-secondary dark:text-white/70 text-center">
              You've come back on {savedMoments.length} different moments.
              <br />
              <span className="italic">{COPY.history.footer}</span>
            </p>

            {/* Dots visualization */}
            <div className="flex justify-center gap-2 mt-4 flex-wrap">
              {savedMoments.slice(-14).map((moment, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    moment.energy === '10s' ? 'bg-green-400' :
                    moment.energy === '2min' ? 'bg-yellow-400' : 'bg-blue-400'
                  }`}
                  title={`${moment.energy} - ${moment.mood || 'no mood'}`}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Crisis Button (Always Visible) */}
      <button
        onClick={() => setShowCrisis(true)}
        className="fixed bottom-6 left-6 right-6 py-3 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
      >
        {COPY.energyEntry.crisisButton}
      </button>

      {/* Grounding Tool Modal (10s) */}
      {showGrounding && (
        <GroundingTool
          onComplete={handleGroundingComplete}
          onClose={() => {
            setShowGrounding(false);
            setSelectedEnergy(null);
          }}
        />
      )}

      {/* Check-in Modal (2min/5min) */}
      {showCheckIn && selectedEnergy && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-primary dark:bg-dark-bg-primary rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => {
                setShowCheckIn(false);
                setSelectedEnergy(null);
              }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-bg-secondary dark:bg-dark-bg-secondary hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">
                {selectedEnergy === '2min' ? '2 minutes: Breath + check-in' : '5 minutes: Body scan + reflection'}
              </h3>

              <EmotionSelection
                onEmotionChange={(emotion, feeling) => {
                  logger.debug('[EnergyEntry] Emotion changed:', { emotion, feeling });
                }}
              />

              <button
                onClick={() => handleCheckInComplete('checked-in', 'no specific feeling')}
                className="w-full mt-4 py-3 bg-brand dark:bg-brand-light text-white dark:text-navy-dark rounded-xl font-black uppercase tracking-widest text-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crisis Resources Modal */}
      {showCrisis && (
        <CrisisResourcesModal
          onClose={() => setShowCrisis(false)}
        />
      )}
    </div>
  );
};

export default EnergyEntry;
