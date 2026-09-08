import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button.js';

interface DashboardFiltersProps {
  dateRange: string;
  channel: string;
  sentiment: string;
  status: string;
  search: string;
  onDateRangeChange: (val: string) => void;
  onChannelChange: (val: string) => void;
  onSentimentChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onSearchChange: (val: string) => void;
  onReset: () => void;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  dateRange,
  channel,
  sentiment,
  status,
  search,
  onDateRangeChange,
  onChannelChange,
  onSentimentChange,
  onStatusChange,
  onSearchChange,
  onReset,
}) => {
  const channels = [
    'ALL',
    'Support Ticket',
    'App Store Review',
    'NPS Survey',
    'CSAT Survey',
    'Sales Call',
    'Community Post',
  ];

  const hasActiveFilters =
    dateRange !== '30d' ||
    channel !== 'ALL' ||
    sentiment !== 'ALL' ||
    status !== 'ALL' ||
    search.trim() !== '';

  return (
    <div className="bg-[#FFFFFF] p-4 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] space-y-3 font-serif">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#5C5850] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search feedback text, customer tags, or record identifiers..."
            className="w-full pl-9 pr-4 py-2 text-xs font-mono border border-[#1A1A1A] bg-[#F9F7F2] text-[#1A1A1A] placeholder-[#5C5850] focus:ring-1 focus:ring-[#1A1A1A] outline-none transition-all"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="px-3 py-2 text-[11px] font-sans font-bold uppercase tracking-wider border border-[#1A1A1A] bg-[#FFFFFF] text-[#1A1A1A] outline-none focus:ring-1 focus:ring-[#1A1A1A] cursor-pointer"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All recorded time</option>
          </select>

          {/* Channel */}
          <select
            value={channel}
            onChange={(e) => onChannelChange(e.target.value)}
            className="px-3 py-2 text-[11px] font-sans font-bold uppercase tracking-wider border border-[#1A1A1A] bg-[#FFFFFF] text-[#1A1A1A] outline-none focus:ring-1 focus:ring-[#1A1A1A] cursor-pointer"
          >
            <option value="ALL">All Channels</option>
            {channels.filter((c) => c !== 'ALL').map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Sentiment */}
          <select
            value={sentiment}
            onChange={(e) => onSentimentChange(e.target.value)}
            className="px-3 py-2 text-[11px] font-sans font-bold uppercase tracking-wider border border-[#1A1A1A] bg-[#FFFFFF] text-[#1A1A1A] outline-none focus:ring-1 focus:ring-[#1A1A1A] cursor-pointer"
          >
            <option value="ALL">All Sentiments</option>
            <option value="POS">Positive</option>
            <option value="NEU">Neutral</option>
            <option value="NEG">Negative</option>
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2 text-[11px] font-sans font-bold uppercase tracking-wider border border-[#1A1A1A] bg-[#FFFFFF] text-[#1A1A1A] outline-none focus:ring-1 focus:ring-[#1A1A1A] cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="ACTIONED">Actioned</option>
          </select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={onReset}
              className="text-[10px]"
            >
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

