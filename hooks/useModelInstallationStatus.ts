import { useState, useEffect } from 'react';
import { subscribeToProgress, getCurrentProgress } from '../services/progressTracker';
import { areModelsLoaded, getIsModelLoading } from '../services/ai/models';

export type InstallationStatus = 'idle' | 'in-progress' | 'complete' | 'error';

export function useModelInstallationStatus() {
  const [status, setStatus] = useState<InstallationStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState('');

  useEffect(() => {
    // Check initial state
    const currentProgress = getCurrentProgress();
    const modelsLoaded = areModelsLoaded();
    const isLoading = getIsModelLoading();

    if (modelsLoaded) {
      setStatus('complete');
      setProgress(100);
      setLabel('Complete');
    } else if (isLoading || currentProgress.status === 'loading') {
      setStatus('in-progress');
      setProgress(currentProgress.progress);
      setLabel(currentProgress.label || 'In Progress');
    } else {
      setStatus('idle');
    }

    // Subscribe to progress updates
    const unsubscribe = subscribeToProgress((state) => {
      if (state.status === 'success') {
        setStatus('complete');
        setProgress(100);
        setLabel('Complete');
      } else if (state.status === 'error') {
        setStatus('error');
        setLabel(state.label || 'Error');
      } else if (state.status === 'loading') {
        setStatus('in-progress');
        setProgress(state.progress);
        setLabel(state.label || 'In Progress');
      }
    });

    // Also check model loading state periodically
    const checkInterval = setInterval(() => {
      const modelsLoaded = areModelsLoaded();
      const isLoading = getIsModelLoading();
      
      if (modelsLoaded && status !== 'complete') {
        setStatus('complete');
        setProgress(100);
        setLabel('Complete');
      } else if (isLoading && status === 'idle') {
        setStatus('in-progress');
        setLabel('In Progress');
      }
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(checkInterval);
    };
  }, [status]);

  return { status, progress, label };
}

