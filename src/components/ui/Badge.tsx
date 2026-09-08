import React from 'react';
import { Sentiment, FeedbackStatus, UserRole } from '../../types';

export const SentimentBadge: React.FC<{ sentiment: Sentiment; score?: number; className?: string }> = ({
  sentiment,
  score,
  className = '',
}) => {
  if (sentiment === 'POS') {
    return (
      <span
        id={`sentiment-pos-${score || ''}`}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 border border-[#1A1A1A] text-[10px] font-sans font-bold uppercase tracking-[0.1em] bg-[#1A1A1A] text-[#F9F7F2] ${className}`}
      >
        <span className="w-1.5 h-1.5 bg-[#4ADE80]" />
        Positive {score !== undefined && <span className="font-mono opacity-80">({score > 0 ? `+${score}` : score})</span>}
      </span>
    );
  }

  if (sentiment === 'NEG') {
    return (
      <span
        id={`sentiment-neg-${score || ''}`}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 border border-[#8E2828] text-[10px] font-sans font-bold uppercase tracking-[0.1em] bg-[#8E2828] text-[#F9F7F2] ${className}`}
      >
        <span className="w-1.5 h-1.5 bg-[#FCA5A5]" />
        Negative {score !== undefined && <span className="font-mono opacity-80">({score})</span>}
      </span>
    );
  }

  return (
    <span
      id={`sentiment-neu-${score || ''}`}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 border border-[#1A1A1A] text-[10px] font-sans font-bold uppercase tracking-[0.1em] bg-[#F2EFE9] text-[#1A1A1A] ${className}`}
    >
      <span className="w-1.5 h-1.5 bg-[#8A6218]" />
      Neutral {score !== undefined && <span className="font-mono opacity-80">({score})</span>}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: FeedbackStatus; className?: string }> = ({ status, className = '' }) => {
  switch (status) {
    case 'NEW':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 border border-[#1A1A1A] text-[10px] font-sans font-bold uppercase tracking-[0.15em] bg-[#1A1A1A] text-[#F9F7F2] ${className}`}>
          New
        </span>
      );
    case 'REVIEWED':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 border border-[#1A1A1A] text-[10px] font-sans font-bold uppercase tracking-[0.15em] bg-[#F2EFE9] text-[#1A1A1A] ${className}`}>
          Reviewed
        </span>
      );
    case 'ACTIONED':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 border border-[#1B4D3E] text-[10px] font-sans font-bold uppercase tracking-[0.15em] bg-[#1B4D3E] text-[#F9F7F2] ${className}`}>
          Actioned
        </span>
      );
  }
};

export const RoleBadge: React.FC<{ role: UserRole; className?: string }> = ({ role, className = '' }) => {
  switch (role) {
    case 'ADMIN':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 border border-[#1A1A1A] text-[9px] font-sans font-black uppercase tracking-[0.2em] bg-[#1A1A1A] text-[#F9F7F2] ${className}`}>
          Admin
        </span>
      );
    case 'ANALYST':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 border border-[#1A1A1A] text-[9px] font-sans font-bold uppercase tracking-[0.2em] bg-[#F2EFE9] text-[#1A1A1A] ${className}`}>
          Analyst
        </span>
      );
    case 'VIEWER':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 border border-[#1A1A1A]/40 text-[9px] font-sans font-bold uppercase tracking-[0.2em] bg-transparent text-[#5C5850] ${className}`}>
          Viewer
        </span>
      );
  }
};

export const ChannelBadge: React.FC<{ channel: string; className?: string }> = ({ channel, className = '' }) => {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 border border-[#1A1A1A] text-[10px] font-sans font-bold uppercase tracking-[0.1em] bg-[#F9F7F2] text-[#1A1A1A] ${className}`}>
      {channel}
    </span>
  );
};

