import jwt from 'jsonwebtoken';
const { verify } = jwt;

export default async function(req, res, next) {
  try {
    // Get token from Authorization header first
    let token = req.header('Authorization')?.replace('Bearer ', '');
    
    // If no token in header, check cookies
    if (!token) {
      token = req.cookies.token;
    }

    // If still no token, return error
    if (!token) {
      return res.status(401).json({ 
        message: 'No token, authorization denied',
        error: 'Missing authentication token'
      });
    }

    // Verify token
    const decoded = verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ 
      message: 'Token is not valid',
      error: err.message
    });
  }
};