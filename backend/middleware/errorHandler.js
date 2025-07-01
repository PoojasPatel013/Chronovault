// backend/middleware/errorHandler.js
import httpErrors from 'http-errors';
const { createError } = httpErrors;

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Handle specific errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry',
      error: err.keyValue
    });
  }

  // Handle HTTP errors
  if (err instanceof createError.HttpError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err : undefined
    });
  }

  // Default error handling
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

export default errorHandler;
