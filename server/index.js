const express = require('express');
const fs = require('fs');
const { connect } = require('./db'); // Import the connect function from db.js
const Joi = require('joi');
const cors = require('cors');
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

// GET /api/items endpoint
app.get('/api/items', async (req, res) => {
  try {
    const db = await connect();
    const filter = req.query.type ? { type: req.query.type } : {};
    const items = await db.collection('items').find(filter).toArray();
    if (!items || items.length === 0) {
      return res.status(404).json({ message: 'No items found' });
    }
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// POST /api/items endpoint
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

// Lambda handler
exports.handler = async (event) => {
  const callback = (status, body) => ({ statusCode: status, body: JSON.stringify(body) });
  await importData(); // Run import on first invocation
  const response = await new Promise((resolve) => {
    app(event.httpMethod, event.path, event, (status, body) => resolve({ status, body }));
  });
  return callback(response.status || 200, response.body || {});
};

// Local server startup (commented out for Lambda, uncomment for local testing)
// async function startServer() {
//   try {
//     await importData();
//     app.listen(5000, () => console.log('Server on port 5000'));
//   } catch (error) {
//     console.error('Failed to start server:', error);
//   }
// }
// startServer();