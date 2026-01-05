import React from 'react';

export type StatusType = 'not-done' | 'processing' | 'complete';

interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  const statusConfig = {
    'not-done': {
      dot: 'bg-red-500',
      pulse: false,
      ariaLabel: 'Not processed',
    },
    'processing': {
      dot: 'bg-yellow-500',
      pulse: true,
      ariaLabel: 'Processing',
    },
    'complete': {
      dot: 'bg-green-500',
      pulse: false,
      ariaLabel: 'Complete',
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div
        className={`
          ${sizeClasses[size]} 
          ${config.dot} 
          rounded-full 
          ${config.pulse ? 'animate-pulse' : ''}
        `}
        role="status"
        aria-label={config.ariaLabel}
        title={config.ariaLabel}
      />
      {label && (
        <span className="text-xs text-text-secondary dark:text-white/60">
          {label}
        </span>
      )}
    </div>
  );
};

export default StatusIndicator;

