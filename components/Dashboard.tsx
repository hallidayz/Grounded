import React, { useMemo, useState, useEffect } from 'react';
import { ValueItem, LogEntry, Goal, LCSWConfig } from '../types';
import { EMOTIONAL_STATES, getEmotionalState } from '../services/emotionalStates';
import MoodTrendChart from './MoodTrendChart';
import EncourageSection from './EncourageSection';
import ValueCard from './ValueCard';
import GoalsSection from './GoalsSection';
import SkeletonCard from './SkeletonCard';
import CrisisResourcesModal from './CrisisResourcesModal';
import { useDashboard } from '../hooks/useDashboard';

interface DashboardProps {
  values: ValueItem[];
  onLog: (entry: LogEntry) => void;
  goals: Goal[];
  onUpdateGoals: (goals: Goal[]) => void;
  logs: LogEntry[];
  lcswConfig?: LCSWConfig;
  onNavigate?: (view: 'values' | 'report' | 'vault') => void;
  onReset?: () => void;
  initialValueId?: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({ values, onLog, goals, onUpdateGoals, logs, lcswConfig, onNavigate, onReset, initialValueId }) => {
  const dashboard = useDashboard(values, goals, logs, lcswConfig, onLog, onUpdateGoals);
  const [showResourcesModal, setShowResourcesModal] = useState(false);

  // Reset active value card when navigating to home, or set initial value if provided
  useEffect(() => {
    if (initialValueId) {
      dashboard.setActiveValueId(initialValueId);
      // Clear initialValueId after it's been used (by calling a callback if provided)
      // The parent component (App.tsx) should clear it after this effect runs
    } else {
    const handleReset = () => {
      dashboard.setActiveValueId(null);
    };
    // Store reset handler for App.tsx to call
    (window as any).__dashboardReset = handleReset;
    return () => {
      delete (window as any).__dashboardReset;
    };
    }
  }, [initialValueId, dashboard]);

  // Get personalized greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getTimeEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅';
    if (hour < 18) return '☀️';
    return '🌙';
  };

  // Calculate mood trends from logs (last 7 days)
  const moodData = useMemo(() => {
    if (logs.length === 0) return [];
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLogs = logs.filter(log => new Date(log.date) >= sevenDaysAgo);
    
    const stateCounts: Record<string, number> = {};
    recentLogs.forEach(log => {
      if (log.emotionalState) {
        stateCounts[log.emotionalState] = (stateCounts[log.emotionalState] || 0) + 1;
      }
    });
    
    const total = recentLogs.length || 1;
    
    return EMOTIONAL_STATES.map(state => {
      const count = stateCounts[state.state] || 0;
      return {
        state: state.state,
        emoji: state.emoji,
        label: state.shortLabel,
        percentage: Math.round((count / total) * 100),
        color: state.color
      };
    }).filter(mood => mood.percentage > 0).sort((a, b) => b.percentage - a.percentage).slice(0, 4);
  }, [logs]);

  const topValue = values.length > 0 ? values[0] : null;
  const displayMantra = dashboard.valueMantra || dashboard.topValueMantra || "Be Here Now";

  const handleActionClick = (action: 'reflection' | 'values' | 'resources') => {
    if (action === 'reflection') {
      if (values.length > 0) {
        dashboard.setActiveValueId(values[0].id);
      }
    } else if (action === 'values') {
      if (onNavigate) {
        onNavigate('values');
      }
    } else if (action === 'resources') {
      setShowResourcesModal(true);
    }
  };

