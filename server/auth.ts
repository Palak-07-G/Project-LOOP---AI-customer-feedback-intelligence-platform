import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { client } from './db.js';

const JWT_SECRET = process.env.AUTH_SECRET || 'loop-jwt-secret-key-prod-super-secure-2026';

export type UserRole = 'ADMIN' | 'ANALYST' | 'VIEWER';

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  workspaceId: string;
  workspaceName: string;
}

export function signSessionToken(session: AuthSession): string {
  return jwt.sign(session, JWT_SECRET, { expiresIn: '7d' });
}

export function verifySessionToken(token: string): AuthSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthSession;
  } catch (err) {
    return null;
  }
}

export function getSessionFromRequest(req: Request): AuthSession | null {
  // Check Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const session = verifySessionToken(token);
    if (session) return session;
  }

  // Check cookies
  const cookieToken = req.cookies?.['loop_session'];
  if (cookieToken) {
    const session = verifySessionToken(cookieToken);
    if (session) return session;
  }

  return null;
}

export async function requireAuth(req: Request, res: Response): Promise<AuthSession | null> {
  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required to access this resource.',
      },
    });
    return null;
  }

  // Verify user still exists in database and has correct workspace
  const userResult = await client.execute({
    sql: `SELECT u.id, u.name, u.email, u.role, u.workspaceId, w.name as workspaceName 
          FROM users u 
          JOIN workspaces w ON u.workspaceId = w.id 
          WHERE u.id = ? AND u.workspaceId = ?`,
    args: [session.userId, session.workspaceId],
  });

  if (userResult.rows.length === 0) {
    res.status(401).json({
      success: false,
      error: {
        code: 'SESSION_INVALID',
        message: 'User session is no longer valid.',
      },
    });
    return null;
  }

  const row = userResult.rows[0];
  return {
    userId: String(row.id),
    name: String(row.name),
    email: String(row.email),
    role: String(row.role) as UserRole,
    workspaceId: String(row.workspaceId),
    workspaceName: String(row.workspaceName),
  };
}

export function checkRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

export function enforceRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const session = getSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
      });
    }

    if (!allowedRoles.includes(session.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Forbidden: Action requires one of the following roles: ${allowedRoles.join(', ')}. Current role: ${session.role}`,
        },
      });
    }

    next();
  };
}
