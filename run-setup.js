const { spawn } = require('child_process');
const path = require('path');

async function runSetup() {
  console.log('Setting up Local Data Lister...\n');
  
  try {
    console.log('Step 1: Adding new places to database...');
    
    const addPlaces = spawn('node', ['server/add-new-places.js'], {
      cwd: __dirname,
      stdio: 'inherit'
    });
    
    addPlaces.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Places added successfully!');
        console.log('\nStep 2: Starting server...');
        
        const server = spawn('node', ['server/index.js'], {
          cwd: __dirname,
          stdio: 'inherit'
        });
        
        server.on('close', (serverCode) => {
          console.log(`Server exited with code ${serverCode}`);
        });
        
      } else {
        console.log(`\n❌ Failed to add places. Exit code: ${code}`);
      }
    });
    
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

runSetup();
