
import React, { useState, useEffect } from 'react';
import { ALL_VALUES } from './constants';
import { ValueItem, LogEntry, Goal, AppSettings } from './types';
import ValueSelection from './components/ValueSelection';
import Dashboard from './components/Dashboard';
import ReportView from './components/ReportView';
import VaultControl from './components/VaultControl';
import HelpOverlay from './components/HelpOverlay';

// Simple persistence helper
const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};

const App: React.FC = () => {
  const [selectedValueIds, setSelectedValueIds] = useLocalStorage<string[]>('myValues', []);
  const [logs, setLogs] = useLocalStorage<LogEntry[]>('myLogs', []);
  const [goals, setGoals] = useLocalStorage<Goal[]>('myGoals', []);
  const [settings, setSettings] = useLocalStorage<AppSettings>('mySettings', {
    reminders: { enabled: false, time: '09:00', recurringHourly: false }
  });
  const [view, setView] = useState<'onboarding' | 'dashboard' | 'report' | 'values' | 'vault'>('onboarding');
  const [showHelp, setShowHelp] = useState(false);

  // Daily & Hourly Reminder Heartbeat
  useEffect(() => {
    if (!settings.reminders.enabled) return;

    const checkReminders = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
      const today = now.toISOString().split('T')[0];

      if (Notification.permission !== 'granted') return;

      const topValue = ALL_VALUES.find(v => v.id === selectedValueIds[0])?.name || 'values';
      let shouldNotify = false;
      let notificationBody = "";

      // 1. Check Primary Daily Nudge
      if (currentTime === settings.reminders.time && settings.reminders.lastNotifiedDay !== today) {
        shouldNotify = true;
        notificationBody = `Time for your daily InnerCompass check-in. Your focus is ${topValue}.`;
      } 
      // 2. Check Hourly Daylight Nudge (8 AM to 8 PM)
      else if (
        settings.reminders.recurringHourly && 
        currentHour >= 8 && 
        currentHour <= 20 && 
        currentMin === 0 && 
        settings.reminders.lastNotifiedHour !== currentHour
      ) {
        shouldNotify = true;
        notificationBody = `Hourly Pulse: Are your actions right now aligned with ${topValue}?`;
      }

      if (shouldNotify) {
        new Notification('InnerCompass', {
          body: notificationBody,
          icon: '/favicon.ico'
        });
        
        setSettings(prev => ({
          ...prev,
          reminders: { 
            ...prev.reminders, 
            lastNotifiedDay: today,
            lastNotifiedHour: currentHour 
          }
        }));
      }
    };

    const interval = setInterval(checkReminders, 30000); // Check every 30 seconds for accuracy
    checkReminders(); 

    return () => clearInterval(interval);
  }, [settings.reminders, selectedValueIds, setSettings]);

  // Determine initial view based on data
  useEffect(() => {
    if (selectedValueIds.length > 0 && view === 'onboarding') {
      setView('dashboard');
    }
  }, [selectedValueIds, view]);

  const handleSelectionComplete = (ids: string[]) => {
    setSelectedValueIds(ids);
    setView('dashboard');
  };

  const handleLogEntry = (entry: LogEntry) => {
    setLogs(prev => [entry, ...prev]);
  };

  const handleUpdateGoals = (updatedGoals: Goal[]) => {
    setGoals(updatedGoals);
  };

  const handleClearData = () => {
    setLogs([]);
    setSelectedValueIds([]);
    setGoals([]);
    setSettings({ reminders: { enabled: false, time: '09:00', recurringHourly: false } });
    setView('onboarding');
  };

  const selectedValues = selectedValueIds
    .map(id => ALL_VALUES.find(v => v.id === id))
    .filter(Boolean) as ValueItem[];

  const showNav = selectedValueIds.length > 0 && view !== 'onboarding';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              IC
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 hidden sm:inline">InnerCompass</span>
          </div>
          <div className="flex items-center space-x-2">
            {showNav && (
              <nav className="flex items-center space-x-0.5">
                <button 
                  onClick={() => setView('dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${view === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                >
                  Dash
                </button>
                <button 
                  onClick={() => setView('values')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${view === 'values' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                >
                  Values
                </button>
                <button 
                  onClick={() => setView('report')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${view === 'report' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                >
                  Reports
                </button>
                <button 
                  onClick={() => setView('vault')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${view === 'vault' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                >
                  Vault
                </button>
              </nav>
            )}
            <button 
              onClick={() => setShowHelp(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100"
              aria-label="Help"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-6">
        {view === 'onboarding' && (
          <ValueSelection 
            initialSelected={selectedValueIds} 
            onComplete={handleSelectionComplete} 
          />
        )}
        
        {view === 'values' && (
          <ValueSelection 
            initialSelected={selectedValueIds} 
            onComplete={handleSelectionComplete} 
          />
        )}
        
        {view === 'dashboard' && (
          <Dashboard 
            values={selectedValues} 
            onLog={handleLogEntry}
            goals={goals}
            onUpdateGoals={handleUpdateGoals}
            logs={logs}
          />
        )}

        {view === 'report' && (
          <ReportView 
            logs={logs} 
            values={selectedValues} 
          />
        )}

        {view === 'vault' && (
          <VaultControl
            logs={logs}
            settings={settings}
            onUpdateSettings={setSettings}
            onClearData={handleClearData}
          />
        )}
      </main>

      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}

      <footer className="py-4 text-center text-slate-400 text-[10px] font-medium tracking-wide">
        <p>Private & Secure. Data stays on device.</p>
      </footer>
    </div>
  );
};

export default App;
