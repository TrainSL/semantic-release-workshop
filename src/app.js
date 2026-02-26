'use strict';

const express = require('express');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// Basic security hardening
app.disable('x-powered-by');

// Body parsing with size limits to mitigate large payload attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// Simple in-memory rate limiter (per-IP) for demo purposes
const rateWindowMs = 15 * 60 * 1000; // 15 minutes
const maxRequestsPerWindow = 100;
const rateMap = new Map();
app.use((req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = rateMap.get(ip) || { count: 0, start: now };
    if (now - entry.start > rateWindowMs) {
      entry.count = 1;
      entry.start = now;
    } else {
      entry.count += 1;
    }
    rateMap.set(ip, entry);
    if (entry.count > maxRequestsPerWindow) {
      res.set('Retry-After', Math.ceil((entry.start + rateWindowMs - now) / 1000));
      return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }
  } catch (e) {
    // Fail open on rate limiter errors
  }
  next();
});

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
