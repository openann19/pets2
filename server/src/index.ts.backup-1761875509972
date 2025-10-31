/**
 * Simplified PawReels API Server
 * Standalone server for testing PawReels functionality
 */

import express from 'express';
import cors from 'cors';
import { db } from './db';
import templatesRouter from './routes/templates';
import tracksRouter from './routes/tracks';
import uploadsRouter from './routes/uploads';
import reelsRouter from './routes/reels';
import './db';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/templates', templatesRouter);
app.use('/tracks', tracksRouter);
app.use('/uploads', uploadsRouter);
app.use('/reels', reelsRouter);

// Health check
app.get('/health', (req, res) => {
  res.send('OK');
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🎬 PawReels API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📁 Templates: http://localhost:${PORT}/templates`);
  console.log(`🎵 Tracks: http://localhost:${PORT}/tracks`);
});

export default app;

