import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const STAGES = [
  {
    name: 'Mindfulness',
    duration: 40,
    instruction: 'Labeling the pain: "This is a moment of suffering"',
  },
  {
    name: 'Common Humanity',
    duration: 40,
    instruction: '"Suffering is part of life; I am not alone"',
  },
  {
    name: 'Self-Kindness',
    duration: 40,
    instruction: 'Select a kind phrase to repeat',
  },
];

const KIND_PHRASES = [
  'May I be kind to myself',
  'May I accept myself as I am',
  'May I give myself the compassion I need',
  'May I be patient with myself',
];

const SelfCompassionBreakTechnique: React.FC = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(STAGES[0].duration);
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null);
  const [breathPhase, setBreathPhase] = useState<'in' | 'out'>('in');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (currentStage < STAGES.length - 1) {
            setCurrentStage((s) => s + 1);
            return STAGES[currentStage + 1].duration;
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
  }, [currentStage]);

  const stage = STAGES[currentStage];

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
        <h3 style={styles.stageName}>{stage.name}</h3>
        <p style={styles.instruction}>{stage.instruction}</p>
        <p style={styles.timer}>{timeRemaining}s</p>
      </div>

      {currentStage === 2 && (
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
    padding: '2rem',
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
    color: 'var(--primary-color, #02295b)',
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
