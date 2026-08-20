import { createClient, Client } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const dbUrl = process.env.DATABASE_URL || `file:${path.join(DATA_DIR, 'loop.db')}`;

export const client: Client = createClient({
  url: dbUrl,
});

export async function initDatabase() {
  // Create tables with proper indexes and constraints
  await client.execute(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'ANALYST',
      workspaceId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (workspaceId) REFERENCES workspaces(id) ON DELETE CASCADE
    );
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_users_workspace ON users(workspaceId);
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      channel TEXT NOT NULL,
      sourceRef TEXT,
      customerLabel TEXT,
      sentiment TEXT NOT NULL DEFAULT 'NEU',
      sentimentScore REAL NOT NULL DEFAULT 0.0,
      featureArea TEXT,
      status TEXT NOT NULL DEFAULT 'NEW',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      workspaceId TEXT NOT NULL,
      FOREIGN KEY (workspaceId) REFERENCES workspaces(id) ON DELETE CASCADE
    );
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_feedback_workspace ON feedback(workspaceId);
    CREATE INDEX IF NOT EXISTS idx_feedback_workspace_date ON feedback(workspaceId, createdAt);
    CREATE INDEX IF NOT EXISTS idx_feedback_workspace_sentiment ON feedback(workspaceId, sentiment);
    CREATE INDEX IF NOT EXISTS idx_feedback_workspace_status ON feedback(workspaceId, status);
    CREATE INDEX IF NOT EXISTS idx_feedback_workspace_channel ON feedback(workspaceId, channel);
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS themes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#6366f1',
      workspaceId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      UNIQUE(workspaceId, name),
      FOREIGN KEY (workspaceId) REFERENCES workspaces(id) ON DELETE CASCADE
    );
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_themes_workspace ON themes(workspaceId);
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS feedback_themes (
      feedbackId TEXT NOT NULL,
      themeId TEXT NOT NULL,
      confidence REAL NOT NULL DEFAULT 1.0,
      PRIMARY KEY (feedbackId, themeId),
      FOREIGN KEY (feedbackId) REFERENCES feedback(id) ON DELETE CASCADE,
      FOREIGN KEY (themeId) REFERENCES themes(id) ON DELETE CASCADE
    );
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_feedback_themes_feedback ON feedback_themes(feedbackId);
    CREATE INDEX IF NOT EXISTS idx_feedback_themes_theme ON feedback_themes(themeId);
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS embeddings (
      id TEXT PRIMARY KEY,
      feedbackId TEXT UNIQUE NOT NULL,
      vector TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (feedbackId) REFERENCES feedback(id) ON DELETE CASCADE
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      periodStart TEXT NOT NULL,
      periodEnd TEXT NOT NULL,
      contentJson TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      generatedBy TEXT NOT NULL,
      workspaceId TEXT NOT NULL,
      FOREIGN KEY (workspaceId) REFERENCES workspaces(id) ON DELETE CASCADE
    );
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_reports_workspace ON reports(workspaceId, createdAt);
  `);

  // Seed default demo workspace and feedback if empty
  const userCount = await client.execute('SELECT COUNT(*) as count FROM users');
  if (Number(userCount.rows[0].count) === 0) {
    console.log('[DB] Seeding database with comprehensive demo dataset...');
    await seedDemoData();
    console.log('[DB] Seed completed successfully!');
  }
}

import { seedDemoData } from './seedData';
