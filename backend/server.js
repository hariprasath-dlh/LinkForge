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

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://linkforge-three.vercel.app',
        process.env.CLIENT_URL,
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS: ' + origin));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully (Atlas)');
  } catch (err) {
    console.warn(`⚠️ Primary MongoDB connection failed: ${err.message}`);
    console.log('🔌 Attempting connection to local fallback MongoDB...');
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/linkforge');
      console.log('✅ Connected successfully to local fallback MongoDB');
    } catch (localErr) {
      console.error('❌ Both primary and local MongoDB connection failed:', localErr.message);
      process.exit(1);
    }
  }

  app.listen(PORT, () => {
    console.log(`🔨 LinkForge server running on http://localhost:${PORT}`);
    console.log(`📡 Accepting requests from: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  });
};

startServer();
