import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const COLORS = ['#FFEB3B', '#00BCD4', '#FF5722', '#9C27B0', '#4CAF50'];
const COLOR_NAMES = ['lemon yellow', 'turquoise', 'orange-red', 'purple', 'green'];

const SensorySnapTechnique: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0]);
  const [colorName, setColorName] = useState<string>(COLOR_NAMES[0]);
  const [countdown, setCountdown] = useState(10);
  const [hasFlashed, setHasFlashed] = useState(false);

  useEffect(() => {
    // Flash the color immediately
    setHasFlashed(true);
    
    // Countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Randomly select a color on mount
    const randomIndex = Math.floor(Math.random() * COLORS.length);
    setSelectedColor(COLORS[randomIndex]);
    setColorName(COLOR_NAMES[randomIndex]);
  }, []);

  return (
    <motion.div
      style={{
        ...styles.container,
        backgroundColor: hasFlashed ? selectedColor : 'transparent',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: hasFlashed ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <div style={styles.content}>
        <h3 style={styles.prompt}>
          Find one thing in your room that is this exact color: <strong>{colorName}</strong>
        </h3>
        <div style={styles.countdownContainer}>
          <span style={styles.countdown}>{countdown}</span>
        </div>
        <p style={styles.message}>Found it? Focus on the color. You are here now.</p>
      </div>
    </motion.div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    textAlign: 'center' as const,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '2rem',
    borderRadius: '1rem',
    maxWidth: '400px',
  },
  prompt: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'var(--text-primary, #1a1a1a)',
    marginBottom: '2rem',
  },
  countdownContainer: {
    marginBottom: '1.5rem',
  },
  countdown: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: 'var(--primary-color, #02295b)',
  },
  message: {
    fontSize: '1rem',
    color: 'var(--text-secondary, #666)',
    fontStyle: 'italic',
  },
};

export default SensorySnapTechnique;
