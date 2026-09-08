import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { client } from '../db.js';
import { signSessionToken, requireAuth, AuthSession } from '../auth.js';

export const authRouter = Router();

const SignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  workspaceName: z.string().min(2, 'Workspace name must be at least 2 characters'),
});

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// GET /api/auth/me
authRouter.get('/me', async (req: Request, res: Response) => {
  const session = await requireAuth(req, res);
  if (!session) return;

  res.json({
    success: true,
    data: {
      user: {
        id: session.userId,
        name: session.name,
        email: session.email,
        role: session.role,
        workspaceId: session.workspaceId,
        workspaceName: session.workspaceName,
      },
    },
  });
});

// POST /api/auth/signup
authRouter.post('/signup', async (req: Request, res: Response) => {
  try {
    const parsed = SignupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Invalid input data' },
      });
    }

    const { name, email, password, workspaceName } = parsed.data;

    // Check if email already exists
    const existing = await client.execute({
      sql: `SELECT id FROM users WHERE email = ?`,
      args: [email.toLowerCase()],
    });

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: { code: 'EMAIL_EXISTS', message: 'An account with this email already exists.' },
      });
    }

    const now = new Date().toISOString();
    const workspaceId = `ws-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const passwordHash = await bcrypt.hash(password, 10);

    // Create Workspace
    await client.execute({
      sql: `INSERT INTO workspaces (id, name, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
      args: [workspaceId, workspaceName, now, now],
    });

    // Create Admin User
    await client.execute({
      sql: `INSERT INTO users (id, name, email, passwordHash, role, workspaceId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [userId, name, email.toLowerCase(), passwordHash, 'ADMIN', workspaceId, now, now],
    });

    // Create default starter themes for the new workspace
    const starterThemes = [
      { id: `thm-${Date.now()}-1`, name: 'Onboarding & Activation', desc: 'Initial user setup and tutorial experience.', color: '#6366f1' },
      { id: `thm-${Date.now()}-2`, name: 'Performance & Speed', desc: 'Latency, loading times, and responsiveness.', color: '#f43f5e' },
      { id: `thm-${Date.now()}-3`, name: 'Billing & Subscriptions', desc: 'Pricing, invoice clarity, and seat management.', color: '#ec4899' },
      { id: `thm-${Date.now()}-4`, name: 'Integrations & API', desc: 'Third-party integrations, webhooks, and exports.', color: '#06b6d4' },
    ];

    for (const t of starterThemes) {
      await client.execute({
        sql: `INSERT INTO themes (id, name, description, color, workspaceId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [t.id, t.name, t.desc, t.color, workspaceId, now, now],
      });
    }

    const session: AuthSession = {
      userId,
      name,
      email: email.toLowerCase(),
      role: 'ADMIN',
      workspaceId,
      workspaceName,
    };

    const token = signSessionToken(session);

    res.cookie('loop_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 86400000,
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: session,
      },
    });
  } catch (err: any) {
    console.error('[Auth] Signup error:', err);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create workspace account.' },
    });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Invalid email or password' },
      });
    }

    const { email, password } = parsed.data;

    const userRes = await client.execute({
      sql: `SELECT u.id, u.name, u.email, u.passwordHash, u.role, u.workspaceId, w.name as workspaceName 
            FROM users u 
            JOIN workspaces w ON u.workspaceId = w.id 
            WHERE u.email = ?`,
      args: [email.toLowerCase()],
    });

    if (userRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
    }

    const user = userRes.rows[0];
    const passwordValid = await bcrypt.compare(password, String(user.passwordHash));

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
    }

    const session: AuthSession = {
      userId: String(user.id),
      name: String(user.name),
      email: String(user.email),
      role: String(user.role) as any,
      workspaceId: String(user.workspaceId),
      workspaceName: String(user.workspaceName),
    };

    const token = signSessionToken(session);

    res.cookie('loop_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 86400000,
    });

    res.json({
      success: true,
      data: {
        token,
        user: session,
      },
    });
  } catch (err: any) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'An error occurred during login.' },
    });
  }
});

// POST /api/auth/logout
authRouter.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('loop_session');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// POST /api/auth/demo-switch (Quick Demo Account Switcher for Evaluators)
authRouter.post('/demo-switch', async (req: Request, res: Response) => {
  try {
    const { role } = req.body; // 'ADMIN' | 'ANALYST' | 'VIEWER' | 'GLOBEX'
    let targetEmail = 'admin@demo.loop';
    if (role === 'ANALYST') targetEmail = 'analyst@demo.loop';
    if (role === 'VIEWER') targetEmail = 'viewer@demo.loop';
    if (role === 'GLOBEX') targetEmail = 'admin@globex.io';

    const userRes = await client.execute({
      sql: `SELECT u.id, u.name, u.email, u.role, u.workspaceId, w.name as workspaceName 
            FROM users u 
            JOIN workspaces w ON u.workspaceId = w.id 
            WHERE u.email = ?`,
      args: [targetEmail],
    });

    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'DEMO_USER_NOT_FOUND', message: 'Demo account not found' } });
    }

    const user = userRes.rows[0];
    const session: AuthSession = {
      userId: String(user.id),
      name: String(user.name),
      email: String(user.email),
      role: String(user.role) as any,
      workspaceId: String(user.workspaceId),
      workspaceName: String(user.workspaceName),
    };

    const token = signSessionToken(session);

    res.cookie('loop_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 86400000,
    });

    res.json({
      success: true,
      data: {
        token,
        user: session,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to switch demo account' } });
  }
});
