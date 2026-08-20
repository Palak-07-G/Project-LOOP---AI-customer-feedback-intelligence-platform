import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { api } from '../../lib/api';
import { LifeBuoy, Star, HeartHandshake, PhoneCall, CheckCircle2, Sparkles } from 'lucide-react';

interface SimulateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SimulateChannelModal: React.FC<SimulateChannelModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loadingChannel, setLoadingChannel] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const channels = [
    {
      id: 'support',
      title: 'Support Tickets',
      sourceName: 'Simulate Zendesk / Intercom',
      description: 'Ingest realistic customer inquiries regarding 2FA, billing discrepancies, and integrations.',
      icon: LifeBuoy,
    },
    {
      id: 'appstore',
      title: 'App Store Reviews',
      sourceName: 'Simulate Apple & Google Play',
      description: 'Ingest mobile user reviews regarding tablet layouts, responsiveness, and notification frequency.',
      icon: Star,
    },
    {
      id: 'nps',
      title: 'NPS & CSAT Surveys',
      sourceName: 'Simulate Typeform / Delighted',
      description: 'Ingest customer satisfaction scores with qualitative comments on product value and pricing tiers.',
      icon: HeartHandshake,
    },
    {
      id: 'sales',
      title: 'Sales Call Notes',
      sourceName: 'Simulate Gong / Chorus Sync',
      description: 'Ingest enterprise procurement notes on SOC2 compliance, data residency, and invoicing.',
      icon: PhoneCall,
    },
  ];

  const handleSimulate = async (channelId: 'support' | 'appstore' | 'nps' | 'sales') => {
    setLoadingChannel(channelId);
    setSuccessMessage(null);
    try {
      const res = await api.simulateChannel(channelId);
      setSuccessMessage(`Successfully imported and AI-classified ${res.count} records from ${res.channel}.`);
      onSuccess();
    } catch (err: any) {
      // error
    } finally {
      setLoadingChannel(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Simulate Channel Ingestion"
      description="Simulate real-time ingestion from external customer channels without setting up live API webhooks."
      maxWidth="lg"
    >
      <div className="space-y-4 font-serif">
        {successMessage && (
          <div className="p-3.5 bg-[#1B4D3E] text-[#FFFFFF] border-2 border-[#1A1A1A] text-xs font-sans font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#FFFFFF] shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {channels.map((ch) => {
            const Icon = ch.icon;
            const isLoading = loadingChannel === ch.id;

            return (
              <div
                key={ch.id}
                className="p-4 border-2 border-[#1A1A1A] bg-[#FFFFFF] shadow-[3px_3px_0px_0px_#1A1A1A] flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 border border-[#1A1A1A] bg-[#F9F7F2] text-[#1A1A1A]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-serif font-bold text-[#1A1A1A]">{ch.title}</h4>
                      <span className="text-[9px] font-mono text-[#5C5850] uppercase font-bold">{ch.sourceName}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#5C5850] leading-relaxed">{ch.description}</p>
                </div>

                <Button
                  id={`simulate-${ch.id}-btn`}
                  variant="secondary"
                  size="sm"
                  loading={isLoading}
                  onClick={() => handleSimulate(ch.id as any)}
                  className="w-full text-xs"
                >
                  Import {ch.title}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t-2 border-[#1A1A1A] flex justify-between items-center text-xs font-sans text-[#5C5850]">
          <span className="flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider text-[#1A1A1A]">
            <Sparkles className="w-3.5 h-3.5 text-[#1A1A1A]" />
            Automatic Gemini Intelligence extraction
          </span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

