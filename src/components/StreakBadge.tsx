import React from 'react';

interface StreakBadgeProps {
  streakDays: number;
}

const StreakBadge: React.FC<StreakBadgeProps> = ({ streakDays }) => {
  return (
    <div className="bg-gradient-to-r from-yellow-warm to-yellow-light dark:from-yellow-warm/80 dark:to-yellow-light/80 rounded-2xl p-4 flex items-center space-x-3 shadow-md">
      <div className="text-4xl">🔥</div>
      <div>
        <p className="text-2xl font-bold text-navy-dark dark:text-navy-dark">{streakDays}</p>
        <p className="text-sm text-navy-dark/70 dark:text-navy-dark/70">
          {streakDays === 1 ? 'day streak' : 'day streak'}
        </p>
      </div>
    </div>
  );
};

export default StreakBadge;

