import { Router, Request, Response } from 'express';
import { requireAuth } from '../auth';
import { getDashboardData, getThemesTrendData } from '../analytics';

export const analyticsRouter = Router();

// GET /api/analytics/dashboard
analyticsRouter.get('/dashboard', async (req: Request, res: Response) => {
  const session = await requireAuth(req, res);
  if (!session) return;

  try {
    const { dateRange, channel, sentiment, status, search, themeId } = req.query;

    const data = await getDashboardData(session.workspaceId, {
      dateRange: dateRange as string,
      channel: channel as string,
      sentiment: sentiment as string,
      status: status as string,
      search: search as string,
      themeId: themeId as string,
    });

    res.json({ success: true, data });
  } catch (err: any) {
    console.error('[Analytics] Dashboard error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to calculate dashboard analytics.' } });
  }
});

// GET /api/analytics/trends
analyticsRouter.get('/trends', async (req: Request, res: Response) => {
  const session = await requireAuth(req, res);
  if (!session) return;

  try {
    const days = parseInt(req.query.days as string) || 30;
    const data = await getThemesTrendData(session.workspaceId, days);
    res.json({ success: true, data });
  } catch (err: any) {
    console.error('[Analytics] Trends error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to calculate theme trends.' } });
  }
});
