/**
 * Tiny Steps Component
 *
 * Opt-in tiny next steps after completing a grounding exercise.
 * Non-pressuring, easy to dismiss.
 */

import React, { useState, useCallback } from 'react';
import { COPY } from '../utils/copyLibrary';

interface TinyStepsProps {
  onSelect?: (step: string) => void;
  onDismiss?: () => void;
  visible?: boolean;
}

const TinySteps: React.FC<TinyStepsProps> = ({
  onSelect,
  onDismiss,
  visible = true,
}) => {
  const [dismissed, setDismissed] = useState(false);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  const handleStepClick = useCallback((step: string) => {
    setSelectedStep(step);
    onSelect?.(step);
  }, [onSelect]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  if (!visible || dismissed) return null;

  return (
    <div className="mt-6 p-4 bg-bg-secondary dark:bg-dark-bg-primary rounded-xl border border-border-soft dark:border-dark-border">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-text-secondary dark:text-white/70">
          {COPY.tinySteps.prefix}
        </p>
        <button
          onClick={handleDismiss}
          className="text-xs text-text-tertiary dark:text-white/40 hover:text-text-primary dark:hover:text-white"
        >
          Skip
        </button>
      </div>

      <div className="space-y-2">
        {COPY.tinySteps.options.map((step, index) => (
          <button
            key={index}
            onClick={() => handleStepClick(step)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedStep === step
                ? 'bg-brand/20 text-brand dark:text-brand-light'
                : 'bg-bg-tertiary dark:bg-dark-bg-secondary hover:bg-brand/10 dark:hover:bg-brand/20 text-text-primary dark:text-white'
            }`}
          >
            {selectedStep === step ? '✓ ' : ''}{step}
          </button>
        ))}
      </div>

      {selectedStep && (
        <p className="mt-3 text-xs text-text-tertiary dark:text-white/50 text-center italic">
          No pressure. Just an option.
        </p>
      )}
    </div>
  );
};

export default TinySteps;
