#!/bin/bash

echo "🧹 Removing vanilla JavaScript files..."

# Remove vanilla HTML, CSS, and JS files from root
rm -f index.html
rm -f styles.css  
rm -f script.js.old

# Remove debug and other vanilla-related files
rm -f debug.js

# Remove other vanilla-related files
rm -f run-setup.js

echo "✅ Vanilla files removed!"
echo "📱 Your React app files are preserved in:"
echo "   - src/ (React components)"
echo "   - client/ (if you have a separate client folder)"
echo "   - server/ (backend files)"
echo ""
echo "🚀 To start your React app:"
echo "   npm run dev"
