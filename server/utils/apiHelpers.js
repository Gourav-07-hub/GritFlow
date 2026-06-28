/**
 * apiHelpers.js — Backend utility functions
 * Shared helper utilities for controller logic.
 */

/**
 * Sends a standardized success response.
 * @param {import('express').Response} res
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Human-readable message
 * @param {*} data - Response payload
 */
export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  res.status(statusCode).json({ success: true, message, data });
};

/**
 * Sends a standardized error response.
 * @param {import('express').Response} res
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 */
export const sendError = (res, statusCode = 500, message = 'Server Error') => {
  res.status(statusCode).json({ success: false, message });
};
