import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initDatabase } from './server/db.js';
import { authRouter } from './server/routes/auth.js';
import { feedbackRouter } from './server/routes/feedback.js';
import { themesRouter } from './server/routes/themes.js';
import { analyticsRouter } from './server/routes/analytics.js';
import { insightsRouter } from './server/routes/insights.js';
import { reportsRouter } from './server/routes/reports.js';
import { membersRouter } from './server/routes/members.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Global Middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Initialize Database Schema & Seed Data
  await initDatabase();

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', platform: 'LOOP Feedback Intelligence', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/feedback', feedbackRouter);
  app.use('/api/themes', themesRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/insights', insightsRouter);
  app.use('/api/reports', reportsRouter);
  app.use('/api/members', membersRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LOOP] Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[LOOP] Fatal server startup error:', err);
  process.exit(1);
});
