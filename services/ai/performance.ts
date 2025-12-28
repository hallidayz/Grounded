/**
 * AI Performance Monitoring Service
 * 
 * Tracks AI call performance, cache hit rates, and identifies bottlenecks
 */

interface PerformanceMetric {
  functionName: string;
  duration: number;
  timestamp: number;
  cacheHit: boolean;
  success: boolean;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 100; // Keep last 100 metrics
  private cacheHits = 0;
  private cacheMisses = 0;
  private slowRequests: PerformanceMetric[] = [];
  private readonly SLOW_THRESHOLD_MS = 2000; // 2 seconds

  /**
   * Record a performance metric
   */
  recordMetric(
    functionName: string,
    duration: number,
    cacheHit: boolean = false,
    success: boolean = true
  ): void {
    const metric: PerformanceMetric = {
      functionName,
      duration,
      timestamp: Date.now(),
      cacheHit,
      success,
    };

    this.metrics.push(metric);
    
    // Keep only last MAX_METRICS
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    // Track cache statistics
    if (cacheHit) {
      this.cacheHits++;
    } else {
      this.cacheMisses++;
    }

    // Track slow requests
    if (duration > this.SLOW_THRESHOLD_MS) {
      this.slowRequests.push(metric);
      // Keep only last 20 slow requests
      if (this.slowRequests.length > 20) {
        this.slowRequests.shift();
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ Slow AI request: ${functionName} took ${duration}ms`);
      }
    }
  }

  /**
   * Get cache hit rate (0-1)
   */
  getCacheHitRate(): number {
    const total = this.cacheHits + this.cacheMisses;
    if (total === 0) return 0;
    return this.cacheHits / total;
  }

  /**
   * Get average duration for a function
   */
  getAverageDuration(functionName: string): number {
    const functionMetrics = this.metrics.filter(m => m.functionName === functionName);
    if (functionMetrics.length === 0) return 0;
    
    const sum = functionMetrics.reduce((acc, m) => acc + m.duration, 0);
    return sum / functionMetrics.length;
  }

  /**
   * Get slow requests
   */
  getSlowRequests(): PerformanceMetric[] {
    return [...this.slowRequests];
  }

  /**
   * Get performance summary
   */
  getSummary(): {
    totalRequests: number;
    cacheHitRate: number;
    averageDuration: number;
    slowRequests: number;
  } {
    const totalRequests = this.metrics.length;
    const cacheHitRate = this.getCacheHitRate();
    const averageDuration = totalRequests > 0
      ? this.metrics.reduce((acc, m) => acc + m.duration, 0) / totalRequests
      : 0;
    const slowRequests = this.slowRequests.length;

    return {
      totalRequests,
      cacheHitRate,
      averageDuration,
      slowRequests,
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.slowRequests = [];
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance tracking wrapper for AI functions
 */
export function trackPerformance<T extends (...args: any[]) => Promise<any>>(
  functionName: string,
  fn: T,
  checkCache?: () => boolean
): T {
  return ((...args: Parameters<T>) => {
    const startTime = performance.now();
    const cacheHit = checkCache ? checkCache() : false;
    
    return fn(...args)
      .then((result) => {
        const duration = performance.now() - startTime;
        performanceMonitor.recordMetric(functionName, duration, cacheHit, true);
        return result;
      })
      .catch((error) => {
        const duration = performance.now() - startTime;
        performanceMonitor.recordMetric(functionName, duration, cacheHit, false);
        throw error;
      });
  }) as T;
}

