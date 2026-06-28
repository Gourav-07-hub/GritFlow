import rateLimit from 'express-rate-limit';

const skipInDev = (req) => process.env.NODE_ENV === 'development';

/**
 * General rate limiter applied across all routes
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  message: {
    message: "Too many requests, please try again later",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: skipInDev,
});

/**
 * Limit login/register requests to mitigate brute-force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: {
    message: "Too many login attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDev,
});

/**
 * Focus session timer rate limiter
 */
export const focusLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute
  message: {
    message: "Too many requests, please slow down",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDev,
});
