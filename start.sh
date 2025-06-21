#!/bin/sh
# filepath: C:\Users\kiustudent\Desktop\soft-final\local-data-lister\start.sh

# Start the backend server
cd /app/server && node index.js &

# Store the server process ID
SERVER_PID=$!

# Start the frontend dev server with host set to 0.0.0.0 
cd /app/client && npm run dev -- --host 0.0.0.0

kill $SERVER_PID