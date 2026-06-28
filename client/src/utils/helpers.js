/**
 * helpers.js — Frontend utility functions
 * Pure helper functions with no side effects.
 */

/**
 * Formats a Date object or ISO string into a readable string.
 * @param {Date|string} date
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export const formatDate = (date, options = { dateStyle: 'medium' }) =>
  new Intl.DateTimeFormat('en-US', options).format(new Date(date));

/**
 * Capitalises the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

/**
 * Clamps a number between a min and max value.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max);

/**
 * Generates a simple unique ID (not cryptographically secure).
 * Useful for temporary list keys.
 * @returns {string}
 */
export const uid = () => Math.random().toString(36).slice(2, 9);
