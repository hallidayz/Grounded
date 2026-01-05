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
}) => {
  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-border-soft dark:border-dark-border p-4 shadow-sm">
      <button
        onClick={onSelectEmotion}
        className="w-full py-3 text-base font-semibold bg-gradient-to-br from-brand to-brand-light text-white rounded-xl hover:opacity-90 transition"
      >
        {lastEncouragedState ? 'Change how you feel' : 'How are you feeling today?'}
      </button>

      {encouragementText && (
        <p className="mt-3 text-text-secondary dark:text-white/70 text-sm italic">
          “{encouragementText}”
        </p>
      )}
    </div>
  );
};

export default EncourageSection;