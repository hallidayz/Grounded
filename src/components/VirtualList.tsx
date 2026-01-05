/**
 * VIRTUAL LIST COMPONENT
 * 
 * Efficiently renders long lists by only rendering visible items.
 * Uses windowing technique to improve performance for large datasets.
 * Optimized with will-change and transform for smooth scrolling.
 */

import React, { useState, useRef, useMemo, useCallback } from 'react';

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  threshold?: number; // Minimum items before enabling virtualization
}

/**
 * Virtual list component for efficient rendering of long lists
 * Optimized with CSS will-change and transform for smooth 60fps scrolling
 * 
 * @example
 * ```tsx
 * <VirtualList
 *   items={logs}
 *   itemHeight={80}
 *   containerHeight={400}
 *   renderItem={(log, index) => (
 *     <LogCard key={log.id} log={log} />
 *   )}
 * />
 * ```
 */
function VirtualList<T extends { id?: string }>({
  items,
  renderItem,
  itemHeight = 80,
  containerHeight = 400,
  overscan = 3,
  className = '',
  onScroll,
  threshold = 10, // Only virtualize if more than 10 items
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Only virtualize if we have enough items
  const shouldVirtualize = items.length > threshold;

  // Calculate visible range
  const { startIndex, endIndex, totalHeight, offsetY } = useMemo(() => {
    if (!shouldVirtualize) {
      return {
        startIndex: 0,
        endIndex: items.length - 1,
        totalHeight: items.length * itemHeight,
        offsetY: 0,
      };
    }

    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      startIndex + visibleCount + overscan * 2
    );
    
    const totalHeight = items.length * itemHeight;
    const offsetY = startIndex * itemHeight;

    return { startIndex, endIndex, totalHeight, offsetY };
  }, [scrollTop, items.length, itemHeight, containerHeight, overscan, shouldVirtualize]);

  // Visible items
  const visibleItems = useMemo(() => {
    if (!shouldVirtualize) {
      return items.map((item, index) => ({ item, index }));
    }
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, startIndex, endIndex, shouldVirtualize]);

  // Optimized scroll handler with requestAnimationFrame for smooth 60fps
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    
    // Use requestAnimationFrame for immediate visual updates
    requestAnimationFrame(() => {
      setScrollTop(newScrollTop);
    });
    
    // Throttle onScroll callback
    if (onScroll) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        onScroll(newScrollTop);
      }, 16); // ~60fps
    }
  }, [onScroll]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // If not virtualizing, render normally
  if (!shouldVirtualize) {
    return (
      <div
        ref={containerRef}
        className={`overflow-auto ${className}`}
        style={{ 
          height: containerHeight,
          willChange: 'scroll-position',
        }}
        onScroll={handleScroll}
      >
        {visibleItems.map(({ item, index }) => (
          <div key={item.id || index}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ 
        height: containerHeight,
        willChange: 'scroll-position',
        // Optimize scrolling performance
        WebkitOverflowScrolling: 'touch',
      }}
      onScroll={handleScroll}
    >
      {/* Spacer div to maintain scroll height */}
      <div
        style={{
          height: totalHeight,
          position: 'relative',
          willChange: 'contents',
        }}
      >
        {/* Transform container - optimized with will-change and GPU acceleration */}
        <div
          style={{
            transform: `translate3d(0, ${offsetY}px, 0)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            willChange: 'transform',
            // Force GPU acceleration for smooth scrolling
            backfaceVisibility: 'hidden',
            perspective: 1000,
            // Additional performance optimizations
            transformOrigin: 'top left',
            // Prevent layout thrashing
            contain: 'layout style paint',
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div
              key={item.id || index}
              style={{
                height: itemHeight,
                willChange: 'auto',
                // Optimize item rendering
                contain: 'layout style',
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default React.memo(VirtualList);

