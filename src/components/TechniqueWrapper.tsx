import React, { useState, useEffect, useRef } from 'react';
import {
  logTechniqueStart,
  logTechniqueComplete,
  logTechniqueRepeat,
  logTechniqueDone,
} from '../services/energyTrackingService';

interface TechniqueWrapperProps {
  children: React.ReactNode;
  onComplete: () => void;
  onRepeat?: () => void;
  duration?: number; // in seconds
  techniqueId: string;
  techniqueName: string;
  energyLevel: 'low' | 'medium' | 'high';
  bestFor?: string;
  description?: string;
}

const TechniqueWrapper: React.FC<TechniqueWrapperProps> = ({
  children,
  onComplete,
  onRepeat,
  duration,
  techniqueId,
  techniqueName,
  energyLevel,
  bestFor,
  description,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const repeatCountRef = useRef(0);
  const sessionStartTimeRef = useRef<number | null>(null);

  const handleStart = () => {
    setIsRunning(true);
    setIsCompleted(false);
    startTimeRef.current = Date.now();
    if (!sessionStartTimeRef.current) {
      sessionStartTimeRef.current = Date.now();
    }
    // Log technique start
    logTechniqueStart(energyLevel, techniqueId, techniqueName).catch(console.error);
  };

  const handleComplete = () => {
    setIsRunning(false);
    setIsCompleted(true);
    // Log technique completion
    if (startTimeRef.current) {
      const actualDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      logTechniqueComplete(energyLevel, techniqueId, techniqueName, actualDuration, 'completed').catch(console.error);
    }
  };

  const handleRepeat = () => {
    repeatCountRef.current += 1;
    setIsRunning(false);
    setIsCompleted(false);
    startTimeRef.current = null;
    // Log repeat action
    logTechniqueRepeat(energyLevel, techniqueId, techniqueName, repeatCountRef.current).catch(console.error);
    // Trigger restart by updating key
    setRestartKey((prev) => prev + 1);
    onRepeat?.();
  };

  const handleDone = () => {
    // Log done action
    const totalDuration = sessionStartTimeRef.current
      ? Math.floor((Date.now() - sessionStartTimeRef.current) / 1000)
      : 0;
    logTechniqueDone(energyLevel, techniqueId, techniqueName, totalDuration).catch(console.error);
    onComplete();
  };

  // Auto-start when component mounts if it's a timed technique
  useEffect(() => {
    if (duration && !isRunning && !isCompleted) {
      handleStart();
      const timer = setTimeout(() => {
        handleComplete();
      }, duration * 1000);
      return () => clearTimeout(timer);
    }
  }, [duration, isRunning, isCompleted, energyLevel, techniqueId, techniqueName, restartKey]);

  return (
    <div style={styles.container}>
      {(bestFor || description) && (
        <div style={styles.subtleNote}>
          {bestFor && (
            <p style={styles.bestForText}>{bestFor}</p>
          )}
          {description && (
            <p style={styles.descriptionText}>{description}</p>
          )}
        </div>
      )}
      <div style={styles.content} key={restartKey}>
        {children}
      </div>
      
      <div style={styles.actions}>
        <button
          style={styles.repeatButton}
          onClick={handleRepeat}
          disabled={!isCompleted && !isRunning}
        >
          Repeat
        </button>
        <button
          style={styles.doneButton}
          onClick={handleDone}
        >
          Done
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    height: 'calc(100svh - 180px)', // Account for header and footer
    maxHeight: 'calc(100svh - 180px)',
    overflow: 'hidden',
    boxSizing: 'border-box' as const,
  },
  subtleNote: {
    padding: '0.4rem 0.75rem',
    marginBottom: '0.5rem',
    textAlign: 'center' as const,
    maxWidth: '600px',
    margin: '0 auto 0.5rem auto',
    flexShrink: 0,
  },
  bestForText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary, #666)',
    fontStyle: 'italic',
    margin: '0 0 0.35rem 0',
    lineHeight: '1.5',
    opacity: 0.85,
    fontWeight: '400',
  },
  descriptionText: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary, #777)',
    margin: 0,
    lineHeight: '1.4',
    opacity: 0.75,
    fontStyle: 'normal',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '0.5rem',
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    WebkitOverflowScrolling: 'touch' as const,
    width: '100%',
    boxSizing: 'border-box' as const,
    minHeight: 0,
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    padding: '0.75rem',
    justifyContent: 'center',
    borderTop: '1px solid var(--border-color, #e0e0e0)',
    flexShrink: 0,
  },
  repeatButton: {
    padding: '0.75rem 1.5rem',
    border: '2px solid var(--border-color, #e0e0e0)',
    borderRadius: '0.5rem',
    backgroundColor: 'var(--bg-card, #ffffff)',
    color: 'var(--text-primary, #1a1a1a)',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  doneButton: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '0.5rem',
    backgroundColor: 'var(--primary-color, #02295b)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
};

export default TechniqueWrapper;
