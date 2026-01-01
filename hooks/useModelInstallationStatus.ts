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

    // Poll model download progress every 30 seconds
    // This ensures we get accurate progress even if progress updates are missed
    const checkInterval = setInterval(() => {
      const downloadProgress = getModelDownloadProgress();
      const modelsLoaded = areModelsLoaded();
      const isLoading = getIsModelLoading();
      
      if (modelsLoaded || downloadProgress.status === 'complete') {
        setStatus('complete');
        setProgress(100);
        setLabel('Complete');
      } else if (isLoading || downloadProgress.status === 'downloading') {
        setStatus('in-progress');
        setProgress(downloadProgress.progress);
        setLabel(downloadProgress.label || 'In Progress');
      } else if (downloadProgress.status === 'error') {
        setStatus('error');
        setProgress(downloadProgress.progress);
        setLabel(downloadProgress.label || 'Error');
      } else if (downloadProgress.status === 'idle' && isLoading) {
        // Models are loading but no progress yet - show in progress
        setStatus('in-progress');
        setProgress(0);
        setLabel('Starting download...');
      }
    }, 30000); // Update every 30 seconds

    return () => {
      unsubscribe();
      clearInterval(checkInterval);
    };
  }, [status]);

  return { status, progress, label };
}

