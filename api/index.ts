import express from 'express';
import cookieParser from 'cookie-parser';

// IMPORTANT: Notice the ../ paths and the .js extensions
import { initDatabase } from '../server/db.js';
import { authRouter } from '../server/routes/auth.js';
import { feedbackRouter } from '../server/routes/feedback.js';
import { themesRouter } from '../server/routes/themes.js';
import { analyticsRouter } from '../server/routes/analytics.js';
import { insightsRouter } from '../server/routes/insights.js';
import { reportsRouter } from '../server/routes/reports.js';
import { membersRouter } from '../server/routes/members.js';

const app = express();

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

// Export the app for Vercel Serverless (DO NOT use app.listen here)
export default app;