import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import clientsRoutes from './routes/clients.js';
import athletesRoutes from './routes/athletes.js';
import devisRoutes from './routes/devis.js';
import facturesRoutes from './routes/factures.js';
import contratsRoutes from './routes/contrats.js';
import projetsRoutes from './routes/projets.js';
import evenementsRoutes from './routes/evenements.js';
import campsRoutes from './routes/camps.js';
import vipRoutes from './routes/vip.js';
import activitesRoutes from './routes/activites.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');

  app.use(helmet());
  app.use(cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }));
  app.use(express.json({ limit: '2mb' }));

  app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false }), authRoutes);
  app.use('/api/clients', clientsRoutes);
  app.use('/api/athletes', athletesRoutes);
  app.use('/api/devis', devisRoutes);
  app.use('/api/factures', facturesRoutes);
  app.use('/api/contrats', contratsRoutes);
  app.use('/api/projets', projetsRoutes);
  app.use('/api/evenements', evenementsRoutes);
  app.use('/api/camps', campsRoutes);
  app.use('/api/vip', vipRoutes);
  app.use('/api/activites', activitesRoutes);

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

  app.use(errorHandler);

  return app;
}
