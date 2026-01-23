import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { TechniqueComponentProps } from '../../types/sessions';

// ADA-compliant: Softer, less aggressive colors with good contrast
const COLORS = [
  { hex: '#E8F5E9', name: 'soft green' },
  { hex: '#E3F2FD', name: 'soft blue' },
  { hex: '#FFF3E0', name: 'soft peach' },
  { hex: '#F3E5F5', name: 'soft lavender' },
  { hex: '#E0F2F1', name: 'soft teal' },
];

const SensorySnapTechnique: React.FC<TechniqueComponentProps> = ({
  currentPhase,
  countdown,
  phaseIndex,
  sessionConfig,
  bestFor,
}) => {
  // Support both SessionEngine (with props) and standalone usage (without props)
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isVisible, setIsVisible] = useState(false);
  const [localCountdown, setLocalCountdown] = useState(10);

  const displayCountdown = countdown !== undefined ? countdown : localCountdown;

  useEffect(() => {
    // Gentle fade-in instead of flash
    setIsVisible(true);
    
    // Randomly select a color on mount
    const randomIndex = Math.floor(Math.random() * COLORS.length);
    setSelectedColor(COLORS[randomIndex]);
  }, []);

  // Standalone mode: manage own timer
  useEffect(() => {
    if (countdown === undefined) {
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
  }, [countdown]);

  return (
    <motion.div
      style={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 1, ease: 'easeIn' }}
    >
      <div style={styles.iconContainer}>
        <span style={styles.icon}>👌</span>
      </div>
      <div style={{
        ...styles.colorDisplay,
        backgroundColor: selectedColor.hex,
      }}>
        <div style={styles.colorCircle} />
      </div>
      
      <div style={styles.content}>
        <h3 style={styles.prompt}>
          Find one thing in your room that is <strong style={styles.colorName}>{selectedColor.name}</strong>
        </h3>
        <div style={styles.countdownContainer}>
          <span style={styles.countdown}>{displayCountdown}</span>
        </div>
        <p style={styles.message}>Found it? Focus on the color. You are here now.</p>
        {bestFor && (
          <p style={styles.bestFor}>Best for: {bestFor}</p>
        )}
      </div>
    </motion.div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    minHeight: '300px',
    maxHeight: 'calc(100svh - 200px)', // Fit between header and footer
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '1rem',
    overflowY: 'auto' as const,
  },
  colorDisplay: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '2rem',
    border: '3px solid rgba(255, 255, 255, 0.8)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  colorCircle: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    textAlign: 'center' as const,
    width: '100%',
  },
  prompt: {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: 'var(--text-primary, #1a1a1a)',
    marginBottom: '1.5rem',
    lineHeight: '1.5',
  },
  colorName: {
    color: 'var(--primary-color, #02295b)',
    fontWeight: '600',
  },
  countdownContainer: {
    marginBottom: '1.5rem',
  },
  countdown: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: 'var(--primary, #2c5282)', // Use CSS variable that adapts to dark mode
  },
  message: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary, #666)',
    fontStyle: 'italic',
    lineHeight: '1.5',
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

export default SensorySnapTechnique;
