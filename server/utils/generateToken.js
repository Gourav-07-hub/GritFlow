/**
 * utils/generateToken.js — JWT creation utility
 *
 * Single-responsibility helper: signs and returns a JWT for a given user ID.
 * Keeps token generation logic out of controllers so it can be reused
 * anywhere (auth, password reset, email verification, etc.)
 */

import jwt from 'jsonwebtoken';

/**
 * Signs a JWT containing the user's MongoDB _id as the payload.
 *
 * @param {string | import('mongoose').Types.ObjectId} userId — The user's _id
 * @returns {string} — A signed JWT string valid for 7 days
 *
 * @example
 * const token = generateToken(user._id);
 * res.json({ token });
 */
const generateToken = (userId) => {
  // jwt.sign(payload, secret, options)
  // — payload  : what we embed in the token (keep it minimal — no passwords!)
  // — secret   : from .env, never hardcoded
  // — expiresIn: '7d' means the token is invalid after 7 days
  return jwt.sign(
    { id: userId },          // Payload: only the user ID
    process.env.JWT_SECRET,  // Secret from environment
    { expiresIn: '7d' }      // Expiry
  );
};

export default generateToken;
