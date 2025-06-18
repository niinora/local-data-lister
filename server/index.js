const express = require('express');
const fs = require('fs');
const { connect } = require('./db');
const app = express();

app.use(express.json());


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


async function startServer() {
  try {
    await importData(); 
    app.listen(5000, () => console.log('Server on port 5000'));
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();