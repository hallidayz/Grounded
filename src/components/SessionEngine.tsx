/**
 * SessionEngine Component
 * 
 * Unified session engine that manages phase transitions, countdowns, and completion
 * for all CBT/Mindfulness interventions. Provides session configuration to existing
 * technique components.
 */

import React, { useState, useEffect, useRef } from 'react';
import { MASTER_SESSIONS } from '../copy';
import type { SessionEngineProps, SessionState } from '../types/sessions';

// Import technique components
import GroundingFlashTechnique from './techniques/GroundingFlashTechnique';
import WeightDropTechnique from './techniques/WeightDropTechnique';
import SensorySnapTechnique from './techniques/SensorySnapTechnique';
import CompassionateTouchTechnique from './techniques/CompassionateTouchTechnique';
import ThoughtStreamTechnique from './techniques/ThoughtStreamTechnique';
import SelfCompassionBreakTechnique from './techniques/SelfCompassionBreakTechnique';
import RealityCheckTechnique from './techniques/RealityCheckTechnique';
import RAINMethodTechnique from './techniques/RAINMethodTechnique';
import SafeSpaceTechnique from './techniques/SafeSpaceTechnique';
import CompassionateLetterTechnique from './techniques/CompassionateLetterTechnique';

const SessionEngine: React.FC<SessionEngineProps> = ({ sessionKey, onComplete }) => {
  const config = MASTER_SESSIONS[sessionKey];
  
  if (!config) {
    console.error(`[SessionEngine] Session key "${sessionKey}" not found in MASTER_SESSIONS`);
    return <div>Session not found</div>;
  }

  const [sessionState, setSessionState] = useState<SessionState>({
    currentPhaseIndex: 0,
    timeLeftInPhase: config.phases[0].duration,
    isActive: true,
    startedAt: Date.now(),
  });

  const [userInput, setUserInput] = useState<string>('');
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Wake Lock API for 5-minute sessions
  useEffect(() => {
    if (config.category === '5min' && 'wakeLock' in navigator) {
      (navigator as any).wakeLock?.request('screen').then((wakeLock: WakeLockSentinel) => {
        wakeLockRef.current = wakeLock;
      }).catch((err: Error) => {
        console.warn('[SessionEngine] Wake Lock not supported:', err);
      });
    }

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(console.error);
      }
    };
  }, [config.category]);

  // Main timer logic
  useEffect(() => {
    if (!sessionState.isActive || sessionState.timeLeftInPhase <= 0) {
      return;
    }

    timerRef.current = setInterval(() => {
      setSessionState((prev) => {
        const newTime = prev.timeLeftInPhase - 1;
        
        if (newTime <= 0) {
          // Phase complete - move to next phase or complete session
          if (prev.currentPhaseIndex < config.phases.length - 1) {
            // Haptic feedback on phase transition
            if (navigator.vibrate) {
              navigator.vibrate(50);
            }
            
            const nextIndex = prev.currentPhaseIndex + 1;
            return {
              ...prev,
              currentPhaseIndex: nextIndex,
              timeLeftInPhase: config.phases[nextIndex].duration,
            };
          } else {
            // Session complete
            if (navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
            }
            
            // Release wake lock
            if (wakeLockRef.current) {
              wakeLockRef.current.release().catch(console.error);
            }
            
            // Call completion callback
            setTimeout(() => {
              onComplete();
            }, 500);
            
            return {
              ...prev,
              isActive: false,
              timeLeftInPhase: 0,
            };
          }
        }
        
        return {
          ...prev,
          timeLeftInPhase: newTime,
        };
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionState.isActive, sessionState.timeLeftInPhase, sessionState.currentPhaseIndex, config, sessionKey, onComplete]);

  const currentPhase = config.phases[sessionState.currentPhaseIndex] || config.phases[0];

  // Safety check - ensure currentPhase exists
  if (!currentPhase) {
    console.error(`[SessionEngine] No phase found at index ${sessionState.currentPhaseIndex} for session ${sessionKey}`);
    return <div>Error: Session phase not found</div>;
  }

  // Render technique component based on session type and key
  const renderTechniqueComponent = () => {
    const techniqueProps = {
      currentPhase,
      countdown: sessionState.timeLeftInPhase,
      phaseIndex: sessionState.currentPhaseIndex,
      sessionConfig: config,
    };

    // Map session keys to technique components
    switch (sessionKey) {
      case '10s-reset':
      case 'grounding-flash':
        return <GroundingFlashTechnique {...techniqueProps} />;
      case '10s-anchor':
      case 'weight-drop':
        return <WeightDropTechnique {...techniqueProps} />;
      case '10s-snap':
      case 'sensory-snap':
        return <SensorySnapTechnique {...techniqueProps} />;
      case '10s-compassion':
      case 'compassionate-touch':
        return <CompassionateTouchTechnique {...techniqueProps} />;
      case '2min-grounding':
        // Use sensory technique for 5-4-3-2-1
        return <SensorySnapTechnique {...techniqueProps} />;
      case '2min-compassion':
      case 'self-compassion-break':
        return <SelfCompassionBreakTechnique {...techniqueProps} />;
      case '2min-reality':
      case 'reality-check':
        return <RealityCheckTechnique {...techniqueProps} />;
      case 'thought-stream':
        return <ThoughtStreamTechnique {...techniqueProps} />;
      case '5min-rain':
      case 'rain-method':
        return <RAINMethodTechnique {...techniqueProps} />;
      case '5min-safe-space':
      case 'safe-space':
        return <SafeSpaceTechnique {...techniqueProps} />;
      case '5min-letter':
      case 'compassionate-letter':
        return <CompassionateLetterTechnique {...techniqueProps} />;
      default:
        return (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Technique component not found for: {sessionKey}</p>
          </div>
        );
    }
  };

  return (
    <div className="app-stage" style={{ width: '100%', minHeight: '100svh' }}>
      {/* Aria-live region for screen readers */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}
      >
        {currentPhase.label}: {sessionState.timeLeftInPhase} seconds remaining. {currentPhase.prompt}
      </div>

      {/* Render the appropriate technique component */}
      {renderTechniqueComponent()}
    </div>
  );
};

export default SessionEngine;
