import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { client } from '../db.js';
import { requireAuth } from '../auth.js';
import { classifyFeedback, generateSimpleEmbedding } from '../ai.js';

export const feedbackRouter = Router();

// Zod schema for manual creation
const CreateFeedbackSchema = z.object({
  content: z.string().min(3, 'Feedback content is required'),
  channel: z.string().min(1, 'Channel is required'),
  customerLabel: z.string().optional().default('Direct Customer'),
  sourceRef: z.string().optional(),
  createdAt: z.string().optional(),
});

// GET /api/feedback - Paginated, filtered, tenant-isolated
feedbackRouter.get('/', async (req: Request, res: Response) => {
  const session = await requireAuth(req, res);
  if (!session) return;

  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const channel = req.query.channel as string;
    const sentiment = req.query.sentiment as string;
    const status = req.query.status as string;
    const themeId = req.query.themeId as string;
    const search = req.query.search as string;

    const whereClauses = ['f.workspaceId = ?'];
    const args: any[] = [session.workspaceId];

    if (channel && channel !== 'ALL') {
      whereClauses.push('f.channel = ?');
      args.push(channel);
    }

    if (sentiment && sentiment !== 'ALL') {
      whereClauses.push('f.sentiment = ?');
      args.push(sentiment);
    }

    if (status && status !== 'ALL') {
      whereClauses.push('f.status = ?');
      args.push(status);
    }

    if (themeId && themeId !== 'ALL') {
      whereClauses.push('EXISTS (SELECT 1 FROM feedback_themes ft WHERE ft.feedbackId = f.id AND ft.themeId = ?)');
      args.push(themeId);
    }

    if (search && search.trim() !== '') {
      whereClauses.push('(f.content LIKE ? OR f.customerLabel LIKE ? OR f.sourceRef LIKE ?)');
      const term = `%${search.trim()}%`;
      args.push(term, term, term);
    }

    const whereSql = whereClauses.join(' AND ');

    // Get Total Count
    const countRes = await client.execute({
      sql: `SELECT COUNT(*) as total FROM feedback f WHERE ${whereSql}`,
      args,
    });
    const total = Number(countRes.rows[0]?.total || 0);

    // Get Paginated Rows
    const feedbackRes = await client.execute({
      sql: `SELECT f.id, f.content, f.channel, f.sourceRef, f.customerLabel, f.sentiment, 
                   f.sentimentScore, f.featureArea, f.status, f.createdAt, f.updatedAt
            FROM feedback f 
            WHERE ${whereSql}
            ORDER BY f.createdAt DESC
            LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    });

    // Attach themes to each feedback item
    const feedbackList = [];
    for (const row of feedbackRes.rows) {
      const themesRes = await client.execute({
        sql: `SELECT t.id, t.name, t.color, ft.confidence 
              FROM themes t 
              JOIN feedback_themes ft ON t.id = ft.themeId 
              WHERE ft.feedbackId = ?`,
        args: [row.id],
      });

      feedbackList.push({
        id: String(row.id),
        content: String(row.content),
        channel: String(row.channel),
        sourceRef: row.sourceRef ? String(row.sourceRef) : null,
        customerLabel: row.customerLabel ? String(row.customerLabel) : null,
        sentiment: String(row.sentiment),
        sentimentScore: Number(row.sentimentScore),
        featureArea: row.featureArea ? String(row.featureArea) : null,
        status: String(row.status),
        createdAt: String(row.createdAt),
        updatedAt: String(row.updatedAt),
        themes: themesRes.rows.map((t) => ({
          id: String(t.id),
          name: String(t.name),
          color: String(t.color),
          confidence: Number(t.confidence),
        })),
      });
    }

    res.json({
      success: true,
      data: {
        items: feedbackList,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (err: any) {
    console.error('[Feedback] List error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch feedback.' } });
  }
});

// POST /api/feedback - Add manual feedback (Admin or Analyst)
feedbackRouter.post('/', async (req: Request, res: Response) => {
  const session = await requireAuth(req, res);
  if (!session) return;

  if (session.role === 'VIEWER') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Viewers cannot create new feedback.' },
    });
  }

  try {
    const parsed = CreateFeedbackSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Invalid input data' },
      });
    }

    const { content, channel, customerLabel, sourceRef } = parsed.data;
    const createdAt = parsed.data.createdAt || new Date().toISOString();
    const now = new Date().toISOString();
    const feedbackId = `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Retrieve existing themes in workspace for AI classification context
    const existingThemesRes = await client.execute({
      sql: `SELECT id, name FROM themes WHERE workspaceId = ?`,
      args: [session.workspaceId],
    });
    const themeNames = existingThemesRes.rows.map((r) => String(r.name));

    // Run AI classification
    const aiResult = await classifyFeedback(content, themeNames);

    // Save Feedback
    await client.execute({
      sql: `INSERT INTO feedback (id, content, channel, sourceRef, customerLabel, sentiment, sentimentScore, featureArea, status, createdAt, updatedAt, workspaceId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        feedbackId,
        content,
        channel,
        sourceRef || `MANUAL-${Date.now().toString().slice(-4)}`,
        customerLabel || 'Customer',
        aiResult.sentiment,
        aiResult.sentimentScore,
        aiResult.featureArea,
        'NEW',
        createdAt,
        now,
        session.workspaceId,
      ],
    });

    // Associate themes (create theme if new, else attach existing)
    for (const themeName of aiResult.themes) {
      let themeId: string | null = null;
      const matched = existingThemesRes.rows.find((t) => String(t.name).toLowerCase() === themeName.toLowerCase());

      if (matched) {
        themeId = String(matched.id);
      } else {
        // Create new theme
        themeId = `thm-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
        await client.execute({
          sql: `INSERT OR IGNORE INTO themes (id, name, description, color, workspaceId, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [themeId, themeName, `Auto-detected theme for ${themeName}`, '#6366f1', session.workspaceId, now, now],
        });
      }

      if (themeId) {
        await client.execute({
          sql: `INSERT OR IGNORE INTO feedback_themes (feedbackId, themeId, confidence) VALUES (?, ?, ?)`,
          args: [feedbackId, themeId, 0.95],
        });
      }
    }

    // Generate and store embedding
    const vector = generateSimpleEmbedding(content);
    await client.execute({
      sql: `INSERT OR REPLACE INTO embeddings (id, feedbackId, vector, createdAt) VALUES (?, ?, ?, ?)`,
      args: [`emb-${feedbackId}`, feedbackId, JSON.stringify(vector), now],
    });

    res.status(201).json({
      success: true,
      data: {
        id: feedbackId,
        sentiment: aiResult.sentiment,
        sentimentScore: aiResult.sentimentScore,
        featureArea: aiResult.featureArea,
        themes: aiResult.themes,
        rationale: aiResult.rationale,
      },
    });
  } catch (err: any) {
    console.error('[Feedback] Create error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create feedback.' } });
  }
});

// GET /api/feedback/:id - Feedback Detail
feedbackRouter.get('/:id', async (req: Request, res: Response) => {
  const session = await requireAuth(req, res);
  if (!session) return;

  try {
    const feedbackRes = await client.execute({
      sql: `SELECT f.* FROM feedback f WHERE f.id = ? AND f.workspaceId = ?`,
      args: [req.params.id, session.workspaceId],
    });

    if (feedbackRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Feedback not found.' } });
    }

    const row = feedbackRes.rows[0];

    const themesRes = await client.execute({
      sql: `SELECT t.id, t.name, t.color, ft.confidence 
            FROM themes t 
            JOIN feedback_themes ft ON t.id = ft.themeId 
            WHERE ft.feedbackId = ?`,
      args: [row.id],
    });

    res.json({
      success: true,
      data: {
        id: String(row.id),
        content: String(row.content),
        channel: String(row.channel),
        sourceRef: row.sourceRef ? String(row.sourceRef) : null,
        customerLabel: row.customerLabel ? String(row.customerLabel) : null,
        sentiment: String(row.sentiment),
        sentimentScore: Number(row.sentimentScore),
        featureArea: row.featureArea ? String(row.featureArea) : null,
        status: String(row.status),
        createdAt: String(row.createdAt),
        updatedAt: String(row.updatedAt),
        themes: themesRes.rows.map((t) => ({
          id: String(t.id),
          name: String(t.name),
          color: String(t.color),
          confidence: Number(t.confidence),
        })),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to retrieve feedback.' } });
  }
});

// PATCH /api/feedback/:id/status - Update Status (Admin or Analyst)
feedbackRouter.patch('/:id/status', async (req: Request, res: Response) => {
  const session = await requireAuth(req, res);
  if (!session) return;

  if (session.role === 'VIEWER') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Viewers do not have permission to modify feedback status.' },
    });
  }

  const { status } = req.body;
  if (!['NEW', 'REVIEWED', 'ACTIONED'].includes(status)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Status must be NEW, REVIEWED, or ACTIONED' } });
  }

  try {
    const updateRes = await client.execute({
      sql: `UPDATE feedback SET status = ?, updatedAt = ? WHERE id = ? AND workspaceId = ?`,
      args: [status, new Date().toISOString(), req.params.id, session.workspaceId],
    });

    if (updateRes.rowsAffected === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Feedback record not found.' } });
    }

    res.json({ success: true, data: { id: req.params.id, status } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update status.' } });
  }
});

// POST /api/feedback/:id/classify - Manual Re-classify (Admin or Analyst)
feedbackRouter.post('/:id/classify', async (req: Request, res: Response) => {
  const session = await requireAuth(req, res);
  if (!session) return;

  if (session.role === 'VIEWER') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Viewers cannot re-classify feedback.' },
    });
  }

  try {
    const feedbackRes = await client.execute({
      sql: `SELECT id, content FROM feedback WHERE id = ? AND workspaceId = ?`,
      args: [req.params.id, session.workspaceId],
    });

    if (feedbackRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Feedback not found.' } });
    }

    const content = String(feedbackRes.rows[0].content);

    // Get current themes
    const existingThemesRes = await client.execute({
      sql: `SELECT id, name FROM themes WHERE workspaceId = ?`,
      args: [session.workspaceId],
    });
    const themeNames = existingThemesRes.rows.map((r) => String(r.name));

    // Re-run AI classification
    const aiResult = await classifyFeedback(content, themeNames);
    const now = new Date().toISOString();

    // Update feedback table
    await client.execute({
      sql: `UPDATE feedback SET sentiment = ?, sentimentScore = ?, featureArea = ?, updatedAt = ? WHERE id = ? AND workspaceId = ?`,
      args: [aiResult.sentiment, aiResult.sentimentScore, aiResult.featureArea, now, req.params.id, session.workspaceId],
    });

    // Clear old theme associations
    await client.execute({
      sql: `DELETE FROM feedback_themes WHERE feedbackId = ?`,
      args: [req.params.id],
    });

    // Associate newly classified themes
    for (const themeName of aiResult.themes) {
      let themeId: string | null = null;
      const matched = existingThemesRes.rows.find((t) => String(t.name).toLowerCase() === themeName.toLowerCase());

      if (matched) {
        themeId = String(matched.id);
      } else {
        themeId = `thm-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
        await client.execute({
          sql: `INSERT OR IGNORE INTO themes (id, name, description, color, workspaceId, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [themeId, themeName, `Auto-created theme for ${themeName}`, '#6366f1', session.workspaceId, now, now],
        });
      }

      if (themeId) {
        await client.execute({
          sql: `INSERT OR IGNORE INTO feedback_themes (feedbackId, themeId, confidence) VALUES (?, ?, ?)`,
          args: [req.params.id, themeId, 0.95],
        });
      }
    }

    res.json({
      success: true,
      data: {
        id: req.params.id,
        sentiment: aiResult.sentiment,
        sentimentScore: aiResult.sentimentScore,
        featureArea: aiResult.featureArea,
        themes: aiResult.themes,
        rationale: aiResult.rationale,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to re-classify feedback.' } });
  }
});

// DELETE /api/feedback/:id - Delete (Admin only)
feedbackRouter.delete('/:id', async (req: Request, res: Response) => {
  const session = await requireAuth(req, res);
  if (!session) return;

  if (session.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Only Admins can delete feedback records.' },
    });
  }

  try {
    await client.execute({
      sql: `DELETE FROM feedback WHERE id = ? AND workspaceId = ?`,
      args: [req.params.id, session.workspaceId],
    });
    res.json({ success: true, message: 'Feedback deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to delete feedback.' } });
  }
});

// POST /api/feedback/import - CSV Import with row-by-row validation
feedbackRouter.post('/import', async (req: Request, res: Response) => {
  const session = await requireAuth(req, res);
  if (!session) return;

  if (session.role === 'VIEWER') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Viewers cannot import CSV feedback.' },
    });
  }

  const { rows } = req.body; // Array of objects
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_CSV', message: 'No rows provided for import.' } });
  }

  const validChannels = ['Support Ticket', 'App Store Review', 'NPS Survey', 'CSAT Survey', 'Sales Call', 'Community Post', 'Email', 'Other'];
  let importedCount = 0;
  const errors: Array<{ row: number; error: string }> = [];

  const existingThemesRes = await client.execute({
    sql: `SELECT id, name FROM themes WHERE workspaceId = ?`,
    args: [session.workspaceId],
  });
  const themeNames = existingThemesRes.rows.map((r) => String(r.name));

  const now = new Date().toISOString();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    const content = row.content || row.Content || row.feedback || row.Feedback;
    const channel = row.channel || row.Channel || 'Support Ticket';
    const customerLabel = row.customer_label || row.customer || row.Customer || 'CSV Imported User';
    const createdAt = row.created_at || row.date || row.Date || now;

    if (!content || typeof content !== 'string' || content.trim().length < 3) {
      errors.push({ row: rowNum, error: 'Missing or empty content' });
      continue;
    }

    if (isNaN(new Date(createdAt).getTime())) {
      errors.push({ row: rowNum, error: 'Invalid date format' });
      continue;
    }

    try {
      const feedbackId = `fb-csv-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`;
      const aiResult = await classifyFeedback(content, themeNames);

      await client.execute({
        sql: `INSERT INTO feedback (id, content, channel, sourceRef, customerLabel, sentiment, sentimentScore, featureArea, status, createdAt, updatedAt, workspaceId)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          feedbackId,
          content.trim(),
          channel,
          `CSV-ROW-${rowNum}`,
          customerLabel,
          aiResult.sentiment,
          aiResult.sentimentScore,
          aiResult.featureArea,
          'NEW',
          new Date(createdAt).toISOString(),
          now,
          session.workspaceId,
        ],
      });

      for (const tName of aiResult.themes) {
        let themeId: string | null = null;
        const matched = existingThemesRes.rows.find((t) => String(t.name).toLowerCase() === tName.toLowerCase());
        if (matched) themeId = String(matched.id);
        else {
          themeId = `thm-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
          await client.execute({
            sql: `INSERT OR IGNORE INTO themes (id, name, description, color, workspaceId, createdAt, updatedAt)
                  VALUES (?, ?, ?, ?, ?, ?, ?)`,
            args: [themeId, tName, `Imported theme ${tName}`, '#6366f1', session.workspaceId, now, now],
          });
        }
        if (themeId) {
          await client.execute({
            sql: `INSERT OR IGNORE INTO feedback_themes (feedbackId, themeId, confidence) VALUES (?, ?, ?)`,
            args: [feedbackId, themeId, 0.95],
          });
        }
      }

      const vector = generateSimpleEmbedding(content);
      await client.execute({
        sql: `INSERT OR REPLACE INTO embeddings (id, feedbackId, vector, createdAt) VALUES (?, ?, ?, ?)`,
        args: [`emb-${feedbackId}`, feedbackId, JSON.stringify(vector), now],
      });

      importedCount++;
    } catch (e: any) {
      errors.push({ row: rowNum, error: 'Database insertion error' });
    }
  }

  res.json({
    success: true,
    data: {
      imported: importedCount,
      failed: errors.length,
      errors,
    },
  });
});

// POST /api/feedback/simulate - Ingest realistic simulated batches
feedbackRouter.post('/simulate', async (req: Request, res: Response) => {
  const session = await requireAuth(req, res);
  if (!session) return;

  if (session.role === 'VIEWER') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Viewers cannot simulate channel ingestion.' },
    });
  }

  const { channelType } = req.body; // 'support' | 'appstore' | 'nps' | 'sales'

  const channelData: Record<string, { channel: string; items: Array<{ text: string; sent: 'POS' | 'NEU' | 'NEG'; score: number; area: string; customer: string }> }> = {
    support: {
      channel: 'Support Ticket',
      items: [
        { text: 'Users are unable to reset 2FA when switching mobile phones without an admin overriding it.', sent: 'NEG', score: -0.75, area: 'Authentication', customer: 'Fintech Corp #99' },
        { text: 'Need a way to automatically tag high-priority customer tickets in Zendesk.', sent: 'NEU', score: 0.1, area: 'Integrations', customer: 'Support Lead #12' },
        { text: 'Live chat support resolved our SSO certificate outage in 8 minutes. Truly awesome support.', sent: 'POS', score: 0.94, area: 'Support', customer: 'Acme VIP #02' },
        { text: 'Invoice download returns a 500 server error when clicking download all receipts for 2025.', sent: 'NEG', score: -0.82, area: 'Billing', customer: 'Accounting #40' },
      ],
    },
    appstore: {
      channel: 'App Store Review',
      items: [
        { text: 'App is super smooth on iPad with keyboard shortcuts, but portrait mode occasionally glitches.', sent: 'NEU', score: 0.25, area: 'Mobile', customer: 'iPad Power User' },
        { text: 'Battery drain is almost zero after the latest performance patch. 5 stars!', sent: 'POS', score: 0.96, area: 'Mobile', customer: 'Mobile Exec #19' },
        { text: 'Push notifications sound chime is too loud and cannot be customized in iOS settings.', sent: 'NEG', score: -0.45, area: 'Mobile', customer: 'Designer #88' },
      ],
    },
    nps: {
      channel: 'NPS Survey',
      items: [
        { text: 'LOOP is the single most valuable tool our product management organization adopted this year.', sent: 'POS', score: 0.98, area: 'Reporting', customer: 'VP Product #01' },
        { text: 'Setup was a breeze, but team member invitations should have an instant resend link.', sent: 'NEU', score: 0.15, area: 'Onboarding', customer: 'Growth Team #33' },
        { text: 'Pricing seat minimum of 10 seats is frustrating for smaller agile pods.', sent: 'NEG', score: -0.6, area: 'Pricing', customer: 'Startup Founder' },
      ],
    },
    sales: {
      channel: 'Sales Call',
      items: [
        { text: 'Prospect was thrilled with SOC2 isolation and granular Admin/Analyst/Viewer roles.', sent: 'POS', score: 0.91, area: 'Authentication', customer: 'Bank Security Officer' },
        { text: 'Enterprise lead asked if we support European data residency in Frankfurt.', sent: 'NEU', score: 0.0, area: 'Infrastructure', customer: 'EU Enterprise Lead' },
        { text: 'Deal stalled because customer required custom invoice VAT printing on wire transfers.', sent: 'NEG', score: -0.65, area: 'Billing', customer: 'Procurement VP' },
      ],
    },
  };

  const selected = channelData[channelType] || channelData.support;
  const now = new Date().toISOString();
  let count = 0;

  for (const item of selected.items) {
    const feedbackId = `fb-sim-${Date.now()}-${count}-${Math.random().toString(36).substring(2, 5)}`;
    await client.execute({
      sql: `INSERT INTO feedback (id, content, channel, sourceRef, customerLabel, sentiment, sentimentScore, featureArea, status, createdAt, updatedAt, workspaceId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        feedbackId,
        item.text,
        selected.channel,
        `SIM-${Date.now().toString().slice(-4)}`,
        item.customer,
        item.sent,
        item.score,
        item.area,
        'NEW',
        now,
        now,
        session.workspaceId,
      ],
    });

    const vector = generateSimpleEmbedding(item.text);
    await client.execute({
      sql: `INSERT OR REPLACE INTO embeddings (id, feedbackId, vector, createdAt) VALUES (?, ?, ?, ?)`,
      args: [`emb-${feedbackId}`, feedbackId, JSON.stringify(vector), now],
    });

    count++;
  }

  res.json({
    success: true,
    message: `Successfully imported ${count} simulated ${selected.channel} records into your workspace.`,
    data: { count, channel: selected.channel },
  });
});
