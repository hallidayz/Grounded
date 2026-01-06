/**
 * Settings Danger Zone Component
 * Lightweight React component for QA testing and data management
 * Provides access to destructive operations like uninstalling app data
 */

import React, { useState } from 'react';
import { dbService } from '../services/database';

interface SettingsDangerZoneProps {
  onComplete?: () => void;
}

const SettingsDangerZone: React.FC<SettingsDangerZoneProps> = ({ onComplete }) => {
  const [isUninstalling, setIsUninstalling] = useState(false);
  const [uninstallStatus, setUninstallStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Handle complete app data uninstall
   * Wipes all IndexedDB, localStorage, sessionStorage, and cache
   */
  const handleUninstall = async () => {
    // Double confirmation for safety
    const firstConfirm = window.confirm(
      '⚠️ WARNING: This will permanently delete ALL app data.\n\n' +
      'This includes:\n' +
      '• All user accounts\n' +
      '• All feeling logs and reflections\n' +
      '• All goals and values\n' +
      '• All settings and preferences\n' +
      '• All cached data\n\n' +
      'This action CANNOT be undone.\n\n' +
      'Are you absolutely sure?'
    );

    if (!firstConfirm) {
      return;
    }

    const secondConfirm = window.confirm(
      'FINAL CONFIRMATION:\n\n' +
      'You are about to PERMANENTLY DELETE all app data.\n\n' +
      'Type "DELETE" in the next prompt to confirm, or click Cancel to abort.'
    );

    if (!secondConfirm) {
      return;
    }

    const typedConfirm = window.prompt(
      'Type "DELETE" (all caps) to confirm uninstall:'
    );

    if (typedConfirm !== 'DELETE') {
      alert('Uninstall cancelled. Data was not deleted.');
      return;
    }

    setIsUninstalling(true);
    setUninstallStatus('idle');
    setErrorMessage(null);

    try {
      await dbService.uninstallAppData();
      setUninstallStatus('success');
      
      // Show success message
      alert(
        '✅ App data uninstalled successfully!\n\n' +
        'All local data has been wiped. The app will reload shortly.'
      );

      // Reload page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);

      // Call completion callback if provided
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('[DangerZone] Uninstall failed:', error);
      setUninstallStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
      
      alert(
        '❌ Uninstall failed:\n\n' +
        (error instanceof Error ? error.message : 'Unknown error occurred') +
        '\n\nPlease check the console for details.'
      );
    } finally {
      setIsUninstalling(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-text-primary dark:text-white">
          ⚠️ Danger Zone
        </h1>
      </div>

      <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-800 rounded-2xl p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-red-800 dark:text-red-400 mb-2 flex items-center gap-2">
            <span>🗑️</span> Uninstall App Data
          </h2>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            This will permanently delete ALL app data including user accounts, logs, goals, 
            values, settings, and cached data. This action cannot be undone.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleUninstall}
            disabled={isUninstalling}
            className={`
              w-full flex items-center justify-center gap-2 p-4 rounded-xl
              font-bold text-white
              transition-all duration-200
              ${
                isUninstalling
                  ? 'bg-red-400 dark:bg-red-800 cursor-not-allowed'
                  : 'bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 active:scale-95'
              }
            `}
          >
            {isUninstalling ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Uninstalling...</span>
              </>
            ) : (
              <>
                <span>🗑️</span>
                <span>Uninstall All App Data</span>
              </>
            )}
          </button>

          {uninstallStatus === 'success' && (
            <div className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl">
              <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                ✅ Uninstall completed successfully. Page will reload shortly...
              </p>
            </div>
          )}

          {uninstallStatus === 'error' && errorMessage && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl">
              <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                ❌ Uninstall failed: {errorMessage}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400">
            <strong>Note:</strong> This is a QA testing tool. Use with extreme caution in production.
            All data deletion is permanent and irreversible.
          </p>
        </div>
      </div>

      {/* Additional QA Tools Section */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4 flex items-center gap-2">
          <span>🧪</span> QA Testing Tools
        </h2>
        
        <div className="space-y-3">
          <div className="p-3 bg-bg-secondary dark:bg-dark-bg-primary/50 rounded-xl">
            <p className="text-sm text-text-secondary dark:text-white/70">
              <strong>Database Info:</strong> Check browser DevTools → Application → IndexedDB to verify data deletion.
            </p>
          </div>
          
          <div className="p-3 bg-bg-secondary dark:bg-dark-bg-primary/50 rounded-xl">
            <p className="text-sm text-text-secondary dark:text-white/70">
              <strong>Storage Info:</strong> Check Application → Local Storage and Session Storage to verify cleanup.
            </p>
          </div>
          
          <div className="p-3 bg-bg-secondary dark:bg-dark-bg-primary/50 rounded-xl">
            <p className="text-sm text-text-secondary dark:text-white/70">
              <strong>Cache Info:</strong> Check Application → Cache Storage to verify cache deletion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDangerZone;

