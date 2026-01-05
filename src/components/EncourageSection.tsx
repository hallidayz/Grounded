import React from 'react';
import { LCSWConfig, ValueItem } from '../types';

interface EncourageSectionProps {
  encouragementText: string | null;
  encouragementLoading: boolean;
  lastEncouragedState: string | null;
  lcswConfig?: LCSWConfig;
  values: ValueItem[];
  lowStateCount: number;
  onSelectEmotion: () => void;
  onActionClick: (action: 'reflection' | 'values' | 'resources') => void;
  onResetEncouragement: () => void;
  onOpenFirstValue: () => void;
  selectedFeeling: string | null;
}

const EncourageSection: React.FC<EncourageSectionProps> = ({
  encouragementText,
  encouragementLoading,
  lastEncouragedState,
  onSelectEmotion,
  onActionClick,
  onResetEncouragement,
  onOpenFirstValue,
}) => {
  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-border-soft dark:border-dark-border p-4 shadow-sm">
      {encouragementText && (
        <p className="text-text-secondary dark:text-white/70 text-sm italic mb-3">
          "{encouragementText}"
        </p>
      )}
      
      {encouragementLoading && (
        <p className="text-text-secondary dark:text-white/70 text-sm italic">
          Generating encouragement...
        </p>
      )}

      {!encouragementText && !encouragementLoading && (
        <p className="text-text-secondary dark:text-white/70 text-sm">
          Select an emotion above to get personalized encouragement.
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onActionClick('values')}
          className="flex-1 py-2 text-sm font-medium bg-gray-100 dark:bg-dark-bg-primary text-text-primary dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-dark-bg-secondary transition"
        >
          View Values
        </button>
        {onOpenFirstValue && (
          <button
            onClick={onOpenFirstValue}
            className="flex-1 py-2 text-sm font-medium bg-brand text-white rounded-lg hover:opacity-90 transition"
          >
            Check In
          </button>
        )}
      </div>

      {lastEncouragedState && (
        <button
          onClick={onResetEncouragement}
          className="mt-2 w-full py-2 text-xs text-text-secondary dark:text-white/70 hover:text-text-primary dark:hover:text-white transition"
        >
          Reset
        </button>
      )}
    </div>
  );
};

export default EncourageSection;