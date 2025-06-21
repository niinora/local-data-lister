const express = require('express');
const awsServerlessExpress = require('aws-serverless-express');
const { connect } = require('./db');
const Joi = require('joi');
const cors = require('cors');

// Load data.json (must be in zip)
const data = require('./data.json');

const app = express();
app.use(express.json());
app.use(cors());

console.log('Express app initialized, listening for /api/items');

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
      await collection.insertMany(data);
      console.log('Data imported successfully');
    }
  } catch (error) {
    console.error('Failed to import data:', error);
  }
}

app.get('/api/items', async (req, res) => {
  console.log('Received GET request for /api/items, query:', req.query);
  try {
    await importData();
    const db = await connect();
    const filter = req.query.type ? { type: req.query.type } : {};
    const items = await db.collection('items').find(filter).toArray();
    console.log('Items fetched:', items);
    res.json(items);
  } catch (error) {
    console.error('Error in GET /api/items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.post('/api/items', async (req, res) => {
  console.log('Received POST request for /api/items, body:', req.body);
  try {
    const { error } = itemSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const db = await connect();
    await db.collection('items').insertOne(req.body);
    console.log('Item created:', req.body);
    res.status(201).json(req.body);
  } catch (error) {
    console.error('Error in POST /api/items:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

const server = awsServerlessExpress.createServer(app);
exports.handler = (event, context) => {
  console.log('Lambda handler invoked, event:', event);
  return awsServerlessExpress.proxy(server, event, context);
};