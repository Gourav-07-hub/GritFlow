/**
 * middleware/errorMiddleware.js — Global error handler and undefined route catcher
 */

/**
 * Catcher for undefined routes (404)
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global centralized error handler
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Server error';

  // Handle specific database / JWT error types
  if (err.name === 'CastError') {
    message = 'Invalid ID format';
    statusCode = 400;
  } else if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map((val) => `${val.path}: ${val.message}`)
      .join(', ');
    statusCode = 400;
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for ${field}`;
    statusCode = 400;
  } else if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
  } else if (err.name === 'TokenExpiredError') {
    message = 'Token expired, please login again';
    statusCode = 401;
  }

  // Set default status if not set or invalid
  if (statusCode < 400 || statusCode >= 600) {
    statusCode = 500;
  }

  const response = {
    message: statusCode === 500 && process.env.NODE_ENV === 'production' ? 'Server error' : message,
  };

  // Stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};
