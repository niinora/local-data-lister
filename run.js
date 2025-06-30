const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Local Data Lister (React + Node.js)...\n');

function runCommand(command, args, cwd = __dirname) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}

async function start() {
  try {
    console.log('📍 Step 1: Setting up database...');
    await runCommand('node', ['server/add-new-places.js']);
    
    console.log('\n✅ Database setup complete!');
    console.log('🌐 Step 2: Starting backend server...');
    console.log('📱 To start React frontend, run: npm run dev');
    console.log('🔧 Backend API: http://localhost:5000');
    console.log('📱 React App: http://localhost:5173');
    console.log('⏹️  Press Ctrl+C to stop the server\n');
    
    await runCommand('node', ['server/index.js']);
  } catch (error) {
    console.error('❌ Failed to start application:', error.message);
    process.exit(1);
  }
}

start();
