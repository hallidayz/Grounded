import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CompassionateTouchTechnique: React.FC = () => {
  const [countdown, setCountdown] = useState(10);
  const [wavePhase, setWavePhase] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Wave animation
    const waveTimer = setInterval(() => {
      setWavePhase((prev) => (prev + 1) % 100);
    }, 100);

    return () => {
      clearInterval(timer);
      clearInterval(waveTimer);
    };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.palmsContainer}>
        <motion.div
          style={styles.palm}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <span style={styles.palmIcon}>🤲</span>
        </motion.div>
        <motion.div
          style={styles.palm}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        >
          <span style={styles.palmIcon}>🤲</span>
        </motion.div>
      </div>
      
      <div style={styles.waveContainer}>
        <motion.div
          style={styles.wave}
          animate={{
            x: [0, 20, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div style={styles.instructions}>
        <p style={styles.instruction}>
          Cross your arms and stroke your upper arms (shoulders to elbows) or place hands over your heart.
        </p>
        <p style={styles.countdown}>{countdown}</p>
        <p style={styles.message}>
          Give yourself this moment of kindness. I am here for you.
        </p>
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
  },
  palmsContainer: {
    display: 'flex',
    gap: '2rem',
    marginBottom: '2rem',
  },
  palm: {
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    filter: 'drop-shadow(0 0 10px rgba(236, 72, 153, 0.5))',
  },
  palmIcon: {
    fontSize: '3rem',
  },
  waveContainer: {
    width: '100%',
    height: '40px',
    marginBottom: '2rem',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  wave: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(236, 72, 153, 0.3), transparent)',
    borderRadius: '50%',
  },
  instructions: {
    textAlign: 'center' as const,
  },
  instruction: {
    fontSize: '1rem',
    color: 'var(--text-primary, #1a1a1a)',
    marginBottom: '1rem',
    maxWidth: '300px',
  },
  countdown: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'var(--primary-color, #02295b)',
    marginBottom: '1rem',
  },
  message: {
    fontSize: '1rem',
    color: 'var(--text-secondary, #666)',
    fontStyle: 'italic',
    maxWidth: '300px',
  },
};

export default CompassionateTouchTechnique;
