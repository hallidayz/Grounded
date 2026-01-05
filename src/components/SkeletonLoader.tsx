import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  width?: string;
  height?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  className = '', 
  width = '100%', 
  height = '1rem' 
}) => {
  return (
    <div
      className={`animate-pulse bg-bg-tertiary dark:bg-dark-bg-tertiary rounded ${className}`}
      style={{ width, height }}
    />
  );
};

export default SkeletonLoader;

