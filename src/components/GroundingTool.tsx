/**
 * 60-Second Grounding Tool
 * 
 * Hardcoded 5-4-3-2-1 sensory grounding exercise.
 * Works 100% offline - no AI dependency.
 * 
 * Screens:
 * 1. Instruction (5 seconds)
 * 2. Sight (15 seconds) - Find 3 things of a color
 * 3. Touch (15 seconds) - Physical grounding
 * 4. Sound & Breath (15 seconds) - Animated breathing
 * 5. Landing (10 seconds) - Completion with next steps
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GroundingToolProps {
  onComplete?: (action: 'coach' | 'better' | 'more-help') => void;
  onClose?: () => void;
}

type Screen = 'instruction' | 'sight' | 'touch' | 'breath' | 'landing';

const COLORS = ['blue', 'green', 'red', 'yellow', 'purple', 'orange', 'brown', 'black', 'white'];

const GroundingTool: React.FC<GroundingToolProps> = ({ onComplete, onClose }) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('instruction');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [breathPhase, setBreathPhase] = useState<'in' | 'hold' | 'out' | 'pause'>('in');
  const [breathCount, setBreathCount] = useState(0);
  const [touchProgress, setTouchProgress] = useState(0);
  const breathIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Select random color on mount
  useEffect(() => {
    setSelectedColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
  }, []);

  // Screen progression timers
  useEffect(() => {
    let timer: NodeJS.Timeout;

    switch (currentScreen) {
      case 'instruction':
        timer = setTimeout(() => setCurrentScreen('sight'), 5000);
        break;
      case 'sight':
        timer = setTimeout(() => setCurrentScreen('touch'), 15000);
        break;
      case 'touch':
        timer = setTimeout(() => {
          setCurrentScreen('breath');
          startBreathing();
        }, 15000);
        break;
      case 'breath':
        timer = setTimeout(() => {
          stopBreathing();
          setCurrentScreen('landing');
        }, 15000);
        break;
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentScreen]);

  // Breathing animation
  const startBreathing = () => {
    let phase: 'in' | 'hold' | 'out' | 'pause' = 'in';
    let count = 0;

    breathIntervalRef.current = setInterval(() => {
      if (phase === 'in') {
        phase = 'hold';
        setTimeout(() => {
          phase = 'out';
          setBreathPhase('out');
        }, 2000);
      } else if (phase === 'out') {
        phase = 'pause';
        setBreathPhase('pause');
        count++;
        setBreathCount(count);
        setTimeout(() => {
          phase = 'in';
          setBreathPhase('in');
        }, 2000);
      } else {
        setBreathPhase(phase);
      }
    }, 4000);
  };

  const stopBreathing = () => {
    if (breathIntervalRef.current) {
      clearInterval(breathIntervalRef.current);
      breathIntervalRef.current = null;
    }
  };

  // Touch progress animation
  useEffect(() => {
    if (currentScreen === 'touch') {
      touchIntervalRef.current = setInterval(() => {
        setTouchProgress((prev) => Math.min(prev + 1, 100));
      }, 150); // 15 seconds total

      return () => {
        if (touchIntervalRef.current) {
          clearInterval(touchIntervalRef.current);
        }
      };
    } else {
      setTouchProgress(0);
    }
  }, [currentScreen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBreathing();
      if (touchIntervalRef.current) {
        clearInterval(touchIntervalRef.current);
      }
    };
  }, []);

  const handleAction = (action: 'coach' | 'better' | 'more-help') => {
    onComplete?.(action);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-sage-green via-navy-dark to-sage-green flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* Instruction Screen */}
          {currentScreen === 'instruction' && (
            <motion.div
              key="instruction"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-dark-bg-primary rounded-3xl p-8 text-center shadow-2xl"
            >
              <div className="text-6xl mb-4">🧘</div>
              <h2 className="text-2xl font-black text-text-primary dark:text-white mb-4">
                Just breathe.
              </h2>
              <p className="text-base text-text-secondary dark:text-white/70 leading-relaxed">
                We're going to find your center. Follow the prompts—no typing needed.
              </p>
              <div className="mt-6 flex justify-center">
                <div className="w-16 h-16 border-4 border-navy-primary dark:border-yellow-warm border-t-transparent rounded-full animate-spin"></div>
              </div>
            </motion.div>
          )}

          {/* Sight Screen */}
          {currentScreen === 'sight' && (
            <motion.div
              key="sight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-dark-bg-primary rounded-3xl p-8 text-center shadow-2xl"
            >
              <div className="text-6xl mb-4">👀</div>
              <h2 className="text-2xl font-black text-text-primary dark:text-white mb-4">
                Find 3 things
              </h2>
              <p className="text-lg text-text-secondary dark:text-white/70 mb-6">
                Look around the room. Find <span className="font-bold text-navy-primary dark:text-yellow-warm capitalize">{selectedColor}</span> things.
              </p>
              <button
                onClick={() => setCurrentScreen('touch')}
                className="w-full py-4 bg-navy-primary dark:bg-yellow-warm text-white dark:text-navy-dark font-bold text-lg rounded-xl shadow-lg hover:opacity-90 transition-opacity"
              >
                Found Them
              </button>
            </motion.div>
          )}

          {/* Touch Screen */}
          {currentScreen === 'touch' && (
            <motion.div
              key="touch"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-dark-bg-primary rounded-3xl p-8 text-center shadow-2xl"
            >
              <div className="text-6xl mb-4">✋</div>
              <h2 className="text-2xl font-black text-text-primary dark:text-white mb-4">
                Feel your body
              </h2>
              <p className="text-base text-text-secondary dark:text-white/70 mb-6 leading-relaxed">
                Press your feet firmly into the floor. Feel the texture of your chair or your clothes. Notice the weight of your body.
              </p>
              <div className="w-full bg-bg-secondary dark:bg-dark-bg-secondary rounded-full h-3 mb-4">
                <motion.div
                  className="bg-navy-primary dark:bg-yellow-warm h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${touchProgress}%` }}
                  transition={{ duration: 0.15 }}
                />
              </div>
              <p className="text-sm text-text-tertiary dark:text-white/50">
                Focus on the sensations...
              </p>
            </motion.div>
          )}

          {/* Breath Screen */}
          {currentScreen === 'breath' && (
            <motion.div
              key="breath"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-dark-bg-primary rounded-3xl p-8 text-center shadow-2xl"
            >
              <div className="text-6xl mb-4">🦉</div>
              <h2 className="text-2xl font-black text-text-primary dark:text-white mb-4">
                Breathe with me
              </h2>
              <p className="text-base text-text-secondary dark:text-white/70 mb-6">
                Listen for the furthest sound you can hear. Now, breathe with the owl.
              </p>
              
              {/* Animated Owl Breathing */}
              <div className="flex flex-col items-center mb-6">
                <motion.div
                  className="relative"
                  animate={{
                    scale: breathPhase === 'in' ? 1.2 : breathPhase === 'out' ? 0.9 : 1,
                  }}
                  transition={{
                    duration: 4,
                    ease: 'easeInOut',
                  }}
                >
                  {/* Simple owl representation - can be replaced with actual image */}
                  <div className="w-32 h-32 bg-navy-primary dark:bg-yellow-warm rounded-full flex items-center justify-center relative">
                    <div className="absolute top-4 left-6 w-6 h-6 bg-white rounded-full"></div>
                    <div className="absolute top-4 right-6 w-6 h-6 bg-white rounded-full"></div>
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-white rounded-full"></div>
                    {/* Shield with counter */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-20 bg-white dark:bg-dark-bg-secondary border-2 border-navy-primary dark:border-yellow-warm rounded-lg flex items-center justify-center">
                      <span className="text-2xl font-bold text-navy-primary dark:text-yellow-warm">
                        {breathCount}
                      </span>
                    </div>
                  </div>
                </motion.div>
                <p className="text-lg font-bold text-navy-primary dark:text-yellow-warm mt-4">
                  {breathPhase === 'in' && 'Breathe In...'}
                  {breathPhase === 'hold' && 'Hold...'}
                  {breathPhase === 'out' && 'Breathe Out...'}
                  {breathPhase === 'pause' && 'Pause...'}
                </p>
              </div>
            </motion.div>
          )}

          {/* Landing Screen */}
          {currentScreen === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-dark-bg-primary rounded-3xl p-8 text-center shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="text-6xl mb-4"
              >
                ✓
              </motion.div>
              <h2 className="text-3xl font-black text-text-primary dark:text-white mb-2">
                You're back.
              </h2>
              <p className="text-base text-text-secondary dark:text-white/70 mb-6 leading-relaxed">
                You just gave your nervous system a moment to catch up. The air is a little clearer now. Take one more breath—there is no rush.
              </p>

              <div className="space-y-3 mt-8">
                <button
                  onClick={() => handleAction('coach')}
                  className="w-full py-4 bg-navy-primary dark:bg-yellow-warm text-white dark:text-navy-dark font-bold text-lg rounded-xl shadow-lg hover:opacity-90 transition-opacity"
                >
                  I'm ready to process
                </button>
                <button
                  onClick={() => handleAction('better')}
                  className="w-full py-4 bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary dark:text-white font-bold text-lg rounded-xl shadow-lg hover:opacity-90 transition-opacity"
                >
                  I just need a moment of peace
                </button>
                <button
                  onClick={() => handleAction('more-help')}
                  className="w-full py-4 bg-red-600 text-white font-bold text-lg rounded-xl shadow-lg hover:opacity-90 transition-opacity"
                >
                  I need more help
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GroundingTool;
