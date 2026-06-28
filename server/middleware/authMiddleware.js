/**
 * middleware/authMiddleware.js — JWT Bearer token guard
 *
 * Exports a single `protect` middleware function.
 *
 * How it works:
 *   1. Reads the Authorization header and extracts the Bearer token.
 *   2. Verifies the token signature and expiry with jwt.verify().
 *   3. Looks up the real User document from the DB using the embedded id —
 *      this ensures the token is not for a deleted account.
 *   4. Attaches the full User document (minus password) to req.user.
 *   5. Calls next() to hand off to the protected route handler.
 *
 * Usage:
 *   import { protect } from '../middleware/authMiddleware.js';
 *   router.get('/profile', protect, getProfile);
 *
 * Error responses (always JSON, no HTML):
 *   401 { message: "Not authorized, no token" }     ← missing header
 *   401 { message: "Not authorized, token failed" } ← bad / expired token
 *   401 { message: "Not authorized, user not found" } ← token valid but user deleted
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Express middleware that protects private routes with JWT verification.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // ── 1. Extract token from "Authorization: Bearer <token>" header ────────────
  // We check the prefix explicitly so partial or malformed headers are caught.
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ message: 'Not authorized, no token' });
  }

  // Split "Bearer eyJh..." → take the part after the space
  const token = authHeader.split(' ')[1];

  // Guard against "Bearer " with nothing after it
  if (!token) {
    return res
      .status(401)
      .json({ message: 'Not authorized, no token' });
  }

  try {
    // ── 2. Verify the token (signature + expiry) ────────────────────────────
    // jwt.verify() throws JsonWebTokenError or TokenExpiredError on failure.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id: '<userId>', iat: ..., exp: ... }

    // ── 3. Fetch the live User document from the database ───────────────────
    // This step is critical — it ensures the token is not for a user that has
    // since been deleted, suspended, or had their password changed (future).
    // .select('-password') uses the exclusion syntax so the hash is never
    // exposed on req.user, even accidentally in a controller log.
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      // Token was valid but the account no longer exists
      return res
        .status(401)
        .json({ message: 'Not authorized, user not found' });
    }

    // ── 4. Attach the full User document to the request object ───────────────
    // Downstream route handlers access the caller's identity via req.user.
    req.user = user;

    // ── 5. Hand off to the next middleware / route handler ──────────────────
    next();
  } catch (error) {
    // JsonWebTokenError   → tampered signature
    // TokenExpiredError   → token past its expiry date
    // NotBeforeError      → token used before its nbf claim
    return res
      .status(401)
      .json({ message: 'Not authorized, token failed' });
  }
};

// Also export as default for backward-compatibility with any existing imports
export default protect;
