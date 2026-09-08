import { createServer as createViteServer } from 'vite';
import app from '../../api/index';

async function startLocalServer() {
  const PORT = 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LOOP] Local server running on http://localhost:${PORT}`);
  });
}

startLocalServer().catch((err) => {
  console.error('[LOOP] Fatal local server startup error:', err);
  process.exit(1);
});