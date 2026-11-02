import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/task.routes.js';
import healthRoutes from './routes/health.routes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// Disable x-powered-by header
app.disable('x-powered-by');

// Security headers
app.use(helmet());

// Cross-origin resource sharing
app.use(cors());

// Parse incoming JSON payloads with a 10kb limit to prevent payload attacks
app.use(express.json({ limit: '10kb' }));

// Mount API routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Catch-all route handler for 404 Not Found
app.use(notFoundHandler);

// Centralized error handling middleware
app.use(errorHandler);

export default app;
