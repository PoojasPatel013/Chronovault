import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.js';
import errorHandler from './middleware/errorHandler.js';
import auth from './middleware/auth.js';
import { timeCapsuleRouter } from './routes/timecapsules.js';
import { therapyRouter } from './routes/therapy.js';
import { therapistsRouter } from './routes/therapists.js';
import { usersRouter } from './routes/users.js';
import { communityRouter } from './routes/community.js';
import { settingsRouter } from './routes/settings.js';
import { personalityRouter } from './routes/personality.js';
import { Router } from 'express';

const openTherapyRoutes = Router();
openTherapyRoutes.get('/ping', (req, res) => {
  res.send("✅ Therapy route is alive!");
});


const __filename = import.meta.url;
const __dirname = new URL(__filename).pathname;

// Load environment variables
dotenv.config();

const app = express();
// Get environment variables
const PORT = process.env.PORT || 8000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use('/api/therapy/', openTherapyRoutes);
// CORS configuration
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRouter);
app.use('/api/timecapsules', auth, timeCapsuleRouter);
app.use('/api/therapy', auth, therapyRouter);
app.use('/api/therapists', auth, therapistsRouter);
app.use('/api/users', auth, usersRouter);
app.use('/api/community', auth, communityRouter);
app.use('/api/settings', auth, settingsRouter);
app.use('/api/personality', auth, personalityRouter);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;