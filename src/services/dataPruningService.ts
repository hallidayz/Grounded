/**
 * Data Pruning Service
 * 
 * Removes old data to maintain database performance and comply with data retention policies.
 * Prunes feelingLogs and userInteractions older than 12 months.
 * 
 * HIPAA Compliance: This service respects data retention requirements while ensuring
 * that old PHI data is properly removed from both encrypted and unencrypted storage.
 */

import { getDatabaseAdapter } from './databaseAdapter';
import { isDataPruningEnabled } from '../constants/environment';

/**
 * Retention period in milliseconds (12 months)
 */
const RETENTION_PERIOD_MS = 12 * 30 * 24 * 60 * 60 * 1000; // 12 months

/**
 * Calculate the cutoff date for data retention
 * Data older than this date will be pruned
 */
function getRetentionCutoffDate(): Date {
  const now = Date.now();
  return new Date(now - RETENTION_PERIOD_MS);
}

/**
 * Prune feeling logs older than 12 months
 */
async function pruneFeelingLogs(userId?: string): Promise<number> {
  const adapter = getDatabaseAdapter();
  const cutoffDate = getRetentionCutoffDate();
  const cutoffTimestamp = cutoffDate.toISOString();
  
  let prunedCount = 0;
  
  try {
    // Get all feeling logs
    const allLogs = await adapter.getFeelingLogs(undefined, userId);
    
    // Filter logs older than retention period
    const logsToDelete = allLogs.filter((log: any) => {
      const logTimestamp = log.timestamp || log.created_at || log.createdAt;
      if (!logTimestamp) return false;
      
      // Compare timestamps
      const logDate = new Date(logTimestamp);
      return logDate < cutoffDate;
    });
    
    console.log(`[DataPruning] Found ${logsToDelete.length} feeling logs to prune (older than ${cutoffDate.toISOString()})`);
    
    // Delete old logs using adapter's delete method
    for (const log of logsToDelete) {
      try {
        await adapter.deleteFeelingLog(log.id);
        prunedCount++;
      } catch (error) {
        console.warn(`[DataPruning] Failed to delete feeling log ${log.id}:`, error);
        // Continue with other logs even if one fails
      }
    }
    
  } catch (error) {
    console.error('[DataPruning] Error pruning feeling logs:', error);
    throw error;
  }
  
  return prunedCount;
}

/**
 * Prune user interactions older than 12 months
 */
async function pruneUserInteractions(userId?: string): Promise<number> {
  const adapter = getDatabaseAdapter();
  const cutoffDate = getRetentionCutoffDate();
  
  let prunedCount = 0;
  
  try {
    // Get all user interactions
    const allInteractions = await adapter.getUserInteractions(undefined, undefined);
    
    // Filter interactions older than retention period
    const interactionsToDelete = allInteractions.filter((interaction: any) => {
      const interactionTimestamp = interaction.timestamp || interaction.created_at || interaction.createdAt;
      if (!interactionTimestamp) return false;
      
      const interactionDate = new Date(interactionTimestamp);
      return interactionDate < cutoffDate;
    });
    
    console.log(`[DataPruning] Found ${interactionsToDelete.length} user interactions to prune (older than ${cutoffDate.toISOString()})`);
    
    // Delete old interactions using adapter's delete method
    for (const interaction of interactionsToDelete) {
      try {
        await adapter.deleteUserInteraction(interaction.id);
        prunedCount++;
      } catch (error) {
        console.warn(`[DataPruning] Failed to delete user interaction ${interaction.id}:`, error);
        // Continue with other interactions even if one fails
      }
    }
    
  } catch (error) {
    console.error('[DataPruning] Error pruning user interactions:', error);
    throw error;
  }
  
  return prunedCount;
}

/**
 * Pruning result summary
 */
export interface PruningResult {
  success: boolean;
  feelingLogsPruned: number;
  userInteractionsPruned: number;
  totalPruned: number;
  errors: string[];
  timestamp: string;
}

/**
 * Run data pruning for all data types
 * 
 * @param userId Optional user ID to prune data for a specific user
 * @returns Pruning result with counts and errors
 */
export async function runDataPruning(userId?: string): Promise<PruningResult> {
  // Check if pruning is enabled
  if (!isDataPruningEnabled()) {
    console.log('[DataPruning] Data pruning is disabled (development mode or disabled via flag)');
    return {
      success: true,
      feelingLogsPruned: 0,
      userInteractionsPruned: 0,
      totalPruned: 0,
      errors: [],
      timestamp: new Date().toISOString(),
    };
  }
  
  const result: PruningResult = {
    success: false,
    feelingLogsPruned: 0,
    userInteractionsPruned: 0,
    totalPruned: 0,
    errors: [],
    timestamp: new Date().toISOString(),
  };
  
  try {
    console.log('[DataPruning] Starting data pruning...', {
      userId: userId || 'all users',
      retentionPeriod: '12 months',
      cutoffDate: getRetentionCutoffDate().toISOString(),
    });
    
    // Prune feeling logs
    try {
      result.feelingLogsPruned = await pruneFeelingLogs(userId);
    } catch (error) {
      const errorMsg = `Failed to prune feeling logs: ${error instanceof Error ? error.message : String(error)}`;
      result.errors.push(errorMsg);
      console.error('[DataPruning]', errorMsg);
    }
    
    // Prune user interactions
    try {
      result.userInteractionsPruned = await pruneUserInteractions(userId);
    } catch (error) {
      const errorMsg = `Failed to prune user interactions: ${error instanceof Error ? error.message : String(error)}`;
      result.errors.push(errorMsg);
      console.error('[DataPruning]', errorMsg);
    }
    
    result.totalPruned = result.feelingLogsPruned + result.userInteractionsPruned;
    result.success = result.errors.length === 0;
    
    console.log('[DataPruning] Pruning completed:', {
      success: result.success,
      feelingLogsPruned: result.feelingLogsPruned,
      userInteractionsPruned: result.userInteractionsPruned,
      totalPruned: result.totalPruned,
      errors: result.errors.length,
    });
    
  } catch (error) {
    const errorMsg = `Data pruning failed: ${error instanceof Error ? error.message : String(error)}`;
    result.errors.push(errorMsg);
    console.error('[DataPruning]', errorMsg);
  }
  
  return result;
}

/**
 * Schedule data pruning to run weekly
 * Uses setInterval to run pruning every 7 days
 * 
 * @param userId Optional user ID to prune data for a specific user
 * @returns Interval ID that can be used to clear the interval
 */
export function scheduleWeeklyPruning(userId?: string): NodeJS.Timeout {
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  
  // Run immediately on first call
  runDataPruning(userId).catch((error) => {
    console.error('[DataPruning] Scheduled pruning failed:', error);
  });
  
  // Then schedule weekly
  const intervalId = setInterval(() => {
    runDataPruning(userId).catch((error) => {
      console.error('[DataPruning] Scheduled pruning failed:', error);
    });
  }, ONE_WEEK_MS);
  
  console.log('[DataPruning] Weekly pruning scheduled', {
    userId: userId || 'all users',
    interval: '7 days',
  });
  
  return intervalId;
}

/**
 * Get the retention cutoff date (for display/debugging)
 */
export function getRetentionCutoff(): Date {
  return getRetentionCutoffDate();
}

