/**
 * routes/authRoutes.js — Authentication route definitions
 *
 * Maps HTTP verbs + paths to their controller functions.
 * All routes here are PUBLIC (no protect middleware needed —
 * they are the entry points that ISSUE tokens).
 *
 * Mounted in server.js as: app.use('/api/auth', authRoutes)
 *
 * Resulting endpoints:
 *   POST /api/auth/register  ← Create account, return JWT
 *   POST /api/auth/login     ← Verify credentials, return JWT
 */

import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../middleware/validateMiddleware.js';

const router = Router();

/**
 * @route  POST /api/auth/register
 * @desc   Register a new user and return a JWT
 * @access Public
 */
router.post('/register', validateRegister, registerUser);

/**
 * @route  POST /api/auth/login
 * @desc   Authenticate an existing user and return a JWT
 * @access Public
 */
router.post('/login', validateLogin, loginUser);

export default router;
