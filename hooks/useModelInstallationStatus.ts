import { useState, useEffect } from 'react';
import { subscribeToProgress, getCurrentProgress } from '../services/progressTracker';
import { areModelsLoaded, getIsModelLoading, getModelDownloadProgress } from '../services/ai/models';

export type InstallationStatus = 'idle' | 'in-progress' | 'complete' | 'error';

export function useModelInstallationStatus() {
  const [status, setStatus] = useState<InstallationStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState('');

  useEffect(() => {
    // Check initial state with priority: loaded > loading > error
    const downloadProgress = getModelDownloadProgress();
    const modelsLoaded = areModelsLoaded();
    const isLoading = getIsModelLoading();

    // PRIORITY 1: Models are actually loaded (most reliable)
    if (modelsLoaded) {
      setStatus('complete');
      setProgress(100);
      setLabel('Complete');
    } 
    // PRIORITY 2: Models are currently loading (don't show error)
    else if (isLoading || downloadProgress.status === 'downloading' || downloadProgress.status === 'idle') {
      setStatus('in-progress');
      setProgress(downloadProgress.progress);
      setLabel(downloadProgress.label || 'In Progress');
    } 
    // PRIORITY 3: Only show error if models are NOT loaded AND NOT loading
    else if (downloadProgress.status === 'error' && !isLoading && !modelsLoaded) {
      setStatus('error');
      setProgress(downloadProgress.progress);
      setLabel(downloadProgress.label || 'Error');
    } 
    // PRIORITY 4: Download complete but models not verified yet
    else if (downloadProgress.status === 'complete' && !modelsLoaded) {
      setStatus('in-progress');
      setProgress(100);
      setLabel('Verifying models...');
    }
    else {
      setStatus('idle');
      setProgress(0);
      setLabel('');
    }

    // Subscribe to progress updates
    const unsubscribe = subscribeToProgress((state) => {
      // Always check actual model state first - don't trust progress tracker alone
      const modelsLoaded = areModelsLoaded();
      const isLoading = getIsModelLoading();
      
      if (modelsLoaded || state.status === 'success') {
        setStatus('complete');
        setProgress(100);
        setLabel('Complete');
      } else if (isLoading || state.status === 'loading') {
        // Don't show error if models are actively loading
        setStatus('in-progress');
        setProgress(state.progress);
        setLabel(state.label || 'In Progress');
      } else if (state.status === 'error' && !isLoading && !modelsLoaded) {
        // Only show error if models truly failed (not loaded and not loading)
        setStatus('error');
        setProgress(state.progress);
        setLabel(state.label || 'Error');
      }
    });

    // Poll model download progress every 2 seconds for real-time updates
    // This ensures we get accurate progress even if progress updates are missed
    const checkInterval = setInterval(() => {
      const downloadProgress = getModelDownloadProgress();
      const modelsLoaded = areModelsLoaded();
      const isLoading = getIsModelLoading();
      const currentProgress = getCurrentProgress();
      
      // PRIORITY 1: Check if models are actually loaded (most reliable indicator)
      if (modelsLoaded) {
        setStatus('complete');
        setProgress(100);
        setLabel('Complete');
        return; // Don't check anything else if models are loaded
      }
      
      // PRIORITY 2: Check if models are currently loading (don't show error while loading)
      if (isLoading || downloadProgress.status === 'downloading') {
        setStatus('in-progress');
        // Use the highest progress value available
        const progressValue = Math.max(
          downloadProgress.progress || 0,
          currentProgress.progress || 0
        );
        setProgress(progressValue);
        setLabel(downloadProgress.label || currentProgress.label || 'Loading...');
        return; // Don't show error if actively loading
      }
      
      // PRIORITY 3: Only show error if models are NOT loaded AND NOT loading AND status is error
      // This prevents false error states when models are still downloading
      if (downloadProgress.status === 'error' && !isLoading && !modelsLoaded) {
        setStatus('error');
        setProgress(downloadProgress.progress);
        setLabel(downloadProgress.label || 'Error');
      } else if (downloadProgress.status === 'idle' && isLoading) {
        // Models are loading but no progress yet - show in progress
        setStatus('in-progress');
        setProgress(currentProgress.progress || 0);
        setLabel(currentProgress.label || 'Starting download...');
      } else if (downloadProgress.status === 'complete') {
        // Download complete but models not verified yet - show in progress
        setStatus('in-progress');
        setProgress(100);
        setLabel('Verifying models...');
      }
    }, 2000); // Update every 2 seconds for real-time progress

    return () => {
      unsubscribe();
      clearInterval(checkInterval);
    };
  }, [status]);

  // Determine display text based on status
  let displayText = '';
  if (status === 'complete') {
    displayText = 'AI Ready';
  } else if (status === 'in-progress') {
    displayText = progress > 0 ? `AI Loading ${progress}%` : 'AI Loading...';
  } else if (status === 'error') {
    displayText = 'Rules Only';
  } else {
    // idle - check if models are actually loaded
    const modelsLoaded = areModelsLoaded();
    const isLoading = getIsModelLoading();
    if (modelsLoaded) {
      displayText = 'AI Ready';
    } else if (isLoading) {
      displayText = progress > 0 ? `AI Loading ${progress}%` : 'AI Loading...';
    } else {
      displayText = 'Rules Only';
    }
  }

  return { status, progress, label, displayText };
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

