/**
 * models/User.js — Mongoose User schema & model
 *
 * Responsibilities:
 *  - Define the shape and validation rules for a User document
 *  - Automatically hash the password before every save (pre-save hook)
 *  - Expose a matchPassword() instance method for login verification
 *
 * ⚠️  Plaintext passwords are NEVER stored in the database.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ─── Schema Definition ────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    /** Full display name of the user */
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    /** Unique email address — used as the login identifier */
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,          // Creates a unique index in MongoDB
      lowercase: true,       // Normalise before storing (e.g. "User@Mail.com" → "user@mail.com")
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,
        'Please enter a valid email address',
      ],
    },

    /**
     * Hashed password — the raw value is replaced by the bcrypt hash
     * inside the pre('save') middleware below, so plaintext is never
     * written to the database.
     */
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Exclude from query results by default for security
    },

    username: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [20, 'Username must be at most 20 characters'],
      match: [
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores',
      ],
    },

    /** Optional profile picture URL */
    avatar: {
      type: String,
      default: '',
    },

    /** Account creation timestamp */
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Adds updatedAt alongside createdAt automatically
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
  }
);

// ─── Pre-Validate Middleware ────────────────────────────────────────────────────

/**
 * Auto-generate username from name on register if not provided.
 * Replaces spaces with underscores, lowercase, and appends a random 4-digit number.
 */
userSchema.pre('validate', function() {
  if (!this.username && this.name) {
    let base = this.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    if (!base) {
      base = 'user';
    }
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.username = `${base}_${rand}`;
  }
});

// ─── Pre-Save Middleware ───────────────────────────────────────────────────────

/**
 * Hash the password before saving the document.
 *
 * The check `isModified('password')` means:
 *  - Hashing runs on first save (new user)
 *  - Hashing runs again when the user changes their password
 *  - Hashing is SKIPPED for updates to other fields (e.g. name, avatar)
 *    so we don't re-hash an already-hashed value.
 */
userSchema.pre('save', async function hashPassword() {
  // `this` refers to the document being saved
  if (!this.isModified('password')) {
    return; // Nothing to do — skip hashing
  }

  // Generate a salt and hash the password with 10 rounds.
  // 10 rounds is the recommended balance of security vs. performance.
  // In Mongoose 7+/8 async pre-hooks, simply returning the Promise is
  // sufficient — calling next() is not supported in async middleware.
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // Any thrown error propagates automatically via the rejected Promise
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

/**
 * Compare a plaintext candidate password against the stored bcrypt hash.
 *
 * Usage inside a controller (after querying with .select('+password')):
 *   const isMatch = await user.matchPassword(req.body.password);
 *
 * @param {string} enteredPassword — The plaintext password from the login form
 * @returns {Promise<boolean>} — true if the password matches, false otherwise
 */
userSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  // bcrypt.compare handles the timing-safe comparison internally
  return bcrypt.compare(enteredPassword, this.password);
};

// ─── Model Export ─────────────────────────────────────────────────────────────

/**
 * Mongoose compiles the schema into a Model.
 * The first argument ('User') becomes the MongoDB collection name ('users').
 * Guard against OverwriteModelError in hot-reload environments.
 */
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
