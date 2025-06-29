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

# Function to open browser
open_browser() {
    sleep 3
    echo "🌐 Opening Chrome browser..."
    
    if command -v google-chrome &> /dev/null; then
        google-chrome "http://localhost:5000" &
    elif command -v chrome &> /dev/null; then
        chrome "http://localhost:5000" &
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        start chrome "http://localhost:5000"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        open -a "Google Chrome" "http://localhost:5000"
    else
        echo "🌍 Please open your browser and visit: http://localhost:5000"
    fi
}

# Start browser opening in background
open_browser &

# Start the integrated server
echo "🌐 Starting integrated server..."
echo "🔧 Running: node server/index.js"
echo "🚀 Chrome will open automatically in 3 seconds..."
echo ""
node server/index.js