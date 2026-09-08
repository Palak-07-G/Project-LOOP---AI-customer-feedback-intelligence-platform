import React from 'react';
import { VolumePoint } from '../../types.js';
import { Card, CardHeader } from '../ui/Card.js';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const VolumeChart: React.FC<{ data: VolumePoint[] }> = ({ data }) => {
  return (
    <Card id="volume-chart-card" className="h-[370px] flex flex-col">
      <CardHeader
        title="Feedback Volume Over Time"
        description="Temporal dispatches classified by machine-evaluated sentiment polarity"
      />
      <div className="flex-1 w-full min-h-0 pt-2">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs font-sans text-[#5C5850]">
            No temporal records captured in selected filter parameters.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B4D3E" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#1B4D3E" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8A6D3B" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8A6D3B" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8E2828" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8E2828" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#1A1A1A" opacity={0.15} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#5C5850', fontFamily: 'monospace' }} axisLine={{ stroke: '#1A1A1A' }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#5C5850', fontFamily: 'monospace' }} axisLine={{ stroke: '#1A1A1A' }} tickLine={false} />
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
              />
              <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'sans-serif', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '8px' }} />
              <Area type="monotone" dataKey="positive" name="Positive" stroke="#1B4D3E" strokeWidth={2} fillOpacity={1} fill="url(#colorPositive)" stackId="1" />
              <Area type="monotone" dataKey="neutral" name="Neutral" stroke="#8A6D3B" strokeWidth={2} fillOpacity={1} fill="url(#colorNeutral)" stackId="1" />
              <Area type="monotone" dataKey="negative" name="Negative" stroke="#8E2828" strokeWidth={2} fillOpacity={1} fill="url(#colorNegative)" stackId="1" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

