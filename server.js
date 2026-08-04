/**
 * Local/alternative-hosting API server.
 *
 * This is only needed if you are NOT deploying to Vercel (which auto-detects
 * everything in /api). For Vercel, prefer running `vercel dev` locally so the
 * exact same /api/*.js functions used in production also run in dev — no
 * second server or proxy config required.
 *
 * If you do want a standalone Express server (e.g. for a non-Vercel host,
 * or to run alongside `npm run dev` via the proxy in vite.config.ts), run:
 *   npm run server
 */
import 'dotenv/config';
import express from 'express';
import broadcastNotification from './api/broadcast-notification.js';

const app = express();
app.use(express.json());

app.post('/api/broadcast-notification', (req, res) => broadcastNotification(req, res));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
