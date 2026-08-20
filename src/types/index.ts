export type UserRole = 'ADMIN' | 'ANALYST' | 'VIEWER';
export type Sentiment = 'POS' | 'NEU' | 'NEG';
export type FeedbackStatus = 'NEW' | 'REVIEWED' | 'ACTIONED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  workspaceId: string;
  workspaceName: string;
}

export interface Workspace {
  id: string;
  name: string;
  createdAt: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  color: string;
  confidence?: number;
  feedbackCount?: number;
  posCount?: number;
  neuCount?: number;
  negCount?: number;
}

export interface FeedbackItem {
  id: string;
  content: string;
  channel: string;
  sourceRef: string | null;
  customerLabel: string | null;
  sentiment: Sentiment;
  sentimentScore: number;
  featureArea: string | null;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
  themes: Theme[];
}

export interface KPIStats {
  totalFeedback: { value: number; growth: number; periodLabel: string };
  negativeRate: { value: number; growth: number; periodLabel: string };
  newThisWeek: { value: number; label: string };
  topTheme: { name: string; count: number; label: string };
}

export interface SentimentBreakdown {
  positive: { count: number; percentage: number };
  neutral: { count: number; percentage: number };
  negative: { count: number; percentage: number };
  total: number;
}

export interface VolumePoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export interface TopThemeItem {
  id: string;
  name: string;
  color: string;
  count: number;
  posCount: number;
  neuCount: number;
  negCount: number;
}

export interface DashboardData {
  kpi: KPIStats;
  sentimentBreakdown: SentimentBreakdown;
  volumeOverTime: VolumePoint[];
  topThemes: TopThemeItem[];
  channelBreakdown: Array<{ channel: string; count: number }>;
}

export interface ThemeTrend {
  id: string;
  name: string;
  description: string;
  color: string;
  feedbackCount: number;
  previousCount: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  positivePercentage: number;
  negativePercentage: number;
  growth: number;
  trendStatus: 'Spiking' | 'Growing' | 'Stable' | 'Declining';
}

export interface EvidenceSource {
  feedbackId: string;
  content: string;
  channel: string;
  customerLabel: string | null;
  sentiment: Sentiment;
  featureArea: string | null;
  similarity: number;
}

export interface AskLoopResult {
  question: string;
  answer: string;
  evidenceCount: number;
  sources: EvidenceSource[];
}

export interface PriorityRecommendation {
  priority: string;
  theme: string;
  action: string;
  impact: string;
}

export interface VoCReportContent {
  executiveSummary: string;
  period: string;
  totalFeedbackAnalyzed: number;
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  topThemes: Array<{ name: string; count: number; growth: string; sentiment: string }>;
  whatCustomersLove: string[];
  whatCustomersStruggleWith: string[];
  emergingTrends: string[];
  keyQuotes: Array<{ quote: string; customer: string; channel: string }>;
  priorityRecommendations: PriorityRecommendation[];
}

export interface ReportItem {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  generatedBy: string;
  content?: VoCReportContent;
}

export interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
