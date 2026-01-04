import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../hooks/useAuth';

interface SettingsProps {
  onLogout: () => void;
  onShowHelp: () => void;
  onClearData: () => void;
  version?: string;
}

const Settings: React.FC<SettingsProps> = ({ onLogout, onShowHelp, onClearData, version = '1.0.0' }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { isEncryptionEnabled } = useAuth();

  return (
    <div className="space-y-6 pb-24 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-text-primary dark:text-white">
          Settings
        </h1>
      </div>

      {/* Appearance Section */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4 flex items-center gap-2">
          <span>🎨</span> Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-text-primary dark:text-white">App Theme</p>
            <p className="text-sm text-text-secondary dark:text-white/60">
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Account & Data Section */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-text-primary dark:text-white mb-2 flex items-center gap-2">
          <span>🔐</span> Account & Data
        </h2>
        
        <div className="space-y-3">
          <button 
            onClick={onShowHelp}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-bg-secondary dark:bg-dark-bg-primary/50 text-text-primary dark:text-white hover:bg-bg-secondary/80 transition-colors"
          >
            <span className="font-medium">Help & Resources</span>
            <span className="text-xl">ℹ️</span>
          </button>

          {isEncryptionEnabled && (
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-bg-secondary dark:bg-dark-bg-primary/50 text-text-primary dark:text-white hover:bg-bg-secondary/80 transition-colors"
            >
              <span className="font-medium">Lock App</span>
              <span className="text-xl">🔒</span>
            </button>
          )}

          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
                onClearData();
              }
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <span className="font-medium">Clear Local Data</span>
            <span className="text-xl">🗑️</span>
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="text-center pt-8">
        <p className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
          Grounded v{version}
        </p>
        <p className="text-xs text-text-tertiary mt-1">
          Made with 💙 for mental wellness
        </p>
      </div>
    </div>
  );
};

export default Settings;

