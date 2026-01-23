import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const STAGES = [
  { name: 'Recognize', duration: 60, instruction: 'Tap bubbles for feelings you notice' },
  { name: 'Allow', duration: 60, instruction: 'Let it be. You don\'t have to change it yet.' },
  { name: 'Investigate', duration: 120, instruction: 'Tap where you feel the sensation in your body' },
  { name: 'Nurture', duration: 60, instruction: 'The bubbles transform into warm light' },
];

const FEELING_BUBBLES = ['Fear', 'Heavy', 'Tight', 'Angry', 'Sad', 'Anxious', 'Overwhelmed'];
const BODY_PARTS = ['chest', 'throat', 'stomach', 'shoulders', 'head', 'hands'];

const RAINMethodTechnique: React.FC = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(STAGES[0].duration);
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);
  const [bubbles, setBubbles] = useState<Array<{ id: string; label: string; x: number; y: number }>>([]);
  const [showBody, setShowBody] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (currentStage < STAGES.length - 1) {
            const nextStage = currentStage + 1;
            setCurrentStage(nextStage);
            if (nextStage === 2) {
              setShowBody(true);
            }
            if (nextStage === 3) {
              setShowBody(false);
            }
            return STAGES[nextStage].duration;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Create floating bubbles
    if (currentStage === 0) {
      const createBubble = () => {
        const id = `bubble-${Date.now()}-${Math.random()}`;
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

      return () => {
        clearInterval(timer);
        clearInterval(bubbleInterval);
      };
    }

    return () => clearInterval(timer);
  }, [currentStage]);

  const handleBubbleClick = (label: string) => {
    if (currentStage === 0 && !selectedFeelings.includes(label)) {
      setSelectedFeelings((prev) => [...prev, label]);
    }
  };

  const handleBodyPartClick = (part: string) => {
    if (currentStage === 2 && !selectedBodyParts.includes(part)) {
      setSelectedBodyParts((prev) => [...prev, part]);
    }
  };

  const stage = STAGES[currentStage];

  return (
    <div style={styles.container}>
      <h3 style={styles.stageName}>{stage.name}</h3>
      <p style={styles.instruction}>{stage.instruction}</p>
      <p style={styles.timer}>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</p>

      {currentStage === 0 && (
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

      {currentStage === 1 && (
        <div style={styles.allowContainer}>
          <motion.div
            style={styles.dimmedScreen}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 1 }}
          />
          <p style={styles.allowText}>Let it be. You don't have to change it yet.</p>
        </div>
      )}

      {currentStage === 2 && showBody && (
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

      {currentStage === 3 && (
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
  bubblesContainer: {
    position: 'relative' as const,
    width: '100%',
    height: '300px',
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
    height: '300px',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    height: '400px',
    position: 'relative' as const,
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
    height: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '1rem',
  },
  nurtureText: {
    fontSize: '1.25rem',
    color: 'var(--text-primary, #1a1a1a)',
    fontWeight: '500',
  },
};

export default RAINMethodTechnique;
