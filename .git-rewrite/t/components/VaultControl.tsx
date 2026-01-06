
import React, { useState, useEffect } from 'react';
import { LogEntry, AppSettings } from '../types';
import { ALL_VALUES } from '../constants';

interface VaultControlProps {
  logs: LogEntry[];
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onClearData: () => void;
}

const VaultControl: React.FC<VaultControlProps> = ({ logs, settings, onUpdateSettings, onClearData }) => {
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(Notification.permission);
  const [nextPulseInfo, setNextPulseInfo] = useState<string>('');

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
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Vault & Accountability</h2>
        <p className="text-slate-500 text-lg">Manage your history and growth commitments.</p>
      </div>

      {/* Accountability Settings Card */}
      <div className="bg-white rounded-[48px] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-10 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">Accountability Engine</h3>
              <p className="text-xs text-slate-500 font-medium">Keep your North Star in sight throughout the day.</p>
            </div>
            <button 
              onClick={toggleReminders}
              className={`w-16 h-8 rounded-full transition-all relative ${settings.reminders.enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
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

      <div className="bg-white rounded-[48px] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-center sm:text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Impact</p>
            <p className="text-3xl font-black text-slate-900">{logs.length} Entries</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={handleExport} className="flex-1 sm:flex-none px-6 py-3 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">Export JSON</button>
            <button onClick={onClearData} className="flex-1 sm:flex-none px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors">Wipe Data</button>
          </div>
        </div>

        <div className="p-10 space-y-10">
          {sortedLogs.length === 0 ? (
            <div className="text-center py-20 text-slate-300 space-y-4">
              <svg className="w-16 h-16 mx-auto opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              <p className="font-bold text-xl">The Vault is currently empty.</p>
              <p className="text-sm">Start by reflecting on your values in the Dashboard.</p>
            </div>
          ) : (
            <div className="relative pl-8 space-y-10 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[3px] before:bg-slate-50">
              {sortedLogs.map((log) => {
                const val = ALL_VALUES.find(v => v.id === log.valueId);
                const isGoalAchieved = log.type === 'goal-completion';
                const isCommitment = log.goalText && !isGoalAchieved;

                return (
                  <div key={log.id} className="relative group">
                    <div className={`absolute -left-[26px] top-1.5 w-6 h-6 rounded-full bg-white border-4 z-10 transition-all ${isGoalAchieved ? 'border-emerald-500 scale-125' : isCommitment ? 'border-indigo-500' : 'border-slate-200'}`} />
                    
                    <div className={`rounded-[32px] p-8 border-2 transition-all ${isGoalAchieved ? 'bg-emerald-50/30 border-emerald-100 shadow-emerald-50' : 'bg-slate-50 border-slate-100 group-hover:bg-white group-hover:shadow-2xl'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl" title={log.mood}>{log.mood || '✨'}</span>
                          <div>
                            <p className="font-black text-slate-900 text-lg leading-none mb-1">{val?.name || 'Reflection'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        {isGoalAchieved && (
                           <span className="bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">Goal Achieved</span>
                        )}
                      </div>

                      <p className="text-slate-600 leading-relaxed italic text-base">"{log.note}"</p>

                      {log.goalText && (
                        <div className={`mt-6 pt-6 border-t ${isGoalAchieved ? 'border-emerald-200' : 'border-slate-200'} flex flex-col gap-2`}>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${isGoalAchieved ? 'text-emerald-700' : 'text-indigo-600'}`}>
                            {isGoalAchieved ? 'Accomplished Target' : 'Commitment Target'}
                          </p>
                          <p className={`text-sm font-bold ${isGoalAchieved ? 'text-emerald-900' : 'text-slate-800'}`}>
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
      
      <div className="text-center text-xs text-slate-400 font-medium">
        Encrypted local storage. Your data remains strictly on your device.
      </div>
    </div>
  );
};

export default VaultControl;
