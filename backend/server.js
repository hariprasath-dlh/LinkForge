require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const authRoutes = require('./routes/auth.routes');
const urlRoutes = require('./routes/url.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const statsRoutes = require('./routes/stats.routes');
const redirectRoutes = require('./routes/redirect.routes');
const errorMiddleware = require('./middleware/error.middleware');
const { generalRateLimiter } = require('./middleware/rateLimiter');

const app = express();

// Trust Render/Vercel proxy headers so rate limiting uses the real client IP.
app.set('trust proxy', 1);

const normalizeOrigin = (url) => url && url.replace(/\/$/, '');

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:5000',
        'https://linkforge-three.vercel.app',
        'https://linkforge-fymw.onrender.com',
        process.env.CLIENT_URL,
        process.env.FRONTEND_URL,
        process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
      ]
        .filter(Boolean)
        .map(normalizeOrigin);

      const normalizedOrigin = normalizeOrigin(origin);
      const isVercelPreviewURL =
        normalizedOrigin.includes('linkforge') &&
        normalizedOrigin.endsWith('.vercel.app');
      const isRenderURL = normalizedOrigin.endsWith('.onrender.com');
      const isLocalhost =
        normalizedOrigin.startsWith('http://localhost:') ||
        normalizedOrigin.startsWith('http://127.0.0.1:');

      if (
        allowedOrigins.includes(normalizedOrigin) ||
        isVercelPreviewURL ||
        isRenderURL ||
        isLocalhost
      ) {
        callback(null, true);
      } else {
        console.error('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS: ' + origin));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    maxAge: 86400,
  })
);

app.options('*', cors());

app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', generalRateLimiter);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'LinkForge API is running.',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.db?.databaseName || null,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/', redirectRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

const startServer = async () => {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is required. Refusing to start without an explicit database.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB connected successfully.');
    console.log('Connected database:', mongoose.connection.db.databaseName);
  } catch (err) {
    console.error(`MongoDB connection failed: ${err.message}`);
    if (isProduction) {
      console.error('Production database connection failed. Refusing local fallback to avoid split data.');
      process.exit(1);
    }

    console.log('Attempting connection to local fallback MongoDB...');
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/linkforge', {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('Connected successfully to local fallback MongoDB');
    } catch (localErr) {
      console.error('Both primary and local MongoDB connection failed:', localErr.message);
      process.exit(1);
    }
  }

  app.listen(PORT, () => {
    console.log(`LinkForge server running on port ${PORT}`);
    console.log(
      `Accepting requests from: ${
        process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173'
      }`
    );
  });
};

startServer();
