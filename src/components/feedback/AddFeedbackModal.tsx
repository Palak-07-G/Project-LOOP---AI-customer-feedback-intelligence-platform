import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { api } from '../../lib/api';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { SentimentBadge } from '../ui/Badge';

interface AddFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddFeedbackModal: React.FC<AddFeedbackModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [content, setContent] = useState('');
  const [channel, setChannel] = useState('Support Ticket');
  const [customerLabel, setCustomerLabel] = useState('');
  const [sourceRef, setSourceRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [classificationResult, setClassificationResult] = useState<any | null>(null);

  const channels = [
    'Support Ticket',
    'App Store Review',
    'NPS Survey',
    'CSAT Survey',
    'Sales Call',
    'Community Post',
    'Email',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please provide feedback content.');
      return;
    }

    setLoading(true);
    setError(null);
    setClassificationResult(null);

    try {
      const res = await api.createFeedback({
        content: content.trim(),
        channel,
        customerLabel: customerLabel.trim() || undefined,
        sourceRef: sourceRef.trim() || undefined,
      });

      setClassificationResult(res);
      setTimeout(() => {
        setContent('');
        setCustomerLabel('');
        setSourceRef('');
        setClassificationResult(null);
        onSuccess();
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Customer Feedback"
      description="Ingest new feedback. LOOP will automatically classify sentiment, extract themes, and embed for semantic search."
      maxWidth="lg"
    >
      {classificationResult ? (
        <div className="py-6 text-center space-y-4 font-serif">
          <div className="w-12 h-12 bg-[#1A1A1A] text-[#F9F7F2] border border-[#1A1A1A] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-serif font-bold text-[#1A1A1A]">Record Classified & Saved to Ledger</h4>
            <p className="text-xs text-[#5C5850] font-sans mt-1">Intelligence pipeline extracted themes and generated vector embeddings</p>
          </div>
          <div className="p-4 bg-[#F9F7F2] border-2 border-[#1A1A1A] text-left space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-sans font-bold uppercase text-[10px] tracking-wider text-[#5C5850]">Sentiment:</span>
              <SentimentBadge sentiment={classificationResult.sentiment} score={classificationResult.sentimentScore} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans font-bold uppercase text-[10px] tracking-wider text-[#5C5850]">Feature Area:</span>
              <span className="font-serif font-bold text-[#1A1A1A]">{classificationResult.featureArea}</span>
            </div>
            <div className="flex items-start justify-between gap-2">
              <span className="font-sans font-bold uppercase text-[10px] tracking-wider text-[#5C5850]">Themes:</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {classificationResult.themes?.map((t: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 text-[10px] font-sans font-bold uppercase tracking-wider bg-[#FFFFFF] border border-[#1A1A1A] text-[#1A1A1A]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            {classificationResult.rationale && (
              <div className="pt-2 border-t border-[#1A1A1A]/20">
                <span className="font-sans font-bold uppercase text-[10px] tracking-wider text-[#5C5850] block mb-0.5">Classification Rationale:</span>
                <p className="text-[#1A1A1A] italic">"{classificationResult.rationale}"</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 font-serif">
          {error && (
            <div className="p-3 bg-[#8E2828] text-[#FFFFFF] text-xs font-sans font-bold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-sans font-black uppercase tracking-[0.2em] text-[#5C5850] mb-1">
              Feedback Verbatim Quote <span className="text-[#8E2828]">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g. Inviting team members during setup was confusing. Several invites landed in spam..."
              className="w-full px-3 py-2 text-xs font-serif border border-[#1A1A1A] bg-[#F9F7F2] text-[#1A1A1A] placeholder-[#5C5850] focus:ring-1 focus:ring-[#1A1A1A] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-sans font-black uppercase tracking-[0.2em] text-[#5C5850] mb-1">
                Channel Source <span className="text-[#8E2828]">*</span>
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full px-3 py-2 text-[11px] font-sans font-bold uppercase tracking-wider border border-[#1A1A1A] bg-[#FFFFFF] text-[#1A1A1A] outline-none"
              >
                {channels.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-sans font-black uppercase tracking-[0.2em] text-[#5C5850] mb-1">
                Customer Identifier (Optional)
              </label>
              <input
                type="text"
                value={customerLabel}
                onChange={(e) => setCustomerLabel(e.target.value)}
                placeholder="e.g. Enterprise #409, Sarah @ Stripe"
                className="w-full px-3 py-2 text-xs font-mono border border-[#1A1A1A] bg-[#F9F7F2] text-[#1A1A1A] placeholder-[#5C5850] focus:ring-1 focus:ring-[#1A1A1A] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-sans font-black uppercase tracking-[0.2em] text-[#5C5850] mb-1">
              External Reference ID (Optional)
            </label>
            <input
              type="text"
              value={sourceRef}
              onChange={(e) => setSourceRef(e.target.value)}
              placeholder="e.g. ZENDESK-8921, GONG-CALL-12"
              className="w-full px-3 py-2 text-xs font-mono border border-[#1A1A1A] bg-[#F9F7F2] text-[#1A1A1A] placeholder-[#5C5850] focus:ring-1 focus:ring-[#1A1A1A] outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t-2 border-[#1A1A1A]">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#5C5850] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#1A1A1A]" />
              Auto-classified via Gemini
            </span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={loading}>
                Save & Classify
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};

