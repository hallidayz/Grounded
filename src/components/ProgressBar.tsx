import React from 'react';

export type ProgressStatus = 'loading' | 'success' | 'error' | 'idle';

export interface ProgressBarProps {
  progress: number; // 0-100
  status?: ProgressStatus;
  label?: string;
  showPercentage?: boolean;
  className?: string;
  height?: 'sm' | 'md' | 'lg';
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  status = 'loading',
  label,
  showPercentage = true,
  className = '',
  height = 'md',
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-500 dark:bg-green-400';
      case 'error':
        return 'bg-red-500 dark:bg-red-400';
      case 'loading':
        return 'bg-navy-primary dark:bg-navy-primary';
      default:
        return 'bg-gray-400 dark:bg-gray-500';
    }
  };

  const getStatusBg = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'loading':
        return 'bg-bg-secondary dark:bg-dark-bg-secondary';
      default:
        return 'bg-bg-secondary dark:bg-dark-bg-secondary';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'loading':
        return (
          <svg className="w-5 h-5 text-navy-primary dark:text-navy-primary animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-xs font-semibold text-text-primary dark:text-white">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className={`text-xs font-bold ${
              status === 'success' ? 'text-green-600 dark:text-green-400' :
              status === 'error' ? 'text-red-600 dark:text-red-400' :
              'text-text-primary dark:text-white'
            }`}>
              {status === 'success' ? 'Complete' : status === 'error' ? 'Failed' : `${Math.round(clampedProgress)}%`}
            </span>
          )}
        </div>
      )}
      
      <div className={`relative w-full ${heightClasses[height]} ${getStatusBg()} rounded-full overflow-hidden`}>
        <div
          className={`absolute top-0 left-0 ${heightClasses[height]} ${getStatusColor()} rounded-full transition-all duration-300 ease-out ${
            status === 'loading' ? 'animate-pulse' : ''
          }`}
          style={{ width: `${clampedProgress}%` }}
        />
        
        {/* Shimmer effect for loading */}
        {status === 'loading' && clampedProgress > 0 && clampedProgress < 100 && (
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-full">
            <div className="h-full w-1/3 bg-white/30 dark:bg-white/20 animate-shimmer" />
          </div>
        )}
      </div>
      
      {/* Status icon */}
      {status !== 'idle' && (
        <div className="flex items-center justify-center mt-2">
          {getStatusIcon()}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;

