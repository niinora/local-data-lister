const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Local Data Lister (React + Node.js)...\n');

// First, add places to database
console.log('📍 Adding places to database...');
const addPlaces = spawn('node', ['server/add-new-places.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

addPlaces.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Database setup complete!');
    console.log('🌐 Starting backend server...\n');
    console.log('📱 To start the React frontend:');
    console.log('   npm run dev');
    console.log('🔧 Backend API will be available at: http://localhost:5000');
    console.log('📱 React app will be available at: http://localhost:5173');
    
    // Start the backend server
    const server = spawn('node', ['server/index.js'], {
      cwd: __dirname,
      stdio: 'inherit'
    });
    
  } else {
    console.log(`\n❌ Database setup failed with code: ${code}`);
  }
});
