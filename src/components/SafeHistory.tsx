/**
 * Safe History View
 *
 * Gentle visualization of past moments using dots.
 * No graphs, scores, or progress percentages.
 * Just dots user came back.
 showing days the */

import React, { useMemo } from 'react';
import { COPY } from '../utils/copyLibrary';

interface MomentData {
  id: string;
  energy: '10s' | '2min' | '5min';
  timestamp: Date;
  mood?: string;
}

interface SafeHistoryProps {
  moments: MomentData[];
  onClearAll?: () => void;
  onDeleteMoment?: (id: string) => void;
}

const SafeHistory: React.FC<SafeHistoryProps> = ({
  moments,
  onClearAll,
  onDeleteMoment,
}) => {
  // Group moments by date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, MomentData[]> = {};

    moments.forEach((moment) => {
      const dateKey = moment.timestamp.toISOString().split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(moment);
    });

    return groups;
  }, [moments]);

  // Get unique days count
  const uniqueDays = Object.keys(groupedByDate).length;

  // Sort dates (most recent first)
  const sortedDates = useMemo(() => {
    return Object.keys(groupedByDate).sort((a, b) =>
      new Date(b).getTime() - new Date(a).getTime()
    );
  }, [groupedByDate]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  if (moments.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-4xl mb-4">🌱</div>
        <p className="text-text-secondary dark:text-white/70 mb-4">
          {COPY.history.empty}
        </p>
        <p className="text-sm text-text-tertiary dark:text-white/50">
          Your first moment is waiting when you're ready.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-text-primary dark:text-white">
          {COPY.history.header(uniqueDays)}
        </p>
        <p className="text-sm text-text-secondary dark:text-white/60 italic mt-2">
          {COPY.history.footer}
        </p>
      </div>

      {/* Dots Visualization */}
      <div className="mb-6">
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {moments.slice(-30).map((moment, index) => (
            <button
              key={moment.id}
              onClick={() => onDeleteMoment?.(moment.id)}
              className={`w-4 h-4 rounded-full transition-all hover:scale-125 ${
                moment.energy === '10s' ? 'bg-green-400' :
                moment.energy === '2min' ? 'bg-yellow-400' : 'bg-blue-400'
              }`}
              title={`${formatDate(moment.timestamp.toISOString().split('T')[0])} - ${moment.energy}${moment.mood ? ` - ${moment.mood}` : ''}`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 text-xs text-text-tertiary dark:text-white/50">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            10s
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            2min
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            5min
          </span>
        </div>
      </div>

      {/* Detailed History (Collapsible) */}
      <details className="mt-4">
        <summary className="text-sm text-text-secondary dark:text-white/60 cursor-pointer text-center hover:text-text-primary dark:hover:text-white">
          View detailed history
        </summary>

        <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
          {sortedDates.map((dateStr) => {
            const dayMoments = groupedByDate[dateStr];
            return (
              <div
                key={dateStr}
                className="bg-bg-secondary dark:bg-dark-bg-primary rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text-primary dark:text-white">
                    {formatDate(dateStr)}
                  </span>
                  <span className="text-xs text-text-tertiary dark:text-white/50">
                    {dayMoments.length} moment{dayMoments.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {dayMoments.map((moment) => (
                    <span
                      key={moment.id}
                      className={`text-xs px-2 py-1 rounded ${
                        moment.energy === '10s' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                        moment.energy === '2min' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' :
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                      }`}
                    >
                      {moment.energy}{moment.mood ? ` - ${moment.mood}` : ''}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </details>

      {/* Clear All Button */}
      {onClearAll && moments.length > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClearAll}
            className="text-xs text-text-tertiary dark:text-white/50 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            Clear all history
          </button>
        </div>
      )}
    </div>
  );
};

export default SafeHistory;
