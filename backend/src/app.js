import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

import { env } from './config/env.js';
import { httpLogStream } from './config/logger.js';
import { generalLimiter } from './middlewares/rateLimit.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { notFoundHandler } from './middlewares/notFound.middleware.js';
import { stripeWebhook } from './controllers/payment.controller.js';
import apiRouter from './routes/index.js';

const app = express();

app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (env.corsOrigins.includes(origin) || env.corsOrigins.includes('*')) return cb(null, true);
      return cb(new Error(`Origin '${origin}' not allowed by CORS`));
    },
    credentials: true,
  })
);

// Compression + cookies
app.use(compression());
app.use(cookieParser());

// HTTP logging
app.use(morgan(env.isProd ? 'combined' : 'dev', { stream: httpLogStream }));

// Stripe webhook MUST be mounted with the raw body parser BEFORE express.json()
app.post(
  `${env.API_PREFIX}/payments/webhook`,
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

// Body parsers (after webhook)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Sanitization
app.use(mongoSanitize());
app.use(hpp());

// Rate limiting (global)
app.use(generalLimiter);

// Health
app.get('/', (_req, res) => res.json({ success: true, message: 'LMS API' }));

// API
app.use(env.API_PREFIX, apiRouter);

// 404 + error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
