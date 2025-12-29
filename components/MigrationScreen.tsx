/**
 * Migration Screen Component
 * OPT-IN migration to encrypted database with validation and progress tracking
 */

import React, { useState, useEffect } from 'react';
import { MigrationService, MigrationProgress } from '../services/migrationService';
import { ValidationResult } from '../services/migrationValidator';
import { detectLegacyData, LegacyDataInfo } from '../services/legacyDetection';
import { restoreLegacyBackup, hasValidBackup } from '../services/backupManager';

interface MigrationScreenProps {
  onClose: () => void;
  onComplete: () => void;
}

export const MigrationScreen: React.FC<MigrationScreenProps> = ({ onClose, onComplete }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState<MigrationProgress | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [legacyData, setLegacyData] = useState<LegacyDataInfo | null>(null);
  const [showRestore, setShowRestore] = useState(false);

  useEffect(() => {
    // Detect legacy data on mount
    detectLegacyData().then(data => {
      setLegacyData(data);
    });
  }, []);

  const handleMigrate = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    setMigrating(true);
    setError(null);
    setValidation(null);
    
    try {
      const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId') || '1';
      const migrationService = new MigrationService((progress) => {
        setProgress(progress);
      });
      
      const result = await migrationService.migrateToEncrypted(password, userId);
      
      setValidation(result.validation);
      
      if (!result.success) {
        setError(`Migration completed with errors:\n${result.errors.join('\n')}`);
        setMigrating(false);
        return;
      }
      
      // Set encryption enabled flag
      localStorage.setItem('encryption_enabled', 'true');
      
      // Migration successful - show validation summary
      setTimeout(() => {
        onComplete();
        window.location.reload();
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed');
      setMigrating(false);
    }
  };

  const handleRestore = async () => {
    if (!hasValidBackup()) {
      setError('No backup found to restore');
      return;
    }
    
    try {
      await restoreLegacyBackup();
      localStorage.setItem('encryption_enabled', 'false');
      setError(null);
      alert('Backup restored successfully. Please refresh the page.');
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Restore failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-bg-primary rounded-xl shadow-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-text-primary dark:text-white">🔐 Migrate to HIPAA Encryption</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-bg-secondary dark:bg-dark-bg-secondary text-text-tertiary dark:text-text-tertiary hover:text-text-primary dark:hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Pre-migration validation display */}
        {!migrating && legacyData && legacyData.hasLegacyData && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm font-medium mb-2">Pre-Migration Check</p>
            <p className="text-xs text-text-secondary">
              Found <strong>{legacyData.recordCount} records</strong> across {legacyData.tables.length} tables
            </p>
            <ul className="text-xs text-text-tertiary mt-2 list-disc list-inside">
              {legacyData.tables.map(table => (
                <li key={table}>{table}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Migration form */}
        {!migrating && !validation && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                Encryption Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary dark:text-white rounded-lg border border-border-soft dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-yellow-warm"
                placeholder="Enter password (min 8 characters)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary dark:text-white rounded-lg border border-border-soft dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-yellow-warm"
                placeholder="Confirm password"
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={handleMigrate}
                className="flex-1 px-4 py-3 bg-yellow-warm text-white rounded-lg text-sm font-black uppercase tracking-widest hover:opacity-90"
              >
                Start Migration
              </button>
              {hasValidBackup() && (
                <button
                  onClick={() => setShowRestore(!showRestore)}
                  className="px-4 py-3 bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary dark:text-white rounded-lg text-sm font-medium hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary"
                >
                  Restore
                </button>
              )}
            </div>
            
            {showRestore && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                  Restore will revert to the legacy database. This will disable encryption.
                </p>
                <button
                  onClick={handleRestore}
                  className="w-full px-4 py-2 bg-yellow-warm text-white rounded-lg text-sm font-medium hover:opacity-90"
                >
                  Confirm Restore
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Migration progress */}
        {migrating && progress && (
          <div className="mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-text-primary dark:text-white">{progress.step}</span>
              <span className="text-text-secondary dark:text-text-secondary">{progress.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-yellow-warm h-2 rounded-full transition-all"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Post-migration validation */}
        {validation && !migrating && (
          <div className={`mb-6 p-4 rounded-lg ${
            validation.isValid 
              ? "bg-green-50 dark:bg-green-900/20" 
              : "bg-red-50 dark:bg-red-900/20"
          }`}>
            <p className="text-sm font-medium mb-2 text-text-primary dark:text-white">
              {validation.isValid ? '✅ Migration Validated' : '⚠️ Validation Issues'}
            </p>
            
            {Object.keys(validation.recordCounts.legacy).length > 0 && (
              <div className="text-xs mt-2">
                <p className="font-medium text-text-primary dark:text-white">Record Counts:</p>
                {Object.entries(validation.recordCounts.legacy).map(([table, count]) => (
                  <p key={table} className="text-text-secondary dark:text-text-secondary">
                    {table}: {count} → {validation.recordCounts.encrypted[`${table}_encrypted`] || 0}
                  </p>
                ))}
              </div>
            )}
            
            {validation.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-red-600 dark:text-red-400">Errors:</p>
                <ul className="text-xs text-red-600 dark:text-red-400 list-disc list-inside">
                  {validation.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {validation.warnings.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Warnings:</p>
                <ul className="text-xs text-yellow-600 dark:text-yellow-400 list-disc list-inside">
                  {validation.warnings.map((warn, i) => (
                    <li key={i}>{warn}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

