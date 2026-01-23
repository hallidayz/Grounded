import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { TechniqueComponentProps } from '../../types/sessions';

const KIND_PHRASES = [
  'May I be kind to myself',
  'May I accept myself as I am',
  'May I give myself the compassion I need',
  'May I be patient with myself',
];

const SelfCompassionBreakTechnique: React.FC<TechniqueComponentProps> = ({
  currentPhase,
  countdown,
  phaseIndex,
  sessionConfig,
}) => {
  // Support both SessionEngine (with props) and standalone usage (without props)
  const [localStage, setLocalStage] = useState(0);
  const [localTimeRemaining, setLocalTimeRemaining] = useState(40);
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null);
  const [breathPhase, setBreathPhase] = useState<'in' | 'out'>('in');

  // If props are provided, use them (SessionEngine mode)
  const displayCountdown = countdown !== undefined ? countdown : localTimeRemaining;
  const currentStageIndex = phaseIndex !== undefined ? phaseIndex : localStage;
  
  // Get stage info from currentPhase or use defaults
  const stageName = currentPhase?.label || (currentStageIndex === 0 ? 'Mindfulness' : currentStageIndex === 1 ? 'Common Humanity' : 'Self-Kindness');
  const instruction = currentPhase?.prompt || (currentStageIndex === 0 
    ? 'Labeling the pain: "This is a moment of suffering"'
    : currentStageIndex === 1
    ? '"Suffering is part of life; I am not alone"'
    : 'Select a kind phrase to repeat');

  // Standalone mode: manage own timer
  useEffect(() => {
    if (countdown === undefined) {
      const timer = setInterval(() => {
        setLocalTimeRemaining((prev) => {
          if (prev <= 1) {
            if (localStage < 2) {
              setLocalStage((s) => s + 1);
              return 40;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Breathing animation
      const breathTimer = setInterval(() => {
        setBreathPhase((prev) => (prev === 'in' ? 'out' : 'in'));
      }, 3000);

      return () => {
        clearInterval(timer);
        clearInterval(breathTimer);
      };
    } else {
      // SessionEngine mode: just handle breathing animation
      const breathTimer = setInterval(() => {
        setBreathPhase((prev) => (prev === 'in' ? 'out' : 'in'));
      }, 3000);
      return () => clearInterval(breathTimer);
    }
  }, [countdown, localStage]);

  return (
    <div style={styles.container}>
      <motion.div
        style={styles.heart}
        animate={{
          scale: breathPhase === 'in' ? 1.1 : 1,
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <span style={styles.heartIcon}>💗</span>
      </motion.div>

      <div style={styles.stageInfo}>
        <h3 style={styles.stageName}>{stageName}</h3>
        <p style={styles.instruction}>{instruction}</p>
        <p style={styles.timer}>{displayCountdown}s</p>
      </div>

      {currentStageIndex === 2 && (
        <div style={styles.phrasesContainer}>
          <p style={styles.phrasesLabel}>Select a phrase:</p>
          <div style={styles.phrasesGrid}>
            {KIND_PHRASES.map((phrase) => (
              <button
                key={phrase}
                style={{
                  ...styles.phraseButton,
                  ...(selectedPhrase === phrase ? styles.phraseButtonSelected : {}),
                }}
                onClick={() => setSelectedPhrase(phrase)}
              >
                {phrase}
              </button>
            ))}
          </div>
          {selectedPhrase && (
            <p style={styles.repeatPhrase}>Repeat: "{selectedPhrase}"</p>
          )}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: '300px',
    maxHeight: 'calc(100svh - 200px)', // Fit between header and footer
    padding: '1rem',
    overflowY: 'auto' as const,
  },
  heart: {
    width: '120px',
    height: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    filter: 'drop-shadow(0 0 20px rgba(236, 72, 153, 0.5))',
    marginBottom: '2rem',
  },
  heartIcon: {
    fontSize: '4rem',
  },
  stageInfo: {
    textAlign: 'center' as const,
    marginBottom: '1.5rem',
  },
  stageName: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--text-primary, #1a1a1a)',
    marginBottom: '0.5rem',
  },
  instruction: {
    fontSize: '1rem',
    color: 'var(--text-secondary, #666)',
    marginBottom: '1rem',
    fontStyle: 'italic',
  },
  timer: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'var(--primary, #2c5282)', // Use CSS variable that adapts to dark mode
  },
  phrasesContainer: {
    width: '100%',
    maxWidth: '400px',
    marginTop: '1rem',
  },
  phrasesLabel: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary, #666)',
    marginBottom: '0.5rem',
    textAlign: 'center' as const,
  },
  phrasesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  phraseButton: {
    padding: '0.75rem',
    border: '2px solid var(--border-color, #e0e0e0)',
    borderRadius: '0.5rem',
    backgroundColor: 'var(--bg-card, #ffffff)',
    cursor: 'pointer',
    fontSize: '0.85rem',
    textAlign: 'center' as const,
    transition: 'all 0.2s ease',
  },
  phraseButtonSelected: {
    borderColor: 'var(--primary-color, #02295b)',
    backgroundColor: 'var(--primary-light, #f0f4f8)',
  },
  repeatPhrase: {
    fontSize: '1rem',
    color: 'var(--primary-color, #02295b)',
    textAlign: 'center' as const,
    fontWeight: '500',
    fontStyle: 'italic',
  },
};

export default SelfCompassionBreakTechnique;
