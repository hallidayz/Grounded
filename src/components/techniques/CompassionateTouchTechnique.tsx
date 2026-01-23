import React from 'react';
import { motion } from 'framer-motion';
import type { TechniqueComponentProps } from '../../types/sessions';

const CompassionateTouchTechnique: React.FC<TechniqueComponentProps> = ({
  currentPhase,
  countdown,
  phaseIndex,
  sessionConfig,
}) => {
  // Support both SessionEngine (with props) and standalone usage (without props)
  const [localCountdown, setLocalCountdown] = React.useState(10);
  const [isRunning, setIsRunning] = React.useState(false);

  // If props are provided, use them (SessionEngine mode)
  const displayCountdown = countdown !== undefined ? countdown : localCountdown;
  const instruction = currentPhase?.prompt || 'Place your hands over your heart. Feel the warmth and rhythm.';
  const message = sessionConfig?.message || 'Give yourself this moment of kindness. I am here for you.';

  // Standalone mode: manage own timer
  React.useEffect(() => {
    if (countdown === undefined && !isRunning) {
      setIsRunning(true);
      const timer = setInterval(() => {
        setLocalCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown, isRunning]);

  return (
    <div style={styles.container}>
      <motion.div
        style={styles.handsOverHeart}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div style={styles.handsContainer}>
          <span style={styles.handIcon}>🤲</span>
        </div>
        <span style={styles.heartIcon}>❤️</span>
      </motion.div>

      <div style={styles.instructions}>
        <p style={styles.instruction}>{instruction}</p>
        <p style={styles.countdown}>{displayCountdown}</p>
        <p style={styles.message}>{message}</p>
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
  },
  handsOverHeart: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
    marginBottom: '2rem',
    width: '150px',
    height: '150px',
  },
  handsContainer: {
    position: 'absolute' as const,
    top: '20%',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 2,
  },
  handIcon: {
    fontSize: '4rem',
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
  },
  heartIcon: {
    fontSize: '5rem',
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1,
    filter: 'drop-shadow(0 0 10px rgba(236, 72, 153, 0.4))',
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
