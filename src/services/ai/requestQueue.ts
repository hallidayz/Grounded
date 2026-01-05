/**
 * AI Request Queue Service
 * 
 * Manages AI request queuing, debouncing, and deduplication
 * to prevent redundant concurrent requests and improve performance.
 */

interface QueuedRequest {
  id: string;
  key: string;
  promise: Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
}

class RequestQueue {
  private queue: Map<string, QueuedRequest> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly DEBOUNCE_MS = 500;

  /**
   * Debounce a function call
   */
  debounce<T extends (...args: any[]) => any>(
    key: string,
    fn: T,
    ...args: Parameters<T>
  ): Promise<ReturnType<T>> {
    return new Promise((resolve, reject) => {
      // Clear existing timer
      const existingTimer = this.debounceTimers.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Check if there's already a pending request
      const existingRequest = this.queue.get(key);
      if (existingRequest) {
        // Return the existing promise
        existingRequest.promise.then(resolve).catch(reject);
        return;
      }

      // Create new debounced request
      const timer = setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.debounceTimers.delete(key);
          this.queue.delete(key);
        }
      }, this.DEBOUNCE_MS);

      this.debounceTimers.set(key, timer);
    });
  }

  /**
   * Queue a request with deduplication
   * If a request with the same key is already pending, return the existing promise
   */
  queueRequest<T>(
    key: string,
    fn: () => Promise<T>
  ): Promise<T> {
    // Check if request already exists
    const existing = this.queue.get(key);
    if (existing) {
      console.log(`🔄 Reusing existing request for key: ${key}`);
      return existing.promise as Promise<T>;
    }

    // Create new request
    let resolve: (value: T) => void;
    let reject: (error: any) => void;
    
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    const request: QueuedRequest = {
      id: `${key}_${Date.now()}`,
      key,
      promise: promise as Promise<any>,
      resolve: resolve!,
      reject: reject!,
      timestamp: Date.now(),
    };

    this.queue.set(key, request);

    // Execute the function
    fn()
      .then((result) => {
        request.resolve(result);
        this.queue.delete(key);
      })
      .catch((error) => {
        request.reject(error);
        this.queue.delete(key);
      });

    return promise;
  }

  /**
   * Check if a request is pending
   */
  isPending(key: string): boolean {
    return this.queue.has(key) || this.debounceTimers.has(key);
  }

  /**
   * Cancel a pending request
   */
  cancel(key: string): void {
    const timer = this.debounceTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(key);
    }

    const request = this.queue.get(key);
    if (request) {
      request.reject(new Error('Request cancelled'));
      this.queue.delete(key);
    }
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    // Clear all timers
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();

    // Reject all pending requests
    this.queue.forEach((request) => {
      request.reject(new Error('Queue cleared'));
    });
    this.queue.clear();
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.size;
  }
}

// Singleton instance
export const requestQueue = new RequestQueue();

/**
 * Debounce wrapper for AI functions
 */
export function debounceAIRequest<T extends (...args: any[]) => Promise<any>>(
  keyGenerator: (...args: Parameters<T>) => string,
  fn: T
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    return requestQueue.debounce(key, fn, ...args);
  }) as T;
}

/**
 * Queue wrapper for AI functions with deduplication
 */
export function queueAIRequest<T extends (...args: any[]) => Promise<any>>(
  keyGenerator: (...args: Parameters<T>) => string,
  fn: T
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    return requestQueue.queueRequest(key, () => fn(...args));
  }) as T;
}

