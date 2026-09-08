import React from 'react';
import { SentimentBreakdown } from '../../types';
import { Card, CardHeader } from '../ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const SentimentDonutChart: React.FC<{ data: SentimentBreakdown }> = ({ data }) => {
  const chartData = [
    { name: 'Positive', value: data.positive.count, percentage: data.positive.percentage, color: '#1B4D3E' },
    { name: 'Neutral', value: data.neutral.count, percentage: data.neutral.percentage, color: '#8A6D3B' },
    { name: 'Negative', value: data.negative.count, percentage: data.negative.percentage, color: '#8E2828' },
  ];

  return (
    <Card id="sentiment-donut-card" className="h-[370px] flex flex-col">
      <CardHeader
        title="Sentiment Breakdown"
        description="Overall customer tone across all ingested channels"
      />
      <div className="flex-1 flex flex-col justify-between pt-1">
        <div className="h-[180px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={52}
                outerRadius={78}
                paddingAngle={2}
                dataKey="value"
                stroke="#1A1A1A"
                strokeWidth={1.5}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '0px',
                  border: '2px solid #1A1A1A',
                  color: '#1A1A1A',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  boxShadow: '4px 4px 0px 0px #1A1A1A',
                }}
                formatter={(value: any, name: any, item: any) => [
                  `${value} records (${item.payload.percentage}%)`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-serif font-black text-[#1A1A1A] font-mono">{data.total}</span>
            <span className="text-[9px] uppercase font-sans font-black tracking-[0.2em] text-[#5C5850]">Records</span>
          </div>
        </div>

        {/* Legend stats */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t-2 border-[#1A1A1A] text-center">
          <div className="p-2 border border-[#1A1A1A] bg-[#FFFFFF]">
            <span className="text-[10px] font-sans font-black text-[#1B4D3E] uppercase tracking-wider block">Positive</span>
            <span className="text-base font-serif font-bold text-[#1A1A1A] font-mono">{data.positive.percentage}%</span>
            <span className="text-[9px] text-[#5C5850] block font-mono">({data.positive.count})</span>
          </div>
          <div className="p-2 border border-[#1A1A1A] bg-[#FFFFFF]">
            <span className="text-[10px] font-sans font-black text-[#8A6D3B] uppercase tracking-wider block">Neutral</span>
            <span className="text-base font-serif font-bold text-[#1A1A1A] font-mono">{data.neutral.percentage}%</span>
            <span className="text-[9px] text-[#5C5850] block font-mono">({data.neutral.count})</span>
          </div>
          <div className="p-2 border border-[#1A1A1A] bg-[#FFFFFF]">
            <span className="text-[10px] font-sans font-black text-[#8E2828] uppercase tracking-wider block">Negative</span>
            <span className="text-base font-serif font-bold text-[#1A1A1A] font-mono">{data.negative.percentage}%</span>
            <span className="text-[9px] text-[#5C5850] block font-mono">({data.negative.count})</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

