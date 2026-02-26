'use strict';

const express = require('express');

const router = express.Router();

// In-memory data store for demonstration purposes
let users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'user' },
];
let nextId = 4;

/**
 * GET /users
 * Returns all users
 */
router.get('/', (req, res) => {
  res.json({ data: users, meta: { total: users.length } });
});

/**
 * GET /users/:id
 * Returns a single user by ID
 */
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ error: `User with id ${id} not found` });
  }

  res.json(user);
});

/**
 * POST /users
 * Creates a new user
 */
router.post('/', (req, res) => {
  const { name, email, role = 'user' } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const nameTrimmed = String(name).trim();
  const emailNormalized = String(email).trim().toLowerCase();

  const existingUser = users.find((u) => u.email.toLowerCase() === emailNormalized);
  if (existingUser) {
    return res.status(409).json({ error: 'A user with this email already exists' });
  }

  const newUser = { id: nextId++, name: nameTrimmed, email: emailNormalized, role };
  users.push(newUser);

  res.status(201).json(newUser);
});

/**
 * PUT /users/:id
 * Updates an existing user
 */
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `User with id ${id} not found` });
  }

  const { name, email, role } = req.body;

  if (email) {
    const emailNormalized = String(email).trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === emailNormalized && u.id !== id);
    if (existing) {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }
    users[index].email = emailNormalized;
  }

  if (name) {
    users[index].name = String(name).trim();
  }

  if (role) {
    users[index].role = role;
  }

  res.json(users[index]);
});

/**
 * DELETE /users/:id
 * Deletes a user by ID
 */
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `User with id ${id} not found` });
  }

  const deleted = users.splice(index, 1)[0];
  res.json({ message: `User ${deleted.name} deleted successfully`, user: deleted });
});

// Export reset function for testing
if (process.env.NODE_ENV === 'test') {
  router._resetUsers = () => {
    users = [
      { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
      { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user' },
      { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'user' },
    ];
    nextId = 4;
  };
}

module.exports = router;
