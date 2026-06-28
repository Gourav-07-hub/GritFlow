/**
 * middleware/validateMiddleware.js — Reusable input validators for server routes
 */

/**
 * Register validation middleware
 */
export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2 || name.trim().length > 50) {
    errors.push('name: Name must be between 2 and 50 characters');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('email: Must be a valid email address');
  }

  if (!password || password.length < 6) {
    errors.push('password: Password must be at least 6 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  return next();
};

/**
 * Login validation middleware
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('email: Must be a valid email address');
  }

  if (!password) {
    errors.push('password: Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  return next();
};

/**
 * Habit validation middleware
 */
export const validateHabit = (req, res, next) => {
  const { name, frequency } = req.body;
  const errors = [];

  if (!name || name.trim().length < 1 || name.trim().length > 100) {
    errors.push('name: Habit name must be between 1 and 100 characters');
  }

  if (frequency !== undefined && !['daily', 'weekly'].includes(frequency)) {
    errors.push('frequency: Frequency must be daily or weekly');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  return next();
};

/**
 * Goal validation middleware
 */
/**
 * Habit update validation (optional fields — only validates if present)
 */
export const validateHabitUpdate = (req, res, next) => {
  const { name, frequency } = req.body;
  const errors = [];

  if (name !== undefined && (name.trim().length < 1 || name.trim().length > 100)) {
    errors.push('name: Habit name must be between 1 and 100 characters');
  }

  if (frequency !== undefined && !['daily', 'weekly'].includes(frequency)) {
    errors.push('frequency: Frequency must be daily or weekly');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  return next();
};

export const validateGoal = (req, res, next) => {
  const { title, deadline } = req.body;
  const errors = [];

  if (!title || title.trim().length < 1 || title.trim().length > 150) {
    errors.push('title: Goal title must be between 1 and 150 characters');
  }

  if (!deadline) {
    errors.push('deadline: Deadline is required');
  } else {
    const parsedDate = Date.parse(deadline);
    if (isNaN(parsedDate)) {
      errors.push('deadline: Deadline must be a valid date');
    } else {
      const dead = new Date(parsedDate);
      const now = new Date();
      // Reset clock to 23:59:59 of deadline day to allow same-day goals
      dead.setHours(23, 59, 59, 999);
      if (dead < now) {
        errors.push('deadline: Deadline must be a valid future date');
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  return next();
};

/**
 * Goal update validation (optional fields — only validates if present)
 */
export const validateGoalUpdate = (req, res, next) => {
  const { title, deadline } = req.body;
  const errors = [];

  if (title !== undefined && (title.trim().length < 1 || title.trim().length > 150)) {
    errors.push('title: Goal title must be between 1 and 150 characters');
  }

  if (deadline !== undefined) {
    const parsedDate = Date.parse(deadline);
    if (isNaN(parsedDate)) {
      errors.push('deadline: Deadline must be a valid date');
    } else {
      const dead = new Date(parsedDate);
      const now = new Date();
      dead.setHours(23, 59, 59, 999);
      if (dead < now) {
        errors.push('deadline: Deadline must be a valid future date');
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  return next();
};

/**
 * Reflection validation middleware
 */
export const validateReflection = (req, res, next) => {
  const { mood, date } = req.body;
  const errors = [];

  if (mood === undefined || typeof mood !== 'number' || mood < 1 || mood > 5) {
    errors.push('mood: Mood score must be a number between 1 and 5');
  }

  if (date !== undefined && isNaN(Date.parse(date))) {
    errors.push('date: Date must be in a valid format');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  return next();
};

/**
 * Gratitude validation middleware
 */
export const validateGratitude = (req, res, next) => {
  const { entries, date } = req.body;
  const errors = [];

  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    errors.push('entries: At least one gratitude item is required');
  }

  if (date !== undefined && isNaN(Date.parse(date))) {
    errors.push('date: Date must be in a valid format');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  return next();
};
