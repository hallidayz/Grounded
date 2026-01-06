import React from 'react';

interface LoadingScreenProps {
  message?: string;
  progress?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...',
  progress 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 font-sans">
      <div className="text-center">
        <img 
          src="/ac-minds-logo.png" 
          alt="AC MINDS" 
          className="w-20 h-20 mx-auto mb-6 object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">
          {message}
        </h2>
        {progress !== undefined && (
          <div className="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto overflow-hidden">
            <div 
              className="h-full bg-brand transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
        {progress === undefined && (
          <div className="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-brand animate-pulse" style={{ width: '30%' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;

