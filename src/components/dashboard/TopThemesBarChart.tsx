import React from 'react';
import { TopThemeItem } from '../../types.js';
import { Card, CardHeader } from '../ui/Card.js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export const TopThemesBarChart: React.FC<{ data: TopThemeItem[]; onSelectTheme?: (id: string) => void }> = ({
  data,
  onSelectTheme,
}) => {
  return (
    <Card id="top-themes-bar-card" className="h-[370px] flex flex-col">
      <CardHeader
        title="Top Customer Themes"
        description="Ranked by total feedback volume detected across records"
      />
      <div className="flex-1 w-full min-h-0 pt-2">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs font-sans text-[#5C5850]">
            No themes detected for this filter selection.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="2 2" horizontal={false} stroke="#1A1A1A" opacity={0.15} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#5C5850', fontFamily: 'monospace' }} axisLine={{ stroke: '#1A1A1A' }} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={130}
                tick={{ fontSize: 11, fill: '#1A1A1A', fontWeight: 600, fontFamily: 'serif' }}
                axisLine={{ stroke: '#1A1A1A' }}
                tickLine={false}
              />
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
                formatter={(value: any) => [`${value} customer records`, 'Volume']}
              />
              <Bar dataKey="count" radius={[0, 0, 0, 0]} maxBarSize={20} stroke="#1A1A1A" strokeWidth={1} onClick={(entry) => onSelectTheme && onSelectTheme(entry.id)}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || '#1A1A1A'}
                    className="cursor-pointer hover:opacity-85 transition-opacity"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

