import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { TechniqueComponentProps } from '../../types/sessions';
import { generateId } from '../../services/energyTrackingService';

const FEELING_BUBBLES = ['Fear', 'Heavy', 'Tight', 'Angry', 'Sad', 'Anxious', 'Overwhelmed'];
const BODY_PARTS = ['chest', 'throat', 'stomach', 'shoulders', 'head', 'hands'];

const RAINMethodTechnique: React.FC<TechniqueComponentProps> = ({
  currentPhase,
  countdown,
  phaseIndex,
  sessionConfig,
}) => {
  // Support both SessionEngine (with props) and standalone usage (without props)
  const [localStage, setLocalStage] = useState(0);
  const [localTimeRemaining, setLocalTimeRemaining] = useState(60);
  
  // If props are provided, use them (SessionEngine mode)
  const currentStageIndex = phaseIndex !== undefined ? phaseIndex : localStage;
  const displayCountdown = countdown !== undefined ? countdown : localTimeRemaining;
  
  // Get stage info from currentPhase or use defaults
  const stageName = currentPhase?.label || (currentStageIndex === 0 ? 'Recognize' : currentStageIndex === 1 ? 'Allow' : currentStageIndex === 2 ? 'Investigate' : 'Nurture');
  const instruction = currentPhase?.prompt || (currentStageIndex === 0 
    ? 'Tap bubbles for feelings you notice'
    : currentStageIndex === 1
    ? 'Let it be. You don\'t have to change it yet.'
    : currentStageIndex === 2
    ? 'Tap where you feel the sensation in your body'
    : 'The bubbles transform into warm light');
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);
  const [bubbles, setBubbles] = useState<Array<{ id: string; label: string; x: number; y: number }>>([]);
  const [showBody, setShowBody] = useState(false);

  // Standalone mode: manage own timer
  useEffect(() => {
    if (countdown === undefined) {
      const timer = setInterval(() => {
        setLocalTimeRemaining((prev) => {
          if (prev <= 1) {
            if (localStage < 3) {
              const nextStage = localStage + 1;
              setLocalStage(nextStage);
              if (nextStage === 2) {
                setShowBody(true);
              }
              if (nextStage === 3) {
                setShowBody(false);
              }
              return nextStage === 0 ? 60 : nextStage === 1 ? 60 : nextStage === 2 ? 120 : 60;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      // SessionEngine mode: sync showBody with phase
      if (currentStageIndex === 2) {
        setShowBody(true);
      } else if (currentStageIndex === 3) {
        setShowBody(false);
      }
    }
  }, [countdown, localStage, currentStageIndex]);

  // Create floating bubbles for Recognize stage
  useEffect(() => {
    if (currentStageIndex === 0) {
      const createBubble = () => {
        const id = generateId('bubble');
        const label = FEELING_BUBBLES[Math.floor(Math.random() * FEELING_BUBBLES.length)];
        return {
          id,
          label,
          x: Math.random() * 80 + 10,
          y: Math.random() * 60 + 20,
        };
      };

      const bubbleInterval = setInterval(() => {
        setBubbles((prev) => {
          if (prev.length < 8) {
            return [...prev, createBubble()];
          }
          return prev;
        });
      }, 2000);

      return () => clearInterval(bubbleInterval);
    } else {
      // Clear bubbles when moving to other stages
      setBubbles([]);
    }
  }, [currentStageIndex]);

  const handleBubbleClick = (label: string) => {
    if (currentStageIndex === 0 && !selectedFeelings.includes(label)) {
      setSelectedFeelings((prev) => [...prev, label]);
    }
  };

  const handleBodyPartClick = (part: string) => {
    if (currentStageIndex === 2 && !selectedBodyParts.includes(part)) {
      setSelectedBodyParts((prev) => [...prev, part]);
    }
  };

  const minutes = Math.floor(displayCountdown / 60);
  const seconds = displayCountdown % 60;

  return (
    <div style={styles.container}>
      <h3 style={styles.stageName}>{stageName}</h3>
      <p style={styles.instruction}>{instruction}</p>
      <p style={styles.timer}>{minutes}:{seconds.toString().padStart(2, '0')}</p>

      {currentStageIndex === 0 && (
        <div style={styles.bubblesContainer}>
          {bubbles.map((bubble) => (
            <motion.button
              key={bubble.id}
              style={{
                ...styles.bubble,
                ...(selectedFeelings.includes(bubble.label) ? styles.bubbleSelected : {}),
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
              }}
              onClick={() => handleBubbleClick(bubble.label)}
              animate={{
                y: [0, -10, 0],
                scale: selectedFeelings.includes(bubble.label) ? 1.2 : 1,
              }}
              transition={{
                y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                scale: { duration: 0.2 },
              }}
            >
              {bubble.label}
            </motion.button>
          ))}
        </div>
      )}

      {currentStageIndex === 1 && (
        <div style={styles.allowContainer}>
          <motion.div
            style={styles.dimmedScreen}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 1 }}
          />
          <p style={styles.allowText}>Let it be. You don't have to change it yet.</p>
        </div>
      )}

      {currentStageIndex === 2 && showBody && (
        <div style={styles.bodyContainer}>
          <div style={styles.bodySilhouette}>
            {BODY_PARTS.map((part, index) => (
              <button
                key={part}
                style={{
                  ...styles.bodyPart,
                  ...(selectedBodyParts.includes(part) ? styles.bodyPartSelected : {}),
                  ...getBodyPartPosition(part),
                }}
                onClick={() => handleBodyPartClick(part)}
              >
                {part}
              </button>
            ))}
          </div>
        </div>
      )}

      {currentStageIndex === 3 && (
        <motion.div
          style={styles.nurtureContainer}
          animate={{
            background: 'radial-gradient(circle, rgba(255, 193, 7, 0.3), rgba(255, 193, 7, 0.1))',
          }}
        >
          <p style={styles.nurtureText}>Warm light moves toward you</p>
        </motion.div>
      )}
    </div>
  );
};

const getBodyPartPosition = (part: string): React.CSSProperties => {
  const positions: Record<string, React.CSSProperties> = {
    chest: { top: '40%', left: '50%', transform: 'translateX(-50%)' },
    throat: { top: '25%', left: '50%', transform: 'translateX(-50%)' },
    stomach: { top: '55%', left: '50%', transform: 'translateX(-50%)' },
    shoulders: { top: '30%', left: '50%', transform: 'translateX(-50%)', width: '60%' },
    head: { top: '10%', left: '50%', transform: 'translateX(-50%)' },
    hands: { top: '70%', left: '50%', transform: 'translateX(-50%)', width: '40%' },
  };
  return positions[part] || {};
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    padding: '0.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.75rem',
  },
  stageName: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    margin: 0,
    color: 'var(--text-primary, #1a1a1a)',
  },
  instruction: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary, #666)',
    margin: 0,
    textAlign: 'center' as const,
  },
  timer: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--primary, #2c5282)', // Use CSS variable that adapts to dark mode
    margin: 0,
  },
  bubblesContainer: {
    position: 'relative' as const,
    width: '100%',
    minHeight: '250px',
    maxHeight: '350px',
    flex: 1,
  },
  bubble: {
    position: 'absolute' as const,
    padding: '0.75rem 1.25rem',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: '2px solid var(--primary-color, #02295b)',
    borderRadius: '2rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  },
  bubbleSelected: {
    backgroundColor: 'var(--primary-light, #f0f4f8)',
    borderColor: 'var(--primary-color, #02295b)',
  },
  allowContainer: {
    width: '100%',
    minHeight: '200px',
    maxHeight: '300px',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  dimmedScreen: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  allowText: {
    position: 'relative' as const,
    zIndex: 10,
    fontSize: '1.25rem',
    color: 'white',
    textAlign: 'center' as const,
    fontWeight: '500',
  },
  bodyContainer: {
    width: '100%',
    minHeight: '250px',
    maxHeight: '350px',
    position: 'relative' as const,
    flex: 1,
  },
  bodySilhouette: {
    width: '200px',
    height: '400px',
    margin: '0 auto',
    position: 'relative' as const,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '100px',
  },
  bodyPart: {
    position: 'absolute' as const,
    padding: '0.5rem 1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: '2px solid var(--primary-color, #02295b)',
    borderRadius: '1rem',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  bodyPartSelected: {
    backgroundColor: 'var(--primary-light, #f0f4f8)',
  },
  nurtureContainer: {
    width: '100%',
    minHeight: '200px',
    maxHeight: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '1rem',
    flex: 1,
  },
  nurtureText: {
    fontSize: '1.25rem',
    color: 'var(--text-primary, #1a1a1a)',
    fontWeight: '500',
  },
};

export default RAINMethodTechnique;
