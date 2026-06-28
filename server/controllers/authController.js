/**
 * controllers/authController.js — Authentication business logic
 *
 * Exports two Express route handler functions:
 *   • registerUser  POST /api/auth/register
 *   • loginUser     POST /api/auth/login
 *
 * Design decisions:
 *   - Password is NEVER included in any response (the User schema already
 *     marks it `select: false`, but we destructure explicitly as a second
 *     safety net).
 *   - Login uses a deliberately vague 401 message ("Invalid email or password")
 *     for both "email not found" and "wrong password" cases — this prevents
 *     user-enumeration attacks where an attacker probes which emails exist.
 *   - Both handlers are wrapped in try/catch so unexpected errors bubble to
 *     Express's global error handler without crashing the process.
 */

import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Builds the safe user payload that is returned in every auth response.
 * Explicitly omits password and internal Mongoose fields (__v).
 *
 * @param {import('mongoose').Document} user — A Mongoose User document
 * @param {string} token — A signed JWT string
 * @returns {{ _id: string, name: string, email: string, avatar: string, token: string }}
 */
const buildAuthResponse = (user, token) => ({
  _id:    user._id,
  name:   user.name,
  email:  user.email,
  avatar: user.avatar,
  token,
});

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * @desc   Register a new user
 * @route  POST /api/auth/register
 * @access Public
 *
 * Expected body: { name, email, password }
 */
export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    // ── 1. Validate that required fields were provided ────────────────────────
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    // ── 2. Reject duplicate emails ────────────────────────────────────────────
    // findOne is faster than create() → catching the duplicate-key error,
    // because it avoids the bcrypt hashing step on a guaranteed failure.
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // ── 3. Create the user document ───────────────────────────────────────────
    // The pre('save') hook in User.js hashes the password automatically
    // before it is written to MongoDB.
    const user = await User.create({ name, email, password });

    // ── 4. Generate JWT ───────────────────────────────────────────────────────
    const token = generateToken(user._id);

    // ── 5. Return the new user + token (201 Created) ──────────────────────────
    return res.status(201).json(buildAuthResponse(user, token));
  } catch (error) {
    next(error);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * @desc   Authenticate an existing user and return a JWT
 * @route  POST /api/auth/login
 * @access Public
 *
 * Expected body: { email, password }
 */
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // ── 1. Validate that required fields were provided ────────────────────────
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // ── 2. Look up the user by email ──────────────────────────────────────────
    // `.select('+password')` overrides the `select: false` on the schema so
    // the hashed password is included for the bcrypt comparison below.
    // Without this, user.password would be undefined and matchPassword() fails.
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    // ── 3. Verify credentials ─────────────────────────────────────────────────
    // Single vague message for both "email not found" and "wrong password" —
    // prevents user-enumeration attacks.
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatches = await user.matchPassword(password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // ── 4. Generate JWT ───────────────────────────────────────────────────────
    const token = generateToken(user._id);

    // ── 5. Return the authenticated user + token (200 OK) ─────────────────────
    return res.status(200).json(buildAuthResponse(user, token));
  } catch (error) {
    next(error);
  }
};
