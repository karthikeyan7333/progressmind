import React from 'react';
import { ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Habit } from '../types';
import { getHabitScoreHistory } from '../services/streaks';

interface HabitScoreChartProps {
  habit: Habit;
  completedDates: string[];
  onOpenAnalytics: () => void;
}

export const HabitScoreChart: React.FC<HabitScoreChartProps> = ({
  habit,
  completedDates,
  onOpenAnalytics,
}) => {
  const data = getHabitScoreHistory(habit, completedDates);
  const hasData = completedDates && completedDates.length > 0 && data.length > 0;

  return (
    <div id="habit-score-section" className="mb-6">
      {/* Header matching Screenshot 3: Score & Analytics > */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-xl font-bold text-white tracking-tight">Score</h2>
        <button
          id="score-analytics-link-btn"
          onClick={onOpenAnalytics}
          className="text-sm font-medium text-blue-500 hover:text-blue-400 flex items-center gap-0.5 transition-colors"
        >
          <span>Analytics</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Graph Card */}
      <div className="w-full bg-[#18181B] border border-zinc-800/60 rounded-3xl p-5 shadow-md">
        <div className="flex">
          {/* Y-Axis Labels */}
          <div className="flex flex-col justify-between text-[11px] font-medium text-zinc-500 pr-3 select-none h-44 py-1">
            <span>100%</span>
            <span>80%</span>
            <span>60%</span>
            <span>40%</span>
            <span>20%</span>
            <span>0%</span>
          </div>

          {/* Chart or Empty State */}
          <div className="flex-1 relative h-44 flex flex-col justify-between">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-dashed border-zinc-500 w-full" />
              <div className="border-b border-dashed border-zinc-500 w-full" />
              <div className="border-b border-dashed border-zinc-500 w-full" />
              <div className="border-b border-dashed border-zinc-500 w-full" />
              <div className="border-b border-dashed border-zinc-500 w-full" />
              <div className="border-b border-zinc-500 w-full" />
            </div>

            {!hasData ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
                <span className="text-sm font-semibold text-zinc-300">No data</span>
                <span className="text-xs text-zinc-500 mt-0.5">
                  Complete habits to see chart
                </span>
              </div>
            ) : (
              <div className="w-full h-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`grad-${habit.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={habit.color} stopOpacity={0.6} />
                        <stop offset="95%" stopColor={habit.color} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" hide />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#27272A',
                        borderColor: '#3F3F46',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#fff',
                      }}
                      formatter={(val: any) => [`${val}%`, 'Score']}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke={habit.color}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill={`url(#grad-${habit.id})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
