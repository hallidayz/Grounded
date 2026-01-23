import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { TechniqueComponentProps } from '../../types/sessions';

const GroundingFlashTechnique: React.FC<TechniqueComponentProps> = ({
  currentPhase,
  countdown,
  phaseIndex,
  sessionConfig,
  bestFor,
}) => {
  // Support both SessionEngine (with props) and standalone usage (without props)
  const [localPhase, setLocalPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [localCountdown, setLocalCountdown] = useState(4);

  // If props are provided, use them (SessionEngine mode)
  const phase = currentPhase 
    ? (currentPhase.label.toLowerCase().includes('inhale') 
        ? 'inhale' 
        : currentPhase.label.toLowerCase().includes('hold')
        ? 'hold'
        : 'exhale')
    : localPhase;
  
  const displayCountdown = countdown !== undefined ? countdown : localCountdown;
  const instruction = currentPhase?.instruction || (phase === 'inhale' ? 'Inhale...' : phase === 'hold' ? 'Hold...' : 'Exhale slowly...');
  const message = sessionConfig?.message || 'Just this breath. You are safe in this moment.';
  
  const scale = phase === 'inhale' ? 1.2 : phase === 'hold' ? 1.2 : 0.3;

  // Standalone mode: manage own timer
  useEffect(() => {
    if (countdown === undefined) {
      const timer = setInterval(() => {
        setLocalCountdown((prev) => {
          if (prev <= 0) {
            if (localPhase === 'inhale') {
              setLocalPhase('hold');
              return 2;
            } else if (localPhase === 'hold') {
              setLocalPhase('exhale');
              return 4;
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
      <div style={styles.iconContainer}>
        <span style={styles.icon}>⚡</span>
      </div>
      <motion.div
        style={styles.circle}
        animate={{
          scale: scale,
        }}
        transition={{
          duration: phase === 'inhale' ? 4 : phase === 'hold' ? 2 : 4,
          ease: phase === 'inhale' ? 'easeOut' : phase === 'exhale' ? 'easeIn' : 'linear',
        }}
      >
        <span style={styles.countdown}>{displayCountdown}</span>
      </motion.div>
      <p style={styles.instruction}>{instruction}</p>
      <p style={styles.message}>{message}</p>
      {bestFor && (
        <p style={styles.bestFor}>Best for: {bestFor}</p>
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
  circle: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-color, #02295b)',
    opacity: 0.7,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '2rem',
    boxShadow: '0 0 40px rgba(2, 41, 91, 0.3)',
  },
  countdown: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'white', // White on colored circle background
  },
  instruction: {
    fontSize: '1.25rem',
    fontWeight: '500',
    color: 'var(--text-primary, #1a1a1a)',
    marginBottom: '1rem',
  },
  message: {
    fontSize: '1rem',
    color: 'var(--text-secondary, #666)',
    textAlign: 'center' as const,
    fontStyle: 'italic',
    maxWidth: '300px',
    marginBottom: '0.5rem',
  },
  iconContainer: {
    marginBottom: '1rem',
  },
  icon: {
    fontSize: '2.5rem',
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

export default GroundingFlashTechnique;
