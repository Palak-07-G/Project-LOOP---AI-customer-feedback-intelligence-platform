import React, { useState } from 'react';
import { AskLoopResult, FeedbackItem, EvidenceSource } from '../types.js';
import { api } from '../lib/api.js';
import { Card, CardHeader } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { SentimentBadge, ChannelBadge } from '../components/ui/Badge.js';
import { FeedbackDetailDrawer } from '../components/feedback/FeedbackDetailDrawer.js';
import {
  Sparkles,
  Send,
  Search,
  Quote,
  ShieldCheck,
  ExternalLink,
  HelpCircle,
  Clock,
  Layers,
} from 'lucide-react';

export const AskLoopPage: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskLoopResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);

  const suggestedQuestions = [
    'Why are users churning or struggling during onboarding?',
    'What are the top complaints regarding billing, invoices, and pricing tiers?',
    'How do users describe mobile app speed, stability, and crashes?',
    'What integrations or webhook capabilities are requested most frequently?',
  ];

  const handleAsk = async (qText?: string) => {
    const query = qText || question;
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    if (qText) setQuestion(qText);

    try {
      const res = await api.askLoop(query.trim());
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to synthesize answer from feedback embeddings.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSourceDetail = async (source: EvidenceSource) => {
    try {
      const item = await api.getFeedbackDetail(source.feedbackId);
      setSelectedFeedback(item);
    } catch (e) {
      // fallback
      setSelectedFeedback({
        id: source.feedbackId,
        content: source.content,
        channel: source.channel,
        sourceRef: null,
        customerLabel: source.customerLabel,
        sentiment: source.sentiment,
        sentimentScore: 0,
        featureArea: source.featureArea,
        status: 'REVIEWED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        themes: [],
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-serif">
      {/* Ask Bar Container */}
      <Card className="bg-[#FFFFFF] border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-[#1A1A1A] text-[#F9F7F2] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-[#5C5850]">Natural Language Discovery</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-[#1A1A1A]">
              Ask LOOP — Grounded Customer Intelligence (RAG)
            </h2>
            <p className="text-xs text-[#5C5850] font-sans mt-0.5">
              AI-synthesized strategic answers grounded in semantic vector embeddings across your verbatim feedback.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="mt-4"
        >
          <div className="relative flex items-center">
            <input
              id="ask-loop-input"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Why are customers complaining about inviting new team members?"
              className="w-full pl-4 pr-28 py-3 text-xs font-serif border-2 border-[#1A1A1A] bg-[#F9F7F2] text-[#1A1A1A] placeholder-[#5C5850] focus:ring-1 focus:ring-[#1A1A1A] outline-none"
            />
            <Button
              id="ask-loop-submit-btn"
              type="submit"
              variant="primary"
              size="sm"
              loading={loading}
              className="absolute right-2 text-xs"
            >
              Ask AI <Send className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </form>

        {/* Suggested Prompts */}
        <div className="mt-4 pt-3 border-t-2 border-[#1A1A1A]/20">
          <span className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-[#5C5850] block mb-2">
            Suggested Research Prompts
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((sq, i) => (
              <button
                key={i}
                onClick={() => handleAsk(sq)}
                className="px-3 py-1.5 text-xs font-serif bg-[#F9F7F2] hover:bg-[#1A1A1A] hover:text-[#F9F7F2] text-[#1A1A1A] border border-[#1A1A1A] transition-all text-left truncate max-w-md"
              >
                &ldquo;{sq}&rdquo;
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-[#8E2828] text-[#FFFFFF] border-2 border-[#1A1A1A] text-xs font-sans font-bold">
          {error}
        </div>
      )}

      {/* Results View */}
      {loading ? (
        <Card className="p-8 text-center space-y-4 bg-[#FFFFFF] border-2 border-[#1A1A1A]">
          <div className="w-12 h-12 bg-[#1A1A1A] text-[#F9F7F2] flex items-center justify-center mx-auto animate-spin">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1 font-serif">
            <h3 className="text-base font-bold text-[#1A1A1A]">
              Retrieving Feedback Embeddings & Synthesizing...
            </h3>
            <p className="text-xs text-[#5C5850] font-sans">
              Searching workspace vector similarity space and cross-referencing customer quotes
            </p>
          </div>
        </Card>
      ) : result ? (
        <div className="space-y-6">
          {/* Answer Card */}
          <Card id="ask-loop-answer-card" className="p-6 space-y-4 bg-[#FFFFFF] border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#1A1A1A]">
              <span className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-[#1A1A1A] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#1B4D3E]" /> Grounded Synthesis
              </span>
              <span className="text-[10px] font-sans font-black uppercase tracking-wider px-2.5 py-0.5 bg-[#1B4D3E] text-[#FFFFFF] border border-[#1A1A1A]">
                Backed by {result.evidenceCount} Verifiable Quotes
              </span>
            </div>

            {/* Answer Content */}
            <div className="text-[#1A1A1A] text-sm leading-relaxed whitespace-pre-line font-serif italic">
              "{result.answer}"
            </div>
          </Card>

          {/* Evidence Sources Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-sans font-black uppercase tracking-[0.15em] text-[#1A1A1A] flex items-center gap-2">
                <Quote className="w-4 h-4 text-[#1A1A1A]" />
                Grounded Evidence Sources ({result.sources.length})
              </h3>
              <span className="text-[11px] font-sans text-[#5C5850]">Click any quote to inspect audit drawer</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.sources.map((source, idx) => (
                <div
                  key={idx}
                  id={`evidence-card-${idx}`}
                  onClick={() => handleOpenSourceDetail(source)}
                  className="p-4 bg-[#FFFFFF] border-2 border-[#1A1A1A] hover:bg-[#F2EFE9] transition-all cursor-pointer shadow-[3px_3px_0px_0px_#1A1A1A] space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <ChannelBadge channel={source.channel} />
                        {source.customerLabel && (
                          <span className="text-[11px] font-sans font-bold text-[#5C5850] truncate">
                            {source.customerLabel}
                          </span>
                        )}
                      </div>
                      <SentimentBadge sentiment={source.sentiment} />
                    </div>

                    <p className="text-xs text-[#1A1A1A] italic leading-relaxed font-serif">
                      "{source.content}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#1A1A1A]/10 flex items-center justify-between text-[10px] font-sans text-[#5C5850]">
                    <span className="uppercase font-bold">{source.featureArea || 'Product Area'}</span>
                    <span className="font-bold text-[#1A1A1A] flex items-center gap-1 hover:underline">
                      View Feedback <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <Card className="p-12 text-center space-y-3 bg-[#FFFFFF] border-2 border-[#1A1A1A]">
          <div className="w-12 h-12 bg-[#F9F7F2] border-2 border-[#1A1A1A] text-[#1A1A1A] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-serif font-bold text-[#1A1A1A]">
            Ask any question across your feedback archive
          </h3>
          <p className="text-xs text-[#5C5850] font-sans max-w-md mx-auto leading-relaxed">
            LOOP retrieves exact customer verbatims, analyzes underlying root causes, and returns an executive response with verifiable evidence citations.
          </p>
        </Card>
      )}

      {/* Drawer */}
      <FeedbackDetailDrawer
        feedback={selectedFeedback}
        isOpen={!!selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        onUpdated={() => {}}
      />
    </div>
  );
};

