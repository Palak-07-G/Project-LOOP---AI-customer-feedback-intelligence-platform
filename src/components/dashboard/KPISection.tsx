import React from 'react';
import { KPIStats } from '../../types';
import { Card } from '../ui/Card';
import { MessageSquare, AlertCircle, Sparkles, TrendingUp, TrendingDown, Clock, Layers } from 'lucide-react';

export const KPISection: React.FC<{ kpi: KPIStats }> = ({ kpi }) => {
  const isVolPositive = kpi.totalFeedback.growth >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Feedback */}
      <Card id="kpi-total-feedback" className="relative">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-sans font-black text-[#5C5850] uppercase tracking-[0.2em] block">
              Total Dispatches
            </span>
            <div className="text-3xl font-serif font-black text-[#1A1A1A] mt-1 tracking-tight font-mono">
              {kpi.totalFeedback.value.toLocaleString()}
            </div>
          </div>
          <div className="p-2 border border-[#1A1A1A] bg-[#1A1A1A] text-[#F9F7F2]">
            <MessageSquare className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-[#1A1A1A]/10 flex items-center justify-between text-[11px] font-sans">
          <span
            className={`inline-flex items-center font-bold font-mono ${
              isVolPositive ? 'text-[#1B4D3E]' : 'text-[#5C5850]'
            }`}
          >
            {isVolPositive ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
            {kpi.totalFeedback.growth > 0 ? `+${kpi.totalFeedback.growth}%` : `${kpi.totalFeedback.growth}%`}
          </span>
          <span className="text-[#5C5850] text-[10px] uppercase font-bold tracking-wider">{kpi.totalFeedback.periodLabel}</span>
        </div>
      </Card>

      {/* 2. Negative Feedback % */}
      <Card id="kpi-negative-rate">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-sans font-black text-[#5C5850] uppercase tracking-[0.2em] block">
              Negative Friction %
            </span>
            <div className="text-3xl font-serif font-black text-[#1A1A1A] mt-1 tracking-tight font-mono">
              {kpi.negativeRate.value}%
            </div>
          </div>
          <div className="p-2 border border-[#8E2828] bg-[#8E2828] text-[#F9F7F2]">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-[#1A1A1A]/10 flex items-center justify-between text-[11px] font-sans">
          <span
            className={`inline-flex items-center font-bold font-mono ${
              kpi.negativeRate.growth > 0 ? 'text-[#8E2828]' : 'text-[#1B4D3E]'
            }`}
          >
            {kpi.negativeRate.growth > 0 ? `+${kpi.negativeRate.growth}%` : `${kpi.negativeRate.growth}%`}
          </span>
          <span className="text-[#5C5850] text-[10px] uppercase font-bold tracking-wider">{kpi.negativeRate.periodLabel}</span>
        </div>
      </Card>

      {/* 3. New This Week */}
      <Card id="kpi-new-this-week">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-sans font-black text-[#5C5850] uppercase tracking-[0.2em] block">
              Weekly Ingest
            </span>
            <div className="text-3xl font-serif font-black text-[#1A1A1A] mt-1 tracking-tight font-mono">
              {kpi.newThisWeek.value}
            </div>
          </div>
          <div className="p-2 border border-[#1A1A1A] bg-[#EBE7DF] text-[#1A1A1A]">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-[#1A1A1A]/10 flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-wider text-[#5C5850]">
          <span className="w-1.5 h-1.5 bg-[#1A1A1A] inline-block" />
          <span>{kpi.newThisWeek.label}</span>
        </div>
      </Card>

      {/* 4. Top Theme */}
      <Card id="kpi-top-theme">
        <div className="flex items-start justify-between">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] font-sans font-black text-[#5C5850] uppercase tracking-[0.2em] block">
              Dominant Theme
            </span>
            <div className="text-base font-serif font-bold text-[#1A1A1A] mt-1 truncate" title={kpi.topTheme.name}>
              {kpi.topTheme.name}
            </div>
          </div>
          <div className="p-2 border border-[#1A1A1A] bg-[#1A1A1A] text-[#F9F7F2] shrink-0">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-[#1A1A1A]/10 flex items-center justify-between text-[11px] font-sans">
          <span className="font-bold font-mono text-[#1A1A1A]">{kpi.topTheme.count} entries</span>
          <span className="text-[10px] text-[#5C5850] uppercase font-bold tracking-wider">{kpi.topTheme.label}</span>
        </div>
      </Card>
    </div>
  );
};

