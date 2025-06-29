const express = require('express');
const fs = require('fs');
const { connect } = require('./db');
const { addNewPlaces } = require('./add-new-places');
const Joi = require('joi');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(express.json());
<<<<<<< HEAD
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  next();
=======
app.use(cors());

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
>>>>>>> 0ff4c1966f4b14dcb45b46a307c806f3c25f95e5
});

const itemSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  details: Joi.string().required()
});

// Simple authentication middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  // In a real app, verify the token here
  next();
};

async function importData() {
  try {
    const db = await connect();
    const collection = db.collection('items');
    
    const count = await collection.countDocuments();
    if (count === 0) {
      // Try to import from data.json if it exists
      try {
        const data = JSON.parse(fs.readFileSync('data.json'));
        await collection.insertMany(data);
        console.log('Data imported from data.json');
      } catch (error) {
        console.log('No data.json found, skipping initial import');
      }
    }
    
    // Add new places
    console.log('📍 Adding new places...');
    const result = await addNewPlaces();
    if (result.success) {
      console.log(`✅ Places setup complete! Added ${result.added} new places.`);
    }
  } catch (error) {
    console.error('Failed to import data:', error);
  }
}

// Add authentication to GET /api/items
app.get('/api/items', authenticate, async (req, res) => {
  try {
    const db = await connect();
    const filter = req.query.type ? { type: req.query.type } : {};
    
    // Sorting logic
    const sortBy = req.query.sortBy || 'name'; // default sort by name
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1; // default ascending
    
    // Validate sort field
    const validSortFields = ['name', 'type', 'details', '_id'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    
    const sortOptions = { [sortField]: sortOrder };
    
    const items = await db.collection('items').find(filter).sort(sortOptions).toArray();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Update POST /api/items to require authentication and better validation
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

// Add login endpoint for tests
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple test credentials - replace with real authentication
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
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`🌍 Visit http://localhost:${PORT} to view the application`);
      console.log('⏹️  Press Ctrl+C to stop the server');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

// Only start server if this file is run directly (not during tests)
if (require.main === module) {
  startServer();
}

// Export the app for testing
module.exports = app;