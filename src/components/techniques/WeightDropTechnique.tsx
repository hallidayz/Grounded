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
        style={styles.anchor}
        animate={{
          y: phase === 'squeeze' ? 0 : 'calc(100vh - 200px)',
        }}
        transition={{
          duration: phase === 'release' ? 7 : 0,
          ease: 'easeIn',
        }}
      >
        <span style={styles.anchorIcon}>⚓</span>
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
    justifyContent: 'center',
    width: '100%',
    minHeight: '300px',
    padding: '2rem',
    position: 'relative' as const,
  },
  anchor: {
    position: 'absolute' as const,
    top: '50px',
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--text-primary, #1a1a1a)',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },
  anchorIcon: {
    fontSize: '2rem',
    color: 'white',
  },
  instructions: {
    marginTop: '200px',
    textAlign: 'center' as const,
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
