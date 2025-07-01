// backend/routes/auth.js
import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import httpErrors from 'http-errors';
import auth from '../middleware/auth.js';

const { createError } = httpErrors;

const router = express.Router();

// Helper function to handle errors
const handleError = (res, error, message, statusCode = 500) => {
  console.error(message, error);
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

// Helper function to handle authentication
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId)
      .select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    handleError(res, error, 'Authentication failed', 401);
  }
};

// Get current user
router.get('/me', auth, (req, res) => {
  res.json({
    user: {
      _id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      avatar: req.user.avatar,
      gender: req.user.gender,
      birthdate: req.user.birthdate,
      privacy: req.user.privacy
    }
  });
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, gender, birthdate } = req.body;

    // Validate required fields
    if (!name || !email || !password || !gender || !birthdate) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase().trim(),
      password,
      gender,
      birthdate: new Date(birthdate)
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Send response
    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        birthdate: user.birthdate,
        privacy: user.privacy
      }
    });
  } catch (error) {
    handleError(res, error, 'Registration failed');
  }
});

// Login user
router.post('/logout', async (req, res) => {
  try {
    // Clear the JWT cookie
    res.clearCookie('jwt');
    
    // Return success response
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    handleError(res, error, 'Failed to logout');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Send response
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        birthdate: user.birthdate,
        privacy: user.privacy
      }
    });
  } catch (error) {
    handleError(res, error, 'Login failed');
  }
});

// Get user profile (protected route)
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
});

// Update user profile (protected route)
router.put('/update-profile', auth, async (req, res) => {
  try {
    const { name, email, gender, birthdate, privacy } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update user fields
    user.name = name;
    user.email = email;
    user.gender = gender;
    user.birthdate = birthdate;
    user.privacy = privacy;

    await user.save();
    
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
});

export default router;
