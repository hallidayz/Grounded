import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const GroundingFlashTechnique: React.FC = () => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    // 0-4s: Inhale
    // 4-6s: Hold
    // 6-10s: Exhale
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          if (phase === 'inhale') {
            setPhase('hold');
            return 2; // Hold for 2 seconds
          } else if (phase === 'hold') {
            setPhase('exhale');
            return 4; // Exhale for 4 seconds
          } else {
            return 0; // Complete
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  const scale = phase === 'inhale' ? 1.2 : phase === 'hold' ? 1.2 : 0.3;

  return (
    <div style={styles.container}>
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
        <span style={styles.countdown}>{countdown}</span>
      </motion.div>
      <p style={styles.instruction}>
        {phase === 'inhale' && 'Inhale...'}
        {phase === 'hold' && 'Hold...'}
        {phase === 'exhale' && 'Exhale slowly...'}
      </p>
      <p style={styles.message}>Just this breath. You are safe in this moment.</p>
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
    color: 'white',
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
  },
};

export default GroundingFlashTechnique;
