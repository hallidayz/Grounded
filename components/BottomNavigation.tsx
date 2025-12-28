import React from 'react';

type View = 'home' | 'values' | 'report' | 'vault' | 'onboarding';

interface BottomNavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentView, onViewChange }) => {
  const tabs = [
    { id: 'home' as View, label: 'Home', icon: '🏠' },
    { id: 'values' as View, label: 'Values', icon: '💛' },
    { id: 'report' as View, label: 'Reports', icon: '📊' },
    { id: 'vault' as View, label: 'Vault', icon: '🔒' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-bg-primary border-t border-border-soft dark:border-dark-border shadow-lg z-50 safe-area-inset-bottom">
      <div className="max-w-4xl mx-auto px-2">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive = currentView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onViewChange(tab.id);
                  // Reset dashboard state when navigating to home
                  if (tab.id === 'home' && (window as any).__dashboardReset) {
                    (window as any).__dashboardReset();
                  }
                  // Scroll to top when navigating to home
                  if (tab.id === 'home') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className={`
                  flex flex-col items-center justify-center py-3 px-4 min-w-[60px] min-h-[60px]
                  transition-all duration-200
                  ${isActive 
                    ? 'text-navy-primary dark:text-yellow-warm' 
                    : 'text-text-secondary dark:text-white/60'
                  }
                  active:scale-95
                `}
                aria-label={tab.label}
              >
                <span className="text-2xl mb-1">{tab.icon}</span>
                <span className={`
                  text-xs font-medium
                  ${isActive ? 'font-semibold' : ''}
                `}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;

