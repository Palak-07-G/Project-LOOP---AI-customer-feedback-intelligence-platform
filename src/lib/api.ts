import {
  User,
  DashboardData,
  FeedbackItem,
  Theme,
  ThemeTrend,
  AskLoopResult,
  ReportItem,
  MemberItem,
  FeedbackStatus,
} from '../types';

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code = 'UNKNOWN_ERROR', status = 500) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('loop_auth_token');
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include',
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok || json.success === false) {
    const errorMsg = json.error?.message || response.statusText || 'An unexpected error occurred';
    const errorCode = json.error?.code || 'HTTP_ERROR';
    throw new ApiError(errorMsg, errorCode, response.status);
  }

  return json.data as T;
}

export const api = {
  // Auth
  async getMe() {
    return request<{ user: User }>('/api/auth/me');
  },
  async login(email: string, password: string) {
    return request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  async signup(name: string, email: string, password: string, workspaceName: string) {
    return request<{ token: string; user: User }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, workspaceName }),
    });
  },
  async logout() {
    return request<{ success: boolean }>('/api/auth/logout', { method: 'POST' });
  },
  async demoSwitch(role: 'ADMIN' | 'ANALYST' | 'VIEWER' | 'GLOBEX') {
    return request<{ token: string; user: User }>('/api/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  },

  // Dashboard & Analytics
  async getDashboard(filters: {
    dateRange?: string;
    channel?: string;
    sentiment?: string;
    status?: string;
    themeId?: string;
    search?: string;
  } = {}) {
    const params = new URLSearchParams();
    if (filters.dateRange) params.set('dateRange', filters.dateRange);
    if (filters.channel) params.set('channel', filters.channel);
    if (filters.sentiment) params.set('sentiment', filters.sentiment);
    if (filters.status) params.set('status', filters.status);
    if (filters.themeId) params.set('themeId', filters.themeId);
    if (filters.search) params.set('search', filters.search);

    return request<DashboardData>(`/api/analytics/dashboard?${params.toString()}`);
  },

  async getTrends(days: number = 30) {
    return request<{ themes: ThemeTrend[]; spikingThemes: ThemeTrend[] }>(`/api/analytics/trends?days=${days}`);
  },

  // Feedback
  async getFeedbackList(params: {
    page?: number;
    limit?: number;
    channel?: string;
    sentiment?: string;
    status?: string;
    themeId?: string;
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.channel) searchParams.set('channel', params.channel);
    if (params.sentiment) searchParams.set('sentiment', params.sentiment);
    if (params.status) searchParams.set('status', params.status);
    if (params.themeId) searchParams.set('themeId', params.themeId);
    if (params.search) searchParams.set('search', params.search);

    return request<{ items: FeedbackItem[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
      `/api/feedback?${searchParams.toString()}`
    );
  },

  async getFeedbackDetail(id: string) {
    return request<FeedbackItem>(`/api/feedback/${id}`);
  },

  async createFeedback(data: { content: string; channel: string; customerLabel?: string; sourceRef?: string; createdAt?: string }) {
    return request<{ id: string; sentiment: string; sentimentScore: number; featureArea: string; themes: string[]; rationale: string }>(
      '/api/feedback',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  async updateFeedbackStatus(id: string, status: FeedbackStatus) {
    return request<{ id: string; status: FeedbackStatus }>(`/api/feedback/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async reclassifyFeedback(id: string) {
    return request<{ id: string; sentiment: string; sentimentScore: number; featureArea: string; themes: string[]; rationale: string }>(
      `/api/feedback/${id}/classify`,
      { method: 'POST' }
    );
  },

  async deleteFeedback(id: string) {
    return request<{ success: boolean }>(`/api/feedback/${id}`, { method: 'DELETE' });
  },

  async importCsvFeedback(rows: any[]) {
    return request<{ imported: number; failed: number; errors: Array<{ row: number; error: string }> }>(
      '/api/feedback/import',
      {
        method: 'POST',
        body: JSON.stringify({ rows }),
      }
    );
  },

  async simulateChannel(channelType: 'support' | 'appstore' | 'nps' | 'sales') {
    return request<{ count: number; channel: string }>('/api/feedback/simulate', {
      method: 'POST',
      body: JSON.stringify({ channelType }),
    });
  },

  // Themes
  async getThemes() {
    return request<{ themes: Theme[] }>('/api/themes');
  },

  async createTheme(data: { name: string; description: string; color: string }) {
    return request<{ id: string; name: string; description: string; color: string }>('/api/themes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getThemeDrilldown(id: string) {
    return request<{ theme: Theme; feedback: FeedbackItem[]; totalFeedback: number }>(`/api/themes/${id}`);
  },

  // Ask LOOP RAG
  async askLoop(question: string) {
    return request<AskLoopResult>('/api/insights/ask', {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  },

  // VoC Reports
  async getReports() {
    return request<{ reports: ReportItem[] }>('/api/reports');
  },

  async getReportDetail(id: string) {
    return request<ReportItem>(`/api/reports/${id}`);
  },

  async generateReport(period: '7d' | '30d' | '90d' | 'all' = '30d', title?: string) {
    return request<ReportItem>('/api/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ period, title }),
    });
  },

  async deleteReport(id: string) {
    return request<{ success: boolean }>(`/api/reports/${id}`, { method: 'DELETE' });
  },

  // Members & Workspace
  async getMembers() {
    return request<{ members: MemberItem[] }>('/api/members');
  },

  async inviteMember(data: { name: string; email: string; role: 'ADMIN' | 'ANALYST' | 'VIEWER' }) {
    return request<MemberItem>('/api/members/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateMemberRole(id: string, role: 'ADMIN' | 'ANALYST' | 'VIEWER') {
    return request<{ id: string; role: string }>(`/api/members/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  async removeMember(id: string) {
    return request<{ success: boolean }>(`/api/members/${id}`, { method: 'DELETE' });
  },
};
