/**
 * utils/validators.js — Reusable client-side form validation helper functions
 */

export const isValidEmail = (email) => {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidPassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};

export const isValidName = (name) => {
  if (typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 50;
};

export const isValidURL = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidDate = (date) => {
  if (!date) return false;
  const timestamp = Date.parse(date);
  return !isNaN(timestamp);
};

export const isFutureDate = (date) => {
  if (!isValidDate(date)) return false;
  const target = new Date(date);
  const now = new Date();
  target.setHours(23, 59, 59, 999);
  return target >= now;
};

export const isNotEmpty = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

export const hasMinLength = (value, min) => {
  if (typeof value !== 'string') return false;
  return value.length >= min;
};

export const hasMaxLength = (value, max) => {
  if (typeof value !== 'string') return false;
  return value.length <= max;
};
