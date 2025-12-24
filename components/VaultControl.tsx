
import React, { useState, useEffect } from 'react';
import { LogEntry, Goal, AppSettings } from '../types';
import { ALL_VALUES } from '../constants';
import { shareViaEmail, generateDataExportEmail, isWebShareAvailable } from '../services/emailService';
import EmailScheduleComponent from './EmailSchedule';
import { getCurrentUser } from '../services/authService';

interface VaultControlProps {
  logs: LogEntry[];
  goals: Goal[];
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onClearData: () => void;
}

const VaultControl: React.FC<VaultControlProps> = ({ logs, goals, settings, onUpdateSettings, onClearData }) => {
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(Notification.permission);
  const [nextPulseInfo, setNextPulseInfo] = useState<string>('');
  const [showEmailSchedule, setShowEmailSchedule] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser().then(user => {
      if (user) setUserId(user.id);
    });
  }, []);

  // Calculate the next expected pulse for the UI
  useEffect(() => {
    const updatePulsePreview = () => {
      if (!settings.reminders.enabled) {
        setNextPulseInfo('Disabled');
        return;
      }

      const now = new Date();
      const currentHour = now.getHours();
      
      // Check for next hourly pulse if we are in daylight hours
      if (settings.reminders.recurringHourly && currentHour >= 8 && currentHour < 20) {
        setNextPulseInfo(`Hourly: ${currentHour + 1}:00`);
      } else {
        // Show the daily reminder time
        setNextPulseInfo(`Daily: ${settings.reminders.time}`);
      }
    };

    updatePulsePreview();
    const interval = setInterval(updatePulsePreview, 60000); // Update once a minute
    return () => clearInterval(interval);
  }, [settings.reminders]);

  const handleExport = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `inner_compass_journey_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleEmailExport = async () => {
    const values = ALL_VALUES.filter(v => logs.some(l => l.valueId === v.id));
    const emailData = generateDataExportEmail(logs, [], values, settings);
    const success = await shareViaEmail(emailData, []);
    if (!success) {
      alert("Could not open email. Please use the Export JSON button and attach manually.");
    }
  };

  const requestPermission = async () => {
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
  };

  const toggleReminders = () => {
    if (notifPermission !== 'granted') {
      requestPermission();
    }
    onUpdateSettings({
      ...settings,
      reminders: { ...settings.reminders, enabled: !settings.reminders.enabled }
    });
  };

  const toggleHourly = () => {
    onUpdateSettings({
      ...settings,
      reminders: { ...settings.reminders, recurringHourly: !settings.reminders.recurringHourly }
    });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateSettings({
      ...settings,
      reminders: { ...settings.reminders, time: e.target.value }
    });
  };

  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-12 animate-fade-in pb-20 max-w-2xl mx-auto">
      <div className="text-center space-y-3">
        <h2 className="text-2xl sm:text-4xl font-black text-authority-navy dark:text-pure-foundation tracking-tight">Vault & Accountability</h2>
        <p className="text-authority-navy/60 dark:text-pure-foundation/60 text-sm sm:text-lg">Manage your history and growth commitments.</p>
      </div>

      {/* Email Schedule Card */}
      <div className="bg-white dark:bg-executive-depth rounded-xl sm:rounded-2xl border border-slate-100 dark:border-creative-depth/30 shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8 lg:p-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-black text-authority-navy dark:text-pure-foundation">Email Summaries</h3>
              <p className="text-xs text-authority-navy/60 dark:text-pure-foundation/60 font-medium">Schedule automatic reports to your therapist</p>
            </div>
            <button
              onClick={() => setShowEmailSchedule(true)}
              className="px-4 sm:px-6 py-2 bg-brand-accent text-authority-navy rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest hover:opacity-90"
            >
              Configure
            </button>
          </div>
          {settings.emailSchedule?.enabled && (
            <div className="p-4 bg-pure-foundation dark:bg-executive-depth/50 rounded-xl">
              <p className="text-xs text-authority-navy dark:text-pure-foundation">
                <strong>Active:</strong> {settings.emailSchedule.frequency} at {settings.emailSchedule.time}
              </p>
              <p className="text-xs text-authority-navy/60 dark:text-pure-foundation/60 mt-1">
                Recipients: {settings.emailSchedule.recipientEmails.length} email(s)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Accountability Settings Card */}
      <div className="bg-white dark:bg-executive-depth rounded-xl sm:rounded-2xl border border-slate-100 dark:border-creative-depth/30 shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-black text-authority-navy dark:text-pure-foundation">Accountability Engine</h3>
              <p className="text-xs text-authority-navy/60 dark:text-pure-foundation/60 font-medium">Keep your North Star in sight throughout the day.</p>
            </div>
            <button 
              onClick={toggleReminders}
              className={`w-16 h-8 rounded-full transition-all relative ${settings.reminders.enabled ? 'bg-brand-accent' : 'bg-slate-200 dark:bg-executive-depth'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.reminders.enabled ? 'left-9' : 'left-1'}`} />
            </button>
          </div>

          <div className={`space-y-8 transition-all duration-500 ${settings.reminders.enabled ? 'opacity-100 scale-100' : 'opacity-30 scale-95 pointer-events-none'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Reflection Time</label>
                <input 
                  type="time" 
                  value={settings.reminders.time}
                  onChange={handleTimeChange}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                />
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hourly Pulse</p>
                    <p className="text-xs font-bold text-slate-700">8 AM - 8 PM only</p>
                  </div>
                  <button 
                    onClick={toggleHourly}
                    className={`w-12 h-6 rounded-full transition-all relative ${settings.reminders.recurringHourly ? 'bg-indigo-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${settings.reminders.recurringHourly ? 'left-6.5' : 'left-0.5'}`} />
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Next Pulse</span>
                   <span className="text-xs font-black text-indigo-600 animate-pulse">{nextPulseInfo}</span>
                </div>
              </div>
            </div>
            
            <div className="w-full">
              {notifPermission !== 'granted' ? (
                <button 
                  onClick={requestPermission}
                  className="w-full px-6 py-4 bg-amber-50 text-amber-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Enable Browser Permissions
                </button>
              ) : (
                <div className="px-6 py-4 bg-emerald-50 text-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  Nudge Engine Active
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-medium italic text-center">Reminders trigger via system notifications while this tab is open.</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-executive-depth rounded-xl sm:rounded-2xl border border-slate-100 dark:border-creative-depth/30 shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8 lg:p-10 border-b border-slate-50 dark:border-creative-depth/30 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
          <div className="text-center sm:text-left">
            <p className="text-[10px] font-black text-authority-navy/50 dark:text-pure-foundation/50 uppercase tracking-widest mb-1">Total Impact</p>
            <p className="text-2xl sm:text-3xl font-black text-authority-navy dark:text-pure-foundation">{logs.length} Entries</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <button onClick={handleExport} className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-pure-foundation dark:bg-executive-depth/50 text-authority-navy dark:text-pure-foundation rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-colors">Export JSON</button>
            <button onClick={handleEmailExport} className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-brand-accent text-authority-navy rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-colors">
              {isWebShareAvailable() ? '📧 Share' : '📧 Email'}
            </button>
            <button onClick={onClearData} className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">Wipe Data</button>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10 space-y-8 sm:space-y-10">
          {sortedLogs.length === 0 ? (
            <div className="text-center py-16 sm:py-20 text-authority-navy/30 dark:text-pure-foundation/30 space-y-4">
              <svg className="w-12 sm:w-16 h-12 sm:h-16 mx-auto opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              <p className="font-bold text-lg sm:text-xl text-authority-navy dark:text-pure-foundation">The Vault is currently empty.</p>
              <p className="text-xs sm:text-sm text-authority-navy/60 dark:text-pure-foundation/60">Start by reflecting on your values in the Dashboard.</p>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 space-y-8 sm:space-y-10 before:absolute before:left-[8px] sm:before:left-[11px] before:top-2 before:bottom-2 before:w-[3px] before:bg-slate-50 dark:before:bg-creative-depth/30">
              {sortedLogs.map((log) => {
                const val = ALL_VALUES.find(v => v.id === log.valueId);
                const isGoalAchieved = log.type === 'goal-completion';
                const isCommitment = log.goalText && !isGoalAchieved;

                return (
                  <div key={log.id} className="relative group">
                    <div className={`absolute -left-[22px] sm:-left-[26px] top-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white dark:bg-executive-depth border-4 z-10 transition-all ${isGoalAchieved ? 'border-success-forest scale-125' : isCommitment ? 'border-brand-accent' : 'border-slate-200 dark:border-creative-depth/50'}`} />
                    
                    <div className={`rounded-2xl sm:rounded-[32px] p-6 sm:p-8 border-2 transition-all ${isGoalAchieved ? 'bg-success-forest/10 dark:bg-success-forest/20 border-success-forest/30 shadow-emerald-50 dark:shadow-success-forest/20' : 'bg-slate-50 dark:bg-executive-depth/50 border-slate-100 dark:border-creative-depth/30 group-hover:bg-white dark:group-hover:bg-executive-depth group-hover:shadow-2xl'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <span className="text-2xl sm:text-3xl" title={log.mood}>{log.mood || '✨'}</span>
                          <div>
                            <p className="font-black text-authority-navy dark:text-pure-foundation text-base sm:text-lg leading-none mb-1">{val?.name || 'Reflection'}</p>
                            <p className="text-[9px] sm:text-[10px] font-bold text-authority-navy/50 dark:text-pure-foundation/50 uppercase tracking-widest">
                              {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        {isGoalAchieved && (
                           <span className="bg-success-forest text-white text-[8px] sm:text-[9px] font-black px-2 sm:px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">Goal Achieved</span>
                        )}
                      </div>

                      <p className="text-authority-navy/70 dark:text-pure-foundation/70 leading-relaxed italic text-sm sm:text-base">"{log.note}"</p>

                      {log.goalText && (
                        <div className={`mt-4 sm:mt-6 pt-4 sm:pt-6 border-t ${isGoalAchieved ? 'border-success-forest/30' : 'border-slate-200 dark:border-creative-depth/30'} flex flex-col gap-2`}>
                          <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${isGoalAchieved ? 'text-success-forest' : 'text-brand-accent'}`}>
                            {isGoalAchieved ? 'Accomplished Target' : 'Commitment Target'}
                          </p>
                          <p className={`text-xs sm:text-sm font-bold ${isGoalAchieved ? 'text-success-forest dark:text-success-forest' : 'text-authority-navy dark:text-pure-foundation'}`}>
                            {log.goalText}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <div className="text-center text-xs text-authority-navy/50 dark:text-pure-foundation/50 font-medium">
        Encrypted local storage. Your data remains strictly on your device.
      </div>

      {showEmailSchedule && userId && (
        <EmailScheduleComponent
          userId={userId}
          logs={logs}
          goals={goals}
          values={ALL_VALUES}
          schedule={settings.emailSchedule}
          onUpdate={(schedule) => onUpdateSettings({ ...settings, emailSchedule: schedule })}
          onClose={() => setShowEmailSchedule(false)}
        />
      )}
    </div>
  );
};

export default VaultControl;
