import { useState, useEffect } from 'react';
import { subscribeToProgress, getCurrentProgress } from '../services/progressTracker';
import { areModelsLoaded, getIsModelLoading, getModelDownloadProgress } from '../services/ai/models';

export type InstallationStatus = 'idle' | 'in-progress' | 'complete' | 'error';

export function useModelInstallationStatus() {
  const [status, setStatus] = useState<InstallationStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState('');

  useEffect(() => {
    // Check initial state
    const downloadProgress = getModelDownloadProgress();
    const modelsLoaded = areModelsLoaded();
    const isLoading = getIsModelLoading();

    if (modelsLoaded || downloadProgress.status === 'complete') {
      setStatus('complete');
      setProgress(100);
      setLabel('Complete');
    } else if (isLoading || downloadProgress.status === 'downloading' || downloadProgress.status === 'idle') {
      setStatus('in-progress');
      setProgress(downloadProgress.progress);
      setLabel(downloadProgress.label || 'In Progress');
    } else if (downloadProgress.status === 'error') {
      setStatus('error');
      setProgress(downloadProgress.progress);
      setLabel(downloadProgress.label || 'Error');
    } else {
      setStatus('idle');
      setProgress(0);
      setLabel('');
    }

    // Subscribe to progress updates
    const unsubscribe = subscribeToProgress((state) => {
      if (state.status === 'success') {
        setStatus('complete');
        setProgress(100);
        setLabel('Complete');
      } else if (state.status === 'error') {
        setStatus('error');
        setProgress(state.progress);
        setLabel(state.label || 'Error');
      } else if (state.status === 'loading') {
        setStatus('in-progress');
        setProgress(state.progress);
        setLabel(state.label || 'In Progress');
      }
    });

    // Poll model download progress every 2 seconds for real-time updates
    // This ensures we get accurate progress even if progress updates are missed
    const checkInterval = setInterval(() => {
      const downloadProgress = getModelDownloadProgress();
      const modelsLoaded = areModelsLoaded();
      const isLoading = getIsModelLoading();
      const currentProgress = getCurrentProgress();
      
      if (modelsLoaded || downloadProgress.status === 'complete') {
        setStatus('complete');
        setProgress(100);
        setLabel('Complete');
      } else if (isLoading || downloadProgress.status === 'downloading') {
        setStatus('in-progress');
        // Use the highest progress value available
        const progressValue = Math.max(
          downloadProgress.progress || 0,
          currentProgress.progress || 0
        );
        setProgress(progressValue);
        setLabel(downloadProgress.label || currentProgress.label || 'Loading...');
      } else if (downloadProgress.status === 'error') {
        setStatus('error');
        setProgress(downloadProgress.progress);
        setLabel(downloadProgress.label || 'Error');
      } else if (downloadProgress.status === 'idle' && isLoading) {
        // Models are loading but no progress yet - show in progress
        setStatus('in-progress');
        setProgress(currentProgress.progress || 0);
        setLabel(currentProgress.label || 'Starting download...');
      }
    }, 2000); // Update every 2 seconds for real-time progress

    return () => {
      unsubscribe();
      clearInterval(checkInterval);
    };
  }, [status]);

  return { status, progress, label };
}

/**
 * Get formatted progress text with percentage
 */
export function getProgressText(progress: number, label: string): string {
  if (progress > 0 && progress < 100) {
    return `${label} (${progress}%)`;
  } else if (progress === 100) {
    return 'Complete';
  }
  return label;
}

