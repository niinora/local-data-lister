const express = require('express');
const awsServerlessExpress = require('aws-serverless-express');

// Test without DB first
const app = express();
app.use(express.json());

console.log('Lambda function starting...');

// Simple test route that doesn't use MongoDB
app.get('/', (req, res) => {
  console.log('Root route accessed');
  try {
    res.json({ 
      message: 'Lambda function is working!', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'not set',
      mongoUri: process.env.MONGODB_URI ? 'set' : 'not set'
    });
  } catch (error) {
    console.error('Error in root route:', error);
    res.status(500).json({ error: 'Root route error', details: error.message });
  }
});

// Test route without MongoDB connection
app.get('/test', (req, res) => {
  console.log('Test route accessed');
  res.json({ message: 'Test route working', query: req.query });
});

// MongoDB routes - wrapped in try-catch
app.get('/api/items', async (req, res) => {
  console.log('GET /api/items received');
  try {
    // Try to require the db module
    const { connect } = require('./db');
    console.log('DB module loaded successfully');
    
    const db = await connect();
    console.log('Connected to MongoDB successfully');
    
    const items = await db.collection('items').find({}).toArray();
    console.log('Items fetched:', items.length);
    
    res.json(items);
  } catch (error) {
    console.error('Error in GET /api/items:', error);
    res.status(500).json({ 
      error: 'Database error', 
      details: error.message,
      stack: error.stack 
    });
  }
});

app.post('/api/items', async (req, res) => {
  console.log('POST /api/items received');
  try {
    const { connect } = require('./db');
    const db = await connect();
    
    const result = await db.collection('items').insertOne(req.body);
    res.status(201).json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('Error in POST /api/items:', error);
    res.status(500).json({ 
      error: 'Database error', 
      details: error.message 
    });
  }
});

// Catch all other routes
app.use('*', (req, res) => {
  console.log('Unmatched route:', req.method, req.originalUrl);
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    url: req.originalUrl,
    availableRoutes: ['GET /', 'GET /test', 'GET /api/items', 'POST /api/items']
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({ 
    error: 'Server error', 
    details: error.message 
  });
});

let server;
try {
  server = awsServerlessExpress.createServer(app);
  console.log('Server created successfully');
} catch (error) {
  console.error('Error creating server:', error);
}

exports.handler = (event, context) => {
  console.log('=== Lambda Handler Invoked ===');
  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('Context:', JSON.stringify(context, null, 2));
  
  try {
    return awsServerlessExpress.proxy(server, event, context);
  } catch (error) {
    console.error('Error in handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Handler error', 
        details: error.message 
      })
    };
  }
};