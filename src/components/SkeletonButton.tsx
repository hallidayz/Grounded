import React from 'react';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonButtonProps {
  width?: string;
  height?: string;
  variant?: 'primary' | 'secondary' | 'accent';
}

const SkeletonButton: React.FC<SkeletonButtonProps> = ({ 
  width = '120px',
  height = '2.5rem',
  variant = 'primary'
}) => {
  const bgColor = variant === 'primary' 
    ? 'bg-navy-primary/20 dark:bg-navy-primary/20'
    : variant === 'accent'
    ? 'bg-yellow-warm/20 dark:bg-yellow-warm/20'
    : 'bg-bg-tertiary dark:bg-dark-bg-tertiary';

  return (
    <div
      className={`animate-pulse ${bgColor} rounded-lg sm:rounded-xl ${height.includes('rem') ? '' : 'h-10'}`}
      style={{ width, height: height.includes('rem') ? undefined : height }}
    />
  );
};

export default SkeletonButton;

