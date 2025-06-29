// backend/routes/authenticate.js
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getGoogleAuthUrl, getUserInfo, verifyToken } from '../config/googleAuth.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { createError } from '../utils/error.js';

const router = Router();



// Email/password login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return next(createError(400, 'Email and password are required'));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(createError(401, 'Invalid credentials'));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(createError(401, 'Invalid credentials'));
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    next(createError(500, 'Server error'));
  }
});

// Google OAuth routes
router.get('/google', async (req, res, next) => {
  try {
    const authUrl = await getGoogleAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error('Failed to get Google auth URL:', error);
    next(createError(500, 'Failed to get Google auth URL'));
  }
});

router.get('/google/callback', async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) {
      return next(createError(400, 'No code provided'));
    }

    const userInfo = await getUserInfo(code);
    let user = await User.findOne({ googleId: userInfo.id });

    if (!user) {
      user = new User({
        googleId: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        avatar: userInfo.picture
      });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect back to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
  }
});

// Token refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return next(createError(400, 'No token provided'));
    }

    try {
      // Verify existing token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(createError(404, 'User not found'));
      }

      // Generate new token with same expiry
      const newToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ token: newToken });
    } catch (tokenError) {
      // Handle token verification errors
      if (tokenError.name === 'TokenExpiredError') {
        return next(createError(401, 'Token has expired'));
      }
      return next(createError(401, 'Invalid token'));
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    next(createError(500, 'Server error'));
  }
});

// Signup route
router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(createError(400, 'Name, email, and password are required'));
    }

    // Validate email format
    const emailRegex = /^[\S]+@[\S]+\.[\S]+$/;
    if (!emailRegex.test(email)) {
      return next(createError(400, 'Please use a valid email address'));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createError(400, 'Email already registered'));
    }

    // Create new user with explicit fields
    const user = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password
    });

    // Save user with error handling
    await user.save().catch(error => {
      console.error('User save error:', error);
      if (error.code === 11000) {
        return next(createError(400, 'Email already registered'));
      }
      throw error;
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '7d',
        algorithm: 'HS256'
      }
    );

    res.status(201).json({ 
      token, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    if (error.code === 11000) {
      return next(createError(400, 'Email already registered'));
    }
    next(createError(500, 'Failed to create account'));
  }
});

// Login route
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createError(400, 'Email and password are required'));
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return next(createError(401, 'Invalid email or password'));
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(createError(401, 'Invalid email or password'));
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    next(createError(500, 'Failed to login'));
  }
});

import auth from '../middleware/auth.js';

// Get current user
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(createError(404, 'User not found'));
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    next(createError(500, 'Server error'));
  }
});

// Logout
router.post('/logout', async (req, res, next) => {
  try {
    // Clear any session data if needed
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    next(createError(500, 'Server error'));
  }
});

export default router;