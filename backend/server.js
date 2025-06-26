import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authenticate.js';
import timeCapsuleRoutes from './routes/timecapsules.js';
import personalityRoutes from './routes/personality.js';
import therapyRoutes from './routes/therapy.js';
import therapistsRoutes from './routes/therapists.js';
import auth from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(`mongodb://127.0.0.1:27017/timecapsule`, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4, // Force IPv4
  retryWrites: true,
  w: 'majority'
})
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log('✅ MongoDB connection details:', {
      host: '127.0.0.1',
      port: '27017',
      db: 'timecapsule'
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    console.error('❌ Detailed error:', {
      message: err.message,
      code: err.code,
      name: err.name,
      stack: err.stack
    });
    process.exit(1);
  });

// Define routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/timecapsules', auth, timeCapsuleRoutes);
app.use('/api/personality', auth, personalityRoutes);
app.use('/api/therapy', auth, therapyRoutes);
app.use('/api/therapists', auth, therapistsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Connect to MongoDB
await mongoose.connect(`mongodb://127.0.0.1:27017/timecapsule`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  family: 4 // Force IPv4
}).then(() => {
  console.log('✅ MongoDB Connected');
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

export default app;