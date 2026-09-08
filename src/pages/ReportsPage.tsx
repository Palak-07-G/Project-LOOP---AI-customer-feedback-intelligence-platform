import React, { useState, useEffect } from 'react';
import { ReportItem, VoCReportContent } from '../types.js';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Card, CardHeader } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Modal } from '../components/ui/Modal.js';
import { CardSkeleton } from '../components/ui/Skeleton.js';
import {
  FileText,
  Plus,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Quote,
  Trash2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { isViewer, isAdmin } = useAuth();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Generate Modal
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [customTitle, setCustomTitle] = useState('');

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await api.getReports();
      setReports(res.reports);
      if (res.reports.length > 0 && !selectedReport) {
        // Load details of latest report
        const latest = await api.getReportDetail(res.reports[0].id);
        setSelectedReport(latest);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleSelectReport = async (reportId: string) => {
    try {
      const full = await api.getReportDetail(reportId);
      setSelectedReport(full);
    } catch (err) {
      console.error('Failed to fetch report detail:', err);
    }
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const newRep = await api.generateReport(period, customTitle.trim() || undefined);
      setIsGenModalOpen(false);
      setCustomTitle('');
      await loadReports();
      setSelectedReport(newRep);
    } catch (err: any) {
      alert(err.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await api.deleteReport(reportId);
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
      loadReports();
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const content: VoCReportContent | undefined = selectedReport?.content;

  return (
    <div className="space-y-6 font-serif">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-5 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-[#5C5850]">Synthesis Digest</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-[#1A1A1A] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1A1A1A]" />
            Voice of the Customer (VoC) Executive Reports
          </h2>
          <p className="text-xs text-[#5C5850] font-sans mt-0.5">
            Synthesized digests analyzing customer sentiment, themes, quotes, and product priority recommendations.
          </p>
        </div>

        {!isViewer && (
          <Button
            id="generate-report-btn"
            variant="primary"
            size="sm"
            icon={<Sparkles className="w-3.5 h-3.5" />}
            onClick={() => setIsGenModalOpen(true)}
            className="text-xs"
          >
            Generate New Report
          </Button>
        )}
      </div>

      {/* Main Layout: Left Sidebar List of Reports + Right Full Report Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Report History List */}
        <div className="lg:col-span-1 space-y-3">
          <span className="text-[11px] font-sans font-black uppercase tracking-[0.15em] text-[#1A1A1A] block">
            Generated Compendiums ({reports.length})
          </span>

          {loading ? (
            <div className="space-y-2">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : reports.length === 0 ? (
            <Card className="p-6 text-center text-xs text-[#5C5850] font-sans">
              No reports generated yet. Click "Generate New Report" to create your first executive VoC digest.
            </Card>
          ) : (
            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
              {reports.map((rep) => {
                const active = selectedReport?.id === rep.id;
                return (
                  <div
                    key={rep.id}
                    id={`report-item-${rep.id}`}
                    onClick={() => handleSelectReport(rep.id)}
                    className={`p-3 border-2 transition-all cursor-pointer text-left space-y-1.5 ${
                      active
                        ? 'bg-[#1A1A1A] text-[#F9F7F2] border-[#1A1A1A] shadow-[3px_3px_0px_0px_#5C5850]'
                        : 'bg-[#FFFFFF] border-[#1A1A1A] hover:bg-[#F2EFE9] text-[#1A1A1A]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-sans font-bold uppercase tracking-wider ${active ? 'text-[#F9F7F2]' : 'text-[#5C5850]'}`}>
                        {rep.title.includes('(') ? rep.title.split('(')[0] : rep.title}
                      </span>
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteReport(rep.id);
                          }}
                          className={`p-1 hover:text-[#8E2828] ${active ? 'text-[#F9F7F2]' : 'text-[#5C5850]'}`}
                          title="Delete report"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className={`text-xs font-serif font-bold truncate ${active ? 'text-[#F9F7F2]' : 'text-[#1A1A1A]'}`}>{rep.title}</p>
                    <div className={`flex items-center justify-between text-[10px] font-mono ${active ? 'text-[#D5D0C7]' : 'text-[#5C5850]'}`}>
                      <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                      <span className="truncate max-w-[100px]">{rep.generatedBy}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Full Report View */}
        <div className="lg:col-span-3">
          {selectedReport && content ? (
            <Card id="printable-voc-report" className="p-8 space-y-8 bg-[#FFFFFF] border-2 border-[#1A1A1A] shadow-[6px_6px_0px_0px_#1A1A1A] print:shadow-none print:border-none">
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-[#1A1A1A]">
                <div>
                  <span className="text-[10px] font-sans font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-[#1A1A1A] text-[#F9F7F2]">
                    VoC Executive Briefing
                  </span>
                  <h1 className="text-2xl font-serif font-bold text-[#1A1A1A] mt-3 tracking-tight">
                    {selectedReport.title}
                  </h1>
                  <p className="text-xs text-[#5C5850] font-sans mt-1">
                    Coverage: {content.period || 'Last 30 Days'} &bull; Synthesized on{' '}
                    {new Date(selectedReport.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    by {selectedReport.generatedBy}
                  </p>
                </div>

                <div className="flex items-center gap-2 print:hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Printer className="w-4 h-4" />}
                    onClick={handlePrint}
                    className="text-xs"
                  >
                    Print / PDF
                  </Button>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-5 bg-[#F9F7F2] border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A] space-y-2">
                <span className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-[#1A1A1A] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#1A1A1A]" />
                  Executive Summary
                </span>
                <p className="text-sm font-serif text-[#1A1A1A] leading-relaxed italic">
                  "{content.executiveSummary}"
                </p>
              </div>

              {/* Key Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-4 bg-[#FFFFFF] border-2 border-[#1A1A1A]">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#5C5850] block mb-1">Feedback Items</span>
                  <span className="text-2xl font-serif font-bold text-[#1A1A1A]">
                    {content.totalFeedbackAnalyzed || 0}
                  </span>
                </div>
                <div className="p-4 bg-[#FFFFFF] border-2 border-[#1A1A1A]">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#1B4D3E] block mb-1">Positive Tone</span>
                  <span className="text-2xl font-serif font-bold text-[#1B4D3E]">
                    {content.sentimentBreakdown?.positive || 0}%
                  </span>
                </div>
                <div className="p-4 bg-[#FFFFFF] border-2 border-[#1A1A1A]">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#5C5850] block mb-1">Neutral Tone</span>
                  <span className="text-2xl font-serif font-bold text-[#1A1A1A]">
                    {content.sentimentBreakdown?.neutral || 0}%
                  </span>
                </div>
                <div className="p-4 bg-[#FFFFFF] border-2 border-[#1A1A1A]">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#8E2828] block mb-1">Negative Tone</span>
                  <span className="text-2xl font-serif font-bold text-[#8E2828]">
                    {content.sentimentBreakdown?.negative || 0}%
                  </span>
                </div>
              </div>

              {/* What Customers Love vs What Customers Struggle With */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Love */}
                <div className="p-5 bg-[#FFFFFF] border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A] space-y-3">
                  <h3 className="text-xs font-sans font-black uppercase tracking-[0.15em] text-[#1B4D3E] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1B4D3E]" />
                    What Customers Praise
                  </h3>
                  <ul className="space-y-2 text-xs font-serif text-[#1A1A1A]">
                    {content.whatCustomersLove?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#1B4D3E] font-bold">&bull;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Struggle */}
                <div className="p-5 bg-[#FFFFFF] border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A] space-y-3">
                  <h3 className="text-xs font-sans font-black uppercase tracking-[0.15em] text-[#8E2828] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#8E2828]" />
                    Points of Customer Friction
                  </h3>
                  <ul className="space-y-2 text-xs font-serif text-[#1A1A1A]">
                    {content.whatCustomersStruggleWith?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#8E2828] font-bold">&bull;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Verbatim Quotes */}
              {content.keyQuotes?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-sans font-black uppercase tracking-[0.15em] text-[#1A1A1A] flex items-center gap-2">
                    <Quote className="w-4 h-4 text-[#1A1A1A]" />
                    Key Verbatim Customer Quotes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {content.keyQuotes.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-[#F9F7F2] border-2 border-[#1A1A1A] text-xs space-y-2"
                      >
                        <p className="italic text-[#1A1A1A] font-serif leading-relaxed">
                          "{q.quote}"
                        </p>
                        <div className="flex items-center justify-between text-[10px] font-sans font-bold text-[#5C5850] pt-2 border-t border-[#1A1A1A]/20">
                          <span className="uppercase">{q.customer || 'Verified User'}</span>
                          <span className="font-mono">{q.channel}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Priority Action Recommendations Table */}
              {content.priorityRecommendations?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-sans font-black uppercase tracking-[0.15em] text-[#1A1A1A] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#1A1A1A]" />
                    Priority Action Recommendations
                  </h3>
                  <div className="overflow-x-auto border-2 border-[#1A1A1A]">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-[#EBE7DF] text-[#1A1A1A] font-sans font-black uppercase text-[10px] tracking-wider border-b-2 border-[#1A1A1A]">
                        <tr>
                          <th className="py-2.5 px-3">Priority</th>
                          <th className="py-2.5 px-3">Theme</th>
                          <th className="py-2.5 px-3">Recommended Action</th>
                          <th className="py-2.5 px-3">Expected Impact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1A1A1A]/10 font-serif">
                        {content.priorityRecommendations.map((rec, idx) => (
                          <tr key={idx} className="hover:bg-[#F2EFE9]">
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 text-[10px] font-sans font-black uppercase tracking-wider border ${
                                  rec.priority === 'P0' || rec.priority === 'High'
                                    ? 'bg-[#8E2828] text-[#FFFFFF] border-[#1A1A1A]'
                                    : rec.priority === 'P1' || rec.priority === 'Medium'
                                    ? 'bg-[#1A1A1A] text-[#F9F7F2] border-[#1A1A1A]'
                                    : 'bg-[#FFFFFF] text-[#1A1A1A] border-[#1A1A1A]'
                                }`}
                              >
                                {rec.priority}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-bold text-[#1A1A1A] whitespace-nowrap">
                              {rec.theme}
                            </td>
                            <td className="py-3 px-3 text-[#1A1A1A] leading-relaxed">
                              {rec.action}
                            </td>
                            <td className="py-3 px-3 text-[#5C5850] font-sans text-xs">
                              {rec.impact}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-12 text-center text-[#5C5850] text-xs font-sans">
              Select a report from the left list to view details or generate a new one.
            </Card>
          )}
        </div>
      </div>

      {/* Generate Report Modal */}
      <Modal
        isOpen={isGenModalOpen}
        onClose={() => setIsGenModalOpen(false)}
        title="Generate Voice of Customer Report"
        description="LOOP will aggregate workspace feedback, compute sentiment & theme metrics, and synthesize an executive digest with recommendations."
        maxWidth="md"
      >
        <form onSubmit={handleGenerateReport} className="space-y-4 font-serif">
          <div>
            <label className="block text-[10px] font-sans font-black uppercase tracking-[0.2em] text-[#5C5850] mb-1">
              Time Period Coverage
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="w-full px-3 py-2 text-[11px] font-sans font-bold uppercase tracking-wider border border-[#1A1A1A] bg-[#FFFFFF] text-[#1A1A1A] outline-none"
            >
              <option value="7d">Last 7 Days (Weekly Pulse)</option>
              <option value="30d">Last 30 Days (Monthly Executive VoC)</option>
              <option value="90d">Last 90 Days (Quarterly Strategy Review)</option>
              <option value="all">All Ingested Feedback (Complete Archive)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-sans font-black uppercase tracking-[0.2em] text-[#5C5850] mb-1">
              Custom Report Title (Optional)
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Q3 2026 Executive Voice-of-Customer Digest"
              className="w-full px-3 py-2 text-xs font-serif border border-[#1A1A1A] bg-[#F9F7F2] text-[#1A1A1A] placeholder-[#5C5850] focus:ring-1 focus:ring-[#1A1A1A] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t-2 border-[#1A1A1A]">
            <Button variant="outline" size="sm" onClick={() => setIsGenModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={generating}
              icon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Synthesize Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

