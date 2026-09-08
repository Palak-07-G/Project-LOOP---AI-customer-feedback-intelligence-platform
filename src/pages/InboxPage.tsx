import React, { useState, useEffect } from 'react';
import { FeedbackItem, FeedbackStatus, Theme } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SentimentBadge, StatusBadge, ChannelBadge } from '../components/ui/Badge';
import { TableSkeleton } from '../components/ui/Skeleton';
import { FeedbackDetailDrawer } from '../components/feedback/FeedbackDetailDrawer';
import { AddFeedbackModal } from '../components/feedback/AddFeedbackModal';
import { CSVImportModal } from '../components/feedback/CSVImportModal';
import { SimulateChannelModal } from '../components/feedback/SimulateChannelModal';
import {
  Search,
  Filter,
  Plus,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface InboxPageProps {
  initialThemeId?: string;
}

export const InboxPage: React.FC<InboxPageProps> = ({ initialThemeId }) => {
  const { isViewer } = useAuth();
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [channel, setChannel] = useState('ALL');
  const [sentiment, setSentiment] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [themeId, setThemeId] = useState(initialThemeId || 'ALL');

  // Modals & Drawer
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCsvOpen, setIsCsvOpen] = useState(false);
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [listRes, themesRes] = await Promise.all([
        api.getFeedbackList({
          page,
          limit: 15,
          search: search.trim() || undefined,
          channel: channel === 'ALL' ? undefined : channel,
          sentiment: sentiment === 'ALL' ? undefined : sentiment,
          status: status === 'ALL' ? undefined : status,
          themeId: themeId === 'ALL' ? undefined : themeId,
        }),
        api.getThemes(),
      ]);

      setItems(listRes.items);
      setTotalPages(listRes.pagination.totalPages);
      setTotalItems(listRes.pagination.total);
      setThemes(themesRes.themes);
    } catch (err) {
      console.error('Failed to load feedback list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, channel, sentiment, status, themeId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleInlineStatusChange = async (e: React.MouseEvent, id: string, newStatus: FeedbackStatus) => {
    e.stopPropagation();
    try {
      await api.updateFeedbackStatus(id, newStatus);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const channels = [
    'ALL',
    'Support Ticket',
    'App Store Review',
    'NPS Survey',
    'CSAT Survey',
    'Sales Call',
    'Community Post',
    'Email',
  ];

  return (
    <div className="space-y-4 font-serif">
      {/* Top Filter & Actions Bar */}
      <div className="bg-[#FFFFFF] p-4 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-[#5C5850] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search feedback text, customer tags, or record identifiers..."
              className="w-full pl-9 pr-4 py-2 text-xs font-mono border border-[#1A1A1A] bg-[#F9F7F2] text-[#1A1A1A] placeholder-[#5C5850] focus:ring-1 focus:ring-[#1A1A1A] outline-none transition-all"
            />
          </form>

          {/* Action Buttons */}
          {!isViewer && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Download className="w-3.5 h-3.5" />}
                onClick={() => setIsCsvOpen(true)}
                className="text-xs"
              >
                Import CSV
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={() => setIsSimulateOpen(true)}
                className="text-xs"
              >
                Simulate
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setIsAddOpen(true)}
                className="text-xs"
              >
                + Record
              </Button>
            </div>
          )}
        </div>

        {/* Dropdowns Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <select
            value={channel}
            onChange={(e) => {
              setChannel(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 text-[11px] font-sans font-bold uppercase tracking-wider border border-[#1A1A1A] bg-[#FFFFFF] text-[#1A1A1A] outline-none cursor-pointer"
          >
            {channels.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Channels' : c}
              </option>
            ))}
          </select>

          <select
            value={sentiment}
            onChange={(e) => {
              setSentiment(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 text-[11px] font-sans font-bold uppercase tracking-wider border border-[#1A1A1A] bg-[#FFFFFF] text-[#1A1A1A] outline-none cursor-pointer"
          >
            <option value="ALL">All Sentiments</option>
            <option value="POS">Positive</option>
            <option value="NEU">Neutral</option>
            <option value="NEG">Negative</option>
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 text-[11px] font-sans font-bold uppercase tracking-wider border border-[#1A1A1A] bg-[#FFFFFF] text-[#1A1A1A] outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="ACTIONED">Actioned</option>
          </select>

          <select
            value={themeId}
            onChange={(e) => {
              setThemeId(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 text-[11px] font-sans font-bold uppercase tracking-wider border border-[#1A1A1A] bg-[#FFFFFF] text-[#1A1A1A] outline-none cursor-pointer"
          >
            <option value="ALL">All Themes</option>
            {themes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <span className="text-[11px] text-[#5C5850] ml-auto font-mono font-bold uppercase">
            {totalItems} entries on ledger
          </span>
        </div>
      </div>

      {/* Main Feedback Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={8} />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm font-bold text-[#1A1A1A]">
              No customer feedback records match the active criteria
            </p>
            <p className="text-xs text-[#5C5850] font-sans">
              Try adjusting your search terms or resetting filter dropdowns.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setChannel('ALL');
                setSentiment('ALL');
                setStatus('ALL');
                setThemeId('ALL');
              }}
            >
              Reset All Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#EBE7DF] border-b-2 border-[#1A1A1A] text-[#1A1A1A] font-sans font-black uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-5/12">Customer Verbatim</th>
                  <th className="py-3 px-3">Channel</th>
                  <th className="py-3 px-3">Sentiment</th>
                  <th className="py-3 px-3">Tagged Themes</th>
                  <th className="py-3 px-3">Triage Status</th>
                  <th className="py-3 px-4 text-right font-mono">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#1A1A1A]/10">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedFeedback(item)}
                    className="hover:bg-[#F2EFE9] cursor-pointer transition-colors"
                  >
                    {/* Content Quote */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <p className="text-[#1A1A1A] font-serif text-xs leading-relaxed italic">
                          "{item.content}"
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-[#5C5850]">
                          {item.customerLabel && <span>👤 {item.customerLabel}</span>}
                          {item.sourceRef && <span>[{item.sourceRef}]</span>}
                        </div>
                      </div>
                    </td>

                    {/* Channel */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <ChannelBadge channel={item.channel} />
                    </td>

                    {/* Sentiment */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <SentimentBadge sentiment={item.sentiment} score={item.sentimentScore} />
                    </td>

                    {/* Themes */}
                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {item.themes?.slice(0, 2).map((t) => (
                          <span
                            key={t.id}
                            className="px-2 py-0.5 text-[10px] font-sans font-bold uppercase tracking-wider bg-[#FFFFFF] text-[#1A1A1A] border border-[#1A1A1A] truncate max-w-[140px]"
                          >
                            {t.name}
                          </span>
                        ))}
                        {item.themes?.length > 2 && (
                          <span className="text-[10px] text-[#5C5850] self-center font-mono font-bold">
                            +{item.themes.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Select */}
                    <td className="py-3.5 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {!isViewer ? (
                        <select
                          value={item.status}
                          onChange={(e) =>
                            handleInlineStatusChange(
                              e as any,
                              item.id,
                              e.target.value as FeedbackStatus
                            )
                          }
                          className="px-2 py-1 text-[11px] font-sans font-black uppercase tracking-wider border border-[#1A1A1A] bg-[#FFFFFF] text-[#1A1A1A] outline-none cursor-pointer"
                        >
                          <option value="NEW">New</option>
                          <option value="REVIEWED">Reviewed</option>
                          <option value="ACTIONED">Actioned</option>
                        </select>
                      ) : (
                        <StatusBadge status={item.status} />
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap text-[#5C5850] font-mono text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 bg-[#EBE7DF] border-t-2 border-[#1A1A1A] flex items-center justify-between text-xs font-sans text-[#5C5850] font-bold">
          <span className="uppercase tracking-wider">
            Page {page} of {totalPages || 1} &bull; {totalItems} total ledger items
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-7 px-2"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-7 px-2"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Modals & Detail Drawer */}
      <FeedbackDetailDrawer
        feedback={selectedFeedback}
        isOpen={!!selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        onUpdated={loadData}
      />

      <AddFeedbackModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={loadData}
      />

      <CSVImportModal
        isOpen={isCsvOpen}
        onClose={() => setIsCsvOpen(false)}
        onSuccess={loadData}
      />

      <SimulateChannelModal
        isOpen={isSimulateOpen}
        onClose={() => setIsSimulateOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};

