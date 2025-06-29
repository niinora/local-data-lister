const express = require('express');
const fs = require('fs');
const { connect } = require('./db');
const { addNewPlaces } = require('./add-new-places');
const Joi = require('joi');
const cors = require('cors');
const app = express();

require('dotenv').config();

const PORT = process.env.PORT || 5000;

// CORS configuration for Render
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

const itemSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  details: Joi.string().required()
});

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

async function importData() {
  try {
    const db = await connect();
    const collection = db.collection('items');
    const count = await collection.countDocuments();
    if (count === 0) {
      try {
        const data = JSON.parse(fs.readFileSync('data.json'));
        await collection.insertMany(data);
        console.log('Data imported from data.json');
      } catch (error) {
        console.log('No data.json found, skipping initial import');
      }
    }
    console.log('📍 Adding new places...');
    const result = await addNewPlaces();
    if (result.success) {
      console.log(`✅ Places setup complete! Added ${result.added} new places.`);
    }
  } catch (error) {
    console.error('Failed to import data:', error);
  }
}

app.get('/api/items', authenticate, async (req, res) => {
  try {
    const db = await connect();
    const filter = req.query.type ? { type: req.query.type } : {};
    const sortBy = req.query.sortBy || 'name';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const validSortFields = ['name', 'type', 'details', '_id'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const sortOptions = { [sortField]: sortOrder };
    const items = await db.collection('items').find(filter).sort(sortOptions).toArray();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.post('/api/items', authenticate, async (req, res) => {
  try {
    const { error } = itemSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const db = await connect();
    await db.collection('items').insertOne(req.body);
    res.status(201).json(req.body);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create item' });
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'pass') {
    res.status(200).json({ 
      token: 'test-jwt-token-12345',
      user: { username: 'admin' }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

async function startServer() {
  try {
    await importData(); 
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`🌍 Visit http://localhost:${PORT} to view the application`);
      console.log('⏹️  Press Ctrl+C to stop the server');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;