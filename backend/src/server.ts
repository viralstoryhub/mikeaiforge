import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { rateLimiter } from './middleware/rateLimiter';
import logger from './utils/logger';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import toolRoutes from './routes/tool.routes';
import workflowRoutes from './routes/workflow.routes';
import utilityRoutes from './routes/utility.routes';
import chatRoutes from './routes/chat.routes';
import adminRoutes from './routes/admin.routes';
import stripeRoutes from './routes/stripe.routes';
import analyticsRoutes from './routes/analytics.routes';
import forumRoutes from './routes/forum.routes';
import newsRoutes from './routes/news.routes';
import { registerNewsSyncJob } from './jobs/newsSync.job';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 5000;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );
}

// Rate limiting
app.use('/api/', rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/utilities', utilityRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/news', newsRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV}`);

  const shouldRegisterNewsSync =
    process.env.NODE_ENV === 'production' || process.env.ENABLE_NEWS_SYNC === 'true';

  if (process.env.NODE_ENV !== 'test' && shouldRegisterNewsSync) {
    try {
      registerNewsSyncJob();
      logger.info('📰 News sync job registered successfully');
    } catch (error) {
      logger.error('Failed to register news sync job', error);
    }
  } else {
    logger.info('📰 News sync job registration skipped');
  }
});

export default app;
