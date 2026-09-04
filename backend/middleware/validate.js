/**
 * Lightweight body validator / sanitiser.
 * Validates required fields and strips any keys not in the allowed list
 * to prevent mass-assignment attacks.
 */

/**
 * Build an Express middleware that:
 *  1. Checks that every key in `required` is present and non-empty.
 *  2. Removes every key in req.body that is NOT in `allowed`.
 *
 * @param {string[]} allowed - Permitted body keys (others are stripped).
 * @param {string[]} required - Subset of `allowed` that must be present.
 */
export const validateBody = (allowed = [], required = []) => (req, res, next) => {
  // Strip unknown keys (mass-assignment protection)
  const clean = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      clean[key] = req.body[key];
    }
  }
  req.body = clean;

  // Check required fields
  const missing = required.filter((k) => {
    const val = req.body[k];
    return val === undefined || val === null || (typeof val === 'string' && val.trim() === '');
  });

  if (missing.length) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}.` });
  }

  next();
};

/** Pre-built validators for common routes */
export const validators = {
  register: validateBody(
    ['name', 'email', 'password', 'role'],
    ['name', 'email', 'password'],
  ),

  login: validateBody(
    ['email', 'password'],
    ['email', 'password'],
  ),

  wedding: validateBody(
    ['brideName', 'groomName', 'weddingDate', 'venue', 'city', 'guestCount',
      'budget', 'weddingStyle', 'colorTheme', 'description', 'functions'],
    ['brideName', 'groomName', 'weddingDate', 'venue', 'city'],
  ),

  weddingUpdate: validateBody(
    ['brideName', 'groomName', 'weddingDate', 'venue', 'city', 'guestCount',
      'budget', 'weddingStyle', 'colorTheme', 'description'],
    [],
  ),

  fn: validateBody(
    ['name', 'date', 'startTime', 'endTime', 'venue', 'duration',
      'importance', 'description', 'specialMoments', 'dressCode'],
    ['name', 'date'],
  ),
};
