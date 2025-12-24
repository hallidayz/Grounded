import React from 'react';
import { motion } from 'framer-motion';
import { EMOTIONAL_STATES } from '../services/emotionalStates';

interface MoodData {
  state: string;
  emoji: string;
  label: string;
  percentage: number;
  color: string;
}

interface MoodTrendChartProps {
  data: MoodData[];
}

const MoodTrendChart: React.FC<MoodTrendChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">
          Mood Trends
        </h3>
        <p className="text-text-secondary dark:text-white/70 text-sm">
          No mood data available yet. Start logging your reflections to see trends.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-6 space-y-4 shadow-sm">
      <h3 className="text-lg font-semibold text-text-primary dark:text-white">
        Mood Trends
      </h3>
      
      <div className="space-y-3">
        {data.map((mood, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-2">
                <span className="text-xl">{mood.emoji}</span>
                <span className="text-text-secondary dark:text-white/70">
                  {mood.label}
                </span>
              </span>
              <span className="font-semibold text-text-primary dark:text-white">
                {mood.percentage}%
              </span>
            </div>
            
            <div className="w-full bg-bg-tertiary dark:bg-dark-bg-tertiary rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${mood.percentage}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full rounded-full"
                style={{ backgroundColor: mood.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoodTrendChart;

