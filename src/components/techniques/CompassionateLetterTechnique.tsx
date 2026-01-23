import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const STAGES = [
  { name: 'Grounding', duration: 60, instruction: 'Take 3 deep breaths' },
  { name: 'Writing', duration: 180, instruction: 'Write from the perspective of a Wise, Compassionate Friend' },
  { name: 'Read Back', duration: 60, instruction: 'Read these words back to yourself' },
];

const CompassionateLetterTechnique: React.FC = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(STAGES[0].duration);
  const [breathCount, setBreathCount] = useState(0);
  const [letterText, setLetterText] = useState('');
  const [breathPhase, setBreathPhase] = useState<'in' | 'hold' | 'out'>('in');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (currentStage < STAGES.length - 1) {
            setCurrentStage((s) => s + 1);
            return STAGES[s + 1].duration;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Breathing animation for grounding stage
    if (currentStage === 0) {
      const breathTimer = setInterval(() => {
        setBreathPhase((prev) => {
          if (prev === 'in') {
            setTimeout(() => setBreathPhase('hold'), 2000);
            return 'in';
          } else if (prev === 'hold') {
            setTimeout(() => setBreathPhase('out'), 2000);
            return 'hold';
          } else {
            setBreathCount((c) => Math.min(c + 1, 3));
            setTimeout(() => setBreathPhase('in'), 2000);
            return 'out';
          }
        });
      }, 6000);
      return () => {
        clearInterval(timer);
        clearInterval(breathTimer);
      };
    }

    return () => clearInterval(timer);
  }, [currentStage]);

  const stage = STAGES[currentStage];

  return (
    <div style={styles.container}>
      <h3 style={styles.stageName}>{stage.name}</h3>
      <p style={styles.instruction}>{stage.instruction}</p>
      <p style={styles.timer}>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</p>

      {currentStage === 0 && (
        <div style={styles.groundingContainer}>
          <motion.div
            style={styles.breathCircle}
            animate={{
              scale: breathPhase === 'in' ? 1.2 : breathPhase === 'out' ? 0.8 : 1,
            }}
            transition={{
              duration: 2,
              ease: breathPhase === 'in' ? 'easeOut' : 'easeIn',
            }}
          >
            <span style={styles.breathText}>
              {breathPhase === 'in' && 'Inhale...'}
              {breathPhase === 'hold' && 'Hold...'}
              {breathPhase === 'out' && 'Exhale...'}
            </span>
          </motion.div>
          <p style={styles.breathCount}>Breath {breathCount} of 3</p>
        </div>
      )}

      {currentStage === 1 && (
        <div style={styles.writingContainer}>
          <p style={styles.writingPrompt}>
            If a friend you loved was feeling exactly this way, what would you say to them?
          </p>
          <div style={styles.parchment}>
            <textarea
              value={letterText}
              onChange={(e) => setLetterText(e.target.value)}
              placeholder="Write your compassionate letter here..."
              style={styles.letterTextarea}
            />
          </div>
        </div>
      )}

      {currentStage === 2 && (
        <div style={styles.readBackContainer}>
          <div style={styles.parchment}>
            <p style={styles.letterText}>{letterText || 'Your letter will appear here...'}</p>
          </div>
          <p style={styles.readBackMessage}>
            Read these words back to yourself. They are for you, too.
          </p>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    minHeight: '400px',
  },
  stageName: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: 'var(--text-primary, #1a1a1a)',
  },
  instruction: {
    fontSize: '1rem',
    color: 'var(--text-secondary, #666)',
    marginBottom: '1rem',
    textAlign: 'center' as const,
  },
  timer: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'var(--primary-color, #02295b)',
    marginBottom: '2rem',
  },
  groundingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '1rem',
  },
  breathCircle: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-color, #02295b)',
    opacity: 0.7,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 40px rgba(2, 41, 91, 0.3)',
  },
  breathText: {
    fontSize: '1.25rem',
    fontWeight: '500',
    color: 'white',
  },
  breathCount: {
    fontSize: '1rem',
    color: 'var(--text-secondary, #666)',
  },
  writingContainer: {
    width: '100%',
    maxWidth: '600px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  writingPrompt: {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: 'var(--text-primary, #1a1a1a)',
    textAlign: 'center' as const,
    fontStyle: 'italic',
  },
  parchment: {
    backgroundColor: '#faf8f3',
    border: '2px solid #e8e5d8',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    minHeight: '200px',
  },
  letterTextarea: {
    width: '100%',
    minHeight: '200px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '1rem',
    fontFamily: 'inherit',
    resize: 'none' as const,
    outline: 'none',
    color: 'var(--text-primary, #1a1a1a)',
  },
  readBackContainer: {
    width: '100%',
    maxWidth: '600px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  letterText: {
    fontSize: '1rem',
    lineHeight: '1.6',
    color: 'var(--text-primary, #1a1a1a)',
    whiteSpace: 'pre-wrap' as const,
  },
  readBackMessage: {
    fontSize: '1rem',
    color: 'var(--text-secondary, #666)',
    textAlign: 'center' as const,
    fontStyle: 'italic',
    marginTop: '1rem',
  },
};

export default CompassionateLetterTechnique;
