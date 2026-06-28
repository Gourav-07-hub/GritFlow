/**
 * config/db.js — MongoDB connection via Mongoose
 *
 * Exports a single `connectDB` async function.
 * Call this once at startup; the process exits if the connection fails.
 */

import mongoose from 'mongoose';

/**
 * Connects to MongoDB using the URI stored in MONGO_URI env variable.
 *
 * - On success : logs  ✅ MongoDB Connected: <host>
 * - On failure : logs the error message and calls process.exit(1)
 *
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  // Guard: skip if already connected (useful in test environments)
  if (mongoose.connection.readyState === 1) {
    console.log('ℹ️  MongoDB already connected — skipping reconnect.');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These are the recommended options for Mongoose 7+
      serverSelectionTimeoutMS: 5000,  // Fail fast if MongoDB is unreachable
      socketTimeoutMS: 45000,          // Close sockets after 45s of inactivity
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Log when the connection drops unexpectedly after initial connect
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('♻️  MongoDB reconnected successfully.');
    });
  } catch (error) {
    // Log the full error message so the cause is clear
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit with failure code so the process supervisor can restart
  }
};

export default connectDB;
