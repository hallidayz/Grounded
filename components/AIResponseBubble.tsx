import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AIResponseBubbleProps {
  message: string;
  emotion?: string;
  onActionClick?: (action: 'reflection' | 'values' | 'resources') => void;
}

const AIResponseBubble: React.FC<AIResponseBubbleProps> = ({ message, emotion, onActionClick }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade-in animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-navy-light/10 dark:bg-dark-bg-secondary rounded-3xl p-6 space-y-4"
    >
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-navy-primary dark:bg-yellow-warm rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white dark:text-navy-dark text-sm">💙</span>
        </div>
        <span className="text-sm font-semibold text-navy-primary dark:text-yellow-warm">
          AI Reflection
        </span>
      </div>
      
      <p className="text-text-primary dark:text-white leading-relaxed">
        {message}
      </p>

      {onActionClick && (
        <div className="space-y-2 pt-2">
          <p className="text-sm text-text-secondary dark:text-white/70">
            Would you like to:
          </p>
          <div className="space-y-2">
            <button
              onClick={() => onActionClick('reflection')}
              className="w-full bg-white dark:bg-dark-bg-tertiary text-text-primary dark:text-white rounded-xl p-4 text-left font-medium shadow-sm hover:shadow-md transition-all active:scale-98"
            >
              📝 Write a reflection
            </button>
            <button
              onClick={() => onActionClick('values')}
              className="w-full bg-white dark:bg-dark-bg-tertiary text-text-primary dark:text-white rounded-xl p-4 text-left font-medium shadow-sm hover:shadow-md transition-all active:scale-98"
            >
              🎯 See your values
            </button>
            <button
              onClick={() => onActionClick('resources')}
              className="w-full bg-white dark:bg-dark-bg-tertiary text-text-primary dark:text-white rounded-xl p-4 text-left font-medium shadow-sm hover:shadow-md transition-all active:scale-98"
            >
              📞 View resources
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AIResponseBubble;

