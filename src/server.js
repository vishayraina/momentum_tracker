import { createApp } from './app.js';
import { getDatabase } from './db/index.js';

const PORT = process.env.PORT || 3000;
const db = getDatabase();
const app = createApp(db);

const server = app.listen(PORT, () => {
  console.log(`✨ Personal Momentum OS server running at http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('Server closed gracefully');
    process.exit(0);
  });
});
