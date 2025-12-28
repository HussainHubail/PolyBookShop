// FILE: src/app.ts
// Express application setup

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env';

// Fix BigInt serialization in JSON
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

// Import routes
import authRoutes from './routes/auth.routes';
import bookRoutes from './routes/book.routes';
import booksRoutes from './routes/books.routes';
import loanRoutes from './routes/loan.routes';
import memberRoutes from './routes/member.routes';
import notificationRoutes from './routes/notification.routes';
import reportRoutes from './routes/report.routes';
import statsRoutes from './routes/stats.routes';

const app: Application = express();

// ===== MIDDLEWARE =====

// CORS
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files - serve uploaded PDFs
app.use('/uploads', express.static('uploads'));

// Request logging (development only)
if (env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ===== ROUTES =====

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'PolyBookShop Backend is running',
    health: '/health',
    apiPrefix: env.API_PREFIX,
  });
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'PolyBookShop API is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API routes
app.use(`${env.API_PREFIX}/auth`, authRoutes);
app.use(`${env.API_PREFIX}/books`, booksRoutes);
app.use(`${env.API_PREFIX}`, bookRoutes);
app.use(`${env.API_PREFIX}/loans`, loanRoutes);
app.use(`${env.API_PREFIX}/members`, memberRoutes);
app.use(`${env.API_PREFIX}`, notificationRoutes);
app.use(`${env.API_PREFIX}/reports`, reportRoutes);
app.use(`${env.API_PREFIX}`, statsRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: any) => {
  console.error('Unhandled error:', err);
  
  res.status(500).json({
    success: false,
    error: env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;
