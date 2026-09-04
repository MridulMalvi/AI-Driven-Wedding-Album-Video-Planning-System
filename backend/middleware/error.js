export const notFound = (req, _res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

const isDev = process.env.NODE_ENV !== 'production';

export const errorHandler = (err, req, res, _next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'An unexpected server error occurred.';

  // Mongoose-specific error normalisation
  if (err.name === 'CastError') { status = 404; message = 'The requested resource was not found.'; }
  if (err.code === 11000) { status = 409; message = 'A record with that value already exists.'; }
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map((e) => e.message).join(' '); }
  if (err.name === 'JsonWebTokenError') { status = 401; message = 'Your session is invalid. Please log in again.'; }
  if (err.name === 'TokenExpiredError') { status = 401; message = 'Your session has expired. Please log in again.'; }

  // Structured log — always emit in dev; in prod emit only for 5xx
  if (isDev || status >= 500) {
    const logEntry = {
      ts: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status,
      message,
      ...(isDev && { stack: err.stack }),
    };
    // Intentionally use stderr so it can be piped separately in prod
    process.stderr.write(JSON.stringify(logEntry) + '\n');
  }

  // Never leak internals / stack in production responses
  res.status(status).json({ message });
};
