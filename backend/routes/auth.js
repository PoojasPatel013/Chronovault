// backend/routes/auth.js
import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import httpErrors from 'http-errors';

const { createError } = httpErrors;

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Get current user
router.get('/me', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return next(createError(401, 'No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId)
      .select('-password')
      .populate('googleId');

    if (!user) {
      return next(createError(401, 'Invalid token'));
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        authenticationMethod: user.authenticationMethod
      }
    });
  } catch (error) {
    next(error);
  }
});

// Signup route
router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'Email already registered'
      });
    }

    // Create new user
    const user = await User.createEmailUser(name, email, password);

    // Generate token
    const token = user.generateToken();

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        authenticationMethod: user.authenticationMethod
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      message: 'Signup failed',
      error: error.message
    });
  }
});

// Login route
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return next(createError(400, 'Email and password are required'));
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return next(createError(401, 'Invalid credentials'));
    }

    // Check if user can login with password
    if (user.authenticationMethod !== 'email') {
      return next(createError(401, 'Cannot login with password. Please use Google login.'));
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(createError(401, 'Invalid credentials'));
    }

    // Generate token
    const token = user.generateToken();

    // Return token and user data
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        authenticationMethod: user.authenticationMethod
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    next(createError(500, 'Login failed'));
  }
});

// Google OAuth callback
router.post('/google', async (req, res, next) => {
  try {
    const { token: googleToken } = req.body;

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    // Get payload and verify email
    const { email_verified, name, email, picture } = ticket.getPayload();

    if (!email_verified) {
      return res.status(400).json({
        message: 'Email not verified'
      });
    }

    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.createGoogleUser(name, email, googleToken, picture);
    } else {
      // Update existing user with new token and avatar
      user.googleId = googleToken;
      user.avatar = picture;
      await user.save();
    }

    // Generate token
    const token = user.generateToken();

    // Redirect to frontend with token
    res.redirect(`http://localhost:5173/oauth2/callback?token=${token}`);
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({
      message: 'Google OAuth failed',
      error: error.message
    });
  }
});   

export default router;
