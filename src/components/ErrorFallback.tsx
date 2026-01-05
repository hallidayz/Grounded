import React from 'react';
import { ErrorInfo } from 'react';

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, errorInfo, onReset }) => {
  return (
    <div className="min-h-screen bg-bg-primary dark:bg-dark-bg-primary flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl sm:rounded-3xl border border-border-soft dark:border-dark-border shadow-2xl p-6 sm:p-8 max-w-2xl w-full">
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl sm:text-4xl">⚠️</span>
          </div>
          
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-text-primary dark:text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-text-secondary dark:text-text-secondary text-sm sm:text-base">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>
          </div>

          {error && (
            <div className="bg-bg-secondary dark:bg-dark-bg-primary rounded-xl p-4 text-left">
              <p className="text-xs font-black text-text-primary/60 dark:text-white/60 uppercase tracking-widest mb-2">
                Error Details
              </p>
              <p className="text-xs sm:text-sm text-text-primary dark:text-white font-mono break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={onReset}
              className="px-6 py-3 sm:py-4 bg-navy-primary dark:bg-navy-primary text-white dark:text-white rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-sm sm:text-base hover:opacity-90 active:scale-[0.98] transition-all shadow-lg"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 sm:py-4 bg-bg-primary dark:bg-dark-bg-primary/50 text-text-primary dark:text-white rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-sm sm:text-base hover:opacity-80 transition-all border border-border-soft dark:border-dark-border/30"
            >
              Reload Page
            </button>
          </div>

          <p className="text-xs text-text-tertiary dark:text-text-tertiary">
            If this problem persists, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;

