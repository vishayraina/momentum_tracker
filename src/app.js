import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createApiRouter } from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(db) {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static assets
  const publicDir = path.join(__dirname, '..', 'public');
  app.use(express.static(publicDir));

  // Mount API router
  app.use('/api', createApiRouter(db));

  // Root fallback to index.html
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Endpoint not found' });
    }
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  return app;
}
