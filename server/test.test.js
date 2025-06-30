const request = require('supertest');
const app = require('./index');

describe('Lambda API Endpoints', () => {
  test('GET /api/items requires authentication', async () => {
    const res = await request(app).get('/api/items');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('Login succeeds with valid credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'admin', password: 'pass' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
  });

  test('Login fails with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'wrong', password: 'wrong' });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});