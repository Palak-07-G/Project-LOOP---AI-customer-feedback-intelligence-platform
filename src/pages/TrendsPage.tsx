import React, { useState, useEffect } from 'react';
import { ThemeTrend, Theme, FeedbackItem } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { CardSkeleton } from '../components/ui/Skeleton';
import { FeedbackDetailDrawer } from '../components/feedback/FeedbackDetailDrawer';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Flame,
  Plus,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';

interface TrendsPageProps {
  onNavigateToInboxWithTheme: (themeId: string) => void;
}

export const TrendsPage: React.FC<TrendsPageProps> = ({ onNavigateToInboxWithTheme }) => {
  const { isViewer, isAdmin } = useAuth();
  const [trends, setTrends] = useState<ThemeTrend[]>([]);
  const [spiking, setSpiking] = useState<ThemeTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  // New Theme Modal
  const [isNewThemeOpen, setIsNewThemeOpen] = useState(false);
  const [themeName, setThemeName] = useState('');
  const [themeDesc, setThemeDesc] = useState('');
  const [themeColor, setThemeColor] = useState('#1A1A1A');
  const [createLoading, setCreateLoading] = useState(false);

  // Theme Drilldown Modal
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [drilldownTheme, setDrilldownTheme] = useState<Theme | null>(null);
  const [drilldownFeedback, setDrilldownFeedback] = useState<FeedbackItem[]>([]);
  const [drilldownLoading, setDrilldownLoading] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);

  const loadTrends = async () => {
    setLoading(true);
    try {
      const res = await api.getTrends(days);
      setTrends(res.themes);
      setSpiking(res.spikingThemes);
    } catch (err) {
      console.error('Failed to load trends:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrends();
  }, [days]);

  const handleCreateTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!themeName.trim()) return;
    setCreateLoading(true);
    try {
      await api.createTheme({
        name: themeName.trim(),
        description: themeDesc.trim(),
        color: themeColor,
      });
      setThemeName('');
      setThemeDesc('');
      setIsNewThemeOpen(false);
      loadTrends();
    } catch (err) {
      console.error('Failed to create theme:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleOpenDrilldown = async (themeId: string) => {
    setSelectedThemeId(themeId);
    setDrilldownLoading(true);
    try {
      const res = await api.getThemeDrilldown(themeId);
      setDrilldownTheme(res.theme);
      setDrilldownFeedback(res.feedback);
    } catch (err) {
      console.error('Failed to load drilldown:', err);
    } finally {
      setDrilldownLoading(false);
    }
  };

  const colors = [
    '#1A1A1A',
    '#8E2828',
    '#1B4D3E',
    '#5C5850',
    '#4A5568',
    '#2B6CB0',
    '#744210',
  ];

  return (
    <div className="space-y-6 font-serif">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-5 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-[#5C5850]">Topic Velocity</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-[#1A1A1A]">
            Theme Trends & Velocity Detection
          </h2>
          <p className="text-xs text-[#5C5850] font-sans mt-0.5">
            Monitor emerging friction areas, shifting customer priorities, and growing sentiment clusters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-1.5 text-[11px] font-sans font-bold uppercase tracking-wider border border-[#1A1A1A] bg-[#FFFFFF] text-[#1A1A1A] outline-none"
          >
            <option value={7}>Last 7 days vs previous</option>
            <option value={30}>Last 30 days vs previous</option>
            <option value={90}>Last 90 days vs previous</option>
          </select>

          {!isViewer && (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsNewThemeOpen(true)}
              className="text-xs"
            >
              New Theme
            </Button>
          )}
        </div>
      </div>

      {/* Spiking Alerts Banner */}
      {spiking.length > 0 && (
        <div className="p-4 bg-[#FFFFFF] border-2 border-[#8E2828] shadow-[4px_4px_0px_0px_#8E2828] space-y-2">
          <div className="flex items-center gap-2 font-sans font-black uppercase tracking-wider text-xs text-[#8E2828]">
            <Flame className="w-4 h-4 text-[#8E2828]" />
            <span>Spiking Customer Themes Detected ({spiking.length})</span>
          </div>
          <p className="text-xs font-serif text-[#1A1A1A]">
            The following topics showed significant volume increases compared to the prior period and may require urgent product attention:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {spiking.map((s) => (
              <button
                key={s.id}
                onClick={() => handleOpenDrilldown(s.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#8E2828] hover:bg-[#1A1A1A] border border-[#1A1A1A] text-xs font-sans font-bold text-[#FFFFFF] transition-colors"
              >
                <span>{s.name}</span>
                <span className="font-mono text-[#F9F7F2]">+{s.growth}%</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Themes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : trends.length === 0 ? (
        <Card className="p-12 text-center text-[#5C5850] text-xs font-sans">
          No themes found in this workspace. Create one or ingest feedback to automatically assign themes.
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trends.map((t) => {
            const isSpike = t.trendStatus === 'Spiking';
            const isGrowing = t.trendStatus === 'Growing';
            const isDeclining = t.trendStatus === 'Declining';

            return (
              <Card
                key={t.id}
                id={`theme-card-${t.id}`}
                className="flex flex-col justify-between hover:shadow-[5px_5px_0px_0px_#1A1A1A] transition-all bg-[#FFFFFF] border-2 border-[#1A1A1A]"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 shrink-0 border border-[#1A1A1A]" style={{ backgroundColor: t.color || '#1A1A1A' }} />
                      <h3 className="text-sm font-serif font-bold text-[#1A1A1A]">{t.name}</h3>
                    </div>

                    <span
                      className={`text-[10px] font-sans font-black uppercase tracking-wider px-2 py-0.5 flex items-center gap-1 border ${
                        isSpike
                          ? 'bg-[#8E2828] text-[#FFFFFF] border-[#1A1A1A]'
                          : isGrowing
                          ? 'bg-[#1A1A1A] text-[#F9F7F2] border-[#1A1A1A]'
                          : isDeclining
                          ? 'bg-[#1B4D3E] text-[#FFFFFF] border-[#1A1A1A]'
                          : 'bg-[#EBE7DF] text-[#1A1A1A] border-[#1A1A1A]'
                      }`}
                    >
                      {t.growth > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {t.growth > 0 ? `+${t.growth}%` : `${t.growth}%`}
                    </span>
                  </div>

                  <p className="text-xs text-[#5C5850] font-sans line-clamp-2 mb-4 leading-relaxed">
                    {t.description || 'No description set'}
                  </p>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#1A1A1A] font-serif font-bold text-base">{t.feedbackCount} items</span>
                      <span className="text-[#5C5850] font-sans text-[10px] uppercase font-bold tracking-wider">
                        {t.positivePercentage}% Pos &bull; {t.negativePercentage}% Neg
                      </span>
                    </div>

                    {/* Sentiment Distribution Bar */}
                    <div className="w-full h-2 overflow-hidden bg-[#EBE7DF] border border-[#1A1A1A] flex">
                      <div
                        style={{ width: `${t.positivePercentage}%` }}
                        className="bg-[#1B4D3E] h-full"
                        title={`Positive: ${t.positivePercentage}%`}
                      />
                      <div
                        style={{
                          width: `${
                            100 - t.positivePercentage - t.negativePercentage
                          }%`,
                        }}
                        className="bg-[#D5D0C7] h-full"
                        title="Neutral"
                      />
                      <div
                        style={{ width: `${t.negativePercentage}%` }}
                        className="bg-[#8E2828] h-full"
                        title={`Negative: ${t.negativePercentage}%`}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-[#1A1A1A]/10 flex items-center justify-between font-sans">
                  <button
                    onClick={() => handleOpenDrilldown(t.id)}
                    className="text-xs font-bold text-[#1A1A1A] hover:underline flex items-center gap-1"
                  >
                    Drilldown Insights <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onNavigateToInboxWithTheme(t.id)}
                    className="text-[10px] uppercase font-bold text-[#5C5850] hover:text-[#1A1A1A]"
                  >
                    View in Inbox
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Drilldown Modal */}
      <Modal
        isOpen={!!selectedThemeId}
        onClose={() => setSelectedThemeId(null)}
        title={drilldownTheme ? `${drilldownTheme.name} — Customer Feedback Drilldown` : 'Theme Drilldown'}
        description="Examining all verbatim feedback items linked to this theme category"
        maxWidth="2xl"
      >
        {drilldownLoading ? (
          <div className="space-y-3 py-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="space-y-4 font-serif">
            <div className="p-4 bg-[#F9F7F2] border-2 border-[#1A1A1A] text-xs space-y-1">
              <p className="font-serif font-bold text-[#1A1A1A]">
                {drilldownTheme?.description}
              </p>
              <p className="text-[#5C5850] font-sans">
                Total Feedback Tagged: <strong className="text-[#1A1A1A] font-mono">{drilldownFeedback.length} items</strong>
              </p>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {drilldownFeedback.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedFeedback(item)}
                  className="p-3.5 border-2 border-[#1A1A1A] hover:bg-[#F2EFE9] cursor-pointer transition-all bg-[#FFFFFF] space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[10px] font-sans">
                    <span className="font-bold uppercase text-[#1A1A1A]">{item.channel}</span>
                    <span className="text-[#5C5850] font-mono">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-[#1A1A1A] font-serif leading-relaxed italic">
                    "{item.content}"
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t-2 border-[#1A1A1A]">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (selectedThemeId) {
                    onNavigateToInboxWithTheme(selectedThemeId);
                    setSelectedThemeId(null);
                  }
                }}
              >
                Open in Full Inbox Table
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Theme Modal */}
      <Modal
        isOpen={isNewThemeOpen}
        onClose={() => setIsNewThemeOpen(false)}
        title="Create Customer Theme"
        description="Add a new classification category for AI auto-tagging"
        maxWidth="md"
      >
        <form onSubmit={handleCreateTheme} className="space-y-4 font-serif">
          <div>
            <label className="block text-[10px] font-sans font-black uppercase tracking-[0.2em] text-[#5C5850] mb-1">
              Theme Name <span className="text-[#8E2828]">*</span>
            </label>
            <input
              type="text"
              required
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              placeholder="e.g. Export & CSV Formatting"
              className="w-full px-3 py-2 text-xs font-serif border border-[#1A1A1A] bg-[#F9F7F2] text-[#1A1A1A] placeholder-[#5C5850] focus:ring-1 focus:ring-[#1A1A1A] outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-sans font-black uppercase tracking-[0.2em] text-[#5C5850] mb-1">
              Description / Criteria
            </label>
            <textarea
              rows={3}
              value={themeDesc}
              onChange={(e) => setThemeDesc(e.target.value)}
              placeholder="e.g. Feedback regarding data exporting, CSV downloads, or reporting spreadsheet formats."
              className="w-full px-3 py-2 text-xs font-serif border border-[#1A1A1A] bg-[#F9F7F2] text-[#1A1A1A] placeholder-[#5C5850] focus:ring-1 focus:ring-[#1A1A1A] outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-sans font-black uppercase tracking-[0.2em] text-[#5C5850] mb-1">
              Palette Accent
            </label>
            <div className="flex items-center gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setThemeColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 border border-[#1A1A1A] transition-transform ${
                    themeColor === c ? 'ring-2 ring-offset-2 ring-[#1A1A1A] scale-110' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t-2 border-[#1A1A1A]">
            <Button variant="outline" size="sm" onClick={() => setIsNewThemeOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={createLoading}>
              Save Theme
            </Button>
          </div>
        </form>
      </Modal>

      {/* Drawer */}
      <FeedbackDetailDrawer
        feedback={selectedFeedback}
        isOpen={!!selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        onUpdated={loadTrends}
      />
    </div>
  );
};

