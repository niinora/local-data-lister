const request = require('supertest');
const app = require('./index');

describe('Lambda API Endpoints', () => {
  test('GET /api/items requires authentication', async () => {
    const res = await request(app).get('/api/items');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /api/items validates data', async () => {
    // First get a token
    const loginRes = await request(app)
      .post('/login')
      .send({ username: 'admin', password: 'pass' });
    
    const token = loginRes.body.token;
    
    // Test with incomplete data (missing required fields)
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test' }); // Missing 'type' and 'details'
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('Login succeeds with valid credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'admin', password: 'pass' });
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
  });

  test('Login fails with invalid credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'wrong', password: 'wrong' });
    
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /api/items succeeds with valid data and auth', async () => {
    // Get token
    const loginRes = await request(app)
      .post('/login')
      .send({ username: 'admin', password: 'pass' });
    
    const token = loginRes.body.token;
    
    // Test with valid data
    const validItem = {
      name: 'Test Item',
      type: 'electronics',
      details: 'A test electronic item'
    };
    
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${token}`)
      .send(validItem);
    
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Test Item');
  });
});