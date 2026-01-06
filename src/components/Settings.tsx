import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../hooks/useAuth';
import { useDataContext } from '../contexts/DataContext';
import { getCurrentUser } from '../services/authService';
import { AppSettings, EmailSchedule, LCSWConfig } from '../types';

interface SettingsProps {
  onLogout: () => void;
  onShowHelp: () => void;
  version?: string;
}

const Settings: React.FC<SettingsProps> = ({ onLogout, onShowHelp, version = '1.0.0' }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { isEncryptionEnabled } = useAuth();
  const context = useDataContext();
  const [userEmail, setUserEmail] = useState<string>('');
  const [therapistEmails, setTherapistEmails] = useState<string[]>([]);
  const [settings, setSettings] = useState<AppSettings>(context.settings || {
    reminders: { enabled: false, frequency: 'daily', time: '09:00' }
  });

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      const user = await getCurrentUser();
      if (user) {
        setUserEmail(user.email || '');
        setTherapistEmails(user.therapistEmails || []);
      }
    };
    loadUserData();
  }, []);

  // Update context when settings change
  useEffect(() => {
    if (context) {
      context.setSettings(settings);
    }
  }, [settings, context]);

  const updateEmailSchedule = (updates: Partial<EmailSchedule>) => {
    setSettings(prev => ({
      ...prev,
      emailSchedule: {
        enabled: prev.emailSchedule?.enabled || false,
        frequency: prev.emailSchedule?.frequency || 'weekly',
        time: prev.emailSchedule?.time || '09:00',
        recipientEmails: prev.emailSchedule?.recipientEmails || [],
        sendGoalCompletions: prev.emailSchedule?.sendGoalCompletions || false,
        sendReports: prev.emailSchedule?.sendReports || false,
        ...updates
      }
    }));
  };

  const updateLCSWConfig = (updates: Partial<LCSWConfig>) => {
    setSettings(prev => ({
      ...prev,
      lcswConfig: {
        protocols: prev.lcswConfig?.protocols || [],
        crisisPhrases: prev.lcswConfig?.crisisPhrases || [],
        allowStructuredRecommendations: prev.lcswConfig?.allowStructuredRecommendations || false,
        ...prev.lcswConfig,
        ...updates
      }
    }));
  };

  const updateReminders = (updates: Partial<typeof settings.reminders>) => {
    setSettings(prev => ({
      ...prev,
      reminders: {
        ...prev.reminders,
        ...updates
      }
    }));
  };

  const addTherapistEmail = () => {
    const email = prompt('Enter therapist email:');
    if (email && email.includes('@')) {
      setTherapistEmails(prev => [...prev, email]);
      // TODO: Save to user profile
    }
  };

  const removeTherapistEmail = (index: number) => {
    setTherapistEmails(prev => prev.filter((_, i) => i !== index));
    // TODO: Save to user profile
  };

  const addRecipientEmail = () => {
    const email = prompt('Enter recipient email for reports:');
    if (email && email.includes('@')) {
      updateEmailSchedule({
        recipientEmails: [...(settings.emailSchedule?.recipientEmails || []), email]
      });
    }
  };

  const removeRecipientEmail = (index: number) => {
    updateEmailSchedule({
      recipientEmails: settings.emailSchedule?.recipientEmails?.filter((_, i) => i !== index) || []
    });
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-text-primary dark:text-white">
          Settings
        </h1>
      </div>

      {/* Dark/Light Mode - Standalone Button */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-text-primary dark:text-white">Theme</p>
            <p className="text-sm text-text-secondary dark:text-white/60">
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Email Configuration */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-text-primary dark:text-white mb-2 flex items-center gap-2">
          <span>📧</span> Email Configuration
        </h2>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-white mb-1">
              Your Email
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-3 py-2 rounded-lg bg-bg-secondary dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border text-text-primary dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-white mb-1">
              Therapist Emails
            </label>
            <div className="space-y-2">
              {therapistEmails.map((email, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const updated = [...therapistEmails];
                      updated[index] = e.target.value;
                      setTherapistEmails(updated);
                    }}
                    className="flex-1 px-3 py-2 rounded-lg bg-bg-secondary dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border text-text-primary dark:text-white"
                  />
                  <button
                    onClick={() => removeTherapistEmail(index)}
                    className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={addTherapistEmail}
                className="w-full px-3 py-2 text-sm bg-bg-secondary dark:bg-dark-bg-primary text-text-primary dark:text-white rounded-lg hover:bg-bg-secondary/80 transition-colors"
              >
                + Add Therapist Email
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-text-primary dark:text-white mb-2 flex items-center gap-2">
          <span>🚨</span> Emergency Contacts
        </h2>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-white mb-1">
              Contact Name
            </label>
            <input
              type="text"
              value={settings.lcswConfig?.emergencyContact?.name || ''}
              onChange={(e) => updateLCSWConfig({
                emergencyContact: {
                  ...settings.lcswConfig?.emergencyContact,
                  name: e.target.value,
                  phone: settings.lcswConfig?.emergencyContact?.phone || '',
                }
              })}
              placeholder="Emergency contact name"
              className="w-full px-3 py-2 rounded-lg bg-bg-secondary dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border text-text-primary dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-white mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={settings.lcswConfig?.emergencyContact?.phone || ''}
              onChange={(e) => updateLCSWConfig({
                emergencyContact: {
                  ...settings.lcswConfig?.emergencyContact,
                  name: settings.lcswConfig?.emergencyContact?.name || '',
                  phone: e.target.value,
                }
              })}
              placeholder="(555) 123-4567"
              className="w-full px-3 py-2 rounded-lg bg-bg-secondary dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border text-text-primary dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-white mb-1">
              Email (Optional)
            </label>
            <input
              type="email"
              value={settings.lcswConfig?.emergencyContact?.email || ''}
              onChange={(e) => updateLCSWConfig({
                emergencyContact: {
                  ...settings.lcswConfig?.emergencyContact,
                  name: settings.lcswConfig?.emergencyContact?.name || '',
                  phone: settings.lcswConfig?.emergencyContact?.phone || '',
                  email: e.target.value,
                }
              })}
              placeholder="contact@email.com"
              className="w-full px-3 py-2 rounded-lg bg-bg-secondary dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border text-text-primary dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Report Settings */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-text-primary dark:text-white mb-2 flex items-center gap-2">
          <span>📊</span> Report Settings
        </h2>
        
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.emailSchedule?.enabled || false}
              onChange={(e) => updateEmailSchedule({ enabled: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm font-medium text-text-primary dark:text-white">
              Enable Email Reports
            </span>
          </label>

          {settings.emailSchedule?.enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-white mb-1">
                  Frequency
                </label>
                <select
                  value={settings.emailSchedule?.frequency || 'weekly'}
                  onChange={(e) => updateEmailSchedule({ frequency: e.target.value as 'daily' | 'weekly' | 'monthly' })}
                  className="w-full px-3 py-2 rounded-lg bg-bg-secondary dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border text-text-primary dark:text-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-white mb-1">
                  Send Time
                </label>
                <input
                  type="time"
                  value={settings.emailSchedule?.time || '09:00'}
                  onChange={(e) => updateEmailSchedule({ time: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-bg-secondary dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border text-text-primary dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-white mb-1">
                  Recipient Emails
                </label>
                <div className="space-y-2">
                  {settings.emailSchedule?.recipientEmails?.map((email, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="email"
                        value={email}
                        readOnly
                        className="flex-1 px-3 py-2 rounded-lg bg-bg-secondary dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border text-text-primary dark:text-white"
                      />
                      <button
                        onClick={() => removeRecipientEmail(index)}
                        className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addRecipientEmail}
                    className="w-full px-3 py-2 text-sm bg-bg-secondary dark:bg-dark-bg-primary text-text-primary dark:text-white rounded-lg hover:bg-bg-secondary/80 transition-colors"
                  >
                    + Add Recipient Email
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.emailSchedule?.sendGoalCompletions || false}
                    onChange={(e) => updateEmailSchedule({ sendGoalCompletions: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-text-primary dark:text-white">
                    Include Goal Completions
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.emailSchedule?.sendReports || false}
                    onChange={(e) => updateEmailSchedule({ sendReports: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-text-primary dark:text-white">
                    Include Clinical Reports
                  </span>
                </label>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Nudges Settings */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-text-primary dark:text-white mb-2 flex items-center gap-2">
          <span>🔔</span> Nudges & Reminders
        </h2>
        
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.reminders?.enabled || false}
              onChange={(e) => updateReminders({ enabled: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm font-medium text-text-primary dark:text-white">
              Enable Reminders
            </span>
          </label>

          {settings.reminders?.enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-white mb-1">
                  Frequency
                </label>
                <select
                  value={settings.reminders?.frequency || 'daily'}
                  onChange={(e) => updateReminders({ frequency: e.target.value as 'hourly' | 'daily' | 'weekly' | 'monthly' })}
                  className="w-full px-3 py-2 rounded-lg bg-bg-secondary dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border text-text-primary dark:text-white"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-white mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={settings.reminders?.time || '09:00'}
                  onChange={(e) => updateReminders({ time: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-bg-secondary dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border text-text-primary dark:text-white"
                />
              </div>
            </>
          )}
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
