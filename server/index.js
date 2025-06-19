const express = require('express');
const fs = require('fs');
const { connect } = require('./db');
const Joi = require('joi');
const cors = require('cors')
const app = express();

app.use(express.json());
app.use(cors());
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
      const data = JSON.parse(fs.readFileSync('data.json'));
      await collection.insertMany(data);
      console.log('Data imported successfully');
    }
  } catch (error) {
    console.error('Failed to import data:', error);
  }
}

app.get('/api/items', async (req, res) => {
  try {
    const db = await connect();
    const filter = req.query.type ? { type: req.query.type } : {};
    const items = await db.collection('items').find(filter).toArray();
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
    app.listen(5000, () => console.log('Server on port 5000'));
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();