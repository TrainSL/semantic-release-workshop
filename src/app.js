'use strict';

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// Basic security hardening
app.disable('x-powered-by');

// Body parsing with size limits to mitigate large payload attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// Use helmet for standard security headers
app.use(helmet());

// Production-ready rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);


// Security-related headers (minimal CSP and privacy headers)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

// Simple input sanitizer: trims strings, removes null bytes and script tags
function sanitize(value) {
  if (typeof value === 'string') {
    return value.trim().split('\0').join('').replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  }
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object') {
    Object.keys(value).forEach((k) => {
      value[k] = sanitize(value[k]);
    });
    return value;
  }
  return value;
}

app.use((req, res, next) => {
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Log the error server-side for diagnostics
  // eslint-disable-next-line no-console
  console.error(err && err.stack ? err.stack : err);

  const isDev = req.app.get('env') === 'development';
  const safeMessage = isDev ? (err && err.message) || 'Internal Server Error' : 'Internal Server Error';
  res.status(err && err.status ? err.status : 500).json({ error: safeMessage });
});

module.exports = app;
