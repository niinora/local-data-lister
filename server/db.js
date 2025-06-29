const { MongoClient } = require('mongodb');

let db;

async function connect() {
  if (db) return db;

  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();
    db = client.db('localDataLister');
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

module.exports = { connect };