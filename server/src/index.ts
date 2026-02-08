import express from 'express';
import cors from 'cors';
import path from 'path';
import entriesRouter from './routes/entries';
import searchRouter from './routes/search';
import importRouter from './routes/import';
import dashboardRouter from './routes/dashboard';
import equipmentRouter from './routes/equipment';
import topicsRouter from './routes/topics';
import { initDb, closeDb } from './db/connection';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API routes
app.use('/api/entries', entriesRouter);
app.use('/api/search', searchRouter);
app.use('/api/import', importRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/equipment', equipmentRouter);
app.use('/api/topics', topicsRouter);

// Serve static client build in production
const clientBuild = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientBuild));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientBuild, 'index.html'));
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Initialize database (async) then start the server
async function start() {
  try {
    await initDb();
    console.log('Database initialized with PostgreSQL');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
}

start();

// Cleanup on exit
process.on('SIGINT', async () => {
  await closeDb();
  process.exit();
});
process.on('SIGTERM', async () => {
  await closeDb();
  process.exit();
});
