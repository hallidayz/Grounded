import React, { useRef, useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

type View = 'home' | 'values' | 'report' | 'vault' | 'goals' | 'onboarding' | 'settings';

interface BottomNavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentView, onViewChange, onLogout }) => {
  const tabs = [
    { id: 'home' as View, label: 'Home', icon: '🏠' },
    { id: 'values' as View, label: 'Values', icon: '💛' },
    { id: 'goals' as View, label: 'Goals', icon: '🎯' },
    { id: 'report' as View, label: 'Reports', icon: '📊' },
  ];

  // Thumb swipe navigation state
  const navRef = useRef<HTMLElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // Get current tab index
  const currentIndex = tabs.findIndex(tab => tab.id === currentView);
  
  // Handle touch events for thumb swipe navigation
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartX.current || !touchStartY.current) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = touch.clientY - touchStartY.current;
      
      // Only handle horizontal swipes (ignore vertical scrolling)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0 && currentIndex > 0) {
          // Swipe right - go to previous tab
          onViewChange(tabs[currentIndex - 1].id);
          setSwipeDirection('right');
        } else if (deltaX < 0 && currentIndex < tabs.length - 1) {
          // Swipe left - go to next tab
          onViewChange(tabs[currentIndex + 1].id);
          setSwipeDirection('left');
        }
        
        // Reset swipe direction after animation
        setTimeout(() => setSwipeDirection(null), 300);
      }
      
      touchStartX.current = 0;
      touchStartY.current = 0;
    };

    nav.addEventListener('touchstart', handleTouchStart, { passive: true });
    nav.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      nav.removeEventListener('touchstart', handleTouchStart);
      nav.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentIndex, onViewChange]);

  return (
    <nav 
      ref={navRef}
      className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-bg-primary border-t border-border-soft dark:border-dark-border shadow-lg z-50 pb-[env(safe-area-inset-bottom)] transition-transform duration-300 ${
        swipeDirection === 'left' ? 'translate-x-[-10px]' : swipeDirection === 'right' ? 'translate-x-[10px]' : ''
      }`}
    >
      <div className="max-w-4xl mx-auto px-2">
        <div className="flex justify-around items-center">
          {tabs.map((tab) => {
            const isActive = currentView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={(e) => {
                  e.preventDefault();
                  // For home, ensure we reset state properly
                  if (tab.id === 'home') {
                    onViewChange('home');
                    if ((window as any).__dashboardReset) {
                      (window as any).__dashboardReset();
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    onViewChange(tab.id);
                  }
                }}
                className={`
                  flex flex-col items-center justify-center py-3 px-1 min-w-[60px] min-h-[60px]
                  transition-all duration-200
                  ${isActive 
                    /* PREV: text-navy-primary dark:text-yellow-warm */
                    ? 'text-navy-primary dark:text-brand-light' 
                    : 'text-text-secondary dark:text-white/60'
                  }
                  active:scale-95
                `}
                aria-label={tab.label}
              >
                <span className="text-2xl mb-1">{tab.icon}</span>
                <span className={`
                  text-[10px] font-medium uppercase tracking-tight
                  ${isActive ? 'font-bold' : ''}
                `}>
                  {tab.label}
                </span>
              </button>
            );
          })}
          
          {/* Theme Toggle */}
          <div className="flex flex-col items-center justify-center py-3 px-1 min-w-[60px] min-h-[60px]">
            <div className="mb-1 flex items-center justify-center">
              <ThemeToggle />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-tight text-text-secondary dark:text-white/60">
              Theme
            </span>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              if (window.confirm('Are you sure you want to lock the app?')) {
                onLogout();
              }
            }}
            className="flex flex-col items-center justify-center py-3 px-1 min-w-[60px] min-h-[60px] transition-all duration-200 text-text-secondary dark:text-white/60 hover:text-red-600 dark:hover:text-red-400 active:scale-95"
            aria-label="Logout"
          >
            <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-tight">
              Logout
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
