import React, { Suspense, lazy } from 'react';
import { ValueItem, LogEntry, Goal, LCSWConfig, GoalUpdate } from '../types';
import ValueSelection from '../components/ValueSelection';
import SkeletonCard from '../components/SkeletonCard';
import { isDatabaseInspectorEnabled } from '../constants/environment';

// Code splitting: Lazy load heavy components
const Dashboard = lazy(() => import('../components/Dashboard'));
const ReportView = lazy(() => import('../components/ReportView'));
const VaultControl = lazy(() => import('../components/VaultControl'));
const GoalsUpdateView = lazy(() => import('../components/GoalsUpdateView'));
const Settings = lazy(() => import('../components/Settings'));
const DatabaseInspector = lazy(() => import('../components/DatabaseInspector'));

export type ViewType = 'onboarding' | 'home' | 'report' | 'values' | 'vault' | 'goals' | 'settings' | 'dev';

interface AppRouterProps {
  view: ViewType;
  selectedValueIds: string[];
  selectedValues: ValueItem[];
  logs: LogEntry[];
  goals: Goal[];
  settings: any;
  initialValueIdForGoal: string | null;
  onSelectionComplete: (ids: string[]) => void;
  onLogEntry: (entry: LogEntry) => void;
  onUpdateGoals: (updatedGoals: Goal[]) => void;
  onUpdateGoalProgress: (goalId: string, update: GoalUpdate) => void;
  onUpdateSettings: (settings: any) => void;
  onClearData: () => void;
  onViewChange: (view: ViewType) => void;
  onSetInitialValueIdForGoal: (id: string | null) => void;
  onLogout: () => void;
  onOpenHelp: () => void;
}

export const AppRouter: React.FC<AppRouterProps> = ({
  view,
  selectedValueIds,
  selectedValues,
  logs,
  goals,
  settings,
  initialValueIdForGoal,
  onSelectionComplete,
  onLogEntry,
  onUpdateGoals,
  onUpdateGoalProgress,
  onUpdateSettings,
  onClearData,
  onViewChange,
  onSetInitialValueIdForGoal,
  onLogout,
  onOpenHelp,
}) => {
  return (
    <>
      {view === 'onboarding' && (
        <ValueSelection 
          initialSelected={selectedValueIds} 
          onComplete={onSelectionComplete} 
        />
      )}
      
      {view === 'values' && (
        <ValueSelection 
          initialSelected={selectedValueIds} 
          onComplete={onSelectionComplete} 
          onAddGoal={(valueId) => {
            onSetInitialValueIdForGoal(valueId);
            onViewChange('home');
          }}
          goals={goals}
        />
      )}
      
      {view === 'home' && (
        <Suspense fallback={<SkeletonCard lines={5} showHeader={true} />}>
          <Dashboard 
            values={selectedValues} 
            onLog={onLogEntry}
            goals={goals}
            onUpdateGoals={onUpdateGoals}
            logs={logs}
            lcswConfig={settings.lcswConfig}
            onNavigate={(view) => {
              onViewChange(view);
              if (view !== 'home') {
                onSetInitialValueIdForGoal(null);
              }
            }}
            initialValueId={initialValueIdForGoal}
          />
        </Suspense>
      )}

      {view === 'report' && (
        <Suspense fallback={<SkeletonCard lines={5} showHeader={true} />}>
          <ReportView 
            logs={logs} 
            values={selectedValues} 
            lcswConfig={settings.lcswConfig}
            goals={goals}
          />
        </Suspense>
      )}

      {view === 'vault' && (
        <Suspense fallback={<SkeletonCard lines={5} showHeader={true} />}>
          <VaultControl
            logs={logs}
            goals={goals}
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            onClearData={onClearData}
            selectedValueIds={selectedValueIds}
          />
        </Suspense>
      )}

      {view === 'goals' && (
        <Suspense fallback={<SkeletonCard lines={5} showHeader={true} />}>
          <GoalsUpdateView
            goals={goals}
            values={selectedValues}
            lcswConfig={settings.lcswConfig}
            onUpdateGoal={onUpdateGoalProgress}
            onCompleteGoal={(goal) => {
              const completedGoal = { ...goal, completed: true };
              onLogEntry({
                id: Date.now().toString() + "-done",
                date: new Date().toISOString(),
                valueId: goal.valueId,
                livedIt: true,
                note: `Achieved Commitment: ${goal.text.substring(0, 40)}...`,
                type: 'goal-completion',
                goalText: goal.text
              });
              onUpdateGoals(goals.map(g => g.id === goal.id ? completedGoal : g));
            }}
            onDeleteGoal={(goalId) => onUpdateGoals(goals.filter(g => g.id !== goalId))}
            onEditGoal={(goalId, newText) => onUpdateGoals(goals.map(g => g.id === goalId ? { ...g, text: newText } : g))}
          />
        </Suspense>
      )}

      {view === 'settings' && (
        <Suspense fallback={<SkeletonCard lines={5} showHeader={true} />}>
          <Settings
            onLogout={onLogout}
            onShowHelp={onOpenHelp}
            onClearData={onClearData}
          />
        </Suspense>
      )}

      {isDatabaseInspectorEnabled() && view === 'dev' && (
        <Suspense fallback={<SkeletonCard lines={5} showHeader={true} />}>
          <DatabaseInspector />
        </Suspense>
      )}
    </>
  );
};

