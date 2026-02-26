'use strict';

const request = require('supertest');
const app = require('../src/app');
const usersRouter = require('../src/routes/users');

beforeEach(() => {
  usersRouter._resetUsers();
});

describe('GET /', () => {
  it('should return API information', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'semantic-release-workshop-test');
    expect(res.body).toHaveProperty('endpoints');
  });
});

describe('GET /health', () => {
  it('should return health status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});

describe('GET /users', () => {
  it('should return all users', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toHaveProperty('total', 3);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('GET /users/:id', () => {
  it('should return a user by ID', async () => {
    const res = await request(app).get('/users/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('name', 'Alice Johnson');
  });

  it('should return 404 for non-existent user', async () => {
    const res = await request(app).get('/users/999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /users', () => {
  it('should create a new user', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Dave Brown', email: 'dave@example.com' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', 'Dave Brown');
    expect(res.body).toHaveProperty('email', 'dave@example.com');
    expect(res.body).toHaveProperty('role', 'user');
  });

  it('should return 400 when name or email is missing', async () => {
    const res = await request(app).post('/users').send({ name: 'No Email' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 409 for duplicate email', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Duplicate', email: 'alice@example.com' });
    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('error');
  });
});

describe('PUT /users/:id', () => {
  it('should update an existing user', async () => {
    const res = await request(app)
      .put('/users/1')
      .send({ name: 'Alice Updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Alice Updated');
  });

  it('should return 404 for non-existent user', async () => {
    const res = await request(app).put('/users/999').send({ name: 'Nobody' });
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

describe('DELETE /users/:id', () => {
  it('should delete an existing user', async () => {
    const res = await request(app).delete('/users/2');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.user).toHaveProperty('id', 2);
  });

  it('should return 404 for non-existent user', async () => {
    const res = await request(app).delete('/users/999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

describe('404 handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Not Found');
  });
});
