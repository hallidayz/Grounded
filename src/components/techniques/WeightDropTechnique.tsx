import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { TechniqueComponentProps } from '../../types/sessions';

const WeightDropTechnique: React.FC<TechniqueComponentProps> = ({
  currentPhase,
  countdown,
  phaseIndex,
  sessionConfig,
  bestFor,
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
        style={styles.rocksContainer}
        animate={{
          y: phase === 'squeeze' ? 0 : 150,
          opacity: phase === 'squeeze' ? 1 : 0.3,
        }}
        transition={{
          duration: phase === 'release' ? 7 : 0,
          ease: 'easeIn',
        }}
      >
        <div style={styles.rockPile}>
          <span style={styles.rockIcon}>🪨</span>
        </div>
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
        {bestFor && (
          <p style={styles.bestFor}>Best for: {bestFor}</p>
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
    minHeight: '300px',
    maxHeight: 'calc(100svh - 200px)', // Fit between header and footer
    padding: '1rem',
    overflowY: 'auto' as const,
    position: 'relative' as const,
  },
  rocksContainer: {
    position: 'relative' as const,
    top: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    height: '120px',
  },
  rockPile: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.25rem',
    position: 'relative' as const,
  },
  rockIcon: {
    fontSize: '2.5rem',
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
    display: 'block',
    transform: 'rotate(0deg)',
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
    color: 'var(--primary, #2c5282)', // Use CSS variable that adapts to dark mode
  },
  bestFor: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary, #666)',
    textAlign: 'center' as const,
    fontStyle: 'italic',
    marginTop: '0.5rem',
    opacity: 0.8,
  },
};

export default WeightDropTechnique;
