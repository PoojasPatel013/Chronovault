// backend/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export default async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get the user from the token
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user to request with proper properties
    req.user = {
      _id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      googleId: user.googleId
    };
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};