const express = require('express');
const fs = require('fs');
const { connect } = require('./db');
const { addNewPlaces } = require('./add-new-places');
const Joi = require('joi');
const cors = require('cors');
const app = express();

require('dotenv').config();

const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

const itemSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  details: Joi.string().required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required()
});

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  // Simple token validation (in production, use a JWT library)
  if (authHeader.split(' ')[1] !== 'test-jwt-token-12345') {
    return res.status(401).json({ error: 'Invalid token' });
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
        const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
        await collection.insertMany(data.map(item => ({
          ...item,
          _id: item._id || Date.now().toString(),
          createdAt: item.createdAt || new Date().toISOString(),
        })));
        console.log('Data imported from data.json');
      } catch (error) {
        console.log('No data.json found or invalid format, skipping initial import');
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
    console.error('Failed to fetch items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.post('/api/items', authenticate, async (req, res) => {
  try {
    const { name, type, details } = req.body;

    if (!name || !type || !details) {
      return res.status(400).json({
        success: false,
        message: 'Name, type, and details are required'
      });
    }

    const { error } = itemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const db = await connect();
    const newItem = {
      _id: Date.now().toString(),
      name,
      type,
      details,
      createdAt: new Date().toISOString()
    };

    const result = await db.collection('items').insertOne(newItem);
    console.log('Item inserted:', result.insertedId);

    res.status(201).json({
      success: true,
      data: newItem,
      message: 'Item created successfully'
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.delete('/api/items/:id', authenticate, async (req, res) => {
  try {
    const db = await connect();
    const collection = db.collection('items');
    const { id } = req.params;
    console.log('Attempting to delete item with _id:', id);
    const result = await collection.deleteOne({ _id: id });
    console.log('Delete result:', result);
    if (result.deletedCount === 1) {
      res.json({ success: true, message: 'Item deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Item not found' });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email } = req.body;
    const { error } = loginSchema.validate({ email });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    // In production, verify email against a user database
    // For simplicity, accept any valid email format
    res.status(200).json({
      token: 'test-jwt-token-12345',
      user: { email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
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