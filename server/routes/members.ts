import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { client } from '../db.js';
import { requireAuth } from '../auth.js';

export const membersRouter = Router();

const InviteMemberSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'ANALYST', 'VIEWER']).default('ANALYST'),
});

// GET /api/members - List workspace members
membersRouter.get('/', async (req: Request, res: Response) => {
  const session = await requireAuth(req, res);
  if (!session) return;

  try {
    const membersRes = await client.execute({
      sql: `SELECT id, name, email, role, createdAt, updatedAt FROM users WHERE workspaceId = ? ORDER BY createdAt ASC`,
      args: [session.workspaceId],
    });

    const members = membersRes.rows.map((r: any) => ({
      id: String(r.id),
      name: String(r.name),
      email: String(r.email),
      role: String(r.role),
      createdAt: String(r.createdAt),
      updatedAt: String(r.updatedAt),
    }));

    res.json({ success: true, data: { members } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch members.' } });
  }
});

// POST /api/members/invite - Invite Member (Admin only)
membersRouter.post('/invite', async (req: Request, res: Response) => {
  const session = await requireAuth(req, res);
  if (!session) return;

  if (session.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Only Admins can invite new team members.' },
    });
  }

  const parsed = InviteMemberSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message } });
  }

  const { name, email, role } = parsed.data;

  try {
    // Check if user already exists
    const existing = await client.execute({
      sql: `SELECT id FROM users WHERE email = ?`,
      args: [email.toLowerCase()],
    });

    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: { code: 'USER_EXISTS', message: 'A user with this email already exists.' } });
    }

    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const defaultPasswordHash = await bcrypt.hash('LoopDemo@2026!', 10);

    await client.execute({
      sql: `INSERT INTO users (id, name, email, passwordHash, role, workspaceId, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [userId, name, email.toLowerCase(), defaultPasswordHash, role, session.workspaceId, now, now],
    });

    res.status(201).json({
      success: true,
      data: {
        id: userId,
        name,
        email: email.toLowerCase(),
        role,
        createdAt: now,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to invite member.' } });
  }
});

// PATCH /api/members/:id/role - Change Role (Admin only)
membersRouter.patch('/:id/role', async (req: Request, res: Response) => {
  const session = await requireAuth(req, res);
  if (!session) return;

  if (session.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Only Admins can change member roles.' },
    });
  }

  const { role } = req.body;
  if (!['ADMIN', 'ANALYST', 'VIEWER'].includes(role)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_ROLE', message: 'Role must be ADMIN, ANALYST, or VIEWER.' } });
  }

  try {
    const updateRes = await client.execute({
      sql: `UPDATE users SET role = ?, updatedAt = ? WHERE id = ? AND workspaceId = ?`,
      args: [role, new Date().toISOString(), req.params.id, session.workspaceId],
    });

    if (updateRes.rowsAffected === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Member not found in this workspace.' } });
    }

    res.json({ success: true, data: { id: req.params.id, role } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update member role.' } });
  }
});

// DELETE /api/members/:id - Remove Member (Admin only)
membersRouter.delete('/:id', async (req: Request, res: Response) => {
  const session = await requireAuth(req, res);
  if (!session) return;

  if (session.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Only Admins can remove members.' },
    });
  }

  if (req.params.id === session.userId) {
    return res.status(400).json({ success: false, error: { code: 'CANNOT_REMOVE_SELF', message: 'You cannot remove your own account.' } });
  }

  try {
    await client.execute({
      sql: `DELETE FROM users WHERE id = ? AND workspaceId = ?`,
      args: [req.params.id, session.workspaceId],
    });

    res.json({ success: true, message: 'Member removed successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to remove member.' } });
  }
});
