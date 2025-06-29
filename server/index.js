const express = require('express');
const fs = require('fs');
const { connect } = require('./db');
const { addNewPlaces } = require('./add-new-places');
const Joi = require('joi');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(express.json());
app.use(cors());

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

const itemSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  details: Joi.string().required()
});

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

app.get('/api/items', async (req, res) => {
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

app.post('/api/items', async (req, res) => {
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

startServer();