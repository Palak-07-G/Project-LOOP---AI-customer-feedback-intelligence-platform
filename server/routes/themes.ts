import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { client } from '../db.js';
import { requireAuth } from '../auth.js';

export const themesRouter = Router();

const CreateThemeSchema = z.object({
  name: z.string().min(2, 'Theme name is required'),
  description: z.string().min(3, 'Theme description is required'),
  color: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'Invalid hex color code').default('#6366f1'),
});

// GET /api/themes - List all workspace themes
themesRouter.get('/', async (req: Request, res: Response) => {
  const session = await requireAuth(req, res);
  if (!session) return;

  try {
    const themesRes = await client.execute({
      sql: `SELECT t.id, t.name, t.description, t.color, t.createdAt,
                   COUNT(ft.feedbackId) as feedbackCount,
                   SUM(CASE WHEN f.sentiment = 'POS' THEN 1 ELSE 0 END) as posCount,
                   SUM(CASE WHEN f.sentiment = 'NEU' THEN 1 ELSE 0 END) as neuCount,
                   SUM(CASE WHEN f.sentiment = 'NEG' THEN 1 ELSE 0 END) as negCount
            FROM themes t
            LEFT JOIN feedback_themes ft ON t.id = ft.themeId
            LEFT JOIN feedback f ON ft.feedbackId = f.id AND f.workspaceId = t.workspaceId
            WHERE t.workspaceId = ?
            GROUP BY t.id, t.name, t.description, t.color, t.createdAt
            ORDER BY feedbackCount DESC`,
      args: [session.workspaceId],
    });

    const themes = themesRes.rows.map((r: any) => ({
      id: String(r.id),
      name: String(r.name),
      description: String(r.description),
      color: String(r.color || '#6366f1'),
      createdAt: String(r.createdAt),
      feedbackCount: Number(r.feedbackCount || 0),
      posCount: Number(r.posCount || 0),
      neuCount: Number(r.neuCount || 0),
      negCount: Number(r.negCount || 0),
    }));

    res.json({ success: true, data: { themes } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch themes.' } });
  }
});

// POST /api/themes - Create Theme (Admin or Analyst)
themesRouter.post('/', async (req: Request, res: Response) => {
  const session = await requireAuth(req, res);
  if (!session) return;

  if (session.role === 'VIEWER') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Viewers cannot create themes.' } });
  }

  const parsed = CreateThemeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message } });
  }

  const { name, description, color } = parsed.data;
  const themeId = `thm-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
  const now = new Date().toISOString();

  try {
    await client.execute({
      sql: `INSERT INTO themes (id, name, description, color, workspaceId, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [themeId, name, description, color, session.workspaceId, now, now],
    });

    res.status(201).json({
      success: true,
      data: { id: themeId, name, description, color },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create theme.' } });
  }
});

// GET /api/themes/:id - Theme Drilldown
themesRouter.get('/:id', async (req: Request, res: Response) => {
  const session = await requireAuth(req, res);
  if (!session) return;

  try {
    const themeRes = await client.execute({
      sql: `SELECT * FROM themes WHERE id = ? AND workspaceId = ?`,
      args: [req.params.id, session.workspaceId],
    });

    if (themeRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Theme not found.' } });
    }

    const theme = themeRes.rows[0];

    // Get associated feedback items
    const feedbackRes = await client.execute({
      sql: `SELECT f.id, f.content, f.channel, f.customerLabel, f.sentiment, f.sentimentScore, f.status, f.createdAt 
            FROM feedback f 
            JOIN feedback_themes ft ON f.id = ft.feedbackId 
            WHERE ft.themeId = ? AND f.workspaceId = ? 
            ORDER BY f.createdAt DESC 
            LIMIT 50`,
      args: [req.params.id, session.workspaceId],
    });

    const items = feedbackRes.rows.map((r: any) => ({
      id: String(r.id),
      content: String(r.content),
      channel: String(r.channel),
      customerLabel: r.customerLabel ? String(r.customerLabel) : null,
      sentiment: String(r.sentiment),
      sentimentScore: Number(r.sentimentScore),
      status: String(r.status),
      createdAt: String(r.createdAt),
    }));

    res.json({
      success: true,
      data: {
        theme: {
          id: String(theme.id),
          name: String(theme.name),
          description: String(theme.description),
          color: String(theme.color),
          createdAt: String(theme.createdAt),
        },
        feedback: items,
        totalFeedback: items.length,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to get theme drilldown.' } });
  }
});
