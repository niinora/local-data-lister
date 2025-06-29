const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Local Data Lister...\n');

// First, add places to database
console.log('📍 Adding places to database...');
const addPlaces = spawn('node', ['server/add-new-places.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

addPlaces.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Database setup complete!');
    console.log('🌐 Starting web server...\n');
    
    // Then start the main server
    const server = spawn('node', ['server/index.js'], {
      cwd: __dirname,
      stdio: 'inherit'
    });
    
  } else {
    console.log(`\n❌ Database setup failed with code: ${code}`);
  }
});
