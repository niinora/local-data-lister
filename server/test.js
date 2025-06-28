const request = require('supertest');
const app = require('./index');

describe('Lambda API Endpoints', () => {
  test('GET /api/items requires authentication', async () => {
    const res = await request(app).get('/api/items');
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/items validates data', async () => {
    const res = await request(app).post('/api/items').send({ name: 'Test' });
    expect(res.statusCode).toBe(400);
  });

  test('Login succeeds with valid credentials', async () => {
    const res = await request(app).post('/login').send({ 
      username: 'admin', 
      password: 'pass' 
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});