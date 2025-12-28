
import React, { useState, useEffect } from 'react';
import { LogEntry, Goal, AppSettings } from '../types';
import { ALL_VALUES } from '../constants';
import { shareViaEmail, generateDataExportEmail, isWebShareAvailable } from '../services/emailService';
import { getCurrentUser } from '../services/authService';
import { EMOTIONAL_STATES } from '../services/emotionalStates';
import VirtualList from './VirtualList';

interface VaultControlProps {
  logs: LogEntry[];
  goals: Goal[];
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onClearData: () => void;
  selectedValueIds?: string[]; // For displaying North Star in notifications
}

const VaultControl: React.FC<VaultControlProps> = ({ logs, goals, settings, onUpdateSettings, onClearData, selectedValueIds = [] }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');
  const [showDateRangePicker, setShowDateRangePicker] = useState<boolean>(false);

  useEffect(() => {
    getCurrentUser().then(user => {
      if (user) setUserId(user.id);
    });
  }, []);

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
    // Filter logs by date range if selected
    let filteredLogs = logs;
    if (selectedStartDate || selectedEndDate) {
      filteredLogs = logs.filter(log => {
        const logDate = new Date(log.date).toISOString().split('T')[0];
        if (selectedStartDate && logDate < selectedStartDate) return false;
        if (selectedEndDate && logDate > selectedEndDate) return false;
        return true;
      });
      
      if (filteredLogs.length === 0) {
        alert('No entries found in the selected date range.');
        return;
      }
    }
    
    const values = ALL_VALUES.filter(v => filteredLogs.some(l => l.valueId === v.id));
    const emailData = generateDataExportEmail(filteredLogs, [], values, settings);
    const success = await shareViaEmail(emailData, []);
    if (!success) {
      alert("Could not open email. Please try again.");
    }
  };


  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-12 animate-fade-in pb-20 max-w-2xl mx-auto">
      {/* Total Impact - First H1 Header */}
      <div className="bg-white dark:bg-dark-bg-primary rounded-xl sm:rounded-2xl border border-border-soft dark:border-dark-border/30 shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8 lg:p-10">
          <h1 className="text-2xl sm:text-4xl font-black text-text-primary dark:text-white tracking-tight mb-2">Total Impact</h1>
          <p className="text-text-primary/60 dark:text-white/60 text-sm sm:text-lg mb-6">Your journey in numbers</p>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="text-center sm:text-left">
              <p className="text-2xl sm:text-3xl font-black text-text-primary dark:text-white">{logs.length} Entries</p>
            </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setShowDateRangePicker(!showDateRangePicker)}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-bg-secondary dark:bg-dark-bg-primary/50 text-text-primary dark:text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest hover:opacity-80 transition-colors"
              >
                {selectedStartDate || selectedEndDate ? '📅 Date Range' : '📅 Select Dates'}
              </button>
              <button 
                onClick={handleEmailExport} 
                className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-yellow-warm text-text-primary rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest hover:opacity-90 transition-colors"
              >
                {isWebShareAvailable() ? '📧 Share' : '📧 Email'}
              </button>
              <button 
                onClick={onClearData} 
                className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                Wipe Data
              </button>
            </div>
            {showDateRangePicker && (
              <div className="bg-bg-secondary dark:bg-dark-bg-primary/50 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs sm:text-sm font-black text-text-primary/60 dark:text-white/60 uppercase tracking-widest block mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={selectedStartDate}
                      onChange={(e) => setSelectedStartDate(e.target.value)}
                      className="w-full p-2 rounded-lg bg-white dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border/30 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-black text-text-primary/60 dark:text-white/60 uppercase tracking-widest block mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={selectedEndDate}
                      onChange={(e) => setSelectedEndDate(e.target.value)}
                      className="w-full p-2 rounded-lg bg-white dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border/30 text-xs"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedStartDate('');
                      setSelectedEndDate('');
                    }}
                    className="flex-1 px-3 py-2 bg-border-soft dark:bg-dark-bg-primary text-text-primary dark:text-white rounded-lg text-xs sm:text-sm font-black uppercase tracking-widest"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowDateRangePicker(false)}
                    className="flex-1 px-3 py-2 bg-yellow-warm text-text-primary rounded-lg text-xs sm:text-sm font-black uppercase tracking-widest"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          {sortedLogs.length === 0 ? (
            <div className="text-center py-16 sm:py-20 text-text-primary/30 dark:text-white/30 space-y-4">
              <svg className="w-12 sm:w-16 h-12 sm:h-16 mx-auto opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              <p className="font-bold text-lg sm:text-xl text-text-primary dark:text-white">The Vault is currently empty.</p>
              <p className="text-xs sm:text-sm text-text-primary/60 dark:text-white/60">Start by reflecting on your values in the Dashboard.</p>
            </div>
          ) : (
            <VirtualList
              items={sortedLogs}
              itemHeight={100}
              containerHeight={typeof window !== 'undefined' ? Math.min(600, window.innerHeight * 0.6) : 600}
              overscan={2}
              className="space-y-2"
              threshold={5}
              renderItem={(log, index) => {
                const val = ALL_VALUES.find(v => v.id === log.valueId);
                const isGoalAchieved = log.type === 'goal-completion';
                const isCommitment = log.goalText && !isGoalAchieved;
                const goalStatus = isGoalAchieved ? 'Goal Achieved' : isCommitment ? 'Goal Set' : 'Reflection';
                const formattedDate = new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

                return (
                  <details
                    key={log.id}
                    className="group bg-white dark:bg-dark-bg-secondary border border-border-soft dark:border-dark-border rounded-xl overflow-hidden transition-all hover:shadow-md"
                  >
                    <summary className="cursor-pointer list-none">
                      <div className="flex items-center justify-between p-4 sm:p-5 gap-3 sm:gap-4">
                        {/* Date */}
                        <div className="flex-shrink-0 w-24 sm:w-32">
                          <p className="text-xs sm:text-sm font-black text-text-primary dark:text-white">
                            {formattedDate}
                          </p>
                        </div>
                        
                        {/* Value */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-lg sm:text-xl flex-shrink-0" title={log.mood || log.emotionalState}>
                              {log.mood || (log.emotionalState ? EMOTIONAL_STATES.find(e => e.state === log.emotionalState)?.emoji : '✨')}
                            </span>
                            <p className="text-xs sm:text-sm font-black text-text-primary dark:text-white truncate">
                              {val?.name || 'Reflection'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Goal Status */}
                        <div className="flex-shrink-0 flex items-center gap-2">
                          <span className={`text-xs sm:text-sm font-black px-2 sm:px-3 py-1 rounded-full uppercase tracking-widest ${
                            isGoalAchieved 
                              ? 'bg-calm-sage text-white dark:text-white' 
                              : isCommitment 
                              ? 'bg-yellow-warm text-text-primary dark:text-text-primary'
                              : 'bg-bg-tertiary dark:bg-dark-bg-tertiary text-text-secondary dark:text-text-secondary'
                          }`}>
                            {goalStatus}
                          </span>
                          <svg 
                            className="w-4 h-4 text-text-tertiary dark:text-text-tertiary transition-transform group-open:rotate-180 flex-shrink-0" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </summary>
                    
                    {/* Expanded Content */}
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 space-y-4 border-t border-border-soft dark:border-dark-border">
                      {/* Note */}
                      {log.note && (
                        <div>
                          <p className="text-xs sm:text-sm font-black text-text-primary/60 dark:text-white/60 uppercase tracking-widest mb-2">Reflection</p>
                          <p className="text-sm sm:text-base text-text-primary dark:text-white leading-relaxed italic">"{log.note}"</p>
                        </div>
                      )}

                      {/* Deep Reflection */}
                      {log.deepReflection && (
                        <div className="p-3 sm:p-4 bg-yellow-warm/10 dark:bg-yellow-warm/20 rounded-lg border border-yellow-warm/30">
                          <p className="text-xs sm:text-sm font-black text-yellow-warm uppercase tracking-widest mb-2">Deep Reflection</p>
                          <p className="text-xs sm:text-sm text-text-primary/80 dark:text-white/80 leading-relaxed">{log.deepReflection}</p>
                        </div>
                      )}

                      {/* Reflection Analysis */}
                      {log.reflectionAnalysis && (
                        <div className="p-3 sm:p-4 bg-bg-secondary dark:bg-dark-bg-primary/50 rounded-lg border border-border-soft dark:border-dark-border/30">
                          <p className="text-xs sm:text-sm font-black text-text-primary/60 dark:text-white/60 uppercase tracking-widest mb-2">Reflection Analysis</p>
                          <div className="text-xs sm:text-sm text-text-primary/70 dark:text-white/70 leading-relaxed whitespace-pre-line">
                            {log.reflectionAnalysis}
                          </div>
                        </div>
                      )}

                      {/* Goal Text */}
                      {log.goalText && (
                        <div className={`p-3 sm:p-4 rounded-lg border ${
                          isGoalAchieved 
                            ? 'bg-calm-sage/10 dark:bg-calm-sage/20 border-calm-sage/30' 
                            : 'bg-yellow-warm/10 dark:bg-yellow-warm/20 border-yellow-warm/30'
                        }`}>
                          <p className={`text-xs sm:text-sm font-black uppercase tracking-widest mb-2 ${
                            isGoalAchieved ? 'text-calm-sage' : 'text-yellow-warm'
                          }`}>
                            {isGoalAchieved ? 'Accomplished Target' : 'Commitment Target'}
                          </p>
                          <p className={`text-xs sm:text-sm font-bold ${
                            isGoalAchieved 
                              ? 'text-calm-sage dark:text-calm-sage' 
                              : 'text-text-primary dark:text-white'
                          }`}>
                            {log.goalText}
                          </p>
                        </div>
                      )}
                    </div>
                  </details>
                );
              }}
            />
          )}
        </div>
      </div>
      
      <div className="text-center text-xs text-text-primary/50 dark:text-white/50 font-medium">
        Encrypted local storage. Your data remains strictly on your device.
      </div>

    </div>
  );
};

export default VaultControl;
