
import 'dotenv/config';
import 'express-async-errors'; // Must be imported before any routes
import express, { Express, Request, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import { createClient } from 'redis';
import authRoutes from './auth/auth.routes';
import businessRoutes from './business/business.routes';
import contentRoutes from './content/content.routes'; // Added for saving content
import strategyRoutes from './strategy/strategy.routes'; // Added for strategy operations

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Configure CORS appropriately for production
app.use(express.json() as RequestHandler); // Explicit cast to RequestHandler
app.use(express.urlencoded({ extended: true }) as RequestHandler); // Explicit cast to RequestHandler

// Redis Client Setup (basic connection check)
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis'));
redisClient.connect().catch(console.error);


// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', message: 'Backend is healthy' });
});

app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/strategy', strategyRoutes); // Mount strategy routes

// Global Error Handler
// This must be the last piece of middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack); // Log error stack for debugging

  // TODO: Add more specific error handling based on error types
  // For example, handle Prisma errors, validation errors, etc.
  if (err.name === 'UnauthorizedError') { // Example for JWT errors
    return res.status(401).json({ message: 'Invalid token' });
  }

  res.status(500).json({
    message: 'Something went wrong on the server.',
    // In development, you might want to send the error message
    // error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export { redisClient }; // Export if needed in other modules, e.g., for caching
