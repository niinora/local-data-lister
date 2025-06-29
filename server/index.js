const express = require('express');
const fs = require('fs');
const { connect } = require('./db');
const { addNewPlaces } = require('./add-new-places');
const Joi = require('joi');
const cors = require('cors');
const multer = require('multer'); // Added for file uploads
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

// Middleware for JSON and FormData
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory as Buffer
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

const itemSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  details: Joi.string().required(),
  photo: Joi.string().optional() // Added photo as optional string (base64)
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
    const validSortFields = ['name', 'type', 'details', '_id', 'createdAt']; // Added createdAt
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const sortOptions = { [sortField]: sortOrder };
    const items = await db.collection('items').find(filter).sort(sortOptions).toArray();
    res.json(items);
  } catch (error) {
    console.error('Failed to fetch items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.post('/api/items', authenticate, upload.single('photo'), async (req, res) => {
  try {
    const { name, type, details } = req.body;

    if (!name || !type || !details) {
      return res.status(400).json({
        success: false,
        message: 'Name, type, and details are required'
      });
    }

    const { error } = itemSchema.validate({
      name,
      type,
      details,
      photo: req.file ? req.file.buffer.toString('base64') : undefined
    });
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
      createdAt: new Date().toISOString(),
      photo: req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : undefined
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
    console.log('DELETE request received for ID:', req.params.id);
    const db = await connect();
    const collection = db.collection('items');
    const { id } = req.params;
    
    // Try to find the item with both string _id and ObjectId formats
    let existingItem = await collection.findOne({ _id: id });
    
    // If not found with string ID, try with ObjectId (for MongoDB generated IDs)
    if (!existingItem) {
      try {
        const { ObjectId } = require('mongodb');
        if (ObjectId.isValid(id)) {
          existingItem = await collection.findOne({ _id: new ObjectId(id) });
        }
      } catch (objectIdError) {
        console.log('ObjectId conversion failed:', objectIdError.message);
      }
    }
    
    console.log('Found existing item:', existingItem);
    
    if (!existingItem) {
      console.log('Item not found in database');
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    // Delete using the same ID format that was found
    const deleteQuery = { _id: existingItem._id };
    const result = await collection.deleteOne(deleteQuery);
    console.log('Delete result:', result);
    
    if (result.deletedCount === 1) {
      console.log('Item successfully deleted');
      res.json({ success: true, message: 'Item deleted successfully' });
    } else {
      console.log('No items were deleted');
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