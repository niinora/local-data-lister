const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const dbName = "localDataLister";

async function connect() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db(dbName);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

module.exports = { connect };