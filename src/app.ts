import express, { Express } from 'express';
import cors from 'cors';
import { requestLogger } from './middlewares/requestLogger';
import ErrorHandler from './middlewares/errorHandler';
import apiRoutes from './routes';

const app: Express = express();

/**
 * Middleware Setup
 */

// Parse JSON bodies
app.use(express.json());

// Enable CORS
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080', 'http://192.168.113.162:3000'],
    credentials: true,
  }),
);

// Request logging
app.use(requestLogger);

/**
 * Routes
 */

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api', apiRoutes);

/**
 * Error Handling
 */

// 404 handler (must be registered after all other routes)
app.use(ErrorHandler.notFound);

// Global error handler (must be registered last)
app.use(ErrorHandler.handle);

export default app;
