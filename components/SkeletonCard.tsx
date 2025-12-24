import React from 'react';
import SkeletonLoader from './SkeletonLoader';

interface SkeletonCardProps {
  lines?: number;
  showHeader?: boolean;
  showFooter?: boolean;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  lines = 3, 
  showHeader = true,
  showFooter = false 
}) => {
  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-xl sm:rounded-2xl border border-border-soft dark:border-dark-border shadow-sm p-4 sm:p-5 space-y-3">
      {showHeader && (
        <div className="space-y-2">
          <SkeletonLoader width="60%" height="1.25rem" />
          <SkeletonLoader width="40%" height="0.875rem" />
        </div>
      )}
      
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <SkeletonLoader 
            key={index} 
            width={index === lines - 1 ? '80%' : '100%'} 
            height="0.875rem" 
          />
        ))}
      </div>
      
      {showFooter && (
        <div className="pt-2">
          <SkeletonLoader width="30%" height="0.75rem" />
        </div>
      )}
    </div>
  );
};

export default SkeletonCard;

