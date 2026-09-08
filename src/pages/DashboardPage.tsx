import React, { useState, useEffect } from 'react';
import { DashboardData, FeedbackItem } from '../types';
import { api } from '../lib/api';
import { KPISection } from '../components/dashboard/KPISection';
import { VolumeChart } from '../components/dashboard/VolumeChart';
import { SentimentDonutChart } from '../components/dashboard/SentimentDonutChart';
import { TopThemesBarChart } from '../components/dashboard/TopThemesBarChart';
import { DashboardFilters } from '../components/dashboard/DashboardFilters';
import { Card, CardHeader } from '../components/ui/Card';
import { SentimentBadge, StatusBadge, ChannelBadge } from '../components/ui/Badge';
import { CardSkeleton, TableSkeleton } from '../components/ui/Skeleton';
import { FeedbackDetailDrawer } from '../components/feedback/FeedbackDetailDrawer';
import { MessageSquare, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface DashboardPageProps {
  onNavigateToInbox: (themeId?: string) => void;
  onNavigateToAsk: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToInbox,
  onNavigateToAsk,
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [recentFeedback, setRecentFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);

  // Filters State
  const [dateRange, setDateRange] = useState('30d');
  const [channel, setChannel] = useState('ALL');
  const [sentiment, setSentiment] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  const loadDashboard = async () => {
    try {
      const [dashRes, feedbackRes] = await Promise.all([
        api.getDashboard({
          dateRange,
          channel: channel === 'ALL' ? undefined : channel,
          sentiment: sentiment === 'ALL' ? undefined : sentiment,
          status: status === 'ALL' ? undefined : status,
          search: search.trim() || undefined,
        }),
        api.getFeedbackList({ limit: 6 }),
      ]);
      setData(dashRes);
      setRecentFeedback(feedbackRes.items);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [dateRange, channel, sentiment, status, search]);

  const handleResetFilters = () => {
    setDateRange('30d');
    setChannel('ALL');
    setSentiment('ALL');
    setStatus('ALL');
    setSearch('');
  };

  const handleSelectTheme = (themeId: string) => {
    onNavigateToInbox(themeId);
  };

  return (
    <div className="space-y-6 font-serif">
      {/* Filters Bar */}
      <DashboardFilters
        dateRange={dateRange}
        channel={channel}
        sentiment={sentiment}
        status={status}
        search={search}
        onDateRangeChange={setDateRange}
        onChannelChange={setChannel}
        onSentimentChange={setSentiment}
        onStatusChange={setStatus}
        onSearchChange={setSearch}
        onReset={handleResetFilters}
      />

      {loading || !data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CardSkeleton />
            </div>
            <div>
              <CardSkeleton />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <KPISection kpi={data.kpi} />

          {/* Charts Row: Volume Over Time (2 cols) + Sentiment Donut (1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <VolumeChart data={data.volumeOverTime} />
            </div>
            <div>
              <SentimentDonutChart data={data.sentimentBreakdown} />
            </div>
          </div>

          {/* Second Row: Top Themes (2 cols) + Quick Ask AI Card (1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TopThemesBarChart data={data.topThemes} onSelectTheme={handleSelectTheme} />
            </div>

            {/* Quick AI Grounded Insights Promo Card */}
            <Card className="h-[370px] flex flex-col justify-between bg-[#EBE7DF] border-2 border-[#1A1A1A]">
              <div>
                <div className="w-9 h-9 bg-[#1A1A1A] text-[#F9F7F2] flex items-center justify-center font-bold mb-3 border border-[#1A1A1A]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-sans font-black uppercase tracking-[0.2em] text-[#5C5850] block">
                  Ground Truth Retrieval
                </span>
                <h3 className="text-lg font-serif font-bold text-[#1A1A1A] mt-0.5 tracking-tight">
                  Ask LOOP Semantic Intelligence
                </h3>
                <p className="text-xs text-[#5C5850] font-sans mt-2 leading-relaxed">
                  Query customer sentiment in natural language. Every answer is synthesized with verbatim citations and source audit links.
                </p>

                <div className="mt-4 space-y-2">
                  <div className="p-2 border border-[#1A1A1A] bg-[#FFFFFF] text-[11px] font-mono text-[#1A1A1A]">
                    💬 "Why are users churning during onboarding?"
                  </div>
                  <div className="p-2 border border-[#1A1A1A] bg-[#FFFFFF] text-[11px] font-mono text-[#1A1A1A]">
                    💬 "What are the top friction points in billing?"
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={onNavigateToAsk}
                className="w-full text-xs py-2.5 mt-4"
              >
                Launch Ask LOOP (RAG) <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Card>
          </div>

          {/* Recent Ingested Feedback Activity Stream */}
          <Card>
            <CardHeader
              title="Recent Dispatches & Ingested Feedback"
              description="Live audit ledger of customer records classified across connected channels"
              action={
                <button
                  onClick={() => onNavigateToInbox()}
                  className="text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View Complete Ledger &rarr;
                </button>
              }
            />

            <div className="divide-y-2 divide-[#1A1A1A]/10">
              {recentFeedback.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedFeedback(item)}
                  className="py-3.5 px-2 hover:bg-[#F2EFE9] cursor-pointer transition-colors flex items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <SentimentBadge sentiment={item.sentiment} score={item.sentimentScore} />
                      <ChannelBadge channel={item.channel} />
                      {item.customerLabel && (
                        <span className="text-[11px] font-mono text-[#5C5850] truncate">
                          [{item.customerLabel}]
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-serif text-[#1A1A1A] line-clamp-2 leading-relaxed italic">
                      "{item.content}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={item.status} />
                    <span className="text-[11px] text-[#5C5850] font-mono hidden sm:inline">
                      {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* Drawer */}
      <FeedbackDetailDrawer
        feedback={selectedFeedback}
        isOpen={!!selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        onUpdated={loadDashboard}
      />
    </div>
  );
};