  const handleOpenFirstValue = () => {
    if (values.length > 0) {
      // Preserve the selected feeling and emotional state when opening reflection
      if (dashboard.lastEncouragedState) {
        dashboard.setEmotionalState(dashboard.lastEncouragedState as any);
      }
      // selectedFeeling is already preserved from the encourage section state
      // Open the first value card for reflection
      dashboard.setActiveValueId(values[0].id);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-20 lg:pb-12">
      {/* Personalized Greeting & Active Focus */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-0">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary dark:text-white">
            {getGreeting()} {getTimeEmoji()}
          </h1>
          <p className="text-text-secondary dark:text-white/70">
            How are you feeling today?
          </p>
        </div>
        <div className="text-left sm:text-right">
          {/* PREV: text-yellow-warm */}
          <p className="text-xs sm:text-sm font-black text-brand dark:text-brand-light uppercase tracking-widest">Active Focus</p>
          <p className="text-sm sm:text-base font-black text-text-primary dark:text-white leading-tight">{values.length} Core Values</p>
        </div>
      </div>

      {/* Today's Focus Section - Moved to top and made compact */}
      {topValue && (
        /* PREV: from-yellow-warm/20 to-yellow-light/20 dark:from-yellow-warm/10 dark:to-yellow-light/10 */
        <div className="bg-gradient-to-br from-brand/10 to-brand-light/10 dark:from-brand/20 dark:to-brand-light/20 rounded-xl sm:rounded-2xl p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <span className="text-xl sm:text-2xl flex-shrink-0">🎯</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm sm:text-base font-semibold text-text-primary dark:text-white truncate">
                    Today's Focus
                  </h3>
                  <span className="text-xs sm:text-sm font-medium text-text-primary dark:text-white truncate">
                    {topValue.name}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-text-secondary dark:text-white/70 italic truncate">
                  "{displayMantra}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div>
          {/* Removed "Compass Engine" heading and "Observe & Document" subtitle */}
        </div>
      </div>

      {/* Encourage Section */}
      <EncourageSection
        encouragementText={dashboard.encouragementText}
        encouragementLoading={dashboard.encouragementLoading}
        lastEncouragedState={dashboard.lastEncouragedState}
        selectedFeeling={dashboard.selectedFeeling}
        lowStateCount={dashboard.lowStateCount}
        lcswConfig={lcswConfig}
        values={values}
        onSelectEmotion={dashboard.handleEmotionalEncourage}
        onActionClick={handleActionClick}
        onResetEncouragement={dashboard.resetEncouragement}
        onOpenFirstValue={handleOpenFirstValue}
      />

      {/* Mood Trends Section */}
      {moodData.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-text-primary dark:text-white">
            📊 Your Week at a Glance
          </h3>
          <MoodTrendChart data={moodData} />
        </div>
      )}

      {/* Recent Reflections Timeline */}
      {logs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-text-primary dark:text-white">
            ✨ Recent Reflections
          </h3>
          
          <div className="space-y-2">
            {logs.slice(0, 3).map((log) => {
              const logDate = new Date(log.date);
              const dateStr = logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const value = values.find(v => v.id === log.valueId);
              const stateConfig = log.emotionalState ? getEmotionalState(log.emotionalState) : null;
              const emoji = stateConfig ? stateConfig.emoji : '📝';
              
              return (
                <div key={log.id} className="bg-white dark:bg-dark-bg-secondary rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-secondary dark:text-white/70">
                      {dateStr}
                    </span>
                    <span className="text-xl">{emoji}</span>
                  </div>
                  <p className="text-text-primary dark:text-white line-clamp-2 text-sm">
                    {log.note || log.deepReflection || 'Reflection entry'}
                  </p>
                  {value && (
                    <p className="text-xs text-text-tertiary dark:text-white/50 mt-1">
                      {value.name}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Value Cards */}
      <div className="grid grid-cols-1 gap-3">
        {values.map((value, index) => {
          const isActive = dashboard.activeValueId === value.id;
          const isSuccess = dashboard.lastLoggedId === value.id;
          const valueGoals = goals.filter(g => g.valueId === value.id && !g.completed);
          const activeValue = values.find(v => v.id === dashboard.activeValueId);

          return (
            <ValueCard
              key={value.id}
              value={value}
              index={index}
              isActive={isActive}
              isSuccess={isSuccess}
              valueGoals={valueGoals}
              emotionalState={dashboard.emotionalState}
              selectedFeeling={dashboard.selectedFeeling}
              showFeelingsList={dashboard.showFeelingsList}
              reflectionText={dashboard.reflectionText}
              goalText={dashboard.goalText}
              goalFreq={dashboard.goalFreq}
              reflectionAnalysis={dashboard.reflectionAnalysis}
              analyzingReflection={dashboard.analyzingReflection}
              coachInsight={dashboard.coachInsight}
              valueMantra={dashboard.valueMantra}
              loading={dashboard.loading}
              aiGoalLoading={dashboard.aiGoalLoading}
              cardRef={(el) => {
                dashboard.valueCardRefs.current[value.id] = el;
              }}
              onToggleActive={() => {
                if (isActive) {
                  // Clean reset when closing
                  dashboard.setEmotionalState('neutral' as any); // Use neutral instead of mixed
                  dashboard.setSelectedFeeling(null);
                  dashboard.setShowFeelingsList(false);
                  dashboard.setActiveValueId(null);
                } else {
                  // Clean reset when opening
                  dashboard.setEmotionalState('neutral' as any);
                  dashboard.setSelectedFeeling(null);
                  dashboard.setShowFeelingsList(false);
                  dashboard.setActiveValueId(value.id);
                }
              }}
              onEmotionalStateChange={(state) => dashboard.setEmotionalState(state as any)}
              onShowFeelingsListToggle={() => dashboard.setShowFeelingsList(!dashboard.showFeelingsList)}
              onSelectedFeelingChange={(feeling) => dashboard.setSelectedFeeling(feeling)}
              onReflectionTextChange={(text) => dashboard.setReflectionText(text)}
              onGoalTextChange={(text) => dashboard.setGoalText(text)}
              onGoalFreqChange={(freq) => dashboard.setGoalFreq(freq)}
              onSuggestGoal={() => activeValue && dashboard.handleSuggestGoal(activeValue)}
              onCompleteGoal={dashboard.handleCompleteGoal}
              onCommit={() => dashboard.handleCommit(value.id)}
              getReflectionPlaceholder={dashboard.getReflectionPlaceholder}
              onTriggerReflectionAnalysis={dashboard.triggerReflectionAnalysis}
              lcswConfig={lcswConfig}
              onNavigateToHome={() => {
                // Navigate to home and open this value card
                onNavigate?.('home');
                dashboard.setActiveValueId(value.id);
              }}
            />
          );
        })}
      </div>

      {/* Goals Section */}
      <GoalsSection
        goals={goals}
        values={values}
        onCompleteGoal={dashboard.handleCompleteGoal}
        onDeleteGoal={dashboard.handleDeleteGoal}
      />

      {/* Crisis Resources Modal */}
      {showResourcesModal && (
        <CrisisResourcesModal
          onClose={() => setShowResourcesModal(false)}
          lcswConfig={lcswConfig}
        />
      )}
    </div>
  );
};

export default React.memo(Dashboard);
