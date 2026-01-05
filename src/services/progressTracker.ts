/**
 * Progress Tracker Service
 * Centralized progress tracking for various operations (model loading, downloads, etc.)
 */

export type ProgressStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ProgressState {
  progress: number; // 0-100
  status: ProgressStatus;
  label: string;
  details?: string;
}

type ProgressCallback = (state: ProgressState) => void;

let currentProgress: ProgressState = {
  progress: 0,
  status: 'idle',
  label: '',
};

const callbacks: Set<ProgressCallback> = new Set();

/**
 * Subscribe to progress updates
 */
export function subscribeToProgress(callback: ProgressCallback): () => void {
  callbacks.add(callback);
  // Immediately call with current state
  callback(currentProgress);
  
  // Return unsubscribe function
  return () => {
    callbacks.delete(callback);
  };
}

/**
 * Update progress
 */
function notifyProgress(state: ProgressState) {
  currentProgress = state;
  callbacks.forEach(callback => {
    try {
      callback(state);
    } catch (error) {
      console.error('Progress callback error:', error);
    }
  });
}

/**
 * Set progress for model loading
 */
export function setModelLoadingProgress(progress: number, label: string, details?: string) {
  notifyProgress({
    progress: Math.max(0, Math.min(100, progress)),
    status: 'loading',
    label,
    details,
  });
}

/**
 * Set progress to success
 */
export function setProgressSuccess(label: string = 'Complete', details?: string) {
  notifyProgress({
    progress: 100,
    status: 'success',
    label,
    details,
  });
}

/**
 * Set progress to error
 */
export function setProgressError(label: string = 'Error', details?: string) {
  notifyProgress({
    progress: currentProgress.progress, // Keep current progress
    status: 'error',
    label,
    details,
  });
}

/**
 * Reset progress
 */
export function resetProgress() {
  notifyProgress({
    progress: 0,
    status: 'idle',
    label: '',
  });
}

/**
 * Get current progress state
 */
export function getCurrentProgress(): ProgressState {
  return { ...currentProgress };
}

