import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
// Assuming MoodChart is a component you have or will create
// import MoodChart from './MoodChart'; 

const Dashboard: React.FC = () => {
  const {
    authState,
    activeValueId,
    goals,
    reflections,
    loadingReflections,
    aiSummary,
    loadingAiSummary,
    loadReflections,
    latestReflection,
    triggerReflectionAnalysis,
    setActiveValueId,
  } = useDashboard();

  // Memoize components or expensive JSX fragments if needed
  const MemoizedMoodChart = React.useMemo(() => {
    // Assuming MoodChart takes `data` and is itself memoized
    // const moods = reflections.map(r => r.mood);
    // return <MoodChart data={moods} />;
    return <div>Mood Chart Placeholder</div>; // Placeholder for MoodChart
  }, [reflections]); // Re-render MoodChart only if reflections change

  return (
    <div className="dashboard p-4">
      <h1 className="text-2xl font-bold mb-4">Your Dashboard</h1>

      <div className="mb-4">
        <p>Auth State: {authState}</p>
        <p>Active Value ID: {activeValueId}</p>
        <p>Goals: {goals.length}</p>
      </div>

      <h2 className="text-xl font-semibold mb-2">Your Reflections</h2>
      <button
        onClick={loadReflections}
        disabled={loadingReflections}
        className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
      >
        {loadingReflections ? 'Loading Reflections...' : 'Load Reflections'}
      </button>

      {latestReflection && (
        <div className="mt-4">
          <h3 className="text-lg font-medium">Latest Reflection:</h3>
          <p className="text-gray-700">{latestReflection.mood} - {latestReflection.createdAt.toDateString()}</p>
          <button
            onClick={() => triggerReflectionAnalysis(latestReflection.reflection || '')}
            className="mt-2 bg-green-500 text-white px-4 py-2 rounded-md"
          >
            Analyze Latest
          </button>
        </div>
      )}

      <div className="mt-8">
        {MemoizedMoodChart}
      </div>

      {/* Example of how you might set an active value or create a goal */}
      <div className="mt-8">
        <button 
          onClick={() => setActiveValueId('some-value-id')} 
          className="bg-purple-500 text-white px-4 py-2 rounded-md"
        >
          Set Active Value
        </button>
        {/* Add more UI for goal creation, value selection, etc. */}
      </div>
    </div>
  );
};

export default React.memo(Dashboard);

