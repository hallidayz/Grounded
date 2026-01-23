import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { TechniqueComponentProps } from '../../types/sessions';

const WeightDropTechnique: React.FC<TechniqueComponentProps> = ({
  currentPhase,
  countdown,
  phaseIndex,
  sessionConfig,
}) => {
  // Support both SessionEngine (with props) and standalone usage (without props)
  const [localPhase, setLocalPhase] = useState<'squeeze' | 'release'>('squeeze');
  const [localCountdown, setLocalCountdown] = useState(3);

  // If props are provided, use them (SessionEngine mode)
  const phase = currentPhase 
    ? (currentPhase.label.toLowerCase().includes('squeeze') ? 'squeeze' : 'release')
    : localPhase;
  
  const displayCountdown = countdown !== undefined ? countdown : localCountdown;
  const getInstruction = () => {
    if (currentPhase?.prompt) return currentPhase.prompt;
    return phase === 'squeeze' 
      ? 'Squeeze your shoulders to your ears. Clench your fists.'
      : 'Drop the weight. Let your shoulders fall.';
  };
  const instruction = getInstruction();

  // Standalone mode: manage own timer
  useEffect(() => {
    if (countdown === undefined) {
      const timer = setInterval(() => {
        setLocalCountdown((prev) => {
          if (prev <= 0) {
            if (localPhase === 'squeeze') {
              setLocalPhase('release');
              return 7;
            } else {
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown, localPhase]);

  return (
    <div style={styles.container}>
      <motion.div
        style={styles.weightsContainer}
        animate={{
          y: phase === 'squeeze' ? 0 : 200,
        }}
        transition={{
          duration: phase === 'release' ? 7 : 0,
          ease: 'easeIn',
        }}
      >
        <span style={styles.weightIcon}>🏋️</span>
        <span style={styles.weightIcon}>🪨</span>
      </motion.div>
      <div style={styles.instructions}>
        {phase === 'squeeze' && (
          <>
            <p style={styles.instruction}>{instruction}</p>
            <p style={styles.countdown}>{displayCountdown}</p>
          </>
        )}
        {phase === 'release' && (
          <>
            <p style={styles.instruction}>{instruction}</p>
            <p style={styles.countdown}>{displayCountdown}</p>
          </>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    minHeight: '400px',
    maxHeight: 'calc(100vh - 200px)',
    padding: '1rem',
    overflow: 'hidden',
    position: 'relative' as const,
  },
  weightsContainer: {
    position: 'relative' as const,
    top: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '2rem',
  },
  weightIcon: {
    fontSize: '3rem',
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
  },
  instructions: {
    textAlign: 'center' as const,
    marginTop: '1rem',
  },
  instruction: {
    fontSize: '1.25rem',
    fontWeight: '500',
    color: 'var(--text-primary, #1a1a1a)',
    marginBottom: '1rem',
  },
  countdown: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'var(--primary-color, #02295b)',
  },
};

export default WeightDropTechnique;
