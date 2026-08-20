import React, { useState } from 'react';
import { FeedbackItem, FeedbackStatus } from '../../types';
import { SentimentBadge, StatusBadge, ChannelBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { X, Sparkles, RefreshCw, Trash2, Calendar, User, Tag, Layers, CheckCircle2 } from 'lucide-react';

interface FeedbackDetailDrawerProps {
  feedback: FeedbackItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export const FeedbackDetailDrawer: React.FC<FeedbackDetailDrawerProps> = ({
  feedback,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const { isViewer, isAdmin } = useAuth();
  const [reclassifying, setReclassifying] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen || !feedback) return null;

  const handleStatusChange = async (newStatus: FeedbackStatus) => {
    setStatusUpdating(true);
    try {
      await api.updateFeedbackStatus(feedback.id, newStatus);
      feedback.status = newStatus;
      setSuccessNotice(`Status changed to ${newStatus}`);
      setTimeout(() => setSuccessNotice(null), 2500);
      onUpdated();
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleReclassify = async () => {
    setReclassifying(true);
    try {
      const res = await api.reclassifyFeedback(feedback.id);
      feedback.sentiment = res.sentiment as any;
      feedback.sentimentScore = res.sentimentScore;
      feedback.featureArea = res.featureArea;
      setSuccessNotice('Successfully re-classified with Gemini AI');
      setTimeout(() => setSuccessNotice(null), 2500);
      onUpdated();
    } finally {
      setReclassifying(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this customer feedback record?')) return;
    setDeleting(true);
    try {
      await api.deleteFeedback(feedback.id);
      onUpdated();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  const formattedDate = new Date(feedback.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-serif">
      <div className="absolute inset-0 bg-[#1A1A1A]/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F9F7F2] text-[#1A1A1A] border-l-2 border-[#1A1A1A] shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 bg-[#EBE7DF] border-b-2 border-[#1A1A1A] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#1A1A1A] font-bold">[{feedback.id}]</span>
              <ChannelBadge channel={feedback.channel} />
            </div>
            <button
              onClick={onClose}
              className="p-1 border border-[#1A1A1A] bg-[#FFFFFF] hover:bg-[#1A1A1A] hover:text-[#FFFFFF] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notice */}
          {successNotice && (
            <div className="mx-5 mt-4 p-3 bg-[#1B4D3E] text-[#FFFFFF] text-xs font-sans font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FFFFFF]" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Drawer Body */}
          <div className="flex-1 p-5 space-y-6 overflow-y-auto">
            {/* Feedback Content */}
            <div>
              <label className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-[#5C5850] block mb-2">
                Customer Verbatim Quote
              </label>
              <div className="p-4 bg-[#FFFFFF] border-2 border-[#1A1A1A] text-xs font-serif text-[#1A1A1A] leading-relaxed italic">
                "{feedback.content}"
              </div>
            </div>

            {/* AI Classification Card */}
            <div className="p-4 bg-[#FFFFFF] border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-sans font-black uppercase tracking-[0.15em] text-[#1A1A1A] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#1A1A1A]" />
                  Machine Classification
                </span>
                {!isViewer && (
                  <Button
                    id="reclassify-btn"
                    variant="outline"
                    size="sm"
                    loading={reclassifying}
                    onClick={handleReclassify}
                    className="text-[10px] h-6 px-2"
                  >
                    <RefreshCw className="w-2.5 h-2.5 mr-1" />
                    Re-run
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-[#F9F7F2] border border-[#1A1A1A]">
                  <span className="text-[9px] font-sans font-bold uppercase text-[#5C5850] block mb-1">Sentiment</span>
                  <SentimentBadge sentiment={feedback.sentiment} score={feedback.sentimentScore} />
                </div>
                <div className="p-2.5 bg-[#F9F7F2] border border-[#1A1A1A]">
                  <span className="text-[9px] font-sans font-bold uppercase text-[#5C5850] block mb-1">Feature Area</span>
                  <span className="font-serif font-bold text-[#1A1A1A]">
                    {feedback.featureArea || 'General'}
                  </span>
                </div>
              </div>

              {/* Themes */}
              <div>
                <span className="text-[10px] font-sans font-bold uppercase text-[#5C5850] block mb-1.5">Assigned Themes:</span>
                <div className="flex flex-wrap gap-1.5">
                  {feedback.themes?.length > 0 ? (
                    feedback.themes.map((t) => (
                      <span
                        key={t.id}
                        className="px-2 py-0.5 text-[10px] font-sans font-bold uppercase tracking-wider bg-[#FFFFFF] border border-[#1A1A1A] text-[#1A1A1A] flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 bg-[#1A1A1A] inline-block" />
                        {t.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#5C5850] italic">No themes tagged</span>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata Details */}
            <div className="space-y-3 pt-2 text-xs font-sans">
              <div className="flex items-center justify-between py-2 border-b border-[#1A1A1A]/15">
                <span className="text-[#5C5850] flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-wider">
                  <User className="w-3.5 h-3.5" /> Customer Identifier
                </span>
                <span className="font-serif font-bold text-[#1A1A1A]">{feedback.customerLabel || 'Anonymous'}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-[#1A1A1A]/15">
                <span className="text-[#5C5850] flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-wider">
                  <Tag className="w-3.5 h-3.5" /> Reference ID
                </span>
                <span className="font-mono text-[#1A1A1A]">{feedback.sourceRef || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-[#1A1A1A]/15">
                <span className="text-[#5C5850] flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-wider">
                  <Calendar className="w-3.5 h-3.5" /> Ingested Date
                </span>
                <span className="font-mono text-[#1A1A1A]">{formattedDate}</span>
              </div>

              {/* Status Workflow */}
              <div className="py-2">
                <span className="text-[#5C5850] block mb-1.5 font-bold uppercase text-[10px] tracking-wider">Triage Status Workflow</span>
                {!isViewer ? (
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['NEW', 'REVIEWED', 'ACTIONED'] as FeedbackStatus[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        disabled={statusUpdating}
                        className={`py-1.5 px-2 text-[10px] font-sans font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                          feedback.status === s
                            ? 'bg-[#1A1A1A] text-[#F9F7F2] border-[#1A1A1A]'
                            : 'bg-[#FFFFFF] text-[#1A1A1A] border-[#1A1A1A]/40 hover:border-[#1A1A1A]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                ) : (
                  <StatusBadge status={feedback.status} />
                )}
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          {isAdmin && (
            <div className="p-4 border-t-2 border-[#1A1A1A] flex justify-between items-center bg-[#EBE7DF]">
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-3.5 h-3.5" />}
                loading={deleting}
                onClick={handleDelete}
                className="text-xs"
              >
                Delete Record
              </Button>
              <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

