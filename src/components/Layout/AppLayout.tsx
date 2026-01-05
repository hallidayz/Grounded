import React, { ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';
import BottomNavigation from '../BottomNavigation';

interface AppLayoutProps {
  children: ReactNode;
  authState: 'checking' | 'login' | 'terms' | 'app';
  showNav: boolean;
  view: 'onboarding' | 'home' | 'report' | 'values' | 'vault' | 'goals' | 'settings';
  aiStatusText?: string;
  onViewChange: (view: 'onboarding' | 'home' | 'report' | 'values' | 'vault' | 'goals' | 'settings') => void;
  onOpenLCSWConfig: () => void;
  onOpenHelp: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  authState,
  showNav,
  view,
  aiStatusText,
  onViewChange,
  onOpenLCSWConfig,
  onOpenHelp,
}) => {
  return (
    <div className="min-h-screen bg-bg-primary dark:bg-dark-bg-primary text-text-primary dark:text-white flex flex-col transition-colors duration-300 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <AppHeader
        authState={authState}
        showNav={showNav}
        view={view}
        aiStatusText={aiStatusText}
        onViewChange={onViewChange}
        onOpenLCSWConfig={onOpenLCSWConfig}
        onOpenHelp={onOpenHelp}
      />
      <main className="flex-grow max-w-4xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 lg:pb-6">
        {children}
      </main>
      {showNav && (
        <BottomNavigation
          currentView={view}
          onViewChange={onViewChange}
        />
      )}
      <AppFooter />
    </div>
  );
};

