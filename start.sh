#!/bin/bash

echo "🚀 Starting Local Data Lister..."
echo "📁 Current directory: $(pwd)"

# Navigate to project directory
cd "$(dirname "$0")"
echo "📁 Project directory: $(pwd)"

# Check if server file exists
if [ ! -f "server/index.js" ]; then
    echo "❌ Error: server/index.js not found!"
    echo "Make sure you're running this from the project root directory"
    exit 1
fi

# Start the integrated server (React app will be served separately via Vite)
echo "🌐 Starting backend server..."
echo "🔧 Running: node server/index.js"
echo "📱 React app: Run 'npm run dev' in a separate terminal"
echo "🌍 Backend API: http://localhost:5000"
echo "⏹️  Press Ctrl+C to stop the server"
echo ""
node server/index.js