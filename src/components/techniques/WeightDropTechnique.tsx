import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const WeightDropTechnique: React.FC = () => {
  const [phase, setPhase] = useState<'squeeze' | 'release'>('squeeze');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // 0-3s: Squeeze
    // 3-10s: Release
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          if (phase === 'squeeze') {
            setPhase('release');
            return 7; // Release for 7 seconds
          } else {
            return 0; // Complete
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

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
            <p style={styles.instruction}>Squeeze your shoulders to your ears. Clench your fists.</p>
            <p style={styles.countdown}>{countdown}</p>
          </>
        )}
        {phase === 'release' && (
          <>
            <p style={styles.instruction}>Drop the weight. Let your shoulders fall.</p>
            <p style={styles.countdown}>{countdown}</p>
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
