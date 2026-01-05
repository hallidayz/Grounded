import React from 'react';
import ThemeToggle from '../ThemeToggle';

interface AppHeaderProps {
  authState: 'checking' | 'login' | 'terms' | 'app';
  showNav: boolean;
  view: 'onboarding' | 'home' | 'report' | 'values' | 'vault' | 'goals' | 'settings';
  aiStatusText?: string;
  onViewChange: (view: 'onboarding' | 'home' | 'report' | 'values' | 'vault' | 'goals' | 'settings') => void;
  onOpenLCSWConfig: () => void;
  onOpenHelp: () => void;
  onLogout: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  authState,
  showNav,
  view,
  aiStatusText,
  onViewChange,
  onOpenLCSWConfig,
  onOpenHelp,
  onLogout,
}) => {
  return (
    <header className="bg-white dark:bg-dark-bg-primary border-b border-border-soft dark:border-dark-border sticky top-0 z-40 shadow-sm dark:shadow-lg">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img 
            src="/ac-minds-logo.png" 
            alt="AC MINDS" 
            className="w-7 h-7 object-contain"
          />
          <span className="font-bold text-base sm:text-lg tracking-tight text-text-primary dark:text-white hidden sm:inline">Grounded</span>
          {/* AI Status Indicator */}
          {authState === 'app' && aiStatusText && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
              aiStatusText === 'AI Ready' 
                ? 'bg-green-500/20 dark:bg-green-500/30 text-green-600 dark:text-green-400 border-green-500/30'
                : 'bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light border-brand/30'
            }`}>
              {aiStatusText}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Top navigation kept for desktop, bottom nav for mobile */}
          {showNav && (
            <nav className="hidden lg:flex items-center space-x-0.5 sm:space-x-1">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  onViewChange('home');
                  if ((window as any).__dashboardReset) {
                    (window as any).__dashboardReset();
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${view === 'home' ? 'bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light' : 'text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary'}`}
              >
                <span className="hidden sm:inline">Home</span>
                <span className="sm:hidden">H</span>
              </button>
              <button 
                onClick={() => onViewChange('values')}
                className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${view === 'values' ? 'bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light' : 'text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary'}`}
              >
                <span className="hidden sm:inline">Values</span>
                <span className="sm:hidden">V</span>
              </button>
              <button 
                onClick={() => onViewChange('goals')}
                className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${view === 'goals' ? 'bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light' : 'text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary'}`}
              >
                <span className="hidden sm:inline">Goals</span>
                <span className="sm:hidden">G</span>
              </button>
              <button 
                onClick={() => onViewChange('report')}
                className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${view === 'report' ? 'bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light' : 'text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary'}`}
              >
                <span className="hidden sm:inline">Reports</span>
                <span className="sm:hidden">R</span>
              </button>
              <button 
                onClick={() => onViewChange('vault')}
                className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${view === 'vault' ? 'bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light' : 'text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary'}`}
              >
                <span className="hidden sm:inline">Vault</span>
                <span className="sm:hidden">V</span>
              </button>
            </nav>
          )}
          {showNav && (
            <button 
              onClick={onOpenLCSWConfig}
              className="w-8 h-8 flex items-center justify-center rounded-full text-text-secondary dark:text-text-secondary hover:text-brand dark:hover:text-brand-light hover:bg-brand/10 dark:hover:bg-brand/20 transition-all"
              aria-label="Configuration"
              title="Configuration"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          )}
          <ThemeToggle />
          <button 
            onClick={onOpenHelp}
            className="w-8 h-8 flex items-center justify-center rounded-full text-text-secondary dark:text-text-secondary hover:text-brand dark:hover:text-brand-light hover:bg-brand/10 dark:hover:bg-brand/20 transition-all"
            aria-label="Help"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
          <button
            onClick={onLogout}
            className="w-8 h-8 flex items-center justify-center rounded-full text-text-secondary dark:text-text-secondary hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            aria-label="Logout"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

