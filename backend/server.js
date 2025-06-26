// backend/server.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import auth from './middleware/auth.js';
import authenticate from './routes/authenticate.js';
import timeCapsuleRoutes from './routes/timecapsules.js';
import personalityRoutes from './routes/personality.js';
import therapyRoutes from './routes/therapy.js';
import therapistsRoutes from './routes/therapists.js';
import usersRoutes from './routes/users.js';
import communityRoutes from './routes/community.js';
import settingsRoutes from './routes/settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(`mongodb://127.0.0.1:27017/timecapsule`, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4, // Force IPv4
}).then(() => {
  console.log('✅ Connected to MongoDB');
  console.log('✅ MongoDB connection details:', {
    host: '127.0.0.1',
    port: '27017',
    db: 'timecapsule'
  });
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Routes
app.use('/api/timecapsules', auth, timeCapsuleRoutes);
app.use('/api/personality', auth, personalityRoutes);
app.use('/api/therapy', auth, therapyRoutes);
app.use('/api/therapists', auth, therapistsRoutes);
app.use('/api/auth', authenticate);
app.use('/api/users', auth, usersRoutes);
app.use('/api/community', auth, communityRoutes);
app.use('/api/settings', auth, settingsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;